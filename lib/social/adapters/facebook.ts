import type { MetaCredentials } from "../config";
import {
  graphRequest,
  withRetry,
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
        permalink: `https://www.facebook.com/${postId}`,
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

async function publishSinglePhoto(
  creds: MetaCredentials,
  imageUrl: string,
  caption: string,
): Promise<string> {
  const res = await withRetry(() =>
    graphRequest<{ id: string; post_id?: string }>(creds, `/${creds.pageId}/photos`, {
      url: imageUrl,
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
        url,
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
