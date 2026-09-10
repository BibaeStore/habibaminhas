import fs from "fs";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { buildFeedItems, buildFeedXml, FEED_CATEGORIES } from "../lib/merchant/google-feed";

dotenv.config({ path: ".env.local" });

/**
 * Builds the Merchant Center feed from the live database and audits it offline, so a
 * bad row is caught before Google ever fetches it — a disapproval there is slow to
 * clear and applies account-wide.
 *
 * Writes nothing. Touches no page. Prints a summary plus the required-attribute check.
 *
 *   npx tsx scripts/preview-merchant-feed.ts [--write out.xml]
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  const sb = createClient(url, key);
  const { data, error } = await sb.from("products").select("*").eq("status", "active");
  if (error) throw new Error(error.message);

  const items = buildFeedItems(data as never);
  const xml = buildFeedXml(items);

  const inScope = (data as { category: string }[]).filter((p) =>
    (FEED_CATEGORIES as readonly string[]).includes(p.category),
  );

  console.log("=== SCOPE ===");
  console.log(`active products in database : ${data.length}`);
  console.log(`in feed categories          : ${inScope.length}  (${FEED_CATEGORIES.join(", ")})`);
  console.log(`feed rows emitted           : ${items.length}  (apparel sizes expand to variants)`);

  const byCat = new Map<string, number>();
  for (const it of items) byCat.set(it.googleProductCategory, (byCat.get(it.googleProductCategory) ?? 0) + 1);
  console.log("\n=== GOOGLE PRODUCT CATEGORY ===");
  for (const [cat, n] of [...byCat].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(4)}  ${cat}`);

  console.log("\n=== AVAILABILITY ===");
  console.log(`in_stock     : ${items.filter((i) => i.availability === "in_stock").length}`);
  console.log(`out_of_stock : ${items.filter((i) => i.availability === "out_of_stock").length}`);

  // Every attribute Google rejects a row for missing.
  const required: [string, (i: (typeof items)[number]) => boolean][] = [
    ["id", (i) => !!i.id],
    ["title", (i) => !!i.title && i.title.length <= 150],
    ["description", (i) => !!i.description && i.description.length <= 5000],
    ["link", (i) => i.link.startsWith("https://") && i.link.endsWith("/")],
    ["image_link", (i) => !!i.imageLink && i.imageLink.startsWith("http")],
    ["price", (i) => /^\d+\.\d{2} PKR$/.test(i.price)],
    ["availability", (i) => !!i.availability],
    ["brand", (i) => !!i.brand],
    ["google_product_category", (i) => !!i.googleProductCategory],
  ];

  console.log("\n=== REQUIRED ATTRIBUTES ===");
  let failures = 0;
  for (const [name, ok] of required) {
    const bad = items.filter((i) => !ok(i));
    failures += bad.length;
    console.log(`${bad.length === 0 ? "PASS" : "FAIL"}  ${name.padEnd(24)} ${bad.length} missing/invalid`);
    for (const b of bad.slice(0, 3)) console.log(`        -> ${b.id}`);
  }

  const dupes = items.map((i) => i.id).filter((id, idx, a) => a.indexOf(id) !== idx);
  console.log(`${dupes.length === 0 ? "PASS" : "FAIL"}  unique id                ${dupes.length} duplicates`);
  failures += dupes.length;

  const noColour = items.filter((i) => i.ageGroup === "adult" && !i.color);
  console.log(`\n=== ADVISORY (not required for PK) ===`);
  console.log(`apparel rows without colour : ${noColour.length}`);
  for (const b of noColour.slice(0, 5)) console.log(`        -> ${b.id}`);

  const outPath = process.argv.includes("--write") ? process.argv[process.argv.indexOf("--write") + 1] : null;
  if (outPath) {
    fs.writeFileSync(outPath, xml, "utf8");
    console.log(`\nwrote ${outPath} (${(xml.length / 1024).toFixed(1)} KB)`);
  }

  console.log(`\n${failures === 0 ? "FEED OK — 0 blocking failures" : `${failures} BLOCKING FAILURES`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
