import { create } from "zustand";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  apiUrl: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  apiUrl: "https://specra-docs.com",
  isAuthenticated: false,
  isLoading: false,
  setAuth: (token, user) =>
    set({ token, user, isAuthenticated: true }),
  clearAuth: () =>
    set({ token: null, user: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
