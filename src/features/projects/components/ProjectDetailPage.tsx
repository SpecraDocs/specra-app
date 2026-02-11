import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getProject, getDeployments } from "@/lib/api/projects";
import type { Project, Deployment } from "@/lib/api/types";
import {
  Globe,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";

const statusIcons: Record<string, React.ReactNode> = {
  RUNNING: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  FAILED: <XCircle className="h-4 w-4 text-red-500" />,
  BUILDING: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  DEPLOYING: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  QUEUED: <Clock className="h-4 w-4 text-yellow-500" />,
  CANCELLED: <XCircle className="h-4 w-4 text-muted-foreground" />,
};

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [project, setProject] = useState<Project | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !projectId) return;

    setIsLoading(true);
    Promise.all([getProject(projectId), getDeployments(projectId)])
      .then(([proj, deps]) => {
        setProject(proj);
        setDeployments(deps);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, projectId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Project not found.
      </div>
    );
  }

  const siteUrl = project.customDomain
    ? `https://${project.customDomain}`
    : `https://${project.subdomain}.specra-docs.com`;

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Globe className="h-3.5 w-3.5" />
            {siteUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Deployments</h2>
        {deployments.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No deployments yet. Publish your workspace to create one.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {deployments.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  {statusIcons[dep.status] ?? (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {dep.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(dep.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {dep.id.slice(0, 8)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
