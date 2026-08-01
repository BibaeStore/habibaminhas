import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { LOW_STOCK_THRESHOLD } from "@/lib/inventory-constants";

/**
 * Feed for the "Live Sale" notification card (components/common/purchase-notification.tsx).
 *
 * Replaces the old hardcoded public/data/sold.json, which was frozen in May and listed
 * products, images and PRICES that no longer matched the catalogue — it could advertise a
 * price the customer would not actually be charged.
 *
 * Products here are real and live: real title, real current price, real photo, real stock.
 * Only active, in-stock items are eligible, so the card can never promote something
 * sold out — and only from the categories in CATEGORIES below (ladies + baby).
 *
 * The customer names are illustrative personas (see CUSTOMERS below), a deliberate product
 * decision by the store owner — the same personas the previous static file used. They are
 * paired with products at request time and are not real order data.
 *
 * SEO: this route is under /api/, which robots.txt disallows, and the component consuming
 * it renders null during SSR — nothing here reaches the HTML search engines index.
 */

export const runtime = "nodejs";
/* Cached for 5 minutes — this must not be a database hit per visitor. */
export const revalidate = 300;

/** Upper bound on notifications handed to the client. The feed may be shorter — see buildFeed. */
const FEED_SIZE = 12;

/**
 * Categories eligible for this card — owner's decision: ladies and baby ONLY.
 * Kids and accessories are deliberately excluded. This drives both the hard `.in()`
 * filter on the query and the rotation below, so this is the single place to change.
 *
 * PRIMARY is the category the card exists to promote and must stay in the majority.
 */
const PRIMARY_CATEGORY = "ladies-suits";
const SECONDARY_CATEGORIES = ["baby-products"] as const;
const CATEGORIES = [PRIMARY_CATEGORY, ...SECONDARY_CATEGORIES] as const;

/**
 * Rotation weighting: per cycle, show this many ladies suits then this many baby
 * products. 2:1 keeps ladies at roughly two-thirds of the feed.
 */
const PRIMARY_PER_CYCLE = 2;
const SECONDARY_PER_CYCLE = 1;

/**
 * Illustrative customer personas, carried over from the previous sold.json so the card's
 * tone stays identical. Not real customers, not derived from the orders table.
 */
const CUSTOMERS = [
  { firstName: "Malaika",  city: "Karachi",     province: "Sindh"  },
  { firstName: "Mahnoor",  city: "Lahore",      province: "Punjab" },
  { firstName: "Hoorain",  city: "Islamabad",   province: "ICT"    },
  { firstName: "Dua",      city: "Rawalpindi",  province: "Punjab" },
  { firstName: "Mahira",   city: "Karachi",     province: "Sindh"  },
  { firstName: "Rimsha",   city: "Multan",      province: "Punjab" },
  { firstName: "Nimra",    city: "Faisalabad",  province: "Punjab" },
  { firstName: "Areeba",   city: "Lahore",      province: "Punjab" },
  { firstName: "Shanzay",  city: "Karachi",     province: "Sindh"  },
  { firstName: "Mehak",    city: "Islamabad",   province: "ICT"    },
  { firstName: "Anaya",    city: "Peshawar",    province: "KPK"    },
  { firstName: "Zara",     city: "Sialkot",     province: "Punjab" },
  { firstName: "Maha",     city: "Karachi",     province: "Sindh"  },
  { firstName: "Afreen",   city: "Lahore",      province: "Punjab" },
  { firstName: "Bisma",    city: "Gujranwala",  province: "Punjab" },
  { firstName: "Saba",     city: "Karachi",     province: "Sindh"  },
  { firstName: "Hana",     city: "Rawalpindi",  province: "Punjab" },
  { firstName: "Alisha",   city: "Lahore",      province: "Punjab" },
  { firstName: "Laiba",    city: "Karachi",     province: "Sindh"  },
  { firstName: "Palwasha", city: "Abbottabad",  province: "KPK"    },
];

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  images: string[] | null;
  created_at: string;
};

/**
 * Scarcity ordering.
 *
 * The card's job is urgency — "only 2 left" — so genuinely low-stock items are the most
 * valuable ones to surface. Within a category, put anything at or below the low-stock
 * threshold first (scarcest first), then everything else newest-first.
 *
 * The claim is always backed by the real `stock` column, so it can never overstate.
 */
function byScarcityThenNewest(a: ProductRow, b: ProductRow): number {
  const aLow = a.stock <= LOW_STOCK_THRESHOLD;
  const bLow = b.stock <= LOW_STOCK_THRESHOLD;
  if (aLow !== bLow) return aLow ? -1 : 1;
  if (aLow && bLow && a.stock !== b.stock) return a.stock - b.stock; // scarcest first
  return b.created_at.localeCompare(a.created_at);                   // else newest first
}

/**
 * Build the feed with ladies suits in the majority.
 *
 * The owner wants most notifications to be ladies suits. The catalogue makes that
 * non-trivial: only a handful of ladies suits are in stock at any time, while baby
 * products are plentiful. Two earlier approaches both failed on real data —
 * newest-first overall gave 11 baby / 1 ladies, and plain 1:1 round-robin gave
 * 3 ladies / 9 baby, because once ladies ran out baby kept filling to FEED_SIZE.
 *
 * So the rule here is: baby products are only ever added *alongside* ladies suits,
 * never to pad the feed after ladies run out. Each cycle takes PRIMARY_PER_CYCLE
 * ladies then SECONDARY_PER_CYCLE baby, and the loop stops as soon as a cycle can
 * add no more ladies. The feed therefore ends up SHORTER rather than baby-heavy —
 * a 5-item feed that is 60% ladies beats a 12-item feed that is 25% ladies.
 *
 * It scales on its own: restock ladies and the feed grows and stays ~2/3 ladies.
 */
function buildFeed(rows: ProductRow[], limit: number): ProductRow[] {
  // Scarcest first within each bucket, so the urgency message leads.
  const primary = rows.filter((r) => r.category === PRIMARY_CATEGORY).sort(byScarcityThenNewest);
  const secondary = rows
    .filter((r) => (SECONDARY_CATEGORIES as readonly string[]).includes(r.category))
    .sort(byScarcityThenNewest);

  // No ladies in stock at all ⇒ fall back to baby rather than showing nothing.
  if (primary.length === 0) return secondary.slice(0, limit);

  const picked: ProductRow[] = [];
  let pIdx = 0;
  let sIdx = 0;

  while (picked.length < limit) {
    let addedPrimary = 0;
    for (let i = 0; i < PRIMARY_PER_CYCLE && picked.length < limit; i++) {
      if (pIdx < primary.length) {
        picked.push(primary[pIdx++]);
        addedPrimary++;
      }
    }

    // Ladies exhausted — stop. Do NOT let baby pad the remaining slots.
    if (addedPrimary === 0) break;

    for (let i = 0; i < SECONDARY_PER_CYCLE && picked.length < limit; i++) {
      if (sIdx < secondary.length) picked.push(secondary[sIdx++]);
    }
  }

  return picked;
}

export async function GET() {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("products")
      .select("id, title, slug, category, price, stock, images, created_at")
      .eq("status", "active")
      .gt("stock", 0)
      // Hard filter — kids and accessories never reach this card.
      .in("category", [...CATEGORIES])
      .order("created_at", { ascending: false })
      .limit(60);

    if (error || !data || data.length === 0) {
      // Empty feed ⇒ the component renders nothing. Never an error state for the visitor.
      return NextResponse.json({ notifications: [] });
    }

    const rows = data as ProductRow[];
    const picked = buildFeed(rows, FEED_SIZE);

    const notifications = picked.map((p, i) => ({
      id: p.id,
      product: {
        title: p.title,
        slug: p.slug,
        category: p.category,
        price: p.price,
        /*
         * Real stock, straight from the column. The client turns this into "Only N
         * left" when it is at or below the threshold, and shows nothing otherwise —
         * so the scarcity claim is always true and can never be overstated.
         */
        stock: p.stock,
        lowStock: p.stock <= LOW_STOCK_THRESHOLD,
        image: p.images?.[0] ?? null,
      },
      customer: CUSTOMERS[i % CUSTOMERS.length],
      badge: "Live Sale",
    }));

    return NextResponse.json({ notifications });
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}
