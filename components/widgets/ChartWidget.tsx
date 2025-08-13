import React, { useMemo, useRef, useState } from 'react';
import { ChartWidgetConfig, CsvData, ColumnSummary } from '../../types';
import { transformDataForChart } from '../../utils/dataTransformer';
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import WidgetWrapper from '../ui/WidgetWrapper';
import { explainChart } from '../../services/geminiService';
import { useUsageTracker, USAGE_COSTS } from '../../hooks/useUsageTracker';
import { AlertTriangle, Sparkles } from 'lucide-react';

interface ChartWidgetProps {
  config: ChartWidgetConfig;
  data: CsvData;
  summary: ColumnSummary[] | null;
  usageTracker: ReturnType<typeof useUsageTracker>;
  onRemove?: () => void;
  onFocus?: () => void;
  showMenu?: boolean;
  overrideData?: CsvData;
}

const COLORS = ['#22d3ee', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']; // Start with cyan

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/80 backdrop-blur-sm p-3 border border-slate-700 rounded-md shadow-lg">
                <p className="label font-bold text-slate-200">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <div key={index} style={{ color: pld.color || pld.fill }}>
                        {`${pld.name}: ${typeof pld.value === 'number' ? pld.value.toLocaleString() : pld.value}`}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};


export default function ChartWidget({ config, data, summary, usageTracker, onRemove, onFocus, showMenu = true, overrideData }: ChartWidgetProps) {
  const chartData = overrideData || data;
  const transformedData = useMemo(() => transformDataForChart(chartData, config), [chartData, config]);
  const chartRef = useRef<HTMLDivElement>(null);

  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
      if (!summary) {
          setError("Column summary not available for explanation.");
          return;
      }
      if (!usageTracker.canPerformAction(USAGE_COSTS.CHART_EXPLANATION)) {
          setError(`You've reached your usage limit for AI explanations. Your limit will reset on ${usageTracker.getNextResetDate()}.`);
          return;
      }
      setIsExplaining(true);
      setExplanation(null);
      setError(null);
      try {
          const result = await explainChart(config, transformedData.slice(0, 20), summary);
          usageTracker.deductCredits(USAGE_COSTS.CHART_EXPLANATION);
          setExplanation(result);
      } catch(e) {
          const message = e instanceof Error ? e.message : 'An unknown error occurred while explaining the chart.';
          setError(message);
      } finally {
          setIsExplaining(false);
      }
  };
  
  const renderChart = () => {
    switch (config.chartType) {
      case 'bar':
        return (
          <BarChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis dataKey={config.xAxisKey} tick={{ fill: '#94a3b8' }} fontSize={12} />
            <YAxis tick={{ fill: '#94a3b8' }} fontSize={12} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
            <Legend wrapperStyle={{fontSize: "12px"}} />
            {config.yAxisKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis dataKey={config.xAxisKey} tick={{ fill: '#94a3b8' }} fontSize={12} />
            <YAxis tick={{ fill: '#94a3b8' }} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: "12px"}}/>
            {config.yAxisKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} activeDot={{r: 6}}/>
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={transformedData}>
            <defs>
              {config.yAxisKeys.map((key, i) => (
                 <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
                 </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis dataKey={config.xAxisKey} tick={{ fill: '#94a3b8' }} fontSize={12} />
            <YAxis tick={{ fill: '#94a3b8' }} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: "12px"}}/>
            {config.yAxisKeys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} fillOpacity={1} fill={`url(#color${key})`} />
            ))}
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie data={transformedData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} fill="#8884d8" paddingAngle={2} labelLine={false}>
              {transformedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={''} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: "12px"}}/>
          </PieChart>
        );
      case 'scatter':
        return (
           <ScatterChart>
             <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
             <XAxis type="number" dataKey={config.xAxisKey} name={config.xAxisKey} tick={{ fill: '#94a3b8' }} fontSize={12} />
             <YAxis type="number" dataKey={config.yAxisKeys[0]} name={config.yAxisKeys[0]} tick={{ fill: '#94a3b8' }} fontSize={12} />
             <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
             <Scatter name={config.title} data={transformedData} fill={COLORS[0]} />
           </ScatterChart>
        );
      default:
        return <p>Unsupported chart type: {config.chartType}</p>;
    }
  };

  return (
    <WidgetWrapper 
      title={config.title} 
      description={config.description} 
      onRemove={onRemove} 
      onFocus={onFocus}
      onExplain={handleExplain}
      isExplaining={isExplaining}
      elementRef={chartRef} 
      menu={showMenu}
    >
      <div className={`h-96 ${explanation || error ? 'h-80' : 'h-96'} transition-all`} ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      {(explanation || error) && (
        <div className="p-4 border-t border-slate-700/50">
          {explanation && (
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-brand-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">{explanation}</p>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}
    </WidgetWrapper>
  );
}