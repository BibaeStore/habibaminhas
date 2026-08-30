import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/require-admin";

const STAGES = ["pending", "processing", "dispatched", "delivered", "cancelled"] as const;

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url       = new URL(req.url);
  const fromParam = url.searchParams.get("from");
  const toParam   = url.searchParams.get("to");

  if (!fromParam || !toParam) {
    return NextResponse.json({ error: "Missing from/to parameters" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: orders, error } = await admin
    .from("orders")
    .select("status")
    .gte("created_at", fromParam)
    .lte("created_at", toParam);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts = new Map<string, number>(STAGES.map((s) => [s, 0]));
  for (const order of orders ?? []) {
    const s = (order.status as string) || "pending";
    if (counts.has(s)) counts.set(s, (counts.get(s) ?? 0) + 1);
  }

  const total = (orders ?? []).length;
  const data  = STAGES.map((status) => {
    const count = counts.get(status) ?? 0;
    return {
      status,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  return NextResponse.json({ data, total });
}
