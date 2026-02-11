import { useState } from "react";
import { loginWithToken } from "@/lib/tauri/auth";
import { Key } from "lucide-react";

export function TokenInput() {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsLoading(true);
    setError(null);

    const success = await loginWithToken(token.trim());
    setIsLoading(false);

    if (!success) {
      setError("Invalid token. Please check and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="specra_..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-md bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
        disabled={!token.trim() || isLoading}
      >
        {isLoading ? "Verifying..." : "Connect with Token"}
      </button>
    </form>
  );
}
