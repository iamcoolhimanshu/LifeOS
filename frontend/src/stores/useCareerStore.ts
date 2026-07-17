import { create } from 'zustand';
import api from '../utils/api';
import { JobApplication } from '../types';

interface CareerState {
  applications: JobApplication[];
  isLoading: boolean;
  error: string | null;
  fetchApplications: () => Promise<void>;
  createApplication: (appData: { company: string; role: string; status?: string; salary?: string; url?: string; notes?: string; appliedDate?: string }) => Promise<JobApplication | null>;
  updateApplication: (id: number, appData: Partial<Omit<JobApplication, 'id' | 'createdAt'>>) => Promise<JobApplication | null>;
  deleteApplication: (id: number) => Promise<boolean>;
}

export const useCareerStore = create<CareerState>((set, get) => ({
  applications: [],
  isLoading: false,
  error: null,

  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<JobApplication[]>('/careers');
      set({ applications: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: 'Failed to fetch job applications', isLoading: false });
    }
  },

  createApplication: async (appData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<JobApplication>('/careers', appData);
      const newApp = response.data;
      set((state) => ({
        applications: [newApp, ...state.applications],
        isLoading: false,
      }));
      return newApp;
    } catch (err: any) {
      set({ error: 'Failed to create job application', isLoading: false });
      return null;
    }
  },

  updateApplication: async (id, appData) => {
    set({ isLoading: true, error: null });
    try {
      const existing = get().applications.find((a) => a.id === id);
      if (!existing) throw new Error("Application not found");

      const merged = { ...existing, ...appData };
      const response = await api.put<JobApplication>(`/careers/${id}`, merged);
      const updatedApp = response.data;
      set((state) => ({
        applications: state.applications.map((a) => (a.id === id ? updatedApp : a)),
        isLoading: false,
      }));
      return updatedApp;
    } catch (err: any) {
      set({ error: 'Failed to update job application', isLoading: false });
      return null;
    }
  },

  deleteApplication: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/careers/${id}`);
      set((state) => ({
        applications: state.applications.filter((a) => a.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: 'Failed to delete job application', isLoading: false });
      return false;
    }
  },
}));
