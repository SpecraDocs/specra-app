import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { schema } from "../config/editor-schema";
import { useAutoSave } from "../hooks/useAutoSave";
import { useEditorStore } from "../store/editor-store";
import { useDocumentStore } from "@/features/documents/store/document-store";
import * as db from "@/lib/tauri/database";
import { DocumentMetadataPanel } from "./DocumentMetadataPanel";
import { Save, Settings2 } from "lucide-react";

export function EditorPage() {
  const { documentId } = useParams();
  const [title, setTitle] = useState("Untitled");
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isSaving = useEditorStore((s) => s.isSaving);
  const hasUnsavedChanges = useEditorStore((s) => s.hasUnsavedChanges);
  const metadataPanelOpen = useEditorStore((s) => s.metadataPanelOpen);
  const setMetadataPanelOpen = useEditorStore((s) => s.setMetadataPanelOpen);
  const setActiveDocument = useEditorStore((s) => s.setActiveDocument);
  const updateDocumentInStore = useDocumentStore((s) => s.updateDocument);
  const debouncedSave = useAutoSave(documentId);

  // Load document
  useEffect(() => {
    setActiveDocument(documentId ?? null);
    setIsLoaded(false);

    if (!documentId) return;

    db.getDocument(documentId).then((doc) => {
      if (doc) {
        setTitle(doc.title);
        setInitialContent(doc.content);
      }
      setIsLoaded(true);
    });

    return () => setActiveDocument(null);
  }, [documentId, setActiveDocument]);

  const editor = useCreateBlockNote({
    schema,
    initialContent: useMemo(() => {
      if (!initialContent) return undefined;
      try {
        const parsed = JSON.parse(initialContent);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
      } catch {
        return undefined;
      }
    }, [initialContent]),
  });

  const handleEditorChange = useCallback(() => {
    if (!editor || !documentId) return;
    const content = JSON.stringify(editor.document);
    debouncedSave(content);
  }, [editor, documentId, debouncedSave]);

  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      setTitle(newTitle);
      if (documentId) {
        await db.updateDocument(documentId, { title: newTitle });
        updateDocumentInStore(documentId, { title: newTitle });
      }
    },
    [documentId, updateDocumentInStore]
  );

  if (!documentId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a document to start editing
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col overflow-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving && (
              <>
                <Save className="h-3 w-3 animate-pulse" />
                <span>Saving...</span>
              </>
            )}
            {!isSaving && hasUnsavedChanges && <span>Unsaved changes</span>}
            {!isSaving && !hasUnsavedChanges && <span>Saved</span>}
          </div>
          <button
            className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => setMetadataPanelOpen(!metadataPanelOpen)}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Properties
          </button>
        </div>

        {/* Title */}
        <div className="mx-auto w-full max-w-3xl px-8 pt-12">
          <input
            className="w-full bg-transparent text-4xl font-bold text-foreground outline-none placeholder:text-muted-foreground/50"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
          />
        </div>

        {/* Editor */}
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
          <BlockNoteView
            editor={editor}
            onChange={handleEditorChange}
            theme="light"
          />
        </div>
      </div>

      {/* Metadata panel */}
      {metadataPanelOpen && documentId && (
        <DocumentMetadataPanel documentId={documentId} />
      )}
    </div>
  );
}
