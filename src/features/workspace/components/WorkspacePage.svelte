<script lang="ts">
  import { onMount } from "svelte";
  import { workspaces, activeWorkspaceId } from "@/features/workspace/store/workspace-store";
  import * as db from "@/lib/tauri/database";
  import { Plus, FileText } from "lucide-svelte";

  let newName = "";
  let showCreate = false;

  onMount(async () => {
    const ws = await db.listWorkspaces();
    workspaces.set(ws);
    if (ws.length > 0 && !$activeWorkspaceId) {
      activeWorkspaceId.set(ws[0].id);
    }
  });

  async function handleCreate() {
    if (!newName.trim()) return;
    const id = crypto.randomUUID();
    await db.createWorkspace(id, newName.trim());
    const ws = await db.listWorkspaces();
    workspaces.set(ws);
    activeWorkspaceId.set(id);
    newName = "";
    showCreate = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") handleCreate();
  }
</script>

{#if $workspaces.length === 0}
  <div class="flex h-full items-center justify-center">
    <div class="w-full max-w-sm space-y-4 text-center">
      <FileText class="mx-auto h-12 w-12 text-muted-foreground" />
      <h2 class="text-xl font-semibold text-foreground">
        Create your first workspace
      </h2>
      <p class="text-sm text-muted-foreground">
        A workspace is a collection of documents that becomes a documentation site.
      </p>
      <div class="space-y-2">
        <input
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Workspace name..."
          bind:value={newName}
          on:keydown={handleKeydown}
          autofocus
        />
        <button
          class="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          on:click={handleCreate}
          disabled={!newName.trim()}
        >
          Create Workspace
        </button>
      </div>
    </div>
  </div>
{:else}
  <div class="flex h-full items-center justify-center">
    <div class="text-center">
      <h2 class="text-2xl font-semibold text-foreground">
        Welcome to Specra
      </h2>
      <p class="mt-2 text-muted-foreground">
        Select a document from the sidebar or create a new one to get started.
      </p>
      {#if showCreate}
        <div class="mx-auto mt-6 max-w-xs space-y-2">
          <input
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="New workspace name..."
            bind:value={newName}
            on:keydown={handleKeydown}
            autofocus
          />
          <div class="flex gap-2">
            <button
              class="flex-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              on:click={handleCreate}
              disabled={!newName.trim()}
            >
              Create
            </button>
            <button
              class="flex-1 rounded-md bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              on:click={() => (showCreate = false)}
            >
              Cancel
            </button>
          </div>
        </div>
      {:else}
        <button
          class="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          on:click={() => (showCreate = true)}
        >
          <Plus class="h-4 w-4" /> New Workspace
        </button>
      {/if}
    </div>
  </div>
{/if}
