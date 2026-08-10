import { createHmac } from "node:crypto";
import { GRAPH_BASE, type MetaCredentials } from "../config";

/**
 * Shared adapter contract and Graph API plumbing.
 *
 * Every platform implements one interface. Adding Pinterest or TikTok later means writing
 * one file and inserting one `social_accounts` row — nothing else in the pipeline changes.
 */

export type PublishResult = {
  externalPostId: string;
  permalink?: string;
};

export type PublishImagePostInput = {
  /** Publicly fetchable JPEG URLs, already sized to 1080x1350. */
  imageUrls: string[];
  caption: string;
  /** Instagram only — indexed, and almost nobody uses it. */
  altText?: string;
  /**
   * Instagram only — up to 3 usernames invited as co-authors. The post then appears on
   * each collaborator's profile too, sharing one engagement count. Silently ignored by
   * platforms that have no equivalent (Facebook has none).
   */
  collaborators?: string[];
};

export type PlatformLimits = {
  captionMaxChars: number;
  hashtagMax: number;
  imagesMax: number;
  imageFormats: readonly string[];
  supportsCarousel: boolean;
  supportsVideo: boolean;
  /** Instagram renders URLs in captions as plain text, so the CTA has to work around it. */
  supportsLinkInCaption: boolean;
};

export interface PlatformAdapter {
  readonly platform: string;
  readonly limits: PlatformLimits;
  publishImagePost(input: PublishImagePostInput): Promise<PublishResult>;
}

/**
 * A Graph API error with Meta's diagnostic fields preserved.
 *
 * The subcode is the actionable part and the message alone throws it away: subcode 2207008
 * means "retry in 30 seconds", 2207042 means "daily cap reached, stop", and 2207050 means
 * "the account is checkpointed, a human must sign in". All three arrive as HTTP 400.
 */
export class MetaApiError extends Error {
  readonly code: number | null;
  readonly subcode: number | null;
  readonly fbtraceId: string | null;
  readonly httpStatus: number;
  readonly raw: unknown;

  constructor(message: string, httpStatus: number, body: unknown) {
    super(message);
    this.name = "MetaApiError";
    this.httpStatus = httpStatus;
    this.raw = body;

    const err = (body as { error?: Record<string, unknown> } | null)?.error ?? {};
    this.code = typeof err.code === "number" ? err.code : null;
    this.subcode = typeof err.error_subcode === "number" ? err.error_subcode : null;
    this.fbtraceId = typeof err.fbtrace_id === "string" ? err.fbtrace_id : null;
  }

  /** Worth retrying within the same run — transient server-side or upload hiccups. */
  get isTransient(): boolean {
    const transientSubcodes = [
      2207001, // Instagram server error
      2207003, // timed out downloading the media
      2207008, // media builder expired
      2207032, // create media failed
      2207053, // unknown upload error
      // 2207052 — "could not fetch the media from this uri". Usually our CDN not having
      // propagated a just-uploaded derivative to the edge Meta happens to hit. Retrying
      // fixes that; a genuinely dead URL just fails a few seconds later instead.
      2207052,
    ];
    if (this.subcode !== null && transientSubcodes.includes(this.subcode)) return true;
    return this.httpStatus >= 500;
  }

  /** Stop posting entirely for now — retrying makes it worse. */
  get isHardStop(): boolean {
    // 2207042 daily publishing cap · 2207050 account restricted · 2207051 flagged as spam
    return this.subcode !== null && [2207042, 2207050, 2207051].includes(this.subcode);
  }

  /**
   * Compact object for `social_post_log.error`.
   *
   * Returns an explicit shape rather than Record<string, unknown> so it satisfies the
   * generated `Json` column type — a bare Record is not assignable to Supabase's Json.
   */
  toLog(): {
    message: string;
    httpStatus: number;
    code: number | null;
    subcode: number | null;
    fbtrace_id: string | null;
  } {
    return {
      message: this.message,
      httpStatus: this.httpStatus,
      code: this.code,
      subcode: this.subcode,
      fbtrace_id: this.fbtraceId,
    };
  }
}

/**
 * Calls the Graph API and turns failures into MetaApiError.
 *
 * `appsecret_proof` is attached when the app secret is configured. Meta recommends it for
 * server-to-server calls; it is optional, so the pipeline works without the secret and
 * simply hardens itself once it is provided.
 */
export async function graphRequest<T = unknown>(
  creds: MetaCredentials,
  path: string,
  params: Record<string, string>,
  method: "GET" | "POST" | "DELETE" = "POST",
): Promise<T> {
  const body = new URLSearchParams({ ...params, access_token: creds.token });

  if (creds.appSecret) {
    body.set(
      "appsecret_proof",
      createHmac("sha256", creds.appSecret).update(creds.token).digest("hex"),
    );
  }

  // GET and DELETE carry everything in the query string; only POST gets a body.
  const url =
    method === "POST" ? `${GRAPH_BASE}${path}` : `${GRAPH_BASE}${path}?${body.toString()}`;

  const res = await fetch(url, {
    method,
    cache: "no-store",
    ...(method === "POST"
      ? {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        }
      : {}),
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
      (parsed as { error?: { message?: string } } | null)?.error?.message ??
      `Graph API ${res.status} on ${path}`;
    throw new MetaApiError(msg, res.status, parsed);
  }
  return parsed as T;
}

/** Small helper so transient failures do not lose a day's post to one bad second. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 2000,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      const retryable = e instanceof MetaApiError ? e.isTransient : false;
      if (!retryable || i === attempts - 1) throw e;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastError;
}
