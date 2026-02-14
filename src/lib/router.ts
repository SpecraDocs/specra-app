import { writable, derived } from "svelte/store";

export const currentPath = writable(window.location.hash.slice(1) || "/workspace");

// Parse route params from path
export const routeParams = derived(currentPath, ($path) => {
  const params: Record<string, string> = {};

  if ($path.startsWith("/workspace/")) {
    params.documentId = $path.slice("/workspace/".length);
  } else if ($path.startsWith("/projects/")) {
    params.projectId = $path.slice("/projects/".length);
  } else if ($path.startsWith("/organizations/")) {
    params.orgId = $path.slice("/organizations/".length);
  }

  return params;
});

export function navigate(path: string) {
  window.location.hash = path;
  currentPath.set(path);
}

// Listen for hash changes (back/forward buttons)
window.addEventListener("hashchange", () => {
  currentPath.set(window.location.hash.slice(1) || "/workspace");
});
