import React, { useState, useRef, useEffect } from 'react';
import { ColumnSummary, ColumnType } from '../../types';
import { Hash, Type, Calendar, HelpCircle, Check, ChevronsUpDown } from 'lucide-react';
import MiniBarChart from '../ui/MiniBarChart';
import MiniHistogram from '../ui/MiniHistogram';

interface ColumnProfileCardProps {
    columnSummary: ColumnSummary;
    onTypeChange: (newType: ColumnType) => void;
}

const TypeIcon = ({ type }: { type: ColumnType }) => {
    switch (type) {
        case ColumnType.NUMERIC: return <Hash className="h-5 w-5 text-blue-400" />;
        case ColumnType.CATEGORICAL: return <Type className="h-5 w-5 text-purple-400" />;
        case ColumnType.DATE: return <Calendar className="h-5 w-5 text-green-400" />;
        default: return <HelpCircle className="h-5 w-5 text-gray-400" />;
    }
}

const StatItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
    value !== undefined && value !== null ? (
        <div className="flex justify-between text-xs">
            <span className="text-slate-400">{label}</span>
            <span className="font-medium text-slate-200">{typeof value === 'number' ? value.toLocaleString(undefined, {maximumFractionDigits: 2}) : value}</span>
        </div>
    ) : null
);

export default function ColumnProfileCard({ columnSummary, onTypeChange }: ColumnProfileCardProps) {
    const { columnName, inferredType, missingValues, totalRows, stats } = columnSummary;
    const missingPercentage = totalRows > 0 ? (missingValues / totalRows * 100).toFixed(1) : 0;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const availableTypes = [ColumnType.NUMERIC, ColumnType.CATEGORICAL, ColumnType.DATE];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm h-full flex flex-col">
            <div className="flex-grow">
                <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <TypeIcon type={inferredType} />
                        <span className="font-bold text-slate-100 truncate" title={columnName}>{columnName}</span>
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full cursor-pointer transition-colors ${
                                inferredType === ColumnType.NUMERIC ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900' :
                                inferredType === ColumnType.CATEGORICAL ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-900' :
                                inferredType === ColumnType.DATE ? 'bg-green-900/50 text-green-300 hover:bg-green-900' :
                                'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {inferredType}
                            <ChevronsUpDown className="h-3 w-3" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-36 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20">
                                {availableTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            onTypeChange(type);
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left text-slate-300 hover:bg-slate-700/50"
                                    >
                                        {type}
                                        {inferredType === type && <Check className="h-4 w-4 text-brand-cyan-400" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-1.5 text-sm mb-4">
                    {inferredType === ColumnType.NUMERIC && (
                        <>
                            <StatItem label="Mean" value={stats.mean} />
                            <StatItem label="Median" value={stats.median} />
                            <StatItem label="Std. Dev." value={stats.stdDev} />
                            <StatItem label="Min" value={stats.min} />
                            <StatItem label="Max" value={stats.max} />
                            {stats.min !== undefined && stats.max !== undefined && <MiniHistogram stats={stats} />}
                        </>
                    )}
                    {inferredType === ColumnType.CATEGORICAL && (
                        <>
                            <StatItem label="Unique Values" value={stats.uniqueValues} />
                            {stats.topValues && stats.topValues.length > 0 && <MiniBarChart data={stats.topValues} />}
                        </>
                    )}
                    {inferredType === ColumnType.DATE && (
                        <>
                            <StatItem label="Start Date" value={stats.minDate} />
                            <StatItem label="End Date" value={stats.maxDate} />
                        </>
                    )}
                </div>
            </div>
            
            <div className="mt-auto pt-2 border-t border-slate-700/50">
                 <div className="text-xs text-slate-400">
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${missingPercentage}%` }}></div>
                    </div>
                    {missingValues} missing ({missingPercentage}%)
                </div>
            </div>
        </div>
    );
}