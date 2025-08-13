import Papa from 'papaparse';
import { CsvData } from '../types';

export function exportDataToCsv(data: CsvData, fileName: string) {
    if (!data || data.length === 0) {
        alert("No data available to export.");
        return;
    }

    try {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error exporting data to CSV:", error);
        alert("Failed to export data. Please check the console for details.");
    }
}
