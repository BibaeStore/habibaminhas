"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getSocialSettings, startOfLocalWeekUtc } from "@/lib/social/config";

/**
 * The one summary shown on every social page.
 *
 * The social admin is split across four pages — Photos, Reels, Planner, Settings — and the
 * risk of splitting it is that "what is going out this week?" becomes a question you answer
 * by visiting two pages and adding up yourself. This is the answer to that question,
 * rendered in the shared layout so it is present wherever you are standing.
 *
 * Deliberately counts only. It runs on every navigation, so it must stay cheap: no
 * captions, no image URLs, no joins.
 */

export type SocialSummary = {
  /** Automation master switch. */
  enabled: boolean;
  /** Monday 00:00 in the configured timezone, as an ISO instant. */
  weekStart: string;
  photos: { published: number; target: number | null };
  reels: { published: number; target: number | null };
  /** Items where nothing moves until a person acts — drafts awaiting review, plus failures. */
  needsYou: { photos: number; reels: number; failed: number };
  /** Name of the active plan, when one exists. */
  planName: string | null;
};

export async function fetchSocialSummary(): Promise<SocialSummary> {
  const sb = createAdminClient();
  const settings = await getSocialSettings();
  const timezone = settings?.timezone ?? "Asia/Karachi";
  const weekStart = startOfLocalWeekUtc(timezone).toISOString();

  const [photoRows, reelRows, photoPending, reelDrafts, photoFailed, reelFailed, plan] =
    await Promise.all([
      // A photo post writes one row per platform, so counting rows would report a post to
      // two platforms as two posts — the exact mistake that made the daily ceiling count
      // wrong. Group ids are collapsed below.
      sb.from("social_post_log")
        .select("group_id, id")
        .eq("status", "posted")
        .gte("posted_at", weekStart),
      sb.from("social_media_queue")
        .select("id", { count: "exact", head: true })
        .eq("status", "posted")
        .gte("posted_at", weekStart),
      sb.from("social_post_log")
        .select("group_id, id")
        .eq("status", "pending"),
      sb.from("social_media_queue")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      sb.from("social_post_log")
        .select("group_id, id")
        .eq("status", "failed"),
      sb.from("social_media_queue")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed"),
      sb.from("social_plans")
        .select("name, photos_per_week, reels_per_week")
        .eq("is_active", true)
        .maybeSingle(),
    ]);

  /** Distinct posts, not distinct platform rows. */
  const distinct = (rows: Array<{ group_id: string | null; id: string }> | null) =>
    new Set((rows ?? []).map((r) => r.group_id ?? r.id)).size;

  return {
    enabled: settings?.enabled ?? false,
    weekStart,
    photos: {
      published: distinct(photoRows.data),
      target: plan.data?.photos_per_week ?? null,
    },
    reels: {
      published: reelRows.count ?? 0,
      target: plan.data?.reels_per_week ?? null,
    },
    needsYou: {
      photos: distinct(photoPending.data),
      reels: reelDrafts.count ?? 0,
      failed: distinct(photoFailed.data) + (reelFailed.count ?? 0),
    },
    planName: plan.data?.name ?? null,
  };
}
