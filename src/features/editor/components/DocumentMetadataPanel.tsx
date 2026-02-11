import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useEditorStore } from "../store/editor-store";
import * as db from "@/lib/tauri/database";
import type { Document } from "@/features/documents/store/document-store";

interface Props {
  documentId: string;
}

export function DocumentMetadataPanel({ documentId }: Props) {
  const setMetadataPanelOpen = useEditorStore((s) => s.setMetadataPanelOpen);
  const [doc, setDoc] = useState<Document | null>(null);
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState("");
  const [position, setPosition] = useState("");
  const [draft, setDraft] = useState(false);

  useEffect(() => {
    db.getDocument(documentId).then((d) => {
      if (d) {
        setDoc(d);
        setDescription(d.description ?? "");
        setSlug(d.slug ?? "");
        setTags(d.tags ?? "");
        setPosition(d.sidebar_position?.toString() ?? "");
        setDraft(d.draft);
      }
    });
  }, [documentId]);

  const handleSave = async (field: string, value: string | boolean | number) => {
    await db.updateDocument(documentId, { [field]: value });
  };

  if (!doc) return null;

  return (
    <div className="w-72 border-l border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-foreground">Properties</span>
        <button
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => setMetadataPanelOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4 p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Description
          </label>
          <textarea
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => handleSave("description", description)}
            placeholder="Page description..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            URL Slug
          </label>
          <input
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onBlur={() => handleSave("slug", slug)}
            placeholder="custom-slug"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Tags
          </label>
          <input
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            onBlur={() => handleSave("tags", tags)}
            placeholder="setup, quickstart"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Sidebar Position
          </label>
          <input
            type="number"
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            onBlur={() => {
              const num = parseInt(position, 10);
              if (!isNaN(num)) handleSave("sidebar_position", num);
            }}
            placeholder="0"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            Draft
          </label>
          <button
            className={`relative h-5 w-9 rounded-full transition-colors ${
              draft ? "bg-primary" : "bg-muted"
            }`}
            onClick={() => {
              const newDraft = !draft;
              setDraft(newDraft);
              handleSave("draft", newDraft);
            }}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                draft ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
