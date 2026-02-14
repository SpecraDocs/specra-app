<script lang="ts">
  import { onMount } from "svelte";
  import { isAuthenticated } from "@/features/auth/store/auth-store";
  import { getProject, getDeployments } from "@/lib/api/projects";
  import type { Project, Deployment } from "@/lib/api/types";
  import {
    Globe,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
  } from "lucide-svelte";

  export let projectId: string;

  let project: Project | null = null;
  let deployments: Deployment[] = [];
  let isLoading = true;

  onMount(() => {
    if (!$isAuthenticated || !projectId) return;

    isLoading = true;
    Promise.all([getProject(projectId), getDeployments(projectId)])
      .then(([proj, deps]) => {
        project = proj;
        deployments = deps;
      })
      .catch(console.error)
      .finally(() => (isLoading = false));
  });

  $: siteUrl = project
    ? project.customDomain
      ? `https://${project.customDomain}`
      : `https://${project.subdomain}.specra-docs.com`
    : "";
</script>

{#if isLoading}
  <div class="flex h-full items-center justify-center">
    <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
{:else if !project}
  <div class="flex h-full items-center justify-center text-muted-foreground">
    Project not found.
  </div>
{:else}
  <div class="mx-auto max-w-3xl px-8 py-12">
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{project.name}</h1>
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Globe class="h-3.5 w-3.5" />
          {siteUrl}
          <ExternalLink class="h-3 w-3" />
        </a>
      </div>
    </div>

    <div class="mt-8">
      <h2 class="text-lg font-semibold text-foreground">Deployments</h2>
      {#if deployments.length === 0}
        <p class="mt-4 text-sm text-muted-foreground">
          No deployments yet. Publish your workspace to create one.
        </p>
      {:else}
        <div class="mt-4 space-y-2">
          {#each deployments as dep (dep.id)}
            <div class="flex items-center justify-between rounded-lg border border-border p-3">
              <div class="flex items-center gap-3">
                {#if dep.status === "RUNNING"}
                  <CheckCircle2 class="h-4 w-4 text-green-500" />
                {:else if dep.status === "FAILED" || dep.status === "CANCELLED"}
                  <XCircle class="h-4 w-4 {dep.status === 'FAILED' ? 'text-red-500' : 'text-muted-foreground'}" />
                {:else if dep.status === "BUILDING" || dep.status === "DEPLOYING"}
                  <Loader2 class="h-4 w-4 animate-spin text-blue-500" />
                {:else}
                  <Clock class="h-4 w-4 text-yellow-500" />
                {/if}
                <div>
                  <p class="text-sm font-medium text-foreground">
                    {dep.status}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {new Date(dep.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <span class="text-xs text-muted-foreground">
                {dep.id.slice(0, 8)}
              </span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
