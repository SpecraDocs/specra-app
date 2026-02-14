<script lang="ts">
  import { FileText, FolderGit2, Settings, User, Upload } from "lucide-svelte";
  import { activeView } from "@/shared/store/ui-store";
  import { navigate } from "@/lib/router";
  import { cn } from "@/shared/utils/cn";

  export let onPublish: () => void = () => {};

  const activities = [
    { id: "documents" as const, icon: FileText, label: "Documents", path: "/workspace" },
    { id: "projects" as const, icon: FolderGit2, label: "Projects", path: "/projects" },
    { id: "settings" as const, icon: Settings, label: "Settings", path: "/settings" },
  ];
</script>

<aside class="flex h-full w-12 flex-col items-center border-r border-border bg-sidebar py-2">
  <div class="flex flex-1 flex-col items-center gap-1">
    {#each activities as item}
      <button
        title={item.label}
        class={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
          $activeView === item.id
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
        on:click={() => {
          activeView.set(item.id);
          navigate(item.path);
        }}
      >
        <svelte:component this={item.icon} class="h-5 w-5" />
      </button>
    {/each}
  </div>
  <div class="flex flex-col items-center gap-1 pb-2">
    <button
      title="Publish"
      class="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
      on:click={onPublish}
    >
      <Upload class="h-5 w-5" />
    </button>
    <button
      title="Account"
      class="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
      on:click={() => navigate("/settings/account")}
    >
      <User class="h-5 w-5" />
    </button>
  </div>
</aside>
