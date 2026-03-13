import { apiFetch, type ApiResponse, type PaginatedResponse } from "../client";
import { useAuthStore } from "@/store/authStore";

/* ── Types ──────────────────────────────────────────────────────── */

export type ContactStatus = "unread" | "read" | "replied";

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  newsletter: boolean;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GetContactsParams {
  page?: number;
  status?: ContactStatus;
}

/* ── Endpoints ──────────────────────────────────────────────────── */

export const getContacts = (params: GetContactsParams = {}) =>
  apiFetch<PaginatedResponse<Contact>>("/admin/contacts", { params });

export const getContact = async (id: string): Promise<Contact> => {
  const res = await apiFetch<ApiResponse<Contact>>(`/admin/contacts/${id}`);
  return res.data;
};

export const updateContactStatus = async (
  id: string,
  status: ContactStatus
): Promise<Contact> => {
  const res = await apiFetch<ApiResponse<Contact>>(`/admin/contacts/${id}`, {
    method: "PUT",
    body: { status },
  });
  return res.data;
};

export const deleteContact = (id: string) =>
  apiFetch(`/admin/contacts/${id}`, { method: "DELETE" });

/**
 * Déclenche le téléchargement du CSV des contacts.
 * Utilise fetch natif pour récupérer le blob.
 */
export async function exportContactsCsv(): Promise<void> {
  const token = useAuthStore.getState().token;
  const base = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"}/api/v1`;

  const res = await fetch(`${base}/admin/contacts/export`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Export CSV échoué");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
