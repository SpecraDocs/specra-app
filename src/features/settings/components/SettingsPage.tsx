import { useUIStore } from "@/shared/store/ui-store";

export function SettingsPage() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  return (
    <div className="mx-auto max-w-2xl px-8 py-12">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <div className="mt-8 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-foreground">Appearance</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your preferred theme.
          </p>
          <div className="mt-3 flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  theme === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
