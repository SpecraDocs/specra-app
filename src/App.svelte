<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { theme } from "./shared/store/ui-store";
  import { currentPath } from "./lib/router";
  import { restoreAuth } from "./lib/tauri/auth";
  import AppLayout from "./layouts/AppLayout.svelte";
  import OnboardingPage from "./features/workspace/components/OnboardingPage.svelte";

  let cleanup: (() => void) | undefined;

  onMount(() => {
    restoreAuth().catch(console.error);
  });

  // Theme reactivity
  $: {
    const root = document.documentElement;
    if ($theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", $theme === "dark");
    }
  }

  // Listen for system theme changes
  onMount(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      if ($theme === "system") {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    mq.addEventListener("change", listener);
    cleanup = () => mq.removeEventListener("change", listener);
  });

  onDestroy(() => cleanup?.());
</script>

{#if $currentPath === "/onboarding"}
  <OnboardingPage />
{:else}
  <AppLayout />
{/if}
