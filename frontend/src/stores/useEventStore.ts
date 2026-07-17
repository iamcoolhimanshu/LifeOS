import { create } from 'zustand';
import api from '../utils/api';
import { Event } from '../types';

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  createEvent: (eventData: Omit<Event, 'id'>) => Promise<Event | null>;
  updateEvent: (id: number, eventData: Omit<Event, 'id'>) => Promise<Event | null>;
  deleteEvent: (id: number) => Promise<boolean>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Event[]>('/events');
      set({ events: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: 'Failed to fetch events', isLoading: false });
    }
  },

  createEvent: async (eventData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Event>('/events', eventData);
      const newEvent = response.data;
      set((state) => ({
        events: [...state.events, newEvent].sort((a, b) => a.startTime.localeCompare(b.startTime)),
        isLoading: false,
      }));
      return newEvent;
    } catch (err: any) {
      set({ error: 'Failed to create event', isLoading: false });
      return null;
    }
  },

  updateEvent: async (id, eventData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<Event>(`/events/${id}`, eventData);
      const updatedEvent = response.data;
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? updatedEvent : e)).sort((a, b) => a.startTime.localeCompare(b.startTime)),
        isLoading: false,
      }));
      return updatedEvent;
    } catch (err: any) {
      set({ error: 'Failed to update event', isLoading: false });
      return null;
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/events/${id}`);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: 'Failed to delete event', isLoading: false });
      return false;
    }
  },
}));
