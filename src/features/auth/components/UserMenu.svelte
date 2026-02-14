<script lang="ts">
  import { user, isAuthenticated } from "../store/auth-store";
  import { logout } from "@/lib/tauri/auth";
  import { LogOut, User } from "lucide-svelte";

  let showMenu = false;

  $: initials = $user?.name
    ? $user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : $user?.email?.[0]?.toUpperCase() ?? "?";

  async function handleLogout() {
    await logout();
    showMenu = false;
  }
</script>

{#if $isAuthenticated && $user}
  <div class="relative">
    <button
      class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
      on:click={() => (showMenu = !showMenu)}
      title={$user.email}
    >
      {#if $user.image}
        <img
          src={$user.image}
          alt={$user.name}
          class="h-8 w-8 rounded-full"
        />
      {:else}
        {initials}
      {/if}
    </button>

    {#if showMenu}
      <div
        class="absolute bottom-full left-0 mb-2 w-56 rounded-md border border-border bg-popover p-1 shadow-md"
        on:mouseleave={() => (showMenu = false)}
      >
        <div class="px-3 py-2">
          <p class="text-sm font-medium text-foreground">{$user.name}</p>
          <p class="text-xs text-muted-foreground">{$user.email}</p>
        </div>
        <div class="my-1 border-t border-border" />
        <button
          class="flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-sm text-destructive hover:bg-accent"
          on:click={handleLogout}
        >
          <LogOut class="h-4 w-4" />
          Sign out
        </button>
      </div>
    {/if}
  </div>
{/if}
