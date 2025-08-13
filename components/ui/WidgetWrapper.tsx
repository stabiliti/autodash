import React, { useState, useRef, useEffect } from 'react';
import { Info, MoreVertical, Download, Trash2, Loader, Sparkles, Maximize } from 'lucide-react';
import { exportElementToPng } from '../../utils/exportUtils';

interface WidgetWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onRemove?: () => void;
  onFocus?: () => void;
  onExplain?: () => void;
  isExplaining?: boolean;
  menu?: boolean;
  elementRef?: React.RefObject<HTMLDivElement>;
}

export default function WidgetWrapper({ 
  title, 
  description, 
  children, 
  onRemove,
  onFocus,
  onExplain,
  isExplaining,
  menu = true,
  elementRef
}: WidgetWrapperProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const handleExport = async () => {
    const elementToExport = elementRef?.current || wrapperRef.current;
    if (!elementToExport) return;
    
    setIsExporting(true);
    await exportElementToPng(elementToExport, title);
    setIsExporting(false);
    setIsMenuOpen(false);
  };
  
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
    <div 
      ref={wrapperRef}
      className="bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm h-full flex flex-col group transition-all duration-300 hover:border-brand-cyan-500/50"
    >
      <header className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-100">{title}</h3>
          <div className="relative group/tooltip">
            <Info className="h-4 w-4 text-slate-400 cursor-pointer" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-slate-200 text-xs rounded py-1.5 px-2.5 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg border border-slate-700 z-10">
              {description}
            </div>
          </div>
        </div>
        {menu && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-400 hover:text-white">
              <MoreVertical className="h-5 w-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20">
                {onExplain && (
                   <button 
                    onClick={() => { onExplain(); setIsMenuOpen(false); }}
                    disabled={isExplaining}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isExplaining ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {isExplaining ? 'Explaining...' : 'Explain with AI'}
                  </button>
                )}
                 {onFocus && (
                  <button 
                    onClick={() => { onFocus(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50"
                  >
                    <Maximize className="h-4 w-4" />
                    Focus View
                  </button>
                )}
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-wait"
                >
                  {isExporting ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isExporting ? 'Exporting...' : 'Export as PNG'}
                </button>
                {onRemove && (
                  <>
                  <div className="h-px bg-slate-700 my-1"></div>
                  <button 
                    onClick={() => { onRemove(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Widget
                  </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </header>
      <div className="relative flex-grow flex flex-col">
        {children}
      </div>
    </div>
  );
}