
import React, { useMemo } from 'react';
import { KpiWidgetConfig, CsvData } from '../../types';
import { aggregateDataForKpi, generateSparklineData } from '../../utils/dataTransformer';
import MiniSparkline from '../ui/MiniSparkline';

interface KpiCardWidgetProps {
  config: KpiWidgetConfig;
  data: CsvData;
}

export default function KpiCardWidget({ config, data }: KpiCardWidgetProps) {
  const { title, description, valueColumn, aggregation } = config;

  const value = useMemo(() => {
    return aggregateDataForKpi(data, valueColumn, aggregation);
  }, [data, valueColumn, aggregation]);

  const sparklineData = useMemo(() => generateSparklineData(data), [data]);

  return (
    <div 
      className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm flex flex-col justify-between h-full group transition-all duration-300 hover:border-brand-cyan-500/50"
      title={description}
    >
      <div className="flex-grow">
        <h4 className="text-sm font-medium text-slate-400 truncate">{title}</h4>
        <p className="text-3xl lg:text-4xl font-bold text-slate-100 mt-2">{value}</p>
      </div>
      {sparklineData.length > 0 && (
        <div className="h-12 w-full -mb-2">
          <MiniSparkline data={sparklineData} />
        </div>
      )}
    </div>
  );
}