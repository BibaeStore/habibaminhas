/**
 * Builds a reel from one product's photographs.
 *
 *   npx tsx --env-file=.env.local scripts/build-reel.ts               # next product in the reel rotation
 *   npx tsx --env-file=.env.local scripts/build-reel.ts <slug>        # a specific product
 *   npx tsx --env-file=.env.local scripts/build-reel.ts <slug> --frames-only
 *
 * Encoding runs here rather than on Vercel: the free plan caps a function at 60s and the
 * ffmpeg binary is ~80MB. Same reasoning that put the blog and social schedulers on
 * Supabase pg_cron instead of Vercel cron.
 *
 * **This script never publishes.** Its only outputs are a file in Storage and a row in
 * `social_media_queue` with `status = 'draft'`. Publishing requires the owner to approve
 * it in the admin, which is a hard requirement rather than a default.
 */
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { createAdminClient } from "../lib/supabase/server";
import { buildCaption } from "../lib/social/caption";
import type { ProductCandidate } from "../lib/social/select";
import { buildSlideFrame, buildEndCard, fetchImage, REEL_WIDTH, REEL_HEIGHT } from "../lib/social/reel/frames";
import { encodeReel, plannedDuration } from "../lib/social/reel/encode";

const BUCKET = "social-media";
/** Format A needs enough shots to be worth watching. Only 17 of 25 products clear this. */
const MIN_IMAGES = 3;
const MAX_IMAGES = 4;

const PRODUCT_FIELDS =
  "id, slug, title, short_description, description, price, category, subcategory, sku, images, palette, sizes_stock, seo_keywords, faqs, created_at";

function rule(label: string) {
  console.log(`\n${"─".repeat(70)}\n${label}\n${"─".repeat(70)}`);
}

/**
 * Picks the product for this reel.
 *
 * Reels keep their **own** rotation, deliberately separate from photo posts: a garment
 * shown as a carousel and again as a reel is reinforcement, not repetition, and with only
 * 25 products a shared queue would roughly halve photo coverage.
 */
async function pickProduct(slug?: string): Promise<ProductCandidate> {
  const sb = createAdminClient();

  if (slug) {
    const { data } = await sb.from("products").select(PRODUCT_FIELDS).eq("slug", slug).maybeSingle();
    if (!data) throw new Error(`No product with slug "${slug}"`);
    return data as unknown as ProductCandidate;
  }

  const { data: rows } = await sb
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("status", "active")
    .eq("category", "ladies-suits")
    .gt("stock", 0);

  const eligible = (rows ?? []).filter(
    (p) => ((p as { images?: string[] }).images?.length ?? 0) >= MIN_IMAGES,
  ) as unknown as ProductCandidate[];
  if (eligible.length === 0) throw new Error(`No product has ${MIN_IMAGES}+ images`);

  // Least recently used in the *reel* queue, never-used first.
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

  eligible.sort((a, b) => (lastUsed.get(a.id) ?? 0) - (lastUsed.get(b.id) ?? 0));
  return eligible[0];
}

/**
 * Products the owner asked to be re-cut from the Reels tab.
 *
 * The admin cannot re-encode on demand — ffmpeg runs here, not on Vercel — so "Ask for a
 * different cut" raises a flag instead of pretending to do the work. This is where that
 * flag is honoured. The old draft is archived rather than deleted so a rejected cut stays
 * recoverable, and any note the owner left is printed so it is in front of you while the
 * new one builds.
 */
async function pendingRebuilds(): Promise<Array<{ slug: string; note: string | null; id: string }>> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("social_media_queue")
    .select("id, product_ids, rebuild_note")
    .eq("rebuild_requested", true)
    .eq("status", "draft");

  const out: Array<{ slug: string; note: string | null; id: string }> = [];
  for (const row of data ?? []) {
    const ids = (row.product_ids as string[]) ?? [];
    if (ids.length === 0) continue;
    const { data: product } = await sb
      .from("products")
      .select("slug")
      .eq("id", ids[0])
      .maybeSingle();
    if (product?.slug) {
      out.push({ slug: product.slug as string, note: row.rebuild_note as string | null, id: row.id as string });
    }
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const framesOnly = args.includes("--frames-only");
  let slug = args.find((a) => !a.startsWith("--"));

  if (args.includes("--pending")) {
    const queued = await pendingRebuilds();
    if (queued.length === 0) {
      console.log("Nothing to rebuild — no reel has a pending request.");
      return;
    }
    const next = queued[0];
    console.log(`Rebuilding ${next.slug}${next.note ? `\n  note: "${next.note}"` : ""}`);
    if (queued.length > 1) console.log(`  (${queued.length - 1} more queued — re-run to continue)`);

    // Archive the rejected cut before building its replacement, so the tab never shows two
    // drafts of the same product competing for approval.
    const sb = createAdminClient();
    await sb
      .from("social_media_queue")
      .update({ status: "archived", archived_at: new Date().toISOString(), rebuild_requested: false })
      .eq("id", next.id);
    slug = next.slug;
  }

  const product = await pickProduct(slug);
  const images = product.images.slice(0, MAX_IMAGES);

  rule("1. Product");
  console.log(`  ${product.title}`);
  console.log(`  slug     ${product.slug}`);
  console.log(`  images   ${images.length} of ${product.images.length}`);
  console.log(`  palette  ${product.palette?.[0] ?? "(none — brand cream)"}`);

  if (images.length < MIN_IMAGES) {
    throw new Error(`Needs ${MIN_IMAGES}+ images, has ${images.length}`);
  }

  const work = await mkdtemp(join(tmpdir(), "reel-"));
  const framePaths: string[] = [];

  try {
    rule("2. Frames");
    for (const [i, url] of images.entries()) {
      const frame = await buildSlideFrame(await fetchImage(url), product.palette?.[0]);
      const path = join(work, `frame-${String(i).padStart(2, "0")}.jpg`);
      await writeFile(path, frame);
      framePaths.push(path);
      console.log(`  ✓ slide ${i + 1}  ${(frame.length / 1024).toFixed(0)} KB`);
    }

    const endCard = await buildEndCard({
      title: product.title.split(/[–—-]/)[0].trim(),
      price: `Rs. ${product.price.toLocaleString("en-PK")}`,
      background: product.palette?.[0],
    });
    const endPath = join(work, "frame-99-end.jpg");
    await writeFile(endPath, endCard);
    framePaths.push(endPath);
    console.log(`  ✓ end card  ${(endCard.length / 1024).toFixed(0)} KB`);

    if (framesOnly) {
      console.log(`\n  Frames left for inspection in:\n  ${work}`);
      return;
    }

    rule("3. Encode");
    console.log(`  ${framePaths.length} shots → ~${plannedDuration(framePaths.length)}s`);
    const outputPath = join(work, "reel.mp4");
    const { durationSeconds } = await encodeReel({ framePaths, outputPath });
    const video = await readFile(outputPath);
    console.log(`  ✓ ${REEL_WIDTH}x${REEL_HEIGHT} · ${durationSeconds}s · ${(video.length / 1024 / 1024).toFixed(2)} MB`);

    rule("4. Upload");
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
      console.log(`  ✓ ${key}`);
    }

    const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
    const videoUrl = `${base}/storage/v1/object/public/${BUCKET}/${videoKey}`;
    const thumbUrl = `${base}/storage/v1/object/public/${BUCKET}/${thumbKey}`;

    rule("5. Draft");
    const { caption, hashtags } = buildCaption(product, "instagram");
    const { error } = await sb.from("social_media_queue").insert({
      kind: "product",
      product_ids: [product.id],
      video_url: videoUrl,
      thumbnail_url: thumbUrl,
      duration_seconds: durationSeconds,
      caption,
      hashtags,
      status: "draft",
      platform: "instagram",
    });
    if (error) throw new Error(`Draft insert failed: ${error.message}`);

    console.log(`  ✓ queued as a DRAFT — nothing has been published`);
    console.log(`\n  Watch it:  ${videoUrl}`);
    console.log(`  Approve it in /admin/social → Reels once that tab exists (Phase 2).`);
  } finally {
    if (!framesOnly) await rm(work, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error(`\n✗ ${(e as Error).message}`);
  process.exit(1);
});
