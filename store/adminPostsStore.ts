import { create } from "zustand";
import { toast } from "sonner";
import {
  getAdminPosts,
  getAdminPostsTrash,
  getAdminPost,
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  schedulePost,
  deletePost,
  restorePost,
  forceDeletePost,
  type AdminPost,
  type PostStatus,
  type CreatePostPayload,
  type UpdatePostPayload,
  type GetAdminPostsParams,
} from "@/lib/api/admin/posts";
import { getErrorMessage } from "@/lib/api/client";

/* ── Types ──────────────────────────────────────────────────────── */

interface Pagination {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}

export interface AdminPostFilters {
  status?: PostStatus;
  locale?: "fr" | "en";
  q?: string;
}

interface AdminPostsState {
  posts: AdminPost[];
  pagination: Pagination;
  filters: AdminPostFilters;
  isLoading: boolean;
  error: string | null;

  trashedPosts: AdminPost[];
  isLoadingTrash: boolean;

  post: AdminPost | null;
  isLoadingPost: boolean;
  isSaving: boolean;

  fetchPosts: (page?: number) => Promise<void>;
  fetchTrash: () => Promise<void>;
  setFilters: (filters: Partial<AdminPostFilters>) => Promise<void>;
  setPage: (page: number) => Promise<void>;

  fetchPost: (id: string) => Promise<void>;
  createPost: (payload: CreatePostPayload) => Promise<AdminPost>;
  updatePost: (id: string, payload: UpdatePostPayload) => Promise<void>;

  publishPost: (id: string) => Promise<void>;
  unpublishPost: (id: string) => Promise<void>;
  schedulePost: (id: string, scheduledAt: string) => Promise<void>;

  deletePost: (id: string) => Promise<void>;
  restorePost: (id: string) => Promise<void>;
  forceDeletePost: (id: string) => Promise<void>;

  clearPost: () => void;
}

const DEFAULT_PAGINATION: Pagination = {
  page: 1, limit: 10, total: 0, lastPage: 1,
};

export const useAdminPostsStore = create<AdminPostsState>()((set, get) => ({
  posts: [],
  pagination: DEFAULT_PAGINATION,
  filters: {},
  isLoading: false,
  error: null,
  trashedPosts: [],
  isLoadingTrash: false,
  post: null,
  isLoadingPost: false,
  isSaving: false,

  fetchPosts: async (page = 1) => {
    const { filters } = get();
    set({ isLoading: true, error: null });
    try {
      const params: GetAdminPostsParams = { page, ...filters };
      const res = await getAdminPosts(params);
      set({
        posts: res.data,
        pagination: {
          page: res.meta.current_page,
          limit: res.meta.per_page,
          total: res.meta.total,
          lastPage: res.meta.last_page,
        },
        isLoading: false,
      });
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isLoading: false });
      toast.error(msg);
    }
  },

  fetchTrash: async () => {
    set({ isLoadingTrash: true });
    try {
      const res = await getAdminPostsTrash();
      set({ trashedPosts: res.data, isLoadingTrash: false });
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isLoadingTrash: false });
      toast.error(msg);
    }
  },

  setFilters: async (filters) => {
    set((s) => ({ filters: { ...s.filters, ...filters } }));
    await get().fetchPosts(1);
  },

  setPage: async (page) => get().fetchPosts(page),

  fetchPost: async (id) => {
    set({ isLoadingPost: true, error: null });
    try {
      const post = await getAdminPost(id);
      set({ post, isLoadingPost: false });
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isLoadingPost: false });
      toast.error(msg);
    }
  },

  createPost: async (payload) => {
    set({ isSaving: true, error: null });
    const tid = toast.loading("Création en cours…");
    try {
      const post = await createPost(payload);
      set({ post, isSaving: false });
      toast.success("Article créé", { id: tid });
      return post;
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isSaving: false });
      toast.error(msg, { id: tid });
      throw err;
    }
  },

  updatePost: async (id, payload) => {
    set({ isSaving: true, error: null });
    const tid = toast.loading("Enregistrement…");
    try {
      const updated = await updatePost(id, payload);
      set((s) => ({
        post: s.post?.id === id ? updated : s.post,
        posts: s.posts.map((p) => (p.id === id ? updated : p)),
        isSaving: false,
      }));
      toast.success("Article enregistré", { id: tid });
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isSaving: false });
      toast.error(msg, { id: tid });
      throw err;
    }
  },

  publishPost: async (id) => {
    const tid = toast.loading("Publication…");
    try {
      await publishPost(id);
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === id ? { ...p, status: "published" as PostStatus } : p
        ),
      }));
      toast.success("Article publié", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    }
  },

  unpublishPost: async (id) => {
    const tid = toast.loading("Dépublication…");
    try {
      await unpublishPost(id);
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === id ? { ...p, status: "draft" as PostStatus } : p
        ),
      }));
      toast.success("Article repassé en brouillon", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    }
  },

  schedulePost: async (id, scheduledAt) => {
    const tid = toast.loading("Planification…");
    try {
      await schedulePost(id, scheduledAt);
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === id ? { ...p, status: "scheduled" as PostStatus, scheduledAt } : p
        ),
      }));
      toast.success("Article planifié", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    }
  },

  deletePost: async (id) => {
    const tid = toast.loading("Suppression…");
    try {
      await deletePost(id);
      set((s) => ({ posts: s.posts.filter((p) => p.id !== id) }));
      toast.success("Article déplacé dans la corbeille", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    }
  },

  restorePost: async (id) => {
    const tid = toast.loading("Restauration…");
    try {
      await restorePost(id);
      set((s) => ({ trashedPosts: s.trashedPosts.filter((p) => p.id !== id) }));
      toast.success("Article restauré", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    }
  },

  forceDeletePost: async (id) => {
    const tid = toast.loading("Suppression définitive…");
    try {
      await forceDeletePost(id);
      set((s) => ({ trashedPosts: s.trashedPosts.filter((p) => p.id !== id) }));
      toast.success("Article supprimé définitivement", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    }
  },

  clearPost: () => set({ post: null }),
}));
