<script lang="ts">
  import { onMount } from "svelte";
  import { isAuthenticated } from "@/features/auth/store/auth-store";
  import { getMembers } from "@/lib/api/organizations";
  import type { OrgMember } from "@/lib/api/types";
  import MembersList from "./MembersList.svelte";
  import InviteMemberDialog from "./InviteMemberDialog.svelte";
  import { UserPlus } from "lucide-svelte";

  export let orgId: string;

  let members: OrgMember[] = [];
  let isLoading = true;
  let showInvite = false;

  function loadMembers() {
    if (!$isAuthenticated || !orgId) return;
    isLoading = true;
    getMembers(orgId)
      .then((m) => (members = m))
      .catch(console.error)
      .finally(() => (isLoading = false));
  }

  onMount(() => {
    loadMembers();
  });
</script>

{#if !orgId}
  <!-- No org selected -->
{:else}
  <div class="mx-auto max-w-3xl px-8 py-12">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">Members</h1>
      <button
        class="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        on:click={() => (showInvite = true)}
      >
        <UserPlus class="h-4 w-4" /> Invite Member
      </button>
    </div>

    {#if showInvite}
      <InviteMemberDialog
        {orgId}
        onInvited={() => {
          showInvite = false;
          loadMembers();
        }}
        onCancel={() => (showInvite = false)}
      />
    {/if}

    <div class="mt-6">
      <MembersList
        {members}
        {isLoading}
        {orgId}
        onMemberRemoved={loadMembers}
      />
    </div>
  </div>
{/if}
