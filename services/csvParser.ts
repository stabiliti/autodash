import Papa from 'papaparse';
import { CsvData, ColumnSummary, ColumnType, ColumnStats, CsvGlobalStats } from '../types';

function inferColumnType(values: (string | null)[]): ColumnType {
    let numericCount = 0;
    let dateCount = 0;
    const validValues = values.filter(v => v !== null && v !== '');

    if (validValues.length === 0) return ColumnType.UNKNOWN;

    for (const value of validValues) {
        if (value === null) continue;
        if (!isNaN(Number(value)) && value.trim() !== '') {
            numericCount++;
        }
        // A simple date check, might need to be more robust for specific formats
        if (value.length > 6 && !isNaN(Date.parse(value))) {
            dateCount++;
        }
    }
    
    if (numericCount / validValues.length > 0.8) return ColumnType.NUMERIC;
    if (dateCount / validValues.length > 0.8) return ColumnType.DATE;
    return ColumnType.CATEGORICAL;
}


export function calculateStats(values: (string | null)[], type: ColumnType): ColumnStats {
    const stats: ColumnStats = {};
    const validValues = values.filter(v => v !== null && v.trim() !== '');

    if (type === ColumnType.NUMERIC) {
        const numbers = validValues.map(Number).filter(n => !isNaN(n));
        if (numbers.length === 0) return {};
        stats.min = Math.min(...numbers);
        stats.max = Math.max(...numbers);
        const sum = numbers.reduce((a, b) => a + b, 0);
        stats.mean = sum / numbers.length;
        numbers.sort((a, b) => a - b);
        const mid = Math.floor(numbers.length / 2);
        stats.median = numbers.length % 2 === 0 ? (numbers[mid - 1] + numbers[mid]) / 2 : numbers[mid];
        const variance = numbers.reduce((acc, val) => acc + Math.pow(val - stats.mean!, 2), 0) / numbers.length;
        stats.stdDev = Math.sqrt(variance);
    } else if (type === ColumnType.CATEGORICAL) {
        const counts = new Map<string, number>();
        validValues.forEach(v => counts.set(v!, (counts.get(v!) || 0) + 1));
        stats.uniqueValues = counts.size;
        stats.topValues = Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([value, count]) => ({ value, count }));
    } else if (type === ColumnType.DATE) {
        const dates = validValues.map(v => new Date(v!)).filter(d => !isNaN(d.getTime())).sort((a,b) => a.getTime() - b.getTime());
        if (dates.length === 0) return {};
        stats.minDate = dates[0]?.toISOString().split('T')[0];
        stats.maxDate = dates[dates.length - 1]?.toISOString().split('T')[0];
    }
    return stats;
}


export function parseAndAnalyzeCsv(file: File): Promise<{ data: CsvData, summary: ColumnSummary[], stats: CsvGlobalStats }> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false, // Keep everything as string for consistent analysis
            complete: (results: any) => {
                if (results.errors.length > 0) {
                   return reject(new Error(`CSV Parsing Error: ${results.errors[0].message}`));
                }

                const data: CsvData = results.data;
                const headers = results.meta.fields;
                if (!headers) {
                  return reject(new Error('Could not parse CSV headers.'));
                }
                const totalRows = data.length;
                const totalCols = headers.length;
                let emptyCells = 0;

                const summary: ColumnSummary[] = headers.map((header: string) => {
                    const columnValues = data.map(row => row[header] as string | null);
                    const missing = columnValues.filter(v => v === null || v === '').length;
                    emptyCells += missing;
                    const inferredType = inferColumnType(columnValues);
                    return {
                        columnName: header,
                        inferredType: inferredType,
                        missingValues: missing,
                        totalRows: totalRows,
                        stats: calculateStats(columnValues, inferredType),
                    };
                });
                
                const typedData = data.map(row => {
                    const newRow = {...row};
                    summary.forEach(colSummary => {
                        if(colSummary.inferredType === ColumnType.NUMERIC && newRow[colSummary.columnName] !== null) {
                            const numVal = Number(newRow[colSummary.columnName]);
                             if(!isNaN(numVal)) {
                               newRow[colSummary.columnName] = numVal;
                             }
                        }
                    });
                    return newRow;
                });

                const stats: CsvGlobalStats = {
                  totalRows,
                  totalCols,
                  emptyCells
                };

                resolve({ data: typedData, summary, stats });
            },
            error: (error: Error) => {
                reject(error);
            }
        });
    });
}