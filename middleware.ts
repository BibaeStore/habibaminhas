import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "admin_token";

function jwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_JWT_SECRET is not set. Add a strong random value to your .env file before running the app."
    );
  }
  return new TextEncoder().encode(secret);
}

async function getAdminFromCookie(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    return payload as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

/** Cheap, edge-friendly check: any Supabase auth cookie present?
 *  Page-level getCustomerSession() does the real validation. */
function hasCustomerSessionCookie(request: NextRequest): boolean {
  for (const c of request.cookies.getAll()) {
    if (c.name.startsWith("sb-") && c.name.endsWith("-auth-token") && c.value) {
      return true;
    }
  }
  return false;
}

const CUSTOMER_PUBLIC_ROUTES = new Set([
  "/account/login",
  "/account/signup",
  "/account/forgot-password",
  "/account/reset-password",
]);

function stripTrailingSlash(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalised = stripTrailingSlash(pathname);

  // ── Markdown for Agents detection ────────────────────────────────────
  // Detect if AI agent requests markdown (Accept: text/markdown)
  // Currently detection-only; full HTML→markdown conversion can be enabled
  // per-route in the future without performance impact on HTML requests
  const acceptsMarkdown = request.headers.get("accept")?.includes("text/markdown");
  if (acceptsMarkdown) {
    // Flag for future per-route markdown conversion
    // For now, continue serving HTML (AI agents can still parse it)
    request.headers.set("x-markdown-requested", "true");
  }

  // ── Trailing slash enforcement ────────────────────────────────────────
  // Skip for: API routes, static files, files with extensions
  const shouldSkipTrailingSlash =
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".") && !pathname.endsWith("/") ||
    pathname.startsWith("/favicon");

  if (!shouldSkipTrailingSlash && !pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}/`;
    return NextResponse.redirect(url, 308); // 308 Permanent Redirect
  }

  // ── Admin routes ──────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const isPublicAdminRoute =
      pathname === "/admin/login" || pathname === "/admin/login/" ||
      pathname === "/admin/setup" || pathname === "/admin/setup/";
    const admin = await getAdminFromCookie(request);

    if (!isPublicAdminRoute && !admin) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login/";
      return NextResponse.redirect(loginUrl);
    }
    if (isPublicAdminRoute && admin) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/admin/";
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // ── Customer /account routes ──────────────────────────────────────────
  if (pathname.startsWith("/account")) {
    const isPublic = CUSTOMER_PUBLIC_ROUTES.has(normalised);
    const signedIn = hasCustomerSessionCookie(request);

    if (!isPublic && !signedIn) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/account/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isPublic && signedIn && normalised !== "/account/reset-password") {
      const dashUrl = request.nextUrl.clone();
      dashUrl.pathname = "/account";
      return NextResponse.redirect(dashUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
