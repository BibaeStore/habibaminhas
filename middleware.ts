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
    "/admin/:path*",
    "/account/:path*",
  ],
};
