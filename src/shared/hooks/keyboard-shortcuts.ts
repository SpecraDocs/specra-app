import { get } from "svelte/store";
import { sidebarOpen } from "@/shared/store/ui-store";
import { activeWorkspaceId } from "@/features/workspace/store/workspace-store";
import * as db from "@/lib/tauri/database";
import { navigate } from "@/lib/router";

export function setupKeyboardShortcuts() {
  const handler = (e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;

    // Cmd+N: New document
    if (mod && e.key === "n") {
      e.preventDefault();
      const wsId = get(activeWorkspaceId);
      if (wsId) {
        const id = crypto.randomUUID();
        db.createDocument(id, wsId, "Untitled").then(() => {
          navigate(`/workspace/${id}`);
        });
      }
    }

    // Cmd+\: Toggle sidebar
    if (mod && e.key === "\\") {
      e.preventDefault();
      sidebarOpen.update((v) => !v);
    }

    // Cmd+P: Publish
    if (mod && e.key === "p") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("specra:open-publish"));
    }
  };

  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}
