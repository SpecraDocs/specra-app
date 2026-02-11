import { create } from "zustand";

interface EditorState {
  activeDocumentId: string | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  metadataPanelOpen: boolean;
  setActiveDocument: (id: string | null) => void;
  setSaving: (saving: boolean) => void;
  setHasUnsavedChanges: (has: boolean) => void;
  setMetadataPanelOpen: (open: boolean) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  activeDocumentId: null,
  isSaving: false,
  hasUnsavedChanges: false,
  metadataPanelOpen: false,
  setActiveDocument: (id) => set({ activeDocumentId: id }),
  setSaving: (isSaving) => set({ isSaving }),
  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
  setMetadataPanelOpen: (open) => set({ metadataPanelOpen: open }),
}));
