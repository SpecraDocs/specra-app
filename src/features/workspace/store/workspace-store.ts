import { writable } from "svelte/store";

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  remote_project_id?: string;
  remote_org_id?: string;
  created_at: string;
  updated_at: string;
}

export const workspaces = writable<Workspace[]>([]);
export const activeWorkspaceId = writable<string | null>(null);
export const workspacesLoading = writable(false);

export function addWorkspace(workspace: Workspace) {
  workspaces.update((ws) => [...ws, workspace]);
}

export function updateWorkspace(id: string, updates: Partial<Workspace>) {
  workspaces.update((ws) =>
    ws.map((w) => (w.id === id ? { ...w, ...updates } : w))
  );
}

export function removeWorkspace(id: string) {
  workspaces.update((ws) => ws.filter((w) => w.id !== id));
  activeWorkspaceId.update((active) => (active === id ? null : active));
}
