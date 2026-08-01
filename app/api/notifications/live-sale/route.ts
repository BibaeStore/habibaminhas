import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

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

/** How many notifications to hand the client to cycle through. */
const FEED_SIZE = 12;

/**
 * Categories eligible for this card — owner's decision: ladies and baby ONLY.
 * Kids and accessories are deliberately excluded. This is both the hard filter on
 * the query and the list used to guarantee spread, so adding a category here is
 * the single place to change if that decision changes.
 */
const CATEGORIES = ["ladies-suits", "baby-products"] as const;

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
  images: string[] | null;
  created_at: string;
};

/**
 * Newest-first within each category, round-robin across categories.
 *
 * Round-robin rather than "one pass then fill newest-first": the catalogue's newest
 * products are heavily weighted to one category (currently baby), so a newest-first
 * fill produced 11 baby products and a single ladies suit — burying the flagship
 * category the card exists to promote.
 *
 * Alternating gives a balanced feed (≈50/50 for two categories) while still showing
 * the newest items within each. If one category runs out, the other fills the
 * remainder rather than leaving slots empty.
 */
function mixByCategory(rows: ProductRow[], limit: number): ProductRow[] {
  // rows arrive newest-first, so each bucket stays newest-first.
  const buckets = CATEGORIES.map((cat) => rows.filter((r) => r.category === cat));

  const picked: ProductRow[] = [];
  let round = 0;

  while (picked.length < limit) {
    let addedThisRound = false;
    for (const bucket of buckets) {
      if (picked.length >= limit) break;
      const item = bucket[round];
      if (item) {
        picked.push(item);
        addedThisRound = true;
      }
    }
    if (!addedThisRound) break; // every bucket exhausted
    round++;
  }

  return picked;
}

export async function GET() {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("products")
      .select("id, title, slug, category, price, images, created_at")
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
    const picked = mixByCategory(rows, FEED_SIZE);

    const notifications = picked.map((p, i) => ({
      id: p.id,
      product: {
        title: p.title,
        slug: p.slug,
        category: p.category,
        price: p.price,
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
