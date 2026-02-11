import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ActivityBar } from "./ActivityBar";
import { Sidebar } from "./Sidebar";
import { useUIStore } from "@/shared/store/ui-store";
import { PublishPanel } from "@/features/publishing/components/PublishPanel";
import { CommandPalette } from "@/shared/components/CommandPalette";
import { useKeyboardShortcuts } from "@/shared/hooks/useKeyboardShortcuts";

export function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const [publishPanelOpen, setPublishPanelOpen] = useState(false);

  useKeyboardShortcuts();

  // Listen for Cmd+P publish shortcut
  useEffect(() => {
    const handler = () => setPublishPanelOpen(true);
    window.addEventListener("specra:open-publish", handler);
    return () => window.removeEventListener("specra:open-publish", handler);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <ActivityBar onPublish={() => setPublishPanelOpen(true)} />
      {sidebarOpen && <Sidebar />}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      {publishPanelOpen && (
        <PublishPanel onClose={() => setPublishPanelOpen(false)} />
      )}
      <CommandPalette />
    </div>
  );
}
