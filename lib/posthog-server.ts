/**
 * Utilitaire serveur pour interroger PostHog via son API HTTP.
 *
 * Différent de posthog-js (client) — ici on lit les données analytics.
 *
 * Env vars requis (server-only, sans NEXT_PUBLIC_) :
 *   POSTHOG_PERSONAL_API_KEY  — PostHog → Settings → Your account → Personal API keys
 *   POSTHOG_PROJECT_ID        — PostHog → Project Settings → copier l'ID numérique dans l'URL
 */

// L'API app (lecture) est sur app.posthog.com, pas sur l'endpoint d'ingestion
const POSTHOG_HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.posthog.com")
  .replace("us.i.posthog.com", "us.posthog.com")
  .replace("eu.i.posthog.com", "eu.posthog.com");

const PROJECT_ID   = process.env.POSTHOG_PROJECT_ID;
const PERSONAL_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

async function runHogQL(sql: string) {
  if (!PROJECT_ID || !PERSONAL_KEY) return null;
  try {
    const res = await fetch(`${POSTHOG_HOST}/api/projects/${PROJECT_ID}/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERSONAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query: sql } }),
      next: { revalidate: 3600 }, // cache 1h
    });
    if (!res.ok) return null;
    return (await res.json()) as { results: unknown[][]; columns: string[] };
  } catch {
    return null;
  }
}

export interface SourceStat {
  source: string;
  count: number;
  pct: number;
}

export interface CountryStat {
  country: string;
  code: string;
  count: number;
  pct: number;
}

export interface PostHogDashboardStats {
  pageviews30d: number;
  uniqueVisitors30d: number;
  bySource: SourceStat[];
  byCountry: CountryStat[];
}

/** Nettoie les noms de domaine référents en labels lisibles */
function labelSource(raw: string): string {
  const map: Record<string, string> = {
    direct:           "Direct",
    "linkedin.com":   "LinkedIn",
    "youtube.com":    "YouTube",
    "t.co":           "Twitter / X",
    "twitter.com":    "Twitter / X",
    "google.com":     "Google",
    "google.fr":      "Google",
    "github.com":     "GitHub",
    "reddit.com":     "Reddit",
    "discord.com":    "Discord",
    "facebook.com":   "Facebook",
  };
  if (map[raw.toLowerCase()]) return map[raw.toLowerCase()];
  // utm_source custom : capitaliser
  if (!raw.includes(".")) return raw.charAt(0).toUpperCase() + raw.slice(1);
  return raw;
}

export async function getPostHogDashboardStats(): Promise<PostHogDashboardStats | null> {
  if (!PROJECT_ID || !PERSONAL_KEY) return null;

  const [viewsRes, sourcesRes, countriesRes] = await Promise.all([
    runHogQL(`
      SELECT
        count()               AS pageviews,
        count(DISTINCT person_id) AS visitors
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= now() - INTERVAL 30 DAY
    `),
    runHogQL(`
      SELECT
        multiIf(
          isNotNull(properties.utm_source) AND properties.utm_source != '',
            properties.utm_source,
          isNotNull(properties.$referring_domain) AND properties.$referring_domain != '',
            properties.$referring_domain,
          'direct'
        ) AS source,
        count() AS n
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= now() - INTERVAL 30 DAY
      GROUP BY source
      ORDER BY n DESC
      LIMIT 6
    `),
    runHogQL(`
      SELECT
        properties.$geoip_country_name  AS country,
        properties.$geoip_country_code  AS code,
        count()                          AS n
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= now() - INTERVAL 30 DAY
        AND isNotNull(properties.$geoip_country_name)
        AND properties.$geoip_country_name != ''
      GROUP BY country, code
      ORDER BY n DESC
      LIMIT 5
    `),
  ]);

  const pageviews30d      = Number(viewsRes?.results?.[0]?.[0] ?? 0);
  const uniqueVisitors30d = Number(viewsRes?.results?.[0]?.[1] ?? 0);

  const total = (sourcesRes?.results ?? []).reduce((s, r) => s + Number(r[1]), 0) || 1;
  const bySource: SourceStat[] = (sourcesRes?.results ?? []).map(([src, cnt]) => ({
    source: labelSource(String(src)),
    count:  Number(cnt),
    pct:    Math.round((Number(cnt) / total) * 100),
  }));

  const countryTotal = (countriesRes?.results ?? []).reduce((s, r) => s + Number(r[2]), 0) || 1;
  const byCountry: CountryStat[] = (countriesRes?.results ?? []).map(([country, code, cnt]) => ({
    country: String(country),
    code:    String(code ?? "").toUpperCase(),
    count:   Number(cnt),
    pct:     Math.round((Number(cnt) / countryTotal) * 100),
  }));

  return { pageviews30d, uniqueVisitors30d, bySource, byCountry };
}

/* ── Page analytics complète ─────────────────────────────────────── */

export interface VisitStat {
  timestamp: string;
  country: string;
  code: string;
  city: string;
  url: string;
  browser: string;
  os: string;
}

export interface AnalyticsPageData {
  allCountries: CountryStat[];
  recentVisits: VisitStat[];
}

export async function getPostHogAnalyticsPage(): Promise<AnalyticsPageData | null> {
  if (!PROJECT_ID || !PERSONAL_KEY) return null;

  const [countriesRes, visitsRes] = await Promise.all([
    runHogQL(`
      SELECT
        properties.$geoip_country_name AS country,
        properties.$geoip_country_code AS code,
        count()                         AS n
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= now() - INTERVAL 30 DAY
        AND isNotNull(properties.$geoip_country_name)
        AND properties.$geoip_country_name != ''
      GROUP BY country, code
      ORDER BY n DESC
    `),
    runHogQL(`
      SELECT
        timestamp,
        properties.$geoip_country_name AS country,
        properties.$geoip_country_code AS code,
        properties.$geoip_city_name    AS city,
        properties.$current_url        AS url,
        properties.$browser            AS browser,
        properties.$os                 AS os
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= now() - INTERVAL 30 DAY
      ORDER BY timestamp DESC
      LIMIT 100
    `),
  ]);

  const total = (countriesRes?.results ?? []).reduce((s, r) => s + Number(r[2]), 0) || 1;
  const allCountries: CountryStat[] = (countriesRes?.results ?? []).map(([country, code, cnt]) => ({
    country: String(country),
    code:    String(code ?? "").toUpperCase(),
    count:   Number(cnt),
    pct:     Math.round((Number(cnt) / total) * 100),
  }));

  const recentVisits: VisitStat[] = (visitsRes?.results ?? []).map(
    ([timestamp, country, code, city, url, browser, os]) => ({
      timestamp: String(timestamp),
      country:   String(country ?? "—"),
      code:      String(code ?? "").toUpperCase(),
      city:      String(city ?? "—"),
      url:       String(url ?? ""),
      browser:   String(browser ?? "—"),
      os:        String(os ?? "—"),
    })
  );

  return { allCountries, recentVisits };
}
