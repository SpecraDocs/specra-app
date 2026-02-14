<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "@/lib/router";
  import { isAuthenticated } from "@/features/auth/store/auth-store";
  import { getOrgs, createOrg } from "@/lib/api/organizations";
  import type { Organization } from "@/lib/api/types";
  import { Building2, Plus, Users } from "lucide-svelte";

  let orgs: Organization[] = [];
  let isLoading = false;
  let showCreate = false;
  let newName = "";
  let newSlug = "";
  let error: string | null = null;

  onMount(() => {
    if (!$isAuthenticated) return;
    isLoading = true;
    getOrgs()
      .then((o) => (orgs = o))
      .catch(console.error)
      .finally(() => (isLoading = false));
  });

  async function handleCreate() {
    if (!newName.trim() || !newSlug.trim()) return;
    error = null;
    try {
      const org = await createOrg({
        name: newName.trim(),
        slug: newSlug.trim(),
      });
      orgs = [...orgs, org];
      showCreate = false;
      newName = "";
      newSlug = "";
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create org";
    }
  }

  function handleNameInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    newName = value;
    newSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
</script>

{#if !$isAuthenticated}
  <div class="mx-auto max-w-2xl px-8 py-12">
    <h1 class="text-2xl font-bold text-foreground">Organizations</h1>
    <p class="mt-2 text-muted-foreground">
      Sign in to manage your organizations.
    </p>
  </div>
{:else}
  <div class="mx-auto max-w-3xl px-8 py-12">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">Organizations</h1>
      <button
        class="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        on:click={() => (showCreate = true)}
      >
        <Plus class="h-4 w-4" /> New Organization
      </button>
    </div>

    {#if showCreate}
      <div class="mt-6 rounded-lg border border-border p-4 space-y-3">
        <h3 class="font-medium text-foreground">
          Create Organization
        </h3>
        <input
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Organization name"
          value={newName}
          on:input={handleNameInput}
          autofocus
        />
        <input
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="slug"
          bind:value={newSlug}
        />
        {#if error}
          <p class="text-xs text-destructive">{error}</p>
        {/if}
        <div class="flex gap-2">
          <button
            class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            on:click={handleCreate}
          >
            Create
          </button>
          <button
            class="rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            on:click={() => (showCreate = false)}
          >
            Cancel
          </button>
        </div>
      </div>
    {/if}

    {#if isLoading}
      <div class="mt-8 space-y-3">
        {#each [1, 2] as i (i)}
          <div class="h-16 animate-pulse rounded-lg border border-border bg-muted" />
        {/each}
      </div>
    {:else if orgs.length === 0}
      <div class="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
        <Building2 class="mx-auto h-10 w-10 text-muted-foreground" />
        <p class="mt-3 text-sm text-muted-foreground">
          No organizations yet. Create one to collaborate with your team.
        </p>
      </div>
    {:else}
      <div class="mt-6 space-y-3">
        {#each orgs as org (org.id)}
          <button
            class="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent/30"
            on:click={() => navigate(`/organizations/${org.id}`)}
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-md bg-accent">
                <Building2 class="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p class="font-medium text-foreground">{org.name}</p>
                <p class="text-xs text-muted-foreground">{org.slug}</p>
              </div>
            </div>
            <Users class="h-4 w-4 text-muted-foreground" />
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
