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
  const { data: orders, error } = await admin
    .from("orders")
    .select("payment_method, total")
    .gte("created_at", fromParam)
    .lte("created_at", toParam)
    .neq("status", "cancelled");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const groups = new Map<string, { count: number; revenue: number }>();
  for (const order of orders ?? []) {
    const method = (order.payment_method as string) || "Other";
    const cur    = groups.get(method) ?? { count: 0, revenue: 0 };
    cur.count++;
    cur.revenue += (order.total as number) ?? 0;
    groups.set(method, cur);
  }

  const totalCount = [...groups.values()].reduce((s, g) => s + g.count, 0);
  const data = [...groups.entries()]
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([method, { count, revenue }]) => ({
      method,
      count,
      revenue,
      pct: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    }));

  return NextResponse.json({ data, totalCount });
}
