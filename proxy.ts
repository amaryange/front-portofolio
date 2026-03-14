import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Routes admin ──────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // La page de login est toujours accessible
    if (pathname === "/admin/login") {
      // Si déjà connecté → rediriger vers le dashboard
      const token = request.cookies.get("admin_token");
      if (token) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // Toutes les autres routes admin nécessitent un token
    const token = request.cookies.get("admin_token");
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // ── Routes publiques → next-intl ──────────────────────────────
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|api|.*\\..*).*)"],
};
