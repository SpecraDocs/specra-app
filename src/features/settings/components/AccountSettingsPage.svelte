<script lang="ts">
  import { user, isAuthenticated } from "@/features/auth/store/auth-store";
  import LoginPage from "@/features/auth/components/LoginPage.svelte";
  import { logout } from "@/lib/tauri/auth";
  import { LogOut, User } from "lucide-svelte";
</script>

<div class="mx-auto max-w-2xl px-8 py-12">
  <h1 class="text-2xl font-bold text-foreground">Account</h1>
  <p class="mt-2 text-muted-foreground">
    Sign in to publish your documentation to Specra.
  </p>

  <div class="mt-8">
    {#if $isAuthenticated && $user}
      <div class="space-y-6">
        <div class="flex items-center gap-4 rounded-lg border border-border p-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground">
            {#if $user.image}
              <img
                src={$user.image}
                alt={$user.name}
                class="h-12 w-12 rounded-full"
              />
            {:else}
              <User class="h-6 w-6" />
            {/if}
          </div>
          <div>
            <p class="font-medium text-foreground">{$user.name}</p>
            <p class="text-sm text-muted-foreground">{$user.email}</p>
          </div>
        </div>
        <button
          class="flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          on:click={() => logout()}
        >
          <LogOut class="h-4 w-4" />
          Sign out
        </button>
      </div>
    {:else}
      <div class="max-w-sm">
        <LoginPage />
      </div>
    {/if}
  </div>
</div>
