import { useEffect, useRef, useCallback } from "react";
import { usePublishStore } from "../store/publish-store";
import { getDeployments } from "@/lib/api/projects";

export function useDeploymentStatus(projectId: string | null) {
  const deploymentId = usePublishStore((s) => s.deploymentId);
  const status = usePublishStore((s) => s.status);
  const setStatus = usePublishStore((s) => s.setStatus);
  const setError = usePublishStore((s) => s.setError);
  const setSiteUrl = usePublishStore((s) => s.setSiteUrl);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    if (!projectId || !deploymentId) return;

    try {
      const deployments = await getDeployments(projectId);
      const deployment = deployments.find((d) => d.id === deploymentId);

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
          // Stop polling
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          break;
        case "FAILED":
          setStatus("failed");
          setError(deployment.error ?? "Deployment failed");
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          break;
        case "CANCELLED":
          setStatus("failed");
          setError("Deployment was cancelled");
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          break;
      }
    } catch (err) {
      console.error("Failed to poll deployment status:", err);
    }
  }, [projectId, deploymentId, setStatus, setError, setSiteUrl]);

  useEffect(() => {
    const isActive =
      status === "uploading" ||
      status === "queued" ||
      status === "building" ||
      status === "deploying";

    if (isActive && projectId && deploymentId) {
      intervalRef.current = setInterval(poll, 3000);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [status, projectId, deploymentId, poll]);
}
