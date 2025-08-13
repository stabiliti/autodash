
import React, { useState, useCallback } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';

interface UploadScreenProps {
  onFileUpload: (file: File) => void;
}

export default function UploadScreen({ onFileUpload }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if(file.type === 'text/csv') {
        onFileUpload(file);
      } else {
        alert("Please upload a valid CSV file.");
      }
      e.dataTransfer.clearData();
    }
  }, [onFileUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-slate-100">AutoDash AI</h1>
        <p className="mt-4 text-lg text-slate-400">
          Upload a CSV file and watch as AI instantly generates a beautiful, insightful data dashboard.
        </p>

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`mt-10 p-8 border border-dashed rounded-2xl transition-all duration-300 ${
            isDragging ? 'border-brand-cyan-500 bg-brand-cyan-950/30 scale-105' : 'border-slate-700 bg-slate-800/30'
          } backdrop-blur-sm`}
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-slate-400">
            <UploadCloud className={`h-16 w-16 transition-colors ${isDragging ? 'text-brand-cyan-400' : 'text-slate-500'}`} />
            <p className="text-xl font-medium">
              Drag & drop your CSV file here
            </p>
            <p>or</p>
            <label htmlFor="file-upload" className="cursor-pointer px-6 py-3 bg-brand-blue-700 text-white font-semibold rounded-md hover:bg-brand-blue-600 transition-colors">
              Browse Files
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="mt-8 text-left max-w-xl mx-auto p-4 bg-slate-800/20 border border-slate-700/50 rounded-lg">
            <h3 className="font-semibold text-slate-200 mb-3">CSV File Requirements</h3>
            <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>File must be in <code className="bg-slate-700 p-1 rounded text-xs">.csv</code> format.</span>
                </li>
                <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Must include a header row with column names.</span>
                </li>
                <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>A minimum of 10 data rows is required for meaningful analysis.</span>
                </li>
                 <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>For best performance, we recommend files under 50MB.</span>
                </li>
            </ul>
        </div>

      </div>
    </div>
  );
}