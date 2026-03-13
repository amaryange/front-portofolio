"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

const titles: Record<string, string> = {
  "/admin":                              "Dashboard",
  "/admin/posts":                        "Articles",
  "/admin/portfolio":                    "Portfolio",
  "/admin/portfolio/experience":         "Expériences",
  "/admin/portfolio/projects":           "Projets",
  "/admin/portfolio/skills":             "Compétences",
};

export default function AdminHeader() {
  const pathname = usePathname();

  const title =
    Object.entries(titles)
      .reverse()
      .find(([key]) => pathname.startsWith(key))?.[1] ?? "Admin";

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border px-6">
      <h1 className="font-mono text-sm font-medium text-text-primary">
        {title}
      </h1>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-mono text-xs text-text-muted">en ligne</span>
        </div>
      </div>
    </header>
  );
}
