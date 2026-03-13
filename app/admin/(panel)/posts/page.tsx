import Link from "next/link";
import { serverFetch } from "@/lib/api/server";
import { normalizeTags, type PostSummary } from "@/lib/api/posts";
import SearchInput from "@/components/admin/SearchInput";
import PostsFilters from "@/components/admin/PostsFilters";
import Pagination from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 8;

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function NoResultsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; locale?: string; tags?: string }>;
}) {
  const { q = "", page = "1", locale = "", tags = "" } = await searchParams;

  let allPosts: PostSummary[] = [];
  try {
    const res = await serverFetch<{ data: PostSummary[] }>("/admin/posts?limit=200");
    allPosts = (res.data ?? []).map((p) => ({ ...p, tags: normalizeTags(p.tags as never) }));
  } catch {
    allPosts = [];
  }

  const frPosts = allPosts.filter((p) => p.locale === "fr");
  const enPosts = allPosts.filter((p) => p.locale === "en");

  // Tous les tags uniques pour les filtres
  const allTags = [...new Set(allPosts.flatMap((p) => p.tags))].sort();

  // Tags actifs depuis l'URL
  const activeTags = tags ? tags.split(",").filter(Boolean) : [];

  // Filtrage : recherche + locale + tags
  const query = q.toLowerCase().trim();
  const filtered = allPosts.filter((p) => {
    if (locale === "fr" || locale === "en") {
      if (p.locale !== locale) return false;
    }
    if (activeTags.length > 0 && !activeTags.some((t) => p.tags.includes(t))) {
      return false;
    }
    if (query) {
      const match =
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query));
      if (!match) return false;
    }
    return true;
  });

  // Pagination
  const currentPage = Math.max(1, parseInt(page) || 1);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const pagePosts = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.18em] text-text-muted">
            // articles
          </p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-text-primary">Blog</h1>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-xs text-text-secondary">
                {allPosts.length} total
              </span>
              {frPosts.length > 0 && (
                <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-xs text-text-muted">
                  {frPosts.length} fr
                </span>
              )}
              {enPosts.length > 0 && (
                <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-xs text-text-muted">
                  {enPosts.length} en
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs text-accent transition-all hover:border-accent/60 hover:bg-accent/15"
        >
          <PlusIcon />
          Nouvel article
        </Link>
      </div>

      {/* ── Recherche + Filtres ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchInput
              defaultValue={q}
              placeholder="Rechercher par titre, tag, description…"
            />
          </div>
          {(query || locale || activeTags.length > 0) && (
            <p className="shrink-0 font-mono text-xs text-text-muted">
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <PostsFilters
          allTags={allTags}
          currentQ={q}
          currentLocale={locale}
          currentTags={activeTags}
        />
      </div>

      {/* ── Table / États vides ──────────────────────────────────── */}
      {allPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
          <span className="text-text-muted opacity-30"><EmptyIcon /></span>
          <div>
            <p className="font-mono text-sm text-text-secondary">Aucun article pour l&apos;instant.</p>
            <p className="mt-1 font-mono text-xs text-text-muted">Commence par rédiger ton premier article.</p>
          </div>
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs text-accent transition-all hover:border-accent/60 hover:bg-accent/15"
          >
            <PlusIcon />
            Rédiger le premier
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
          <span className="text-text-muted opacity-30"><NoResultsIcon /></span>
          <div>
            <p className="font-mono text-sm text-text-secondary">
              Aucun résultat pour &laquo;{q}&raquo;
            </p>
            <p className="mt-1 font-mono text-xs text-text-muted">
              Essaie un autre titre, tag ou description.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {/* En-têtes */}
            <div className="grid grid-cols-[48px_1fr_60px_100px_auto_120px] border-b border-border bg-bg px-5 py-2.5">
              {["", "TITRE", "LOCALE", "DATE", "TAGS", ""].map((h, i) => (
                <span key={i} className="font-mono text-[0.6rem] tracking-wider text-text-muted">
                  {h}
                </span>
              ))}
            </div>

            {/* Lignes */}
            <ul className="divide-y divide-border">
              {pagePosts.map((post) => {
                const date = post.publishedAt ?? post.createdAt;
                const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
                  year: "numeric", month: "short", day: "numeric",
                });
                const cover = post.coverImage;
                return (
                  <li key={post.id}>
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="group grid grid-cols-[48px_1fr_60px_100px_auto_120px] items-center gap-2 px-5 py-4 transition-colors duration-100 hover:bg-accent/[0.03]"
                    >
                      <div className="h-8 w-8 overflow-hidden rounded border border-border bg-surface">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-text-muted opacity-30">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="truncate font-mono text-sm text-text-primary">
                        {query ? highlightMatch(post.title, query) : post.title}
                      </span>

                      <span>
                        <span className="rounded-full border border-border bg-bg px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider text-text-muted">
                          {post.locale}
                        </span>
                      </span>

                      <span className="font-mono text-xs text-text-muted">{formattedDate}</span>

                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-full border px-2 py-0.5 font-mono text-[0.55rem] ${
                              query && tag.toLowerCase().includes(query)
                                ? "border-accent/40 bg-accent/10 text-accent"
                                : "border-border text-text-muted"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="font-mono text-[0.55rem] text-text-muted">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[0.55rem] ${
                          post.status === "published"
                            ? "bg-accent/10 text-accent"
                            : "bg-surface border border-border text-text-muted"
                        }`}>
                          {post.status === "published" ? "publié" : "brouillon"}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-xs text-text-muted transition-colors group-hover:text-accent">
                          <EditIcon />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            query={q}
            locale={locale}
            tags={activeTags}
          />
        </div>
      )}
    </div>
  );
}

/* ── Highlight match ──────────────────────────────────────────────── */
function highlightMatch(text: string, query: string): React.ReactNode {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-accent/20 text-accent not-italic">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
