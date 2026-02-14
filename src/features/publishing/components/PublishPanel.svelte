<script lang="ts">
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import {
    status as publishStatus,
    error as publishError,
    projectId as publishProjectId,
    siteUrl,
    setStatus,
    setProjectId,
    setDeploymentId,
    setError,
    setSiteUrl,
    reset,
  } from "../store/publish-store";
  import { workspaces, activeWorkspaceId } from "@/features/workspace/store/workspace-store";
  import { documents } from "@/features/documents/store/document-store";
  import { isAuthenticated, token, apiUrl } from "@/features/auth/store/auth-store";
  import { useDeploymentStatus } from "../hooks/useDeploymentStatus";
  import { generateProject } from "../lib/project-generator";
  import { getProjects, createProject } from "@/lib/api/projects";
  import type { Project } from "@/lib/api/types";
  import * as db from "@/lib/tauri/database";
  import {
    X,
    Upload,
    CheckCircle2,
    XCircle,
    Loader2,
    Globe,
    ExternalLink,
    Plus,
  } from "lucide-svelte";

  export let onClose: () => void;

  let projects: Project[] = [];
  let selectedProjectId = "";
  let siteName = "";
  let version = "v1.0.0";
  let isLoadingProjects = false;
  let showNewProject = false;
  let newProjectName = "";
  let newProjectSubdomain = "";

  $: workspace = $workspaces.find((w) => w.id === $activeWorkspaceId);

  // Watch deployment status
  $: if ($publishProjectId) {
    useDeploymentStatus($publishProjectId);
  }

  onMount(() => {
    if (!$isAuthenticated) return;
    isLoadingProjects = true;
    getProjects()
      .then((p) => {
        projects = p;
        if (workspace?.remote_project_id) {
          selectedProjectId = workspace.remote_project_id;
        } else if (p.length > 0) {
          selectedProjectId = p[0].id;
        }
      })
      .catch(console.error)
      .finally(() => (isLoadingProjects = false));
  });

  $: if (workspace) {
    siteName = workspace.name;
  }

  async function handleCreateProject() {
    if (!newProjectName.trim() || !newProjectSubdomain.trim()) return;
    try {
      const project = await createProject({
        name: newProjectName.trim(),
        subdomain: newProjectSubdomain.trim(),
      });
      projects = [project, ...projects];
      selectedProjectId = project.id;
      showNewProject = false;
      newProjectName = "";
      newProjectSubdomain = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  }

  async function handlePublish() {
    if (!workspace || !$token || !selectedProjectId) return;

    reset();
    setStatus("preparing");
    setProjectId(selectedProjectId);

    try {
      const files = generateProject(workspace, $documents, {
        siteName,
        version,
      });

      setStatus("uploading");

      const archiveBytes = await invoke<number[]>("create_archive", {
        files: files.map((f) => ({
          path: f.path,
          content: f.content,
        })),
      });

      const result = await invoke<{ deployment_id: string }>(
        "deploy_project",
        {
          apiUrl: $apiUrl,
          projectId: selectedProjectId,
          token: $token,
          archiveBytes,
        }
      );

      setDeploymentId(result.deployment_id);
      setStatus("queued");

      const logId = crypto.randomUUID();
      await db.createPublishLog(
        logId,
        workspace.id,
        selectedProjectId,
        $documents.length
      );

      if (!workspace.remote_project_id) {
        await db.updateWorkspace(workspace.id, {
          remote_project_id: selectedProjectId,
        });
      }

      const project = projects.find((p) => p.id === selectedProjectId);
      if (project) {
        const url = project.customDomain
          ? `https://${project.customDomain}`
          : `https://${project.subdomain}.specra-docs.com`;
        setSiteUrl(url);
      }
    } catch (err) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Publish failed");
    }
  }

  $: isPublishing =
    $publishStatus === "preparing" ||
    $publishStatus === "uploading" ||
    $publishStatus === "queued" ||
    $publishStatus === "building" ||
    $publishStatus === "deploying";

  function handleNewProjectNameInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    newProjectName = value;
    newProjectSubdomain = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // Status steps for progress display
  const steps = [
    { key: "preparing", label: "Preparing files" },
    { key: "uploading", label: "Uploading" },
    { key: "queued", label: "Queued" },
    { key: "building", label: "Building" },
    { key: "deploying", label: "Deploying" },
    { key: "running", label: "Live" },
  ];

  $: currentIndex = steps.findIndex((s) => s.key === $publishStatus);
</script>

{#if !$isAuthenticated}
  <div class="flex h-full flex-col border-l border-border bg-sidebar">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border px-4 py-3">
      <h2 class="text-sm font-semibold text-foreground">Publish</h2>
      <button
        class="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
        on:click={onClose}
      >
        <X class="h-4 w-4" />
      </button>
    </div>
    <div class="flex flex-1 items-center justify-center p-6">
      <p class="text-center text-sm text-muted-foreground">
        Sign in to publish your documentation.
      </p>
    </div>
  </div>
{:else}
  <div class="flex h-full w-80 flex-col border-l border-border bg-sidebar">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border px-4 py-3">
      <h2 class="text-sm font-semibold text-foreground">Publish</h2>
      <button
        class="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
        on:click={onClose}
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <div class="flex-1 space-y-6 overflow-auto p-4">
      <!-- Project selection -->
      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">
          Project
        </label>
        {#if isLoadingProjects}
          <div class="h-9 animate-pulse rounded-md bg-muted" />
        {:else}
          <select
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            bind:value={selectedProjectId}
            disabled={isPublishing}
          >
            <option value="">Select a project...</option>
            {#each projects as p (p.id)}
              <option value={p.id}>{p.name}</option>
            {/each}
          </select>
          <button
            class="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
            on:click={() => (showNewProject = !showNewProject)}
          >
            <Plus class="h-3 w-3" /> Create new project
          </button>
        {/if}
      </div>

      {#if showNewProject}
        <div class="space-y-2 rounded-md border border-border p-3">
          <input
            class="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none"
            placeholder="Project name"
            value={newProjectName}
            on:input={handleNewProjectNameInput}
          />
          <input
            class="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none"
            placeholder="subdomain"
            bind:value={newProjectSubdomain}
          />
          <button
            class="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            on:click={handleCreateProject}
          >
            Create
          </button>
        </div>
      {/if}

      <!-- Config -->
      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">
          Site Name
        </label>
        <input
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
          bind:value={siteName}
          disabled={isPublishing}
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">
          Version
        </label>
        <input
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
          bind:value={version}
          disabled={isPublishing}
        />
      </div>

      <!-- Documents summary -->
      <div>
        <p class="text-xs font-medium text-muted-foreground">
          Documents
        </p>
        <p class="mt-1 text-sm text-foreground">
          {$documents.length} document{$documents.length !== 1 ? "s" : ""} will
          be published
        </p>
      </div>

      <!-- Status / Progress -->
      {#if $publishStatus !== "idle"}
        <div class="rounded-md border border-border p-3">
          {#if $publishStatus === "failed"}
            <div class="flex items-start gap-2">
              <XCircle class="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p class="text-sm font-medium text-destructive">
                  Deployment failed
                </p>
                {#if $publishError}
                  <p class="mt-1 text-xs text-muted-foreground">{$publishError}</p>
                {/if}
              </div>
            </div>
          {:else if $publishStatus === "running"}
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <CheckCircle2 class="h-4 w-4 text-green-500" />
                <p class="text-sm font-medium text-green-600 dark:text-green-400">
                  Site is live!
                </p>
              </div>
              {#if $siteUrl}
                <a
                  href={$siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Globe class="h-3.5 w-3.5" />
                  {$siteUrl}
                  <ExternalLink class="h-3 w-3" />
                </a>
              {/if}
            </div>
          {:else}
            <div class="space-y-2">
              {#each steps as step, i}
                {@const isComplete = i < currentIndex}
                {@const isCurrent = i === currentIndex}
                <div class="flex items-center gap-2">
                  {#if isComplete}
                    <CheckCircle2 class="h-3.5 w-3.5 text-green-500" />
                  {:else if isCurrent}
                    <Loader2 class="h-3.5 w-3.5 animate-spin text-primary" />
                  {:else}
                    <div class="h-3.5 w-3.5 rounded-full border border-border" />
                  {/if}
                  <span
                    class="text-xs {isCurrent
                      ? 'font-medium text-foreground'
                      : isComplete
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50'}"
                  >
                    {step.label}
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Publish button -->
    <div class="border-t border-border p-4">
      <button
        class="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        on:click={handlePublish}
        disabled={!selectedProjectId || isPublishing || $documents.length === 0}
      >
        {#if isPublishing}
          <Loader2 class="h-4 w-4 animate-spin" />
          Publishing...
        {:else}
          <Upload class="h-4 w-4" />
          Publish Now
        {/if}
      </button>
    </div>
  </div>
{/if}
