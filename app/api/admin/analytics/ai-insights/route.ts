import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const MIN_ORDERS = 20;

export async function POST() {
  // Guard: API key must be configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { code: "not_configured", message: "Add ANTHROPIC_API_KEY to .env.local to enable AI insights." },
      { status: 503 },
    );
  }

  const admin = createAdminClient();

  // Count total orders (not cancelled)
  const { count, error: countErr } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .neq("status", "cancelled");

  if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 });

  const totalOrders = count ?? 0;
  if (totalOrders < MIN_ORDERS) {
    return NextResponse.json(
      {
        code:    "not_enough_data",
        message: `Your store has ${totalOrders} order${totalOrders !== 1 ? "s" : ""} so far. Come back when you reach ${MIN_ORDERS} orders for meaningful AI recommendations.`,
        current: totalOrders,
        needed:  MIN_ORDERS,
      },
      { status: 200 },
    );
  }

  // Build a concise data summary to send to Claude
  const [
    { data: recentOrders },
    { data: topItems },
    { data: statusCounts },
  ] = await Promise.all([
    admin.from("orders").select("total, status, payment_method").neq("status", "cancelled").order("created_at", { ascending: false }).limit(50),
    admin.from("order_items").select("product_title, quantity, total_price").order("total_price", { ascending: false }).limit(50),
    admin.from("orders").select("status"),
  ]);

  // Aggregate for prompt
  const delivered   = (recentOrders ?? []).filter((o) => o.status === "delivered");
  const revenue     = delivered.reduce((s, o) => s + ((o.total as number) ?? 0), 0);
  const codCount    = (recentOrders ?? []).filter((o) => o.payment_method === "COD").length;
  const cancelCount = (statusCounts ?? []).filter((o) => o.status === "cancelled").length;
  const cancelRate  = statusCounts?.length ? Math.round((cancelCount / statusCounts.length) * 100) : 0;

  // Top products by units sold
  const pMap = new Map<string, number>();
  for (const item of topItems ?? []) {
    const t = (item.product_title as string) || "Unknown";
    pMap.set(t, (pMap.get(t) ?? 0) + ((item.quantity as number) ?? 1));
  }
  const topProducts = [...pMap.entries()].sort(([, a], [, b]) => b - a).slice(0, 5);

  const prompt = `You are a business advisor for Habiba Minhas, a Pakistani ladies and children's clothing brand (suits, kids formal wear, baby products, accessories). Analyze these recent sales metrics and give 3-5 specific, actionable recommendations. Be concise, practical, and relevant to the Pakistani market.

Sales summary:
- Total confirmed revenue (delivered): Rs. ${revenue.toLocaleString()}
- Orders analyzed: ${recentOrders?.length ?? 0}
- COD share: ${recentOrders?.length ? Math.round((codCount / recentOrders.length) * 100) : 0}%
- Cancellation rate: ${cancelRate}%
- Top 5 products by units sold: ${topProducts.map(([name, qty]) => `${name} (${qty} units)`).join(", ")}

Give 3-5 bullet-point recommendations. Focus on what to stock more of, pricing, and reducing cancellations.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 1024,
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`Claude API error ${res.status}`);
    const json = await res.json();
    const text = json?.content?.[0]?.text ?? "";
    return NextResponse.json({ code: "ok", recommendations: text });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get AI insights." },
      { status: 500 },
    );
  }
}
