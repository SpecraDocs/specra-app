import { get } from "svelte/store";
import {
  publishDeploymentId,
  publishStatus,
  setStatus,
  setError,
} from "../store/publish-store";
import { getDeployments } from "@/lib/api/projects";

let intervalId: ReturnType<typeof setInterval> | null = null;

export function useDeploymentStatus(projectId: string) {
  // Stop any existing polling
  stopPolling();

  const deploymentId = get(publishDeploymentId);
  const status = get(publishStatus);

  const isActive =
    status === "uploading" ||
    status === "queued" ||
    status === "building" ||
    status === "deploying";

  if (!isActive || !deploymentId) return;

  intervalId = setInterval(async () => {
    const currentDeploymentId = get(publishDeploymentId);
    if (!currentDeploymentId) {
      stopPolling();
      return;
    }

    try {
      const deployments = await getDeployments(projectId);
      const deployment = deployments.find((d) => d.id === currentDeploymentId);

      if (!deployment) return;

      switch (deployment.status) {
        case "QUEUED":
          setStatus("queued");
          break;
        case "BUILDING":
          setStatus("building");
          break;
        case "DEPLOYING":
          setStatus("deploying");
          break;
        case "RUNNING":
          setStatus("running");
          stopPolling();
          break;
        case "FAILED":
          setStatus("failed");
          setError(deployment.error ?? "Deployment failed");
          stopPolling();
          break;
        case "CANCELLED":
          setStatus("failed");
          setError("Deployment was cancelled");
          stopPolling();
          break;
      }
    } catch (err) {
      console.error("Failed to poll deployment status:", err);
    }
  }, 3000);
}

export function stopPolling() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
