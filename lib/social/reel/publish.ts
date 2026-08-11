import { createAdminClient } from "@/lib/supabase/server";
import { getMetaCredentials, getEnabledCollaborators } from "@/lib/social/config";
import { publishReel as publishToInstagram } from "@/lib/social/adapters/instagram";
import { publishFacebookReel } from "@/lib/social/adapters/facebook";
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

export async function publishQueuedReel(id: string): Promise<PublishReelResult> {
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
   * Targets come from the same platform registry the photo pipeline uses, so switching
   * Facebook off on the Platforms tab switches it off for reels too. Reels were
   * Instagram-only at first, which meant the Facebook Page silently never received them.
   */
  const { data: registry } = await sb
    .from("social_platforms")
    .select("key")
    .eq("enabled", true)
    .eq("supported", true);
  const targets = (registry ?? [])
    .map((p) => p.key as string)
    .filter((k) => k === "instagram" || k === "facebook");

  if (targets.length === 0) {
    return { ok: false, detail: "No platform is switched on for publishing" };
  }

  /*
   * Each platform is attempted independently and its outcome recorded separately. A reel
   * that lands on Instagram and fails on Facebook must not be reported as a total failure,
   * and must not be retried on Instagram — that would double-post.
   */
  const previous = (row.platform_results ?? {}) as Record<string, { ok?: boolean }>;
  const results: Record<string, Json> = { ...(previous as Record<string, Json>) };
  const succeeded: string[] = [];
  const failed: string[] = [];
  let permalink: string | undefined;

  for (const platform of targets) {
    if (previous[platform]?.ok) {
      // Already live from an earlier attempt — never publish it twice.
      succeeded.push(platform);
      continue;
    }
    try {
      const result =
        platform === "instagram"
          ? await publishToInstagram(creds, {
              videoUrl: row.video_url,
              caption: row.caption ?? "",
              collaborators,
            })
          : await publishFacebookReel(creds, {
              videoUrl: row.video_url,
              caption: row.caption ?? "",
            });

      results[platform] = {
        ok: true,
        id: result.externalPostId,
        permalink: result.permalink ?? null,
        at: new Date().toISOString(),
      };
      succeeded.push(platform);
      if (platform === "instagram") permalink = result.permalink;
      else permalink = permalink ?? result.permalink;
    } catch (e) {
      /*
       * The full error object is stored, not just the message. The subcode separates
       * "retry in thirty seconds" from "stop for the day" — and for reels specifically,
       * 2207026 (unsupported format) reads nothing like 9004/2207052, which means Meta
       * could not fetch the file at all.
       */
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
