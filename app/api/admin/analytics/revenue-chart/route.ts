import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const toPKTDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });

function generateDates(fromISO: string, toISO: string): string[] {
  const start  = toPKTDate(fromISO);
  const end    = toPKTDate(toISO);
  const dates: string[] = [];
  // Use noon UTC so the UTC date always equals the PKT date we computed above
  const cursor = new Date(start + "T12:00:00Z");
  const stopAt = new Date(end   + "T12:00:00Z");
  while (cursor <= stopAt) {
    dates.push(cursor.toISOString().split("T")[0]);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export async function GET(req: NextRequest) {
  const url      = new URL(req.url);
  const fromParam = url.searchParams.get("from");
  const toParam   = url.searchParams.get("to");

  if (!fromParam || !toParam) {
    return NextResponse.json({ error: "Missing from/to parameters" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: orders, error } = await admin
    .from("orders")
    .select("created_at, total, status")
    .gte("created_at", fromParam)
    .lte("created_at", toParam)
    .neq("status", "cancelled");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dates   = generateDates(fromParam, toParam);
  const buckets = new Map(dates.map((d) => [d, { confirmed_revenue: 0, pending_revenue: 0 }]));

  for (const order of orders ?? []) {
    const day    = toPKTDate(order.created_at as string);
    const bucket = buckets.get(day);
    if (!bucket) continue;
    const amount = (order.total as number) ?? 0;
    if (order.status === "delivered") {
      bucket.confirmed_revenue += amount;
    } else {
      bucket.pending_revenue += amount;
    }
  }

  const data = dates.map((date) => ({ date, ...buckets.get(date)! }));

  return NextResponse.json({ data });
}
