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
function buildHook(product: ProductCandidate, specs: Map<string, string>): string {
  const name = shortName(product.title);
  const clean = (v: string) => v.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();

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
    const key = tag.toLowerCase();
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
  const fabric = pickSpec(specs, "fabric");
  if (fabric) {
    const known = [
      "cotton", "lawn", "chiffon", "silk", "linen", "khaddar", "organza",
      "velvet", "georgette", "net", "jacquard", "cambric", "viscose", "denim",
    ];
    const match = known.find((f) => new RegExp(`\\b${f}\\b`, "i").test(fabric));
    if (match) add(`${match[0].toUpperCase()}${match.slice(1)}SuitPakistan`);
  }

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
  const bits = [
    product.title,
    pickSpec(specs, "colour", "color"),
    pickSpec(specs, "fabric"),
  ].filter(Boolean);
  return bits.join(" — ").slice(0, 950);
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
  const urdu = buildUrduLine(product);
  const hashtags = buildHashtags(product, specs);
  const name = shortName(product.title);

  // Instagram captions are not clickable, so the CTA points at the bio and names the
  // product so site search finds it. It must not mention sizing or availability.
  const cta =
    platform === "facebook"
      ? `Shop ${name} → ${productUrl(product.category, product.slug, platform)}`
      : `Shop “${name}” — link in bio 🔗`;

  const body = [hook, "", details.join("\n"), "", urdu, "", cta].join("\n");
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
