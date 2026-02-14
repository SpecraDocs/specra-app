<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    isSaving,
    hasUnsavedChanges,
    metadataPanelOpen,
    setMetadataPanelOpen,
    setActiveDocument,
  } from "../store/editor-store";
  import { updateDocument as updateDocumentInStore } from "@/features/documents/store/document-store";
  import * as db from "@/lib/tauri/database";
  import DocumentMetadataPanel from "./DocumentMetadataPanel.svelte";
  import { Save, Settings2 } from "lucide-svelte";

  export let documentId: string | undefined = undefined;

  let title = "Untitled";
  let isLoaded = false;
  let editorContent = "";

  // Auto-save debounce
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  function debouncedSave(content: string) {
    if (saveTimeout) clearTimeout(saveTimeout);
    if (!documentId) return;
    saveTimeout = setTimeout(async () => {
      // Mark saving via store if needed
      await db.updateDocument(documentId!, { content });
    }, 500);
  }

  // Load document
  $: if (documentId) {
    setActiveDocument(documentId);
    isLoaded = false;
    db.getDocument(documentId).then((doc) => {
      if (doc) {
        title = doc.title;
        editorContent = doc.content ?? "";
      }
      isLoaded = true;
    });
  } else {
    setActiveDocument(null);
  }

  onDestroy(() => {
    setActiveDocument(null);
    if (saveTimeout) clearTimeout(saveTimeout);
  });

  async function handleTitleChange(e: Event) {
    const newTitle = (e.target as HTMLInputElement).value;
    title = newTitle;
    if (documentId) {
      await db.updateDocument(documentId, { title: newTitle });
      updateDocumentInStore(documentId, { title: newTitle });
    }
  }

  function handleEditorInput(e: Event) {
    const value = (e.target as HTMLTextAreaElement).value;
    editorContent = value;
    debouncedSave(value);
  }
</script>

{#if !documentId}
  <div class="flex h-full items-center justify-center text-muted-foreground">
    Select a document to start editing
  </div>
{:else if !isLoaded}
  <div class="flex h-full items-center justify-center text-muted-foreground">
    Loading...
  </div>
{:else}
  <div class="flex h-full">
    <div class="flex flex-1 flex-col overflow-auto">
      <!-- Toolbar -->
      <div class="flex items-center justify-between border-b border-border px-4 py-2">
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          {#if $isSaving}
            <Save class="h-3 w-3 animate-pulse" />
            <span>Saving...</span>
          {:else if $hasUnsavedChanges}
            <span>Unsaved changes</span>
          {:else}
            <span>Saved</span>
          {/if}
        </div>
        <button
          class="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          on:click={() => setMetadataPanelOpen(!$metadataPanelOpen)}
        >
          <Settings2 class="h-3.5 w-3.5" />
          Properties
        </button>
      </div>

      <!-- Title -->
      <div class="mx-auto w-full max-w-3xl px-8 pt-12">
        <input
          class="w-full bg-transparent text-4xl font-bold text-foreground outline-none placeholder:text-muted-foreground/50"
          value={title}
          on:input={handleTitleChange}
          placeholder="Untitled"
        />
      </div>

      <!-- Editor -->
      <!--
        TODO: Integrate a Svelte-compatible rich text editor here.
        @blocknote/react is React-specific and cannot be used directly.
        Consider using svelte-tiptap, tiptap with a Svelte wrapper,
        or another Svelte-native editor solution.

        For now, a basic textarea fallback is provided below.
      -->
      <div class="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <textarea
          class="h-full w-full resize-none rounded-md border border-input bg-background p-4 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
          value={editorContent}
          on:input={handleEditorInput}
          placeholder="Start writing your documentation..."
        />
      </div>
    </div>

    <!-- Metadata panel -->
    {#if $metadataPanelOpen && documentId}
      <DocumentMetadataPanel {documentId} />
    {/if}
  </div>
{/if}
