import { apiFetch, type ApiResponse, type PaginatedResponse } from "./client";

/* ── Types ──────────────────────────────────────────────────────── */

/** Forme brute renvoyée par l'API (objet ou string selon le contexte) */
interface ApiTagObject {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}
type ApiTagRaw = string | ApiTagObject;

/** Normalise les tags bruts de l'API en simples strings */
export function normalizeTags(tags: ApiTagRaw[]): string[] {
  return tags.map((t) => (typeof t === "string" ? t : t.name));
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  locale: "fr" | "en";
  description: string;
  content: string;
  status: "draft" | "published" | "scheduled";
  tags: string[];
  coverImage: string | null;
  views: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Liste : sans `content` pour alléger la réponse */
export type PostSummary = Omit<Post, "content">;

export interface Tag {
  name: string;
  count: number;
}

export interface GetPostsParams {
  locale?: "fr" | "en";
  page?: number;
  limit?: number;
  tag?: string;
  q?: string;
}

/* ── Endpoints ──────────────────────────────────────────────────── */

/**
 * GET /posts?locale&page&limit&tag&q
 * Liste paginée des articles publiés.
 */
export async function getPosts(
  params: GetPostsParams = {}
): Promise<PaginatedResponse<PostSummary>> {
  const res = await apiFetch<PaginatedResponse<PostSummary & { tags: ApiTagRaw[] }>>("/posts", { params });
  return {
    ...res,
    data: res.data.map((p) => ({ ...p, tags: normalizeTags(p.tags) })),
  };
}

/**
 * GET /posts/:slug?locale
 * Détail d'un article (avec contenu).
 */
export async function getPost(slug: string, locale: "fr" | "en"): Promise<Post> {
  const res = await apiFetch<ApiResponse<Post & { tags: ApiTagRaw[] }>>(`/posts/${slug}`, {
    params: { locale },
  });
  return { ...res.data, tags: normalizeTags(res.data.tags) };
}

/**
 * GET /tags
 * Liste des tags avec leur nombre d'articles.
 */
export async function getTags(): Promise<Tag[]> {
  const res = await apiFetch<ApiResponse<Tag[]>>("/tags");
  return res.data;
}
