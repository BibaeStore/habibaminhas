/**
 * One-off publisher for an occasion post (Jumma Mubarak, Eid, etc).
 *
 * A stopgap, not a feature. The scheduler is product-driven and has no notion of a
 * standalone graphic: photo posts are built from a product's own images by rotation, and
 * the `upload` kind in `social_media_queue` accepts video only. Until an occasion post
 * type exists, this script publishes one directly through the same adapters the scheduler
 * uses, so the Graph plumbing, retries and error decoding are the tested ones.
 *
 *   npx tsx scripts/publish-occasion-post.ts --dry
 *   npx tsx scripts/publish-occasion-post.ts
 *
 * Each platform is published independently — Instagram failing must not cost the Facebook
 * post, since there is no transaction spanning the two and a half-posted occasion is worse
 * than a single-platform one.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true, quiet: true });

import { getMetaCredentials } from "../lib/social/config";
import { createFacebookAdapter } from "../lib/social/adapters/facebook";
import { createInstagramAdapter } from "../lib/social/adapters/instagram";

const IMAGE_URL =
  "https://ftrwdknlckzcwbibdicu.supabase.co/storage/v1/object/public/social-media/occasion/jumma-mubarak-2026-08-21.jpg";

const PRODUCT_URL =
  "https://habibaminhas.com/product/ladies-suits/ld-white-pearl-organza-3-piece-suit-046/";

const HASHTAGS = [
  "#JummaMubarak", "#HabibaMinhas", "#PakistaniFashion", "#StitchedSuits",
  "#ReadyToWear", "#PakistaniSuits", "#WhiteSuit", "#OrganzaDupatta",
  "#KarachiFashion", "#PakistaniClothing", "#ThreePieceSuit", "#ModestFashion",
  "#LadiesSuits", "#ShopPakistan",
].join(" ");

/* Instagram renders URLs in captions as plain text, so it gets "link in bio" instead. */
const IG_CAPTION = `Jumma Mubarak 🤍

May this Friday bring quiet to your home and ease to the week ahead.

Pictured is Pearl Veil — a 3-piece white suit with a single embroidered yoke, very wide A-line flapper trousers, and a sheer organza dupatta edged with pearls stitched on one at a time. Everything else is left plain, and that is the whole design.

White is the most comfortable colour to wear in Karachi heat, because it reflects light instead of holding it. It is also the easiest thing to be well dressed in without being looked at.

Rs. 5,500 · Small, Medium and Large · made in our Karachi studio in a run of five.

Shop the link in bio 🤍
Delivery across Pakistan at a flat Rs. 250 · Cash on delivery · 14-day exchange

${HASHTAGS}`;

const FB_CAPTION = `Jumma Mubarak 🤍

May this Friday bring quiet to your home and ease to the week ahead.

Pictured is Pearl Veil — a 3-piece white suit with a single embroidered yoke, very wide A-line flapper trousers, and a sheer organza dupatta edged with pearls stitched on one at a time. Everything else is left plain, and that is the whole design. A suit with one worked panel goes to a dawat, a daytime function, an office day and Eid, and reads as deliberate at all of them.

White is also the most comfortable colour to wear in Karachi heat, because it reflects light instead of holding it.

Rs. 5,500 · Small, Medium and Large · made in our Karachi studio in a run of five.

Shop it here: ${PRODUCT_URL}

Delivery across Pakistan at a flat Rs. 250 · Cash on delivery · 14-day exchange

#JummaMubarak #HabibaMinhas`;

const ALT_TEXT =
  "Jumma Mubarak greeting in gold and ivory, framing a photograph of the Pearl Veil white three-piece suit by Habiba Minhas.";

async function main() {
  const dry = process.argv.includes("--dry");

  const creds = getMetaCredentials();
  if (!creds) {
    console.error("No Meta credentials. Check META_SYSTEM_USER_TOKEN / page / IG account env vars.");
    process.exit(1);
  }

  const head = await fetch(IMAGE_URL, { method: "HEAD" });
  if (!head.ok) {
    console.error(`Image URL is not fetchable (${head.status}). Meta must be able to download it.`);
    process.exit(1);
  }
  console.log(`image ok  ${head.headers.get("content-type")}  ${head.headers.get("content-length")} bytes`);
  console.log(`IG caption ${IG_CAPTION.length} chars · FB caption ${FB_CAPTION.length} chars`);

  if (dry) {
    console.log("\n--- DRY RUN, nothing published ---\n");
    console.log("INSTAGRAM:\n" + IG_CAPTION + "\n");
    console.log("FACEBOOK:\n" + FB_CAPTION);
    return;
  }

  const targets = [
    { name: "facebook", adapter: createFacebookAdapter(creds), caption: FB_CAPTION },
    { name: "instagram", adapter: createInstagramAdapter(creds), caption: IG_CAPTION },
  ];

  for (const t of targets) {
    try {
      const res = await t.adapter.publishImagePost({
        imageUrls: [IMAGE_URL],
        caption: t.caption,
        altText: ALT_TEXT,
      });
      console.log(`✅ ${t.name}  id=${res.externalPostId}  ${res.permalink ?? "(no permalink returned)"}`);
    } catch (err) {
      const e = err as Error & { subcode?: number | null; httpStatus?: number };
      console.error(`❌ ${t.name}  ${e.message}${e.subcode ? `  subcode=${e.subcode}` : ""}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
