import { useCallback, useRef, useEffect } from "react";
import { useEditorStore } from "../store/editor-store";
import * as db from "@/lib/tauri/database";

export function useAutoSave(documentId: string | undefined) {
  const setSaving = useEditorStore((s) => s.setSaving);
  const setHasUnsavedChanges = useEditorStore((s) => s.setHasUnsavedChanges);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = useRef<string | null>(null);

  const save = useCallback(
    async (content: string) => {
      if (!documentId) return;
      setSaving(true);
      try {
        // Simple hash for change detection
        const contentHash = await hashContent(content);
        await db.updateDocument(documentId, {
          content,
          content_hash: contentHash,
        });
        setHasUnsavedChanges(false);
      } finally {
        setSaving(false);
      }
    },
    [documentId, setSaving, setHasUnsavedChanges]
  );

  const debouncedSave = useCallback(
    (content: string) => {
      latestContentRef.current = content;
      setHasUnsavedChanges(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (latestContentRef.current !== null) {
          save(latestContentRef.current);
        }
      }, 1500);
    },
    [save, setHasUnsavedChanges]
  );

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (latestContentRef.current !== null && documentId) {
        save(latestContentRef.current);
      }
    };
  }, [documentId, save]);

  return debouncedSave;
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
