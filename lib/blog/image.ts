import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/server";
import {
  IMAGE_MODEL,
  STORAGE_BUCKET,
  STORAGE_PREFIX,
  type BlogAutomationConfig,
} from "./config";

/**
 * Hero image generation.
 *
 * OpenAI returns a ~3 MB PNG. Shipping that to readers would hurt Core Web Vitals on a
 * site whose rankings the owner has asked to protect above all else, so every image is
 * re-encoded to WebP at 1920x1080 — matching the 130-300 KB range of the existing
 * hand-made blog heroes — before it is stored.
 *
 * Storage is Supabase, not public/blog/. Vercel's filesystem is read-only at runtime,
 * so a cron job cannot write into the repo; the existing local heroes stay where they
 * are and new ones are served from the same bucket that already hosts product images.
 */

const OPENAI_IMAGES = "https://api.openai.com/v1/images/generations";

/** Style contract so every hero looks like it belongs to the same brand. */
const STYLE =
  "Editorial fashion photography for a premium Pakistani clothing brand. " +
  "Warm neutral palette — cream, ivory, soft gold. Natural window light, soft shadows, " +
  "shallow depth of field. Styled flat-lay or elegant still life. " +
  "No text, no words, no lettering, no logos, no watermarks. No human faces.";

export interface HeroImageResult {
  url: string;
  bytes: number;
  costUsd: number;
}

export async function generateHeroImage(
  cfg: BlogAutomationConfig,
  slug: string,
  imagePrompt: string,
): Promise<HeroImageResult> {
  const res = await fetch(OPENAI_IMAGES, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt: `${imagePrompt}\n\n${STYLE}`,
      // 1536x1024 is the closest supported landscape ratio to the 1920x1080 the blog uses.
      size: "1536x1024",
      quality: "medium",
      n: 1,
    }),
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Image ${res.status}: ${json.error?.message ?? "unknown error"}`);
  }

  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("Image API returned no image data");

  // gpt-image-2 output is billed at $30 per 1M output tokens.
  const outTokens = json.usage?.output_tokens ?? 0;
  const costUsd = (outTokens / 1_000_000) * 30;

  const webp = await sharp(Buffer.from(b64, "base64"))
    .resize(1920, 1080, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toBuffer();

  const sb = createAdminClient();
  const objectPath = `${STORAGE_PREFIX}/${slug}.webp`;

  const { error } = await sb.storage.from(STORAGE_BUCKET).upload(objectPath, webp, {
    contentType: "image/webp",
    upsert: true, // a retry of the same slug should replace, not fail
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
  if (!data?.publicUrl) throw new Error("Could not resolve public URL for hero image");

  return { url: data.publicUrl, bytes: webp.length, costUsd };
}
