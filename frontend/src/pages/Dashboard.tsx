import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  FolderOpen, 
  Sparkles, 
  TrendingUp, 
  Upload, 
  Plus, 
  Clock, 
  Activity,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useNoteStore } from '../stores/useNoteStore';
import { useDocStore } from '../stores/useDocStore';
import { useSearchStore } from '../stores/useSearchStore';
import api from '../utils/api';
import { DashboardSummary } from '../types';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [quickNoteTitle, setQuickNoteTitle] = useState('');
  const [quickNoteContent, setQuickNoteContent] = useState('');
  const [loading, setLoading] = useState(true);

  const createNote = useNoteStore((state) => state.createNote);
  const selectNote = useNoteStore((state) => state.selectNote);
  const selectDocument = useDocStore((state) => state.selectDocument);
  const setChatOpen = useSearchStore((state) => state.setChatOpen);
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      const res = await api.get<DashboardSummary>('/dashboard/summary');
      setSummary(res.data);
    } catch (e) {
      console.error("Failed to load dashboard summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleQuickNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteTitle.trim()) return;

    await createNote({
      title: quickNoteTitle.trim(),
      content: quickNoteContent.trim(),
      category: 'Quick Note',
    });

    setQuickNoteTitle('');
    setQuickNoteContent('');
    fetchSummary(); // Refresh stats
  };

  const navigateToNote = (note: any) => {
    selectNote(note);
    navigate('/notes');
  };

  const navigateToDoc = (doc: any) => {
    selectDocument(doc);
    navigate('/documents');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        {/* Loading Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-[400px] lg:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
          <div className="h-[400px] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide flex items-center gap-2">
            Welcome to LifeOS <Sparkles className="text-cyberBlue" size={20} />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">All of your digital information is parsed, organized, and searchable in one place.</p>
        </div>
        {summary?.dailyQuote && (
          <GlassCard className="px-4 py-2.5 max-w-md border-l-2 border-l-neonPurple border-y-slate-200 dark:border-y-darkBorder border-r-slate-200 dark:border-r-darkBorder rounded-xl flex items-center gap-2">
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-300 italic">"{summary.dailyQuote}"</span>
          </GlassCard>
        )}
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Notes */}
        <GlassCard className="p-6 flex items-center gap-5">
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400 shadow-md">
            <FileText size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Smart Notes</span>
            <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1 leading-none">{summary?.totalNotes || 0}</h4>
          </div>
        </GlassCard>

        {/* Total Documents */}
        <GlassCard className="p-6 flex items-center gap-5">
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400 shadow-md">
            <FolderOpen size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Smart Documents</span>
            <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1 leading-none">{summary?.totalDocuments || 0}</h4>
          </div>
        </GlassCard>

        {/* Productivity Score */}
        <GlassCard className="p-6 flex items-center gap-5">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 dark:text-green-400 shadow-md">
            <TrendingUp size={24} />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Productivity Score</span>
            <div className="flex items-center gap-2 mt-1">
              <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-none">{summary?.productivityScore || 40}%</h4>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-500 dark:text-green-400">Stable</span>
            </div>
          </div>
        </GlassCard>

        {/* AI Suggestions Action */}
        <GlassCard 
          onClick={() => setChatOpen(true)}
          className="p-6 flex items-center gap-5 border border-slate-200 dark:border-cyberBlue/20 hover:border-cyberBlue/50 cursor-pointer group"
        >
          <div className="p-4 rounded-xl bg-gradient-to-tr from-neonPurple to-cyberBlue text-white shadow-lg animate-float">
            <BrainCircuit size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">AI Memory Engine</span>
            <span className="text-xs font-bold text-cyberBlue mt-1 flex items-center gap-1 group-hover:text-cyberBlue/80 dark:group-hover:text-white transition-colors">
              Ask Brain <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Main Grid: Left column (Activity & Notes), Right column (Actions & Files) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Activity & Quick Notes */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Quick Note creation box */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide mb-4 flex items-center gap-2">
              <Plus size={16} className="text-purple-450 dark:text-purple-400" /> Quick Add Note
            </h3>
            <form onSubmit={handleQuickNoteSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Note Title"
                value={quickNoteTitle}
                onChange={(e) => setQuickNoteTitle(e.target.value)}
                required
                className="input-cyber py-2.5 text-xs"
              />
              <textarea
                placeholder="Start typing your note contents... AI will automatically categorize, tag and summarize it on save."
                value={quickNoteContent}
                onChange={(e) => setQuickNoteContent(e.target.value)}
                rows={3}
                className="input-cyber py-2.5 text-xs"
              />
              <button 
                type="submit"
                disabled={!quickNoteTitle.trim()}
                className="btn-cyber py-2 px-4 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 ml-auto"
              >
                Create note
              </button>
            </form>
          </GlassCard>

          {/* Activity Timeline logs */}
          <GlassCard className="p-6 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide mb-4 flex items-center gap-2">
              <Activity size={16} className="text-cyan-500 dark:text-cyan-400" /> Brain Activity Timeline
            </h3>
            
            <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-4 scroll-custom">
              {!summary?.timeline || summary.timeline.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-12">No activity logged yet. Create a note or upload a file to begin!</p>
              ) : (
                summary.timeline.map((log) => (
                  <div key={log.id} className="flex gap-4 items-start text-xs relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-[-20px] before:w-[1px] before:bg-slate-200 dark:before:bg-slate-800 last:before:hidden">
                    <div className="absolute left-[3px] top-[7px] w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900 border-2 border-cyberBlue"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold text-slate-850 dark:text-slate-200">{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-[9px] text-slate-500 font-medium flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Recent Files & Notes list */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Actions Panel */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => navigate('/notes')}
                className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 hover:bg-purple-500/5 text-slate-600 dark:text-slate-300 hover:text-purple-650 dark:hover:text-white transition-all duration-200 group"
              >
                <Plus size={16} className="text-purple-500 dark:text-purple-400 group-hover:scale-110" />
                <span className="font-bold text-[10px]">New Note</span>
              </button>
              <button
                onClick={() => navigate('/documents')}
                className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-500/5 text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-white transition-all duration-200 group"
              >
                <Upload size={16} className="text-cyan-500 dark:text-cyan-400 group-hover:scale-110" />
                <span className="font-bold text-[10px]">Upload File</span>
              </button>
            </div>
          </GlassCard>

          {/* Recent Notes list */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">Recent Notes</h3>
              <button onClick={() => navigate('/notes')} className="text-[10px] text-cyberBlue hover:underline font-bold">View all</button>
            </div>
            
            <div className="space-y-3">
              {!summary?.recentNotes || summary.recentNotes.length === 0 ? (
                <p className="text-[11px] text-slate-500 py-4 text-center">No notes found.</p>
              ) : (
                summary.recentNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => navigateToNote(note)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/30 hover:bg-slate-200/50 dark:hover:bg-slate-900/70 hover:border-purple-500/30 cursor-pointer flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-purple-650 dark:group-hover:text-purple-300">{note.title}</h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 mt-1.5 inline-block font-semibold uppercase">{note.category}</span>
                    </div>
                    <ArrowRight size={12} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-800 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Recent Files list */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">Recent Files</h3>
              <button onClick={() => navigate('/documents')} className="text-[10px] text-cyberBlue hover:underline font-bold">View all</button>
            </div>
            
            <div className="space-y-3">
              {!summary?.recentDocuments || summary.recentDocuments.length === 0 ? (
                <p className="text-[11px] text-slate-500 py-4 text-center">No documents uploaded.</p>
              ) : (
                summary.recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => navigateToDoc(doc)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/30 hover:bg-slate-200/50 dark:hover:bg-slate-900/70 hover:border-cyan-500/30 cursor-pointer flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-cyan-500 dark:group-hover:text-cyan-300">{doc.fileName}</h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 mt-1.5 inline-block font-semibold uppercase">{doc.aiCategory}</span>
                    </div>
                    <ArrowRight size={12} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-800 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
