import { create } from "zustand";

type DeployStatus =
  | "idle"
  | "preparing"
  | "uploading"
  | "queued"
  | "building"
  | "deploying"
  | "running"
  | "failed";

interface PublishState {
  status: DeployStatus;
  projectId: string | null;
  deploymentId: string | null;
  error: string | null;
  progress: number;
  siteUrl: string | null;
  setStatus: (status: DeployStatus) => void;
  setProjectId: (id: string | null) => void;
  setDeploymentId: (id: string | null) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  setSiteUrl: (url: string | null) => void;
  reset: () => void;
}

export const usePublishStore = create<PublishState>()((set) => ({
  status: "idle",
  projectId: null,
  deploymentId: null,
  error: null,
  progress: 0,
  siteUrl: null,
  setStatus: (status) => set({ status }),
  setProjectId: (projectId) => set({ projectId }),
  setDeploymentId: (deploymentId) => set({ deploymentId }),
  setError: (error) => set({ error }),
  setProgress: (progress) => set({ progress }),
  setSiteUrl: (siteUrl) => set({ siteUrl }),
  reset: () =>
    set({
      status: "idle",
      projectId: null,
      deploymentId: null,
      error: null,
      progress: 0,
      siteUrl: null,
    }),
}));
