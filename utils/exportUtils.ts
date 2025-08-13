import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportDashboardToPdf = async (element: HTMLElement, fileName: string): Promise<void> => {
    if (!element) return;
    
    try {
        const canvas = await html2canvas(element, {
            scale: 2, // for higher resolution
            backgroundColor: '#0f172a', // Tailwind slate-900
            useCORS: true,
            onclone: (document) => {
                // Ensure animations are captured in their final state
                document.querySelectorAll('.widget-animate').forEach(el => {
                    (el as HTMLElement).style.opacity = '1';
                    (el as HTMLElement).style.transform = 'translateY(0)';
                });
            }
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions to fit page
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_dashboard.pdf`);

    } catch (error) {
        console.error("Error exporting to PDF:", error);
        alert("Sorry, there was an error exporting the dashboard to PDF.");
    }
};

export const exportElementToPng = async (element: HTMLElement, fileName: string): Promise<void> => {
    if (!element) return;
    try {
        const canvas = await html2canvas(element, {
            backgroundColor: null, // Transparent background for the widget
            useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error exporting to PNG:", error);
        alert("Sorry, there was an error exporting the widget to PNG.");
    }
}