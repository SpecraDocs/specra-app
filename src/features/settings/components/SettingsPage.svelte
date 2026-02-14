<script lang="ts">
  import { theme, setTheme } from "@/shared/store/ui-store";

  const themes = ["light", "dark", "system"] as const;
</script>

<div class="mx-auto max-w-2xl px-8 py-12">
  <h1 class="text-2xl font-bold text-foreground">Settings</h1>
  <div class="mt-8 space-y-6">
    <div>
      <h3 class="text-sm font-medium text-foreground">Appearance</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        Choose your preferred theme.
      </p>
      <div class="mt-3 flex gap-2">
        {#each themes as t}
          <button
            class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {$theme === t
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'}"
            on:click={() => setTheme(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
