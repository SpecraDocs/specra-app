import { useAuthStore } from "@/features/auth/store/auth-store";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { logout } from "@/lib/tauri/auth";
import { LogOut, User } from "lucide-react";

export function AccountSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="mx-auto max-w-2xl px-8 py-12">
      <h1 className="text-2xl font-bold text-foreground">Account</h1>
      <p className="mt-2 text-muted-foreground">
        Sign in to publish your documentation to Specra.
      </p>

      <div className="mt-8">
        {isAuthenticated && user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <User className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <button
              className="flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : (
          <div className="max-w-sm">
            <LoginPage />
          </div>
        )}
      </div>
    </div>
  );
}
