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

/**
 * Copy written by a model, when one wrote it.
 *
 * Structural mirror of what `ai-caption.ts` returns, declared here rather than imported so
 * this module stays free of the Supabase client that module needs — `caption.ts` is pure and
 * several callers depend on that.
 */
export type AiCaptionContent = {
  hook: string;
  body: string;
  faqLine: string;
  hashtags: string[];
  altText: string;
};

export type CaptionOptions = {
  /** Null or absent falls back to the assembled caption. */
  ai?: AiCaptionContent | null;
  /** Owner preference, from `social_settings.caption_include_price`. Default off. */
  includePrice?: boolean;
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
function buildDetails(
  product: ProductCandidate,
  specs: Map<string, string>,
  includePrice: boolean,
): string[] {
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
  // Price is opt-in from 2026-08-28. The owner asked for it out of captions; kept behind a
  // flag rather than deleted because it is a marketing preference, not an engineering fact,
  // and reversing it should not need a deploy.
  if (includePrice) lines.push(`• ${formatPrice(product.price)}`);
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
  options?: CaptionOptions,
): GeneratedCaption {
  const specs = parseSpecs(product.short_description);
  const ai = options?.ai ?? null;
  const includePrice = options?.includePrice ?? false;

  /*
   * When a model wrote the copy, it supplies the parts that carry voice — the hook, the
   * detail lines, the answered question and the tags. Everything else stays with this
   * function: the CTA, the Urdu line placement, the ordering, the 2,200-character clamp and
   * the hashtag cap. Those are proven and platform-specific, and there is no reason to let a
   * model near them.
   *
   * The fallback is not a degraded mode. It is what has been publishing for eleven days.
   */
  const hook = ai?.hook ?? buildHook(product, specs);
  const details = ai ? ai.body.split("\n").filter(Boolean) : buildDetails(product, specs, includePrice);
  const keywords = ai?.faqLine || buildKeywordLine(product, specs);
  const urdu = buildUrduLine(product);
  const hashtags = ai?.hashtags?.length ? ai.hashtags : buildHashtags(product, specs);
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

  return { caption, hashtags, altText: ai?.altText || buildAltText(product, specs) };
}

/** Pinterest's hard field limits. Over-length fields are rejected, not trimmed. */
export const PIN_TITLE_MAX_CHARS = 100;
export const PIN_DESCRIPTION_MAX_CHARS = 800;

export type PinContent = {
  title: string;
  description: string;
  hashtags: string[];
  altText: string;
  /** Where the pin sends people, UTM-tagged. */
  link: string;
};

/**
 * Builds a pin, which is a genuinely different object from an Instagram caption.
 *
 * Pinterest is a **search engine with a feed attached**, not a feed with search bolted on.
 * That inverts almost every choice `buildCaption` makes:
 *
 *   - A pin has a **title**, weighted heavily in ranking and shown in the grid. This is the
 *     field that decides whether the pin is ever found, so it leads with the searchable
 *     words — fabric, piece count, garment — rather than an atmospheric hook.
 *   - A pin has a **real link**, so there is no "link in bio" contortion.
 *   - **Hashtags barely matter.** Pinterest deprecated hashtag search and now treats them as
 *     ordinary description text, so a 15-tag block would just be noise where indexed prose
 *     should be. A handful are kept for the admin UI's benefit and nothing more.
 *   - Pins are **evergreen** — they surface for months, unlike a post that dies in a day.
 *     Which makes the standing no-inventory rule matter more here, not less.
 */
export function buildPinContent(product: ProductCandidate): PinContent {
  const specs = parseSpecs(product.short_description);

  const name = shortName(product.title);
  const garment = garmentNoun(product.title);
  const pieces = pieceLabel(product.title, specs);
  const fabric = primaryFabric(specs);

  // Title: name first so the pin is recognisably ours, then the words people type.
  const descriptor = [pieces, fabric, garment].filter(Boolean).join(" ");
  const title = cut(
    descriptor ? `${name} — ${titleCase(descriptor)}` : name,
    PIN_TITLE_MAX_CHARS,
  );

  /*
   * Description: real sentences, because Pinterest indexes this text and a keyword dump
   * ranks worse than prose while also reading as spam to a human.
   *
   * Same standing content rule as every other caption here — no sizes, no stock counts,
   * nothing that goes stale. A pin outlives the inventory it describes by months.
   */
  const detail = [
    pieces ? `${titleCase(pieces)}` : null,
    fabric ? `${titleCase(fabric)}` : null,
    pickSpec(specs, "embroidery", "work"),
  ]
    .filter(Boolean)
    .join(" · ");

  const description = cut(
    [
      buildKeywordLine(product, specs),
      detail || null,
      formatPrice(product.price),
      "Delivered across Pakistan. Tap through to see the full range.",
    ]
      .filter(Boolean)
      .join("\n\n"),
    PIN_DESCRIPTION_MAX_CHARS,
  );

  return {
    title,
    description,
    // Trimmed hard: they are plain text to Pinterest, so more would only crowd the index.
    hashtags: buildHashtags(product, specs).slice(0, 5),
    altText: buildAltText(product, specs),
    link: productUrl(product.category, product.slug, "pinterest"),
  };
}

/** Hard character cut with an ellipsis, for fields a platform rejects rather than trims. */
function cut(value: string, max: number): string {
  const clean = value.trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
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
const UPLOAD_HOOKS = [
  "New in — hand-finished, ready to wear.",
  "Fresh off the rail at the Karachi studio.",
  "The kind of stitching you only see up close.",
  "Made in small runs, worn every day.",
  "Cut, stitched and finished by hand this week.",
  "Straight from the workroom floor.",
  "Small batch, properly finished, ready to wear.",
  "This week's make, off the rail and on camera.",
];

const UPLOAD_URDU = [
  "Abhi order karein, nationwide delivery.",
  "Ghar baithay order karein — poore Pakistan mein delivery.",
  "Online order karein, delivery aap ke ghar tak.",
  "Pasand aaya? Abhi order karein — delivery poore Pakistan mein.",
  "Apna size chunein aur order karein, delivery ghar tak.",
  "Order karein aaj, delivery poore Pakistan mein.",
];

const UPLOAD_BODIES = [
  "Pakistani stitched suits — cotton, lawn and chiffon, cut and finished in our Karachi studio and delivered across Pakistan.",
  "Fully stitched eastern wear in cotton, lawn and chiffon, made in our own Karachi workroom and sent anywhere in Pakistan.",
  "Ready-to-wear Pakistani suits, finished by hand in Karachi — cotton for every day, chiffon when it matters.",
];

const UPLOAD_CTAS = [
  "Shop the full collection — link in bio 🔗",
  "Everything is on the site — link in bio 🔗",
  "See the whole range — link in bio 🔗",
];

/**
 * How many genuinely different captions this can produce.
 *
 * Exported so the caller can walk the whole set before any of it repeats.
 */
export const UPLOAD_CAPTION_VARIANTS =
  UPLOAD_HOOKS.length * UPLOAD_URDU.length * UPLOAD_BODIES.length * UPLOAD_CTAS.length;

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
 * **`variant` selects the wording, and it must differ between uploads.** This previously
 * took a seed defaulting to *the current date*, which meant every video uploaded on the
 * same day received a byte-identical caption. Consecutive identical captions are a spam
 * signal to Instagram and read as carelessness to a human. The caller picks the variant
 * least recently used, so the set is walked before anything repeats.
 */
export function buildUploadCaption(variant = 0): GeneratedCaption {
  const v = Math.abs(Math.trunc(variant));

  // Mixed radix, so advancing the variant by one changes the hook every time rather than
  // cycling one field through all its values before the next ever moves.
  const hook = UPLOAD_HOOKS[v % UPLOAD_HOOKS.length];
  const urdu = UPLOAD_URDU[Math.floor(v / UPLOAD_HOOKS.length) % UPLOAD_URDU.length];
  const body =
    UPLOAD_BODIES[Math.floor(v / (UPLOAD_HOOKS.length * UPLOAD_URDU.length)) % UPLOAD_BODIES.length];
  const cta =
    UPLOAD_CTAS[
      Math.floor(v / (UPLOAD_HOOKS.length * UPLOAD_URDU.length * UPLOAD_BODIES.length)) %
        UPLOAD_CTAS.length
    ];

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

  return {
    caption: clampCaption([hook, "", body, "", urdu, "", cta].join("\n"), hashtags),
    hashtags,
    altText: "Habiba Minhas — Pakistani stitched suits, made in Karachi.",
  };
}

/** The opening line a variant produces, for spotting which have been used already. */
export function uploadCaptionHook(variant: number): string {
  return UPLOAD_HOOKS[Math.abs(Math.trunc(variant)) % UPLOAD_HOOKS.length];
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
