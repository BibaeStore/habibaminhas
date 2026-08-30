import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/actions/auth";

/**
 * Session guard for `/api/admin/**` route handlers.
 *
 * WHY EVERY HANDLER NEEDS THIS
 * ----------------------------
 * `middleware.ts` gates the admin area with `if (pathname.startsWith("/admin"))`. These routes
 * start with `/api`, so they never match it and fall straight through to `NextResponse.next()`.
 * The URLs look protected and are not.
 *
 * Before this existed, anyone who knew a path could read this store's revenue, KPIs, customer
 * list and live order feed, and POST arbitrary JSON into the settings row — with no login and
 * no cookie. The fix belongs in the handlers rather than in the middleware matcher: a guard at
 * the point of use cannot be silently undone by a routing change somewhere else.
 *
 * Usage — first two lines of every handler:
 *
 *     const denied = await requireAdmin();
 *     if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const admin = await getAdminSession();
  return admin ? null : NextResponse.json({ error: "Not authorised." }, { status: 401 });
}
