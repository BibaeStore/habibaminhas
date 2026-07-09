import { NextResponse } from "next/server";
import { syncAllActivePostexOrders } from "@/lib/actions/postex-bulk";

/**
 * Scheduled PostEx status poll.
 *
 * PostEx has no webhook — status is pull-only — so a scheduler hits this route
 * and we refresh every in-flight consignment (status + COD settlement).
 *
 * Auth: requires the CRON_SECRET, sent either as `x-cron-secret: <secret>` or
 * `Authorization: Bearer <secret>`. Without CRON_SECRET set, the route is
 * disabled entirely (fails closed) so it can never be triggered anonymously.
 *
 * Scheduled from Supabase pg_cron — see supabase/migrations/*_postex_sync_cron.sql
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false; // fail closed when unconfigured

  const header = req.headers.get("x-cron-secret")?.trim();
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const provided = header || bearer;
  if (!provided || provided.length !== secret.length) return false;

  // Constant-time-ish comparison to avoid leaking the secret via timing.
  let diff = 0;
  for (let i = 0; i < secret.length; i++) diff |= secret.charCodeAt(i) ^ provided.charCodeAt(i);
  return diff === 0;
}

async function handle(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await syncAllActivePostexOrders();
    return NextResponse.json({
      ok: report.ok,
      synced: report.succeeded,
      failed: report.failed,
      skipped: report.skipped,
      message: report.message,
      // Only surface failures — a full result list could be hundreds of rows.
      problems: report.results.filter((r) => !r.ok).map((r) => ({ order: r.orderNumber, message: r.message })),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
