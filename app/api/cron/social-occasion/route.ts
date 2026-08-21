import { NextResponse } from "next/server";
import { runOccasionAgent } from "@/lib/social/occasion/agent";

/**
 * Occasion posting agent.
 *
 * Deliberately a separate route from /api/cron/social-post rather than a branch inside it.
 * The product rotation is the revenue path and has been running unattended for weeks; an
 * image-generation failure or an OpenAI outage in here must not be able to take it down.
 * The two share nothing but the `social_post_log` table.
 *
 * Auth and posture copied from /api/cron/social-post: fail closed, constant-time compare,
 * always 200 on a handled outcome so pg_cron does not retry-storm.
 *
 * Nothing here touches the storefront — no pages, no metadata, no structured data.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Image generation is the slow part: roughly 30-60s per picture, and a run may render
// several plus publish two Graph posts.
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

  try {
    const result = await runOccasionAgent();
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (err) {
    // Reported, not thrown: a 500 here would have pg_cron retrying every 15 minutes
    // against whatever is already broken.
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 200 },
    );
  }
}

export async function GET(req: Request) { return handle(req); }
export async function POST(req: Request) { return handle(req); }
