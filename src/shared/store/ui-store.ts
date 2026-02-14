import { writable } from "svelte/store";

export type Theme = "light" | "dark" | "system";
export type ActivityView = "documents" | "projects" | "settings";

function createPersistedStore<T>(key: string, initial: T) {
  const stored = localStorage.getItem(key);
  const value = stored ? JSON.parse(stored) : initial;
  const store = writable<T>(value);
  store.subscribe((v) => localStorage.setItem(key, JSON.stringify(v)));
  return store;
}

export const theme = createPersistedStore<Theme>("specra-ui-theme", "system");
export const sidebarOpen = createPersistedStore<boolean>("specra-ui-sidebar", true);
export const activeView = createPersistedStore<ActivityView>("specra-ui-view", "documents");
export const commandPaletteOpen = writable(false);

export function setTheme(value: Theme) {
  theme.set(value);
}

export function setCommandPaletteOpen(open: boolean) {
  commandPaletteOpen.set(open);
}

export function toggleSidebar() {
  sidebarOpen.update((v) => !v);
}

export function setActiveView(view: ActivityView) {
  activeView.set(view);
}
