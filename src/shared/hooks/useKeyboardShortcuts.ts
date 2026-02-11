import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "@/shared/store/ui-store";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import * as db from "@/lib/tauri/database";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Cmd+N: New document
      if (mod && e.key === "n") {
        e.preventDefault();
        if (activeWorkspaceId) {
          const id = crypto.randomUUID();
          db.createDocument(id, activeWorkspaceId, "Untitled").then(() => {
            navigate(`/workspace/${id}`);
          });
        }
      }

      // Cmd+K: Command palette (handled in CommandPalette component)

      // Cmd+\: Toggle sidebar
      if (mod && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }

      // Cmd+P: Publish (open publish panel - handled via event)
      if (mod && e.key === "p") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("specra:open-publish"));
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [navigate, setCommandPaletteOpen, toggleSidebar, activeWorkspaceId]);
}
