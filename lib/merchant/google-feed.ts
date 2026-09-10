import type { Tables } from "@/lib/supabase/types";

/**
 * Google Merchant Center product feed.
 *
 * Read-only: this module derives a feed from rows that already exist. It writes nothing,
 * renders nothing on the site, and is not referenced by any page, sitemap or metadata.
 *
 * Scope is deliberately narrow — ladies-suits and baby-products only, at the owner's
 * instruction (2026-09-10). kids-formal and accessories are excluded. kids-formal would
 * also have failed apparel validation: all 15 rows have a null `sizes_stock`.
 */

export const FEED_CATEGORIES = ["ladies-suits", "baby-products"] as const;

const BASE_URL = "https://habibaminhas.com";
const BRAND = "Habiba Minhas";
const SHIPPING_PRICE_PKR = 250;

/**
 * Colour codes read from segment 2 of the SKU (BIBA-<code>-...).
 *
 * ⚠️ Segment 2 is NOT reliably a colour. `TSH` is shared by five suits in five different
 * colours (Rose Jewel, Fuchsia Bloom, Golden Amber, Royal Plum, Midnight Navy) — it is a
 * fabric/line code, not a colour. Anything ambiguous belongs in COLOR_BY_SKU below, and
 * a code that is not a colour must simply be absent from this map.
 *
 * `color` is recommended rather than required for apparel targeting Pakistan, so an
 * unknown colour omits the attribute instead of guessing. A wrong colour is worse than
 * a missing one: it is shown to shoppers and can get the item disapproved.
 */
const COLOR_BY_CODE: Record<string, string> = {
  BLK: "Black",
  BLU: "Blue",
  BZ: "Bronze",
  COR: "Coral",
  CRM: "Cream",
  GRN: "Green",
  LIL: "Lilac",
  NVY: "Navy",
  OLV: "Olive",
  ORG: "Orange",
  OWH: "Ivory",
  PCH: "Peach",
  PNK: "Pink",
  RWE: "Rosewood",
  TAU: "Taupe",
  TEL: "Teal",
  TPK: "Tea Pink",
  WHT: "White",
};

/** Per-SKU overrides, from the product name, where the SKU code is not a colour. */
const COLOR_BY_SKU: Record<string, string> = {
  "BIBA-TSH-002": "Rose",
  "BIBA-TSH-003": "Fuchsia",
  "BIBA-TSH-004": "Gold",
  "BIBA-TSH-005": "Plum",
  "BIBA-TSH-006": "Navy",
};

/**
 * Google product taxonomy paths, verified against taxonomy-with-ids.en-US.txt (2026-09-10).
 * IDs are recorded in the comments so a future edit can re-check them.
 *
 * Baby subcategories are checked in this order because `subcategory` is an array and a
 * product can carry several — the most specific claim should win.
 */
const BABY_CATEGORY_PRIORITY: [string, string][] = [
  ["baby-bags", "Luggage & Bags > Diaper Bags"], // 549
  ["baby-swaddle", "Baby & Toddler > Swaddling & Receiving Blankets > Swaddling Blankets"], // 543665
  ["baby-pillow", "Home & Garden > Linens & Bedding > Bedding > Pillows"], // 2700
  ["baby-nest", "Home & Garden > Linens & Bedding > Bedding"], // 569
  ["baby-cot-sets", "Home & Garden > Linens & Bedding > Bedding"], // 569
  ["baby-bedding-set", "Home & Garden > Linens & Bedding > Bedding"], // 569
];

/** A stitched 2-/3-/4-piece shalwar kameez is an outfit set, not a single dress. */
const LADIES_CATEGORY = "Apparel & Accessories > Clothing > Outfit Sets"; // 7313
const BABY_FALLBACK_CATEGORY = "Home & Garden > Linens & Bedding > Bedding"; // 569

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImageLinks: string[];
  availability: "in_stock" | "out_of_stock";
  price: string;
  salePrice?: string;
  brand: string;
  mpn: string;
  googleProductCategory: string;
  productType: string;
  color?: string;
  size?: string;
  ageGroup?: string;
  gender?: string;
  itemGroupId?: string;
}

function colorFor(sku: string | null): string | undefined {
  if (!sku) return undefined;
  if (COLOR_BY_SKU[sku]) return COLOR_BY_SKU[sku];
  return COLOR_BY_CODE[sku.split("-")[1] ?? ""];
}

function googleCategoryFor(p: Tables<"products">): string {
  if (p.category === "ladies-suits") return LADIES_CATEGORY;
  const subs = (p.subcategory ?? []) as string[];
  for (const [sub, cat] of BABY_CATEGORY_PRIORITY) {
    if (subs.includes(sub)) return cat;
  }
  return BABY_FALLBACK_CATEGORY;
}

/** Google caps description at 5000 chars; strip any stray markup and collapse whitespace. */
function cleanDescription(p: Tables<"products">): string {
  const raw = (p.description || p.short_description || p.title || "").toString();
  const text = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 5000 ? `${text.slice(0, 4997)}...` : text;
}

function money(pkr: number): string {
  return `${pkr}.00 PKR`;
}

/**
 * Apparel sizes are separate variants sharing an item_group_id, each with its own
 * availability — so a sold-out M never advertises as buyable. Non-apparel (baby) and
 * anything with no size data emits a single row.
 *
 * ⚠️ `stock` and `sizes_stock` disagree on 7 active products (2026-09-10). Four have
 * `stock = 0` while their size map still shows `M: 1` — trusting the size map alone
 * would advertise a sold-out suit as buyable, which is both a Merchant Center
 * disapproval and a customer who orders something that cannot ship.
 *
 * The master `stock` column is therefore the gate: a size counts as available only when
 * BOTH the product-level stock and that size's own quantity are positive. Where the two
 * disagree the feed always takes the more conservative reading. This does not repair the
 * underlying rows — that is an inventory decision for the owner, not the feed's to make.
 */
function sizesInStock(p: Tables<"products">): string[] {
  if (p.stock <= 0) return [];
  const ss = p.sizes_stock as Record<string, number> | null;
  if (!ss || typeof ss !== "object") return [];
  return Object.entries(ss)
    .filter(([, qty]) => typeof qty === "number" && qty > 0)
    .map(([size]) => size);
}

export function buildFeedItems(products: Tables<"products">[]): FeedItem[] {
  const items: FeedItem[] = [];

  for (const p of products) {
    if (!FEED_CATEGORIES.includes(p.category as (typeof FEED_CATEGORIES)[number])) continue;
    if (p.status !== "active") continue;

    const images = (p.images ?? []) as string[];
    if (images.length === 0) continue; // image_link is required; a row without one is rejected

    const link = `${BASE_URL}/product/${p.category}/${p.slug}/`;
    const sku = p.sku || p.slug;
    const isLadies = p.category === "ladies-suits";

    // compare_at is the ORIGINAL price and `price` the current one. Google expects the
    // reverse naming: price = regular, sale_price = discounted. Sending it the other way
    // round is the classic cause of a whole-feed "price mismatch" disapproval.
    const onSale = p.compare_at != null && p.compare_at > p.price;
    const regular = onSale ? p.compare_at! : p.price;
    const sale = onSale ? p.price : undefined;

    const base = {
      title: p.title.slice(0, 150),
      description: cleanDescription(p),
      link,
      imageLink: images[0],
      additionalImageLinks: images.slice(1, 11),
      price: money(regular),
      salePrice: sale != null ? money(sale) : undefined,
      brand: BRAND,
      mpn: sku,
      googleProductCategory: googleCategoryFor(p),
      productType: [p.category, ...((p.subcategory ?? []) as string[])].join(" > "),
      color: isLadies ? colorFor(p.sku) : undefined,
      ageGroup: isLadies ? "adult" : undefined,
      gender: isLadies ? "female" : undefined,
    };

    const available = sizesInStock(p);

    if (isLadies && available.length > 0) {
      for (const size of available) {
        items.push({
          ...base,
          id: `${sku}-${size}`,
          size,
          itemGroupId: sku,
          availability: "in_stock",
        });
      }
    } else {
      items.push({
        ...base,
        id: sku,
        availability: p.stock > 0 ? "in_stock" : "out_of_stock",
      });
    }
  }

  return items;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function tag(name: string, value?: string): string {
  return value ? `      <g:${name}>${esc(value)}</g:${name}>\n` : "";
}

export function buildFeedXml(items: FeedItem[]): string {
  const body = items
    .map((it) => {
      let x = "    <item>\n";
      x += tag("id", it.id);
      x += tag("title", it.title);
      x += tag("description", it.description);
      x += tag("link", it.link);
      x += tag("image_link", it.imageLink);
      for (const img of it.additionalImageLinks) x += tag("additional_image_link", img);
      x += tag("availability", it.availability);
      x += tag("price", it.price);
      x += tag("sale_price", it.salePrice);
      x += tag("condition", "new");
      x += tag("brand", it.brand);
      x += tag("mpn", it.mpn);
      // Handmade goods carry no barcode. Declaring this explicitly is what stops Google
      // rejecting the row for a missing GTIN.
      x += tag("identifier_exists", "no");
      x += tag("google_product_category", it.googleProductCategory);
      x += tag("product_type", it.productType);
      x += tag("age_group", it.ageGroup);
      x += tag("gender", it.gender);
      x += tag("color", it.color);
      x += tag("size", it.size);
      x += tag("item_group_id", it.itemGroupId);
      x += "      <g:shipping>\n";
      x += "        <g:country>PK</g:country>\n";
      x += "        <g:service>Standard</g:service>\n";
      x += `        <g:price>${money(SHIPPING_PRICE_PKR)}</g:price>\n`;
      x += "      </g:shipping>\n";
      x += "    </item>\n";
      return x;
    })
    .join("");

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n' +
    "  <channel>\n" +
    `    <title>${esc(BRAND)}</title>\n` +
    `    <link>${BASE_URL}/</link>\n` +
    "    <description>Pakistani ladies suits and baby products, handcrafted in Karachi.</description>\n" +
    body +
    "  </channel>\n" +
    "</rss>\n"
  );
}
