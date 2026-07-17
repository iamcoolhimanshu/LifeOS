import { create } from 'zustand';
import api from '../utils/api';
import { Document } from '../types';

interface DocState {
  documents: Document[];
  activeDocument: Document | null;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  selectDocument: (doc: Document | null) => void;
  uploadDocument: (file: File) => Promise<Document | null>;
  deleteDocument: (id: number) => Promise<boolean>;
  downloadDocument: (id: number, fileName: string) => Promise<void>;
}

export const useDocStore = create<DocState>((set, get) => ({
  documents: [],
  activeDocument: null,
  isLoading: false,
  isUploading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Document[]>('/documents');
      set({ documents: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: 'Failed to fetch documents', isLoading: false });
    }
  },

  selectDocument: (doc) => {
    set({ activeDocument: doc });
  },

  uploadDocument: async (file) => {
    set({ isUploading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<Document>('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newDoc = response.data;
      set((state) => ({
        documents: [newDoc, ...state.documents],
        isUploading: false,
      }));
      return newDoc;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to upload document.',
        isUploading: false,
      });
      return null;
    }
  },

  deleteDocument: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/documents/${id}`);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
        activeDocument: state.activeDocument?.id === id ? null : state.activeDocument,
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: 'Failed to delete document', isLoading: false });
      return false;
    }
  },

  downloadDocument: async (id, fileName) => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob',
      });
      
      // Create url and download trigger
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      set({ error: 'Failed to download file' });
    }
  },
}));
