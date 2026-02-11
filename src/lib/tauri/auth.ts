import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useAuthStore } from "@/features/auth/store/auth-store";
import * as db from "./database";
import { apiRequest } from "../api/client";
import type { AuthVerifyResponse } from "../api/types";

export async function startLogin(): Promise<boolean> {
  const state = crypto.randomUUID().replace(/-/g, "");
  const port = 9877;

  const loginUrl = `https://specra-docs.com/auth/login?cli=true&port=${port}&state=${state}`;

  // Open browser for auth
  await openUrl(loginUrl);

  // Start the local server in Rust and wait for the callback
  try {
    const result = await invoke<{ token: string; state: string }>(
      "start_auth_server",
      { port, state }
    );

    // Store token and verify
    useAuthStore.getState().setAuth(result.token, {
      id: "",
      email: "",
      name: "",
    });

    // Verify token and get user info
    try {
      const user = await apiRequest<AuthVerifyResponse>("/api/auth/verify");
      const authUser = {
        id: user.id,
        email: user.email,
        name: user.name ?? user.email,
        image: user.image,
      };

      useAuthStore.getState().setAuth(result.token, authUser);

      // Persist to SQLite
      await db.saveAuth({
        api_token: result.token,
        api_url: "https://specra-docs.com",
        user_id: user.id,
        user_email: user.email,
        user_name: user.name ?? null,
        user_image: user.image ?? null,
        logged_in_at: new Date().toISOString(),
      });

      return true;
    } catch {
      // Token received but verification failed - still save it
      await db.saveAuth({
        api_token: result.token,
        api_url: "https://specra-docs.com",
        user_id: null,
        user_email: null,
        user_name: null,
        user_image: null,
        logged_in_at: new Date().toISOString(),
      });
      return true;
    }
  } catch (error) {
    console.error("Auth failed:", error);
    return false;
  }
}

export async function loginWithToken(token: string): Promise<boolean> {
  useAuthStore.getState().setAuth(token, {
    id: "",
    email: "",
    name: "",
  });

  try {
    const user = await apiRequest<AuthVerifyResponse>("/api/auth/verify");
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name ?? user.email,
      image: user.image,
    };

    useAuthStore.getState().setAuth(token, authUser);

    await db.saveAuth({
      api_token: token,
      api_url: "https://specra-docs.com",
      user_id: user.id,
      user_email: user.email,
      user_name: user.name ?? null,
      user_image: user.image ?? null,
      logged_in_at: new Date().toISOString(),
    });

    return true;
  } catch {
    useAuthStore.getState().clearAuth();
    return false;
  }
}

export async function logout(): Promise<void> {
  useAuthStore.getState().clearAuth();
  await db.clearAuthToken();
}

export async function restoreAuth(): Promise<boolean> {
  try {
    const auth = await db.getAuth();
    if (!auth?.api_token) return false;

    useAuthStore.getState().setAuth(auth.api_token, {
      id: auth.user_id ?? "",
      email: auth.user_email ?? "",
      name: auth.user_name ?? "",
      image: auth.user_image ?? undefined,
    });

    return true;
  } catch {
    return false;
  }
}
