import { useState } from "react";
import { createProject } from "@/lib/api/projects";
import type { Project } from "@/lib/api/types";

interface Props {
  onCreated: (project: Project) => void;
  onCancel: () => void;
}

export function CreateProjectForm({ onCreated, onCancel }: Props) {
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate subdomain from name
    setSubdomain(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subdomain.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const project = await createProject({
        name: name.trim(),
        subdomain: subdomain.trim(),
      });
      onCreated(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border p-4 space-y-4"
    >
      <h3 className="font-medium text-foreground">Create New Project</h3>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Project Name
        </label>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="My Documentation"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          autoFocus
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Subdomain
        </label>
        <div className="flex items-center rounded-md border border-input bg-background">
          <input
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
            placeholder="my-docs"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
          />
          <span className="px-3 text-sm text-muted-foreground">
            .specra-docs.com
          </span>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          disabled={!name.trim() || !subdomain.trim() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Project"}
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
