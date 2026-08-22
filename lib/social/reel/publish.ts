import { createAdminClient } from "@/lib/supabase/server";
import {
  getMetaCredentials, getEnabledCollaborators, getSocialSettings, findDueSlot, productUrl,
} from "@/lib/social/config";
import { publishReel as publishToInstagram } from "@/lib/social/adapters/instagram";
import { publishFacebookReel } from "@/lib/social/adapters/facebook";
import { createVideoPin, getSelectedBoardId } from "@/lib/social/adapters/pinterest";
import { ensureReelCover } from "./cover";
import { MetaApiError } from "@/lib/social/adapters/types";
import type { Json } from "@/lib/supabase/types";

/**
 * Publishing a reel.
 *
 * Deliberately its own module rather than a branch inside `publish.ts`. Reels and photo
 * posts share nothing operationally — different table, different rotation, different
 * timing, different failure modes — and the bugs this project has already had (the daily
 * ceiling counting platform rows, collaborators silently dropped on the queue path) all
 * came from two things being handled by one piece of code that only looked general.
 *
 * A reel can only be published from `approved`. The builder writes `draft` and nothing but
 * an explicit owner action moves it on, so there is no path from generation to Instagram
 * that does not pass through a human.
 */

export type PublishReelResult = {
  ok: boolean;
  detail: string;
  permalink?: string;
};

/**
 * @param only Restrict publishing to these platforms. Omitted means every enabled one.
 *   Used by the review screen, where the owner can untick a platform for one specific reel
 *   without changing the registry — a per-post decision, not a settings change.
 */
export async function publishQueuedReel(
  id: string,
  only?: string[],
): Promise<PublishReelResult> {
  const sb = createAdminClient();

  const { data: row, error } = await sb
    .from("social_media_queue")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) return { ok: false, detail: "Reel not found" };
  if (row.status === "posted") return { ok: false, detail: "Already published" };
  if (row.status !== "approved") {
    return { ok: false, detail: "Approve the reel before publishing it" };
  }
  if (!row.video_url) return { ok: false, detail: "This reel has no video file" };

  const creds = getMetaCredentials();
  if (!creds) return { ok: false, detail: "Meta credentials are not configured" };

  // Resolved at publish time, not at generation time: a reel can sit in review for days,
  // and the collaborator list that matters is the one current when it goes out.
  const collaborators = await getEnabledCollaborators("instagram");

  /*
   * Targets come from the platform registry, asked specifically about *video*. Reels and
   * static posts have separate destinations: a platform can accept one and not the other,
   * and the owner may well want reels on a platform that never receives a product photo.
   *
   * This previously read a single shared `enabled` flag and then discarded anything that
   * was not Instagram or Facebook, which happened to give the right answer only because
   * those were the only two adapters. The capability now lives in the registry, so adding
   * a video adapter is a row update rather than an edit here.
   */
  const { data: registry } = await sb
    .from("social_platforms")
    .select("key")
    .eq("supports_video", true)
    .eq("video_enabled", true)
    .order("sort_order");
  const enabled = (registry ?? []).map((p) => p.key as string);
  // Intersected rather than substituted, so an unticked box can never publish somewhere the
  // registry has switched off.
  const targets = only ? enabled.filter((k) => only.includes(k)) : enabled;

  if (targets.length === 0) {
    return {
      ok: false,
      detail: only
        ? "No platform selected for this reel"
        : "No platform is switched on for publishing",
    };
  }

  /*
   * Each platform is attempted independently and its outcome recorded separately. A reel
   * that lands on Instagram and fails on Facebook must not be reported as a total failure,
   * and must not be retried on Instagram — that would double-post.
   */
  /*
   * Where a pin sends people. Resolved once, and only when Pinterest is actually a target,
   * so a Meta-only reel does not pay for a lookup it will never read.
   */
  const pinLink = targets.includes("pinterest")
    ? await reelDestination(row.product_ids as string[] | null)
    : "";

  /*
   * A video pin needs a cover image and Pinterest will not make one, so a reel without a
   * thumbnail cannot be pinned. Rather than failing the platform, take the cover from the
   * video's last frame now — this self-heals reels uploaded before covers existed, and any
   * whose cover generation failed at upload time because ffmpeg was unavailable.
   */
  let coverUrl = row.thumbnail_url as string | null;
  if (!coverUrl && targets.includes("pinterest")) {
    coverUrl = await ensureReelCover(id);
  }

  const previous = (row.platform_results ?? {}) as Record<string, { ok?: boolean }>;
  const results: Record<string, Json> = { ...(previous as Record<string, Json>) };
  const succeeded: string[] = [];
  const failed: string[] = [];
  let permalink: string | undefined;

  /*
   * Platforms run **concurrently**. They share nothing, and the slow part of each is Meta
   * transcoding on its own servers — so waiting for Instagram to finish before Facebook
   * even starts simply added the two together. Measured: Instagram ~45s, Facebook ~5s;
   * sequentially that is 50s of the owner watching a spinner, concurrently it is 45.
   */
  const attempts = targets.map(async (platform) => {
    if (previous[platform]?.ok) {
      // Already live from an earlier attempt — never publish it twice.
      return { platform, skipped: true as const };
    }
    try {
      /*
       * Dispatch is explicit rather than "Instagram, else Facebook". The registry decides
       * which platforms are targeted, so an `else` branch would quietly send a platform we
       * have never written a video adapter for — say TikTok, the moment its row is
       * switched on — straight to the Facebook Page instead. An unknown key is a missing
       * adapter, and it is recorded as exactly that.
       */
      switch (platform) {
        case "instagram":
          return {
            platform,
            result: await publishToInstagram(creds, {
              videoUrl: row.video_url!,
              caption: row.caption ?? "",
              collaborators,
            }),
          };
        case "facebook":
          return {
            platform,
            result: await publishFacebookReel(creds, {
              videoUrl: row.video_url!,
              caption: row.caption ?? "",
            }),
          };
        case "pinterest": {
          /*
           * A video pin needs a cover image, which Pinterest will not generate for us — so
           * a reel with no thumbnail cannot be pinned at all. Failing here with that as the
           * message beats letting Pinterest reject it with something opaque.
           */
          if (!coverUrl) {
            return {
              platform,
              error: new Error(
                "Could not make a cover image for this reel, and a Pinterest video pin " +
                  "requires one. Instagram and Facebook are unaffected.",
              ),
            };
          }
          const caption = row.caption ?? "";
          return {
            platform,
            result: await createVideoPin({
              boardId: await getSelectedBoardId(),
              videoUrl: row.video_url!,
              coverImageUrl: coverUrl,
              // Pins have a title above the description; the caption's first line is the
              // closest thing a reel has to one.
              title: caption.split("\n")[0] || "Habiba Minhas",
              description: caption,
              link: pinLink,
            }),
          };
        }
        default:
          return {
            platform,
            error: new Error(
              `No reel adapter for "${platform}". Switch it off for video in Settings until one exists.`,
            ),
          };
      }
    } catch (e) {
      return { platform, error: e };
    }
  });

  for (const outcome of await Promise.all(attempts)) {
    const { platform } = outcome;

    if ("skipped" in outcome) {
      succeeded.push(platform);
      continue;
    }

    if ("result" in outcome && outcome.result) {
      results[platform] = {
        ok: true,
        id: outcome.result.externalPostId,
        permalink: outcome.result.permalink ?? null,
        at: new Date().toISOString(),
      };
      succeeded.push(platform);
      if (platform === "instagram") permalink = outcome.result.permalink;
      else permalink = permalink ?? outcome.result.permalink;
      continue;
    }

    /*
     * The full error object is stored, not just the message. The subcode separates
     * "retry in thirty seconds" from "stop for the day" — and for reels specifically,
     * 2207026 (unsupported format) reads nothing like 9004/2207052, which means Meta
     * could not fetch the file at all.
     */
    const e = (outcome as { error: unknown }).error;
    const meta = e instanceof MetaApiError ? e : null;
    const message = (e as Error).message;
    results[platform] = {
      ok: false,
      error: message,
      code: meta?.code ?? null,
      subcode: meta?.subcode ?? null,
      fbtrace_id: meta?.fbtraceId ?? null,
    };
    failed.push(platform);
  }

  const anyLive = succeeded.length > 0;
  const igResult = results.instagram as { id?: string; permalink?: string } | undefined;

  await sb
    .from("social_media_queue")
    .update({
      status: anyLive ? "posted" : "failed",
      platform_results: results as Json,
      external_post_id: igResult?.id ?? null,
      permalink: igResult?.permalink ?? permalink ?? null,
      posted_at: anyLive ? new Date().toISOString() : null,
      error_message: failed.length > 0 ? `Failed on ${failed.join(", ")}` : null,
      error: failed.length > 0 ? (results as Json) : null,
    })
    .eq("id", id);

  if (!anyLive) {
    const first = results[failed[0]] as { error?: string } | undefined;
    return { ok: false, detail: first?.error ?? "Publishing failed" };
  }

  return {
    ok: failed.length === 0,
    detail:
      failed.length === 0
        ? `Published to ${succeeded.join(" and ")}`
        : `Published to ${succeeded.join(", ")} — failed on ${failed.join(", ")}`,
    permalink,
  };
}

/**
 * Where a video pin sends people.
 *
 * A reel built from exactly one product can send them straight to it, which is the whole
 * value of Pinterest over the Meta platforms. A collection reel or an uploaded clip covers
 * several products or none, so there is no honest single destination and it goes to the
 * homepage rather than to an arbitrary one of them.
 */
async function reelDestination(productIds: string[] | null): Promise<string> {
  if (productIds?.length === 1) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("products")
      .select("category, slug")
      .eq("id", productIds[0])
      .maybeSingle();
    if (data?.category && data?.slug) {
      return productUrl(data.category, data.slug, "pinterest");
    }
  }

  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://habibaminhas.com").replace(/\/$/, "");
  return `${base}/?utm_source=pinterest&utm_medium=social&utm_campaign=reel`;
}

/**
 * Publishes everything sitting in `approved`.
 *
 * Written for the scheduler that arrives with the planner, so a reel can be approved today
 * and go out at its slot rather than immediately. Publishes one at a time — Meta counts
 * each against the daily publishing quota, and a burst is exactly what an automated
 * account should not look like.
 */
export async function publishApprovedReels(limit = 1): Promise<PublishReelResult[]> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("social_media_queue")
    .select("id")
    .eq("status", "approved")
    .order("approved_at", { ascending: true })
    .limit(limit);

  const out: PublishReelResult[] = [];
  for (const row of data ?? []) out.push(await publishQueuedReel(row.id as string));
  return out;
}

const REEL_SLOT_TOLERANCE_MINUTES = 30;

export type ScheduledReelRun = {
  ok: boolean;
  action: "skipped" | "no_slot_due" | "slot_already_ran" | "published" | "nothing_approved";
  detail?: unknown;
};

/**
 * The scheduled half of the reel pipeline: send out what has already been approved.
 *
 * This is what makes "approve once, it goes out at its slot" true rather than aspirational.
 * `publishApprovedReels` existed but nothing ever called it, so an approved reel sat in
 * `approved` indefinitely and the only way to publish one was to be at the computer
 * pressing a button — which is the manual workflow the automation exists to remove.
 *
 * Reels keep their **own** days and times. A reel cadence must never be able to interfere
 * with the daily photo post, so this is a separate slot check against `reel_days` /
 * `reel_times` rather than a second use of the photo schedule.
 *
 * Note what this does *not* do: it never generates a reel. Encoding runs on the owner's
 * machine, so the scheduler can only drain a queue somebody has already filled and
 * approved. Promising otherwise would produce a plan that silently delivers nothing.
 */
export async function runScheduledReels(now: Date = new Date()): Promise<ScheduledReelRun> {
  const settings = await getSocialSettings();
  if (!settings) return { ok: false, action: "skipped", detail: "social_settings row missing" };
  if (!settings.enabled) return { ok: true, action: "skipped", detail: "automation disabled" };

  const slot = findDueSlot(
    settings.reel_times,
    settings.timezone,
    now,
    REEL_SLOT_TOLERANCE_MINUTES,
    settings.reel_days,
  );
  if (!slot) {
    return {
      ok: true,
      action: "no_slot_due",
      detail: { slots: settings.reel_times, days: settings.reel_days },
    };
  }

  /*
   * The cron ticks every 15 minutes and a slot stays due for 30, so the same slot would
   * otherwise fire twice. Guarding on "was a reel posted inside the tolerance window"
   * rather than on the slot name keeps this true even if the times are edited between
   * ticks.
   */
  const sb = createAdminClient();
  const since = new Date(now.getTime() - REEL_SLOT_TOLERANCE_MINUTES * 60_000).toISOString();
  const { count } = await sb
    .from("social_media_queue")
    .select("id", { count: "exact", head: true })
    .eq("status", "posted")
    .gte("posted_at", since);
  if ((count ?? 0) > 0) return { ok: true, action: "slot_already_ran", detail: { slot } };

  const results = await publishApprovedReels(1);
  if (results.length === 0) {
    return { ok: true, action: "nothing_approved", detail: { slot } };
  }
  return { ok: results.every((r) => r.ok), action: "published", detail: { slot, results } };
}
