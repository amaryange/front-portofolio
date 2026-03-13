import { apiFetch, type ApiResponse } from "./client";
import { useAuthStore, type AuthUser } from "@/store/authStore";

/* ── Types ──────────────────────────────────────────────────────── */

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthData {
  token: string;
  user: AuthUser;
}

/* ── Endpoints ──────────────────────────────────────────────────── */

/**
 * POST /auth/login
 * Authentification par email + mot de passe.
 * Stocke automatiquement le token et l'user dans le store.
 */
export async function login(payload: LoginPayload): Promise<AuthData> {
  const res = await apiFetch<ApiResponse<AuthData>>("/auth/login", {
    method: "POST",
    body: payload,
  });
  useAuthStore.getState().setAuth(res.data.token, res.data.user);
  return res.data;
}

/**
 * GET /auth/me
 * Retourne le profil de l'utilisateur connecté.
 */
export async function getMe(): Promise<AuthUser> {
  const res = await apiFetch<ApiResponse<AuthUser>>("/auth/me");
  return res.data;
}

/**
 * POST /auth/logout
 * Révoque le token côté serveur puis vide le store local.
 */
export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    useAuthStore.getState().clearAuth();
  }
}
