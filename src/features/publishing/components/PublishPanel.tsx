import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { usePublishStore } from "../store/publish-store";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import { useDocumentStore } from "@/features/documents/store/document-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useDeploymentStatus } from "../hooks/useDeploymentStatus";
import { generateProject } from "../lib/project-generator";
import { getProjects, createProject } from "@/lib/api/projects";
import type { Project } from "@/lib/api/types";
import * as db from "@/lib/tauri/database";
import {
  X,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  Globe,
  ExternalLink,
  Plus,
} from "lucide-react";

interface Props {
  onClose: () => void;
}

export function PublishPanel({ onClose }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const apiUrl = useAuthStore((s) => s.apiUrl);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const documents = useDocumentStore((s) => s.documents);

  const status = usePublishStore((s) => s.status);
  const error = usePublishStore((s) => s.error);
  const setStatus = usePublishStore((s) => s.setStatus);
  const setProjectId = usePublishStore((s) => s.setProjectId);
  const setDeploymentId = usePublishStore((s) => s.setDeploymentId);
  const setError = usePublishStore((s) => s.setError);
  const setSiteUrl = usePublishStore((s) => s.setSiteUrl);
  const siteUrl = usePublishStore((s) => s.siteUrl);
  const reset = usePublishStore((s) => s.reset);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [siteName, setSiteName] = useState("");
  const [version, setVersion] = useState("v1.0.0");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectSubdomain, setNewProjectSubdomain] = useState("");

  const publishProjectId = usePublishStore((s) => s.projectId);
  useDeploymentStatus(publishProjectId);

  const workspace = workspaces.find((w) => w.id === activeWorkspaceId);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoadingProjects(true);
    getProjects()
      .then((p) => {
        setProjects(p);
        // Auto-select if workspace is linked to a project
        if (workspace?.remote_project_id) {
          setSelectedProjectId(workspace.remote_project_id);
        } else if (p.length > 0) {
          setSelectedProjectId(p[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingProjects(false));
  }, [isAuthenticated, workspace?.remote_project_id]);

  useEffect(() => {
    if (workspace) {
      setSiteName(workspace.name);
    }
  }, [workspace]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectSubdomain.trim()) return;
    try {
      const project = await createProject({
        name: newProjectName.trim(),
        subdomain: newProjectSubdomain.trim(),
      });
      setProjects((prev) => [project, ...prev]);
      setSelectedProjectId(project.id);
      setShowNewProject(false);
      setNewProjectName("");
      setNewProjectSubdomain("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  const handlePublish = async () => {
    if (!workspace || !token || !selectedProjectId) return;

    reset();
    setStatus("preparing");
    setProjectId(selectedProjectId);

    try {
      // Generate project files
      const files = generateProject(workspace, documents, {
        siteName,
        version,
      });

      setStatus("uploading");

      // Create archive in Rust
      const archiveBytes = await invoke<number[]>("create_archive", {
        files: files.map((f) => ({
          path: f.path,
          content: f.content,
        })),
      });

      // Deploy
      const result = await invoke<{ deployment_id: string }>(
        "deploy_project",
        {
          apiUrl,
          projectId: selectedProjectId,
          token,
          archiveBytes,
        }
      );

      setDeploymentId(result.deployment_id);
      setStatus("queued");

      // Log it
      const logId = crypto.randomUUID();
      await db.createPublishLog(
        logId,
        workspace.id,
        selectedProjectId,
        documents.length
      );

      // Link workspace to project
      if (!workspace.remote_project_id) {
        await db.updateWorkspace(workspace.id, {
          remote_project_id: selectedProjectId,
        });
      }

      // Set site URL for the success state
      const project = projects.find((p) => p.id === selectedProjectId);
      if (project) {
        const url = project.customDomain
          ? `https://${project.customDomain}`
          : `https://${project.subdomain}.specra-docs.com`;
        setSiteUrl(url);
      }
    } catch (err) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Publish failed");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-full flex-col border-l border-border bg-sidebar">
        <Header onClose={onClose} />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-center text-sm text-muted-foreground">
            Sign in to publish your documentation.
          </p>
        </div>
      </div>
    );
  }

  const isPublishing =
    status === "preparing" ||
    status === "uploading" ||
    status === "queued" ||
    status === "building" ||
    status === "deploying";

  return (
    <div className="flex h-full w-80 flex-col border-l border-border bg-sidebar">
      <Header onClose={onClose} />

      <div className="flex-1 space-y-6 overflow-auto p-4">
        {/* Project selection */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Project
          </label>
          {isLoadingProjects ? (
            <div className="h-9 animate-pulse rounded-md bg-muted" />
          ) : (
            <>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={isPublishing}
              >
                <option value="">Select a project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                onClick={() => setShowNewProject(!showNewProject)}
              >
                <Plus className="h-3 w-3" /> Create new project
              </button>
            </>
          )}
        </div>

        {showNewProject && (
          <div className="space-y-2 rounded-md border border-border p-3">
            <input
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => {
                setNewProjectName(e.target.value);
                setNewProjectSubdomain(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
                );
              }}
            />
            <input
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none"
              placeholder="subdomain"
              value={newProjectSubdomain}
              onChange={(e) => setNewProjectSubdomain(e.target.value)}
            />
            <button
              className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              onClick={handleCreateProject}
            >
              Create
            </button>
          </div>
        )}

        {/* Config */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Site Name
          </label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            disabled={isPublishing}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Version
          </label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            disabled={isPublishing}
          />
        </div>

        {/* Documents summary */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Documents
          </p>
          <p className="mt-1 text-sm text-foreground">
            {documents.length} document{documents.length !== 1 ? "s" : ""} will
            be published
          </p>
        </div>

        {/* Status / Progress */}
        {status !== "idle" && (
          <div className="rounded-md border border-border p-3">
            <StatusDisplay status={status} error={error} siteUrl={siteUrl} />
          </div>
        )}
      </div>

      {/* Publish button */}
      <div className="border-t border-border p-4">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          onClick={handlePublish}
          disabled={!selectedProjectId || isPublishing || documents.length === 0}
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Publish Now
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <h2 className="text-sm font-semibold text-foreground">Publish</h2>
      <button
        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function StatusDisplay({
  status,
  error,
  siteUrl,
}: {
  status: string;
  error: string | null;
  siteUrl: string | null;
}) {
  const steps = [
    { key: "preparing", label: "Preparing files" },
    { key: "uploading", label: "Uploading" },
    { key: "queued", label: "Queued" },
    { key: "building", label: "Building" },
    { key: "deploying", label: "Deploying" },
    { key: "running", label: "Live" },
  ];

  const currentIndex = steps.findIndex((s) => s.key === status);

  if (status === "failed") {
    return (
      <div className="flex items-start gap-2">
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">
            Deployment failed
          </p>
          {error && (
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          )}
        </div>
      </div>
    );
  }

  if (status === "running") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Site is live!
          </p>
        </div>
        {siteUrl && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Globe className="h-3.5 w-3.5" />
            {siteUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : isCurrent ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : (
              <div className="h-3.5 w-3.5 rounded-full border border-border" />
            )}
            <span
              className={`text-xs ${
                isCurrent
                  ? "font-medium text-foreground"
                  : isComplete
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
