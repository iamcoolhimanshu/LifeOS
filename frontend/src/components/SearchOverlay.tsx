import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, FolderOpen, CornerDownLeft, Sparkles, BrainCircuit } from 'lucide-react';
import { useSearchStore } from '../stores/useSearchStore';
import { useNoteStore } from '../stores/useNoteStore';
import { useDocStore } from '../stores/useDocStore';

export const SearchOverlay: React.FC = () => {
  const [query, setQuery] = useState('');
  const searchResults = useSearchStore((state) => state.searchResults);
  const searchBrain = useSearchStore((state) => state.searchBrain);
  const setSearchOpen = useSearchStore((state) => state.setSearchOpen);
  const clearSearch = useSearchStore((state) => state.clearSearch);
  const isSearchLoading = useSearchStore((state) => state.isSearchLoading);
  
  const selectNote = useNoteStore((state) => state.selectNote);
  const selectDocument = useDocStore((state) => state.selectDocument);
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Trigger search on debounce input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchBrain(query);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchBrain]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        clearSearch();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [setSearchOpen, clearSearch]);

  const handleResultClick = (result: any) => {
    setSearchOpen(false);
    clearSearch();
    if (result.type === 'NOTE') {
      // Find note and select it
      apiGetAndSelectNote(result.id);
    } else {
      // Find document and select it
      apiGetAndSelectDoc(result.id);
    }
  };

  const apiGetAndSelectNote = async (id: number) => {
    try {
      const { fetchNotes, notes } = useNoteStore.getState();
      await fetchNotes();
      const note = useNoteStore.getState().notes.find((n) => n.id === id);
      if (note) {
        selectNote(note);
        navigate('/notes');
      }
    } catch (e) {
      navigate('/notes');
    }
  };

  const apiGetAndSelectDoc = async (id: number) => {
    try {
      const { fetchDocuments } = useDocStore.getState();
      await fetchDocuments();
      const doc = useDocStore.getState().documents.find((d) => d.id === id);
      if (doc) {
        selectDocument(doc);
        navigate('/documents');
      }
    } catch (e) {
      navigate('/documents');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-center items-start pt-[15vh]">
      <div 
        ref={overlayRef}
        className="w-full max-w-2xl bg-[#0e1424] border border-slate-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 transform scale-100"
      >
        {/* Search Input Box */}
        <div className="flex items-center px-5 py-4 border-b border-slate-800">
          <Search className="text-cyberBlue mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes, files, AI categories, and tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm font-medium"
          />
          {isSearchLoading ? (
            <div className="h-4 w-4 border-2 border-cyberBlue border-t-transparent rounded-full animate-spin mr-3"></div>
          ) : null}
          <button 
            onClick={() => { setSearchOpen(false); clearSearch(); }}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[50vh] overflow-y-auto p-4 scroll-custom">
          {!query && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs">
              <BrainCircuit className="text-slate-700 mb-3 animate-pulse" size={32} />
              <p>Type keywords to search across your AI Personal Brain</p>
              <div className="flex gap-2 mt-4">
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">#java</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">resume</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">invoice</span>
              </div>
            </div>
          )}

          {query && searchResults.length === 0 && !isSearchLoading && (
            <div className="text-center py-12 text-slate-500 text-xs">
              <p>No results found in your Digital Brain for "{query}"</p>
            </div>
          )}

          {searchResults.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              className="flex items-start gap-4 p-3 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-900/60 cursor-pointer group transition-all duration-200 mb-2"
            >
              {/* Icon Type */}
              <div className={`p-2.5 rounded-lg border ${
                result.type === 'NOTE' 
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20' 
                  : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20'
              }`}>
                {result.type === 'NOTE' ? <FileText size={18} /> : <FolderOpen size={18} />}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white truncate">{result.title}</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase bg-slate-800 border border-slate-700 text-slate-400">
                    {result.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mb-1" dangerouslySetInnerHTML={{__html: result.snippet}}></p>
                
                {result.aiSummary && (
                  <div className="flex items-center gap-1.5 text-[10px] text-cyberBlue bg-cyberBlue/5 border border-cyberBlue/10 rounded px-2 py-1 mt-1.5 w-fit">
                    <Sparkles size={10} />
                    <span className="truncate max-w-[400px]">AI: {result.aiSummary.replace(/### Summary|# Summary|AI Summary/gi, '').trim()}</span>
                  </div>
                )}
              </div>

              {/* Action shortcut hint */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center text-slate-600 self-center transition-opacity">
                <span className="text-[10px] mr-1">Open</span>
                <CornerDownLeft size={10} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-3.5 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <div className="flex gap-4">
            <span><kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 mr-1.5">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 mr-1.5">Enter</kbd> Open match</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 mr-1.5">ESC</kbd> Close</span>
          </div>
          <span className="text-cyberBlue flex items-center gap-1">
            <Sparkles size={11} />
            LifeOS AI Search Engine
          </span>
        </div>
      </div>
    </div>
  );
};
