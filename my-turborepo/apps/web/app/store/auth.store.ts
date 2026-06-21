'use client';

import { create } from 'zustand';
import Cookies from 'js-cookie';
import { decodeToken } from '../lib/jwt';

export type UserRole = 'LISTENER' | 'ARTIST' | 'ADMIN';

interface AuthState {
  token: string | null;
  userId: string | null;
  role: UserRole | null;
  setToken: (token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  role: null,

  setToken: (token) => {
    Cookies.set('token', token, { expires: 7 });
    const decoded = decodeToken(token);
    set({ token, userId: decoded?.sub ?? null, role: decoded?.role ?? null });
  },

  logout: () => {
    Cookies.remove('token');
    set({ token: null, userId: null, role: null });
  },

  init: () => {
    const token = Cookies.get('token') ?? null;
    const decoded = token ? decodeToken(token) : null;
    set({ token, userId: decoded?.sub ?? null, role: decoded?.role ?? null });
  },
}));