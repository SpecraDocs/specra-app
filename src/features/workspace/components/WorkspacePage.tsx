import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import * as db from "@/lib/tauri/database";
import { Plus, FileText } from "lucide-react";

export function WorkspacePage() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    db.listWorkspaces().then((ws) => {
      setWorkspaces(ws);
      if (ws.length > 0 && !activeWorkspaceId) {
        setActiveWorkspace(ws[0].id);
      }
    });
  }, [setWorkspaces, setActiveWorkspace, activeWorkspaceId]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const id = crypto.randomUUID();
    await db.createWorkspace(id, newName.trim());
    const ws = await db.listWorkspaces();
    setWorkspaces(ws);
    setActiveWorkspace(id);
    setNewName("");
    setShowCreate(false);
  };

  if (workspaces.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-sm space-y-4 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            Create your first workspace
          </h2>
          <p className="text-sm text-muted-foreground">
            A workspace is a collection of documents that becomes a documentation site.
          </p>
          <div className="space-y-2">
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Workspace name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <button
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              onClick={handleCreate}
              disabled={!newName.trim()}
            >
              Create Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Welcome to Specra
        </h2>
        <p className="mt-2 text-muted-foreground">
          Select a document from the sidebar or create a new one to get started.
        </p>
        {showCreate ? (
          <div className="mx-auto mt-6 max-w-xs space-y-2">
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="New workspace name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                className="flex-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                Create
              </button>
              <button
                className="flex-1 rounded-md bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4" /> New Workspace
          </button>
        )}
      </div>
    </div>
  );
}
