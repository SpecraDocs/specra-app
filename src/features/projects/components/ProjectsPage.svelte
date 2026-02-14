<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "@/lib/router";
  import { isAuthenticated } from "@/features/auth/store/auth-store";
  import { getProjects } from "@/lib/api/projects";
  import type { Project } from "@/lib/api/types";
  import LoginPage from "@/features/auth/components/LoginPage.svelte";
  import { Plus, Globe, ExternalLink } from "lucide-svelte";
  import CreateProjectForm from "./CreateProjectForm.svelte";

  let projects: Project[] = [];
  let isLoading = false;
  let showCreate = false;

  onMount(() => {
    if (!$isAuthenticated) return;
    isLoading = true;
    getProjects()
      .then((p) => (projects = p))
      .catch(console.error)
      .finally(() => (isLoading = false));
  });

  $: if ($isAuthenticated) {
    isLoading = true;
    getProjects()
      .then((p) => (projects = p))
      .catch(console.error)
      .finally(() => (isLoading = false));
  }

  function handleProjectCreated(project: Project) {
    projects = [project, ...projects];
    showCreate = false;
  }
</script>

{#if !$isAuthenticated}
  <div class="mx-auto max-w-md px-8 py-12">
    <h1 class="text-2xl font-bold text-foreground">Projects</h1>
    <p class="mb-6 mt-2 text-muted-foreground">
      Sign in to view and manage your projects.
    </p>
    <LoginPage />
  </div>
{:else}
  <div class="mx-auto max-w-3xl px-8 py-12">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">Projects</h1>
      <button
        class="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        on:click={() => (showCreate = true)}
      >
        <Plus class="h-4 w-4" />
        New Project
      </button>
    </div>

    {#if showCreate}
      <div class="mt-6">
        <CreateProjectForm
          onCreated={handleProjectCreated}
          onCancel={() => (showCreate = false)}
        />
      </div>
    {/if}

    {#if isLoading}
      <div class="mt-8 space-y-3">
        {#each [1, 2, 3] as i (i)}
          <div class="h-20 animate-pulse rounded-lg border border-border bg-muted" />
        {/each}
      </div>
    {:else if projects.length === 0}
      <div class="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
        <Globe class="mx-auto h-10 w-10 text-muted-foreground" />
        <p class="mt-3 text-sm text-muted-foreground">
          No projects yet. Create one to publish your documentation.
        </p>
      </div>
    {:else}
      <div class="mt-6 space-y-3">
        {#each projects as project (project.id)}
          <button
            class="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent/30"
            on:click={() => navigate(`/projects/${project.id}`)}
          >
            <div>
              <p class="font-medium text-foreground">{project.name}</p>
              <p class="mt-0.5 text-sm text-muted-foreground">
                {project.subdomain}.specra-docs.com
              </p>
            </div>
            <ExternalLink class="h-4 w-4 text-muted-foreground" />
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
