
import React from 'react';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';

interface MiniSparklineProps {
  data: { name: string; value: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/80 backdrop-blur-sm p-2 border border-slate-700 rounded-md shadow-lg text-xs">
                 <p className="text-slate-300">{`${payload[0].payload.name}: ${payload[0].value.toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};

export default function MiniSparkline({ data }: MiniSparklineProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Tooltip content={<CustomTooltip />} />
        <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#22d3ee" // brand-cyan-400
            strokeWidth={2}
            dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}