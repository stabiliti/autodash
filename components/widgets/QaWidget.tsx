import React, { useState, useRef, useEffect } from 'react';
import { QaItem, CsvData, ChartWidgetConfig, ColumnSummary } from '../../types';
import ChartWidget from './ChartWidget';
import Spinner from '../ui/Spinner';
import WidgetWrapper from '../ui/WidgetWrapper';
import { Send, User, Bot, PlusSquare, HardDriveDownload } from 'lucide-react';
import { exportDataToCsv } from '../../utils/csvUtils';
import { useUsageTracker } from '../../hooks/useUsageTracker';

interface QaWidgetProps {
  onQaSubmit: (question: string) => void;
  qaHistory: QaItem[];
  data: CsvData;
  onAddChart: (chart: ChartWidgetConfig & { data?: CsvData }) => void;
  questionSuggestions: string[];
  csvSummary: ColumnSummary[] | null;
  usageTracker: ReturnType<typeof useUsageTracker>;
}

interface QaItemDisplayProps {
  item: QaItem;
  data: CsvData;
  onAddChart: (chart: ChartWidgetConfig & { data?: CsvData }) => void;
  isAdded: boolean;
  onAdded: () => void;
  csvSummary: ColumnSummary[] | null;
  usageTracker: ReturnType<typeof useUsageTracker>;
}

const QaItemDisplay = ({ item, data, onAddChart, isAdded, onAdded, csvSummary, usageTracker }: QaItemDisplayProps) => {
    const handleAddClick = () => {
        if (item.answer.chart) {
            onAddChart(item.answer.chart);
            onAdded();
        }
    };

    const handleExportForecast = () => {
        if (item.answer.chart?.data) {
            exportDataToCsv(item.answer.chart.data, `forecast_${item.question.slice(0, 20).replace(/ /g, '_')}.csv`);
        }
    };
    
    return (
    <div className="space-y-4 widget-animate" style={{animationDuration: '0.3s'}}>
        {/* User Question */}
        <div className="flex items-start gap-3 justify-end">
            <div className="bg-brand-blue-700 rounded-lg p-3 max-w-lg">
                <p className="text-white">{item.question}</p>
            </div>
             <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                <User className="h-5 w-5 text-slate-300" />
            </div>
        </div>

        {/* AI Answer */}
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                <Bot className="h-5 w-5 text-brand-cyan-300" />
            </div>
            <div className="flex-grow min-w-0">
                {item.isStreaming ? (
                    <div className="flex items-center gap-2 text-slate-400 p-3">
                        <Spinner /> Thinking...
                    </div>
                ) : (
                    <div className="bg-slate-900/50 rounded-lg p-3 space-y-3">
                        {item.answer.text && <p className="text-slate-300 whitespace-pre-wrap">{item.answer.text}</p>}
                        {item.answer.chart && 
                            <div className="space-y-2">
                                <ChartWidget 
                                    config={item.answer.chart} 
                                    data={data}
                                    summary={csvSummary}
                                    usageTracker={usageTracker}
                                    overrideData={item.answer.chart.data}
                                    showMenu={false}
                                />
                                <div className="flex justify-end pt-1 gap-2">
                                    {item.answer.chart.data && (
                                        <button
                                            onClick={handleExportForecast}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-300 text-xs font-semibold rounded-md hover:bg-green-600/40 transition-colors"
                                        >
                                            <HardDriveDownload className="h-4 w-4" />
                                            Export Forecast
                                        </button>
                                    )}
                                    {!isAdded && (
                                        <button
                                            onClick={handleAddClick}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-cyan-600/20 text-brand-cyan-300 text-xs font-semibold rounded-md hover:bg-brand-cyan-600/40 transition-colors"
                                        >
                                            <PlusSquare className="h-4 w-4" />
                                            Add to Dashboard
                                        </button>
                                    )}
                                </div>
                            </div>
                        }
                    </div>
                )}
            </div>
        </div>
    </div>
    );
};


export default function QaWidget({ onQaSubmit, qaHistory, data, onAddChart, questionSuggestions, csvSummary, usageTracker }: QaWidgetProps) {
  const [question, setQuestion] = useState('');
  const historyEndRef = useRef<HTMLDivElement>(null);
  const [addedChartIds, setAddedChartIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onQaSubmit(question.trim());
      setQuestion('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onQaSubmit(suggestion);
    setQuestion('');
  };

  return (
    <WidgetWrapper 
      title="Exploratory Q&A"
      description="Ask a follow-up question about your data in plain English. You can also ask for forecasts!"
      menu={false}
    >
      <div className="p-4 sm:p-6">
        <div className="max-h-[50vh] overflow-y-auto pr-4 space-y-6">
          {qaHistory.length === 0 ? (
            <div className="text-slate-400 text-center py-8">
                <h4 className="font-semibold text-slate-300 mb-3">Need some ideas? Try one of these:</h4>
                <div className="flex flex-wrap justify-center gap-2">
                    {questionSuggestions.length > 0 ? questionSuggestions.map((q, i) => (
                        <button key={i} onClick={() => handleSuggestionClick(q)} className="px-3 py-1.5 bg-slate-700/50 text-slate-300 text-sm rounded-full hover:bg-slate-700 transition-colors">
                            {q}
                        </button>
                    )) : (
                        <p className="text-sm">Ask something like "What were the total sales in the West region?"</p>
                    )}
                </div>
            </div>
          ) : (
            qaHistory.map((item) => (
              <QaItemDisplay 
                key={item.id} 
                item={item} 
                data={data}
                onAddChart={onAddChart}
                csvSummary={csvSummary}
                usageTracker={usageTracker}
                isAdded={addedChartIds.has(item.id)}
                onAdded={() => {
                  setAddedChartIds(prev => {
                    const newSet = new Set(prev);
                    newSet.add(item.id);
                    return newSet;
                  });
                }}
              />
            ))
          )}
          <div ref={historyEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="mt-6 flex items-center gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your data..."
            className="flex-grow bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-brand-cyan-500/80 focus:outline-none transition-shadow"
          />
          <button type="submit" className="bg-brand-blue-700 p-3 rounded-lg hover:bg-brand-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!question.trim()}>
            <Send className="h-6 w-6 text-white" />
          </button>
        </form>
      </div>
    </WidgetWrapper>
  );
}