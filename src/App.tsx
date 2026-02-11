import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { WorkspacePage } from "./features/workspace/components/WorkspacePage";
import { EditorPage } from "./features/editor/components/EditorPage";
import { SettingsPage } from "./features/settings/components/SettingsPage";
import { AccountSettingsPage } from "./features/settings/components/AccountSettingsPage";
import { ProjectsPage } from "./features/projects/components/ProjectsPage";
import { ProjectDetailPage } from "./features/projects/components/ProjectDetailPage";
import { OnboardingPage } from "./features/workspace/components/OnboardingPage";
import { OrganizationsPage } from "./features/collaboration/components/OrganizationsPage";
import { OrgDetail } from "./features/collaboration/components/OrgDetail";
import { useUIStore } from "./shared/store/ui-store";
import { useEffect } from "react";
import { restoreAuth } from "./lib/tauri/auth";

export function App() {
  const theme = useUIStore((s) => s.theme);

  // Restore auth from SQLite on startup
  useEffect(() => {
    restoreAuth().catch(console.error);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.toggle("dark", prefersDark);

      const listener = (e: MediaQueryListEvent) => {
        root.classList.toggle("dark", e.matches);
      };
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/workspace" replace />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/workspace/:documentId" element={<EditorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/account" element={<AccountSettingsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/organizations" element={<OrganizationsPage />} />
        <Route path="/organizations/:orgId" element={<OrgDetail />} />
      </Route>
    </Routes>
  );
}
