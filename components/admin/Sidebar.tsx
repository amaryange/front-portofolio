"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { logoutAction } from "@/app/admin/actions";

/* ── Tooltip fixe (échappe à overflow-hidden du motion.aside) ─────── */
function SidebarTooltip({
  label,
  show,
  children,
}: {
  label: string;
  show: boolean;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [top, setTop] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const onEnter = useCallback(() => {
    if (!show) return;
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setTop(rect.top + rect.height / 2);
    setVisible(true);
  }, [show]);

  const onLeave = useCallback(() => setVisible(false), []);

  // Hide tooltip if sidebar expands while hovering
  useEffect(() => {
    if (!show) setVisible(false);
  }, [show]);

  return (
    <div ref={ref} onMouseEnter={onEnter} onMouseLeave={onLeave} className="w-full">
      {children}
      <AnimatePresence>
        {visible && show && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.13, ease: "easeOut" }}
            style={{ top, left: 64 }}
            className="pointer-events-none fixed z-[200] -translate-y-1/2 rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-xs text-text-primary shadow-lg"
          >
            {/* Flèche */}
            <span
              className="absolute -left-[5px] top-1/2 -translate-y-1/2 border-4 border-transparent border-r-border"
              aria-hidden
            />
            <span
              className="absolute -left-[4px] top-1/2 -translate-y-1/2 border-4 border-transparent border-r-surface"
              aria-hidden
            />
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const PostsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const PortfolioIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const navItems = [
  { label: "Dashboard",  href: "/admin",           icon: <DashboardIcon />, external: false },
  { label: "Articles",   href: "/admin/posts",      icon: <PostsIcon />,     external: false },
  { label: "Portfolio",  href: "/admin/portfolio",  icon: <PortfolioIcon />, external: false },
  { label: "Analytics",  href: "https://eu.posthog.com", icon: <AnalyticsIcon />, external: true },
];

const STORAGE_KEY = "admin-sidebar-collapsed";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setCollapsed(stored === "true");
    setMounted(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem(STORAGE_KEY, String(!prev));
      return !prev;
    });
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  // Avoid width flash on first render
  if (!mounted) return <aside className="w-60 shrink-0 border-r border-border bg-surface" />;

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 240 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-surface"
    >
      {/* Brand + toggle */}
      <div className="flex h-[57px] shrink-0 items-center justify-between border-b border-border px-3">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex min-w-0 flex-col pl-1"
            >
              <p className="font-mono text-[0.55rem] tracking-[0.2em] text-text-muted">
                // admin
              </p>
              <span className="truncate font-display text-sm font-bold leading-tight text-text-primary">
                M. Amary
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggle}
          title={collapsed ? "Déployer la sidebar" : "Réduire la sidebar"}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-accent/40 hover:text-accent ${
            collapsed ? "mx-auto" : ""
          }`}
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <polyline points="15 18 9 12 15 6" />
          </motion.svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = !item.external && isActive(item.href);
            const baseClass = `flex items-center rounded-lg px-3 py-2.5 font-mono text-sm transition-colors duration-150 ${
              collapsed ? "justify-center" : "gap-3"
            }`;
            const colorClass = active
              ? "bg-accent/10 text-accent"
              : item.external
              ? "text-text-muted hover:bg-surface/80 hover:text-accent-warm"
              : "text-text-secondary hover:bg-surface/80 hover:text-text-primary";

            return (
              <li key={item.href}>
                <SidebarTooltip label={item.label} show={collapsed}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${baseClass} ${colorClass}`}
                    >
                      <span className="text-text-muted">{item.icon}</span>
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && (
                        <svg viewBox="0 0 24 24" className="ml-auto h-3 w-3 shrink-0 opacity-40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      )}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={`${baseClass} ${colorClass}`}
                    >
                      <span className={active ? "text-accent" : "text-text-muted"}>
                        {item.icon}
                      </span>
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {active && !collapsed && (
                        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      )}
                    </Link>
                  )}
                </SidebarTooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-1 border-t border-border px-2 py-3">
        <SidebarTooltip label="Voir le site" show={collapsed}>
          <Link
            href="/"
            target="_blank"
            className={`flex items-center rounded-lg px-3 py-2.5 font-mono text-sm text-text-muted transition-colors duration-150 hover:text-text-secondary ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <ExternalIcon />
            {!collapsed && <span className="truncate">Voir le site</span>}
          </Link>
        </SidebarTooltip>
        <form action={logoutAction}>
          <SidebarTooltip label="Déconnexion" show={collapsed}>
            <button
              type="submit"
              className={`flex w-full items-center rounded-lg px-3 py-2.5 font-mono text-sm text-text-muted transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400 ${
                collapsed ? "justify-center" : "gap-3"
              }`}
            >
              <LogoutIcon />
              {!collapsed && <span className="truncate">Déconnexion</span>}
            </button>
          </SidebarTooltip>
        </form>
      </div>
    </motion.aside>
  );
}
