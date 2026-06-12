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

  // Orders in range + all orders before range — in parallel
  const [{ data: rangeOrders, error: e1 }, { data: beforeOrders, error: e2 }] =
    await Promise.all([
      admin
        .from("orders")
        .select("customer_email, customer_name, total, status")
        .gte("created_at", fromParam)
        .lte("created_at", toParam)
        .neq("status", "cancelled"),
      admin
        .from("orders")
        .select("customer_email")
        .lt("created_at", fromParam)
        .neq("status", "cancelled"),
    ]);

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  const beforeEmails = new Set((beforeOrders ?? []).map((o) => o.customer_email as string));

  // Group by customer email
  type CustomerAgg = { name: string; spent: number; orders: number };
  const inRange = new Map<string, CustomerAgg>();
  for (const order of rangeOrders ?? []) {
    const email = order.customer_email as string;
    const cur   = inRange.get(email) ?? {
      name:   (order.customer_name as string) || email,
      spent:  0,
      orders: 0,
    };
    cur.spent  += (order.total as number) ?? 0;
    cur.orders += 1;
    inRange.set(email, cur);
  }

  const emails = [...inRange.keys()];
  const new_count       = emails.filter((e) => !beforeEmails.has(e)).length;
  const returning_count = emails.filter((e) => beforeEmails.has(e)).length;

  // Top 5 by spend in period — enrich with tier + city from customers table
  const topEmails = [...inRange.entries()]
    .sort(([, a], [, b]) => b.spent - a.spent)
    .slice(0, 5)
    .map(([email]) => email);

  const { data: custRecords } = topEmails.length
    ? await admin.from("customers").select("email, name, tier, city").in("email", topEmails)
    : { data: [] };

  const custMap = new Map((custRecords ?? []).map((c) => [c.email as string, c]));

  const top_customers = topEmails.map((email) => {
    const agg = inRange.get(email)!;
    const rec = custMap.get(email);
    return {
      email,
      name:             rec?.name   ?? agg.name,
      tier:             (rec?.tier  ?? "New") as string,
      city:             (rec?.city  ?? null)  as string | null,
      spent_in_period:  agg.spent,
      orders_in_period: agg.orders,
    };
  });

  return NextResponse.json({
    new_count,
    returning_count,
    total_in_period: inRange.size,
    top_customers,
  });
}
