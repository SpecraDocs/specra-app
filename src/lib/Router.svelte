<script lang="ts">
  import { currentPath, routeParams } from "./router";
  import WorkspacePage from "@/features/workspace/components/WorkspacePage.svelte";
  import EditorPage from "@/features/editor/components/EditorPage.svelte";
  import SettingsPage from "@/features/settings/components/SettingsPage.svelte";
  import AccountSettingsPage from "@/features/settings/components/AccountSettingsPage.svelte";
  import ProjectsPage from "@/features/projects/components/ProjectsPage.svelte";
  import ProjectDetailPage from "@/features/projects/components/ProjectDetailPage.svelte";
  import OrganizationsPage from "@/features/collaboration/components/OrganizationsPage.svelte";
  import OrgDetail from "@/features/collaboration/components/OrgDetail.svelte";
  import { navigate } from "./router";

  // Redirect root to /workspace
  $: if ($currentPath === "/" || $currentPath === "") {
    navigate("/workspace");
  }
</script>

{#if $currentPath === "/workspace"}
  <WorkspacePage />
{:else if $currentPath.startsWith("/workspace/")}
  <EditorPage documentId={$routeParams.documentId ?? ""} />
{:else if $currentPath === "/settings"}
  <SettingsPage />
{:else if $currentPath === "/settings/account"}
  <AccountSettingsPage />
{:else if $currentPath === "/projects"}
  <ProjectsPage />
{:else if $currentPath.startsWith("/projects/")}
  <ProjectDetailPage projectId={$routeParams.projectId ?? ""} />
{:else if $currentPath === "/organizations"}
  <OrganizationsPage />
{:else if $currentPath.startsWith("/organizations/")}
  <OrgDetail orgId={$routeParams.orgId ?? ""} />
{:else}
  <WorkspacePage />
{/if}
