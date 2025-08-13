
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface MiniBarChartProps {
    data: { value: string; count: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800/80 backdrop-blur-sm p-2 border border-slate-700 rounded-md shadow-lg text-xs">
                <p className="font-bold text-slate-200">{`${payload[0].payload.value}: ${payload[0].payload.count.toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};

export default function MiniBarChart({ data }: MiniBarChartProps) {
    const chartData = data.map(d => ({ name: d.value.length > 10 ? d.value.substring(0,10) + '...' : d.value, count: d.count, value: d.value }));
    
    return (
        <div className="h-24 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
                    <Bar dataKey="count" fill="#8884d8" barSize={10} radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
