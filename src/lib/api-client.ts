// Minimal API client foundation for migrating the dashboard from sample data to real endpoints.
// Uses NEXT_PUBLIC_API_BASE_URL (default http://localhost:4000/api/v1). Includes credentials for cookie sessions.

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export type ApiError = { code: string; message: string; details?: unknown; traceId?: string };

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (json as any)?.error as ApiError | undefined;
    throw Object.assign(new Error(err?.message ?? `Request failed (${res.status})`), { status: res.status, api: err });
  }
  return json as T;
}
