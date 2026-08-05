/**
 * Product image optimiser — PNG/JPG → WebP for the storefront.
 *
 * Part of the "new product upload" flow (see docs/product-upload/PRODUCT-UPLOAD-PLAYBOOK.md).
 * Run this on a raw photo folder before uploading anything to Supabase Storage.
 *
 *   node scripts/optimize-product-images.mjs "<input folder>" "<output folder>" [slug]
 *
 * Behaviour:
 *   - resizes so the long edge is at most 1600px (never upscales)
 *   - encodes WebP q=82, effort 6 — visually lossless for fabric texture at ~10x smaller
 *   - strips EXIF/metadata
 *   - names files `<slug>-1.webp`, `<slug>-2.webp`, … so the storage path is SEO-readable
 *   - prints a before/after size table
 */
import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const MAX_EDGE = 1600;
const QUALITY = 82;

const [, , inDir, outDir, slugArg] = process.argv;
if (!inDir || !outDir) {
  console.error('Usage: node scripts/optimize-product-images.mjs "<in>" "<out>" [slug]');
  process.exit(1);
}
const slug = slugArg || path.basename(outDir);

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

await mkdir(outDir, { recursive: true });

const files = (await readdir(inDir))
  .filter((f) => /\.(png|jpe?g|webp|tiff?)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (files.length === 0) {
  console.error(`No images found in ${inDir}`);
  process.exit(1);
}

let totalIn = 0;
let totalOut = 0;

for (const [i, file] of files.entries()) {
  const src = path.join(inDir, file);
  const outName = `${slug}-${i + 1}.webp`;
  const dest = path.join(outDir, outName);

  const meta = await sharp(src).metadata();
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
  const resize =
    longEdge > MAX_EDGE
      ? meta.width >= meta.height
        ? { width: MAX_EDGE }
        : { height: MAX_EDGE }
      : null;

  await sharp(src)
    .rotate() // honour EXIF orientation before we strip it
    .resize(resize ? { ...resize, withoutEnlargement: true } : undefined)
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(dest);

  const inSize = (await stat(src)).size;
  const outSize = (await stat(dest)).size;
  const outMeta = await sharp(dest).metadata();
  totalIn += inSize;
  totalOut += outSize;

  console.log(
    `${file}\n  → ${outName}  ${meta.width}x${meta.height} → ${outMeta.width}x${outMeta.height}  ${kb(inSize)} → ${kb(outSize)}  (-${(100 - (outSize / inSize) * 100).toFixed(1)}%)`,
  );
}

console.log(
  `\nTotal: ${kb(totalIn)} → ${kb(totalOut)}  (-${(100 - (totalOut / totalIn) * 100).toFixed(1)}%)  across ${files.length} image(s)`,
);
console.log(`Output: ${outDir}`);
