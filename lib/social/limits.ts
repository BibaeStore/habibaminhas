/**
 * Platform limits shared between server actions and client components.
 *
 * These live outside `lib/actions/social.ts` because a `"use server"` module may only
 * export async functions — exporting a plain constant from one is a build error, not just
 * a lint warning.
 */

/**
 * Instagram co-authors per post.
 *
 * Meta's create-media parameter documents "up to 3 instagram usernames" while the
 * /collaborators edge reference says 5. The docs disagree, so we take the lower number —
 * exceeding the real cap would fail the entire publish, not just drop the extra tag.
 */
export const MAX_ENABLED_COLLABORATORS = 3;

/** Caption ceiling enforced by Meta (error 36004 / subcode 2207010). */
export const CAPTION_MAX_CHARS = 2200;

/** Hashtag ceiling enforced by Meta on the same error. */
export const HASHTAG_MAX = 30;

/**
 * Instagram Reels limits, checked before an upload rather than discovered at publish time.
 *
 * The owner films their own video and expects "upload once, it posts itself". Without these,
 * a three-minute clip uploads perfectly, sits as a draft, gets approved, and then fails at
 * Meta days later with an error that names none of this. Catching it at the moment of upload
 * is the difference between a two-second correction and a silent gap in the schedule.
 *
 * Figures are Meta's published Reels constraints.
 */
export const REEL_MIN_SECONDS = 3;
export const REEL_MAX_SECONDS = 90;
export const REEL_MAX_BYTES = 1_073_741_824; // 1 GB, matching the storage bucket

/** Null when the video is publishable; otherwise the reason, written for the owner. */
export function checkReelVideo(input: {
  durationSeconds?: number | null;
  bytes?: number | null;
}): string | null {
  const { durationSeconds: d, bytes } = input;

  if (bytes != null && bytes > REEL_MAX_BYTES) {
    return `That file is ${(bytes / 1024 / 1024).toFixed(0)} MB. Instagram accepts up to 1 GB.`;
  }

  /*
   * A missing duration is allowed through deliberately. The browser reads it from the file's
   * metadata, and some encoders write a container the browser cannot measure. Blocking a
   * perfectly good video because we could not measure it would be worse than letting Meta be
   * the judge -- the check exists to catch the obvious, not to gate on our own confidence.
   */
  if (d == null) return null;

  if (d < REEL_MIN_SECONDS) {
    return `That video is ${d.toFixed(1)}s. Instagram Reels must be at least ${REEL_MIN_SECONDS} seconds.`;
  }
  if (d > REEL_MAX_SECONDS) {
    return `That video is ${Math.round(d)}s. Instagram Reels can be at most ${REEL_MAX_SECONDS} seconds — trim it and upload again.`;
  }
  return null;
}
