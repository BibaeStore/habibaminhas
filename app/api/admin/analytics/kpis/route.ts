import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const fromParam = url.searchParams.get("from");
  const toParam   = url.searchParams.get("to");

  if (!fromParam || !toParam) {
    return NextResponse.json({ error: "Missing from/to parameters" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: orders, error } = await admin
    .from("orders")
    .select("status, total")
    .gte("created_at", fromParam)
    .lte("created_at", toParam)
    .neq("status", "cancelled");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type Row = { status: string; total: number };
  const rows = (orders ?? []) as Row[];

  const delivered        = rows.filter((o) => o.status === "delivered");
  const pending          = rows.filter((o) => o.status !== "delivered");
  const confirmed_revenue = delivered.reduce((s, o) => s + (o.total ?? 0), 0);
  const pending_revenue   = pending.reduce((s, o) => s + (o.total ?? 0), 0);
  const order_count       = rows.length;
  const aov               = delivered.length > 0 ? Math.round(confirmed_revenue / delivered.length) : 0;

  return NextResponse.json({
    confirmed_revenue,
    pending_revenue,
    order_count,
    aov,
    delivered_count: delivered.length,
    pending_count:   pending.length,
  });
}
