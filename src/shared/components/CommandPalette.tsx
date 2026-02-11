import { useEffect, useCallback } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "@/shared/store/ui-store";
import { useDocumentStore } from "@/features/documents/store/document-store";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import * as db from "@/lib/tauri/database";
import {
  FileText,
  Plus,
  Upload,
  Settings,
  Sun,
  Moon,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const documents = useDocumentStore((s) => s.documents);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const navigate = useNavigate();

  // Cmd+K to toggle
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const handleSelect = useCallback(
    (value: string) => {
      setOpen(false);

      if (value.startsWith("doc:")) {
        navigate(`/workspace/${value.replace("doc:", "")}`);
      } else if (value === "new-doc") {
        if (activeWorkspaceId) {
          const id = crypto.randomUUID();
          db.createDocument(id, activeWorkspaceId, "Untitled").then(() => {
            navigate(`/workspace/${id}`);
          });
        }
      } else if (value === "settings") {
        navigate("/settings");
      } else if (value === "projects") {
        navigate("/projects");
      } else if (value === "theme-light") {
        setTheme("light");
      } else if (value === "theme-dark") {
        setTheme("dark");
      } else if (value === "theme-system") {
        setTheme("system");
      } else if (value === "toggle-sidebar") {
        toggleSidebar();
      }
    },
    [navigate, setOpen, activeWorkspaceId, setTheme, toggleSidebar]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />
      <Command
        className="relative w-full max-w-lg rounded-xl border border-border bg-popover shadow-2xl"
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Command.Input
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search documents, actions..."
            autoFocus
          />
        </div>
        <Command.List className="max-h-80 overflow-auto p-2">
          <Command.Empty className="px-4 py-8 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          {documents.length > 0 && (
            <Command.Group heading="Documents" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
              {documents.map((doc) => (
                <Command.Item
                  key={doc.id}
                  value={`doc:${doc.id}`}
                  onSelect={handleSelect}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {doc.title}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <Command.Item
              value="new-doc"
              onSelect={handleSelect}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
              New Document
            </Command.Item>
            <Command.Item
              value="settings"
              onSelect={handleSelect}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Open Settings
            </Command.Item>
            <Command.Item
              value="projects"
              onSelect={handleSelect}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
            >
              <Upload className="h-4 w-4 text-muted-foreground" />
              View Projects
            </Command.Item>
            <Command.Item
              value="toggle-sidebar"
              onSelect={handleSelect}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
              ) : (
                <PanelLeftOpen className="h-4 w-4 text-muted-foreground" />
              )}
              Toggle Sidebar
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Theme" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <Command.Item
              value="theme-light"
              onSelect={handleSelect}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
            >
              <Sun className="h-4 w-4 text-muted-foreground" />
              Light Theme
            </Command.Item>
            <Command.Item
              value="theme-dark"
              onSelect={handleSelect}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
            >
              <Moon className="h-4 w-4 text-muted-foreground" />
              Dark Theme
            </Command.Item>
            <Command.Item
              value="theme-system"
              onSelect={handleSelect}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
            >
              <Monitor className="h-4 w-4 text-muted-foreground" />
              System Theme
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
