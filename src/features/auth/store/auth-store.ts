import { writable, derived } from "svelte/store";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

export const token = writable<string | null>(null);
export const user = writable<AuthUser | null>(null);
export const apiUrl = writable("https://specra-docs.com");
export const authLoading = writable(false);

export const isAuthenticated = derived(token, ($token) => $token !== null);

export function setAuth(newToken: string, newUser: AuthUser) {
  token.set(newToken);
  user.set(newUser);
}

export function clearAuth() {
  token.set(null);
  user.set(null);
}
