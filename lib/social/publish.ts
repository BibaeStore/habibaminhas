import { createAdminClient } from "@/lib/supabase/server";
import {
  getMetaCredentials,
  getSocialSettings,
  findDueSlot,
  startOfLocalDayUtc,
  type MetaCredentials,
  type SocialSettings,
} from "./config";
import { selectNextProducts, type ProductCandidate } from "./select";
import { buildCaption } from "./caption";
import { prepareImages } from "./images";
import { createInstagramAdapter } from "./adapters/instagram";
import { createFacebookAdapter } from "./adapters/facebook";
import { MetaApiError, type PlatformAdapter } from "./adapters/types";

/**
 * Orchestration — turning "a slot is due" into published posts and log rows.
 *
 * Failure posture, matching the blog pipeline that already runs on this scheduler:
 *   - all-or-nothing per platform: a post is never half-published
 *   - one platform failing never blocks the other
 *   - every attempt is logged, successes and failures alike, with Meta's full error object
 *   - a global kill switch and a hard daily ceiling, both enforced before any API call
 */

export type PlatformName = "instagram" | "facebook";

function adapterFor(platform: string, creds: MetaCredentials): PlatformAdapter | null {
  if (platform === "instagram") return createInstagramAdapter(creds);
  if (platform === "facebook") return createFacebookAdapter(creds);
  return null; // unknown platform in settings — skipped rather than crashing the run
}

export type RunOutcome = {
  ok: boolean;
  action: string;
  detail?: unknown;
};

/**
 * The scheduled entry point, called every 15 minutes by pg_cron.
 *
 * Decides for itself whether a slot is due, which keeps cadence in the database rather
 * than in a cron expression: changing 1/day to 2/day is one UPDATE, no redeploy.
 */
export async function runScheduledPost(options?: {
  force?: boolean;
  productId?: string;
}): Promise<RunOutcome> {
  const settings = await getSocialSettings();
  if (!settings) return { ok: false, action: "skipped", detail: "social_settings row missing" };

  if (!settings.enabled && !options?.force) {
    return { ok: true, action: "skipped", detail: "disabled (social_settings.enabled = false)" };
  }

  const creds = getMetaCredentials();
  if (!creds) {
    return { ok: false, action: "skipped", detail: "Meta credentials not configured" };
  }

  // 1. Publish anything already approved and waiting. This runs before the slot check so
  //    an approval made at 22:00 is not held until tomorrow's slot.
  const drained = await publishApproved(settings, creds);

  // 2. Is a slot due?
  const slot = options?.force ? "manual" : findDueSlot(settings.slot_times, settings.timezone);
  if (!slot) {
    return {
      ok: true,
      action: "no_slot_due",
      detail: { drained, slots: settings.slot_times, timezone: settings.timezone },
    };
  }

  // 3. Has this slot already produced a post today? Prevents the 15-minute cron from
  //    firing the same 19:00 slot twice inside the tolerance window.
  if (!options?.force && (await slotAlreadyRan(settings, slot))) {
    return { ok: true, action: "slot_already_ran", detail: { slot, drained } };
  }

  // 4. Hard daily ceiling, independent of cadence — a scheduler misfire must not be able
  //    to empty the catalogue in an afternoon.
  const today = await countToday(settings);
  if (today >= settings.max_posts_per_day) {
    return {
      ok: true,
      action: "daily_cap_reached",
      detail: { today, cap: settings.max_posts_per_day, drained },
    };
  }

  // 5. Select and prepare.
  const { products, status } = await selectNextProducts(settings);
  const chosen = options?.productId
    ? products.filter((p) => p.id === options.productId)
    : products;

  if (chosen.length === 0) {
    return { ok: true, action: "nothing_eligible", detail: { rotation: status, drained } };
  }

  const results: unknown[] = [];
  for (const product of chosen) {
    results.push(await processProduct(product, settings, creds, slot));
  }

  return {
    ok: true,
    action: settings.approval_required ? "queued_for_review" : "published",
    detail: { slot, rotation: status, drained, results },
  };
}

/**
 * Builds the post for one product and either queues it for review or publishes it.
 *
 * Images are converted once and shared across platforms — both Instagram and Facebook are
 * served the same 1080x1350 JPEG derivatives, so a two-platform post costs one conversion.
 */
async function processProduct(
  product: ProductCandidate,
  settings: SocialSettings,
  creds: MetaCredentials,
  slot: string,
): Promise<unknown> {
  const sb = createAdminClient();

  let imageUrls: string[];
  try {
    imageUrls = await prepareImages(product.images, product.palette?.[0]);
  } catch (e) {
    // Log the failure against the product so it is visible in the admin history rather
    // than disappearing into a server log.
    await sb.from("social_post_log").insert({
      product_id: product.id,
      product_slug: product.slug,
      product_title: product.title,
      platform: "all",
      status: "failed",
      error_message: `Image preparation failed: ${(e as Error).message}`,
      slot,
    });
    return { product: product.slug, ok: false, reason: "image_prep_failed" };
  }

  const perPlatform = settings.platforms
    .filter((p): p is PlatformName => p === "instagram" || p === "facebook")
    .map((platform) => {
      const { caption, hashtags, altText } = buildCaption(product, platform);
      return { platform, caption, hashtags, altText };
    });

  // Review queue on: write pending rows and stop. Nothing reaches Meta until approved.
  if (settings.approval_required) {
    const rows = perPlatform.map((p) => ({
      product_id: product.id,
      product_slug: product.slug,
      product_title: product.title,
      platform: p.platform,
      status: "pending" as const,
      caption: p.caption,
      hashtags: p.hashtags,
      image_urls: imageUrls,
      alt_text: p.altText,
      slot,
    }));
    const { error } = await sb.from("social_post_log").insert(rows);
    if (error) return { product: product.slug, ok: false, reason: "queue_insert_failed", message: error.message };
    return { product: product.slug, ok: true, queued: rows.length };
  }

  // Automatic mode: publish each platform independently.
  const outcomes: unknown[] = [];
  for (const p of perPlatform) {
    outcomes.push(
      await publishOne(creds, {
        productId: product.id,
        productSlug: product.slug,
        productTitle: product.title,
        platform: p.platform,
        caption: p.caption,
        hashtags: p.hashtags,
        imageUrls,
        altText: p.altText,
        slot,
      }),
    );
  }
  return { product: product.slug, ok: true, outcomes };
}

type PublishInput = {
  logId?: string;
  productId: string | null;
  productSlug: string | null;
  productTitle: string | null;
  platform: string;
  caption: string;
  hashtags: string[] | null;
  imageUrls: string[];
  altText: string | null;
  slot: string | null;
};

/**
 * Publishes to one platform and records the outcome.
 *
 * A thrown error is caught and written to `social_post_log` rather than propagated: the
 * caller must be able to continue to the next platform, and an unlogged failure is one
 * nobody can diagnose later.
 */
async function publishOne(creds: MetaCredentials, input: PublishInput): Promise<unknown> {
  const sb = createAdminClient();
  const adapter = adapterFor(input.platform, creds);

  if (!adapter) {
    return { platform: input.platform, ok: false, reason: "no_adapter" };
  }

  try {
    const result = await adapter.publishImagePost({
      imageUrls: input.imageUrls,
      caption: input.caption,
      altText: input.altText ?? undefined,
    });

    const row = {
      product_id: input.productId,
      product_slug: input.productSlug,
      product_title: input.productTitle,
      platform: input.platform,
      status: "posted" as const,
      external_post_id: result.externalPostId,
      permalink: result.permalink ?? null,
      caption: input.caption,
      hashtags: input.hashtags,
      image_urls: input.imageUrls,
      alt_text: input.altText,
      slot: input.slot,
      posted_at: new Date().toISOString(),
      error: null,
      error_message: null,
    };

    if (input.logId) {
      await sb.from("social_post_log").update(row).eq("id", input.logId);
    } else {
      await sb.from("social_post_log").insert(row);
    }

    return { platform: input.platform, ok: true, postId: result.externalPostId, permalink: result.permalink };
  } catch (e) {
    const isMeta = e instanceof MetaApiError;
    const errorPayload = isMeta ? e.toLog() : { message: (e as Error).message };
    const failure = {
      status: "failed" as const,
      error: errorPayload,
      error_message: (e as Error).message,
    };

    if (input.logId) {
      await sb.from("social_post_log").update(failure).eq("id", input.logId);
    } else {
      await sb.from("social_post_log").insert({
        product_id: input.productId,
        product_slug: input.productSlug,
        product_title: input.productTitle,
        platform: input.platform,
        caption: input.caption,
        hashtags: input.hashtags,
        image_urls: input.imageUrls,
        alt_text: input.altText,
        slot: input.slot,
        ...failure,
      });
    }

    return {
      platform: input.platform,
      ok: false,
      reason: "publish_failed",
      message: (e as Error).message,
      code: isMeta ? e.code : null,
      subcode: isMeta ? e.subcode : null,
      hardStop: isMeta ? e.isHardStop : false,
    };
  }
}

/** Publishes rows the owner has approved. Called at the top of every scheduled run. */
async function publishApproved(
  settings: SocialSettings,
  creds: MetaCredentials,
): Promise<unknown[]> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("social_post_log")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .limit(settings.max_posts_per_day * 2);

  const out: unknown[] = [];
  for (const row of data ?? []) {
    out.push(
      await publishOne(creds, {
        logId: row.id as string,
        productId: row.product_id as string | null,
        productSlug: row.product_slug as string | null,
        productTitle: row.product_title as string | null,
        platform: row.platform as string,
        caption: (row.caption as string) ?? "",
        hashtags: row.hashtags as string[] | null,
        imageUrls: (row.image_urls as string[]) ?? [],
        altText: row.alt_text as string | null,
        slot: row.slot as string | null,
      }),
    );
  }
  return out;
}

/** Publishes a single log row on demand — used by the admin "approve and post" action. */
export async function publishLogEntry(logId: string): Promise<unknown> {
  const creds = getMetaCredentials();
  if (!creds) return { ok: false, reason: "credentials_missing" };

  const sb = createAdminClient();
  const { data: row, error } = await sb
    .from("social_post_log")
    .select("*")
    .eq("id", logId)
    .maybeSingle();

  if (error || !row) return { ok: false, reason: "not_found" };
  if (row.status === "posted") return { ok: false, reason: "already_posted" };

  return publishOne(creds, {
    logId,
    productId: row.product_id as string | null,
    productSlug: row.product_slug as string | null,
    productTitle: row.product_title as string | null,
    platform: row.platform as string,
    caption: (row.caption as string) ?? "",
    hashtags: row.hashtags as string[] | null,
    imageUrls: (row.image_urls as string[]) ?? [],
    altText: row.alt_text as string | null,
    slot: row.slot as string | null,
  });
}

/** Posts already published in the current local day, against the hard ceiling. */
async function countToday(settings: SocialSettings): Promise<number> {
  const sb = createAdminClient();
  const since = startOfLocalDayUtc(settings.timezone).toISOString();
  const { count } = await sb
    .from("social_post_log")
    .select("id", { count: "exact", head: true })
    .in("status", ["posted", "pending", "approved"])
    .gte("created_at", since);
  return count ?? 0;
}

/** Has this named slot already produced rows today? */
async function slotAlreadyRan(settings: SocialSettings, slot: string): Promise<boolean> {
  const sb = createAdminClient();
  const since = startOfLocalDayUtc(settings.timezone).toISOString();
  const { count } = await sb
    .from("social_post_log")
    .select("id", { count: "exact", head: true })
    .eq("slot", slot)
    .gte("created_at", since);
  return (count ?? 0) > 0;
}
