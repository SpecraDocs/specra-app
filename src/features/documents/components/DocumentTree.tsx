import { useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, ChevronRight, ChevronDown, FileText, Folder, MoreHorizontal, Trash2, Copy, Edit3, FolderPlus } from "lucide-react";
import { useDocumentStore } from "@/features/documents/store/document-store";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import { cn } from "@/shared/utils/cn";
import * as db from "@/lib/tauri/database";
import { useState, useRef } from "react";

export function DocumentTree() {
  const documents = useDocumentStore((s) => s.documents);
  const setDocuments = useDocumentStore((s) => s.setDocuments);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const navigate = useNavigate();

  const loadDocuments = useCallback(async () => {
    if (!activeWorkspaceId) return;
    const docs = await db.listDocuments(activeWorkspaceId);
    setDocuments(docs);
  }, [activeWorkspaceId, setDocuments]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleNewPage = async () => {
    if (!activeWorkspaceId) return;
    const id = crypto.randomUUID();
    await db.createDocument(id, activeWorkspaceId, "Untitled");
    await loadDocuments();
    navigate(`/workspace/${id}`);
  };

  const rootDocs = documents.filter((d) => d.parent_id === null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Documents
        </span>
        <button
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="New Page"
          onClick={handleNewPage}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto px-1">
        {rootDocs.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="px-4 text-center text-xs text-muted-foreground">
              No documents yet. Click + to create one.
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {rootDocs.map((doc) => (
              <DocumentTreeItem
                key={doc.id}
                doc={doc}
                depth={0}
                onReload={loadDocuments}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DocumentTreeItemProps {
  doc: import("@/features/documents/store/document-store").Document;
  depth: number;
  onReload: () => Promise<void>;
}

function DocumentTreeItem({ doc, depth, onReload }: DocumentTreeItemProps) {
  const documents = useDocumentStore((s) => s.documents);
  const expandedIds = useDocumentStore((s) => s.expandedIds);
  const toggleExpanded = useDocumentStore((s) => s.toggleExpanded);
  const navigate = useNavigate();
  const { documentId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(doc.title);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const children = documents.filter((d) => d.parent_id === doc.id);
  const hasChildren = children.length > 0 || doc.is_folder;
  const isExpanded = expandedIds.has(doc.id);
  const isActive = documentId === doc.id;

  const handleClick = () => {
    if (hasChildren) toggleExpanded(doc.id);
    navigate(`/workspace/${doc.id}`);
  };

  const handleRename = async () => {
    if (editTitle.trim() && editTitle !== doc.title) {
      await db.updateDocument(doc.id, { title: editTitle.trim() });
      await onReload();
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await db.deleteDocument(doc.id);
    await onReload();
    if (documentId === doc.id) navigate("/workspace");
  };

  const handleAddSubPage = async () => {
    const workspaceId = doc.workspace_id;
    const id = crypto.randomUUID();
    await db.createDocument(id, workspaceId, "Untitled", doc.id);
    if (!isExpanded) toggleExpanded(doc.id);
    await onReload();
    navigate(`/workspace/${id}`);
    setShowMenu(false);
  };

  const handleDuplicate = async () => {
    const id = crypto.randomUUID();
    await db.createDocument(id, doc.workspace_id, `${doc.title} (copy)`, doc.parent_id);
    const original = await db.getDocument(doc.id);
    if (original) {
      await db.updateDocument(id, { content: original.content });
    }
    await onReload();
    setShowMenu(false);
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center rounded-md py-1 pr-1 text-sm transition-colors",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-sidebar-foreground hover:bg-accent/50"
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        {hasChildren ? (
          <button
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(doc.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
        )}

        {isEditing ? (
          <input
            ref={inputRef}
            className="ml-1 flex-1 rounded border border-border bg-background px-1 py-0.5 text-sm outline-none"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setIsEditing(false);
            }}
            autoFocus
          />
        ) : (
          <button
            className="ml-1 flex-1 truncate text-left"
            onClick={handleClick}
            onDoubleClick={() => {
              setIsEditing(true);
              setEditTitle(doc.title);
            }}
          >
            {doc.is_folder && <Folder className="mr-1.5 inline h-3.5 w-3.5" />}
            {doc.title}
          </button>
        )}

        <div className="relative">
          <button
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-6 z-50 w-40 rounded-md border border-border bg-popover py-1 shadow-md"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
                onClick={() => {
                  setIsEditing(true);
                  setEditTitle(doc.title);
                  setShowMenu(false);
                }}
              >
                <Edit3 className="h-3 w-3" /> Rename
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
                onClick={handleDuplicate}
              >
                <Copy className="h-3 w-3" /> Duplicate
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
                onClick={handleAddSubPage}
              >
                <FolderPlus className="h-3 w-3" /> Add sub-page
              </button>
              <div className="my-1 border-t border-border" />
              <button
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-accent"
                onClick={() => {
                  handleDelete();
                  setShowMenu(false);
                }}
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <DocumentTreeItem
              key={child.id}
              doc={child}
              depth={depth + 1}
              onReload={onReload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
