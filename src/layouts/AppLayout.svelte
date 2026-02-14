<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { sidebarOpen } from "@/shared/store/ui-store";
  import { setupKeyboardShortcuts } from "@/shared/hooks/keyboard-shortcuts";
  import ActivityBar from "./ActivityBar.svelte";
  import Sidebar from "./Sidebar.svelte";
  import Router from "@/lib/Router.svelte";
  import PublishPanel from "@/features/publishing/components/PublishPanel.svelte";
  import CommandPalette from "@/shared/components/CommandPalette.svelte";

  let publishPanelOpen = false;
  let cleanupShortcuts: (() => void) | undefined;

  onMount(() => {
    cleanupShortcuts = setupKeyboardShortcuts();

    const handler = () => { publishPanelOpen = true; };
    window.addEventListener("specra:open-publish", handler);
    return () => window.removeEventListener("specra:open-publish", handler);
  });

  onDestroy(() => cleanupShortcuts?.());
</script>

<div class="flex h-screen w-screen overflow-hidden bg-background">
  <ActivityBar onPublish={() => { publishPanelOpen = true; }} />
  {#if $sidebarOpen}
    <Sidebar />
  {/if}
  <main class="flex-1 overflow-auto">
    <Router />
  </main>
  {#if publishPanelOpen}
    <PublishPanel onClose={() => { publishPanelOpen = false; }} />
  {/if}
  <CommandPalette />
</div>
