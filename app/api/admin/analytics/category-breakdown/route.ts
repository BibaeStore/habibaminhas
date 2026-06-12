import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url       = new URL(req.url);
  const fromParam = url.searchParams.get("from");
  const toParam   = url.searchParams.get("to");

  if (!fromParam || !toParam) {
    return NextResponse.json({ error: "Missing from/to parameters" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Step 1: orders in range (not cancelled) → their IDs
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
    .select("total_price, product_id")
    .in("order_id", orderIds);

  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

  // Step 3: categories for all unique product IDs
  const productIds = [...new Set(
    (items ?? []).map((i) => i.product_id as string).filter(Boolean),
  )];

  const catMap = new Map<string, string>();
  if (productIds.length > 0) {
    const { data: prods } = await admin
      .from("products")
      .select("id, category")
      .in("id", productIds);
    for (const p of prods ?? []) {
      catMap.set(p.id as string, (p.category as string) ?? "Other");
    }
  }

  // Step 4: bucket by category
  const totals = new Map<string, number>();
  for (const item of items ?? []) {
    const cat = item.product_id
      ? (catMap.get(item.product_id as string) ?? "Other")
      : "Other";
    totals.set(cat, (totals.get(cat) ?? 0) + ((item.total_price as number) ?? 0));
  }

  const grandTotal = [...totals.values()].reduce((s, v) => s + v, 0);
  const data = [...totals.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([category, revenue]) => ({
      category,
      revenue,
      pct: grandTotal > 0 ? Math.round((revenue / grandTotal) * 100) : 0,
    }));

  return NextResponse.json({ data, grandTotal });
}
