"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  let token: string;

  // ── Dev bypass — retirer avant la mise en production ──────────────
  if (process.env.NODE_ENV !== "production") {
    const devEmail    = process.env.ADMIN_DEV_EMAIL    ?? "admin@admin.com";
    const devPassword = process.env.ADMIN_DEV_PASSWORD ?? "admin";
    if (email === devEmail && password === devPassword) {
      token = "dev-token";
      const cookieStore = await cookies();
      cookieStore.set("admin_token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      redirect("/admin");
    }
  }
  // ──────────────────────────────────────────────────────────────────

  try {
    const res = await fetch(
      `${process.env.API_URL ?? "http://localhost:3333"}/api/v1/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!res.ok) {
      return { error: "Identifiants invalides." };
    }

    const data = (await res.json()) as { data?: { token?: string } };
    if (!data.data?.token) return { error: "Réponse inattendue du serveur." };
    token = data.data.token;
  } catch {
    return { error: "Impossible de joindre le serveur." };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: "/",
  });

  redirect("/admin");
}
