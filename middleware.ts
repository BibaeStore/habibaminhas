import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "admin_token";

function jwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET ?? "habiba-admin-dev-secret-change-in-production";
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicAdminRoute =
    pathname === "/admin/login" || pathname === "/admin/setup";

  if (!isAdminRoute) return NextResponse.next();

  const admin = await getAdminFromCookie(request);

  // Protect admin routes
  if (!isPublicAdminRoute && !admin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in admin away from login/setup
  if (isPublicAdminRoute && admin) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
