import React, { useState, useCallback, useEffect } from 'react';
import { AppState, DashboardSchema, CsvData, QaItem, QaAnswer, ColumnSummary, CsvGlobalStats, SavedDashboardState, ColumnType } from './types';
import UploadScreen from './components/UploadScreen';
import LoadingScreen from './components/LoadingScreen';
import HealthCheckScreen from './components/HealthCheckScreen';
import DashboardScreen from './components/DashboardScreen';
import { parseAndAnalyzeCsv } from './services/csvParser';
import { getApolloAnalysis, getAIDashboardWidgets, queryDataWithAI, getQuestionSuggestions } from './services/geminiService';
import { useUsageTracker, USAGE_COSTS } from './hooks/useUsageTracker';
import { Upload, XCircle } from 'lucide-react';

const loadingMessages = [
  "Consulting with Apollo...",
  "Running statistical models...",
  "Generating data visualizations...",
  "Compiling the final report...",
  "Polishing the dashboard...",
];

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [dashboardSchema, setDashboardSchema] = useState<DashboardSchema | null>(null);
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvSummary, setCsvSummary] = useState<ColumnSummary[] | null>(null);
  const [csvGlobalStats, setCsvGlobalStats] = useState<CsvGlobalStats | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("Initializing...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [qaHistory, setQaHistory] = useState<QaItem[]>([]);
  const [questionSuggestions, setQuestionSuggestions] = useState<string[]>([]);
  const usageTracker = useUsageTracker();

  useEffect(() => {
    let messageInterval: number;
    if (appState === AppState.LOADING) {
      setLoadingMessage(loadingMessages[0]);
      let i = 1;
      messageInterval = window.setInterval(() => {
        setLoadingMessage(loadingMessages[i % loadingMessages.length]);
        i++;
      }, 2500);
    }
    return () => {
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, [appState]);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setErrorMessage(null);
      setAppState(AppState.LOADING);
      setLoadingMessage("Parsing & analyzing CSV file...");
      
      const { data, summary, stats } = await parseAndAnalyzeCsv(file);
      setCsvData(data);
      setCsvSummary(summary);
      setCsvGlobalStats(stats);
      setCsvFile(file);
      setAppState(AppState.HEALTH_CHECK);
    } catch (error) {
      console.error("Error during file processing:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`Failed to process file. ${message}`);
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleProceedToDashboard = useCallback(async (summaryToUse: ColumnSummary[]) => {
    if (!summaryToUse || !csvFile || !csvData) {
      setErrorMessage("Data summary is missing. Please start over.");
      setAppState(AppState.ERROR);
      return;
    }
     if (!usageTracker.canPerformAction(USAGE_COSTS.DASHBOARD_GENERATION)) {
        setErrorMessage(`You have reached your monthly limit for generating new dashboards. Your limit will reset on ${usageTracker.getNextResetDate()}.`);
        setAppState(AppState.ERROR);
        return;
    }
    try {
      setAppState(AppState.LOADING);
      setLoadingMessage("Finalizing data preparations...");

      // Update summary state and apply type changes to the data
      setCsvSummary(summaryToUse);
      const typedData = csvData.map(row => {
          const newRow = {...row};
          summaryToUse.forEach(colSummary => {
              if (colSummary.inferredType === ColumnType.NUMERIC && newRow[colSummary.columnName] != null && newRow[colSummary.columnName] !== '') {
                  const numVal = Number(newRow[colSummary.columnName]);
                  if (!isNaN(numVal)) {
                      newRow[colSummary.columnName] = numVal;
                  }
              }
          });
          return newRow;
      });
      setCsvData(typedData);


      setLoadingMessage("Generating AI analysis...");
      const apolloAnalysisPromise = getApolloAnalysis(summaryToUse, csvFile.name);
      const widgetsPromise = getAIDashboardWidgets(summaryToUse, csvFile.name);
      const suggestionsPromise = getQuestionSuggestions(summaryToUse);

      const [apolloAnalysis, widgetsSchema, suggestions] = await Promise.all([apolloAnalysisPromise, widgetsPromise, suggestionsPromise]);
      
      const schema: DashboardSchema = {
        header: {
          ai_narrative: { type: 'ai_narrative', content: apolloAnalysis },
          kpis: widgetsSchema.header.kpis,
        },
        body: widgetsSchema.body,
      };

      usageTracker.deductCredits(USAGE_COSTS.DASHBOARD_GENERATION);
      setLoadingMessage("Building dashboard...");
      setDashboardSchema(schema);
      setQuestionSuggestions(suggestions);
      setAppState(AppState.DASHBOARD);
    } catch (error) {
      console.error("Error during dashboard generation:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`Failed to generate dashboard. ${message}`);
      setAppState(AppState.ERROR);
    }
  }, [csvData, csvFile, usageTracker]);

  const handleQaSubmit = useCallback(async (question: string) => {
    if (!csvData || !csvSummary || csvSummary.length === 0) return;

    if (!usageTracker.canPerformAction(USAGE_COSTS.QA_QUERY)) {
        const limitReachedAnswer: QaAnswer = { text: `You've reached your monthly usage limit for Q&A. Your limit will reset on ${usageTracker.getNextResetDate()}.` };
        const newQaId = Date.now().toString();
        const newQaItem: QaItem = { id: newQaId, question, answer: limitReachedAnswer, isStreaming: false };
        setQaHistory(prev => [...prev, newQaItem]);
        return;
    }

    const newQaId = Date.now().toString();
    const newQaItem: QaItem = { id: newQaId, question, answer: {}, isStreaming: true };
    setQaHistory(prev => [...prev, newQaItem]);

    try {
      const answer = await queryDataWithAI(csvData, question, csvSummary);
      usageTracker.deductCredits(USAGE_COSTS.QA_QUERY);
      setQaHistory(prev => prev.map(item => item.id === newQaId ? { ...item, answer, isStreaming: false } : item));
    } catch (error) {
      console.error("Error during Q&A:", error);
      const errorAnswer: QaAnswer = { text: "Sorry, I encountered an error trying to answer that question." };
      setQaHistory(prev => prev.map(item => item.id === newQaId ? { ...item, answer: errorAnswer, isStreaming: false } : item));
    }
  }, [csvData, csvSummary, usageTracker]);
  
  const handleLoadDashboard = useCallback((state: SavedDashboardState) => {
    setDashboardSchema(state.schema);
    setCsvData(state.data);
    setCsvFile(new File([], state.fileName)); // Mock file object
    setQaHistory(state.qaHistory);
    setCsvSummary(state.csvSummary);
    setCsvGlobalStats(state.csvGlobalStats);
    setQuestionSuggestions([]); // Don't generate new suggestions for a loaded dash
    setAppState(AppState.DASHBOARD);
  }, []);

  const resetApp = () => {
    setAppState(AppState.UPLOAD);
    setDashboardSchema(null);
    setCsvData(null);
    setCsvFile(null);
    setCsvSummary(null);
    setCsvGlobalStats(null);
    setErrorMessage(null);
    setQaHistory([]);
    setQuestionSuggestions([]);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return <UploadScreen onFileUpload={handleFileUpload} />;
      case AppState.LOADING:
        return <LoadingScreen message={loadingMessage} />;
      case AppState.HEALTH_CHECK:
        if (csvSummary && csvGlobalStats && csvFile && csvData) {
          return (
            <HealthCheckScreen
              summary={csvSummary}
              stats={csvGlobalStats}
              fileName={csvFile.name}
              onProceed={handleProceedToDashboard}
              data={csvData}
            />
          );
        }
        setErrorMessage("Data analysis results are missing. Please start over.");
        setAppState(AppState.ERROR);
        return null;
      case AppState.DASHBOARD:
        if (dashboardSchema && csvData && csvFile && csvGlobalStats && csvSummary) {
          return (
            <DashboardScreen
              schema={dashboardSchema}
              data={csvData}
              fileName={csvFile.name}
              onQaSubmit={handleQaSubmit}
              qaHistory={qaHistory}
              questionSuggestions={questionSuggestions}
              onReset={resetApp}
              onLoadDashboard={handleLoadDashboard}
              csvGlobalStats={csvGlobalStats}
              csvSummary={csvSummary}
              usageTracker={usageTracker}
            />
          );
        }
        setErrorMessage("Dashboard data is missing. Please start over.");
        setAppState(AppState.ERROR);
        return null;
      case AppState.ERROR:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
            <div className="text-center bg-slate-800 p-8 rounded-lg shadow-2xl border border-red-500/50 max-w-lg">
              <XCircle className="mx-auto h-16 w-16 text-red-500" />
              <h2 className="mt-4 text-2xl font-bold text-red-400">An Error Occurred</h2>
              <p className="mt-2 text-slate-400">{errorMessage}</p>
              <button
                onClick={resetApp}
                className="mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue-700 text-white font-semibold rounded-md hover:bg-brand-blue-600 transition-colors"
              >
                <Upload className="h-5 w-5" />
                Upload New File
              </button>
            </div>
          </div>
        );
      default:
        return <UploadScreen onFileUpload={handleFileUpload} />;
    }
  };

  return <div className="min-h-screen bg-slate-900">{renderContent()}</div>;
}