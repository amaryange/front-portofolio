"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

/**
 * Composant invisible — à placer sur la page d'accueil.
 * Observe les sections avec un `id` et envoie "section_viewed"
 * la première fois que chaque section entre dans le viewport à 30%+.
 *
 * Sections trackées automatiquement : #hero, #about, #skills,
 * #experience, #projects, #contact (définis dans les composants sections/).
 */
export default function SectionTracker() {
  const posthog = usePostHog();

  useEffect(() => {
    const viewed = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting && id && !viewed.has(id)) {
            viewed.add(id);
            posthog?.capture("section_viewed", { section: id });
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observer toutes les sections avec un id
    document.querySelectorAll("section[id]").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [posthog]);

  return null;
}
