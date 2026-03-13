import { up, isResponseError, ResponseError } from "up-fetch";
import { useAuthStore } from "@/store/authStore";

/**
 * Instance upfetch centrale.
 *
 * - baseUrl     : NEXT_PUBLIC_API_URL (défaut : http://localhost:3333/api/v1)
 * - X-API-Key   : NEXT_PUBLIC_API_KEY (endpoints publics)
 * - Authorization: Bearer token depuis le authStore (endpoints admin)
 * - onError     : si 401 → clearAuth() automatique
 * - parseRejected: extrait { message, errors } du corps AdonisJS → ResponseError
 */

const BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"}/api/v1`;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

export const apiFetch = up(fetch, () => {
  const token = useAuthStore.getState().token;

  return {
    baseUrl: BASE,
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
      ...(token   ? { Authorization: `Bearer ${token}` } : {}),
    },

    // up-fetch lance (throw) ce que parseRejected retourne.
    // → Il FAUT retourner un ResponseError pour que isResponseError() fonctionne.
    parseRejected: async (response: Response, request: Request) => {
      let data: ApiErrorBody;
      try {
        data = await response.json() as ApiErrorBody;
      } catch {
        data = { message: response.statusText };
      }
      return new ResponseError({
        message: data.message ?? response.statusText,
        response,
        data,
        request,
      });
    },

    onError(error: unknown) {
      // Token expiré ou révoqué → déconnexion automatique
      if (isResponseError(error) && error.status === 401) {
        useAuthStore.getState().clearAuth();
      }
    },
  };
});

/* ── Types partagés ─────────────────────────────────────────────── */

/** Extrait le message d'erreur depuis une ResponseError AdonisJS ou une Error classique. */
export function getErrorMessage(err: unknown): string {
  if (isResponseError<ApiErrorBody>(err)) {
    return err.data?.message ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return "Une erreur est survenue";
}

export interface ApiErrorBody {
  message: string;
  errors?: { rule: string; field: string; message: string }[];
}

/** Réponse AdonisJS standard : { data: T } */
export type ApiResponse<T> = { data: T };

/** Réponse paginée AdonisJS */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}
