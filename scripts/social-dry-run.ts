/**
 * Social pipeline dry run — everything except the publish call.
 *
 *   npx tsx --env-file=.env.local scripts/social-dry-run.ts
 *   npx tsx --env-file=.env.local scripts/social-dry-run.ts --images
 *
 * Exercises settings → rotation → caption → (optionally) JPEG conversion, and prints
 * exactly what would be posted. Nothing is sent to Meta and nothing is written to
 * social_post_log, so this is safe to run at any time.
 *
 * `--images` additionally generates the JPEG derivatives and verifies their dimensions.
 * That writes to the `products/social/` storage prefix, which is a cache — harmless, and
 * it means the first real post is faster.
 */
import sharp from "sharp";
import { getSocialSettings, getMetaCredentials, productUrl, findDueSlot } from "../lib/social/config";
import { selectNextProducts } from "../lib/social/select";
import { buildCaption } from "../lib/social/caption";
import { prepareImages, TARGET_WIDTH, TARGET_HEIGHT } from "../lib/social/images";

const withImages = process.argv.includes("--images");

function rule(label: string) {
  console.log(`\n${"─".repeat(72)}\n${label}\n${"─".repeat(72)}`);
}

async function main() {
  rule("1. Configuration");
  const settings = await getSocialSettings();
  if (!settings) {
    console.error("✗ social_settings row not found — has the migration been applied?");
    process.exit(1);
  }
  console.log(`  enabled           ${settings.enabled}`);
  console.log(`  slots             ${settings.slot_times.join(", ")} (${settings.timezone})`);
  console.log(`  products/post     ${settings.products_per_post}`);
  console.log(`  categories        ${settings.categories.join(", ")}`);
  console.log(`  in-stock only     ${settings.require_in_stock}`);
  console.log(`  review queue      ${settings.approval_required}`);
  console.log(`  platforms         ${settings.platforms.join(", ")}`);
  console.log(`  daily ceiling     ${settings.max_posts_per_day}`);

  const creds = getMetaCredentials();
  console.log(`\n  Meta credentials  ${creds ? "✓ present" : "✗ missing"}`);
  if (creds) console.log(`  app secret        ${creds.appSecret ? "✓ set" : "— not set (appsecret_proof disabled)"}`);

  const due = findDueSlot(settings.slot_times, settings.timezone);
  console.log(`  slot due now      ${due ?? "no"}`);

  rule("2. Rotation");
  const { products, status } = await selectNextProducts(settings, 3);
  console.log(`  cycle             ${status.cycle}`);
  console.log(`  posted this cycle ${status.postedThisCycle} of ${status.eligibleTotal}`);
  console.log(`  in flight         ${status.inFlight}`);
  console.log(`\n  Next up:`);
  products.forEach((p, i) => console.log(`    ${i + 1}. ${p.title}  (${p.images.length} images)`));

  if (products.length === 0) {
    console.log("\n✗ Nothing eligible — check category and stock filters.");
    return;
  }

  const product = products[0];

  rule(`3. Captions — ${product.slug}`);
  for (const platform of ["instagram", "facebook"] as const) {
    const { caption, hashtags, altText } = buildCaption(product, platform);
    console.log(`\n  ┌─ ${platform.toUpperCase()} ─ ${caption.length}/2200 chars, ${hashtags.length} hashtags`);
    console.log(caption.split("\n").map((l) => `  │ ${l}`).join("\n"));
    console.log(`  └─ alt: ${altText}`);
    if (caption.length > 2200) console.error("  ✗ CAPTION TOO LONG");
    if (hashtags.length > 30) console.error("  ✗ TOO MANY HASHTAGS");
  }

  console.log(`\n  Product URL (facebook): ${productUrl(product.category, product.slug, "facebook")}`);

  if (!withImages) {
    console.log("\n(skipping image conversion — pass --images to test it)");
    return;
  }

  rule("4. Image derivatives");
  const urls = await prepareImages(product.images, product.palette?.[0]);
  for (const url of urls) {
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();
    const ratio = (meta.width ?? 0) / (meta.height ?? 1);
    const sizeOk = buf.byteLength < 8 * 1024 * 1024;
    const dimsOk = meta.width === TARGET_WIDTH && meta.height === TARGET_HEIGHT;
    const ratioOk = ratio >= 0.8 && ratio <= 1.91;
    const fmtOk = meta.format === "jpeg";

    console.log(
      `  ${dimsOk && ratioOk && sizeOk && fmtOk ? "✓" : "✗"} ${meta.width}x${meta.height} ` +
        `ratio=${ratio.toFixed(4)} ${meta.format} ${(buf.byteLength / 1024).toFixed(0)}KB`,
    );
    console.log(`      ${url}`);
  }
}

main().catch((e) => {
  console.error("\nDry run failed:", e);
  process.exit(1);
});
