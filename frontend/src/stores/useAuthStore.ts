import { create } from 'zustand';
import api from '../utils/api';
import { LoginRequest, SignupRequest, JwtResponse, User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userDetails: SignupRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize state from session storage
  const storedUser = sessionStorage.getItem('user');
  const storedToken = sessionStorage.getItem('token');

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,

    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.post<JwtResponse>('/auth/signin', credentials);
        const { accessToken, refreshToken, id, username, email, role } = response.data;
        
        const userData: User = { id, username, email, role };

        sessionStorage.setItem('token', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('user', JSON.stringify(userData));

        set({
          user: userData,
          token: accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } catch (err: any) {
        set({
          error: err.response?.data?.message || 'Invalid username or password.',
          isLoading: false,
        });
        return false;
      }
    },

    register: async (userDetails) => {
      set({ isLoading: true, error: null });
      try {
        await api.post('/auth/signup', userDetails);
        set({ isLoading: false });
        return true;
      } catch (err: any) {
        set({
          error: err.response?.data?.message || 'Registration failed. Try again.',
          isLoading: false,
        });
        return false;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await api.post('/auth/signout');
      } catch (e) {
        // Safe to ignore, clean session storage anyway
      } finally {
        sessionStorage.clear();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },

    clearError: () => set({ error: null }),
  };
});
