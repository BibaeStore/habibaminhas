import { createAdminClient } from "@/lib/supabase/server";
import { getMetaCredentials, getEnabledCollaborators } from "@/lib/social/config";
import { publishReel as publishToInstagram } from "@/lib/social/adapters/instagram";
import { MetaApiError } from "@/lib/social/adapters/types";

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

  try {
    const result = await publishToInstagram(creds, {
      videoUrl: row.video_url,
      caption: row.caption ?? "",
      collaborators,
    });

    await sb
      .from("social_media_queue")
      .update({
        status: "posted",
        external_post_id: result.externalPostId,
        permalink: result.permalink ?? null,
        posted_at: new Date().toISOString(),
        error: null,
        error_message: null,
      })
      .eq("id", id);

    return {
      ok: true,
      detail: "Published to Instagram",
      permalink: result.permalink,
    };
  } catch (e) {
    /*
     * The full error object is stored, not just the message. The subcode is what separates
     * "retry in thirty seconds" from "stop for the day" — and for reels specifically,
     * 2207026 (unsupported video format) reads nothing like 9004/2207052, which means Meta
     * could not fetch the file at all.
     */
    const meta = e instanceof MetaApiError ? e : null;
    const message = (e as Error).message;

    await sb
      .from("social_media_queue")
      .update({
        status: "failed",
        error: meta
          ? { code: meta.code, subcode: meta.subcode, fbtrace_id: meta.fbtraceId, message }
          : { message },
        error_message: message,
      })
      .eq("id", id);

    return { ok: false, detail: message };
  }
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
