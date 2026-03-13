import { create } from "zustand";
import { toast } from "sonner";
import {
  getContacts,
  getContact,
  updateContactStatus,
  deleteContact,
  exportContactsCsv,
  type Contact,
  type ContactStatus,
  type GetContactsParams,
} from "@/lib/api/admin/contacts";
import { getErrorMessage } from "@/lib/api/client";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}

interface AdminContactsState {
  contacts: Contact[];
  pagination: Pagination;
  statusFilter: ContactStatus | undefined;
  isLoading: boolean;
  error: string | null;

  contact: Contact | null;
  isLoadingContact: boolean;

  isExporting: boolean;

  fetchContacts: (page?: number) => Promise<void>;
  fetchContact: (id: string) => Promise<void>;
  setStatusFilter: (status: ContactStatus | undefined) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  updateStatus: (id: string, status: ContactStatus) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  exportCsv: () => Promise<void>;
  clearContact: () => void;
}

const DEFAULT_PAGINATION: Pagination = {
  page: 1, limit: 20, total: 0, lastPage: 1,
};

export const useAdminContactsStore = create<AdminContactsState>()(
  (set, get) => ({
    contacts: [],
    pagination: DEFAULT_PAGINATION,
    statusFilter: undefined,
    isLoading: false,
    error: null,
    contact: null,
    isLoadingContact: false,
    isExporting: false,

    fetchContacts: async (page = 1) => {
      const { statusFilter } = get();
      set({ isLoading: true, error: null });
      try {
        const params: GetContactsParams = {
          page,
          ...(statusFilter ? { status: statusFilter } : {}),
        };
        const res = await getContacts(params);
        set({
          contacts: res.data,
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

    fetchContact: async (id) => {
      set({ isLoadingContact: true, error: null });
      try {
        const contact = await getContact(id);
        if (contact.status === "unread") {
          await updateContactStatus(id, "read");
          contact.status = "read";
        }
        set({ contact, isLoadingContact: false });
      } catch (err) {
        const msg = getErrorMessage(err);
        set({ error: msg, isLoadingContact: false });
        toast.error(msg);
      }
    },

    setStatusFilter: async (status) => {
      set({ statusFilter: status });
      await get().fetchContacts(1);
    },

    setPage: async (page) => get().fetchContacts(page),

    updateStatus: async (id, status) => {
      const tid = toast.loading("Mise à jour…");
      try {
        await updateContactStatus(id, status);
        set((s) => ({
          contacts: s.contacts.map((c) => (c.id === id ? { ...c, status } : c)),
          contact: s.contact?.id === id ? { ...s.contact, status } : s.contact,
        }));
        const labels: Record<ContactStatus, string> = {
          unread: "Non lu",
          read: "Lu",
          replied: "Répondu",
        };
        toast.success(`Statut : ${labels[status]}`, { id: tid });
      } catch (err) {
        toast.error(getErrorMessage(err), { id: tid });
      }
    },

    deleteContact: async (id) => {
      const tid = toast.loading("Suppression…");
      try {
        await deleteContact(id);
        set((s) => ({
          contacts: s.contacts.filter((c) => c.id !== id),
          contact: s.contact?.id === id ? null : s.contact,
        }));
        toast.success("Message supprimé", { id: tid });
      } catch (err) {
        toast.error(getErrorMessage(err), { id: tid });
      }
    },

    exportCsv: async () => {
      set({ isExporting: true });
      const tid = toast.loading("Export en cours…");
      try {
        await exportContactsCsv();
        toast.success("CSV téléchargé", { id: tid });
      } catch (err) {
        toast.error(getErrorMessage(err), { id: tid });
      } finally {
        set({ isExporting: false });
      }
    },

    clearContact: () => set({ contact: null }),
  })
);
