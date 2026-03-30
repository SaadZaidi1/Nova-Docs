import { create } from 'zustand';
import type { User } from '../types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

/**
 * Zustand auth store with localStorage persistence for the JWT token.
 * Manages user state and provides login/logout actions.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('ajaia_token'),

  login: (user: User, token: string) => {
    localStorage.setItem('ajaia_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('ajaia_token');
    set({ user: null, token: null });
  },

  setUser: (user: User) => {
    set({ user });
  },
}));
