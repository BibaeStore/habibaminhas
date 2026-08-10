import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * WebP → JPEG derivatives for Instagram.
 *
 * Instagram's content publishing API is explicit: *"JPEG is the only image format
 * supported."* Every product image on this site is WebP — that conversion is what makes
 * the storefront images ~10x smaller — so every one of them would be rejected.
 *
 * Derivatives are generated once and cached alongside the originals under a `social/`
 * prefix in the existing public `products` bucket:
 *
 *   products/peach-cross-stitch-2-piece-1.webp        ← storefront (WebP, fast, small)
 *   products/social/peach-cross-stitch-2-piece-1.jpg  ← Instagram (JPEG, 1080x1350)
 *
 * The storefront keeps serving WebP and is completely untouched: no Core Web Vitals
 * impact, no SEO surface involved.
 */

/**
 * 1080 x 1350 is exactly 4:5 (0.8).
 *
 * Meta rejects anything outside 4:5 → 1.91:1 with error 36003 / subcode 2207009, and 4:5
 * is the *tallest* ratio allowed — we are sitting exactly on the boundary. That is
 * deliberate (portrait occupies the most feed space) but it means the dimensions must be
 * exact: 1080/1350 = 0.8 precisely, with no rounding drift.
 */
export const TARGET_WIDTH = 1080;
export const TARGET_HEIGHT = 1350;

/** Meta rejects images over 8 MiB (error 36000 / subcode 2207004). */
const MAX_BYTES = 8 * 1024 * 1024;

/** Instagram carousels are capped at 10 items (error 2207028). */
export const MAX_CAROUSEL_ITEMS = 10;

const BUCKET = "products";
const SOCIAL_PREFIX = "social";

/** Brand cream — the default `palette` value on every product row. */
const DEFAULT_BACKGROUND = "#f5f0eb";

/**
 * Derives the storage object key from a public Supabase Storage URL.
 * Returns null for anything that is not an object in our own products bucket, so a
 * malformed or third-party URL fails loudly rather than producing a bad derivative path.
 */
function objectKeyFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const key = url.slice(idx + marker.length).split("?")[0];
  return key || null;
}

/** `peach-...-1.webp` → `social/peach-...-1.jpg` */
function derivativeKey(originalKey: string): string {
  const base = originalKey.replace(/\.[a-z0-9]+$/i, "");
  return `${SOCIAL_PREFIX}/${base}.jpg`;
}

function publicUrlFor(key: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${key}`;
}

/** Cheap cache probe — a HEAD that avoids downloading and re-encoding an existing derivative. */
async function existsPublicly(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Converts one image to a 1080x1350 JPEG and caches it. Returns the public JPEG URL.
 *
 * Uses `fit: "contain"` rather than `cover` on purpose. Product photography here is
 * portrait at roughly 2:3, which is *taller* than 4:5 — cropping to fill would cut the
 * top or bottom off the garment, which for a clothing brand is the one thing the image
 * exists to show. Containing on the product's own palette colour keeps the whole garment
 * visible and reads as a deliberate catalogue frame rather than a letterbox.
 */
export async function ensureJpegDerivative(
  originalUrl: string,
  background: string = DEFAULT_BACKGROUND,
): Promise<string> {
  const key = objectKeyFromUrl(originalUrl);
  if (!key) {
    throw new Error(`Not a products-bucket URL, cannot derive JPEG: ${originalUrl}`);
  }

  const outKey = derivativeKey(key);
  const outUrl = publicUrlFor(outKey);

  // Generated lazily and cached, so each image converts once — not once per post.
  if (await existsPublicly(outUrl)) return outUrl;

  const res = await fetch(originalUrl, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Could not fetch source image (${res.status}): ${originalUrl}`);
  }
  const input = Buffer.from(await res.arrayBuffer());

  let quality = 88;
  let output = await encode(input, background, quality);

  // Guard rather than assume: 1080x1350 JPEG lands around 200-400 KB, nowhere near the
  // 8 MiB ceiling, but an unusual source should degrade gracefully instead of being
  // rejected by Meta.
  while (output.byteLength > MAX_BYTES && quality > 40) {
    quality -= 15;
    output = await encode(input, background, quality);
  }
  if (output.byteLength > MAX_BYTES) {
    throw new Error(`Derivative still exceeds 8 MiB after re-encoding: ${originalUrl}`);
  }

  const sb = createAdminClient();
  const { error } = await sb.storage.from(BUCKET).upload(outKey, output, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw new Error(`Failed to upload derivative ${outKey}: ${error.message}`);

  // A successful upload does not mean the object is servable yet — see below.
  await waitUntilFetchable(outUrl);

  return outUrl;
}

/**
 * Blocks until a freshly uploaded object is actually fetchable over the public CDN.
 *
 * Meta cURLs our image URLs from its own servers at publish time. Supabase Storage is
 * fronted by a CDN, and a just-uploaded object is not instantly available at every edge —
 * so the upload can succeed while Meta's fetch still 404s. Instagram reports that as
 * `9004 / 2207052`, whose user-facing text is the actively misleading *"Only photo or
 * video can be accepted as media type."* It reads like a format rejection; it is really
 * "I could not download that URL".
 *
 * This bit for real: on 2026-08-10 a carousel failed with the last of its four images
 * uploaded **0.24s** before the publish call. The same URLs served HTTP 200 minutes later.
 * The first post ever made succeeded only because its derivatives had been generated by a
 * dry run twenty minutes earlier and had long since propagated.
 *
 * Cheap insurance: a HEAD per image, a few hundred milliseconds when the cache is warm.
 */
async function waitUntilFetchable(
  url: string,
  attempts = 6,
  delayMs = 700,
): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    if (await existsPublicly(url)) return;
    await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
  }
  throw new Error(
    `Derivative uploaded but still not publicly fetchable after ${attempts} checks: ${url}`,
  );
}

async function encode(input: Buffer, background: string, quality: number): Promise<Buffer> {
  return sharp(input)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: "contain",
      background: safeBackground(background),
      withoutEnlargement: false, // the exact ratio matters more than avoiding upscale
    })
    .flatten({ background: safeBackground(background) }) // no alpha — JPEG has none
    .jpeg({ quality, progressive: true, mozjpeg: true })
    .toBuffer();
}

/** Only accept `#rgb` / `#rrggbb`; anything else falls back to brand cream. */
function safeBackground(colour: string): string {
  return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(colour.trim()) ? colour.trim() : DEFAULT_BACKGROUND;
}

/**
 * Prepares the image set for one post.
 *
 * Trims to Instagram's 10-item carousel cap and converts each. A failure on any single
 * image aborts the whole set: publishing a carousel with a missing slide is worse than
 * not publishing, and the caller logs the failure and moves on.
 */
export async function prepareImages(
  originalUrls: string[],
  background?: string,
): Promise<string[]> {
  const selected = originalUrls.slice(0, MAX_CAROUSEL_ITEMS);
  const out: string[] = [];
  for (const url of selected) {
    out.push(await ensureJpegDerivative(url, background));
  }
  return out;
}
