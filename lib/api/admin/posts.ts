import { apiFetch, type ApiResponse, type PaginatedResponse } from "../client";

/* ── Types ──────────────────────────────────────────────────────── */

export type PostStatus = "draft" | "published" | "scheduled";

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  locale: "fr" | "en";
  description: string;
  content: string;
  status: PostStatus;
  tags: string[];
  views: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetAdminPostsParams {
  page?: number;
  status?: PostStatus;
  locale?: "fr" | "en";
  q?: string;
}

export interface CreatePostPayload {
  title: string;
  locale: "fr" | "en";
  content: string;
  description: string;
  status?: PostStatus;
  tags?: string[];
}

export type UpdatePostPayload = Partial<CreatePostPayload>;

/* ── Endpoints ──────────────────────────────────────────────────── */

export const getAdminPosts = (params: GetAdminPostsParams = {}) =>
  apiFetch<PaginatedResponse<AdminPost>>("/admin/posts", { params });

export const getAdminPostsTrash = () =>
  apiFetch<ApiResponse<AdminPost[]>>("/admin/posts/trash");

export const getAdminPost = async (id: string) => {
  const res = await apiFetch<ApiResponse<AdminPost>>(`/admin/posts/${id}`);
  return res.data;
};

export const createPost = async (payload: CreatePostPayload) => {
  const res = await apiFetch<ApiResponse<AdminPost>>("/admin/posts", {
    method: "POST",
    body: payload,
  });
  return res.data;
};

export const updatePost = async (id: string, payload: UpdatePostPayload) => {
  const res = await apiFetch<ApiResponse<AdminPost>>(`/admin/posts/${id}`, {
    method: "PUT",
    body: payload,
  });
  return res.data;
};

export const publishPost = (id: string) =>
  apiFetch(`/admin/posts/${id}/publish`, { method: "POST" });

export const unpublishPost = (id: string) =>
  apiFetch(`/admin/posts/${id}/unpublish`, { method: "POST" });

export const schedulePost = (id: string, scheduledAt: string) =>
  apiFetch(`/admin/posts/${id}/schedule`, {
    method: "POST",
    body: { scheduledAt },
  });

/** Soft delete → corbeille */
export const deletePost = (id: string) =>
  apiFetch(`/admin/posts/${id}`, { method: "DELETE" });

export const restorePost = (id: string) =>
  apiFetch(`/admin/posts/${id}/restore`, { method: "POST" });

/** Suppression définitive */
export const forceDeletePost = (id: string) =>
  apiFetch(`/admin/posts/${id}/force`, { method: "DELETE" });
