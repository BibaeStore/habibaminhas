import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/server";
import { buildCaption } from "@/lib/social/caption";
import { getSocialSettings } from "@/lib/social/config";
import type { ProductCandidate } from "@/lib/social/select";
import { buildSlideFrame, buildEndCard, fetchImage, REEL_WIDTH, REEL_HEIGHT } from "./frames";
import { encodeReel, plannedDuration, canEncodeHere } from "./encode";

/**
 * Builds one reel, end to end, and queues it as a draft.
 *
 * Lives here rather than in the script so the admin's "Generate reel" button and the CLI
 * run exactly the same code. The owner should never have to paste a command to make a
 * reel; the command exists only as a fallback.
 *
 * **This never publishes.** Its outputs are a file in Storage and a row in
 * `social_media_queue` with `status = 'draft'`. Approval is a separate, deliberate act.
 */

const BUCKET = "social-media";
/** Format A needs enough shots to be worth watching. */
export const MIN_REEL_IMAGES = 3;
const MAX_REEL_IMAGES = 4;

const PRODUCT_FIELDS =
  "id, slug, title, short_description, description, price, category, subcategory, sku, images, palette, sizes_stock, seo_keywords, faqs, created_at";

export type BuildResult = {
  productTitle: string;
  videoUrl: string;
  durationSeconds: number;
  sizeMb: number;
};

/**
 * Picks the product for the next reel.
 *
 * Reels keep their **own** rotation, deliberately separate from photo posts: a garment
 * shown as a carousel and again as a reel is reinforcement, not repetition, and with ~25
 * eligible products a shared queue would roughly halve photo coverage.
 */
export async function pickReelProduct(slug?: string): Promise<ProductCandidate> {
  const sb = createAdminClient();

  if (slug) {
    const { data } = await sb.from("products").select(PRODUCT_FIELDS).eq("slug", slug).maybeSingle();
    if (!data) throw new Error(`No product with slug "${slug}"`);
    return data as unknown as ProductCandidate;
  }

  const settings = await getSocialSettings();
  let query = sb.from("products").select(PRODUCT_FIELDS).eq("status", "active");
  if (settings?.categories?.length) query = query.in("category", settings.categories);
  if (settings?.require_in_stock) query = query.gt("stock", 0);

  const { data: rows } = await query;
  const eligible = (rows ?? []).filter(
    (p) => ((p as { images?: string[] }).images?.length ?? 0) >= MIN_REEL_IMAGES,
  ) as unknown as ProductCandidate[];
  if (eligible.length === 0) {
    throw new Error(`No product has the ${MIN_REEL_IMAGES}+ images a reel needs`);
  }

  const { data: used } = await sb
    .from("social_media_queue")
    .select("product_ids, created_at")
    .neq("status", "archived");

  const lastUsed = new Map<string, number>();
  for (const row of used ?? []) {
    for (const id of (row.product_ids as string[]) ?? []) {
      const at = Date.parse(row.created_at as string);
      if (!lastUsed.has(id) || at > lastUsed.get(id)!) lastUsed.set(id, at);
    }
  }

  // Manual order from the Reels tab wins. Pins are one-shot: cleared once the product has
  // been made into a reel, so the catalogue returns to even rotation instead of one
  // product monopolising the queue.
  const { data: pins } = await sb.from("social_reel_queue_order").select("product_id, position");
  const pinned = new Map<string, number>();
  for (const pin of pins ?? []) pinned.set(pin.product_id as string, pin.position as number);

  eligible.sort((a, b) => {
    const aPin = pinned.get(a.id);
    const bPin = pinned.get(b.id);
    if (aPin !== undefined && bPin !== undefined) return aPin - bPin;
    if (aPin !== undefined) return -1;
    if (bPin !== undefined) return 1;
    return (lastUsed.get(a.id) ?? 0) - (lastUsed.get(b.id) ?? 0);
  });
  return eligible[0];
}

export async function buildProductReel(options?: {
  slug?: string;
  onProgress?: (step: string) => void;
}): Promise<BuildResult> {
  if (!canEncodeHere()) {
    throw new Error(
      "Video cannot be encoded on this server. Reels are built on the local machine.",
    );
  }

  const say = options?.onProgress ?? (() => {});
  const product = await pickReelProduct(options?.slug);
  const images = product.images.slice(0, MAX_REEL_IMAGES);

  if (images.length < MIN_REEL_IMAGES) {
    throw new Error(`"${product.title}" has ${images.length} images; a reel needs ${MIN_REEL_IMAGES}`);
  }

  const work = await mkdtemp(join(tmpdir(), "reel-"));
  const framePaths: string[] = [];

  try {
    say(`Rendering frames for ${product.title}`);
    for (const [i, url] of images.entries()) {
      const frame = await buildSlideFrame(await fetchImage(url), product.palette?.[0]);
      const path = join(work, `frame-${String(i).padStart(2, "0")}.jpg`);
      await writeFile(path, frame);
      framePaths.push(path);
    }

    const endCard = await buildEndCard({
      title: product.title.split(/[–—-]/)[0].trim(),
      price: `Rs. ${product.price.toLocaleString("en-PK")}`,
      background: product.palette?.[0],
    });
    const endPath = join(work, "frame-99-end.jpg");
    await writeFile(endPath, endCard);
    framePaths.push(endPath);

    say(`Encoding ~${plannedDuration(framePaths.length)}s`);
    const outputPath = join(work, "reel.mp4");
    const { durationSeconds } = await encodeReel({ framePaths, outputPath });
    const video = await readFile(outputPath);

    say("Uploading");
    const sb = createAdminClient();
    const stamp = Date.now().toString(36);
    const videoKey = `reels/${product.slug}-${stamp}.mp4`;
    const thumbKey = `reels/${product.slug}-${stamp}.jpg`;

    const thumb = await sharp(await readFile(framePaths[0]))
      .resize(REEL_WIDTH, REEL_HEIGHT, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();

    for (const [key, body, type] of [
      [videoKey, video, "video/mp4"],
      [thumbKey, thumb, "image/jpeg"],
    ] as const) {
      const { error } = await sb.storage.from(BUCKET).upload(key, body, {
        contentType: type,
        upsert: true,
      });
      if (error) throw new Error(`Upload failed for ${key}: ${error.message}`);
    }

    const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
    const videoUrl = `${base}/storage/v1/object/public/${BUCKET}/${videoKey}`;
    const thumbnailUrl = `${base}/storage/v1/object/public/${BUCKET}/${thumbKey}`;

    const { caption, hashtags } = buildCaption(product, "instagram");
    const { error } = await sb.from("social_media_queue").insert({
      kind: "product",
      product_ids: [product.id],
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      duration_seconds: durationSeconds,
      caption,
      hashtags,
      status: "draft",
      platform: "instagram",
    });
    if (error) throw new Error(`Draft insert failed: ${error.message}`);

    // The pin has done its job.
    await sb.from("social_reel_queue_order").delete().eq("product_id", product.id);

    return {
      productTitle: product.title,
      videoUrl,
      durationSeconds,
      sizeMb: Number((video.length / 1024 / 1024).toFixed(2)),
    };
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}
