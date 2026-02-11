import { create } from "zustand";

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  remote_project_id?: string;
  remote_org_id?: string;
  created_at: string;
  updated_at: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (id: string | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  removeWorkspace: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  workspaces: [],
  activeWorkspaceId: null,
  isLoading: false,
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  addWorkspace: (workspace) =>
    set((s) => ({ workspaces: [...s.workspaces, workspace] })),
  updateWorkspace: (id, updates) =>
    set((s) => ({
      workspaces: s.workspaces.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),
  removeWorkspace: (id) =>
    set((s) => ({
      workspaces: s.workspaces.filter((w) => w.id !== id),
      activeWorkspaceId:
        s.activeWorkspaceId === id ? null : s.activeWorkspaceId,
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
