import { apiRequest } from "./client";
import type { Project, Deployment } from "./types";

export async function getProjects(): Promise<Project[]> {
  return apiRequest<Project[]>("/api/projects");
}

export async function createProject(data: {
  name: string;
  subdomain: string;
  organizationId?: string;
}): Promise<Project> {
  return apiRequest<Project>("/api/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProject(id: string): Promise<Project> {
  return apiRequest<Project>(`/api/projects/${id}`);
}

export async function getDeployments(projectId: string): Promise<Deployment[]> {
  return apiRequest<Deployment[]>(`/api/projects/${projectId}/deployments`);
}

export async function getLatestDeployment(
  projectId: string
): Promise<Deployment | null> {
  const deployments = await getDeployments(projectId);
  return deployments[0] ?? null;
}
