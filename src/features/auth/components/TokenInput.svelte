<script lang="ts">
  import { loginWithToken } from "@/lib/tauri/auth";
  import { Key } from "lucide-svelte";

  let token = "";
  let isLoading = false;
  let error: string | null = null;

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!token.trim()) return;

    isLoading = true;
    error = null;

    const success = await loginWithToken(token.trim());
    isLoading = false;

    if (!success) {
      error = "Invalid token. Please check and try again.";
    }
  }
</script>

<form on:submit={handleSubmit} class="space-y-3">
  <div class="relative">
    <Key class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      class="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      placeholder="specra_..."
      bind:value={token}
    />
  </div>
  {#if error}
    <p class="text-xs text-destructive">{error}</p>
  {/if}
  <button
    type="submit"
    class="w-full rounded-md bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
    disabled={!token.trim() || isLoading}
  >
    {isLoading ? "Verifying..." : "Connect with Token"}
  </button>
</form>
