import { useState } from "react";
import { inviteMember } from "@/lib/api/organizations";
import { Mail } from "lucide-react";

interface Props {
  orgId: string;
  onInvited: () => void;
  onCancel: () => void;
}

export function InviteMemberDialog({ orgId, onInvited, onCancel }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await inviteMember(orgId, email.trim(), role);
      onInvited();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite member");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleInvite}
      className="mt-4 rounded-lg border border-border p-4 space-y-3"
    >
      <h3 className="font-medium text-foreground">Invite Member</h3>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="email"
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
      </div>
      <select
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          disabled={!email.trim() || isLoading}
        >
          {isLoading ? "Sending..." : "Send Invite"}
        </button>
        <button
          type="button"
          className="rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
