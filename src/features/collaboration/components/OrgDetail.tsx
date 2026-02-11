import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getMembers } from "@/lib/api/organizations";
import type { OrgMember } from "@/lib/api/types";
import { MembersList } from "./MembersList";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { UserPlus } from "lucide-react";

export function OrgDetail() {
  const { orgId } = useParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const loadMembers = () => {
    if (!isAuthenticated || !orgId) return;
    setIsLoading(true);
    getMembers(orgId)
      .then(setMembers)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadMembers();
  }, [isAuthenticated, orgId]);

  if (!orgId) return null;

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Members</h1>
        <button
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowInvite(true)}
        >
          <UserPlus className="h-4 w-4" /> Invite Member
        </button>
      </div>

      {showInvite && (
        <InviteMemberDialog
          orgId={orgId}
          onInvited={() => {
            setShowInvite(false);
            loadMembers();
          }}
          onCancel={() => setShowInvite(false)}
        />
      )}

      <div className="mt-6">
        <MembersList
          members={members}
          isLoading={isLoading}
          orgId={orgId}
          onMemberRemoved={loadMembers}
        />
      </div>
    </div>
  );
}
