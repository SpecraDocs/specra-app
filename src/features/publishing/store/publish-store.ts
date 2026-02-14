import { writable } from "svelte/store";

export type DeployStatus =
  | "idle"
  | "preparing"
  | "uploading"
  | "queued"
  | "building"
  | "deploying"
  | "running"
  | "failed";

export const publishStatus = writable<DeployStatus>("idle");
export const publishProjectId = writable<string | null>(null);
export const publishDeploymentId = writable<string | null>(null);
export const publishError = writable<string | null>(null);
export const publishProgress = writable(0);
export const publishSiteUrl = writable<string | null>(null);

export function resetPublish() {
  publishStatus.set("idle");
  publishProjectId.set(null);
  publishDeploymentId.set(null);
  publishError.set(null);
  publishProgress.set(0);
  publishSiteUrl.set(null);
}

// Aliases used by components
export { publishStatus as status };
export { publishError as error };
export { publishProjectId as projectId };
export { publishSiteUrl as siteUrl };
export const reset = resetPublish;

export function setStatus(s: DeployStatus) {
  publishStatus.set(s);
}

export function setProjectId(id: string) {
  publishProjectId.set(id);
}

export function setDeploymentId(id: string) {
  publishDeploymentId.set(id);
}

export function setError(msg: string) {
  publishError.set(msg);
}

export function setSiteUrl(url: string) {
  publishSiteUrl.set(url);
}
