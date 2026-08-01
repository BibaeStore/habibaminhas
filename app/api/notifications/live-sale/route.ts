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
 * sold out.
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

/** Categories we try to represent, so one category cannot monopolise the feed. */
const CATEGORIES = ["ladies-suits", "kids-formal", "baby-products", "accessories"] as const;

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
 * Newest-first, but guarantee category spread.
 *
 * Straight newest-first would let a batch of ladies suits fill every slot. So we take one
 * pass across the categories (newest from each), then fill the remainder newest-first from
 * whatever is left. Result: mostly recent items, with kids/baby/accessories still surfacing.
 */
function mixByCategory(rows: ProductRow[], limit: number): ProductRow[] {
  const byCategory = new Map<string, ProductRow[]>();
  for (const r of rows) {
    const list = byCategory.get(r.category) ?? [];
    list.push(r);
    byCategory.set(r.category, list);
  }

  const picked: ProductRow[] = [];
  const taken = new Set<string>();

  // Round 1 — newest from each category that has stock.
  for (const cat of CATEGORIES) {
    const first = byCategory.get(cat)?.[0];
    if (first && !taken.has(first.id)) {
      picked.push(first);
      taken.add(first.id);
    }
  }

  // Round 2 — fill the rest newest-first, skipping anything already picked.
  for (const r of rows) {
    if (picked.length >= limit) break;
    if (taken.has(r.id)) continue;
    picked.push(r);
    taken.add(r.id);
  }

  return picked.slice(0, limit);
}

export async function GET() {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("products")
      .select("id, title, slug, category, price, images, created_at")
      .eq("status", "active")
      .gt("stock", 0)
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
