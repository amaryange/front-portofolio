"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const ids = ["about", "skills", "experience", "projects", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection("#" + entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -50% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const isOnBlog = pathname.startsWith("/blog");

  // Depuis le blog, les ancres doivent pointer vers la homepage
  const home = `/${locale}`;
  const anchor = (hash: string) => isOnBlog ? `${home}${hash}` : hash;

  const navLinks = [
    { label: t("about"), href: anchor("#about"), page: false },
    { label: t("skills"), href: anchor("#skills"), page: false },
    { label: t("experience"), href: anchor("#experience"), page: false },
    { label: t("projects"), href: anchor("#projects"), page: false },
    { label: t("contact"), href: anchor("#contact"), page: false },
    { label: t("blog"), href: `/${locale}/blog`, page: true },
  ];

  const switchLocale = () => {
    const nextLocale = locale === "fr" ? "en" : "fr";
    // Sur un article de blog, le slug diffère entre locales → on redirige vers la liste
    const target = pathname.startsWith("/blog/") ? "/blog" : pathname;
    router.replace(target, { locale: nextLocale });
  };

  function isActive(link: { href: string; page: boolean }) {
    if (link.page) return isOnBlog;
    return !isOnBlog && activeSection === link.href;
  }

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-bg/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5 md:px-8">
        <a
          href={`/${locale}`}
          className="font-display text-base font-bold tracking-tight text-text-primary"
        >
          M. Amary
        </a>

        {/* Desktop */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <li key={link.href}>
                {link.page || isOnBlog ? (
                  <Link
                    href={link.href}
                    className={`relative font-mono text-sm transition-colors duration-150 hover:text-accent ${
                      active ? "text-accent" : "text-text-secondary"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute -bottom-1 left-0 h-px w-full bg-accent" />
                    )}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={`relative font-mono text-sm transition-colors duration-150 hover:text-accent ${
                      active ? "text-accent" : "text-text-secondary"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute -bottom-1 left-0 h-px w-full bg-accent" />
                    )}
                  </a>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Sélecteur de langue */}
          <button
            onClick={switchLocale}
            className="font-mono text-sm text-text-muted transition-colors duration-150 hover:text-accent"
            aria-label={`Switch to ${locale === "fr" ? "English" : "Français"}`}
          >
            {locale === "fr" ? "EN" : "FR"}
          </button>

          {/* Hamburger mobile */}
          <button
            className="flex flex-col gap-[5px] p-2 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
          >
            <span
              className={`block h-px w-6 bg-text-primary transition-transform duration-200 ${
                menuOpen ? "translate-y-[9px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-6 bg-text-primary transition-opacity duration-200 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-px w-6 bg-text-primary transition-transform duration-200 ${
                menuOpen ? "-translate-y-[9px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      <div
        className={`overflow-hidden border-t border-border bg-surface transition-all duration-300 ease-out md:hidden ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <li key={link.href}>
                {link.page || isOnBlog ? (
                  <Link
                    href={link.href}
                    className={`block py-2 font-mono text-sm transition-colors duration-150 hover:text-accent ${
                      active ? "text-accent" : "text-text-secondary"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={`block py-2 font-mono text-sm transition-colors duration-150 hover:text-accent ${
                      active ? "text-accent" : "text-text-secondary"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
