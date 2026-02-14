<script lang="ts">
  import { inviteMember } from "@/lib/api/organizations";
  import { Mail } from "lucide-svelte";

  export let orgId: string;
  export let onInvited: () => void;
  export let onCancel: () => void;

  let email = "";
  let role = "member";
  let isLoading = false;
  let error: string | null = null;

  async function handleInvite(e: Event) {
    e.preventDefault();
    if (!email.trim()) return;

    isLoading = true;
    error = null;

    try {
      await inviteMember(orgId, email.trim(), role);
      onInvited();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to invite member";
    } finally {
      isLoading = false;
    }
  }
</script>

<form
  on:submit={handleInvite}
  class="mt-4 rounded-lg border border-border p-4 space-y-3"
>
  <h3 class="font-medium text-foreground">Invite Member</h3>
  <div class="relative">
    <Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      type="email"
      class="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      placeholder="email@example.com"
      bind:value={email}
      autofocus
    />
  </div>
  <select
    class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
    bind:value={role}
  >
    <option value="member">Member</option>
    <option value="admin">Admin</option>
  </select>
  {#if error}
    <p class="text-xs text-destructive">{error}</p>
  {/if}
  <div class="flex gap-2">
    <button
      type="submit"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      disabled={!email.trim() || isLoading}
    >
      {isLoading ? "Sending..." : "Send Invite"}
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
