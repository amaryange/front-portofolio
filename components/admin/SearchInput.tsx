"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";

interface SearchInputProps {
  defaultValue?: string;
  placeholder?: string;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function SearchInput({ defaultValue = "", placeholder = "Rechercher…" }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  // Debounce URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams();
        if (value) params.set("q", value);
        // Always reset to page 1 on new search
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [value, pathname, router]);

  return (
    <div className="relative flex items-center">
      <span className={`pointer-events-none absolute left-3 transition-colors duration-150 ${isPending ? "text-accent" : "text-text-muted"}`}>
        <SearchIcon />
      </span>

      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-border bg-bg pl-9 pr-8 font-mono text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors duration-150 focus:border-accent/60 focus:ring-1 focus:ring-accent/30"
      />

      {/* Indicateur de chargement / bouton clear */}
      <span className="absolute right-3 flex items-center">
        {isPending ? (
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 w-1 rounded-full bg-accent animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        ) : value ? (
          <button
            type="button"
            onClick={() => setValue("")}
            className="font-mono text-sm leading-none text-text-muted transition-colors hover:text-text-primary"
            aria-label="Effacer la recherche"
          >
            ×
          </button>
        ) : null}
      </span>
    </div>
  );
}
