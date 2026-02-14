<script lang="ts">
  import { activeView } from "@/shared/store/ui-store";
  import DocumentTree from "@/features/documents/components/DocumentTree.svelte";
  import ProjectsSidebar from "@/features/projects/components/ProjectsSidebar.svelte";
  import SettingsSidebar from "@/features/settings/components/SettingsSidebar.svelte";
</script>

<aside class="flex h-full w-60 flex-col border-r border-border bg-sidebar">
  {#if $activeView === "documents"}
    <DocumentTree />
  {:else if $activeView === "projects"}
    <ProjectsSidebar />
  {:else if $activeView === "settings"}
    <SettingsSidebar />
  {/if}
</aside>
