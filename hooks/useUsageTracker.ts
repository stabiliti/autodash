import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

const TOTAL_CREDITS = 10000;

export const USAGE_COSTS = {
    DASHBOARD_GENERATION: 25,
    QA_QUERY: 5,
    CHART_EXPLANATION: 1,
    SYNTHETIC_DATA_PER_ROW: 1,
};

interface UsageState {
    credits: number;
    lastReset: string; // YYYY-MM
}

const getResetKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export const useUsageTracker = () => {
    const [usage, setUsage] = useLocalStorage<UsageState>('autoDash-usage', {
        credits: TOTAL_CREDITS,
        lastReset: getResetKey(),
    });

    useEffect(() => {
        const currentResetKey = getResetKey();
        if (usage.lastReset !== currentResetKey) {
            setUsage({
                credits: TOTAL_CREDITS,
                lastReset: currentResetKey,
            });
        }
    }, []); // Run only once on mount

    const deductCredits = (cost: number) => {
        setUsage(prev => ({
            ...prev,
            credits: Math.max(0, prev.credits - cost),
        }));
    };

    const canPerformAction = (cost: number): boolean => {
        return usage.credits >= cost;
    };
    
    const getNextResetDate = () => {
        const [year, month] = usage.lastReset.split('-').map(Number);
        const resetDate = new Date(year, month - 1, 1);
        resetDate.setMonth(resetDate.getMonth() + 1);
        return resetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    };

    return {
        remainingCredits: usage.credits,
        totalCredits: TOTAL_CREDITS,
        canPerformAction,
        deductCredits,
        getNextResetDate,
    };
};
