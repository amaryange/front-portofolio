"use client";

import { useRouter, usePathname } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  query: string;
  locale?: string;
  tags?: string[];
}

function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const range: (number | "…")[] = [1];
  if (current > 3) range.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) range.push(i);

  if (current < total - 2) range.push("…");
  range.push(total);

  return range;
}

export default function Pagination({ currentPage, totalPages, query, locale = "", tags = [] }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  const navigate = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (locale) params.set("locale", locale);
    if (tags.length) params.set("tags", tags.join(","));
    params.set("page", String(page));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const pages = getPageRange(currentPage, totalPages);

  const btnBase =
    "flex h-8 min-w-[32px] items-center justify-center rounded-lg border font-mono text-xs transition-all duration-150 px-2";

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Info */}
      <p className="font-mono text-xs text-text-muted">
        Page {currentPage} / {totalPages}
      </p>

      {/* Pages */}
      <div className="flex items-center gap-1">
        {/* Précédent */}
        <button
          onClick={() => navigate(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`${btnBase} gap-1.5 border-border text-text-muted hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30`}
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Numéros */}
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center font-mono text-xs text-text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => navigate(p as number)}
              className={`${btnBase} ${
                p === currentPage
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border text-text-secondary hover:border-accent/30 hover:text-accent"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Suivant */}
        <button
          onClick={() => navigate(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`${btnBase} gap-1.5 border-border text-text-muted hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30`}
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
