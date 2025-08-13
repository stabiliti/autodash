
import { CsvData, ChartWidgetConfig, ColumnType } from '../types';

export function aggregateDataForKpi(data: CsvData, column: string, aggregation: string): string {
    const values = data.map(row => row[column]).filter(v => v !== null && v !== undefined && v !== '');

    if (values.length === 0 && aggregation !== 'COUNT') return "N/A";

    switch (aggregation) {
        case 'COUNT':
            return data.length.toLocaleString();
        case 'COUNT_DISTINCT':
            return new Set(values).size.toLocaleString();
        case 'SUM': {
            const sum = values.map(v => Number(v)).reduce((acc, v) => acc + v, 0);
            return sum.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        case 'AVERAGE': {
            const sum = values.map(v => Number(v)).reduce((acc, v) => acc + v, 0);
            const avg = sum / values.length;
            return avg.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        default:
            return "N/A";
    }
}

export function createHistogramBins(data: number[], binCount = 10): { name: string; value: number }[] {
    if (data.length === 0) return [];
    const max = Math.max(...data);
    const min = Math.min(...data);
    if (min === max) {
        return [{ name: String(min), value: data.length }];
    }
    const binSize = (max - min) / binCount;
    const bins = new Array(binCount).fill(0).map(() => ({ count: 0, range: '' }));

    for (let i = 0; i < binCount; i++) {
        const binStart = min + i * binSize;
        const binEnd = binStart + binSize;
        bins[i].range = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
    }

    for (const value of data) {
        let binIndex = Math.floor((value - min) / binSize);
        if (value === max) {
            binIndex = binCount - 1; // Put max value in the last bin
        }
        if (bins[binIndex]) {
            bins[binIndex].count++;
        }
    }

    return bins.map(bin => ({ name: bin.range, value: bin.count }));
}

export function generateSparklineData(data: CsvData): { name: string; value: number }[] {
    // Find first date-like column and first numeric column
    if (!data || data.length === 0) return [];
    
    const headers = Object.keys(data[0]);
    let dateHeader: string | undefined;
    for (const row of data) {
        dateHeader = headers.find(h => typeof row[h] === 'string' && !isNaN(Date.parse(row[h] as string)));
        if(dateHeader) break;
    }
    
    const numericHeader = headers.find(h => typeof data[0][h] === 'number');

    if (!dateHeader || !numericHeader) return [];

    try {
        const sortedData = [...data]
            .map(row => ({_date: new Date(row[dateHeader as string] as string), _value: row[numericHeader as string]}))
            .filter(row => !isNaN(row._date.getTime()) && typeof row._value === 'number')
            .sort((a, b) => a._date.getTime() - b._date.getTime());

        if (sortedData.length < 2) return [];

        // For simplicity, just return up to 30 data points for the sparkline
        const step = Math.max(1, Math.floor(sortedData.length / 30));
        const sparklinePoints = [];
        for (let i = 0; i < sortedData.length; i += step) {
            sparklinePoints.push({
                name: sortedData[i]._date.toISOString().split('T')[0],
                value: sortedData[i]._value as number,
            });
        }
        return sparklinePoints;
    } catch (e) {
        console.error("Failed to generate sparkline data", e);
        return [];
    }
}


export function transformDataForChart(data: CsvData, config: ChartWidgetConfig) {
    const { chartType, xAxisKey, yAxisKeys } = config;

    if (chartType === 'pie') {
        const valueKey = yAxisKeys[0]; // Pie charts use the first yAxisKey for values
        const nameKey = xAxisKey; // and the xAxisKey for names/labels
        
        const aggregatedData = new Map<string, number>();

        data.forEach(row => {
            const name = row[nameKey];
            const value = row[valueKey] ? Number(row[valueKey]) : 1; // if no valueKey, count occurrences
            
            if (name !== undefined) {
                 const current = aggregatedData.get(String(name)) || 0;
                 aggregatedData.set(String(name), current + value);
            }
        });
        
        return Array.from(aggregatedData.entries()).map(([name, value]) => ({ name, value }));
    }

    if (chartType === 'bar' || chartType === 'line' || chartType === 'area') {
        // For these charts, we might need to group and aggregate if the x-axis is not unique.
        // For simplicity here, we assume the data is either already aggregated or doesn't need it.
        // A more advanced implementation would group by xAxisKey and sum/avg yAxisKeys.
        return data.map(row => {
            const newRow: Record<string, any> = { [xAxisKey]: row[xAxisKey] };
            yAxisKeys.forEach(key => {
                newRow[key] = row[key];
            });
            return newRow;
        });
    }

    if (chartType === 'scatter') {
        return data; // Scatter plots usually don't need transformation
    }

    return data;
}