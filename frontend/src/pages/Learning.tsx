import React, { useEffect, useState } from 'react';
import { useLearningStore } from '../stores/useLearningStore';
import { GlassCard } from '../components/GlassCard';
import { GraduationCap, Plus, ExternalLink, BookOpen, Trash2, Edit3, X, CheckCircle, Clock } from 'lucide-react';
import { Learning as LearningType } from '../types';

export const Learning: React.FC = () => {
  const { learnings, isLoading, fetchLearnings, createLearning, updateLearning, deleteLearning } = useLearningStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLearning, setSelectedLearning] = useState<LearningType | null>(null);

  // Form states
  const [topic, setTopic] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState<'TO_LEARN' | 'LEARNING' | 'COMPLETED'>('TO_LEARN');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchLearnings();
  }, [fetchLearnings]);

  const openNewLearningModal = () => {
    setSelectedLearning(null);
    setTopic('');
    setSource('');
    setStatus('TO_LEARN');
    setProgress(0);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditLearningModal = (item: LearningType) => {
    setSelectedLearning(item);
    setTopic(item.topic);
    setSource(item.source || '');
    setStatus(item.status);
    setProgress(item.progress);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      topic,
      source,
      status,
      progress,
      notes
    };

    if (selectedLearning) {
      await updateLearning(selectedLearning.id, data);
    } else {
      await createLearning(data);
    }
    setIsModalOpen(false);
  };

  const handleDeleteLearning = async (id: number) => {
    if (confirm('Are you sure you want to delete this study topic?')) {
      await deleteLearning(id);
      setIsModalOpen(false);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-450';
      case 'LEARNING': return 'bg-cyan-500/10 text-cyan-455';
      default: return 'bg-slate-200 dark:bg-slate-800 text-slate-500';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-wide uppercase flex items-center gap-2">
            <GraduationCap className="text-purple-500 dark:text-purple-400" size={24} /> Learning Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Catalog lectures, tutorial courses, readings, and your notes guides.</p>
        </div>
        <button
          onClick={openNewLearningModal}
          className="btn-cyber py-2 px-4 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={14} /> Add Resource
        </button>
      </div>

      {/* Main Container */}
      <div className="space-y-4">
        {learnings.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-xs text-slate-500">No study logs created yet. Register a resource topic or syllabus plan to start!</p>
          </GlassCard>
        ) : (
          learnings.map(item => (
            <GlassCard key={item.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${getStatusBadge(item.status)}`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                  {item.source && (
                    <a
                      href={item.source.startsWith('http') ? item.source : `https://${item.source}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 dark:text-purple-400 hover:underline flex items-center gap-0.5 font-bold"
                    >
                      Source <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                
                <h3 className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.topic}</h3>
                {item.notes && (
                  <p className="text-[11px] text-slate-650 dark:text-slate-400 line-clamp-2">{item.notes}</p>
                )}
              </div>

              {/* Progress visual slider */}
              <div className="flex items-center gap-6 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-850/50">
                <div className="text-[10px] text-right space-y-1">
                  <span className="text-slate-500 block">Progress</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{item.progress}%</span>
                </div>
                <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
                  <div style={{ width: `${item.progress}%` }} className="h-full bg-cyan-400" />
                </div>

                <button
                  onClick={() => openEditLearningModal(item)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 transition"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <GlassCard className="w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 dark:hover:text-white transition"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <GraduationCap size={16} className="text-purple-500" />
              {selectedLearning ? 'Edit Study Topic' : 'Add Course / Book'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Topic / Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js App Router Masterclass"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="input-cyber text-xs py-2.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Reference Link / URL</label>
                <input
                  type="text"
                  placeholder="e.g. udemy.com/course/nextjs..."
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  className="input-cyber text-xs py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Study Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="input-cyber text-xs py-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  >
                    <option value="TO_LEARN">TO LEARN</option>
                    <option value="LEARNING">LEARNING</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Progress ({progress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={e => setProgress(Number(e.target.value))}
                    className="w-full mt-3 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Study Notes & Logs</label>
                <textarea
                  placeholder="Paste outlines, course logs, summaries..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  className="input-cyber text-xs py-2.5"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-850">
                {selectedLearning ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteLearning(selectedLearning.id)}
                    className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-bold"
                  >
                    <Trash2 size={14} /> Remove Resource
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-cyber py-2 px-5 rounded-xl text-xs font-bold text-white"
                  >
                    {selectedLearning ? 'Save Changes' : 'Create Log'}
                  </button>
                </div>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
