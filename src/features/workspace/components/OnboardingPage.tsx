import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import * as db from "@/lib/tauri/database";
import { FileText, ArrowRight, SkipForward } from "lucide-react";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { useAuthStore } from "@/features/auth/store/auth-store";

type Step = "welcome" | "workspace" | "auth" | "done";

export function OnboardingPage() {
  const navigate = useNavigate();
  const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [step, setStep] = useState<Step>("welcome");
  const [workspaceName, setWorkspaceName] = useState("My Docs");

  const handleCreateWorkspace = async () => {
    const id = crypto.randomUUID();
    await db.createWorkspace(id, workspaceName.trim() || "My Docs");

    // Create a sample document
    const docId = crypto.randomUUID();
    await db.createDocument(id, id, "Getting Started");
    await db.updateDocument(docId, {
      content: JSON.stringify([
        {
          id: crypto.randomUUID(),
          type: "heading",
          props: { level: 1, textColor: "default", backgroundColor: "default", textAlignment: "left" },
          content: [{ type: "text", text: "Welcome to Specra", styles: {} }],
          children: [],
        },
        {
          id: crypto.randomUUID(),
          type: "paragraph",
          props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
          content: [
            { type: "text", text: "Start writing your documentation here. Use ", styles: {} },
            { type: "text", text: "/", styles: { code: true } },
            { type: "text", text: " to access the slash menu and insert blocks.", styles: {} },
          ],
          children: [],
        },
      ]),
    });

    const workspaces = await db.listWorkspaces();
    setWorkspaces(workspaces);
    setActiveWorkspace(id);
    setStep("auth");
  };

  const handleFinish = () => {
    navigate("/workspace");
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-8">
        {step === "welcome" && (
          <>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome to Specra
              </h1>
              <p className="mt-2 text-muted-foreground">
                Create beautiful documentation sites, no code required.
              </p>
            </div>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={() => setStep("workspace")}
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}

        {step === "workspace" && (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Name your workspace
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A workspace becomes a documentation site when you publish.
              </p>
            </div>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="My Documentation"
              autoFocus
            />
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={handleCreateWorkspace}
            >
              Create Workspace <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}

        {step === "auth" && (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Connect your account
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to publish your docs. You can skip this for now.
              </p>
            </div>
            {isAuthenticated ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-green-600 dark:text-green-400">
                  Connected successfully!
                </p>
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  onClick={handleFinish}
                >
                  Start Writing <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <LoginPage />
                <button
                  className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={handleFinish}
                >
                  <SkipForward className="h-4 w-4" /> Skip for now
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
