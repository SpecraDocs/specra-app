import { writable } from "svelte/store";

export const activeDocumentId = writable<string | null>(null);
export const isSaving = writable(false);
export const hasUnsavedChanges = writable(false);
export const metadataPanelOpen = writable(false);

export function setActiveDocument(id: string | null) {
  activeDocumentId.set(id);
}

export function setMetadataPanelOpen(open: boolean) {
  metadataPanelOpen.set(open);
}
