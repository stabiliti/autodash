import React, { useState } from 'react';
import { ColumnSummary, CsvGlobalStats, ColumnType, CsvData } from '../types';
import { ShieldCheck, Rows, Columns, ShieldAlert, ArrowRight } from 'lucide-react';
import ColumnProfileCard from './widgets/ColumnProfileCard';
import { calculateStats } from '../services/csvParser';

interface HealthCheckScreenProps {
  summary: ColumnSummary[];
  stats: CsvGlobalStats;
  fileName: string;
  onProceed: (summary: ColumnSummary[]) => void;
  data: CsvData;
}

const StatCard = ({ icon, title, value, className }: { icon: React.ReactNode, title: string, value: string | number, className?: string }) => (
    <div className={`bg-slate-800/50 p-4 rounded-lg flex items-center gap-4 ${className}`}>
        {icon}
        <div>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className="text-slate-100 text-xl font-bold">{value.toLocaleString()}</p>
        </div>
    </div>
);


export default function HealthCheckScreen({ summary, stats, fileName, onProceed, data }: HealthCheckScreenProps) {
    const { totalRows, totalCols, emptyCells } = stats;
    const [currentSummary, setCurrentSummary] = useState(summary);

    const qualityScore = totalRows * totalCols > 0 ? 
        Math.round((1 - (emptyCells / (totalRows * totalCols))) * 100) : 100;
    
    const handleTypeChange = (columnIndex: number, newType: ColumnType) => {
        setCurrentSummary(prevSummary => {
            const newSummary = [...prevSummary];
            const columnToUpdate = { ...newSummary[columnIndex] };
            
            const columnValues = data.map(row => row[columnToUpdate.columnName] as string | null);
            columnToUpdate.inferredType = newType;
            columnToUpdate.stats = calculateStats(columnValues, newType);
            
            newSummary[columnIndex] = columnToUpdate;
            return newSummary;
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-100">Data Health Check</h1>
                <p className="text-lg text-slate-400 mt-2">Review and prepare <span className="font-semibold text-brand-blue-400">{fileName}</span> for analysis</p>
            </header>

            <section className="max-w-7xl mx-auto mb-8 p-6 bg-slate-800 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100 mb-4">At a Glance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        icon={<ShieldCheck className="h-10 w-10 text-green-500"/>}
                        title="Data Quality Score"
                        value={`${qualityScore}/100`}
                    />
                    <StatCard 
                        icon={<Rows className="h-10 w-10 text-brand-blue-400"/>}
                        title="Total Rows"
                        value={totalRows}
                    />
                    <StatCard 
                        icon={<Columns className="h-10 w-10 text-brand-blue-400"/>}
                        title="Total Columns"
                        value={totalCols}
                    />
                    <StatCard 
                        icon={<ShieldAlert className="h-10 w-10 text-yellow-500"/>}
                        title="Empty Cells"
                        value={emptyCells}
                    />
                </div>
            </section>
            
            <section className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-100 mb-4">Column Profiles</h2>
                 <p className="text-slate-400 text-sm max-w-2xl mb-6">Review each column's profile. You can override the inferred data type by clicking on the type badge (e.g., "Numeric") to improve the accuracy of the final dashboard.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentSummary.map((col, index) => (
                        <div key={col.columnName} className="widget-animate" style={{animationDelay: `${index * 50}ms`}}>
                            <ColumnProfileCard 
                                columnSummary={col}
                                onTypeChange={(newType) => handleTypeChange(index, newType)}
                            />
                        </div>
                    ))}
                </div>
            </section>
            
            <footer className="text-center mt-12">
                <button
                    onClick={() => onProceed(currentSummary)}
                    className="group flex items-center justify-center gap-3 px-8 py-4 bg-brand-blue-700 text-white font-bold text-lg rounded-lg hover:bg-brand-blue-600 transition-all duration-300 shadow-lg shadow-brand-blue-900/50 hover:shadow-xl hover:shadow-brand-blue-800/50 transform hover:scale-105"
                >
                    Generate AI Dashboard
                    <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
            </footer>
        </div>
    );
}