import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import {
  getMetaCredentials,
  getSocialSettings,
  getActivePlatforms,
  getEnabledCollaborators,
  findDueSlot,
  startOfLocalDayUtc,
  type MetaCredentials,
  type SocialSettings,
} from "./config";
import { selectNextProducts, clearManualOrder, type ProductCandidate } from "./select";
import { buildCaption } from "./caption";
import { prepareImages } from "./images";
import { createInstagramAdapter, deleteInstagramMedia } from "./adapters/instagram";
import { createFacebookAdapter, deleteFacebookPost } from "./adapters/facebook";
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

  // One logical post, however many platforms it fans out to. Every row this run creates
  // for this product shares the id, so the admin history shows one entry with an icon per
  // platform rather than the same post repeated.
  const groupId = randomUUID();

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
      group_id: groupId,
    });
    return { product: product.slug, ok: false, reason: "image_prep_failed" };
  }

  // Targets come from the platform registry (supported AND enabled), falling back to the
  // legacy settings column if the registry is empty for any reason.
  const registry = await getActivePlatforms();
  const targets = (registry.length > 0 ? registry : settings.platforms).filter(
    (p): p is PlatformName => p === "instagram" || p === "facebook",
  );

  const collaborators = await getEnabledCollaborators("instagram");

  const perPlatform = targets.map((platform) => {
    const { caption, hashtags, altText } = buildCaption(product, platform);
    return {
      platform,
      caption,
      hashtags,
      altText,
      // Facebook has no collaborator concept — the adapter ignores an empty list.
      collaborators: platform === "instagram" ? collaborators : [],
    };
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
      group_id: groupId,
    }));
    const { error } = await sb.from("social_post_log").insert(rows);
    if (error) return { product: product.slug, ok: false, reason: "queue_insert_failed", message: error.message };
    // The pin has done its job — the product is queued, so let the rotation resume.
    await clearManualOrder(product.id);
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
        groupId,
        collaborators: p.collaborators,
      }),
    );
  }
  await clearManualOrder(product.id);
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
  /** Shared across every platform row of one logical post. Only used on the insert path. */
  groupId?: string;
  /** Instagram co-author usernames. Ignored by platforms without the concept. */
  collaborators?: string[];
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
      collaborators: input.collaborators,
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
      // Update path: never touch group_id — the row already belongs to a group.
      await sb.from("social_post_log").update(row).eq("id", input.logId);
    } else {
      await sb
        .from("social_post_log")
        .insert(input.groupId ? { ...row, group_id: input.groupId } : row);
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
        ...(input.groupId ? { group_id: input.groupId } : {}),
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

/**
 * Removes a post from the chosen platforms, then archives the row.
 *
 * Archive rather than delete, because the owner explicitly wants a removed post to be
 * recoverable later. The row keeps its caption, images and group so it can be reposted;
 * `deleted_from` records which platforms it was pulled from.
 *
 * Per-platform selection matters: a post can be wrong on Instagram and fine on Facebook,
 * and there is no reason to lose the Facebook engagement to fix the Instagram caption.
 */
export async function deletePostFromPlatforms(
  groupId: string,
  platforms: string[],
): Promise<{ ok: boolean; results: unknown[] }> {
  const creds = getMetaCredentials();
  if (!creds) return { ok: false, results: [{ reason: "credentials_missing" }] };

  const sb = createAdminClient();
  const { data: rows } = await sb
    .from("social_post_log")
    .select("*")
    .eq("group_id", groupId)
    .in("platform", platforms);

  const results: unknown[] = [];

  for (const row of rows ?? []) {
    const externalId = row.external_post_id as string | null;

    // Nothing was ever published for this row — archive it and move on.
    if (!externalId) {
      await sb
        .from("social_post_log")
        .update({ status: "archived", archived_at: new Date().toISOString() })
        .eq("id", row.id);
      results.push({ platform: row.platform, ok: true, note: "not_published_archived" });
      continue;
    }

    try {
      if (row.platform === "instagram") {
        await deleteInstagramMedia(creds, externalId);
      } else if (row.platform === "facebook") {
        await deleteFacebookPost(creds, externalId);
      } else {
        results.push({ platform: row.platform, ok: false, reason: "no_adapter" });
        continue;
      }

      await sb
        .from("social_post_log")
        .update({
          status: "archived",
          archived_at: new Date().toISOString(),
          deleted_from: [...((row.deleted_from as string[]) ?? []), row.platform],
        })
        .eq("id", row.id);

      results.push({ platform: row.platform, ok: true });
    } catch (e) {
      const isMeta = e instanceof MetaApiError;
      results.push({
        platform: row.platform,
        ok: false,
        message: (e as Error).message,
        code: isMeta ? e.code : null,
        subcode: isMeta ? e.subcode : null,
      });
    }
  }

  return { ok: results.every((r) => (r as { ok?: boolean }).ok), results };
}

/**
 * Deletes a post and republishes it with a freshly generated caption.
 *
 * This is the only way to correct a live Instagram caption — Meta's media endpoint accepts
 * `comment_enabled` and nothing else, so an edit is genuinely impossible. Facebook could be
 * edited in place, but going through the same path keeps the two platforms consistent.
 *
 * The caption is rebuilt from current product data, so a repost also picks up any content
 * rule changes since the original went out.
 */
export async function repostWithFreshCaption(
  groupId: string,
): Promise<{ ok: boolean; detail: unknown }> {
  const creds = getMetaCredentials();
  if (!creds) return { ok: false, detail: "credentials_missing" };

  const sb = createAdminClient();
  const { data: rows } = await sb
    .from("social_post_log")
    .select("*")
    .eq("group_id", groupId);

  if (!rows?.length) return { ok: false, detail: "group_not_found" };

  const productId = rows[0].product_id as string | null;
  if (!productId) return { ok: false, detail: "product_deleted_cannot_rebuild" };

  const { data: product } = await sb
    .from("products")
    .select(
      "id, slug, title, short_description, description, price, category, subcategory, sku, images, palette, sizes_stock, seo_keywords, faqs, created_at",
    )
    .eq("id", productId)
    .maybeSingle();

  if (!product) return { ok: false, detail: "product_not_found" };

  const platforms = rows.map((r) => r.platform as string);
  const removal = await deletePostFromPlatforms(groupId, platforms);

  const candidate = product as unknown as ProductCandidate;
  const imageUrls = await prepareImages(candidate.images, candidate.palette?.[0]);
  const collaborators = await getEnabledCollaborators("instagram");
  const newGroupId = randomUUID();

  const outcomes: unknown[] = [];
  for (const platform of platforms) {
    if (platform !== "instagram" && platform !== "facebook") continue;
    const { caption, hashtags, altText } = buildCaption(candidate, platform);
    outcomes.push(
      await publishOne(creds, {
        productId: candidate.id,
        productSlug: candidate.slug,
        productTitle: candidate.title,
        platform,
        caption,
        hashtags,
        imageUrls,
        altText,
        slot: "repost",
        groupId: newGroupId,
        collaborators: platform === "instagram" ? collaborators : [],
      }),
    );
  }

  return { ok: true, detail: { removed: removal.results, republished: outcomes } };
}

/** Restores an archived post to the review queue so it can be published again. */
export async function restoreArchivedPost(groupId: string): Promise<void> {
  const sb = createAdminClient();
  await sb
    .from("social_post_log")
    .update({
      status: "pending",
      archived_at: null,
      external_post_id: null,
      permalink: null,
      posted_at: null,
    })
    .eq("group_id", groupId)
    .eq("status", "archived");
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
