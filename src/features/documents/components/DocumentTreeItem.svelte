<script lang="ts">
  import { navigate } from "@/lib/router";
  import {
    ChevronRight,
    ChevronDown,
    FileText,
    Folder,
    MoreHorizontal,
    Trash2,
    Copy,
    Edit3,
    FolderPlus,
  } from "lucide-svelte";
  import {
    documents,
    expandedIds,
    toggleExpanded,
  } from "@/features/documents/store/document-store";
  import { cn } from "@/shared/utils/cn";
  import * as db from "@/lib/tauri/database";
  import type { Document } from "@/features/documents/store/document-store";

  export let doc: Document;
  export let depth: number;
  export let onReload: () => Promise<void>;
  export let activeDocumentId: string | null = null;

  let isEditing = false;
  let editTitle = doc.title;
  let showMenu = false;
  let inputRef: HTMLInputElement;

  $: children = $documents.filter((d) => d.parent_id === doc.id);
  $: hasChildren = children.length > 0 || doc.is_folder;
  $: isExpanded = $expandedIds.has(doc.id);
  $: isActive = activeDocumentId === doc.id;

  function handleClick() {
    if (hasChildren) toggleExpanded(doc.id);
    navigate(`/workspace/${doc.id}`);
  }

  async function handleRename() {
    if (editTitle.trim() && editTitle !== doc.title) {
      await db.updateDocument(doc.id, { title: editTitle.trim() });
      await onReload();
    }
    isEditing = false;
  }

  async function handleDelete() {
    await db.deleteDocument(doc.id);
    await onReload();
    if (activeDocumentId === doc.id) navigate("/workspace");
  }

  async function handleAddSubPage() {
    const workspaceId = doc.workspace_id;
    const id = crypto.randomUUID();
    await db.createDocument(id, workspaceId, "Untitled", doc.id);
    if (!isExpanded) toggleExpanded(doc.id);
    await onReload();
    navigate(`/workspace/${id}`);
    showMenu = false;
  }

  async function handleDuplicate() {
    const id = crypto.randomUUID();
    await db.createDocument(id, doc.workspace_id, `${doc.title} (copy)`, doc.parent_id);
    const original = await db.getDocument(doc.id);
    if (original) {
      await db.updateDocument(id, { content: original.content });
    }
    await onReload();
    showMenu = false;
  }

  function handleToggleExpand(e: MouseEvent) {
    e.stopPropagation();
    toggleExpanded(doc.id);
  }

  function handleMenuToggle(e: MouseEvent) {
    e.stopPropagation();
    showMenu = !showMenu;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") handleRename();
    if (e.key === "Escape") isEditing = false;
  }

  function startRename() {
    isEditing = true;
    editTitle = doc.title;
    showMenu = false;
  }
</script>

<div>
  <div
    class={cn(
      "group flex items-center rounded-md py-1 pr-1 text-sm transition-colors",
      isActive
        ? "bg-accent text-accent-foreground"
        : "text-sidebar-foreground hover:bg-accent/50"
    )}
    style="padding-left: {depth * 12 + 4}px"
  >
    {#if hasChildren}
      <button
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-accent"
        on:click={handleToggleExpand}
      >
        {#if isExpanded}
          <ChevronDown class="h-3.5 w-3.5" />
        {:else}
          <ChevronRight class="h-3.5 w-3.5" />
        {/if}
      </button>
    {:else}
      <span class="flex h-5 w-5 shrink-0 items-center justify-center">
        <FileText class="h-3.5 w-3.5 text-muted-foreground" />
      </span>
    {/if}

    {#if isEditing}
      <input
        bind:this={inputRef}
        class="ml-1 flex-1 rounded border border-border bg-background px-1 py-0.5 text-sm outline-none"
        bind:value={editTitle}
        on:blur={handleRename}
        on:keydown={handleKeydown}
        autofocus
      />
    {:else}
      <button
        class="ml-1 flex-1 truncate text-left"
        on:click={handleClick}
        on:dblclick={startRename}
      >
        {#if doc.is_folder}<Folder class="mr-1.5 inline h-3.5 w-3.5" />{/if}
        {doc.title}
      </button>
    {/if}

    <div class="relative">
      <button
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent"
        on:click={handleMenuToggle}
      >
        <MoreHorizontal class="h-3.5 w-3.5" />
      </button>
      {#if showMenu}
        <div
          class="absolute right-0 top-6 z-50 w-40 rounded-md border border-border bg-popover py-1 shadow-md"
          on:mouseleave={() => (showMenu = false)}
        >
          <button
            class="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
            on:click={startRename}
          >
            <Edit3 class="h-3 w-3" /> Rename
          </button>
          <button
            class="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
            on:click={handleDuplicate}
          >
            <Copy class="h-3 w-3" /> Duplicate
          </button>
          <button
            class="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
            on:click={handleAddSubPage}
          >
            <FolderPlus class="h-3 w-3" /> Add sub-page
          </button>
          <div class="my-1 border-t border-border" />
          <button
            class="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-accent"
            on:click={() => { handleDelete(); showMenu = false; }}
          >
            <Trash2 class="h-3 w-3" /> Delete
          </button>
        </div>
      {/if}
    </div>
  </div>

  {#if isExpanded && children.length > 0}
    <div>
      {#each children as child (child.id)}
        <svelte:self
          doc={child}
          depth={depth + 1}
          {onReload}
          {activeDocumentId}
        />
      {/each}
    </div>
  {/if}
</div>
