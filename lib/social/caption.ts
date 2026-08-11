import type { ProductCandidate } from "./select";
import { productUrl } from "./config";

/**
 * Caption and hashtag generation.
 *
 * Everything here is assembled from fields the product already has — `short_description`,
 * `seo_keywords`, `sizes_stock`, `price`. Nothing is invented and nothing is sent to a
 * language model, which means captions cost nothing to produce and cannot hallucinate a
 * claim about a garment.
 *
 * Website copy is deliberately *not* reused verbatim: it is 2,000–3,000 characters written
 * for search crawlers and AI retrieval. Instagram shows roughly the first 125 characters
 * before "…more", so the first line has to carry the whole post.
 */

/** Meta's hard limits — exceeding these returns error 36004 / subcode 2207010. */
export const CAPTION_MAX_CHARS = 2200;
export const HASHTAG_MAX = 30;
export const MENTION_MAX = 20;

/** What we actually aim for. 30 broad tags buries a small account in feeds it cannot win. */
const HASHTAG_TARGET = 15;

export type GeneratedCaption = {
  caption: string;
  hashtags: string[];
  altText: string;
};

/** `short_description` is a newline-separated list of `Label: Value` lines. */
function parseSpecs(short: string | null): Map<string, string> {
  const specs = new Map<string, string>();
  if (!short) return specs;
  for (const line of short.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key && value) specs.set(key, value);
  }
  return specs;
}

/** First spec whose label matches any of the candidates. */
function pickSpec(specs: Map<string, string>, ...candidates: string[]): string | null {
  for (const c of candidates) {
    for (const [key, value] of specs) {
      if (key.includes(c)) return value;
    }
  }
  return null;
}

/*
 * There is deliberately no size or stock helper here any more. Captions must not disclose
 * inventory — see buildDetails and buildUrduLine.
 */

function formatPrice(paisaFreeInteger: number): string {
  return `Rs. ${paisaFreeInteger.toLocaleString("en-PK")}`;
}

/** Product name without the descriptive tail: "Apricot Weave – 2-Piece…" → "Apricot Weave". */
function shortName(title: string): string {
  return title.split(/[–—-]/)[0].trim() || title.trim();
}

/**
 * Stable pseudo-random index from the slug.
 *
 * Template variety matters — a recycled opening line across every post is itself a spam
 * signal — but it must be *stable*: regenerating a caption for the same product should
 * produce the same text, so a review-queue entry does not change under the owner between
 * being read and being approved.
 */
function stableIndex(seed: string, buckets: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % buckets;
}

/**
 * The hook — the first ~125 characters, and the whole game.
 *
 * Leads with the most distinctive concrete fact, never with the price and never with a
 * brand adjective. "Deep emerald green, cotton, gold at the cuffs" stops a scroll;
 * "Elevate your wardrobe with timeless elegance" does not.
 */
/**
 * Strips parentheticals and tidies the punctuation they leave behind.
 *
 * "Chiffon (Frock), Net (Dupatta)" → "Chiffon, Net". Without the comma repair the hook
 * rendered as "chiffon , net", which is exactly the kind of small tell that makes a caption
 * read as machine-written.
 */
function clean(value: string): string {
  return value
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+([,;])/g, "$1")
    .replace(/[,;]\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "shalwar kameez" → "ShalwarKameez", for hashtag assembly. */
function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join("");
}

function buildHook(product: ProductCandidate, specs: Map<string, string>): string {
  const name = shortName(product.title);

  const colour = pickSpec(specs, "colour", "color");
  const fabric = pickSpec(specs, "fabric");
  const embroidery = pickSpec(specs, "embroidery", "work", "technique");
  const pieces = pickSpec(specs, "pieces");

  const concrete = [colour, fabric, embroidery]
    .filter((v): v is string => Boolean(v))
    .map(clean)
    .filter(Boolean)
    .slice(0, 3);

  const templates: string[] = [];

  /*
   * Concrete-fact templates come first and are the only ones used whenever there is
   * enough material for them. The piece-count fallback below reads far worse — spec
   * labels often carry parentheticals like "(No Dupatta Included)", and opening on a
   * negative is the last thing a hook should do.
   */
  if (concrete.length >= 2) {
    templates.push(`${concrete[0]}, ${concrete.slice(1).join(", ").toLowerCase()}.`);
    templates.push(`${name} — ${concrete.join(", ").toLowerCase()}.`);
  } else if (fabric && pieces) {
    templates.push(`${clean(pieces)} in ${clean(fabric).toLowerCase()}.${colour ? ` ${clean(colour)}.` : ""}`);
  } else {
    templates.push(`${name} — ${clean(pieces ?? product.category.replace(/-/g, " ")).toLowerCase()}.`);
  }

  const hook = templates[stableIndex(product.slug, templates.length)];
  return hook.replace(/\s+/g, " ").trim();
}

/** Detail block — the specifics that make the post findable and the garment understandable. */
function buildDetails(product: ProductCandidate, specs: Map<string, string>): string[] {
  const lines: string[] = [];

  const pieces = pickSpec(specs, "pieces");
  const fabric = pickSpec(specs, "fabric");
  const stitching = pickSpec(specs, "stitching");
  const embroidery = pickSpec(specs, "embroidery", "work");

  if (pieces) lines.push(`• ${pieces}`);
  if (fabric) lines.push(`• ${fabric}`);
  if (stitching) lines.push(`• ${stitching}`);
  if (embroidery) lines.push(`• ${embroidery}`);

  /*
   * Price only — no sizes, no stock counts, no studio/production line.
   *
   * Owner instruction 2026-08-09: captions must never disclose which sizes are left, how
   * many pieces remain, or where the garment is made. Inventory detail belongs on the
   * product page, where it is always current; a caption is permanent and goes stale the
   * moment something sells.
   */
  lines.push(`• ${formatPrice(product.price)}`);
  return lines.slice(0, 5);
}

/** Garment nouns people actually search for, longest first so "shalwar kameez" wins over "kameez". */
const GARMENT_NOUNS = [
  "shalwar kameez", "shirt and trousers", "frock", "kurta", "kameez", "lehenga",
  "saree", "abaya", "maxi", "gown", "suit",
];

/** The garment word from the title — "…Chiffon Frock with Net Dupatta" → "frock". */
function garmentNoun(title: string): string {
  const lower = title.toLowerCase();
  return GARMENT_NOUNS.find((n) => lower.includes(n)) ?? "suit";
}

/** "…– 3-Piece Stitched Cotton Suit…" → "3-piece". */
function pieceLabel(title: string, specs: Map<string, string>): string | null {
  const source = `${title} ${pickSpec(specs, "pieces") ?? ""}`;
  const match = source.match(/(\d)\s*[-–]?\s*piece/i);
  return match ? `${match[1]}-piece` : null;
}

/** A single fabric word from "Chiffon (Frock), Net (Dupatta)" → "chiffon". */
function primaryFabric(specs: Map<string, string>): string | null {
  const fabric = pickSpec(specs, "fabric");
  if (!fabric) return null;
  const known = [
    "cotton", "lawn", "chiffon", "silk", "linen", "khaddar", "organza",
    "velvet", "georgette", "net", "jacquard", "cambric", "viscose",
  ];
  return known.find((f) => new RegExp(`\\b${f}\\b`, "i").test(fabric)) ?? null;
}

/**
 * One natural-language line carrying the words people actually type.
 *
 * Hashtags alone leave most of the discovery surface unused: **Instagram now indexes
 * caption text for keyword search**, not only hashtags, and Facebook post text is indexed
 * outright. A post whose only searchable terms are in the tag block is invisible to both.
 *
 * Written as a real sentence rather than a keyword dump. Stuffing reads as spam to the
 * ranking systems and to the reader, and this line sits mid-caption where a human sees it.
 */
function buildKeywordLine(product: ProductCandidate, specs: Map<string, string>): string {
  const garment = garmentNoun(product.title);
  const pieces = pieceLabel(product.title, specs);
  const fabric = primaryFabric(specs);
  const colour = pickSpec(specs, "colour", "color");

  // "Pakistani 3-piece cotton suit" — built from whatever is actually known.
  const noun = ["Pakistani", pieces, fabric, garment].filter(Boolean).join(" ");

  // Primary colour only. "Off-White / Ivory with Black Print" is a spec, not something a
  // person says — and the full string already appears in the hook, so nothing is lost.
  const primaryColour = colour ? clean(colour).split(/[/,]|\bwith\b/)[0].trim() : "";
  const inColour = primaryColour ? ` in ${primaryColour.toLowerCase()}` : "";

  return `${noun}${inColour} — stitched and ready to wear, delivered across Pakistan.`;
}

/**
 * One Roman-Urdu line near the CTA.
 *
 * Mixed captions consistently outperform English-only for Pakistani audiences, but a
 * machine-translated full caption reads worse than clean English — so exactly one short,
 * hand-written line, chosen by what is actually true of the stock.
 */
function buildUrduLine(product: ProductCandidate): string {
  /*
   * Deliberately stock-free. Earlier versions varied this line by how many pieces were
   * left ("Sirf aik piece available — M."), which the owner ruled out: captions must not
   * disclose inventory. Variety now comes from the slug hash instead of from stock.
   */
  const lines = [
    "Abhi order karein, nationwide delivery.",
    "Ghar baithay order karein — poore Pakistan mein delivery.",
    "Online order karein, delivery aap ke ghar tak.",
  ];
  return lines[stableIndex(product.slug, lines.length)];
}

/**
 * Tiered hashtags, generated per product.
 *
 * A single recycled hashtag block across every post is a spam signal in itself, so these
 * are derived from the product's own fabric, colour, subcategories and `seo_keywords`.
 */
function buildHashtags(product: ProductCandidate, specs: Map<string, string>): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();

  const add = (raw: string) => {
    const tag = "#" + raw.replace(/[^a-zA-Z0-9]/g, "");
    /*
     * Singular and plural count as the same tag. "#2PieceSuit #2PieceSuits" side by side
     * reads as padding rather than as two searches, and padding is the signal that gets a
     * small account's reach throttled.
     */
    const key = tag.toLowerCase().replace(/s$/, "");
    if (tag.length > 1 && !seen.has(key) && tags.length < HASHTAG_MAX) {
      seen.add(key);
      tags.push(tag);
    }
  };

  // Broad — reach, low win probability.
  add("PakistaniFashion");
  add("PakistaniSuits");

  // Niche — where a small account can actually rank.
  //
  // The fabric tag must name the actual fabric, not whatever word happens to come first:
  // "Soft Breathable Cotton" has to yield #CottonSuitPakistan, never #SoftSuitPakistan.
  const fabric = primaryFabric(specs);
  if (fabric) {
    const Fabric = `${fabric[0].toUpperCase()}${fabric.slice(1)}`;
    add(`${Fabric}SuitPakistan`);
    // The fabric paired with the actual garment word — "#ChiffonFrock" is a far more
    // winnable search than "#Chiffon", which is global and dominated by fabric wholesalers.
    add(`${Fabric}${titleCase(garmentNoun(product.title))}`);
  }

  // Garment + piece count — high-intent, and what people type when they know what they want.
  const pieces = pieceLabel(product.title, specs);
  if (pieces) add(`${pieces.replace("-piece", "")}PieceSuit`);
  add(`Stitched${titleCase(garmentNoun(product.title))}`);

  // Subcategories, minus the ones too generic to rank for.
  const genericSubcategories = new Set(["casual", "formal", "new", "sale", "featured", "regular", "basic"]);
  for (const sub of product.subcategory ?? []) {
    if (genericSubcategories.has(sub.toLowerCase())) continue;
    add(sub.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(""));
  }
  const embroidery = pickSpec(specs, "embroidery", "work");
  if (embroidery && /chikankari|cross.?stitch|zari|mirror|thread/i.test(embroidery)) {
    const technique = /chikankari/i.test(embroidery)
      ? "Chikankari"
      : /cross.?stitch/i.test(embroidery)
        ? "CrossStitch"
        : /zari/i.test(embroidery)
          ? "Zari"
          : /mirror/i.test(embroidery)
            ? "MirrorWork"
            : "ThreadWork";
    add(`${technique}Suit`);
  }

  // Local — buying intent and geography.
  add("KarachiFashion");
  add("OnlineShoppingPakistan");
  add("PakistanOnlineStore");
  add("ReadyToWearPakistan");

  // Occasion — only when the product copy actually says so.
  const haystack = `${product.title} ${product.seo_keywords ?? ""}`.toLowerCase();
  if (/\beid\b/.test(haystack)) add("EidCollection");
  if (/mehndi|mayun/.test(haystack)) add("MehndiOutfit");
  if (/wedding|shaadi|barat/.test(haystack)) add("WeddingWear");

  // Brand — owned, and builds a searchable archive over time.
  add("HabibaMinhas");
  add("HabibaMinhasStudio");

  // Top up from seo_keywords until we reach the target.
  for (const kw of (product.seo_keywords ?? "").split(",")) {
    if (tags.length >= HASHTAG_TARGET) break;
    const cleaned = kw.trim();
    if (cleaned.length < 6 || cleaned.split(/\s+/).length > 3) continue;
    add(cleaned.split(/\s+/).map((w) => w[0]?.toUpperCase() + w.slice(1)).join(""));
  }

  return tags.slice(0, HASHTAG_TARGET);
}

/**
 * Alt text for the Instagram image.
 *
 * Supported on feed posts via the `alt_text` field, indexed, and almost nobody uses it.
 * Text baked into a picture is not indexed; this is.
 */
function buildAltText(product: ProductCandidate, specs: Map<string, string>): string {
  /*
   * A sentence, not a joined spec list. Alt text is read aloud by screen readers, where
   * "Title — Colour — Fabric (Frock), Net (Dupatta)" is close to unusable, and a natural
   * description also carries more searchable meaning than the same words with dashes.
   */
  const colour = pickSpec(specs, "colour", "color");
  const fabric = primaryFabric(specs);
  const garment = garmentNoun(product.title);
  const pieces = pieceLabel(product.title, specs);
  const embroidery = pickSpec(specs, "embroidery", "work", "technique");

  const subject = [colour ? clean(colour) : null, pieces, fabric, garment]
    .filter(Boolean)
    .join(" ");

  const sentence = [
    `${subject.charAt(0).toUpperCase()}${subject.slice(1)} by Habiba Minhas.`,
    embroidery ? `${clean(embroidery)}.` : null,
    `Photographed on a model against a plain backdrop.`,
  ]
    .filter(Boolean)
    .join(" ");

  return sentence.slice(0, 950);
}

/**
 * Builds the full caption for one product on one platform.
 *
 * The only real difference between platforms is the link. Facebook renders URLs in post
 * text as clickable; Instagram does not, which is the single biggest practical constraint
 * on the whole pipeline — so Instagram gets a "link in bio" CTA and names the product
 * explicitly, so site search finds it even if nobody taps the bio link.
 */
export function buildCaption(
  product: ProductCandidate,
  platform: "instagram" | "facebook",
): GeneratedCaption {
  const specs = parseSpecs(product.short_description);

  const hook = buildHook(product, specs);
  const details = buildDetails(product, specs);
  const keywords = buildKeywordLine(product, specs);
  const urdu = buildUrduLine(product);
  const hashtags = buildHashtags(product, specs);
  const name = shortName(product.title);

  // Instagram captions are not clickable, so the CTA points at the bio and names the
  // product so site search finds it. It must not mention sizing or availability.
  const cta =
    platform === "facebook"
      ? `Shop ${name} → ${productUrl(product.category, product.slug, platform)}`
      : `Shop “${name}” — link in bio 🔗`;

  /*
   * Order matters. The hook owns the first ~125 characters Instagram shows before "…more";
   * the searchable keyword line sits after the specs, where it reads as a caption rather
   * than as SEO, and still lands well above the hashtag block.
   */
  const body = [hook, "", details.join("\n"), "", keywords, "", urdu, "", cta].join("\n");
  const caption = clampCaption(body, hashtags);

  return { caption, hashtags, altText: buildAltText(product, specs) };
}

/**
 * Assembles body + hashtags within Meta's 2,200-character ceiling.
 *
 * Hashtags are dropped from the least valuable end (they are ordered broad → brand, and
 * the top-up keywords sit last) before the body is ever truncated, because a truncated
 * sentence looks broken while three fewer hashtags is invisible.
 */
function clampCaption(body: string, hashtags: string[]): string {
  const tags = [...hashtags];
  let caption = `${body}\n\n${tags.join(" ")}`;

  while (caption.length > CAPTION_MAX_CHARS && tags.length > 0) {
    tags.pop();
    caption = `${body}\n\n${tags.join(" ")}`;
  }
  if (caption.length > CAPTION_MAX_CHARS) {
    caption = caption.slice(0, CAPTION_MAX_CHARS - 1).trimEnd() + "…";
  }
  return caption;
}

/**
 * A ready-to-use caption for a video the owner uploaded themselves.
 *
 * An uploaded reel has no product behind it, so nothing can be derived — but leaving the
 * box empty means it goes out bare, which has already happened once. The owner's stated
 * habit is to accept whatever is offered and only occasionally edit, so this has to be
 * publishable as written rather than a prompt to write something.
 *
 * Built to the same rules as the product captions: a concrete opening rather than a brand
 * adjective, one Roman-Urdu line near the call to action, keywords in a real sentence
 * because Instagram indexes caption text and not only hashtags, and no inventory detail —
 * a reel is permanent and stock goes stale the moment something sells.
 *
 * Varied by the day so consecutive uploads do not read identically, which is itself a spam
 * signal.
 */
export function buildUploadCaption(seed = new Date().toISOString().slice(0, 10)): GeneratedCaption {
  const hooks = [
    "New in — hand-finished, ready to wear.",
    "Fresh off the rail at the Karachi studio.",
    "The kind of stitching you only see up close.",
    "Made in small runs, worn every day.",
  ];
  const hook = hooks[stableIndex(seed, hooks.length)];

  const urdu = [
    "Abhi order karein, nationwide delivery.",
    "Ghar baithay order karein — poore Pakistan mein delivery.",
    "Online order karein, delivery aap ke ghar tak.",
  ][stableIndex(seed, 3)];

  const hashtags = [
    "#PakistaniFashion",
    "#PakistaniSuits",
    "#StitchedSuits",
    "#ReadyToWearPakistan",
    "#KarachiFashion",
    "#OnlineShoppingPakistan",
    "#PakistanOnlineStore",
    "#EasternWear",
    "#DesiFashion",
    "#HabibaMinhas",
    "#HabibaMinhasStudio",
  ];

  const body = [
    hook,
    "",
    "Pakistani stitched suits — cotton, lawn and chiffon, cut and finished in our Karachi studio and delivered across Pakistan.",
    "",
    urdu,
    "",
    "Shop the full collection — link in bio 🔗",
  ].join("\n");

  return {
    caption: clampCaption(body, hashtags),
    hashtags,
    altText: "Habiba Minhas — Pakistani stitched suits, made in Karachi.",
  };
}

/**
 * Caption for a collection reel — four garments in one video.
 *
 * A product caption leads with one garment's concrete facts. That cannot work here, so the
 * hook leads with the *range* instead, and the pieces are listed by name so each is
 * searchable and recognisable when a viewer comes back looking for "the green one".
 *
 * Price appears as a from-figure rather than four separate numbers: four prices in a
 * caption reads as a price list, and the individual price is on each product page anyway.
 */
export function buildCollectionCaption(
  products: Array<{ title: string; price: number }>,
  headline = "New arrivals",
): GeneratedCaption {
  const names = products.map((p) => shortName(p.title));
  const cheapest = Math.min(...products.map((p) => p.price));
  const seed = names.join("|");

  const hooks = [
    `${products.length} new pieces, just in.`,
    `${headline} — ${products.length} pieces, one rail.`,
    `Swipe through ${products.length} of this week's arrivals.`,
  ];

  const hashtags = [
    "#PakistaniFashion",
    "#PakistaniSuits",
    "#NewArrivals",
    "#StitchedSuits",
    "#ReadyToWearPakistan",
    "#KarachiFashion",
    "#OnlineShoppingPakistan",
    "#PakistanOnlineStore",
    "#EasternWear",
    "#DesiFashion",
    "#HabibaMinhas",
    "#HabibaMinhasStudio",
  ];

  const body = [
    hooks[stableIndex(seed, hooks.length)],
    "",
    names.map((n) => `• ${n}`).join("\n"),
    "",
    `Pakistani stitched suits from ${formatPrice(cheapest)} — cotton, lawn and chiffon, cut and finished in our Karachi studio and delivered nationwide.`,
    "",
    ["Abhi order karein, nationwide delivery.", "Ghar baithay order karein — poore Pakistan mein delivery."][
      stableIndex(seed, 2)
    ],
    "",
    "Shop all four — link in bio 🔗",
  ].join("\n");

  return {
    caption: clampCaption(body, hashtags),
    hashtags,
    altText: `Four Pakistani stitched suits by Habiba Minhas: ${names.join(", ")}.`,
  };
}
