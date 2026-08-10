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
