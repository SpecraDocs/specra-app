import { useNavigate } from "react-router-dom";
import { FileText, FolderGit2, Settings, User, Upload } from "lucide-react";
import { useUIStore } from "@/shared/store/ui-store";
import { cn } from "@/shared/utils/cn";

const activities = [
  { id: "documents" as const, icon: FileText, label: "Documents", path: "/workspace" },
  { id: "projects" as const, icon: FolderGit2, label: "Projects", path: "/projects" },
  { id: "settings" as const, icon: Settings, label: "Settings", path: "/settings" },
] as const;

interface Props {
  onPublish?: () => void;
}

export function ActivityBar({ onPublish }: Props) {
  const activeView = useUIStore((s) => s.activeView);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const navigate = useNavigate();

  return (
    <aside className="flex h-full w-12 flex-col items-center border-r border-border bg-sidebar py-2">
      <div className="flex flex-1 flex-col items-center gap-1">
        {activities.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              title={item.label}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              onClick={() => {
                setActiveView(item.id);
                navigate(item.path);
              }}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
      <div className="flex flex-col items-center gap-1 pb-2">
        <button
          title="Publish"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          onClick={onPublish}
        >
          <Upload className="h-5 w-5" />
        </button>
        <button
          title="Account"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          onClick={() => navigate("/settings/account")}
        >
          <User className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
