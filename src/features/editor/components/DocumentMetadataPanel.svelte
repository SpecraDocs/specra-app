<script lang="ts">
  import { onMount } from "svelte";
  import { X } from "lucide-svelte";
  import { setMetadataPanelOpen } from "../store/editor-store";
  import * as db from "@/lib/tauri/database";
  import type { Document } from "@/features/documents/store/document-store";

  export let documentId: string;

  let doc: Document | null = null;
  let description = "";
  let slug = "";
  let tags = "";
  let position = "";
  let draft = false;

  $: if (documentId) {
    db.getDocument(documentId).then((d) => {
      if (d) {
        doc = d;
        description = d.description ?? "";
        slug = d.slug ?? "";
        tags = d.tags ?? "";
        position = d.sidebar_position?.toString() ?? "";
        draft = d.draft;
      }
    });
  }

  async function handleSave(field: string, value: string | boolean | number) {
    await db.updateDocument(documentId, { [field]: value });
  }

  function handlePositionBlur() {
    const num = parseInt(position, 10);
    if (!isNaN(num)) handleSave("sidebar_position", num);
  }

  function toggleDraft() {
    draft = !draft;
    handleSave("draft", draft);
  }
</script>

{#if doc}
  <div class="w-72 border-l border-border bg-sidebar">
    <div class="flex items-center justify-between border-b border-border px-4 py-2">
      <span class="text-sm font-medium text-foreground">Properties</span>
      <button
        class="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
        on:click={() => setMetadataPanelOpen(false)}
      >
        <X class="h-4 w-4" />
      </button>
    </div>
    <div class="space-y-4 p-4">
      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">
          Description
        </label>
        <textarea
          class="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          rows={3}
          bind:value={description}
          on:blur={() => handleSave("description", description)}
          placeholder="Page description..."
        />
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">
          URL Slug
        </label>
        <input
          class="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          bind:value={slug}
          on:blur={() => handleSave("slug", slug)}
          placeholder="custom-slug"
        />
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">
          Tags
        </label>
        <input
          class="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          bind:value={tags}
          on:blur={() => handleSave("tags", tags)}
          placeholder="setup, quickstart"
        />
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">
          Sidebar Position
        </label>
        <input
          type="number"
          class="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          bind:value={position}
          on:blur={handlePositionBlur}
          placeholder="0"
        />
      </div>
      <div class="flex items-center justify-between">
        <label class="text-xs font-medium text-muted-foreground">
          Draft
        </label>
        <button
          class="relative h-5 w-9 rounded-full transition-colors {draft ? 'bg-primary' : 'bg-muted'}"
          on:click={toggleDraft}
        >
          <span
            class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform {draft ? 'translate-x-4' : ''}"
          />
        </button>
      </div>
    </div>
  </div>
{/if}
