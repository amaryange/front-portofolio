/**
 * Next.js instrumentation hook — appelé côté serveur pour chaque erreur non gérée.
 * Capture l'event $exception dans PostHog avec le digest,
 * permettant de corréler les rapports du service worker (client)
 * avec la vraie erreur serveur.
 */
export async function onRequestError(
  err: unknown,
  request: Readonly<{ path: string; method: string }>,
  context: Readonly<{
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "proxy";
  }>
) {
  const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  if (!key) return;

  const error = err as Error & { digest?: string };

  await fetch(`${host}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key:     key,
      event:       "$exception",
      distinct_id: "server",
      timestamp:   new Date().toISOString(),
      properties: {
        // — PostHog Error Tracking —
        $exception_type:            error.name ?? "Error",
        $exception_message:         error.message,
        $exception_stack_trace_raw: error.stack,
        // Lien entre ce log serveur et ce que voit le client sur la page d'erreur
        $exception_fingerprint:     error.digest ?? error.message,

        // — Contexte Next.js —
        digest:      error.digest,
        path:        request.path,
        method:      request.method,
        route:       context.routePath,
        route_type:  context.routeType,
        router_kind: context.routerKind,
      },
    }),
  }).catch(() => {
    // Ne pas laisser une erreur de logging tuer quoi que ce soit
  });
}
