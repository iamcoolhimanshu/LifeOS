import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderOpen, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Search, 
  FileText, 
  Eye,
  File,
  RefreshCw,
  FolderDot
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useDocStore } from '../stores/useDocStore';
import { Document } from '../types';

export const Documents: React.FC = () => {
  const {
    documents,
    activeDocument,
    isLoading,
    isUploading,
    fetchDocuments,
    selectDocument,
    uploadDocument,
    deleteDocument,
    downloadDocument,
  } = useDocStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    'Initializing secure document buffer stream...',
    'Analyzing PDF content nodes & structures...',
    'Invoking Llama-3 parsing engine...',
    'Performing metadata classification...',
    'Creating semantic neural vector embeds...'
  ];

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isUploading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  useEffect(() => {
    let interval: any;
    if (isUploading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 98) return prev;
          return prev + Math.floor(Math.random() * 8) + 2;
        });
      }, 200);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle Drag Over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadDocument(e.dataTransfer.files[0]);
    }
  };

  // Handle File Input Change
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await uploadDocument(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getFilteredDocs = () => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter((d) => 
      d.fileName.toLowerCase().includes(query) ||
      d.aiCategory?.toLowerCase().includes(query) ||
      d.aiTags?.toLowerCase().includes(query) ||
      d.extractedText?.toLowerCase().includes(query)
    );
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this file from your digital memory?")) {
      await deleteDocument(id);
    }
  };

  const filteredDocs = getFilteredDocs();

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 overflow-hidden">
      
      {/* Left Column: File Upload Zone & Grid list */}
      <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
        
        {/* Style injection for animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes uploadScan {
            0% { top: 0%; opacity: 0.2; }
            50% { top: 100%; opacity: 1; }
            100% { top: 0%; opacity: 0.2; }
          }
          @keyframes glowPulse {
            0% { box-shadow: 0 0 10px rgba(0, 229, 255, 0.2); }
            50% { box-shadow: 0 0 25px rgba(0, 229, 255, 0.6); }
            100% { box-shadow: 0 0 10px rgba(0, 229, 255, 0.2); }
          }
          .animate-upload-scan {
            animation: uploadScan 2.5s infinite ease-in-out;
          }
          .animate-glow-pulse {
            animation: glowPulse 2s infinite ease-in-out;
          }
        `}} />

        {/* Upload Zone */}
        <form 
          onDragEnter={handleDrag} 
          onDragOver={handleDrag} 
          onDragLeave={handleDrag} 
          onDrop={handleDrop}
          onSubmit={(e) => e.preventDefault()}
          className={`glass-card p-6 flex flex-col justify-center items-center border-dashed border-2 min-h-48 text-center transition-all duration-300 relative overflow-hidden select-none ${
            dragActive 
              ? 'border-cyberBlue bg-cyberBlue/10 scale-[1.01]' 
              : 'border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/10 hover:border-slate-400 dark:hover:border-slate-700/60 hover:bg-slate-200/50 dark:hover:bg-slate-900/20'
          }`}
        >
          <input 
            ref={fileInputRef} 
            type="file" 
            className="hidden" 
            onChange={handleChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.txt,image/*"
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-sm relative z-10">
              {/* Vertical holographic scan line */}
              <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyberBlue to-transparent shadow-[0_0_12px_#00e5ff] animate-upload-scan" />
              
              {/* Glowing file page icon container */}
              <div className="p-4 rounded-full bg-cyberBlue/10 border border-cyberBlue/30 text-cyberBlue animate-bounce duration-1000 animate-glow-pulse">
                <FileText size={28} />
              </div>
              
              <div className="space-y-2 w-full mt-2">
                <p className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider">Neural NLP Processing Engine</p>
                <p className="text-[10px] text-cyberBlue font-semibold h-4 animate-pulse">
                  {loadingSteps[loadingStep]}
                </p>
                
                {/* Horizontal Progress bar */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-950/80 rounded-full overflow-hidden border border-slate-300 dark:border-slate-850 p-[1px] mt-3">
                  <div 
                    className="h-full bg-gradient-to-r from-cyberBlue via-neonPurple to-cyberBlue rounded-full transition-all duration-350 shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold px-1 mt-1">
                  <span>AI INDEX: STAGE 4</span>
                  <span className="text-cyberBlue">{progress}% SCANNED</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center gap-3 transition-transform duration-200 ${dragActive ? 'scale-105' : ''}`}>
              <div className={`p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 ${dragActive ? 'animate-bounce' : ''}`}>
                <Upload size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  Drag and drop files here or{' '}
                  <span onClick={onButtonClick} className="text-cyberBlue underline cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors">
                    browse
                  </span>
                </p>
                <p className="text-[10px] text-slate-500">Supports PDF, DOCX, XLSX, TXT, ZIP and Images up to 20MB</p>
              </div>
            </div>
          )}
        </form>

        {/* Search and Grid Card */}
        <GlassCard className="flex-1 p-6 flex flex-col overflow-hidden border border-darkBorder" hoverEffect={false}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">Stored Brain Documents</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 text-slate-550" size={13} />
              <input
                type="text"
                placeholder="Search file metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-cyberBlue/40"
              />
            </div>
          </div>

          {/* Files Grid */}
          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-4 scroll-custom">
            {isLoading && filteredDocs.length === 0 ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="h-6 w-6 border-2 border-cyberBlue border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500 text-xs">
                <FolderOpen className="text-slate-800 mb-3 mx-auto" size={36} />
                <p>No documents found matching filters.</p>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => selectDocument(doc)}
                  className={`p-4 rounded-xl border cursor-pointer flex gap-4 items-start transition-all duration-200 ${
                    activeDocument?.id === doc.id
                      ? 'bg-gradient-to-r from-cyan-500/10 to-cyberBlue/5 border-cyberBlue text-slate-800 dark:text-white'
                      : 'bg-slate-100/50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-900/40 hover:bg-slate-200/80 dark:hover:bg-slate-900/60 hover:border-slate-350 dark:hover:border-slate-800'
                  }`}
                >
                  <div className="p-3 rounded-lg bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-cyan-500 dark:text-cyan-400 shrink-0">
                    <FileText size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-850 dark:text-white truncate mb-1">{doc.fileName}</h4>
                    <span className="text-[9px] text-slate-500 font-medium block">{formatBytes(doc.fileSize)}</span>
                    
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide uppercase bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        {doc.aiCategory || 'Files'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

      </div>

      {/* Right Column: Detailed Document Preview Panel */}
      <GlassCard className="w-96 flex flex-col h-full border border-darkBorder" hoverEffect={false}>
        {!activeDocument ? (
          <div className="flex-1 flex flex-col justify-center items-center text-slate-500 text-xs p-8 text-center">
            <FolderDot className="text-slate-700 mb-3 animate-float" size={48} />
            <p>Select an uploaded document to view its AI summary, metadata details and content extraction</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Header controls */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-darkBorder flex items-center justify-between bg-slate-100/50 dark:bg-slate-950/20">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300 truncate max-w-[200px]" title={activeDocument.fileName}>
                {activeDocument.fileName}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadDocument(activeDocument.id, activeDocument.fileName)}
                  title="Download File"
                  className="p-2 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download size={13} />
                </button>
                <button
                  onClick={() => handleDelete(activeDocument.id)}
                  title="Delete File"
                  className="p-2 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scroll-custom">
              
              {/* File Info */}
              <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 dark:text-slate-400">
                <div className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-855">
                  <span className="text-slate-500 block uppercase font-semibold mb-1">File Type</span>
                  <span className="font-bold text-slate-800 dark:text-white truncate block">{activeDocument.fileType || 'Unknown'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-855">
                  <span className="text-slate-500 block uppercase font-semibold mb-1">File Size</span>
                  <span className="font-bold text-slate-800 dark:text-white block">{formatBytes(activeDocument.fileSize)}</span>
                </div>
              </div>

              {/* AI Generated summary output panel */}
              {activeDocument.aiSummary && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold tracking-widest text-cyberBlue uppercase flex items-center gap-1.5">
                    <Sparkles size={11} /> AI File Summary
                  </h4>
                  <div className="p-4 rounded-xl bg-cyberBlue/5 border border-cyberBlue/10 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
                    {activeDocument.aiSummary.split('\n').map((line, idx) => (
                      <p key={idx} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{__html: line.replace(/###/g, '').trim()}}></p>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag clouds */}
              {activeDocument.aiTags && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">AI Keywords</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeDocument.aiTags.split(',').map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[10px] text-slate-550 dark:text-slate-400 font-medium lowercase">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Text snippet */}
              {activeDocument.extractedText && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase flex items-center gap-1">
                    <Eye size={11} /> Extracted Brain Data
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 text-[11px] text-slate-700 dark:text-slate-400 leading-relaxed font-mono max-h-40 overflow-y-auto scroll-custom">
                    <p className="whitespace-pre-wrap">{activeDocument.extractedText}</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </GlassCard>

    </div>
  );
};
