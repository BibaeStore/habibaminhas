/**
 * The occasion agent: plan → generate → publish.
 *
 * Three separate phases rather than one pass, because they fail differently and should not
 * take each other down. Planning is cheap and safe to repeat. Generation costs money and
 * takes half a minute. Publishing is irreversible. Splitting them also gives the owner a
 * window — artwork exists days early, so there is something to look at and reject before
 * anything reaches an audience.
 *
 * Everything here is additive. The 19:00 product rotation in `lib/social/publish.ts` is not
 * touched, imported or altered; the two schedulers share only `social_post_log`, which
 * occasion posts write with `slot = 'occasion'`.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";
import { getMetaCredentials } from "@/lib/social/config";
import { createFacebookAdapter } from "@/lib/social/adapters/facebook";
import { createInstagramAdapter } from "@/lib/social/adapters/instagram";
import { addDays, localDateKey, occurrencesInRange, scheduledForDate } from "./calendar";
import { isSafeOccasionName, resolveLunarDates, unresolvedLunar } from "./discover";
import { composeOccasionImage, generateBackground, uploadArtwork } from "./artwork";
import { writeArtDirection, logArtDirection } from "./art-direction";
import { buildOccasionCaptions, isCaptionClean } from "./caption";
import type { OccasionPostRow, OccasionRow } from "./types";

/** How far ahead the planner fills the calendar. */
export const PLAN_HORIZON_DAYS = 35;

/**
 * How far ahead artwork is actually rendered.
 *
 * Generation costs real money per image, so the calendar runs a month ahead while pictures
 * are made a week ahead. The owner still sees what is coming; only the picture arrives later.
 */
export const GENERATE_HORIZON_DAYS = 7;

/**
 * Service-role client, deliberately untyped for this module.
 *
 * `lib/supabase/types.ts` is generated and does not know about `social_occasions` or
 * `social_occasion_posts`. Regenerating it would overwrite work in progress on another
 * branch, so the cast is confined to this one helper rather than pushing a types
 * regeneration through the whole repo. Row shapes are still checked on the way out, via
 * the `OccasionRow` / `OccasionPostRow` assertions at each call site.
 */
function admin(): SupabaseClient {
  return createAdminClient() as unknown as SupabaseClient;
}

async function loadOccasions(): Promise<OccasionRow[]> {
  const { data, error } = await admin().from("social_occasions").select("*").eq("enabled", true);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as OccasionRow[];
}

/* ------------------------------------------------------------------ plan */

export type PlanResult = {
  resolved: number;
  planned: number;
  skippedUnsafe: string[];
};

/**
 * Fills the calendar for the next `PLAN_HORIZON_DAYS`.
 *
 * Safe to run every 15 minutes: the unique constraint on (occasion_slug, occasion_date)
 * makes re-planning a no-op, and a row the owner cancelled is never revived because the
 * insert conflicts with the cancelled row rather than replacing it.
 */
export async function planAhead(now = new Date()): Promise<PlanResult> {
  const sb = admin();
  const occasions = await loadOccasions();
  const today = localDateKey(now);
  const until = addDays(today, PLAN_HORIZON_DAYS);

  // Resolve any lunar dates for the years this window touches.
  let resolved = 0;
  const years = new Set([today.slice(0, 4), until.slice(0, 4)].map(Number));
  for (const year of years) {
    const pending = unresolvedLunar(occasions, year);
    if (pending.length === 0) continue;
    const answers = await resolveLunarDates(pending, year);
    for (const a of answers) {
      if (!a.date) continue;
      const row = occasions.find((o) => o.slug === a.slug);
      if (!row) continue;
      const next = { ...(row.resolved_dates ?? {}), [String(year)]: a.date };
      const { error } = await sb
        .from("social_occasions")
        .update({ resolved_dates: next, updated_at: new Date().toISOString() })
        .eq("id", row.id);
      if (!error) { row.resolved_dates = next; resolved++; }
    }
  }

  const skippedUnsafe: string[] = [];
  let planned = 0;

  for (const { dateKey, occasion } of occurrencesInRange(occasions, today, until)) {
    // Belt and braces. The allow-list already governs what exists, but a hand-added row
    // must not be able to put a styled greeting under a mourning observance.
    if (!isSafeOccasionName(occasion.name)) {
      skippedUnsafe.push(occasion.name);
      continue;
    }

    const scheduledFor = scheduledForDate(dateKey);

    /*
     * Never plan a slot that has already passed.
     *
     * Without this, switching the agent on at any time after 10:00 immediately plans
     * "today", generates artwork, and publishes a greeting hours late — and on the day
     * this was built, that would have been a second Jumma post on top of one already
     * published by hand. Today is only planned if its slot is still ahead.
     */
    if (scheduledFor.getTime() <= now.getTime()) continue;

    const { error } = await sb.from("social_occasion_posts").insert({
      occasion_id: occasion.id,
      occasion_slug: occasion.slug,
      occasion_name: occasion.name,
      occasion_date: dateKey,
      scheduled_for: scheduledFor.toISOString(),
      status: "planned",
      hashtags: occasion.hashtags ?? [],
    });
    // 23505 = already planned, or cancelled by the owner. Both mean "leave it alone".
    if (!error) planned++;
    else if (error.code !== "23505") throw new Error(error.message);
  }

  return { resolved, planned, skippedUnsafe };
}

/* -------------------------------------------------------------- generate */

/**
 * Chooses the product whose photograph the artwork is built from.
 *
 * Least-recently-featured wins, so the same suit does not carry three Fridays in a row.
 * Only active ladies stock with a real photograph is eligible — the artwork is the post,
 * and a product with no image would produce an empty arch.
 */
async function pickProduct(): Promise<{ id: string; image: string } | null> {
  const sb = admin();

  const { data: products } = await sb
    .from("products")
    .select("id, images, created_at")
    .eq("category", "ladies-suits")
    .eq("status", "active")
    .gt("stock", 0);

  const eligible = (products ?? []).filter(
    (p) => Array.isArray(p.images) && p.images.length > 0,
  );
  if (eligible.length === 0) return null;

  const { data: recent } = await sb
    .from("social_occasion_posts")
    .select("product_id, occasion_date")
    .not("product_id", "is", null)
    .order("occasion_date", { ascending: false })
    .limit(40);

  const lastUsed = new Map<string, string>();
  for (const r of recent ?? []) {
    const pid = r.product_id as string;
    if (pid && !lastUsed.has(pid)) lastUsed.set(pid, r.occasion_date as string);
  }

  eligible.sort((a, b) => {
    const ua = lastUsed.get(a.id) ?? "";   // never featured sorts first
    const ub = lastUsed.get(b.id) ?? "";
    if (ua !== ub) return ua < ub ? -1 : 1;
    return String(a.created_at) > String(b.created_at) ? -1 : 1;
  });

  const chosen = eligible[0];
  return { id: chosen.id, image: (chosen.images as string[])[0] };
}

/** Builds artwork and captions for one planned post, leaving it `ready` to publish. */
export async function generateFor(postId: string): Promise<{ ok: boolean; detail?: string }> {
  const sb = admin();

  const { data: post } = await sb
    .from("social_occasion_posts").select("*").eq("id", postId).single();
  if (!post) return { ok: false, detail: "post not found" };
  const row = post as unknown as OccasionPostRow;
  if (row.status === "cancelled") return { ok: false, detail: "cancelled by owner" };

  const { data: occ } = await sb
    .from("social_occasions").select("*").eq("slug", row.occasion_slug).single();
  if (!occ) return { ok: false, detail: "occasion no longer exists" };
  const occasion = occ as unknown as OccasionRow;

  await sb.from("social_occasion_posts")
    .update({ status: "generating", error: null, updated_at: new Date().toISOString() })
    .eq("id", postId);

  try {
    /*
     * Art direction is written fresh for this poster, not read from the row.
     *
     * `social_occasions.theme` is one fixed string, so every Jumma Mubarak used to ask the
     * image model for the same backdrop and print the same sentence underneath. The owner
     * deleted one on 2026-08-28 for being indistinguishable from the week before. The model
     * is now shown the last ten motifs, messages and art directions for this occasion and
     * told to go somewhere else.
     *
     * Falls back to the stored theme and subtitle, so an outage produces last week's poster
     * rather than no poster.
     */
    const art = await writeArtDirection(occasion);

    const { buffer: background, prompt } = await generateBackground(
      art?.theme ??
        occasion.theme ??
        "Elegant ivory and antique gold, fine ornamental border, refined and airy.",
    );

    // No product. An occasion post greets; it does not sell. Owner instruction 2026-08-28.
    const composed = await composeOccasionImage({
      background,
      greeting: occasion.greeting,
      message: art?.message ?? occasion.subtitle ?? "",
      attribution: art?.attribution ?? "",
      arabic: art?.arabic,
      cardTitle: art?.cardTitle,
    });

    if (art) await logArtDirection(occasion, art);
    const imageUrl = await uploadArtwork(
      composed, row.occasion_slug, row.occasion_date, row.regenerate_count,
    );

    const captions = await buildOccasionCaptions(occasion);

    await sb.from("social_occasion_posts").update({
      status: "ready",
      // No product is involved in an occasion poster any more.
      product_id: null,
      image_url: imageUrl,
      image_prompt: prompt,
      caption_instagram: captions.instagram,
      caption_facebook: captions.facebook,
      hashtags: captions.hashtags,
      error: null,
      updated_at: new Date().toISOString(),
    }).eq("id", postId);

    return { ok: true };
  } catch (err) {
    const detail = (err as Error).message;
    await sb.from("social_occasion_posts")
      .update({ status: "failed", error: detail, updated_at: new Date().toISOString() })
      .eq("id", postId);
    return { ok: false, detail };
  }
}

/** Generates artwork for everything inside the generation horizon that still lacks it. */
export async function generateDue(now = new Date()): Promise<{ generated: number; failed: number }> {
  const sb = admin();
  const today = localDateKey(now);
  const until = addDays(today, GENERATE_HORIZON_DAYS);

  const { data } = await sb
    .from("social_occasion_posts")
    .select("id")
    .in("status", ["planned"])
    .gte("occasion_date", today)
    .lte("occasion_date", until)
    .order("occasion_date", { ascending: true })
    // A cap keeps one run from spending an unbounded amount on images if the horizon is
    // ever widened by mistake.
    .limit(5);

  let generated = 0, failed = 0;
  for (const r of data ?? []) {
    const res = await generateFor(r.id as string);
    if (res.ok) generated++; else failed++;
  }
  return { generated, failed };
}

/* --------------------------------------------------------------- publish */

/**
 * Publishes every `ready` post whose time has come.
 *
 * The owner chose "silence = publish", so nothing waits for approval — but a post is only
 * ever published once, guarded by moving it to `publishing` before any network call.
 */
export async function publishDue(now = new Date()): Promise<{ published: number; failed: number }> {
  const sb = admin();
  const creds = getMetaCredentials();
  if (!creds) return { published: 0, failed: 0 };

  const { data } = await sb
    .from("social_occasion_posts")
    .select("*")
    .eq("status", "ready")
    .lte("scheduled_for", now.toISOString())
    // A post whose moment passed by more than a day is stale; a Jumma greeting on Saturday
    // is worse than no greeting.
    .gte("scheduled_for", new Date(now.getTime() - 24 * 3600_000).toISOString());

  let published = 0, failed = 0;

  for (const raw of (data ?? []) as unknown as OccasionPostRow[]) {
    if (!raw.image_url || !raw.caption_instagram || !raw.caption_facebook) continue;

    // Last gate before an audience sees it. If the filter ever misses something, this
    // fails the post rather than publishing sizes or a price.
    if (!isCaptionClean(raw.caption_instagram) || !isCaptionClean(raw.caption_facebook)) {
      await sb.from("social_occasion_posts").update({
        status: "failed",
        error: "Caption failed the banned-term check at publish time",
        updated_at: new Date().toISOString(),
      }).eq("id", raw.id);
      failed++;
      continue;
    }

    // Claim it first — two overlapping cron runs must not both publish.
    const { data: claimed } = await sb
      .from("social_occasion_posts")
      .update({ status: "publishing", updated_at: new Date().toISOString() })
      .eq("id", raw.id)
      .eq("status", "ready")
      .select("id");
    if (!claimed || claimed.length === 0) continue;

    const targets = [
      { name: "facebook", adapter: createFacebookAdapter(creds), caption: raw.caption_facebook },
      { name: "instagram", adapter: createInstagramAdapter(creds), caption: raw.caption_instagram },
    ];

    const results: Record<string, { ok: boolean; id?: string; permalink?: string; error?: string }> = {};
    const groupId = crypto.randomUUID();

    for (const t of targets) {
      try {
        const res = await t.adapter.publishImagePost({
          imageUrls: [raw.image_url],
          caption: t.caption,
          altText: `${raw.occasion_name} greeting from Habiba Minhas.`,
        });
        results[t.name] = { ok: true, id: res.externalPostId, permalink: res.permalink };

        await sb.from("social_post_log").insert({
          product_id: raw.product_id,
          platform: t.name,
          status: "posted",
          external_post_id: res.externalPostId,
          permalink: res.permalink ?? null,
          caption: t.caption,
          hashtags: raw.hashtags,
          image_urls: [raw.image_url],
          alt_text: `${raw.occasion_name} greeting from Habiba Minhas.`,
          rotation_cycle: 1,
          slot: "occasion",
          posted_at: new Date().toISOString(),
          group_id: groupId,
          deleted_from: [],
        });
      } catch (err) {
        results[t.name] = { ok: false, error: (err as Error).message };
      }
    }

    const anyOk = Object.values(results).some((r) => r.ok);
    await sb.from("social_occasion_posts").update({
      status: anyOk ? "published" : "failed",
      published_at: anyOk ? new Date().toISOString() : null,
      platform_results: results,
      error: anyOk ? null : "All platforms failed",
      updated_at: new Date().toISOString(),
    }).eq("id", raw.id);

    if (anyOk) published++; else failed++;
  }

  return { published, failed };
}

/** One full pass. This is what the cron calls. */
export async function runOccasionAgent(now = new Date()) {
  const plan = await planAhead(now);
  const gen = await generateDue(now);
  const pub = await publishDue(now);
  return { plan, generate: gen, publish: pub };
}
