import { create } from 'zustand';
import api from '../utils/api';
import { UniversalSearchResult, ChatMessage } from '../types';

interface SearchState {
  searchResults: UniversalSearchResult[];
  isSearchOpen: boolean;
  isChatOpen: boolean;
  chatMessages: ChatMessage[];
  isSearchLoading: boolean;
  isChatLoading: boolean;
  error: string | null;
  
  setSearchOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  searchBrain: (query: string) => Promise<void>;
  askChatbot: (question: string) => Promise<void>;
  clearSearch: () => void;
  clearChat: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchResults: [],
  isSearchOpen: false,
  isChatOpen: false,
  chatMessages: [
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I'm **LifeOS AI**, your Personal Digital Brain assistant. I can search through all your notes, analyze files, summarize work, and answer questions. Try asking: *'Summarize today's work'* or *'Where is my resume?'*",
      timestamp: new Date()
    }
  ],
  isSearchLoading: false,
  isChatLoading: false,
  error: null,

  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setChatOpen: (open) => set({ isChatOpen: open }),

  searchBrain: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearchLoading: true, error: null });
    try {
      const response = await api.get<UniversalSearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
      set({ searchResults: response.data, isSearchLoading: false });
    } catch (err: any) {
      set({ error: 'Universal Search failed', isSearchLoading: false });
    }
  },

  askChatbot: async (question) => {
    if (!question.trim()) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: question,
      timestamp: new Date()
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMessage],
      isChatLoading: true,
      error: null
    }));

    try {
      const response = await api.post<{ message: string }>('/search/chat', { question });
      
      const aiMessage: ChatMessage = {
        id: Math.random().toString(),
        sender: 'ai',
        text: response.data.message,
        timestamp: new Date()
      };

      set((state) => ({
        chatMessages: [...state.chatMessages, aiMessage],
        isChatLoading: false
      }));
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: Math.random().toString(),
        sender: 'ai',
        text: "I encountered an error trying to connect to your brain data. Make sure the Spring Boot backend server is active and try again.",
        timestamp: new Date()
      };
      set((state) => ({
        chatMessages: [...state.chatMessages, errorMessage],
        isChatLoading: false
      }));
    }
  },

  clearSearch: () => set({ searchResults: [] }),
  
  clearChat: () => set({
    chatMessages: [
      {
        id: 'welcome',
        sender: 'ai',
        text: "Hello! I'm **LifeOS AI**, your Personal Digital Brain assistant. I can search through all your notes, analyze files, summarize work, and answer questions. Try asking: *'Summarize today's work'* or *'Where is my resume?'*",
        timestamp: new Date()
      }
    ]
  })
}));
