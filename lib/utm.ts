/**
 * Générateur de liens UTM pour les profils sociaux et campagnes.
 *
 * Colle ces liens dans :
 *   - LinkedIn : section "Site web" du profil
 *   - GitHub   : champ "Website" du profil + README
 *   - YouTube  : description des vidéos
 *   - Email    : signature
 *   - Posts    : liens dans les publications
 *
 * PostHog capturera automatiquement utm_source, utm_medium, utm_campaign
 * sur chaque visiteur qui clique ces liens.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mondomaine.com";

interface UtmParams {
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
}

export function buildUtmUrl(path: string = "/", params: UtmParams): string {
  const url = new URL(path, SITE_URL);
  url.searchParams.set("utm_source", params.source);
  url.searchParams.set("utm_medium", params.medium);
  if (params.campaign) url.searchParams.set("utm_campaign", params.campaign);
  if (params.content)  url.searchParams.set("utm_content", params.content);
  return url.toString();
}

// ── Liens pré-configurés par plateforme ──────────────────────────────────────
// Copie-colle ces URLs dans tes profils

/** Lien à mettre dans la section "Site web" de ton profil LinkedIn */
export const UTM_LINKS = {
  linkedin_profile: buildUtmUrl("/", {
    source: "linkedin",
    medium: "social",
    campaign: "profile",
  }),

  github_profile: buildUtmUrl("/", {
    source: "github",
    medium: "social",
    campaign: "profile",
  }),

  youtube_description: buildUtmUrl("/", {
    source: "youtube",
    medium: "video",
    campaign: "description",
  }),

  email_signature: buildUtmUrl("/", {
    source: "email",
    medium: "signature",
  }),

  cv_pdf: buildUtmUrl("/", {
    source: "cv",
    medium: "pdf",
  }),
} as const;

/**
 * Génère un lien pour un post spécifique sur une plateforme.
 *
 * @example
 * // Dans un post LinkedIn sur Kubernetes
 * postLink("linkedin", "post-kubernetes-opentelemetry")
 * // → https://mondomaine.com?utm_source=linkedin&utm_medium=post&utm_campaign=post-kubernetes-opentelemetry
 */
export function postLink(
  platform: "linkedin" | "twitter" | "youtube" | "discord" | "reddit",
  campaign: string
): string {
  return buildUtmUrl("/", {
    source: platform,
    medium: "post",
    campaign,
  });
}

/**
 * Lien direct vers un article de blog depuis un post social.
 *
 * @example
 * articleLink("fr", "kubernetes-observability", "linkedin", "post-janvier")
 */
export function articleLink(
  locale: string,
  slug: string,
  platform: string,
  campaign: string
): string {
  return buildUtmUrl(`/${locale}/blog/${slug}`, {
    source: platform,
    medium: "post",
    campaign,
  });
}
