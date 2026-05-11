"use server";

import { createAdminClient } from "@/lib/supabase/server";

export const LOW_STOCK_THRESHOLD = 5;

/**
 * Atomically decrements stock for a list of items via the
 * `decrement_product_stock` RPC. Returns the products whose stock crossed the
 * low-stock threshold during this call so the caller can fire notifications.
 */
export async function decrementStock(
  items: Array<{ product_id: string | null; quantity: number }>,
): Promise<Array<{ id: string; title: string; stock: number }>> {
  const payload = items
    .filter((i) => i.product_id && i.quantity > 0)
    .map((i) => ({ product_id: i.product_id, quantity: i.quantity }));
  if (payload.length === 0) return [];

  const sb = createAdminClient();
  const { data, error } = await sb.rpc("decrement_product_stock", {
    p_items: payload,
    p_threshold: LOW_STOCK_THRESHOLD,
  });
  if (error || !data) return [];

  const rows = data as Array<{
    id: string;
    title: string;
    stock: number;
    crossed_threshold: boolean;
  }>;
  return rows
    .filter((r) => r.crossed_threshold)
    .map((r) => ({ id: r.id, title: r.title, stock: r.stock }));
}

export async function emitLowStockNotifications(
  rows: Array<{ id: string; title: string; stock: number }>,
) {
  if (rows.length === 0) return;
  const sb = createAdminClient();
  await sb.from("notifications").insert(
    rows.map((r) => ({
      type: "low_stock",
      title: r.stock === 0 ? "Out of stock" : "Low stock alert",
      message:
        r.stock === 0
          ? `${r.title} is out of stock.`
          : `${r.title} has only ${r.stock} unit${r.stock === 1 ? "" : "s"} left.`,
      data: { product_id: r.id, stock: r.stock },
    })),
  );
}
