import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Pin, 
  Archive, 
  Star, 
  Trash2, 
  Sparkles, 
  Save, 
  Plus, 
  CornerDownRight,
  RefreshCw,
  Folder,
  Tag
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useNoteStore } from '../stores/useNoteStore';
import { Note } from '../types';
import api from '../utils/api';

export const Notes: React.FC = () => {
  const {
    notes,
    archivedNotes,
    favoriteNotes,
    activeNote,
    isLoading,
    fetchNotes,
    fetchArchivedNotes,
    fetchFavoriteNotes,
    selectNote,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    toggleFavorite,
    enhanceNoteAI,
  } = useNoteStore();

  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'favorite'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Note editor states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isRecLoading, setIsRecLoading] = useState(false);

  useEffect(() => {
    const fetchRecs = async () => {
      if (!activeNote) {
        setRecommendations([]);
        return;
      }
      setIsRecLoading(true);
      try {
        const response = await api.get(`/recommendations?id=${activeNote.id}&type=note`);
        setRecommendations(response.data);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setIsRecLoading(false);
      }
    };
    fetchRecs();
  }, [activeNote]);

  useEffect(() => {
    fetchNotes();
    fetchArchivedNotes();
    fetchFavoriteNotes();
  }, [fetchNotes, fetchArchivedNotes, fetchFavoriteNotes]);

  // Sync editor fields with active note selection
  useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content || '');
      setEditCategory(activeNote.category || 'Personal');
      setEditTags(activeNote.tags || '');
    } else {
      setEditTitle('');
      setEditContent('');
      setEditCategory('');
      setEditTags('');
    }
  }, [activeNote]);

  const getNotesList = () => {
    let source = notes;
    if (activeTab === 'archived') source = archivedNotes;
    if (activeTab === 'favorite') source = favoriteNotes;

    if (!searchQuery.trim()) return source;
    const query = searchQuery.toLowerCase();
    return source.filter((n) => 
      n.title.toLowerCase().includes(query) || 
      n.content?.toLowerCase().includes(query) ||
      n.category?.toLowerCase().includes(query) ||
      n.tags?.toLowerCase().includes(query)
    );
  };

  const handleCreateNew = async () => {
    const newNote = await createNote({
      title: 'Untitled Note',
      content: '',
      category: 'Personal',
      tags: '',
    });
    if (newNote) {
      selectNote(newNote);
    }
  };

  const handleSave = async () => {
    if (!activeNote) return;
    await updateNote(activeNote.id, {
      title: editTitle.trim() || 'Untitled Note',
      content: editContent,
      category: editCategory.trim(),
      tags: editTags.trim(),
    });
  };

  const handleAIEnhance = async () => {
    if (!activeNote) return;
    setIsAiLoading(true);
    await enhanceNoteAI(activeNote.id);
    setIsAiLoading(false);
  };

  const currentNotesList = getNotesList();

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 overflow-hidden">
      
      {/* Left Pane: Notes List & Tabs */}
      <GlassCard className="w-80 flex flex-col h-full border border-darkBorder" hoverEffect={false}>
        
        {/* Actions header */}
        <div className="p-4 border-b border-darkBorder flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Filter notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-cyberBlue/40"
            />
          </div>
          <button
            onClick={handleCreateNew}
            title="Create New Note"
            className="p-2.5 bg-gradient-to-tr from-neonPurple to-cyberBlue text-white rounded-xl shadow-md active:scale-95 transition-transform"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-darkBorder/40 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'active' 
                ? 'border-cyberBlue text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-900/10' 
                : 'border-transparent hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('favorite')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'favorite' 
                ? 'border-cyberBlue text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-900/10' 
                : 'border-transparent hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'archived' 
                ? 'border-cyberBlue text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-900/10' 
                : 'border-transparent hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Archived
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scroll-custom">
          {isLoading && currentNotesList.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-6 w-6 border-2 border-cyberBlue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : currentNotesList.length === 0 ? (
            <p className="text-[11px] text-slate-500 py-12 text-center">No notes found matching filters.</p>
          ) : (
            currentNotesList.map((note) => (
              <div
                key={note.id}
                onClick={() => selectNote(note)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  activeNote?.id === note.id
                    ? 'bg-gradient-to-r from-neonPurple/10 to-cyberBlue/5 border-cyberBlue text-slate-800 dark:text-white'
                    : 'bg-slate-100/50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-900/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-100 hover:border-slate-350 dark:hover:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-bold truncate flex-1">{note.title}</h4>
                  <div className="flex gap-1 items-center shrink-0">
                    {note.pinned && <Pin size={10} className="text-cyberBlue fill-cyberBlue/10" />}
                    {note.favorite && <Star size={10} className="text-yellow-400 fill-yellow-400/10" />}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                  {note.content ? note.content.replace(/<[^>]+>/g, '').trim() : 'Empty note'}
                </p>
                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide uppercase bg-slate-250 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                    {note.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Right Pane: Note Editor Workspace */}
      <GlassCard className="flex-1 flex flex-col h-full border border-darkBorder" hoverEffect={false}>
        {!activeNote ? (
          <div className="flex-1 flex flex-col justify-center items-center text-slate-500 text-xs">
            <FileText className="text-slate-700 mb-3 animate-float" size={48} />
            <p>Select a note from the left sidebar or create a new note to start editing</p>
            <button
              onClick={handleCreateNew}
              className="btn-cyber py-2 px-4 text-xs font-bold text-white mt-4 flex items-center gap-1.5"
            >
              <Plus size={14} /> Create a note
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Editor Top Bar controls */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-darkBorder flex items-center justify-between flex-wrap gap-4 bg-slate-100/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-2">
                {/* Pin button */}
                <button
                  onClick={() => togglePin(activeNote.id)}
                  title="Pin Note"
                  className={`p-2 rounded-lg border transition-colors ${
                    activeNote.pinned 
                      ? 'bg-cyberBlue/10 border-cyberBlue text-cyberBlue' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Pin size={13} />
                </button>
                {/* Favorite button */}
                <button
                  onClick={() => toggleFavorite(activeNote.id)}
                  title="Add to Favorites"
                  className={`p-2 rounded-lg border transition-colors ${
                    activeNote.favorite
                      ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Star size={13} />
                </button>
                {/* Archive button */}
                <button
                  onClick={() => toggleArchive(activeNote.id)}
                  title="Archive Note"
                  className={`p-2 rounded-lg border transition-colors ${
                    activeNote.archived
                      ? 'bg-green-500/10 border-green-500 text-green-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Archive size={13} />
                </button>
                {/* Delete button */}
                <button
                  onClick={() => deleteNote(activeNote.id)}
                  title="Delete Note"
                  className="p-2 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Utility Save & AI buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleAIEnhance}
                  disabled={isAiLoading || !editContent.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyberBlue hover:border-cyberBlue/40 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-inner hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {isAiLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  <span>AI Enhance</span>
                </button>

                <button
                  onClick={handleSave}
                  className="btn-cyber py-2 px-4 rounded-xl text-xs font-bold text-white flex items-center gap-2"
                >
                  <Save size={13} />
                  <span>Save Note</span>
                </button>
              </div>
            </div>

            {/* Note Editor Fields */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-custom">
              
              {/* Category and Tags input row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Folder size={10} /> Category
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="Personal, Work, Coding..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-855 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyberBlue/40 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Tag size={10} /> Tags
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="Comma-separated (e.g. java, spring, cv)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-855 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyberBlue/40 transition"
                  />
                </div>
              </div>

              {/* Title input */}
              <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note Title"
                    className="w-full bg-transparent border-none text-xl font-extrabold text-slate-800 dark:text-white placeholder-slate-450 dark:placeholder-slate-600 focus:outline-none focus:ring-0 tracking-wide"
                  />

                  {/* Rich-text content textarea */}
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Start writing notes here..."
                    rows={12}
                    className="w-full bg-transparent border-none text-slate-700 dark:text-slate-200 placeholder-slate-450 dark:placeholder-slate-600 focus:outline-none focus:ring-0 text-sm leading-relaxed scroll-custom"
                    style={{ resize: 'none' }}
                  />

              {/* AI Generated summary output panel */}
              {activeNote.aiSummary && (
                <div className="mt-8 pt-6 border-t border-darkBorder/40">
                  <h4 className="text-[10px] font-extrabold tracking-widest text-cyberBlue uppercase flex items-center gap-1.5 mb-3">
                    <Sparkles size={11} /> AI Memory Summary
                  </h4>
                  <div className="p-4 rounded-xl bg-cyberBlue/5 border border-cyberBlue/10 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
                    {activeNote.aiSummary.split('\n').map((line, idx) => (
                      <p key={idx} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{__html: line.replace(/###/g, '').trim()}}></p>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </GlassCard>

      {/* Rightmost Pane: Related Recommendations */}
      {activeNote && (
        <GlassCard className="w-64 flex flex-col h-full border border-darkBorder" hoverEffect={false}>
          <div className="p-4 border-b border-slate-200 dark:border-darkBorder flex items-center gap-2">
            <Sparkles className="text-cyberBlue" size={14} />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Related Context</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-custom">
            {isRecLoading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="animate-spin text-cyberBlue" size={16} />
              </div>
            ) : recommendations.length === 0 ? (
              <p className="text-[10px] text-slate-500 py-12 text-center">No related context suggestions found.</p>
            ) : (
              recommendations.map((rec: any) => {
                const isNote = rec.type === 'note';
                return (
                  <div
                    key={rec.id}
                    onClick={() => {
                      if (isNote) {
                        const numericId = parseInt(rec.id.replace('note_', ''));
                        const found = notes.find(n => n.id === numericId);
                        if (found) selectNote(found);
                      } else {
                        alert(`This document is stored in Documents: ${rec.title}`);
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-150 dark:bg-slate-900/35 border border-slate-200 dark:border-slate-900/40 hover:border-slate-350 dark:hover:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-900/60 cursor-pointer transition duration-150"
                  >
                    <div className="flex items-start gap-2">
                      {isNote ? (
                        <FileText className="text-purple-400 shrink-0 mt-0.5" size={12} />
                      ) : (
                        <Folder className="text-cyan-400 shrink-0 mt-0.5" size={12} />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{rec.title}</h4>
                        <span className="text-[9px] text-slate-500 block capitalize mt-0.5">{rec.category}</span>
                        {rec.matchReason && (
                          <span className="text-[8px] text-cyberBlue font-semibold block mt-1.5 leading-snug">
                            {rec.matchReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>
      )}

    </div>
  );
};
