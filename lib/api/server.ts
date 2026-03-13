/**
 * Fetch utilitaire pour Server Components et Server Actions.
 * Lit automatiquement le cookie admin_token.
 */
import { cookies } from "next/headers";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export async function serverFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && token !== "dev-token"
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
