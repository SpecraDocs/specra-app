import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

const settingsNav = [
  { label: "General", path: "/settings" },
  { label: "Account", path: "/settings/account" },
];

export function SettingsSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Settings
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 px-2">
        {settingsNav.map((item) => (
          <button
            key={item.path}
            className={cn(
              "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors",
              location.pathname === item.path
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
