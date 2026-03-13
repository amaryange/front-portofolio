"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

interface Props {
  allTags: string[];
  currentQ: string;
  currentLocale: string;
  currentTags: string[];
}

function buildUrl(
  pathname: string,
  q: string,
  locale: string,
  tags: string[]
): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (locale) params.set("locale", locale);
  if (tags.length) params.set("tags", tags.join(","));
  // always reset to page 1 on filter change
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export default function PostsFilters({ allTags, currentQ, currentLocale, currentTags }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const navigate = (locale: string, tags: string[]) => {
    startTransition(() => {
      router.replace(buildUrl(pathname, currentQ, locale, tags));
    });
  };

  const toggleLocale = (locale: string) => {
    navigate(currentLocale === locale ? "" : locale, currentTags);
  };

  const toggleTag = (tag: string) => {
    const next = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    navigate(currentLocale, next);
  };

  const clearAll = () => navigate("", []);

  const hasFilters = !!currentLocale || currentTags.length > 0;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Locale + clear */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.6rem] tracking-wider text-text-muted">
          LOCALE
        </span>

        {[
          { value: "", label: "Tous" },
          { value: "fr", label: "FR" },
          { value: "en", label: "EN" },
        ].map(({ value, label }) => (
          <button
            key={label}
            onClick={() => navigate(value, currentTags)}
            className={`rounded-full border px-3 py-1 font-mono text-[0.65rem] tracking-wider transition-all duration-150 ${
              currentLocale === value
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-border text-text-muted hover:border-accent/30 hover:text-text-secondary"
            }`}
          >
            {label}
          </button>
        ))}

        {hasFilters && (
          <>
            <span className="text-border">|</span>
            <button
              onClick={clearAll}
              className="font-mono text-[0.65rem] text-text-muted transition-colors hover:text-red-400"
            >
              Réinitialiser
            </button>
          </>
        )}
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.6rem] tracking-wider text-text-muted">
            TAGS
          </span>
          {allTags.map((tag) => {
            const active = currentTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[0.65rem] transition-all duration-150 ${
                  active
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-border text-text-muted hover:border-accent/30 hover:text-text-secondary"
                }`}
              >
                {tag}
                {active && <span className="leading-none">×</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
