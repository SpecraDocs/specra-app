<script lang="ts">
  import { navigate } from "@/lib/router";
  import { cn } from "@/shared/utils/cn";

  export let currentPath: string = "/settings";

  const settingsNav = [
    { label: "General", path: "/settings" },
    { label: "Account", path: "/settings/account" },
  ];
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center px-3 py-2">
    <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Settings
    </span>
  </div>
  <nav class="flex-1 space-y-0.5 px-2">
    {#each settingsNav as item}
      <button
        class={cn(
          "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors",
          currentPath === item.path
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
        on:click={() => navigate(item.path)}
      >
        {item.label}
      </button>
    {/each}
  </nav>
</div>
