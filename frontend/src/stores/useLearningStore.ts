import { create } from 'zustand';
import api from '../utils/api';
import { Learning } from '../types';

interface LearningState {
  learnings: Learning[];
  isLoading: boolean;
  error: string | null;
  fetchLearnings: () => Promise<void>;
  createLearning: (learningData: { topic: string; source?: string; status?: string; progress?: number; notes?: string }) => Promise<Learning | null>;
  updateLearning: (id: number, learningData: Partial<Omit<Learning, 'id' | 'createdAt'>>) => Promise<Learning | null>;
  deleteLearning: (id: number) => Promise<boolean>;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  learnings: [],
  isLoading: false,
  error: null,

  fetchLearnings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Learning[]>('/learnings');
      set({ learnings: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: 'Failed to fetch learning items', isLoading: false });
    }
  },

  createLearning: async (learningData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Learning>('/learnings', learningData);
      const newLearning = response.data;
      set((state) => ({
        learnings: [newLearning, ...state.learnings],
        isLoading: false,
      }));
      return newLearning;
    } catch (err: any) {
      set({ error: 'Failed to create learning item', isLoading: false });
      return null;
    }
  },

  updateLearning: async (id, learningData) => {
    set({ isLoading: true, error: null });
    try {
      const existing = get().learnings.find((l) => l.id === id);
      if (!existing) throw new Error("Learning item not found");

      const merged = { ...existing, ...learningData };
      const response = await api.put<Learning>(`/learnings/${id}`, merged);
      const updatedLearning = response.data;
      set((state) => ({
        learnings: state.learnings.map((l) => (l.id === id ? updatedLearning : l)),
        isLoading: false,
      }));
      return updatedLearning;
    } catch (err: any) {
      set({ error: 'Failed to update learning item', isLoading: false });
      return null;
    }
  },

  deleteLearning: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/learnings/${id}`);
      set((state) => ({
        learnings: state.learnings.filter((l) => l.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: 'Failed to delete learning item', isLoading: false });
      return false;
    }
  },
}));
