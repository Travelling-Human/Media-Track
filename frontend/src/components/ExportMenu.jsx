import { useState } from 'react';
import { exportItems } from '../api/items';

export default function ExportMenu() {
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState('');

    const handleExport = async (format) => {
        setIsExporting(true);
        setError('');
        try {
            const res = await exportItems(format);
            const mimeType = format === 'json' ? 'application/json' : 'text/plain';
            const blob = new Blob([res.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `medialist_export.${format}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            setError('EXPORT_FAILED — try again in a moment.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="export-menu">
            <button className="dashboard-export-btn" onClick={() => handleExport('txt')} disabled={isExporting}>
                EXPORT .TXT
            </button>
            <button className="dashboard-export-btn" onClick={() => handleExport('json')} disabled={isExporting}>
                EXPORT .JSON
            </button>
            {error && <span className="export-error">{error}</span>}
        </div>
    );
}