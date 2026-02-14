import { writable, get } from "svelte/store";

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

export const documents = writable<Document[]>([]);
export const expandedIds = writable<Set<string>>(new Set());
export const documentsLoading = writable(false);

export function addDocument(doc: Document) {
  documents.update((docs) => [...docs, doc]);
}

export function updateDocument(id: string, updates: Partial<Document>) {
  documents.update((docs) =>
    docs.map((d) => (d.id === id ? { ...d, ...updates } : d))
  );
}

export function removeDocument(id: string) {
  documents.update((docs) => docs.filter((d) => d.id !== id));
}

export function toggleExpanded(id: string) {
  expandedIds.update((ids) => {
    const next = new Set(ids);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}
