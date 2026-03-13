import { apiFetch, type ApiResponse } from "./client";

/* ── Types ──────────────────────────────────────────────────────── */

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Si true, abonne l'email à la newsletter en même temps */
  newsletter?: boolean;
}

export interface ContactResponse {
  message: string;
}

export interface NewsletterPayload {
  email: string;
}

/* ── Endpoints ──────────────────────────────────────────────────── */

/**
 * POST /contacts
 * Envoie un message de contact.
 */
export async function sendContact(
  payload: ContactPayload
): Promise<ContactResponse> {
  const res = await apiFetch<ApiResponse<ContactResponse>>("/contacts", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

/**
 * POST /newsletter
 * Abonne une adresse email à la newsletter.
 */
export async function subscribeNewsletter(email: string): Promise<void> {
  await apiFetch<ApiResponse<{ message: string }>>("/newsletter", {
    method: "POST",
    body: { email } satisfies NewsletterPayload,
  });
}

/**
 * DELETE /newsletter
 * Désabonne une adresse email de la newsletter.
 */
export async function unsubscribeNewsletter(email: string): Promise<void> {
  await apiFetch<ApiResponse<{ message: string }>>("/newsletter", {
    method: "DELETE",
    body: { email } satisfies NewsletterPayload,
  });
}
