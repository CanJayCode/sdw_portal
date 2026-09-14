import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthInfo, User } from '@/types/api';

interface AuthState {
  user: User | null;
  auth: AuthInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, auth: AuthInfo, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      auth: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setSession: (user, auth, accessToken, refreshToken) =>
        set({ user, auth, accessToken, refreshToken, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      logout: () =>
        set({
          user: null,
          auth: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'cesa-sdw-auth', // localStorage key
    }
  )
);
