"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export async function getOrders(status?: string) {
  const sb = createAdminClient();
  let q = sb
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (status && status !== "All") q = q.eq("status", status.toLowerCase());

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}

export async function getOrderById(id: string) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getOrderByNumber(orderNumber: string) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createOrder(
  order: Omit<TablesInsert<"orders">, "order_number">,
  items: Omit<TablesInsert<"order_items">, "order_id">[]
) {
  const sb = createAdminClient();

  // Generate order number manually
  const year = new Date().getFullYear();
  const { count } = await sb.from("orders").select("*", { count: "exact", head: true });
  const num = String((count ?? 0) + 1).padStart(4, "0");
  const order_number = `ORD-${year}-${num}`;

  const { data: newOrder, error: orderError } = await sb
    .from("orders")
    .insert({ ...order, order_number })
    .select()
    .single();
  if (orderError) throw new Error(orderError.message);

  const { error: itemsError } = await sb
    .from("order_items")
    .insert(items.map((i) => ({ ...i, order_id: newOrder.id })));
  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/admin/orders");
  return newOrder;
}

export async function updateOrderStatus(id: string, status: string) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  return data;
}

export async function updateOrder(id: string, payload: TablesUpdate<"orders">) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("orders")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  return data;
}

export async function getOrderStats() {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("orders")
    .select("status, total, created_at");
  if (error) throw new Error(error.message);

  type Row = { status: string; total: number; created_at: string };
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = (data as Row[]).filter((o) => o.created_at.startsWith(today));
  return {
    total: data.length,
    todayCount: todayOrders.length,
    todayRevenue: todayOrders.reduce((s: number, o: Row) => s + o.total, 0),
    totalRevenue: data.reduce((s: number, o: Row) => s + o.total, 0),
    byStatus: {
      pending:    data.filter((o: Row) => o.status === "pending").length,
      processing: data.filter((o: Row) => o.status === "processing").length,
      dispatched: data.filter((o: Row) => o.status === "dispatched").length,
      delivered:  data.filter((o: Row) => o.status === "delivered").length,
      cancelled:  data.filter((o: Row) => o.status === "cancelled").length,
    },
  };
}
