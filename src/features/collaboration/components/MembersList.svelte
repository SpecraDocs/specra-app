<script lang="ts">
  import type { OrgMember } from "@/lib/api/types";
  import { removeMember } from "@/lib/api/organizations";
  import { User, Crown, Shield, Trash2 } from "lucide-svelte";

  export let members: OrgMember[];
  export let isLoading: boolean;
  export let orgId: string;
  export let onMemberRemoved: () => void;

  const roleLabels: Record<string, string> = {
    owner: "Owner",
    admin: "Admin",
    member: "Member",
  };

  async function handleRemove(memberId: string) {
    try {
      await removeMember(orgId, memberId);
      onMemberRemoved();
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  }
</script>

{#if isLoading}
  <div class="space-y-3">
    {#each [1, 2, 3] as i (i)}
      <div class="h-14 animate-pulse rounded-lg border border-border bg-muted" />
    {/each}
  </div>
{:else if members.length === 0}
  <p class="text-sm text-muted-foreground">No members found.</p>
{:else}
  <div class="space-y-2">
    {#each members as member (member.id)}
      <div class="flex items-center justify-between rounded-lg border border-border p-3">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
            {#if member.image}
              <img
                src={member.image}
                alt={member.name ?? member.email}
                class="h-9 w-9 rounded-full"
              />
            {:else}
              <User class="h-4 w-4 text-accent-foreground" />
            {/if}
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">
              {member.name ?? member.email}
            </p>
            <p class="text-xs text-muted-foreground">{member.email}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1 text-xs text-muted-foreground">
            {#if member.role === "owner"}
              <Crown class="h-3 w-3" />
            {:else if member.role === "admin"}
              <Shield class="h-3 w-3" />
            {:else}
              <User class="h-3 w-3" />
            {/if}
            {roleLabels[member.role] ?? "Member"}
          </span>
          {#if member.role !== "owner"}
            <button
              class="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-destructive"
              on:click={() => handleRemove(member.id)}
              title="Remove member"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}
