import { create } from "zustand";
import { toast } from "sonner";
import {
  getSubscribers,
  deleteSubscriber,
  exportSubscribersCsv,
  type Subscriber,
} from "@/lib/api/admin/newsletter";
import { getErrorMessage } from "@/lib/api/client";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}

interface AdminNewsletterState {
  subscribers: Subscriber[];
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
  isExporting: boolean;

  fetchSubscribers: (page?: number) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  deleteSubscriber: (id: string) => Promise<void>;
  exportCsv: () => Promise<void>;
}

const DEFAULT_PAGINATION: Pagination = {
  page: 1, limit: 20, total: 0, lastPage: 1,
};

export const useAdminNewsletterStore = create<AdminNewsletterState>()(
  (set, get) => ({
    subscribers: [],
    pagination: DEFAULT_PAGINATION,
    isLoading: false,
    error: null,
    isExporting: false,

    fetchSubscribers: async (page = 1) => {
      set({ isLoading: true, error: null });
      try {
        const res = await getSubscribers(page);
        set({
          subscribers: res.data,
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

    setPage: async (page) => get().fetchSubscribers(page),

    deleteSubscriber: async (id) => {
      const tid = toast.loading("Suppression…");
      try {
        await deleteSubscriber(id);
        set((s) => ({
          subscribers: s.subscribers.filter((sub) => sub.id !== id),
          pagination: { ...s.pagination, total: s.pagination.total - 1 },
        }));
        toast.success("Abonné supprimé", { id: tid });
      } catch (err) {
        toast.error(getErrorMessage(err), { id: tid });
      }
    },

    exportCsv: async () => {
      set({ isExporting: true });
      const tid = toast.loading("Export en cours…");
      try {
        await exportSubscribersCsv();
        toast.success("CSV téléchargé", { id: tid });
      } catch (err) {
        toast.error(getErrorMessage(err), { id: tid });
      } finally {
        set({ isExporting: false });
      }
    },
  })
);
