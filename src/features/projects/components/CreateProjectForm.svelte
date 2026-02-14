<script lang="ts">
  import { createProject } from "@/lib/api/projects";
  import type { Project } from "@/lib/api/types";

  export let onCreated: (project: Project) => void;
  export let onCancel: () => void;

  let name = "";
  let subdomain = "";
  let isLoading = false;
  let error: string | null = null;

  function handleNameChange(value: string) {
    name = value;
    subdomain = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!name.trim() || !subdomain.trim()) return;

    isLoading = true;
    error = null;

    try {
      const project = await createProject({
        name: name.trim(),
        subdomain: subdomain.trim(),
      });
      onCreated(project);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create project";
    } finally {
      isLoading = false;
    }
  }
</script>

<form
  on:submit={handleSubmit}
  class="rounded-lg border border-border p-4 space-y-4"
>
  <h3 class="font-medium text-foreground">Create New Project</h3>
  <div>
    <label class="mb-1 block text-xs font-medium text-muted-foreground">
      Project Name
    </label>
    <input
      class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      placeholder="My Documentation"
      value={name}
      on:input={(e) => handleNameChange(e.currentTarget.value)}
      autofocus
    />
  </div>
  <div>
    <label class="mb-1 block text-xs font-medium text-muted-foreground">
      Subdomain
    </label>
    <div class="flex items-center rounded-md border border-input bg-background">
      <input
        class="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
        placeholder="my-docs"
        bind:value={subdomain}
      />
      <span class="px-3 text-sm text-muted-foreground">
        .specra-docs.com
      </span>
    </div>
  </div>
  {#if error}
    <p class="text-xs text-destructive">{error}</p>
  {/if}
  <div class="flex gap-2">
    <button
      type="submit"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      disabled={!name.trim() || !subdomain.trim() || isLoading}
    >
      {isLoading ? "Creating..." : "Create Project"}
    </button>
    <button
      type="button"
      class="rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
      on:click={onCancel}
    >
      Cancel
    </button>
  </div>
</form>
