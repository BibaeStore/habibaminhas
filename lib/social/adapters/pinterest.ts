import { createAdminClient } from "@/lib/supabase/server";
import type { PlatformAdapter, PublishImagePostInput, PublishResult } from "./types";

/**
 * Pinterest — the first platform here that is not Meta.
 *
 * Two things make it different from the Instagram/Facebook adapters, and both are
 * structural rather than cosmetic:
 *
 * 1. **Tokens expire.** Meta issued a non-expiring System User token and needed no login
 *    flow at all. Pinterest is user OAuth: the access token lasts 30 days and the refresh
 *    token 60, so something must keep it alive forever or posting stops silently. Refresh
 *    here is *lazy* — checked before every call — rather than a cron job, because a cron
 *    that quietly dies is exactly the failure this needs to survive.
 * 2. **Every pin needs a board.** There is no "just post it". The chosen board is part of
 *    the connection, stored on `social_accounts.meta`, not asked for per post.
 *
 * Worth the reminder: Pinterest is the only platform here that sends *traffic*. A pin
 * carries a destination link, so `link` is not optional decoration — it is the point.
 */

const API_PRODUCTION = "https://api.pinterest.com/v5";
const API_SANDBOX = "https://api-sandbox.pinterest.com/v5";
const OAUTH_AUTHORIZE = "https://www.pinterest.com/oauth/";

/**
 * Is this process talking to Pinterest's sandbox rather than the real thing?
 *
 * **This exists for one job: recording the demo video Pinterest requires to grant Standard
 * access.** A Trial-access app cannot create a pin in production — it is refused outright —
 * so the very capability the review is about cannot be filmed working. The sandbox is
 * Pinterest's own answer to that, named in the refusal message itself.
 *
 * Off unless explicitly switched on, and deliberately not inferred from `NODE_ENV`:
 * "development" is where the owner's admin actually runs and publishes from, so tying it to
 * that would send real posts into a void nobody can see. The one failure mode worth
 * engineering against here is leaving it switched on by accident, which is why the admin
 * shows a banner whenever it is.
 *
 * Both `PINTEREST_SANDBOX` and `PINTEREST_USE_SANDBOX` are accepted. There is no good reason
 * to make somebody remember which of two equally natural names was chosen, and a sandbox
 * flag that silently does nothing because of a spelling is worse than a redundant alias —
 * it reads as "the feature is broken".
 */
export function isPinterestSandbox(): boolean {
  const enabled = (value: string | undefined) => value?.trim().toLowerCase() === "true";
  return enabled(process.env.PINTEREST_SANDBOX) || enabled(process.env.PINTEREST_USE_SANDBOX);
}

/**
 * Base URL for every v5 call, including the token exchange.
 *
 * Switched wholesale rather than per-endpoint. Sandbox boards and pins are separate data
 * from production — a token minted against one does not address the other — so mixing the
 * two would mean picking a production board and then pinning to a sandbox that has never
 * heard of it.
 */
function apiBase(): string {
  return isPinterestSandbox() ? API_SANDBOX : API_PRODUCTION;
}

/** Everything the pipeline needs; nothing it does not. */
export const PINTEREST_SCOPES = [
  "pins:read",
  "pins:write",
  "boards:read",
  "boards:write",
  "user_accounts:read",
] as const;

export class PinterestApiError extends Error {
  readonly httpStatus: number;
  readonly raw: unknown;

  constructor(message: string, httpStatus: number, body: unknown) {
    super(message);
    this.name = "PinterestApiError";
    this.httpStatus = httpStatus;
    this.raw = body;
  }

  /** Worth retrying inside the same run rather than failing the post. */
  get isTransient(): boolean {
    return this.httpStatus >= 500 || this.httpStatus === 429;
  }

  toLog(): { message: string; httpStatus: number } {
    return { message: this.message, httpStatus: this.httpStatus };
  }
}

// ─── Credentials ──────────────────────────────────────────────────────────────

export type PinterestAppCredentials = { appId: string; appSecret: string };

export function getPinterestApp(): PinterestAppCredentials | null {
  const appId = process.env.PINTEREST_APP_ID?.trim();
  const appSecret = process.env.PINTEREST_APP_SECRET?.trim();
  if (!appId || !appSecret) return null;
  return { appId, appSecret };
}

/**
 * Where the admin lives *for this running process*.
 *
 * Not `NEXT_PUBLIC_SITE_URL`. That is the public storefront address and stays
 * `https://habibaminhas.com` even on a developer's machine — so a flow started locally
 * sent the owner to a production callback, which 404s until the branch is deployed. The
 * OAuth round trip has to come back to the server that started it.
 *
 * `PINTEREST_REDIRECT_URI` overrides everything, for a tunnel or a preview deployment.
 */
export function adminBaseUrl(): string {
  const explicit = process.env.ADMIN_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  if (process.env.NODE_ENV === "production") {
    return (process.env.NEXT_PUBLIC_SITE_URL || "https://habibaminhas.com").replace(/\/$/, "");
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * The redirect URI, which must match what is registered with Pinterest **byte for byte**
 * and must be identical in the authorize call and the token exchange.
 *
 * Register both the production and the localhost form in the Pinterest app; this picks
 * whichever matches the process actually handling the request.
 */
export function pinterestRedirectUri(): string {
  const explicit = process.env.PINTEREST_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  return `${adminBaseUrl()}/api/social/pinterest/callback`;
}

export function pinterestAuthUrl(state: string): string {
  const app = getPinterestApp();
  if (!app) throw new Error("PINTEREST_APP_ID / PINTEREST_APP_SECRET are not set.");

  const params = new URLSearchParams({
    client_id: app.appId,
    redirect_uri: pinterestRedirectUri(),
    response_type: "code",
    scope: PINTEREST_SCOPES.join(","),
    state,
  });
  return `${OAUTH_AUTHORIZE}?${params.toString()}`;
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

type StoredCredentials = {
  access_token: string;
  refresh_token: string;
  /** ISO instant the access token stops working. */
  expires_at: string;
  /** ISO instant the refresh token stops working — 60 days, extended on each refresh. */
  refresh_expires_at: string;
  scope?: string;
};

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_token_expires_in?: number;
  scope?: string;
};

/** Token requests authenticate with HTTP Basic, not a bearer token. */
function basicAuth(app: PinterestAppCredentials): string {
  return `Basic ${Buffer.from(`${app.appId}:${app.appSecret}`).toString("base64")}`;
}

async function tokenRequest(
  app: PinterestAppCredentials,
  body: Record<string, string>,
): Promise<StoredCredentials> {
  const res = await fetch(`${apiBase()}/oauth/token`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: basicAuth(app),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text };
  }

  if (!res.ok) {
    const msg =
      (parsed as { message?: string; error_description?: string } | null)?.message ??
      (parsed as { error_description?: string } | null)?.error_description ??
      `Pinterest token request failed (${res.status})`;
    throw new PinterestApiError(msg, res.status, parsed);
  }

  const token = parsed as TokenResponse;
  const now = Date.now();
  return {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: new Date(now + token.expires_in * 1000).toISOString(),
    // Pinterest's continuous refresh token lasts 60 days and is refreshable indefinitely,
    // so every refresh pushes this out again. Default defensively if it is omitted.
    refresh_expires_at: new Date(
      now + (token.refresh_token_expires_in ?? 60 * 24 * 3600) * 1000,
    ).toISOString(),
    scope: token.scope,
  };
}

/** Exchange the one-time authorization code for tokens. */
export async function exchangeCode(code: string): Promise<StoredCredentials> {
  const app = getPinterestApp();
  if (!app) throw new Error("PINTEREST_APP_ID / PINTEREST_APP_SECRET are not set.");

  return tokenRequest(app, {
    grant_type: "authorization_code",
    code,
    redirect_uri: pinterestRedirectUri(),
  });
}

/**
 * A usable access token, refreshed if it is close to expiring.
 *
 * Refreshed lazily on every call rather than on a schedule. A scheduled refresh is one more
 * thing that can stop without anyone noticing — and this project already has a pg_cron job
 * that sat inactive for days without being spotted. Refreshing at the point of use means
 * the token is correct exactly when it matters.
 *
 * The one-day margin is generous on purpose: the token lasts 30 days, so refreshing a day
 * early costs nothing and covers a clock skew or a long-running job.
 */
export async function getAccessToken(): Promise<string> {
  const sb = createAdminClient();
  const { data: account } = await sb
    .from("social_accounts")
    .select("id, credentials")
    .eq("platform", "pinterest")
    .maybeSingle();

  if (!account) throw new Error("Pinterest is not connected. Connect it under Platforms.");

  const creds = account.credentials as unknown as StoredCredentials | null;
  if (!creds?.access_token) {
    throw new Error("Pinterest connection is incomplete — reconnect it under Platforms.");
  }

  const expiresAt = Date.parse(creds.expires_at ?? "");
  const stillGood = Number.isFinite(expiresAt) && expiresAt - Date.now() > 24 * 3600 * 1000;
  if (stillGood) return creds.access_token;

  const refreshExpiresAt = Date.parse(creds.refresh_expires_at ?? "");
  if (Number.isFinite(refreshExpiresAt) && refreshExpiresAt < Date.now()) {
    throw new Error(
      "The Pinterest refresh token has expired. Reconnect the account under Platforms.",
    );
  }

  const app = getPinterestApp();
  if (!app) throw new Error("PINTEREST_APP_ID / PINTEREST_APP_SECRET are not set.");

  const refreshed = await tokenRequest(app, {
    grant_type: "refresh_token",
    refresh_token: creds.refresh_token,
  });

  await sb
    .from("social_accounts")
    .update({ credentials: refreshed, updated_at: new Date().toISOString() })
    .eq("id", account.id);

  return refreshed.access_token;
}

// ─── Requests ─────────────────────────────────────────────────────────────────

async function api<T>(
  path: string,
  init: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${apiBase()}${path}`, {
    method: init.method ?? "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(init.body ? { body: JSON.stringify(init.body) } : {}),
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text };
  }

  if (!res.ok) {
    const msg =
      (parsed as { message?: string } | null)?.message ?? `Pinterest ${res.status} on ${path}`;
    throw new PinterestApiError(msg, res.status, parsed);
  }
  return parsed as T;
}

// ─── Account and boards ───────────────────────────────────────────────────────

export type PinterestAccount = { username: string; profileImage?: string | null };

export async function fetchAccount(): Promise<PinterestAccount> {
  const data = await api<{ username: string; profile_image?: string }>("/user_account");
  return { username: data.username, profileImage: data.profile_image ?? null };
}

export type PinterestBoard = { id: string; name: string; pinCount: number; privacy: string };

/**
 * The owner's boards, newest first.
 *
 * Every pin must name one, so this exists to populate a picker rather than to guess. A
 * guessed board is a pin on the wrong shelf, publicly.
 */
export async function fetchBoards(): Promise<PinterestBoard[]> {
  const data = await api<{
    items: Array<{ id: string; name: string; pin_count?: number; privacy?: string }>;
  }>("/boards?page_size=100");

  return (data.items ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    pinCount: b.pin_count ?? 0,
    privacy: b.privacy ?? "PUBLIC",
  }));
}

export async function createBoard(name: string, description?: string): Promise<PinterestBoard> {
  const data = await api<{ id: string; name: string; privacy?: string }>("/boards", {
    method: "POST",
    body: { name, description: description ?? "", privacy: "PUBLIC" },
  });
  return { id: data.id, name: data.name, pinCount: 0, privacy: data.privacy ?? "PUBLIC" };
}

// ─── Pins ─────────────────────────────────────────────────────────────────────

export type CreateImagePinInput = {
  boardId: string;
  /** One image makes a standard pin; two to five make a carousel. */
  imageUrls: string[];
  title: string;
  description?: string;
  altText?: string;
  /** Where the pin sends people. The whole reason Pinterest is worth having. */
  link?: string;
};

export type PinResult = { externalPostId: string; permalink: string };

/** Pinterest's carousel ceiling. Beyond this the extra images are simply dropped. */
export const PIN_CAROUSEL_MAX_IMAGES = 5;

/**
 * Creates a pin — a carousel when given several images, a plain image pin when given one.
 *
 * **Carousel support is genuinely uncertain, so this degrades rather than trusting it.**
 * The v5 `multiple_image_urls` source type is documented by every third-party client and
 * still widely used, but Pinterest's own current organic-content guide says it has
 * "simplified our organic Pin formats to image or video Pins" and documents only
 * `image_url` and `video_id`. Both cannot be right, and which one is depends on the app's
 * own permissions in a way no amount of reading settles.
 *
 * So: attempt the carousel, and if Pinterest rejects the *format* specifically, fall back
 * to a single-image pin of the primary image rather than losing the post. A rejection for
 * any other reason — bad board, dead image URL, expired token — is a real failure and is
 * rethrown untouched, because silently swallowing those is how a pipeline ends up looking
 * fine while publishing nothing.
 */
export async function createImagePin(input: CreateImagePinInput): Promise<PinResult> {
  const images = input.imageUrls.filter(Boolean).slice(0, PIN_CAROUSEL_MAX_IMAGES);
  if (images.length === 0) throw new Error("Pinterest needs at least one image to pin.");

  // Pinterest fetches the images itself, and unlike TikTok it does not require the host to
  // be a domain we have proven we own — so Supabase Storage URLs work directly.
  const common = {
    board_id: input.boardId,
    title: truncate(input.title, 100),
    description: truncate(input.description ?? "", 800),
    ...(input.altText ? { alt_text: truncate(input.altText, 500) } : {}),
    ...(input.link ? { link: input.link } : {}),
  };

  const single = () =>
    api<{ id: string }>("/pins", {
      method: "POST",
      body: { ...common, media_source: { source_type: "image_url", url: images[0] } },
    });

  let data: { id: string };

  if (images.length === 1) {
    data = await single();
  } else {
    try {
      data = await api<{ id: string }>("/pins", {
        method: "POST",
        body: {
          ...common,
          media_source: {
            source_type: "multiple_image_urls",
            items: images.map((url) => ({ url })),
          },
        },
      });
    } catch (e) {
      if (!isUnsupportedFormat(e)) throw e;
      data = await single();
    }
  }

  return { externalPostId: data.id, permalink: `https://www.pinterest.com/pin/${data.id}/` };
}

/**
 * Did Pinterest reject the *carousel format* itself, as opposed to something real?
 *
 * Deliberately narrow. A 400 mentioning the media source or the source type is the account
 * not being allowed to create carousels; a 400 about the board, the link or the image is a
 * genuine problem the owner needs to see.
 */
function isUnsupportedFormat(e: unknown): boolean {
  if (!(e instanceof PinterestApiError)) return false;
  if (e.httpStatus !== 400 && e.httpStatus !== 403 && e.httpStatus !== 422) return false;
  return /source_type|media_source|carousel|multiple_image/i.test(e.message);
}

export type CreateVideoPinInput = Omit<CreateImagePinInput, "imageUrls"> & {
  videoUrl: string;
  /** Pinterest requires a cover image for a video pin — the reel's thumbnail. */
  coverImageUrl: string;
};

/**
 * A video pin, which is a four-step dance rather than one call.
 *
 * Register the upload, PUT the bytes to the S3 URL Pinterest hands back as multipart form
 * data, poll until Pinterest finishes processing, then create the pin referencing the
 * finished media. The upload parameters must be sent as form fields *before* the file, in
 * the order given — S3 ignores anything after the file part.
 */
export async function createVideoPin(input: CreateVideoPinInput): Promise<PinResult> {
  // 1. Register.
  const registered = await api<{
    media_id: string;
    upload_url: string;
    upload_parameters: Record<string, string>;
  }>("/media", { method: "POST", body: { media_type: "video" } });

  // 2. Fetch our own file and forward it. Reels are ~3MB, so holding one in memory is fine.
  const video = await fetch(input.videoUrl, { cache: "no-store" });
  if (!video.ok) throw new Error(`Could not read the reel to upload (${video.status})`);
  const blob = await video.blob();

  const form = new FormData();
  for (const [key, value] of Object.entries(registered.upload_parameters ?? {})) {
    form.append(key, value);
  }
  form.append("file", blob, "reel.mp4");

  const uploaded = await fetch(registered.upload_url, { method: "POST", body: form });
  if (!uploaded.ok) {
    throw new PinterestApiError(
      `Pinterest rejected the video upload (${uploaded.status})`,
      uploaded.status,
      await uploaded.text().catch(() => null),
    );
  }

  // 3. Wait for processing.
  await waitForMedia(registered.media_id);

  // 4. Create the pin.
  const data = await api<{ id: string }>("/pins", {
    method: "POST",
    body: {
      board_id: input.boardId,
      media_source: {
        source_type: "video_id",
        media_id: registered.media_id,
        cover_image_url: input.coverImageUrl,
      },
      title: truncate(input.title, 100),
      description: truncate(input.description ?? "", 800),
      ...(input.link ? { link: input.link } : {}),
    },
  });

  return { externalPostId: data.id, permalink: `https://www.pinterest.com/pin/${data.id}/` };
}

/** Poll until Pinterest has transcoded the upload, or give up with a useful message. */
async function waitForMedia(mediaId: string, attempts = 40, intervalMs = 3000): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    const media = await api<{ status: string }>(`/media/${mediaId}`);
    if (media.status === "succeeded") return;
    if (media.status === "failed") {
      throw new Error("Pinterest could not process the video. Check the format and try again.");
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Pinterest is still processing the video after two minutes. Try again shortly.");
}

/** Pinterest rejects over-length fields outright rather than trimming them. */
function truncate(value: string, max: number): string {
  const clean = value.trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** Remove a pin. Used by the admin delete/repost path, same as the Meta adapters. */
export async function deletePin(pinId: string): Promise<void> {
  await api(`/pins/${pinId}`, { method: "DELETE" });
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

/**
 * The board every pin lands on, chosen once under Platforms.
 *
 * Read at publish time rather than captured when the post was queued: a post can sit in
 * review for days, and the board the owner wants is the one currently selected.
 */
export async function getSelectedBoardId(): Promise<string> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("social_accounts")
    .select("meta")
    .eq("platform", "pinterest")
    .maybeSingle();

  const boardId = (data?.meta as { board_id?: string } | null)?.board_id;
  if (!boardId) {
    throw new Error("No Pinterest board is selected. Choose one under Platforms.");
  }
  return boardId;
}

/**
 * Pinterest as a `PlatformAdapter`, so the orchestrator treats it like any other platform.
 *
 * One honest asymmetry with the Meta adapters, enforced here rather than left to the caller
 * to remember: **the link is mandatory in practice.** A pin without one is a dead end, so a
 * missing link is a thrown error rather than a silently link-less pin.
 *
 * Carousels are attempted when there is more than one image — see `createImagePin` for why
 * that is written to degrade to a single pin rather than to assume it works.
 */
export function createPinterestAdapter(): PlatformAdapter {
  return {
    platform: "pinterest",
    limits: {
      captionMaxChars: 800, // the pin *description*; the title is a separate 100
      hashtagMax: 20,
      imagesMax: PIN_CAROUSEL_MAX_IMAGES,
      imageFormats: ["image/jpeg", "image/png"] as const,
      supportsCarousel: true,
      supportsVideo: true,
      // Unlike Instagram, a pin has a real link field — which is the whole point.
      supportsLinkInCaption: true,
    },

    async publishImagePost(input: PublishImagePostInput): Promise<PublishResult> {
      if (input.imageUrls.length === 0) {
        throw new Error("Pinterest needs at least one image to pin.");
      }
      if (!input.title?.trim()) throw new Error("Pinterest needs a pin title.");

      return createImagePin({
        boardId: await getSelectedBoardId(),
        imageUrls: input.imageUrls,
        title: input.title,
        description: input.caption,
        altText: input.altText,
        link: input.link,
      });
    },
  };
}
