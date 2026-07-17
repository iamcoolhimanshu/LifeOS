import { create } from 'zustand';
import api from '../utils/api';
import { Note } from '../types';

interface NoteState {
  notes: Note[];
  archivedNotes: Note[];
  favoriteNotes: Note[];
  activeNote: Note | null;
  isLoading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  fetchArchivedNotes: () => Promise<void>;
  fetchFavoriteNotes: () => Promise<void>;
  selectNote: (note: Note | null) => void;
  createNote: (noteData: { title: string; content: string; category?: string; tags?: string }) => Promise<Note | null>;
  updateNote: (id: number, noteData: { title: string; content: string; category?: string; tags?: string }) => Promise<Note | null>;
  deleteNote: (id: number) => Promise<boolean>;
  togglePin: (id: number) => Promise<void>;
  toggleArchive: (id: number) => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;
  enhanceNoteAI: (id: number) => Promise<Note | null>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  archivedNotes: [],
  favoriteNotes: [],
  activeNote: null,
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Note[]>('/notes');
      set({ notes: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: 'Failed to fetch notes', isLoading: false });
    }
  },

  fetchArchivedNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Note[]>('/notes/archived');
      set({ archivedNotes: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: 'Failed to fetch archived notes', isLoading: false });
    }
  },

  fetchFavoriteNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Note[]>('/notes/favorites');
      set({ favoriteNotes: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: 'Failed to fetch favorite notes', isLoading: false });
    }
  },

  selectNote: (note) => {
    set({ activeNote: note });
  },

  createNote: async (noteData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Note>('/notes', noteData);
      const newNote = response.data;
      set((state) => ({
        notes: [newNote, ...state.notes],
        activeNote: newNote,
        isLoading: false,
      }));
      return newNote;
    } catch (err: any) {
      set({ error: 'Failed to create note', isLoading: false });
      return null;
    }
  },

  updateNote: async (id, noteData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<Note>(`/notes/${id}`, noteData);
      const updatedNote = response.data;
      set((state) => {
        const updatedNotes = state.notes.map((n) => (n.id === id ? updatedNote : n));
        const updatedFavs = state.favoriteNotes.map((n) => (n.id === id ? updatedNote : n));
        const updatedArchs = state.archivedNotes.map((n) => (n.id === id ? updatedNote : n));
        return {
          notes: updatedNotes,
          favoriteNotes: updatedFavs,
          archivedNotes: updatedArchs,
          activeNote: state.activeNote?.id === id ? updatedNote : state.activeNote,
          isLoading: false,
        };
      });
      return updatedNote;
    } catch (err: any) {
      set({ error: 'Failed to update note', isLoading: false });
      return null;
    }
  },

  deleteNote: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/notes/${id}`);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        favoriteNotes: state.favoriteNotes.filter((n) => n.id !== id),
        archivedNotes: state.archivedNotes.filter((n) => n.id !== id),
        activeNote: state.activeNote?.id === id ? null : state.activeNote,
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: 'Failed to delete note', isLoading: false });
      return false;
    }
  },

  togglePin: async (id) => {
    try {
      const response = await api.patch<Note>(`/notes/${id}/pin`);
      const updatedNote = response.data;
      set((state) => {
        // Find if in notes list and re-sort
        const updatedNotes = state.notes.map((n) => (n.id === id ? updatedNote : n))
          .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        return {
          notes: updatedNotes,
          activeNote: state.activeNote?.id === id ? updatedNote : state.activeNote,
        };
      });
    } catch (err: any) {
      set({ error: 'Failed to toggle pin' });
    }
  },

  toggleArchive: async (id) => {
    try {
      const response = await api.patch<Note>(`/notes/${id}/archive`);
      const updatedNote = response.data;
      set((state) => {
        const isArchivedNow = updatedNote.archived;
        
        let newNotes = state.notes;
        let newArchived = state.archivedNotes;

        if (isArchivedNow) {
          newNotes = state.notes.filter((n) => n.id !== id);
          newArchived = [updatedNote, ...state.archivedNotes];
        } else {
          newNotes = [updatedNote, ...state.notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
          newArchived = state.archivedNotes.filter((n) => n.id !== id);
        }

        return {
          notes: newNotes,
          archivedNotes: newArchived,
          activeNote: state.activeNote?.id === id ? null : state.activeNote,
        };
      });
    } catch (err: any) {
      set({ error: 'Failed to toggle archive' });
    }
  },

  toggleFavorite: async (id) => {
    try {
      const response = await api.patch<Note>(`/notes/${id}/favorite`);
      const updatedNote = response.data;
      set((state) => {
        const isFavNow = updatedNote.favorite;
        
        const newNotes = state.notes.map((n) => (n.id === id ? updatedNote : n));
        let newFavs = state.favoriteNotes;

        if (isFavNow) {
          newFavs = [updatedNote, ...state.favoriteNotes];
        } else {
          newFavs = state.favoriteNotes.filter((n) => n.id !== id);
        }

        return {
          notes: newNotes,
          favoriteNotes: newFavs,
          activeNote: state.activeNote?.id === id ? updatedNote : state.activeNote,
        };
      });
    } catch (err: any) {
      set({ error: 'Failed to toggle favorite' });
    }
  },

  enhanceNoteAI: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Note>(`/notes/${id}/enhance`);
      const enhancedNote = response.data;
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? enhancedNote : n)),
        activeNote: state.activeNote?.id === id ? enhancedNote : state.activeNote,
        isLoading: false,
      }));
      return enhancedNote;
    } catch (err: any) {
      set({ error: 'Failed to enhance note using AI', isLoading: false });
      return null;
    }
  },
}));
