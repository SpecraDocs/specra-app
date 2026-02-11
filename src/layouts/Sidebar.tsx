import { useUIStore } from "@/shared/store/ui-store";
import { DocumentTree } from "@/features/documents/components/DocumentTree";
import { ProjectsSidebar } from "@/features/projects/components/ProjectsSidebar";
import { SettingsSidebar } from "@/features/settings/components/SettingsSidebar";

export function Sidebar() {
  const activeView = useUIStore((s) => s.activeView);

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-sidebar">
      {activeView === "documents" && <DocumentTree />}
      {activeView === "projects" && <ProjectsSidebar />}
      {activeView === "settings" && <SettingsSidebar />}
    </aside>
  );
}
