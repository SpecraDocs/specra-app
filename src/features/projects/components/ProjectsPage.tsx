import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getProjects } from "@/lib/api/projects";
import type { Project } from "@/lib/api/types";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { Plus, Globe, ExternalLink } from "lucide-react";
import { CreateProjectForm } from "./CreateProjectForm";

export function ProjectsPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-8 py-12">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <p className="mb-6 mt-2 text-muted-foreground">
          Sign in to view and manage your projects.
        </p>
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <button
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {showCreate && (
        <div className="mt-6">
          <CreateProjectForm
            onCreated={(project) => {
              setProjects((prev) => [project, ...prev]);
              setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg border border-border bg-muted"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center">
          <Globe className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No projects yet. Create one to publish your documentation.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {projects.map((project) => (
            <button
              key={project.id}
              className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent/30"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div>
                <p className="font-medium text-foreground">{project.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {project.subdomain}.specra-docs.com
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
