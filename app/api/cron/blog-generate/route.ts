import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getBlogConfig, WRITER_MODEL, priceFor } from "@/lib/blog/config";
import { getNextTopic, getLinkTargets } from "@/lib/blog/topics";
import { getNextQueuedPost, getQueueStatus } from "@/lib/blog/queue";
import { generatePost } from "@/lib/blog/generate";
import { validatePost } from "@/lib/blog/validate";
import { generateHeroImage } from "@/lib/blog/image";

/**
 * Scheduled blog generation.
 *
 * Auth, structure and failure posture are copied from /api/cron/postex-sync, which has
 * been running reliably on the same pg_cron scheduler. Vercel cron is deliberately not
 * used — the project is on the free plan, and Supabase pg_cron is already proven here.
 *
 * Flow: next unwritten topic -> web research -> write -> validate -> image -> publish.
 * Publishing is all-or-nothing per post: a post that fails validation is never written
 * to the database, and no partial row is left behind.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // generation + image can take ~2 minutes

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

/** Rows created today (draft or published) — the hard daily ceiling. */
async function createdToday(): Promise<number> {
  const sb = createAdminClient();
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count } = await sb
    .from("journal_posts")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since.toISOString());
  return count ?? 0;
}

/**
 * PHASE 1 — research, write, validate, save as draft.
 *
 * Saved with status 'draft' and no hero image. Every read path on the site filters
 * status='published' (listing, post page, related articles, sitemap), so a draft is
 * invisible to visitors and search engines until phase 2 completes it.
 */
async function phaseWrite(cfg: NonNullable<ReturnType<typeof getBlogConfig>>) {
  const links = await getLinkTargets();
  const allowed = new Set<string>([
    ...links.collections.map((c) => c.url),
    ...links.posts.map((p) => p.url),
    ...links.products.map((p) => p.url),
  ]);

  /*
   * Two sources, same downstream pipeline.
   *
   * "queue" — pre-written JSON from content/blog-queue. Costs nothing; the owner
   *   writes these in a Claude Code session their subscription already covers.
   * "api" — fresh text with live web research, ~$0.50 a post.
   *
   * Either way the post goes through the same validator before it can be saved, so a
   * queued post with a link that has since gone dead is caught rather than published.
   */
  let post: Awaited<ReturnType<typeof generatePost>>;
  let writeCostUsd = 0;
  let sourceLabel: string;

  if (cfg.source === "queue") {
    const queued = await getNextQueuedPost();
    if (!queued) return { ok: false as const, phase: "write", reason: "queue_empty", message: "No unpublished posts left in content/blog-queue" };
    post = { ...queued, usage: { inputTokens: 0, outputTokens: 0 } };
    sourceLabel = `queue:${queued._file}`;
  } else {
    const topic = await getNextTopic();
    if (!topic) return { ok: false as const, phase: "write", reason: "queue_empty", message: "No unwritten topics remain in topical-map.md" };
    post = await generatePost(cfg, topic, links);
    const rate = priceFor(WRITER_MODEL);
    writeCostUsd =
      (post.usage.inputTokens / 1_000_000) * rate.in +
      (post.usage.outputTokens / 1_000_000) * rate.out;
    sourceLabel = `api:${WRITER_MODEL}`;
  }

  const check = validatePost(post, allowed);
  if (!check.ok) {
    // Nothing is written — a post that fails the gate never reaches the database.
    return { ok: false as const, phase: "write", reason: "failed_validation", slug: post.slug, source: sourceLabel, errors: check.errors, stats: check.stats };
  }

  const sb = createAdminClient();
  const { error } = await sb.from("journal_posts").insert({
    slug: post.slug,
    title: post.title,
    meta_description: post.meta_description,
    keywords: post.keywords,
    // The image brief rides along in excerpt-adjacent storage until phase 2 needs it.
    excerpt: post.excerpt,
    category_tag: post.category_tag,
    hero_image: `PENDING::${post.imagePrompt.slice(0, 900)}`,
    // Validated block array; the generated shape is checked by validatePost above.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: post.content as any,
    author: "Habiba Minhas",
    status: "draft",
  });
  if (error) return { ok: false as const, phase: "write", reason: "db_insert_failed", slug: post.slug, message: error.message };

  return {
    ok: true as const,
    phase: "write",
    slug: post.slug,
    title: post.title,
    stats: check.stats,
    warnings: check.warnings,
    source: sourceLabel,
    costUsd: Number(writeCostUsd.toFixed(4)),
  };
}

/**
 * PHASE 2 — illustrate the oldest pending draft and publish it.
 *
 * Split from phase 1 so neither invocation runs long enough to hit a serverless
 * timeout, and so a failed image never forces the (much more expensive) writing to be
 * redone — the draft simply waits for the next run.
 */
async function phaseImage(cfg: NonNullable<ReturnType<typeof getBlogConfig>>) {
  const sb = createAdminClient();
  const { data: draft } = await sb
    .from("journal_posts")
    .select("id, slug, title, hero_image")
    .eq("status", "draft")
    .like("hero_image", "PENDING::%")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!draft) return { ok: false as const, phase: "image", reason: "no_pending_drafts" };

  const imagePrompt = (draft.hero_image ?? "").replace(/^PENDING::/, "");
  const hero = await generateHeroImage(cfg, draft.slug, imagePrompt);

  const { error } = await sb
    .from("journal_posts")
    .update({
      hero_image: hero.url,
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", draft.id);
  if (error) return { ok: false as const, phase: "image", reason: "db_update_failed", slug: draft.slug, message: error.message };

  return {
    ok: true as const,
    phase: "image",
    slug: draft.slug,
    title: draft.title,
    url: `/journal/${draft.slug}/`,
    imageBytes: hero.bytes,
    costUsd: Number(hero.costUsd.toFixed(4)),
  };
}

async function handle(req: Request) {
  if (!authorize(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cfg = getBlogConfig();
  if (!cfg) {
    return NextResponse.json(
      { skipped: true, reason: "Blog automation not configured (missing ANTHROPIC_API_KEY / OPENAI_API_KEY, or disabled)" },
      { status: 200 },
    );
  }

  /*
   * ?phase=write | image | both
   * The scheduler calls the two phases as separate jobs a few minutes apart so
   * neither invocation runs long enough to hit a serverless function timeout.
   * `both` exists for manual testing and for hosts with a generous limit.
   */
  const phase = new URL(req.url).searchParams.get("phase") ?? "both";

  const already = await createdToday();
  if (phase !== "image" && already >= cfg.maxPerDay) {
    return NextResponse.json({ skipped: true, reason: `Daily cap reached (${already}/${cfg.maxPerDay})` });
  }

  const results: unknown[] = [];
  const run = async (fn: () => Promise<unknown>) => {
    try {
      results.push(await fn());
    } catch (e) {
      // One failure must not abort the run or leave it un-diagnosable.
      results.push({ ok: false, reason: "error", message: (e as Error).message });
    }
  };

  if (phase === "write" || phase === "both") {
    const budget = Math.min(cfg.postsPerRun, cfg.maxPerDay - already);
    for (let i = 0; i < budget; i++) await run(() => phaseWrite(cfg));
  }
  if (phase === "image" || phase === "both") {
    await run(() => phaseImage(cfg));
  }

  const succeeded = results.filter((r: any) => r?.ok).length;
  const queue = cfg.source === "queue" ? await getQueueStatus() : undefined;
  return NextResponse.json({
    phase,
    source: cfg.source,
    queue,
    ran: results.length,
    succeeded,
    failed: results.length - succeeded,
    results,
  });
}

export const POST = handle;
export const GET = handle;
