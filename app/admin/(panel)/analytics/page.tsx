import Link from "next/link";
import { getPostHogAnalyticsPage } from "@/lib/posthog-server";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

function cleanUrl(raw: string): string {
  try {
    const u = new URL(raw);
    return u.pathname + (u.search ? u.search : "");
  } catch {
    return raw;
  }
}

function Pagination({
  current,
  total,
  param,
  base,
  otherParams,
}: {
  current: number;
  total: number;
  param: string;
  base: string;
  otherParams: Record<string, string>;
}) {
  if (total <= 1) return null;

  function href(page: number) {
    const p = new URLSearchParams({ ...otherParams, [param]: String(page) });
    return `${base}?${p.toString()}`;
  }

  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-3">
      <p className="font-mono text-[0.6rem] text-text-muted">
        Page {current} / {total}
      </p>
      <div className="flex items-center gap-1">
        {current > 1 && (
          <Link
            href={href(current - 1)}
            className="rounded border border-border px-2.5 py-1 font-mono text-xs text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
          >
            ←
          </Link>
        )}
        {pages.map((p) => {
          const near = Math.abs(p - current) <= 2 || p === 1 || p === total;
          const isDot =
            (p === current - 3 && current > 4) ||
            (p === current + 3 && current < total - 3);
          if (!near && !isDot) return null;
          if (isDot) {
            return (
              <span key={p} className="px-1 font-mono text-xs text-text-muted">
                …
              </span>
            );
          }
          return (
            <Link
              key={p}
              href={href(p)}
              className={`rounded border px-2.5 py-1 font-mono text-xs transition-colors ${
                p === current
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border text-text-muted hover:border-accent/40 hover:text-accent"
              }`}
            >
              {p}
            </Link>
          );
        })}
        {current < total && (
          <Link
            href={href(current + 1)}
            className="rounded border border-border px-2.5 py-1 font-mono text-xs text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
          >
            →
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; cp?: string }>;
}) {
  const params = await searchParams;
  const visitPage = Math.max(1, parseInt(params.page ?? "1", 10));
  const countryPage = Math.max(1, parseInt(params.cp ?? "1", 10));

  const data = await getPostHogAnalyticsPage();

  if (!data) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="font-mono text-xs text-text-muted transition-colors hover:text-accent">
            ← Dashboard
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <p className="font-mono text-sm text-text-secondary">PostHog non configuré.</p>
          <p className="mt-1 font-mono text-xs text-text-muted">
            Ajoutez <code className="text-accent">POSTHOG_PROJECT_ID</code> et{" "}
            <code className="text-accent">POSTHOG_PERSONAL_API_KEY</code> dans votre .env.
          </p>
        </div>
      </div>
    );
  }

  const maxCountry = data.allCountries[0]?.count ?? 1;

  const totalCountryPages = Math.ceil(data.allCountries.length / PER_PAGE);
  const countrySlice = data.allCountries.slice(
    (countryPage - 1) * PER_PAGE,
    countryPage * PER_PAGE,
  );
  const countryOffset = (countryPage - 1) * PER_PAGE;

  const totalVisitPages = Math.ceil(data.recentVisits.length / PER_PAGE);
  const visitSlice = data.recentVisits.slice(
    (visitPage - 1) * PER_PAGE,
    visitPage * PER_PAGE,
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">

      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.18em] text-text-muted">{"// analytics"}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">Audience — 30 derniers jours</h1>
        </div>
        <Link href="/admin" className="font-mono text-xs text-text-muted transition-colors hover:text-accent">
          ← Dashboard
        </Link>
      </div>

      {/* ── Pays ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="font-mono text-[0.65rem] tracking-wider text-text-muted">
            {"// pays"} — {data.allCountries.length} pays distincts
          </p>
          <span className="font-mono text-[0.6rem] text-text-muted">
            {countrySlice.length} / {data.allCountries.length}
          </span>
        </div>

        <div className="divide-y divide-border">
          {countrySlice.length === 0 ? (
            <p className="px-5 py-8 text-center font-mono text-sm text-text-muted">Aucune donnée.</p>
          ) : (
            countrySlice.map(({ country, code, count, pct }, i) => (
              <div key={code} className="flex items-center gap-4 px-5 py-3">
                {/* Rang */}
                <span className="w-5 shrink-0 text-right font-mono text-[0.6rem] text-text-muted">
                  {countryOffset + i + 1}
                </span>

                {/* Drapeau + pays */}
                <span className="text-base leading-none" aria-hidden>{countryCodeToFlag(code)}</span>
                <span className="w-40 shrink-0 font-mono text-sm text-text-secondary">{country}</span>

                {/* Barre */}
                <div className="flex-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-accent/60"
                      style={{ width: `${(count / maxCountry) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-right">
                  <span className="w-16 font-mono text-sm text-text-primary">{fmt(count)}</span>
                  <span className="w-10 font-mono text-xs text-text-muted">{pct}%</span>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination
          current={countryPage}
          total={totalCountryPages}
          param="cp"
          base="/admin/analytics"
          otherParams={params.page ? { page: params.page } : {}}
        />
      </div>

      {/* ── Visites récentes ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between">
          <p className="font-mono text-[0.65rem] tracking-wider text-text-muted">
            {"// visites récentes"} — {data.recentVisits.length} au total
          </p>
          <span className="font-mono text-[0.6rem] text-text-muted">
            {(visitPage - 1) * PER_PAGE + 1}–{Math.min(visitPage * PER_PAGE, data.recentVisits.length)} / {data.recentVisits.length}
          </span>
        </div>

        {visitSlice.length === 0 ? (
          <p className="px-5 py-8 text-center font-mono text-sm text-text-muted">Aucune visite.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-bg">
                  {["DATE", "HEURE", "PAYS / VILLE", "PAGE", "NAVIGATEUR", "OS"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-mono text-[0.6rem] tracking-wider text-text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visitSlice.map((visit, i) => {
                  const { date, time } = formatDateTime(visit.timestamp);
                  return (
                    <tr key={i} className="transition-colors hover:bg-accent/[0.02]">
                      <td className="px-4 py-2.5 font-mono text-xs text-text-muted">{date}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-accent">{time}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2">
                          <span aria-hidden>{countryCodeToFlag(visit.code)}</span>
                          <span className="font-mono text-xs text-text-secondary">
                            {visit.country}
                            {visit.city !== "—" && (
                              <span className="text-text-muted"> / {visit.city}</span>
                            )}
                          </span>
                        </span>
                      </td>
                      <td className="max-w-[200px] px-4 py-2.5">
                        <span className="block truncate font-mono text-xs text-text-secondary" title={visit.url}>
                          {cleanUrl(visit.url)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-text-muted">{visit.browser}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-text-muted">{visit.os}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          current={visitPage}
          total={totalVisitPages}
          param="page"
          base="/admin/analytics"
          otherParams={params.cp ? { cp: params.cp } : {}}
        />
      </div>

    </div>
  );
}
