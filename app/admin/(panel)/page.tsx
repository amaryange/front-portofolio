import Link from "next/link";
import { serverFetch } from "@/lib/api/server";
import { normalizeTags, type PostSummary } from "@/lib/api/posts";
import type { Experience, Project, SkillGroup } from "@/lib/api/portfolio";
import { getPostHogDashboardStats } from "@/lib/posthog-server";

export const dynamic = "force-dynamic";

/* ── Helpers ────────────────────────────────────────────────────── */

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

/** Convertit un code pays ISO 3166-1 alpha-2 en emoji drapeau */
function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

/* ── Icônes ─────────────────────────────────────────────────────── */
function ArticlesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function ExperienceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function SkillsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ExternalIcon({ size = "4" }: { size?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-${size} w-${size}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default async function AdminDashboard() {
  // Fetch all data in parallel, silently fail
  const [postsRes, experiencesRes, projectsRes, skillsRes, phStats] = await Promise.allSettled([
    serverFetch<{ data: PostSummary[] }>("/admin/posts?limit=200"),
    serverFetch<{ data: Experience[] }>("/admin/experiences"),
    serverFetch<{ data: Project[] }>("/admin/projects"),
    serverFetch<{ data: SkillGroup[] }>("/admin/skills"),
    getPostHogDashboardStats(),
  ]);

  const allPosts: PostSummary[] = postsRes.status === "fulfilled"
    ? (postsRes.value.data ?? []).map((p) => ({ ...p, tags: normalizeTags(p.tags as never) }))
    : [];
  const experiences: Experience[] = experiencesRes.status === "fulfilled" ? (experiencesRes.value.data ?? []) : [];
  const projects: Project[] = projectsRes.status === "fulfilled" ? (projectsRes.value.data ?? []) : [];
  const skillGroups: SkillGroup[] = skillsRes.status === "fulfilled" ? (skillsRes.value.data ?? []) : [];
  const phStatsValue = phStats.status === "fulfilled" ? phStats.value : null;

  const frPosts = allPosts.filter((p) => p.locale === "fr");
  const enPosts = allPosts.filter((p) => p.locale === "en");
  const totalArticles = allPosts.length;
  const experienceCount = experiences.length;
  const projectCount = projects.length;
  const skillTechCount = skillGroups.reduce((acc, g) => acc + g.skills.length, 0);

  const recentPosts = [...allPosts]
    .sort((a, b) => {
      const da = a.publishedAt ?? a.createdAt;
      const db = b.publishedAt ?? b.createdAt;
      return da > db ? -1 : 1;
    })
    .slice(0, 5);

  const today = formatDate(new Date());
  const frRatio = totalArticles > 0 ? (frPosts.length / totalArticles) * 100 : 50;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.18em] text-text-muted">
            // dashboard
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold capitalize text-text-primary">
            {today}
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="font-mono text-xs text-text-secondary">en ligne</span>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {/* Articles */}
        <Link
          href="/admin/posts"
          className="group relative col-span-2 overflow-hidden rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:border-accent/40 hover:shadow-[0_0_24px_rgba(0,212,170,0.05)] sm:col-span-1"
        >
          <div className="flex items-start justify-between">
            <span className="rounded-lg border border-border bg-bg p-2 text-text-muted transition-colors group-hover:border-accent/30 group-hover:text-accent">
              <ArticlesIcon />
            </span>
            <span className="font-mono text-[0.6rem] tracking-wider text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
              Gérer →
            </span>
          </div>
          <div className="mt-4">
            <p className="font-display text-4xl font-bold text-text-primary">{totalArticles}</p>
            <p className="mt-1 font-mono text-xs text-text-secondary">Articles</p>
          </div>
          {totalArticles > 0 && (
            <div className="mt-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="w-4 font-mono text-[0.6rem] text-text-muted">FR</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${frRatio}%` }} />
                </div>
                <span className="w-3 text-right font-mono text-[0.6rem] text-text-muted">{frPosts.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 font-mono text-[0.6rem] text-text-muted">EN</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-accent/50 transition-all duration-500" style={{ width: `${100 - frRatio}%` }} />
                </div>
                <span className="w-3 text-right font-mono text-[0.6rem] text-text-muted">{enPosts.length}</span>
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        {/* Expériences */}
        <Link
          href="/admin/portfolio/experience"
          className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:border-accent/40 hover:shadow-[0_0_24px_rgba(0,212,170,0.05)]"
        >
          <div className="flex items-start justify-between">
            <span className="rounded-lg border border-border bg-bg p-2 text-text-muted transition-colors group-hover:border-accent/30 group-hover:text-accent">
              <ExperienceIcon />
            </span>
            <span className="font-mono text-[0.6rem] tracking-wider text-text-muted opacity-0 transition-opacity group-hover:opacity-100">Gérer →</span>
          </div>
          <div className="mt-4">
            <p className="font-display text-4xl font-bold text-text-primary">{experienceCount}</p>
            <p className="mt-1 font-mono text-xs text-text-secondary">Expériences</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-1">
            {Array.from({ length: Math.min(experienceCount, 8) }).map((_, i) => (
              <span key={i} className="h-1.5 w-6 rounded-full bg-accent/30 transition-colors group-hover:bg-accent/50" />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        {/* Projets */}
        <Link
          href="/admin/portfolio/projects"
          className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:border-accent/40 hover:shadow-[0_0_24px_rgba(0,212,170,0.05)]"
        >
          <div className="flex items-start justify-between">
            <span className="rounded-lg border border-border bg-bg p-2 text-text-muted transition-colors group-hover:border-accent/30 group-hover:text-accent">
              <ProjectsIcon />
            </span>
            <span className="font-mono text-[0.6rem] tracking-wider text-text-muted opacity-0 transition-opacity group-hover:opacity-100">Gérer →</span>
          </div>
          <div className="mt-4">
            <p className="font-display text-4xl font-bold text-text-primary">{projectCount}</p>
            <p className="mt-1 font-mono text-xs text-text-secondary">Projets référencés</p>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-1">
            {Array.from({ length: Math.min(projectCount, 8) }).map((_, i) => (
              <span key={i} className="aspect-square rounded-md bg-accent/20 transition-colors group-hover:bg-accent/35" />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        {/* Compétences */}
        <Link
          href="/admin/portfolio/skills"
          className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:border-accent/40 hover:shadow-[0_0_24px_rgba(0,212,170,0.05)]"
        >
          <div className="flex items-start justify-between">
            <span className="rounded-lg border border-border bg-bg p-2 text-text-muted transition-colors group-hover:border-accent/30 group-hover:text-accent">
              <SkillsIcon />
            </span>
            <span className="font-mono text-[0.6rem] tracking-wider text-text-muted opacity-0 transition-opacity group-hover:opacity-100">Éditer →</span>
          </div>
          <div className="mt-4">
            <p className="font-display text-4xl font-bold text-text-primary">{skillTechCount}</p>
            <p className="mt-1 font-mono text-xs text-text-secondary">Technologies</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-1">
            {skillGroups.map((g) => (
              <span key={g.id} className="rounded-full border border-accent/20 px-2 py-0.5 font-mono text-[0.55rem] text-accent/40 transition-colors group-hover:border-accent/40 group-hover:text-accent/60">
                {g.name}
              </span>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>
      </div>

      {/* ── Analytics PostHog ───────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[0.65rem] tracking-wider text-text-muted">
              // analytics — 30 derniers jours
            </p>
            {phStatsValue && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[0.55rem] text-accent">
                live
              </span>
            )}
          </div>
          <a
            href="https://eu.posthog.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-text-muted transition-colors hover:text-accent-warm"
          >
            PostHog
            <ExternalIcon size="3" />
          </a>
        </div>

        {phStatsValue ? (
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
            {/* Chiffres clés */}
            <div className="flex flex-col gap-6 p-6 sm:border-r sm:border-border">
              <div>
                <p className="font-mono text-[0.6rem] tracking-wider text-text-muted">PAGES VUES</p>
                <p className="mt-1.5 font-display text-5xl font-bold text-text-primary">
                  {fmt(phStatsValue.pageviews30d)}
                </p>
              </div>
              <div>
                <p className="font-mono text-[0.6rem] tracking-wider text-text-muted">VISITEURS UNIQUES</p>
                <p className="mt-1.5 font-display text-3xl font-bold text-text-secondary">
                  {fmt(phStatsValue.uniqueVisitors30d)}
                </p>
              </div>
            </div>

            {/* Sources */}
            <div className="flex flex-col gap-3 p-6 sm:border-r sm:border-border">
              <p className="font-mono text-[0.6rem] tracking-wider text-text-muted">PAR RÉSEAU / SOURCE</p>
              {phStatsValue.bySource.length === 0 ? (
                <p className="font-mono text-sm text-text-muted">Aucune donnée.</p>
              ) : (
                phStatsValue.bySource.map(({ source, count, pct }) => (
                  <div key={source} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-text-secondary">{source}</span>
                      <span className="font-mono text-xs text-text-muted">
                        {fmt(count)}{" "}
                        <span className="text-text-muted/50">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-accent-warm/60 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Top pays */}
            <div className="flex flex-col gap-3 p-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[0.6rem] tracking-wider text-text-muted">TOP 5 PAYS</p>
                <Link href="/admin/analytics" className="font-mono text-[0.6rem] text-text-muted transition-colors hover:text-accent">
                  Voir tout →
                </Link>
              </div>
              {phStatsValue.byCountry.length === 0 ? (
                <p className="font-mono text-sm text-text-muted">Aucune donnée.</p>
              ) : (
                phStatsValue.byCountry.map(({ country, code, count, pct }) => (
                  <div key={code} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-mono text-xs text-text-secondary">
                        <span className="text-sm leading-none" aria-hidden>
                          {countryCodeToFlag(code)}
                        </span>
                        {country}
                      </span>
                      <span className="font-mono text-xs text-text-muted">
                        {fmt(count)}{" "}
                        <span className="text-text-muted/50">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-accent/60 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="font-mono text-sm text-text-secondary">
                Configurez PostHog pour voir vos analytics ici.
              </p>
              <p className="mt-1 font-mono text-xs text-text-muted">
                Ajoutez <code className="rounded bg-border px-1 py-0.5 text-accent">POSTHOG_PROJECT_ID</code> et{" "}
                <code className="rounded bg-border px-1 py-0.5 text-accent">POSTHOG_PERSONAL_API_KEY</code> dans <code className="rounded bg-border px-1 py-0.5 text-text-secondary">.env.local</code>
              </p>
            </div>
            <a
              href="https://eu.posthog.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg border border-accent-warm/30 bg-accent-warm/8 px-4 py-2 font-mono text-xs text-accent-warm transition-all hover:bg-accent-warm/12"
            >
              Ouvrir PostHog →
            </a>
          </div>
        )}
      </div>

      {/* ── Contenu ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Articles récents ── 2/3 */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <p className="font-mono text-[0.65rem] tracking-wider text-text-muted">
              // articles récents
            </p>
            <Link href="/admin/posts" className="font-mono text-xs text-text-muted transition-colors hover:text-accent">
              Voir tous →
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-5 py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="text-text-muted opacity-40"><ArticlesIcon /></span>
                <p className="font-mono text-sm text-text-muted">Aucun article pour l&apos;instant.</p>
                <Link href="/admin/posts/new" className="mt-1 font-mono text-xs text-accent transition-opacity hover:opacity-80">
                  Rédiger le premier →
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="group flex items-center gap-4 px-5 py-3.5 transition-colors duration-100 hover:bg-accent/[0.03]"
                  >
                    <span className="shrink-0 rounded-full border border-border bg-bg px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider text-text-muted">
                      {post.locale}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-sm text-text-primary">
                      {post.title}
                    </span>
                    {post.tags.length > 0 && (
                      <div className="hidden shrink-0 items-center gap-1 sm:flex">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.55rem] text-text-muted">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.55rem] ${
                      post.status === "published"
                        ? "bg-accent/10 text-accent"
                        : "border border-border text-text-muted"
                    }`}>
                      {post.status === "published" ? "publié" : "brouillon"}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-text-muted opacity-0 transition-opacity group-hover:opacity-100">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Accès rapide ── 1/3 */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <p className="font-mono text-[0.65rem] tracking-wider text-text-muted">// accès rapide</p>
            </div>
            <div className="flex flex-col gap-2 p-4">
              <Link
                href="/admin/posts/new"
                className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/8 px-4 py-3 font-mono text-sm text-accent transition-all hover:border-accent/50 hover:bg-accent/12"
              >
                <span>+ Nouvel article</span>
                <span className="text-accent/60">→</span>
              </Link>
              <Link href="/admin/portfolio/experience/new" className="flex items-center justify-between rounded-lg border border-border bg-bg px-4 py-3 font-mono text-sm text-text-secondary transition-all hover:border-accent/30 hover:text-text-primary">
                <span>+ Nouvelle expérience</span>
                <span className="text-text-muted">→</span>
              </Link>
              <Link href="/admin/portfolio/projects/new" className="flex items-center justify-between rounded-lg border border-border bg-bg px-4 py-3 font-mono text-sm text-text-secondary transition-all hover:border-accent/30 hover:text-text-primary">
                <span>+ Nouveau projet</span>
                <span className="text-text-muted">→</span>
              </Link>
              <Link href="/admin/portfolio/skills" className="flex items-center justify-between rounded-lg border border-border bg-bg px-4 py-3 font-mono text-sm text-text-secondary transition-all hover:border-accent/30 hover:text-text-primary">
                <span>Éditer les compétences</span>
                <span className="text-text-muted">→</span>
              </Link>
              <Link href="/admin/posts" className="flex items-center justify-between rounded-lg border border-border bg-bg px-4 py-3 font-mono text-sm text-text-secondary transition-all hover:border-accent/30 hover:text-text-primary">
                <span>Gérer les articles</span>
                <span className="text-text-muted">→</span>
              </Link>
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="group flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-all hover:border-accent/30"
          >
            <div>
              <p className="font-mono text-xs text-text-secondary">Voir le site en direct</p>
              <p className="mt-0.5 font-mono text-[0.6rem] text-text-muted">localhost:3000</p>
            </div>
            <span className="text-text-muted transition-colors group-hover:text-accent">
              <ExternalIcon />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
