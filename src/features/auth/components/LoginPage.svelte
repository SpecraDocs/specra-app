<script lang="ts">
  import { startLogin } from "@/lib/tauri/auth";
  import TokenInput from "./TokenInput.svelte";
  import { LogIn } from "lucide-svelte";

  let isLoading = false;
  let showTokenInput = false;

  async function handleLogin() {
    isLoading = true;
    try {
      await startLogin();
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="space-y-6">
  <button
    class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
    on:click={handleLogin}
    disabled={isLoading}
  >
    <LogIn class="h-4 w-4" />
    {isLoading ? "Waiting for browser..." : "Sign in to Specra"}
  </button>

  <div class="relative">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-border" />
    </div>
    <div class="relative flex justify-center text-xs">
      <span class="bg-background px-2 text-muted-foreground">or</span>
    </div>
  </div>

  {#if showTokenInput}
    <TokenInput />
  {:else}
    <button
      class="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      on:click={() => (showTokenInput = true)}
    >
      Paste API token manually
    </button>
  {/if}
</div>
