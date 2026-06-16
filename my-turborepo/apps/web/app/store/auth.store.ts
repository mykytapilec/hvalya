'use client';

import { create } from 'zustand';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: (token) => {
    Cookies.set('token', token, { expires: 7 });
    set({ token });
  },
  logout: () => {
    Cookies.remove('token');
    set({ token: null });
  },
  init: () => {
    const token = Cookies.get('token') ?? null;
    set({ token });
  },
}));