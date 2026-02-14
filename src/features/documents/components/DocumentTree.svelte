<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "@/lib/router";
  import { Plus } from "lucide-svelte";
  import {
    documents,
  } from "@/features/documents/store/document-store";
  import { activeWorkspaceId } from "@/features/workspace/store/workspace-store";
  import * as db from "@/lib/tauri/database";
  import DocumentTreeItem from "./DocumentTreeItem.svelte";

  export let activeDocumentId: string | null = null;

  async function loadDocuments() {
    if (!$activeWorkspaceId) return;
    const docs = await db.listDocuments($activeWorkspaceId);
    documents.set(docs);
  }

  onMount(() => {
    loadDocuments();
  });

  $: if ($activeWorkspaceId) {
    loadDocuments();
  }

  async function handleNewPage() {
    if (!$activeWorkspaceId) return;
    const id = crypto.randomUUID();
    await db.createDocument(id, $activeWorkspaceId, "Untitled");
    await loadDocuments();
    navigate(`/workspace/${id}`);
  }

  $: rootDocs = $documents.filter((d) => d.parent_id === null);
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center justify-between px-3 py-2">
    <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Documents
    </span>
    <button
      class="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      title="New Page"
      on:click={handleNewPage}
    >
      <Plus class="h-4 w-4" />
    </button>
  </div>
  <div class="flex-1 overflow-auto px-1">
    {#if rootDocs.length === 0}
      <div class="flex h-full items-center justify-center">
        <p class="px-4 text-center text-xs text-muted-foreground">
          No documents yet. Click + to create one.
        </p>
      </div>
    {:else}
      <div class="space-y-0.5">
        {#each rootDocs as doc (doc.id)}
          <DocumentTreeItem
            {doc}
            depth={0}
            onReload={loadDocuments}
            {activeDocumentId}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>
