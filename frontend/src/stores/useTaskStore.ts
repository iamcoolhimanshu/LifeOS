import { create } from 'zustand';
import api from '../utils/api';
import { Task } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: { title: string; description?: string; dueDate?: string; priority?: string; status?: string; category?: string }) => Promise<Task | null>;
  updateTask: (id: number, taskData: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<Task | null>;
  deleteTask: (id: number) => Promise<boolean>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Task[]>('/tasks');
      set({ tasks: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: 'Failed to fetch tasks', isLoading: false });
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Task>('/tasks', taskData);
      const newTask = response.data;
      set((state) => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
      }));
      return newTask;
    } catch (err: any) {
      set({ error: 'Failed to create task', isLoading: false });
      return null;
    }
  },

  updateTask: async (id, taskData) => {
    set({ isLoading: true, error: null });
    try {
      // Get the existing task to merge partial details
      const existing = get().tasks.find((t) => t.id === id);
      if (!existing) throw new Error("Task not found");
      
      const merged = { ...existing, ...taskData };
      const response = await api.put<Task>(`/tasks/${id}`, merged);
      const updatedTask = response.data;
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        isLoading: false,
      }));
      return updatedTask;
    } catch (err: any) {
      set({ error: 'Failed to update task', isLoading: false });
      return null;
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/tasks/${id}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: 'Failed to delete task', isLoading: false });
      return false;
    }
  },
}));
