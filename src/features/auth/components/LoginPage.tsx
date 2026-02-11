import { useState } from "react";
import { startLogin } from "@/lib/tauri/auth";
import { TokenInput } from "./TokenInput";
import { LogIn } from "lucide-react";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await startLogin();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        onClick={handleLogin}
        disabled={isLoading}
      >
        <LogIn className="h-4 w-4" />
        {isLoading ? "Waiting for browser..." : "Sign in to Specra"}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {showTokenInput ? (
        <TokenInput />
      ) : (
        <button
          className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setShowTokenInput(true)}
        >
          Paste API token manually
        </button>
      )}
    </div>
  );
}
