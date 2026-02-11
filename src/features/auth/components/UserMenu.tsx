import { useAuthStore } from "../store/auth-store";
import { logout } from "@/lib/tauri/auth";
import { LogOut, User } from "lucide-react";
import { useState } from "react";

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showMenu, setShowMenu] = useState(false);

  if (!isAuthenticated || !user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative">
      <button
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
        onClick={() => setShowMenu(!showMenu)}
        title={user.email}
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          initials
        )}
      </button>

      {showMenu && (
        <div
          className="absolute bottom-full left-0 mb-2 w-56 rounded-md border border-border bg-popover p-1 shadow-md"
          onMouseLeave={() => setShowMenu(false)}
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="my-1 border-t border-border" />
          <button
            className="flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-sm text-destructive hover:bg-accent"
            onClick={async () => {
              await logout();
              setShowMenu(false);
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
