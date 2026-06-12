import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url       = new URL(req.url);
  const fromParam = url.searchParams.get("from");
  const toParam   = url.searchParams.get("to");
  const limit     = Math.min(20, parseInt(url.searchParams.get("limit") ?? "10"));

  if (!fromParam || !toParam) {
    return NextResponse.json({ error: "Missing from/to parameters" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Step 1: orders in range (not cancelled) → IDs
  const { data: ordersData, error: ordersErr } = await admin
    .from("orders")
    .select("id")
    .gte("created_at", fromParam)
    .lte("created_at", toParam)
    .neq("status", "cancelled");

  if (ordersErr) return NextResponse.json({ error: ordersErr.message }, { status: 500 });

  const orderIds = (ordersData ?? []).map((o) => o.id as string);
  if (orderIds.length === 0) return NextResponse.json({ data: [] });

  // Step 2: order_items for those orders
  const { data: items, error: itemsErr } = await admin
    .from("order_items")
    .select("product_id, product_title, quantity, total_price, order_id")
    .in("order_id", orderIds);

  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

  // Step 3: group by product_title (stable even if product is deleted)
  type Agg = {
    product_id:    string | null;
    product_title: string;
    units_sold:    number;
    revenue:       number;
    order_ids:     Set<string>;
  };

  const agg = new Map<string, Agg>();
  for (const item of items ?? []) {
    const key = (item.product_title as string) || (item.product_id as string) || "Unknown";
    const cur = agg.get(key) ?? {
      product_id:    item.product_id as string | null,
      product_title: (item.product_title as string) || "Unknown",
      units_sold:    0,
      revenue:       0,
      order_ids:     new Set<string>(),
    };
    cur.units_sold += (item.quantity as number) ?? 1;
    cur.revenue    += (item.total_price as number) ?? 0;
    cur.order_ids.add(item.order_id as string);
    agg.set(key, cur);
  }

  const data = [...agg.values()]
    .map((p) => ({
      product_id:    p.product_id,
      product_title: p.product_title,
      units_sold:    p.units_sold,
      revenue:       p.revenue,
      order_count:   p.order_ids.size,
    }))
    .sort((a, b) => b.units_sold - a.units_sold)
    .slice(0, limit);

  return NextResponse.json({ data });
}
