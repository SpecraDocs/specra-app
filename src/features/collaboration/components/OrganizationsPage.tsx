import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getOrgs, createOrg } from "@/lib/api/organizations";
import type { Organization } from "@/lib/api/types";
import { Building2, Plus, Users } from "lucide-react";

export function OrganizationsPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    getOrgs()
      .then(setOrgs)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const handleCreate = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    setError(null);
    try {
      const org = await createOrg({
        name: newName.trim(),
        slug: newSlug.trim(),
      });
      setOrgs((prev) => [...prev, org]);
      setShowCreate(false);
      setNewName("");
      setNewSlug("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create org");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-12">
        <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to manage your organizations.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
        <button
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-4 w-4" /> New Organization
        </button>
      </div>

      {showCreate && (
        <div className="mt-6 rounded-lg border border-border p-4 space-y-3">
          <h3 className="font-medium text-foreground">
            Create Organization
          </h3>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Organization name"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setNewSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")
              );
            }}
            autoFocus
          />
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="slug"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              onClick={handleCreate}
            >
              Create
            </button>
            <button
              className="rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-muted" />
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No organizations yet. Create one to collaborate with your team.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orgs.map((org) => (
            <button
              key={org.id}
              className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent/30"
              onClick={() => navigate(`/organizations/${org.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent">
                  <Building2 className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{org.name}</p>
                  <p className="text-xs text-muted-foreground">{org.slug}</p>
                </div>
              </div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
