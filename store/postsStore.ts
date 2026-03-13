import { create } from "zustand";
import { toast } from "sonner";
import {
  getPosts,
  getPost,
  getTags,
  type Post,
  type PostSummary,
  type Tag,
  type GetPostsParams,
} from "@/lib/api/posts";
import { getErrorMessage } from "@/lib/api/client";

/* ── Types internes ─────────────────────────────────────────────── */

export interface PostFilters {
  locale: "fr" | "en";
  tag?: string;
  q?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}

/* ── State ──────────────────────────────────────────────────────── */

interface PostsState {
  /* Liste */
  posts: PostSummary[];
  pagination: Pagination;
  filters: PostFilters;
  isLoading: boolean;
  error: string | null;

  /* Détail */
  post: Post | null;
  isLoadingPost: boolean;
  postError: string | null;

  /* Tags */
  tags: Tag[];

  /* Actions */
  fetchPosts: (page?: number) => Promise<void>;
  fetchPost: (slug: string) => Promise<void>;
  fetchTags: () => Promise<void>;
  setFilters: (filters: Partial<PostFilters>) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  clearPost: () => void;
  reset: () => void;
}

/* ── Valeurs par défaut ─────────────────────────────────────────── */

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  lastPage: 1,
};

const DEFAULT_FILTERS: PostFilters = {
  locale: "fr",
};

/* ── Store ──────────────────────────────────────────────────────── */

export const usePostsStore = create<PostsState>()((set, get) => ({
  /* Liste */
  posts: [],
  pagination: DEFAULT_PAGINATION,
  filters: DEFAULT_FILTERS,
  isLoading: false,
  error: null,

  /* Détail */
  post: null,
  isLoadingPost: false,
  postError: null,

  /* Tags */
  tags: [],

  /* ── fetchPosts ─────────────────────────────────────────────── */
  fetchPosts: async (page = 1) => {
    const { filters, pagination } = get();
    set({ isLoading: true, error: null });

    try {
      const params: GetPostsParams = {
        locale: filters.locale,
        page,
        limit: pagination.limit,
        ...(filters.tag ? { tag: filters.tag } : {}),
        ...(filters.q   ? { q:   filters.q   } : {}),
      };

      const res = await getPosts(params);

      set({
        posts: res.data,
        pagination: {
          page:     res.meta.current_page,
          limit:    res.meta.per_page,
          total:    res.meta.total,
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

  /* ── fetchPost ──────────────────────────────────────────────── */
  fetchPost: async (slug) => {
    const { filters } = get();
    set({ isLoadingPost: true, postError: null });

    try {
      const post = await getPost(slug, filters.locale);
      set({ post, isLoadingPost: false });
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ postError: msg, isLoadingPost: false });
      toast.error(msg);
    }
  },

  /* ── fetchTags ──────────────────────────────────────────────── */
  fetchTags: async () => {
    try {
      const tags = await getTags();
      set({ tags });
    } catch {
      // Non critique — pas de message d'erreur visible
    }
  },

  /* ── setFilters ─────────────────────────────────────────────── */
  // Merge les filtres et relance fetchPosts depuis la page 1
  setFilters: async (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    await get().fetchPosts(1);
  },

  /* ── setPage ────────────────────────────────────────────────── */
  setPage: async (page) => {
    await get().fetchPosts(page);
  },

  /* ── clearPost ──────────────────────────────────────────────── */
  clearPost: () => set({ post: null, postError: null }),

  /* ── reset ──────────────────────────────────────────────────── */
  reset: () =>
    set({
      posts: [],
      pagination: DEFAULT_PAGINATION,
      filters: DEFAULT_FILTERS,
      isLoading: false,
      error: null,
      post: null,
      isLoadingPost: false,
      postError: null,
    }),
}));
