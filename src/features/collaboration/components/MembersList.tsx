import type { OrgMember } from "@/lib/api/types";
import { removeMember } from "@/lib/api/organizations";
import { User, Crown, Shield, Trash2 } from "lucide-react";

interface Props {
  members: OrgMember[];
  isLoading: boolean;
  orgId: string;
  onMemberRemoved: () => void;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
};

const roleLabels = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export function MembersList({
  members,
  isLoading,
  orgId,
  onMemberRemoved,
}: Props) {
  const handleRemove = async (memberId: string) => {
    try {
      await removeMember(orgId, memberId);
      onMemberRemoved();
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No members found.</p>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const RoleIcon = roleIcons[member.role] || User;
        return (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border border-border p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name ?? member.email}
                    className="h-9 w-9 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4 text-accent-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {member.name ?? member.email}
                </p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <RoleIcon className="h-3 w-3" />
                {roleLabels[member.role]}
              </span>
              {member.role !== "owner" && (
                <button
                  className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-destructive"
                  onClick={() => handleRemove(member.id)}
                  title="Remove member"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
