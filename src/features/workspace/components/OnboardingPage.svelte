<script lang="ts">
  import { navigate } from "@/lib/router";
  import { workspaces as workspacesStore, activeWorkspaceId } from "@/features/workspace/store/workspace-store";
  import { isAuthenticated } from "@/features/auth/store/auth-store";
  import * as db from "@/lib/tauri/database";
  import { FileText, ArrowRight, SkipForward } from "lucide-svelte";
  import LoginPage from "@/features/auth/components/LoginPage.svelte";

  type Step = "welcome" | "workspace" | "auth" | "done";

  let step: Step = "welcome";
  let workspaceName = "My Docs";

  async function handleCreateWorkspace() {
    const id = crypto.randomUUID();
    await db.createWorkspace(id, workspaceName.trim() || "My Docs");

    // Create a sample document
    const docId = crypto.randomUUID();
    await db.createDocument(id, id, "Getting Started");
    await db.updateDocument(docId, {
      content: JSON.stringify([
        {
          id: crypto.randomUUID(),
          type: "heading",
          props: { level: 1, textColor: "default", backgroundColor: "default", textAlignment: "left" },
          content: [{ type: "text", text: "Welcome to Specra", styles: {} }],
          children: [],
        },
        {
          id: crypto.randomUUID(),
          type: "paragraph",
          props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
          content: [
            { type: "text", text: "Start writing your documentation here. Use ", styles: {} },
            { type: "text", text: "/", styles: { code: true } },
            { type: "text", text: " to access the slash menu and insert blocks.", styles: {} },
          ],
          children: [],
        },
      ]),
    });

    const workspaces = await db.listWorkspaces();
    workspacesStore.set(workspaces);
    activeWorkspaceId.set(id);
    step = "auth";
  }

  function handleFinish() {
    navigate("/workspace");
  }
</script>

<div class="flex h-screen w-screen items-center justify-center bg-background">
  <div class="w-full max-w-md space-y-6 p-8">
    {#if step === "welcome"}
      <div class="text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <FileText class="h-8 w-8 text-primary" />
        </div>
        <h1 class="text-3xl font-bold text-foreground">
          Welcome to Specra
        </h1>
        <p class="mt-2 text-muted-foreground">
          Create beautiful documentation sites, no code required.
        </p>
      </div>
      <button
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        on:click={() => (step = "workspace")}
      >
        Get Started <ArrowRight class="h-4 w-4" />
      </button>
    {/if}

    {#if step === "workspace"}
      <div class="text-center">
        <h2 class="text-2xl font-bold text-foreground">
          Name your workspace
        </h2>
        <p class="mt-2 text-sm text-muted-foreground">
          A workspace becomes a documentation site when you publish.
        </p>
      </div>
      <input
        class="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        bind:value={workspaceName}
        placeholder="My Documentation"
        autofocus
      />
      <button
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        on:click={handleCreateWorkspace}
      >
        Create Workspace <ArrowRight class="h-4 w-4" />
      </button>
    {/if}

    {#if step === "auth"}
      <div class="text-center">
        <h2 class="text-2xl font-bold text-foreground">
          Connect your account
        </h2>
        <p class="mt-2 text-sm text-muted-foreground">
          Sign in to publish your docs. You can skip this for now.
        </p>
      </div>
      {#if $isAuthenticated}
        <div class="space-y-4 text-center">
          <p class="text-sm text-green-600 dark:text-green-400">
            Connected successfully!
          </p>
          <button
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            on:click={handleFinish}
          >
            Start Writing <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      {:else}
        <LoginPage />
        <button
          class="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          on:click={handleFinish}
        >
          <SkipForward class="h-4 w-4" /> Skip for now
        </button>
      {/if}
    {/if}
  </div>
</div>
