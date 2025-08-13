import React, { useState, useRef } from 'react';
import { DashboardSchema, CsvData, QaItem, SavedDashboards, SavedDashboardState, ChartWidgetConfig, CsvGlobalStats, ColumnSummary } from '../types';
import AiNarrativeWidget from './widgets/AiNarrativeWidget';
import KpiCardWidget from './widgets/KpiCardWidget';
import ChartWidget from './widgets/ChartWidget';
import QaWidget from './widgets/QaWidget';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FileText, Save, FolderOpen, RefreshCw, X, FileDown, Loader, Wrench, Sparkles, HardDriveDownload, Maximize, BrainCircuit } from 'lucide-react';
import { exportDashboardToPdf } from '../utils/exportUtils';
import { exportDataToCsv } from '../utils/csvUtils';
import { generateSyntheticData } from '../services/geminiService';
import { useUsageTracker, USAGE_COSTS } from '../hooks/useUsageTracker';

interface DashboardScreenProps {
  schema: DashboardSchema;
  data: CsvData;
  fileName: string;
  csvGlobalStats: CsvGlobalStats | null;
  onQaSubmit: (question: string) => void;
  qaHistory: QaItem[];
  onReset: () => void;
  onLoadDashboard: (state: SavedDashboardState) => void;
  questionSuggestions: string[];
  csvSummary: ColumnSummary[] | null;
  usageTracker: ReturnType<typeof useUsageTracker>;
}

export default function DashboardScreen({ schema, data, fileName, csvGlobalStats, onQaSubmit, qaHistory, onReset, onLoadDashboard, questionSuggestions, csvSummary, usageTracker }: DashboardScreenProps) {
  const [savedDashboards, setSavedDashboards] = useLocalStorage<SavedDashboards>('autoDash-saved', {});
  const [saveName, setSaveName] = useState(fileName.replace('.csv', ''));
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hiddenCharts, setHiddenCharts] = useState<number[]>([]);
  const [dynamicCharts, setDynamicCharts] = useState<(ChartWidgetConfig & { data?: CsvData })[]>([]);
  const [showSyntheticDataModal, setShowSyntheticDataModal] = useState(false);
  const [focusedChart, setFocusedChart] = useState<(ChartWidgetConfig & { chartData: CsvData, summary: ColumnSummary[] | null }) | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (!saveName) {
      alert("Please provide a name to save the dashboard.");
      return;
    }
     if (!csvGlobalStats || !csvSummary) {
      alert("Cannot save dashboard: global data stats or summary are missing.");
      return;
    }
    const dataString = JSON.stringify(data);
    if (dataString.length > 4 * 1024 * 1024) { // 4MB warning
      if(!confirm("Warning: Your dataset is large (>4MB). Saving to browser storage may fail or cause performance issues. Continue?")) {
        return;
      }
    }
    const stateToSave: SavedDashboardState = { schema, data, fileName, qaHistory, csvGlobalStats, csvSummary };
    setSavedDashboards(prev => ({ ...prev, [saveName]: stateToSave }));
    alert(`Dashboard "${saveName}" saved!`);
  };

  const handleLoad = (name: string) => {
    const savedState = savedDashboards[name];
    if (savedState) {
      onLoadDashboard(savedState);
      setShowLoadModal(false);
    } else {
      alert("Could not load the selected dashboard.");
    }
  };
  
  const handleDelete = (name: string) => {
    if(confirm(`Are you sure you want to delete the "${name}" dashboard?`)) {
      const newDashboards = { ...savedDashboards };
      delete newDashboards[name];
      setSavedDashboards(newDashboards);
    }
  };
  
  const handleExport = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    await exportDashboardToPdf(dashboardRef.current, saveName || 'dashboard');
    setIsExporting(false);
  };
  
  const handleRemoveChart = (chartIndex: number) => {
    setHiddenCharts(prev => [...prev, chartIndex]);
  };
  
  const handleAddChart = (chart: ChartWidgetConfig & { data?: CsvData }) => {
    setDynamicCharts(prev => [...prev, chart]);
  };

  const handleRemoveDynamicChart = (indexToRemove: number) => {
    setDynamicCharts(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleFocusChart = (config: ChartWidgetConfig, chartData: CsvData) => {
    setFocusedChart({ ...config, chartData, summary: csvSummary });
  };

  const handleReset = () => {
    onReset();
    setHiddenCharts([]);
    setDynamicCharts([]);
  };
  
  const SyntheticDataModal = () => {
    const [rowCount, setRowCount] = useState(100);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!csvSummary) {
            setError("Data summary is not available to generate data.");
            return;
        }
        
        const cost = rowCount * USAGE_COSTS.SYNTHETIC_DATA_PER_ROW;
        if (!usageTracker.canPerformAction(cost)) {
            setError(`Generating ${rowCount} rows requires ${cost} credits, but you only have ${usageTracker.remainingCredits}. Your limit will reset on ${usageTracker.getNextResetDate()}.`);
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const syntheticData = await generateSyntheticData(csvSummary, rowCount);
            if (syntheticData.length > 0) {
                usageTracker.deductCredits(cost);
                exportDataToCsv(syntheticData, `synthetic_${fileName}`);
                setShowSyntheticDataModal(false);
            } else {
                setError("AI returned no data. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-slate-700">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-brand-cyan-400" />Synthetic Data Generator</h3>
                <button onClick={() => setShowSyntheticDataModal(false)}><X className="h-6 w-6 text-slate-400 hover:text-white" /></button>
             </div>
             <p className="text-slate-400 mb-4 text-sm">Create a new CSV file with synthetic data based on the structure of <code className="bg-slate-700 p-1 rounded text-xs">{fileName}</code>.</p>
             <div className="space-y-4">
                <div>
                    <label htmlFor="rowCount" className="block text-sm font-medium text-slate-300 mb-1">Number of rows to generate:</label>
                    <input
                        type="number"
                        id="rowCount"
                        value={rowCount}
                        onChange={(e) => setRowCount(Math.max(1, parseInt(e.target.value, 10)))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-cyan-500 focus:outline-none"
                        min="1"
                        max="1000"
                    />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !csvSummary}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-blue-700 text-white font-semibold rounded-md hover:bg-brand-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : <HardDriveDownload className="h-5 w-5" />}
                    {isLoading ? 'Generating...' : `Generate & Download ${rowCount} Rows`}
                </button>
             </div>
          </div>
        </div>
    );
  };
  
  const usedCredits = usageTracker.totalCredits - usageTracker.remainingCredits;
  const usagePercentage = (usedCredits / usageTracker.totalCredits) * 100;

  return (
    <div className="bg-slate-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div ref={dashboardRef}>
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-brand-blue-400" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-100">{fileName}</h1>
              <p className="text-sm text-slate-400">AI-Generated Analysis by Apollo</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
             <div className="relative group/tooltip w-40">
                 <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-brand-cyan-400" />
                    <p className="text-xs font-medium text-slate-300">{usageTracker.remainingCredits.toLocaleString()} <span className="text-slate-400">Credits</span></p>
                 </div>
                 <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                    <div className="bg-brand-cyan-500 h-1.5 rounded-full" style={{width: `${100 - usagePercentage}%`}}></div>
                 </div>
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-slate-900 text-slate-200 text-xs rounded py-1.5 px-2.5 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg border border-slate-700 z-10">
                     You've used {usedCredits.toLocaleString()} of {usageTracker.totalCredits.toLocaleString()} AI credits this month.
                     <br/>
                     Your credits will reset on {usageTracker.getNextResetDate()}.
                </div>
            </div>
            <input 
              type="text" 
              value={saveName} 
              onChange={(e) => setSaveName(e.target.value)} 
              placeholder="Dashboard Name"
              className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-cyan-500 focus:outline-none"
            />
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-sm font-medium rounded-md hover:bg-slate-600 transition-colors">
              <Save className="h-4 w-4" /> Save
            </button>
            <button onClick={() => setShowLoadModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-sm font-medium rounded-md hover:bg-slate-600 transition-colors">
              <FolderOpen className="h-4 w-4" /> Load
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-sm font-medium rounded-md hover:bg-slate-600 transition-colors" disabled={isExporting}>
              {isExporting ? <Loader className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />} {isExporting ? 'Exporting...' : 'Export'}
            </button>
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-brand-blue-700 text-sm font-medium rounded-md hover:bg-brand-blue-600 transition-colors">
              <RefreshCw className="h-4 w-4" /> New Report
            </button>
          </div>
        </header>

        <main className="space-y-12">
          <section className="widget-animate" style={{animationDelay: '0ms'}}>
            <AiNarrativeWidget config={schema.header.ai_narrative} csvGlobalStats={csvGlobalStats} />
          </section>

          <section>
            <div className="widget-animate" style={{animationDelay: '200ms'}}>
              <h2 className="text-2xl font-bold text-slate-200 mb-6">Key Metrics</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {schema.header.kpis.map((kpi, index) => (
                <div key={index} className="widget-animate" style={{animationDelay: `${300 + 100 * index}ms`}}>
                  <KpiCardWidget config={kpi} data={data} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="widget-animate" style={{animationDelay: '450ms'}}>
                <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2"><Wrench className="h-6 w-6" /> Tools</h2>
                <div className="p-6 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-slate-100">Synthetic Data Generator</h3>
                        <p className="text-sm text-slate-400 mt-1">Create a new CSV with AI-generated data that mimics your original file's structure.</p>
                    </div>
                    <button
                        onClick={() => setShowSyntheticDataModal(true)}
                        disabled={!csvSummary}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-slate-700 text-sm font-medium rounded-md hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <Sparkles className="h-4 w-4" /> Open Generator
                    </button>
                </div>
            </div>
          </section>

          <section>
             <div className="widget-animate" style={{animationDelay: '500ms'}}>
              <h2 className="text-2xl font-bold text-slate-200 mb-6">Deep Dive</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {schema.body.map((chart, index) => (
                  !hiddenCharts.includes(index) &&
                  <div key={`schema-${index}`} className="widget-animate" style={{animationDelay: `${600 + index * 100}ms`}}>
                    <ChartWidget 
                      config={chart} 
                      data={data}
                      summary={csvSummary}
                      usageTracker={usageTracker}
                      onRemove={() => handleRemoveChart(index)}
                      onFocus={() => handleFocusChart(chart, data)}
                    />
                  </div>
                ))}
                {dynamicCharts.map((chart, index) => (
                  <div key={`dynamic-${index}`} className="widget-animate">
                    <ChartWidget 
                      config={chart} 
                      data={data}
                      summary={csvSummary}
                      usageTracker={usageTracker}
                      overrideData={chart.data}
                      onRemove={() => handleRemoveDynamicChart(index)}
                      onFocus={() => handleFocusChart(chart, chart.data || data)}
                    />
                  </div>
                ))}
            </div>
          </section>
          
          <section>
            <div className="widget-animate" style={{animationDelay: '1000ms'}}>
               <QaWidget onQaSubmit={onQaSubmit} qaHistory={qaHistory} data={data} onAddChart={handleAddChart} questionSuggestions={questionSuggestions} csvSummary={csvSummary} usageTracker={usageTracker} />
            </div>
          </section>
        </main>
      </div>

      {showLoadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-slate-700">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Load Dashboard</h3>
                <button onClick={() => setShowLoadModal(false)}><X className="h-6 w-6 text-slate-400 hover:text-white" /></button>
             </div>
             <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
               {Object.keys(savedDashboards).length > 0 ? Object.entries(savedDashboards).map(([name, dash]) => (
                 <div key={name} className="flex items-center justify-between p-3 bg-slate-700 rounded-md">
                   <div>
                     <p className="font-semibold">{name}</p>
                     <p className="text-xs text-slate-400">{dash.fileName} ({dash.csvGlobalStats.totalRows} rows)</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <button onClick={() => handleLoad(name)} className="px-3 py-1 bg-brand-blue-700 text-xs font-semibold rounded hover:bg-brand-blue-600">Load</button>
                     <button onClick={() => handleDelete(name)} className="px-3 py-1 bg-red-700 text-xs font-semibold rounded hover:bg-red-600">Delete</button>
                   </div>
                 </div>
               )) : <p className="text-slate-400 text-center py-4">No saved dashboards found.</p>}
             </div>
          </div>
        </div>
      )}
      {showSyntheticDataModal && <SyntheticDataModal />}
      {focusedChart && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 z-50 widget-animate">
          <div className="w-full h-full bg-slate-900/50 rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col">
              <ChartWidget
                  config={focusedChart}
                  data={focusedChart.chartData}
                  summary={focusedChart.summary}
                  usageTracker={usageTracker}
                  showMenu={false}
              />
          </div>
          <button 
            onClick={() => setFocusedChart(null)} 
            className="absolute top-4 right-4 p-2 bg-slate-700 rounded-full text-white hover:bg-slate-600"
            aria-label="Close focus view"
          >
              <X className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}