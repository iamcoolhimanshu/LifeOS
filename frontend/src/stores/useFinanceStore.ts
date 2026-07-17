import { create } from 'zustand';
import api from '../utils/api';
import { Transaction } from '../types';

interface FinanceState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  createTransaction: (txData: { description: string; amount: number; type: 'INCOME' | 'EXPENSE'; category?: string; date: string }) => Promise<Transaction | null>;
  updateTransaction: (id: number, txData: { description: string; amount: number; type: 'INCOME' | 'EXPENSE'; category?: string; date: string }) => Promise<Transaction | null>;
  deleteTransaction: (id: number) => Promise<boolean>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Transaction[]>('/finances');
      set({ transactions: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: 'Failed to fetch financial ledger', isLoading: false });
    }
  },

  createTransaction: async (txData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Transaction>('/finances', txData);
      const newTx = response.data;
      set((state) => ({
        transactions: [newTx, ...state.transactions],
        isLoading: false,
      }));
      return newTx;
    } catch (err: any) {
      set({ error: 'Failed to log transaction', isLoading: false });
      return null;
    }
  },

  updateTransaction: async (id, txData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<Transaction>(`/finances/${id}`, txData);
      const updatedTx = response.data;
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? updatedTx : t)),
        isLoading: false,
      }));
      return updatedTx;
    } catch (err: any) {
      set({ error: 'Failed to update transaction details', isLoading: false });
      return null;
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/finances/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: 'Failed to delete transaction', isLoading: false });
      return false;
    }
  },
}));
