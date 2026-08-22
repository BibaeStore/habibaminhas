import { NextResponse } from "next/server";
import { runScheduledPost } from "@/lib/social/publish";
import { runScheduledReels } from "@/lib/social/reel/publish";
import { getSocialSettings } from "@/lib/social/config";

/**
 * Scheduled social posting.
 *
 * Auth, structure and failure posture are copied from /api/cron/blog-generate, which has
 * been running reliably on the same Supabase pg_cron scheduler. Vercel cron is
 * deliberately not used — the project is on the free plan, and pg_cron is already proven
 * in production here.
 *
 * Fires every 15 minutes and decides for itself whether a configured slot is due, so
 * changing cadence is a database edit rather than a migration and redeploy.
 *
 * Nothing in this route touches the storefront: no pages, no metadata, no structured data.
 * It reads `products` and writes only to `social_post_log`.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A ten-image carousel means ten container creations plus polling, each waiting on Meta
// fetching the image server-side.
export const maxDuration = 300;

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false; // fail closed when unconfigured

  const header = req.headers.get("x-cron-secret")?.trim();
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const provided = header || bearer;
  if (!provided || provided.length !== secret.length) return false;

  let diff = 0;
  for (let i = 0; i < secret.length; i++) diff |= secret.charCodeAt(i) ^ provided.charCodeAt(i);
  return diff === 0;
}

async function handle(req: Request) {
  if (!authorize(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await getSocialSettings();
  if (!settings) {
    return NextResponse.json(
      { skipped: true, reason: "social_settings not found — has the migration been applied?" },
      { status: 200 },
    );
  }

  /*
   * ?force=1 ignores the slot and kill-switch checks. Used by the admin "post now" button
   * and for the first end-to-end test, so go-live does not depend on waiting for 19:00.
   */
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const productId = url.searchParams.get("productId") ?? undefined;

  try {
    const result = await runScheduledPost({ force, productId });

    /*
     * Reels are drained separately, after photos, and are never allowed to affect them.
     *
     * Their own try/catch is the whole point: a misconfigured reel schedule or a Meta
     * transcode failure must not be able to stop the daily photo post, which is the
     * proven, live half of this pipeline. Photos have already been published by the time
     * this runs, so the worst case is that reels wait for the next tick.
     *
     * Skipped entirely on a forced run — "Post now" means post a photo now, and silently
     * publishing a reel as a side effect of that button would be a surprise.
     */
    let reels: unknown = { action: "skipped", detail: "forced run" };
    if (!force) {
      try {
        reels = await runScheduledReels();
      } catch (e) {
        reels = { ok: false, action: "error", detail: (e as Error).message };
      }
    }

    return NextResponse.json({ ...result, reels });
  } catch (e) {
    // A thrown error here means something outside the per-post error handling failed.
    // Answer 200 with the reason rather than 500: pg_net has no retry semantics, and a
    // 500 every 15 minutes just fills the logs without changing anything.
    return NextResponse.json(
      { ok: false, action: "error", detail: (e as Error).message },
      { status: 200 },
    );
  }
}

export const POST = handle;
export const GET = handle;
