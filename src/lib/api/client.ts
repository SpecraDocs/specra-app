import { fetch } from "@tauri-apps/plugin-http";
import { useAuthStore } from "@/features/auth/store/auth-store";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { token, apiUrl } = useAuthStore.getState();

  if (!token) {
    throw new Error("Not authenticated.");
  }

  const url = `${apiUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message: string;
    try {
      const data = (await res.json()) as Record<string, string>;
      message = data.error || res.statusText;
    } catch {
      message = res.statusText;
    }

    if (res.status === 401) {
      useAuthStore.getState().clearAuth();
    }

    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export async function apiUpload(
  path: string,
  body: Uint8Array,
  headers: Record<string, string> = {}
): Promise<unknown> {
  const { token, apiUrl } = useAuthStore.getState();

  if (!token) {
    throw new Error("Not authenticated.");
  }

  const url = `${apiUrl}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      ...headers,
    },
    body,
  });

  if (!res.ok) {
    let message: string;
    try {
      const data = (await res.json()) as Record<string, string>;
      message = data.error || res.statusText;
    } catch {
      message = res.statusText;
    }
    throw new ApiError(res.status, message);
  }

  return res.json();
}

export { ApiError };
