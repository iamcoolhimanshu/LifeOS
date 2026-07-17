import { create } from 'zustand';
import api from '../utils/api';
import { Goal } from '../types';

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  createGoal: (goalData: { title: string; description?: string; targetDate?: string; progress?: number; status?: string; category?: string }) => Promise<Goal | null>;
  updateGoal: (id: number, goalData: Partial<Omit<Goal, 'id' | 'createdAt'>>) => Promise<Goal | null>;
  deleteGoal: (id: number) => Promise<boolean>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Goal[]>('/goals');
      set({ goals: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: 'Failed to fetch goals', isLoading: false });
    }
  },

  createGoal: async (goalData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Goal>('/goals', goalData);
      const newGoal = response.data;
      set((state) => ({
        goals: [...state.goals, newGoal],
        isLoading: false,
      }));
      return newGoal;
    } catch (err: any) {
      set({ error: 'Failed to create goal', isLoading: false });
      return null;
    }
  },

  updateGoal: async (id, goalData) => {
    set({ isLoading: true, error: null });
    try {
      const existing = get().goals.find((g) => g.id === id);
      if (!existing) throw new Error("Goal not found");

      const merged = { ...existing, ...goalData };
      const response = await api.put<Goal>(`/goals/${id}`, merged);
      const updatedGoal = response.data;
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? updatedGoal : g)),
        isLoading: false,
      }));
      return updatedGoal;
    } catch (err: any) {
      set({ error: 'Failed to update goal', isLoading: false });
      return null;
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/goals/${id}`);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: 'Failed to delete goal', isLoading: false });
      return false;
    }
  },
}));
