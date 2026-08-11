import type { MetaCredentials } from "../config";
import {
  graphRequest,
  withRetry,
  uncachedUrl,
  type PlatformAdapter,
  type PublishImagePostInput,
  type PublishResult,
} from "./types";

/**
 * Facebook Page adapter.
 *
 * Simpler than Instagram in the ways that matter: no container two-step, and Facebook
 * *does* render URLs in post text as clickable — so the product link goes directly in the
 * copy rather than into a "link in bio" workaround.
 *
 * Single photo:  POST /{page-id}/photos  with a public `url`.
 * Multiple:      upload each with `published=false`, collect the media ids, then create a
 *                feed post referencing them via `attached_media`. This is the working
 *                approach; the Pages posts endpoint does not document multi-photo directly.
 */

export function createFacebookAdapter(creds: MetaCredentials): PlatformAdapter {
  return {
    platform: "facebook",

    limits: {
      captionMaxChars: 63206,
      hashtagMax: 30,
      imagesMax: 10,
      imageFormats: ["jpeg", "png"],
      supportsCarousel: true,
      supportsVideo: true,
      supportsLinkInCaption: true,
    },

    async publishImagePost(input: PublishImagePostInput): Promise<PublishResult> {
      const images = input.imageUrls.slice(0, 10);
      if (images.length === 0) throw new Error("Facebook: no images supplied");

      const pageToken = await getPageAccessToken(creds);
      const pageCreds: MetaCredentials = { ...creds, token: pageToken };

      const postId =
        images.length === 1
          ? await publishSinglePhoto(pageCreds, images[0], input.caption)
          : await publishMultiPhoto(pageCreds, images, input.caption);

      return {
        externalPostId: postId,
        permalink: await fetchPermalink(pageCreds, postId),
      };
    },
  };
}

/**
 * Exchanges the System User token for a Page access token.
 *
 * Page endpoints expect to be called as the Page. The System User has the Page assigned
 * with CREATE_CONTENT and MANAGE, so it can mint one — doing this explicitly is more
 * reliable than hoping Meta resolves the system-user token for every Page endpoint.
 *
 * Cached per process: a warm serverless instance handling several posts should not fetch
 * the same token repeatedly.
 */
let cachedPageToken: { pageId: string; token: string; at: number } | null = null;
const PAGE_TOKEN_TTL_MS = 10 * 60 * 1000;

async function getPageAccessToken(creds: MetaCredentials): Promise<string> {
  const now = Date.now();
  if (
    cachedPageToken &&
    cachedPageToken.pageId === creds.pageId &&
    now - cachedPageToken.at < PAGE_TOKEN_TTL_MS
  ) {
    return cachedPageToken.token;
  }

  const res = await graphRequest<{ access_token?: string }>(
    creds,
    `/${creds.pageId}`,
    { fields: "access_token" },
    "GET",
  );

  // Fall back to the system-user token rather than failing: on some asset configurations
  // it is accepted directly by the Page endpoints.
  const token = res.access_token ?? creds.token;
  cachedPageToken = { pageId: creds.pageId, token, at: now };
  return token;
}

/**
 * Deletes a published Page post.
 *
 * Meta's constraint: an app can only modify or delete a Page post that **that same app**
 * created. Everything we publish qualifies; anything posted by hand from the Page does not.
 */
export async function deleteFacebookPost(
  creds: MetaCredentials,
  postId: string,
): Promise<void> {
  const pageToken = await getPageAccessToken(creds);
  await graphRequest({ ...creds, token: pageToken }, `/${postId}`, {}, "DELETE");
}

/**
 * Asks the API for the post's real permalink.
 *
 * Do NOT build this by hand as `facebook.com/{page-id}_{post-id}`. Facebook has migrated
 * Pages to new-style actor IDs, so the legacy composite form no longer resolves — it
 * redirects to `permalink.php?story_fbid=pfbid…` and renders "This content isn't available
 * right now" even for a perfectly public, published post. The real shape is
 * `facebook.com/{new-actor-id}/posts/{post-id}`, and only the API knows the actor id.
 *
 * Best-effort: a missing permalink must never fail a post that already published.
 */
async function fetchPermalink(
  creds: MetaCredentials,
  postId: string,
): Promise<string | undefined> {
  try {
    const res = await graphRequest<{ permalink_url?: string }>(
      creds,
      `/${postId}`,
      { fields: "permalink_url" },
      "GET",
    );
    return res.permalink_url;
  } catch {
    return undefined;
  }
}

async function publishSinglePhoto(
  creds: MetaCredentials,
  imageUrl: string,
  caption: string,
): Promise<string> {
  const res = await withRetry(() =>
    graphRequest<{ id: string; post_id?: string }>(creds, `/${creds.pageId}/photos`, {
      url: uncachedUrl(imageUrl),
      caption,
      published: "true",
    }),
  );
  // `post_id` is the feed post; `id` is the photo object. The feed post is what we want.
  return res.post_id ?? res.id;
}

async function publishMultiPhoto(
  creds: MetaCredentials,
  imageUrls: string[],
  message: string,
): Promise<string> {
  const mediaIds: string[] = [];
  for (const url of imageUrls) {
    const res = await withRetry(() =>
      graphRequest<{ id: string }>(creds, `/${creds.pageId}/photos`, {
        url: uncachedUrl(url),
        published: "false",
      }),
    );
    mediaIds.push(res.id);
  }

  const params: Record<string, string> = { message };
  mediaIds.forEach((id, i) => {
    params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id });
  });

  const res = await withRetry(() =>
    graphRequest<{ id: string }>(creds, `/${creds.pageId}/feed`, params),
  );
  return res.id;
}

/**
 * Publishes a Reel to the Facebook Page.
 *
 * Nothing like the Instagram path, and nothing like posting a photo here either. Facebook
 * Reels use a **three-phase resumable upload** across two different hosts:
 *
 *   1. `POST /{page-id}/video_reels` with `upload_phase=start` on graph.facebook.com,
 *      which returns a video id and an upload URL
 *   2. `POST` to that URL on **rupload.facebook.com** — a different host, authorised with
 *      an `OAuth` header rather than a query parameter, and given the hosted file through
 *      a `file_url` *header* rather than a body field
 *   3. `POST /{page-id}/video_reels` again with `upload_phase=finish` to publish
 *
 * Step 2 is why this cannot reuse `graphRequest`: different host, different auth style,
 * and the payload travels in headers.
 *
 * Requires `pages_show_list`, `pages_read_engagement` and `pages_manage_posts`, all of
 * which the System User token carries.
 *
 * Meta's stated limits: 3–90 seconds, 9:16, minimum 540x960, and **30 API-published reels
 * per rolling 24 hours** — far above one a day, but worth knowing before any bulk run.
 */
export async function publishFacebookReel(
  creds: MetaCredentials,
  input: { videoUrl: string; caption: string },
): Promise<{ externalPostId: string; permalink?: string }> {
  const pageToken = await getPageAccessToken(creds);
  const pageCreds: MetaCredentials = { ...creds, token: pageToken };
  const version = process.env.META_GRAPH_API_VERSION || "v26.0";

  // 1. Open an upload session.
  const started = await withRetry(() =>
    graphRequest<{ video_id: string; upload_url: string }>(
      pageCreds,
      `/${creds.pageId}/video_reels`,
      { upload_phase: "start" },
    ),
  );

  // 2. Hand Meta the hosted file. Note the cache-busting: Meta negative-caches a URL it
  //    once failed to fetch, and one propagation miss would otherwise poison this video
  //    permanently — the same failure that cost a day on the image pipeline.
  const uploadUrl =
    started.upload_url || `https://rupload.facebook.com/video-upload/${version}/${started.video_id}`;

  const uploaded = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `OAuth ${pageToken}`,
      file_url: uncachedUrl(input.videoUrl),
    },
  });

  if (!uploaded.ok) {
    const body = await uploaded.text();
    throw new Error(`Facebook reel upload failed (${uploaded.status}): ${body.slice(0, 300)}`);
  }

  // 3. Wait only for the **upload** to land, then close the session.
  await waitForFacebookUpload(pageCreds, started.video_id);

  const finished = await withRetry(() =>
    graphRequest<{ success?: boolean; post_id?: string }>(
      pageCreds,
      `/${creds.pageId}/video_reels`,
      {
        video_id: started.video_id,
        upload_phase: "finish",
        video_state: "PUBLISHED",
        description: input.caption,
      },
    ),
  );

  const postId = finished.post_id ?? started.video_id;
  return {
    externalPostId: postId,
    permalink: `https://www.facebook.com/reel/${started.video_id}`,
  };
}

/**
 * Waits for the **upload** to land — and deliberately not for processing.
 *
 * This was the cause of every Facebook reel failing while Instagram succeeded. The first
 * version waited for `processing_phase` to reach `complete` before calling
 * `upload_phase=finish`, which deadlocks: Facebook does not begin processing until finish
 * is called. Measured against the live API, the status sat at
 *
 *     video_status: "upload_complete", processing_phase: { status: "not_started" }
 *
 * indefinitely — still "not_started" after six minutes — and the moment `finish` was sent
 * it returned `"Video is Processing"` with a post id. So the wait ran its full 300-second
 * budget and then threw, every single time.
 *
 * Uploading is quick because Meta fetches the file itself: in practice the phase is already
 * `complete` on the first check. Processing afterwards is Facebook's own business and
 * happens whether or not we watch it, so the publish returns as soon as the session closes.
 */
async function waitForFacebookUpload(
  creds: MetaCredentials,
  videoId: string,
  maxAttempts = 20,
  intervalMs = 2000,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await graphRequest<{
      status?: {
        video_status?: string;
        uploading_phase?: { status?: string; error?: { message?: string } };
      };
    }>(creds, `/${videoId}`, { fields: "status" }, "GET");

    const status = res.status ?? {};
    const uploadError = status.uploading_phase?.error?.message;
    if (uploadError) throw new Error(`Facebook reel upload failed: ${uploadError}`);
    if (status.video_status === "error") throw new Error("Facebook reel upload errored");
    if (status.video_status === "expired") throw new Error("Facebook reel upload session expired");

    if (status.uploading_phase?.status === "complete") return;
    if (status.video_status === "upload_complete" || status.video_status === "ready") return;

    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Facebook video ${videoId} did not finish uploading after ${maxAttempts} checks`);
}
