"use client";

import "highlight.js/styles/github-dark.css";
import "react-day-picker/style.css";
import { useState, useCallback, useRef, useTransition } from "react";
import { DayPicker } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import TagsInput from "@/components/ui/TagsInput";
import MediaUploader from "@/components/admin/MediaUploader";
import { toast } from "sonner";
import { savePost, publishPost, deletePost, type PostFields } from "@/app/admin/(panel)/posts/actions";

type View = "editor" | "split" | "preview";
type SaveStatus = "idle" | "saving";
type DeleteState = "idle" | "confirm";
type ScheduleState = "idle" | "open";

interface MDXEditorProps {
  initialData?: PostFields;
  existingId?: string;
}

const defaultFields: PostFields = {
  title: "",
  description: "",
  tags: [],
  locale: "fr",
  content: `## Introduction\n\nCommence à écrire ton article ici.\n\n\`\`\`typescript\nconst hello = "world";\nconsole.log(hello);\n\`\`\`\n`,
  coverImage: "",
};

/* ── Composants markdown preview ──────────────────────────────────── */
const previewComponents = {
  h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-4 mt-10 font-display text-2xl font-bold text-text-primary first:mt-0">{children}</h2>
  ),
  h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-3 mt-8 font-display text-xl font-bold text-text-primary">{children}</h3>
  ),
  p: ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-5 leading-relaxed text-text-secondary">{children}</p>
  ),
  ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-5 flex flex-col gap-2 pl-5 text-text-secondary">{children}</ul>
  ),
  ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-5 flex flex-col gap-2 pl-5 text-text-secondary">{children}</ol>
  ),
  li: ({ children }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="list-disc marker:text-accent">{children}</li>
  ),
  strong: ({ children }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-text-primary">{children}</strong>
  ),
  code: ({ children, className }: React.HTMLAttributes<HTMLElement>) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) return <code className={className}>{children}</code>;
    return (
      <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.85em] text-accent">
        {children}
      </code>
    );
  },
  pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="my-6 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-sm leading-relaxed">
      {children}
    </pre>
  ),
  blockquote: ({ children }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="my-6 border-l-2 border-accent pl-4 text-text-secondary italic">{children}</blockquote>
  ),
  hr: () => <hr className="my-10 border-border" />,
  a: ({ children, href }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent">{children}</a>
  ),
};

/* ── Variants ─────────────────────────────────────────────────────── */
const statusVariants: Variants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit:    { opacity: 0, x: 8, transition: { duration: 0.15, ease: "easeIn" } },
};

const confirmBannerVariants: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit:    { height: 0, opacity: 0, transition: { duration: 0.15, ease: "easeIn" } },
};

/* ── Sous-composants ──────────────────────────────────────────────── */
function ViewBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 font-mono text-xs transition-colors duration-150 ${
        active ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[0.65rem] tracking-wider text-text-muted">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

/* ── Composant principal ──────────────────────────────────────────── */
export default function MDXEditor({ initialData, existingId }: MDXEditorProps) {
  const isEditMode = !!existingId;
  const router = useRouter();

  const [fields, setFields] = useState<PostFields>({
    ...(initialData ?? defaultFields),
    title:       initialData?.title       ?? "",
    description: initialData?.description ?? "",
    content:     initialData?.content     ?? defaultFields.content,
    coverImage:  initialData?.coverImage  ?? "",
  });
  const [view, setView] = useState<View>("split");
  const [savedPostId, setSavedPostId] = useState<string | undefined>(existingId);
  const [savedSlug, setSavedSlug] = useState<string | undefined>(undefined);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [deleteState, setDeleteState] = useState<DeleteState>("idle");
  const [scheduleState, setScheduleState] = useState<ScheduleState>("idle");
  const [scheduledDay, setScheduledDay] = useState<Date | undefined>();
  const [scheduleHour, setScheduleHour] = useState("09");
  const [scheduleMinute, setScheduleMinute] = useState("00");
  const [isPending, startTransition] = useTransition();
  const [mediaOpen, setMediaOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const set = useCallback(
    (key: keyof Omit<PostFields, "tags">) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setFields((prev) => ({ ...prev, [key]: e.target.value })),
    []
  );

  const setTags = useCallback(
    (tags: string[]) => setFields((prev) => ({ ...prev, tags })),
    []
  );

  const setCoverImage = useCallback(
    (url: string) => setFields((prev) => ({ ...prev, coverImage: url })),
    []
  );

  const insertAtCursor = useCallback((snippet: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setFields((prev) => ({ ...prev, content: prev.content + "\n" + snippet }));
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = fields.content.slice(0, start);
    const after = fields.content.slice(end);
    const newContent = `${before}\n${snippet}\n${after}`;
    setFields((prev) => ({ ...prev, content: newContent }));
    requestAnimationFrame(() => {
      const pos = start + snippet.length + 2;
      ta.setSelectionRange(pos, pos);
      ta.focus();
    });
  }, [fields.content]);

  const handleSave = () => {
    setSaveStatus("saving");
    startTransition(async () => {
      const result = await savePost(fields, savedPostId);
      setSaveStatus("idle");
      if (result.error) {
        toast.error(result.error);
      } else {
        setSavedPostId(result.id);
        setSavedSlug(result.slug);
        toast.success("Article enregistré");
      }
    });
  };

  const handlePublish = () => {
    if (!fields.title.trim()) { toast.error("Le titre est requis"); return; }
    if (!fields.description.trim()) { toast.error("La description est requise"); return; }
    if (!fields.content.trim()) { toast.error("Le contenu est requis"); return; }
    setSaveStatus("saving");
    startTransition(async () => {
      const saved = await savePost(fields, savedPostId);
      if (saved.error) {
        setSaveStatus("idle");
        toast.error(saved.error);
        return;
      }
      const pubResult = await publishPost(saved.id);
      setSaveStatus("idle");
      if (pubResult.error) {
        toast.error(pubResult.error);
      } else {
        router.push("/admin/posts");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePost(savedPostId!);
      if (result.error) {
        toast.error(result.error);
        setDeleteState("idle");
      } else {
        router.push("/admin/posts");
      }
    });
  };

  const handleSchedule = () => {
    if (!scheduledDay) { toast.error("Sélectionne une date de publication"); return; }
    if (!fields.title.trim()) { toast.error("Le titre est requis"); return; }
    if (!fields.description.trim()) { toast.error("La description est requise"); return; }
    if (!fields.content.trim()) { toast.error("Le contenu est requis"); return; }
    const pad = (n: number) => String(n).padStart(2, "0");
    const formatted = `${scheduledDay.getFullYear()}-${pad(scheduledDay.getMonth() + 1)}-${pad(scheduledDay.getDate())} ${scheduleHour}:${scheduleMinute}:00`;
    setSaveStatus("saving");
    setScheduleState("idle");
    startTransition(async () => {
      const saved = await savePost(fields, savedPostId);
      if (saved.error) {
        setSaveStatus("idle");
        toast.error(saved.error);
        return;
      }
      const res = await fetch(`/api/admin/posts/${saved.id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: formatted }),
      });
      setSaveStatus("idle");
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { errors?: { message: string }[]; message?: string; error?: string };
        const msg = data.errors?.[0]?.message ?? data.message ?? data.error ?? `Erreur ${res.status}`;
        toast.error(msg);
      } else {
        toast.success("Publication planifiée");
        router.push("/admin/posts");
      }
    });
  };

  return (
    <div className="flex h-full flex-col gap-0 -m-6">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="font-mono text-xs text-text-muted transition-colors hover:text-accent"
          >
            ← Articles
          </Link>
          <span className="text-border">|</span>
          <div className="flex overflow-hidden rounded-lg border border-border">
            <ViewBtn active={view === "editor"}  onClick={() => setView("editor")}>Éditeur</ViewBtn>
            <ViewBtn active={view === "split"}   onClick={() => setView("split")}>Split</ViewBtn>
            <ViewBtn active={view === "preview"} onClick={() => setView("preview")}>Aperçu</ViewBtn>
          </div>
          <button
            onClick={() => setMediaOpen(true)}
            className="flex items-center gap-1.5 font-mono text-xs text-text-muted transition-colors hover:text-accent"
            title="Insérer un média"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Média
          </button>
          {isEditMode && deleteState === "idle" && (
            <button
              onClick={() => setDeleteState("confirm")}
              disabled={isPending}
              className="font-mono text-xs text-text-muted transition-colors hover:text-red-400 disabled:opacity-40"
            >
              Supprimer
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {saveStatus === "saving" && (
              <motion.span
                key="saving"
                variants={statusVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="font-mono text-xs text-text-muted"
              >
                Sauvegarde…
              </motion.span>
            )}
          </AnimatePresence>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg border border-border px-4 py-1.5 font-mono text-xs text-text-secondary transition-all hover:border-accent/40 hover:text-accent disabled:opacity-40"
          >
            Enregistrer
          </button>
          <button
            onClick={() => setScheduleState(scheduleState === "open" ? "idle" : "open")}
            disabled={isPending}
            className={`rounded-lg border px-4 py-1.5 font-mono text-xs transition-all disabled:opacity-40 ${
              scheduleState === "open"
                ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                : "border-border text-text-secondary hover:border-amber-500/40 hover:text-amber-400"
            }`}
          >
            Planifier
          </button>
          <button
            onClick={handlePublish}
            disabled={isPending}
            className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-1.5 font-mono text-xs text-accent transition-all hover:bg-accent/15 hover:border-accent/60 disabled:opacity-40"
          >
            {isEditMode ? "Mettre à jour →" : "Publier →"}
          </button>
        </div>
      </div>

      {/* ── Bannière planification ───────────────────────────────── */}
      <AnimatePresence>
        {scheduleState === "open" && (
          <motion.div
            variants={confirmBannerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-6 border-b border-amber-500/20 bg-amber-500/5 px-6 py-5">
              {/* Calendrier */}
              <div className="flex flex-col gap-2">
                <p className="font-mono text-[0.65rem] tracking-wider text-amber-400">⏰ DATE DE PUBLICATION</p>
                <DayPicker
                  mode="single"
                  selected={scheduledDay}
                  onSelect={setScheduledDay}
                  disabled={{ before: new Date() }}
                  locale={fr}
                  components={{
                    Chevron: ({ orientation }: { className?: string; size?: number; disabled?: boolean; orientation?: "left" | "right" | "up" | "down" }) => (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        {orientation === "left"
                          ? <polyline points="15 18 9 12 15 6" />
                          : <polyline points="9 18 15 12 9 6" />}
                      </svg>
                    ),
                  }}
                  classNames={{
                    root: "!m-0",
                    month_caption: "relative flex items-center justify-center py-1 mb-3",
                    caption_label: "font-mono text-xs font-semibold text-text-primary capitalize",
                    nav: "absolute inset-x-0 top-0 flex items-center justify-between",
                    button_previous: "flex h-6 w-6 items-center justify-center rounded border border-border bg-surface text-text-muted transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400",
                    button_next: "flex h-6 w-6 items-center justify-center rounded border border-border bg-surface text-text-muted transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400",
                    month_grid: "w-full border-collapse",
                    weekdays: "flex",
                    weekday: "flex-1 pb-2 text-center font-mono text-[0.6rem] uppercase text-text-muted",
                    week: "flex",
                    day: "flex-1 flex items-center justify-center p-0.5",
                    day_button: "h-7 w-7 rounded font-mono text-xs text-text-secondary transition-colors hover:bg-amber-500/10 hover:text-amber-400",
                    selected: "!bg-amber-500/20 !text-amber-400 !font-semibold rounded",
                    today: "!text-accent !font-semibold",
                    outside: "!opacity-25",
                    disabled: "!opacity-20 !cursor-not-allowed",
                  }}
                />
              </div>

              {/* Heure + actions */}
              <div className="flex flex-col justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <p className="font-mono text-[0.65rem] tracking-wider text-text-muted">HEURE</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={scheduleHour}
                      onChange={(e) => setScheduleHour(e.target.value)}
                      className="rounded border border-border bg-bg px-2 py-1.5 font-mono text-sm text-text-primary outline-none focus:border-amber-500/60"
                    >
                      {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="font-mono text-lg text-text-muted">:</span>
                    <select
                      value={scheduleMinute}
                      onChange={(e) => setScheduleMinute(e.target.value)}
                      className="rounded border border-border bg-bg px-2 py-1.5 font-mono text-sm text-text-primary outline-none focus:border-amber-500/60"
                    >
                      {["00", "15", "30", "45"].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  {scheduledDay && (
                    <p className="font-mono text-xs text-amber-400/80">
                      {scheduledDay.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à {scheduleHour}h{scheduleMinute}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setScheduleState("idle"); setScheduledDay(undefined); setScheduleHour("09"); setScheduleMinute("00"); }}
                    disabled={isPending}
                    className="rounded border border-border px-3 py-1.5 font-mono text-xs text-text-muted transition-colors hover:text-text-primary disabled:opacity-40"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSchedule}
                    disabled={isPending || !scheduledDay}
                    className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-mono text-xs text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-40"
                  >
                    {isPending ? "Planification…" : "Confirmer →"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bannière confirmation suppression ───────────────────── */}
      <AnimatePresence>
        {deleteState === "confirm" && (
          <motion.div
            variants={confirmBannerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="flex items-center gap-4 border-b border-red-500/20 bg-red-500/5 px-6 py-3">
              <span className="font-mono text-xs text-red-400">
                ⚠ Supprimer cet article définitivement ?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteState("idle")}
                  disabled={isPending}
                  className="rounded border border-border px-3 py-1 font-mono text-xs text-text-muted transition-colors hover:text-text-primary disabled:opacity-40"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="rounded border border-red-500/40 bg-red-500/10 px-3 py-1 font-mono text-xs text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-40"
                >
                  {isPending ? "Suppression…" : "Oui, supprimer"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Corps ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Panneau éditeur ─────────────────────────────────── */}
        {view !== "preview" && (
          <div className={`flex flex-col gap-4 overflow-y-auto border-r border-border p-6 ${view === "split" ? "w-1/2" : "w-full max-w-2xl"}`}>

            <Field label="LOCALE">
              <select
                value={fields.locale}
                onChange={set("locale")}
                disabled={isEditMode}
                className={inputCls}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </Field>

            <Field label="TITRE">
              <input
                type="text"
                value={fields.title}
                onChange={set("title")}
                placeholder="Mon article"
                className={inputCls}
              />
            </Field>

            <Field label="DESCRIPTION">
              <input
                type="text"
                value={fields.description}
                onChange={set("description")}
                placeholder="Résumé en une ligne"
                className={inputCls}
              />
            </Field>

            <Field label="TAGS">
              <TagsInput
                value={fields.tags}
                onChange={setTags}
                placeholder="Spring Boot, Docker…"
              />
            </Field>

            <Field label="IMAGE DE COUVERTURE">
              <div className="flex flex-col gap-2">
                {fields.coverImage ? (
                  <div className="group relative overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fields.coverImage}
                      alt="Couverture"
                      className="h-32 w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setCoverOpen(true)}
                        className="rounded border border-white/30 bg-black/60 px-3 py-1 font-mono text-xs text-white hover:bg-black/80"
                      >
                        Changer
                      </button>
                      <button
                        type="button"
                        onClick={() => setFields((prev) => ({ ...prev, coverImage: null }))}
                        className="rounded border border-red-500/40 bg-red-500/20 px-3 py-1 font-mono text-xs text-red-400 hover:bg-red-500/30"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCoverOpen(true)}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 font-mono text-xs text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Ajouter une image de couverture
                  </button>
                )}
              </div>
            </Field>

            {savedSlug && (
              <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-surface/50 px-3 py-2">
                <span className="font-mono text-[0.65rem] tracking-wider text-text-muted">SLUG</span>
                <span className="font-mono text-xs text-text-secondary">{savedSlug}</span>
              </div>
            )}

            <Field label="CONTENU MDX">
              <textarea
                ref={textareaRef}
                value={fields.content}
                onChange={set("content")}
                spellCheck={false}
                className={`${inputCls} min-h-[400px] resize-y font-mono text-xs leading-relaxed`}
              />
            </Field>
          </div>
        )}

        {/* ── Panneau preview ─────────────────────────────────── */}
        {view !== "editor" && (
          <div className={`overflow-y-auto ${view === "split" ? "w-1/2" : "w-full"}`}>
            <div className="border-b border-border px-6 py-3">
              <p className="font-mono text-xs tracking-wider text-text-muted">{"// aperçu"}</p>
            </div>

            <div className="px-8 py-8">
              {fields.title && (
                <div className="mb-10 border-b border-border pb-8">
                  {fields.coverImage && (
                    <div className="mb-6 overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fields.coverImage} alt="Couverture" className="h-48 w-full object-cover" />
                    </div>
                  )}
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.6rem] uppercase text-text-muted">
                      {fields.locale}
                    </span>
                    {fields.tags.map((t) => (
                      <span key={t} className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.6rem] text-text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h1 className="font-display text-3xl font-bold text-text-primary">{fields.title}</h1>
                  {fields.description && (
                    <p className="mt-3 font-mono text-sm text-text-secondary">{fields.description}</p>
                  )}
                </div>
              )}

              <div className="blog-prose">
                <ReactMarkdown
                  rehypePlugins={[rehypeHighlight]}
                  components={previewComponents as never}
                >
                  {fields.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Media uploader modal (insert) ───────────────────────── */}
      <AnimatePresence>
        {mediaOpen && (
          <MediaUploader
            onInsert={insertAtCursor}
            onClose={() => setMediaOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Media uploader modal (cover) ────────────────────────── */}
      <AnimatePresence>
        {coverOpen && (
          <MediaUploader
            mode="cover"
            onInsert={() => {}}
            onSelectCover={setCoverImage}
            onClose={() => setCoverOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
