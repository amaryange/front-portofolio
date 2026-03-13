"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";

interface Props {
  slug: string;
  locale: string;
  title: string;
}

/**
 * Composant invisible — à ajouter sur la page d'un article.
 * Envoie l'event "article_read" avec :
 *   - duration_seconds  : temps passé sur la page
 *   - scroll_percentage : jusqu'où le lecteur a scrollé (0-100)
 */
export default function ArticleTracker({ slug, locale, title }: Props) {
  const posthog = usePostHog();
  const startTime = useRef(Date.now());
  const maxScroll = useRef(0);
  const sent = useRef(false);

  useEffect(() => {
    startTime.current = Date.now();
    maxScroll.current = 0;
    sent.current = false;

    const trackScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.min(100, Math.round((scrolled / total) * 100));
      if (pct > maxScroll.current) maxScroll.current = pct;
    };

    const send = () => {
      if (sent.current) return;
      sent.current = true;
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      posthog?.capture("article_read", {
        slug,
        locale,
        title,
        duration_seconds: duration,
        scroll_percentage: maxScroll.current,
      });
    };

    // Scroll depth
    window.addEventListener("scroll", trackScroll, { passive: true });

    // Quand l'onglet est fermé ou caché
    window.addEventListener("beforeunload", send);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") send();
    });

    return () => {
      window.removeEventListener("scroll", trackScroll);
      window.removeEventListener("beforeunload", send);
      // Navigation côté client (SPA) → on envoie avant de partir
      send();
    };
  }, [slug, locale, title, posthog]);

  return null;
}
