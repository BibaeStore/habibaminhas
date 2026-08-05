/**
 * Uploads optimised WebP product images to the Supabase `products` storage bucket.
 *
 * Part of the "new product upload" flow (see docs/product-upload/PRODUCT-UPLOAD-PLAYBOOK.md).
 * Run AFTER scripts/optimize-product-images.mjs.
 *
 *   node scripts/upload-product-images.mjs "<folder of .webp files>"
 *
 * Prints the public URLs in order, ready to paste into products.images[].
 * Filenames are kept as-is (they are already `<slug>-N.webp`), so the storage
 * path stays human- and crawler-readable rather than a random hash.
 */
import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node scripts/upload-product-images.mjs "<folder>"');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const files = (await readdir(dir))
  .filter((f) => f.endsWith(".webp"))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const urls = [];
for (const file of files) {
  const body = await readFile(path.join(dir, file));
  const { error } = await supabase.storage.from("products").upload(file, body, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) {
    console.error(`FAILED ${file}: ${error.message}`);
    process.exit(1);
  }
  const { data } = supabase.storage.from("products").getPublicUrl(file);
  urls.push(data.publicUrl);
  console.log(`uploaded  ${file}`);
}

console.log("\nPublic URLs (in order):");
urls.forEach((u) => console.log(u));
console.log("\nSQL array literal:");
console.log(`ARRAY[${urls.map((u) => `'${u}'`).join(",\n       ")}]`);
