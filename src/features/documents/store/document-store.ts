import { create } from "zustand";

export interface Document {
  id: string;
  workspace_id: string;
  parent_id: string | null;
  title: string;
  icon?: string;
  cover_image?: string;
  content: string;
  description?: string;
  sidebar_position?: number;
  tags?: string;
  draft: boolean;
  slug?: string;
  is_folder: boolean;
  folder_label?: string;
  created_at: string;
  updated_at: string;
  last_published_at?: string;
  content_hash?: string;
}

interface DocumentState {
  documents: Document[];
  expandedIds: Set<string>;
  isLoading: boolean;
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  toggleExpanded: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useDocumentStore = create<DocumentState>()((set) => ({
  documents: [],
  expandedIds: new Set<string>(),
  isLoading: false,
  setDocuments: (documents) => set({ documents }),
  addDocument: (document) =>
    set((s) => ({ documents: [...s.documents, document] })),
  updateDocument: (id, updates) =>
    set((s) => ({
      documents: s.documents.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),
  removeDocument: (id) =>
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
    })),
  toggleExpanded: (id) =>
    set((s) => {
      const next = new Set(s.expandedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedIds: next };
    }),
  setLoading: (isLoading) => set({ isLoading }),
}));
