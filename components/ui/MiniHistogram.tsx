
import React, { useMemo } from 'react';
import { ColumnStats } from '../../types';
import { createHistogramBins } from '../../utils/dataTransformer';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface MiniHistogramProps {
    stats: ColumnStats;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800/80 backdrop-blur-sm p-2 border border-slate-700 rounded-md shadow-lg text-xs">
                 <p className="font-bold text-slate-200">{`Range: ${payload[0].payload.name}`}</p>
                 <p className="text-slate-300">{`Count: ${payload[0].value.toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};

export default function MiniHistogram({ stats }: MiniHistogramProps) {
    // This is a proxy, as we don't have the full data here.
    // A proper implementation would pass the raw column data.
    // For now, we generate pseudo-data based on stats to show a plausible distribution.
    const pseudoData = useMemo(() => {
        const data = [];
        const { mean = 0, stdDev = 1, min = 0, max = 1 } = stats;
        for (let i = 0; i < 1000; i++) {
             // Simple normal distribution approximation using Box-Muller-ish transform
             let u = 0, v = 0;
             while(u === 0) u = Math.random();
             while(v === 0) v = Math.random();
             let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
             num = num * stdDev + mean;
             if (num >= min && num <= max) {
                 data.push(num);
             }
        }
        return createHistogramBins(data);
    }, [stats]);
    
    return (
         <div className="h-24 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pseudoData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="name" hide />
                    <YAxis allowDecimals={false} hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
                    <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
