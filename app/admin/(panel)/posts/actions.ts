"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/api/server";

/* ── Types ────────────────────────────────────────────────────────── */

export interface PostFields {
  title: string;
  description: string;
  tags: string[];
  locale: "fr" | "en";
  content: string;
  coverImage: string | null;
}

interface PostResponse {
  data: { id: string; slug: string; status: string };
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function revalidatePost(locale: string, slug: string) {
  revalidatePath("/admin/posts");
  revalidatePath(`/${locale}/blog`);
  revalidatePath(`/${locale}/blog/${slug}`);
}

/* ── Actions ─────────────────────────────────────────────────────── */

export async function savePost(
  fields: PostFields,
  existingId?: string
): Promise<{ id: string; slug: string; error?: string }> {
  try {
    if (!fields.title.trim()) return { id: "", slug: "", error: "Le titre est requis." };

    const payload = {
      title: fields.title,
      description: fields.description,
      locale: fields.locale,
      content: fields.content,
      tags: fields.tags,
      status: "draft",
      coverImage: fields.coverImage || null,
    };

    const res = existingId
      ? await serverFetch<PostResponse>(`/admin/posts/${existingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : await serverFetch<PostResponse>("/admin/posts", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    revalidatePost(fields.locale, res.data.slug);
    return { id: res.data.id, slug: res.data.slug };
  } catch (err) {
    return { id: existingId ?? "", slug: "", error: (err as Error).message };
  }
}

export async function publishPost(id: string): Promise<{ error?: string }> {
  try {
    await serverFetch(`/admin/posts/${id}/publish`, { method: "POST" });
    revalidatePath("/admin/posts");
    return {};
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  try {
    await serverFetch(`/admin/posts/${id}`, { method: "DELETE" });
    revalidatePath("/admin/posts");
    return {};
  } catch (err) {
    return { error: (err as Error).message };
  }
}
