import type { MetaCredentials } from "../config";
import {
  graphRequest,
  withRetry,
  uncachedUrl,
  MetaApiError,
  type PlatformAdapter,
  type PublishImagePostInput,
  type PublishResult,
} from "./types";

/**
 * Instagram adapter — two-step container publishing.
 *
 *   POST /{ig-user-id}/media          → returns a container id
 *   POST /{ig-user-id}/media_publish  → publishes it
 *
 * For carousels, one container per image with `is_carousel_item=true`, then a parent
 * container with `media_type=CAROUSEL` and the child ids, then publish the parent.
 *
 * Constraints that shape everything, all from Meta's own documentation:
 *   - JPEG only. WebP is rejected outright — handled upstream in lib/social/images.ts.
 *   - Carousels need 2–10 items; a single image must take the single-post path instead.
 *   - Aspect ratio must be 4:5 → 1.91:1.
 *   - Images must be publicly fetchable at publish time (Meta cURLs the URL).
 *   - Captions are not clickable, which is why the CTA says "link in bio".
 */

const CAROUSEL_MIN = 2;
const CAROUSEL_MAX = 10;

/**
 * Meta's create-media parameter documents "up to 3 instagram usernames"; the
 * /collaborators edge reference says up to 5 accounts. The docs disagree, so we take the
 * lower, safer number — exceeding it would fail the whole publish.
 */
export const MAX_COLLABORATORS = 3;

export function createInstagramAdapter(creds: MetaCredentials): PlatformAdapter {
  return {
    platform: "instagram",

    limits: {
      captionMaxChars: 2200,
      hashtagMax: 30,
      imagesMax: CAROUSEL_MAX,
      imageFormats: ["jpeg"],
      supportsCarousel: true,
      supportsVideo: true, // Reels — Phase 2
      supportsLinkInCaption: false,
    },

    async publishImagePost(input: PublishImagePostInput): Promise<PublishResult> {
      const images = input.imageUrls.slice(0, CAROUSEL_MAX);
      if (images.length === 0) throw new Error("Instagram: no images supplied");

      const collaborators = (input.collaborators ?? []).slice(0, MAX_COLLABORATORS);

      const containerId =
        images.length >= CAROUSEL_MIN
          ? await createCarouselContainer(creds, images, input.caption, collaborators)
          : await createSingleContainer(
              creds,
              images[0],
              input.caption,
              input.altText,
              collaborators,
            );

      const published = await publishContainer(creds, containerId);
      return {
        externalPostId: published,
        permalink: await fetchPermalink(creds, published),
      };
    },
  };
}

async function createSingleContainer(
  creds: MetaCredentials,
  imageUrl: string,
  caption: string,
  altText?: string,
  collaborators: string[] = [],
): Promise<string> {
  const res = await withRetry(() => {
    const params: Record<string, string> = { image_url: uncachedUrl(imageUrl), caption };
    if (altText) params.alt_text = altText;
    if (collaborators.length > 0) params.collaborators = JSON.stringify(collaborators);
    return graphRequest<{ id: string }>(creds, `/${creds.igUserId}/media`, params);
  });
  return res.id;
}

async function createCarouselContainer(
  creds: MetaCredentials,
  imageUrls: string[],
  caption: string,
  collaborators: string[] = [],
): Promise<string> {
  // Children are created sequentially rather than in parallel: Meta fetches each URL
  // server-side, and firing ten simultaneous requests is a reliable way to trip rate
  // limiting on an account that publishes once a day.
  const childIds: string[] = [];
  for (const url of imageUrls) {
    const child = await withRetry(() =>
      graphRequest<{ id: string }>(creds, `/${creds.igUserId}/media`, {
        image_url: uncachedUrl(url),
        is_carousel_item: "true",
      }),
    );
    childIds.push(child.id);
  }

  // Collaborators and the caption go on the parent only — children are just slides.
  const parentParams: Record<string, string> = {
    media_type: "CAROUSEL",
    children: childIds.join(","),
    caption,
  };
  if (collaborators.length > 0) parentParams.collaborators = JSON.stringify(collaborators);

  const parent = await withRetry(() =>
    graphRequest<{ id: string }>(creds, `/${creds.igUserId}/media`, parentParams),
  );
  return parent.id;
}

/**
 * Publishes a container, waiting for it to finish processing first.
 *
 * Image containers are usually FINISHED immediately, but a carousel of ten can take a
 * moment. Meta's guidance is to poll once per minute for no more than five minutes; this
 * polls faster because images are quick and a serverless invocation has a deadline.
 */
async function publishContainer(creds: MetaCredentials, containerId: string): Promise<string> {
  await waitForContainer(creds, containerId);

  const res = await withRetry(() =>
    graphRequest<{ id: string }>(creds, `/${creds.igUserId}/media_publish`, {
      creation_id: containerId,
    }),
  );
  return res.id;
}

async function waitForContainer(
  creds: MetaCredentials,
  containerId: string,
  maxAttempts = 10,
  intervalMs = 3000,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await graphRequest<{ status_code?: string }>(
      creds,
      `/${containerId}`,
      { fields: "status_code" },
      "GET",
    );
    const status = res.status_code;

    if (status === "FINISHED" || status === "PUBLISHED") return;
    if (status === "ERROR") {
      throw new MetaApiError(`Container ${containerId} failed processing`, 400, {
        error: { message: "Container status ERROR", code: 9007, error_subcode: 2207027 },
      });
    }
    if (status === "EXPIRED") {
      throw new MetaApiError(`Container ${containerId} expired before publishing`, 400, {
        error: { message: "Container expired", code: -2, error_subcode: 2207020 },
      });
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  // IN_PROGRESS after the whole window — publishing anyway would just fail, so surface it.
  throw new Error(`Container ${containerId} still processing after ${maxAttempts} checks`);
}

/**
 * Publishes a Reel.
 *
 * Deliberately a separate path from `publishImagePost` rather than a widened version of
 * it. Reels differ in three ways that matter:
 *
 * 1. **Processing is genuinely slow.** Meta transcodes the video server-side, which takes
 *    tens of seconds to minutes, where an image container is usually `FINISHED` on the
 *    first poll. The wait window here is minutes, not seconds.
 * 2. **`share_to_feed` decides whether it also appears on the profile grid**, not only in
 *    the Reels tab. For a shop that is always wanted — the grid is the shopfront.
 * 3. **No `alt_text`.** Meta does not accept it on Reels, so passing it errors rather than
 *    being ignored.
 *
 * Collaborators work exactly as they do on carousels: the parameter is supported on Feed
 * images, Reels and Carousels alike.
 */
export async function publishReel(
  creds: MetaCredentials,
  input: { videoUrl: string; caption: string; collaborators?: string[] },
): Promise<{ externalPostId: string; permalink?: string }> {
  const collaborators = (input.collaborators ?? []).slice(0, MAX_COLLABORATORS);

  const container = await withRetry(() => {
    const params: Record<string, string> = {
      media_type: "REELS",
      // Same cache-busting as images: Meta negative-caches a URL it once failed to fetch,
      // and a single propagation miss would otherwise poison this video permanently.
      video_url: uncachedUrl(input.videoUrl),
      caption: input.caption,
      share_to_feed: "true",
    };
    if (collaborators.length > 0) params.collaborators = JSON.stringify(collaborators);
    return graphRequest<{ id: string }>(creds, `/${creds.igUserId}/media`, params);
  });

  /*
   * Measured against the live API, Meta transcodes an 11-second reel in about 45 seconds,
   * and that time is entirely Meta's — nothing here can shorten it.
   *
   * What the interval controls is how much is *wasted* rounding up. At the previous 10s
   * the answer was up to ten seconds of sitting on a finished container; at 3s it is at
   * most three. 100 attempts still covers five minutes for a slow one.
   */
  await waitForContainer(creds, container.id, 100, 3000);

  const published = await withRetry(() =>
    graphRequest<{ id: string }>(creds, `/${creds.igUserId}/media_publish`, {
      creation_id: container.id,
    }),
  );

  return {
    externalPostId: published.id,
    permalink: await fetchPermalink(creds, published.id),
  };
}

/** Best-effort: a missing permalink must never fail a post that already published. */
async function fetchPermalink(
  creds: MetaCredentials,
  mediaId: string,
): Promise<string | undefined> {
  try {
    const res = await graphRequest<{ permalink?: string }>(
      creds,
      `/${mediaId}`,
      { fields: "permalink" },
      "GET",
    );
    return res.permalink;
  } catch {
    return undefined;
  }
}

/**
 * Deletes a published Instagram post.
 *
 * Requires `instagram_manage_contents`, which the System User token already carries.
 * Facebook Login only, which is our path.
 *
 * For a carousel this must be the **parent** media id — Meta does not support removing an
 * individual slide, and passing a child id returns subcode 2207073.
 *
 * This exists because Instagram captions cannot be edited: `POST /{ig-media-id}` accepts
 * only `comment_enabled`. Delete-and-repost is the sole way to correct a live post.
 */
export async function deleteInstagramMedia(
  creds: MetaCredentials,
  mediaId: string,
): Promise<void> {
  await graphRequest(creds, `/${mediaId}`, {}, "DELETE");
}

/**
 * Collaborator invite status for a published post.
 *
 * `invite_status` is `Pending` until the tagged account accepts in the Instagram app, so
 * the admin UI can show "awaiting acceptance" rather than looking like nothing happened.
 * Best-effort — never fail a post over a status read.
 */
export async function getCollaboratorStatus(
  creds: MetaCredentials,
  mediaId: string,
): Promise<Array<{ username: string; invite_status: string }>> {
  try {
    const res = await graphRequest<{
      data?: Array<{ username?: string; invite_status?: string }>;
    }>(creds, `/${mediaId}/collaborators`, {}, "GET");

    return (res.data ?? []).map((c) => ({
      username: c.username ?? "",
      invite_status: c.invite_status ?? "Unknown",
    }));
  } catch {
    return [];
  }
}

/** Current usage against the 24-hour publishing cap. Used by the admin dashboard. */
export async function getPublishingQuota(
  creds: MetaCredentials,
): Promise<{ used: number; total: number | null }> {
  const res = await graphRequest<{
    data?: Array<{ quota_usage?: number; config?: { quota_total?: number } }>;
  }>(creds, `/${creds.igUserId}/content_publishing_limit`, { fields: "config,quota_usage" }, "GET");

  const row = res.data?.[0];
  return { used: row?.quota_usage ?? 0, total: row?.config?.quota_total ?? null };
}
