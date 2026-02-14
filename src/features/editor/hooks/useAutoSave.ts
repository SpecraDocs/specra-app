import { isSaving, hasUnsavedChanges } from "../store/editor-store";
import * as db from "@/lib/tauri/database";

let timeoutId: ReturnType<typeof setTimeout> | null = null;
let latestContent: string | null = null;

async function save(documentId: string, content: string) {
  isSaving.set(true);
  try {
    const contentHash = await hashContent(content);
    await db.updateDocument(documentId, {
      content,
      content_hash: contentHash,
    });
    hasUnsavedChanges.set(false);
  } finally {
    isSaving.set(false);
  }
}

export function debouncedSave(documentId: string, content: string, delay = 1500) {
  latestContent = content;
  hasUnsavedChanges.set(true);

  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    if (latestContent !== null) {
      save(documentId, latestContent);
    }
  }, delay);
}

export function flushSave(documentId: string) {
  if (timeoutId) clearTimeout(timeoutId);
  if (latestContent !== null) {
    save(documentId, latestContent);
    latestContent = null;
  }
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
