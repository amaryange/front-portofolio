import { apiFetch, type ApiResponse, type PaginatedResponse } from "../client";
import { useAuthStore } from "@/store/authStore";

/* ── Types ──────────────────────────────────────────────────────── */

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

/* ── Endpoints ──────────────────────────────────────────────────── */

export const getSubscribers = (page = 1) =>
  apiFetch<PaginatedResponse<Subscriber>>("/admin/newsletter", {
    params: { page },
  });

export const deleteSubscriber = (id: string) =>
  apiFetch(`/admin/newsletter/${id}`, { method: "DELETE" });

/**
 * Déclenche le téléchargement du CSV des abonnés newsletter.
 */
export async function exportSubscribersCsv(): Promise<void> {
  const token = useAuthStore.getState().token;
  const base = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"}/api/v1`;

  const res = await fetch(`${base}/admin/newsletter/export`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Export CSV échoué");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const getAdminNewsletterStats = async (): Promise<{
  total: number;
  lastWeek: number;
}> => {
  const res = await apiFetch<ApiResponse<{ total: number; lastWeek: number }>>(
    "/admin/newsletter/stats"
  );
  return res.data;
};
