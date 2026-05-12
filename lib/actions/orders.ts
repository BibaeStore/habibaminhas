"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";
import { decrementStock, emitLowStockNotifications } from "@/lib/actions/inventory";
import { sendOrderEmails } from "@/lib/email";

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

const PAYMENT_METHOD_MAP: Record<string, string> = {
  cod:        "COD",
  jazzcash:   "JazzCash",
  easypaisa:  "Easypaisa",
  card:       "Bank Transfer",
  "bank transfer": "Bank Transfer",
};

export async function createOrder(
  order: Omit<TablesInsert<"orders">, "order_number">,
  items: Omit<TablesInsert<"order_items">, "order_id">[]
) {
  const sb = createAdminClient();

  const payment_method =
    PAYMENT_METHOD_MAP[(order.payment_method ?? "").toLowerCase()] ??
    order.payment_method;

  // order_number is assigned by the orders_set_number BEFORE INSERT trigger
  const { data: newOrder, error: orderError } = await sb
    .from("orders")
    .insert({ ...order, order_number: "", payment_method })
    .select()
    .single();
  if (orderError) return { order: null, error: orderError.message };

  const { error: itemsError } = await sb
    .from("order_items")
    .insert(items.map((i) => ({ ...i, order_id: newOrder.id })));
  if (itemsError) return { order: null, error: itemsError.message };

  // Decrement stock and emit low-stock notifications
  const crossed = await decrementStock(
    items.map((i) => ({ product_id: i.product_id ?? null, quantity: i.quantity })),
  );
  await emitLowStockNotifications(crossed);

  // Optional: link Supabase Auth user (non-critical, guest checkout works without it)
  let authUserId: string | null = null;
  try {
    const ssr = await createClient();
    const { data: userData } = await ssr.auth.getUser();
    authUserId = userData.user?.id ?? null;
  } catch {
    // cookie context unavailable in some environments — safe to ignore
  }

  // Upsert customer record
  // Use maybeSingle() — returns null (not an error) when no rows found
  const email = order.customer_email;
  const { data: existing } = await sb
    .from("customers")
    .select("id, total_orders, total_spent, auth_user_id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    await sb.from("customers").update({
      total_orders: existing.total_orders + 1,
      total_spent:  existing.total_spent + (order.total ?? 0),
      tier: existing.total_spent + (order.total ?? 0) >= 50000 ? "VIP" : existing.total_orders + 1 >= 3 ? "Regular" : "New",
      phone: order.customer_phone ?? undefined,
      auth_user_id: existing.auth_user_id ?? authUserId,
    }).eq("id", existing.id);
  } else {
    const addressCity = typeof order.address === "object" && !Array.isArray(order.address)
      ? (order.address as Record<string, string>)?.city ?? null
      : null;
    await sb.from("customers").insert({
      name:          order.customer_name,
      email,
      phone:         order.customer_phone ?? null,
      city:          addressCity,
      total_orders:  1,
      total_spent:   order.total ?? 0,
      tier:          "New",
      auth_user_id:  authUserId,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/customers");

  // Send confirmation + invoice emails (fire-and-forget — never block the order)
  const orderDate = new Date(newOrder.created_at).toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric",
  });
  const addr = typeof order.address === "object" && !Array.isArray(order.address)
    ? (order.address as Record<string, string>)
    : {} as Record<string, string>;

  sendOrderEmails({
    orderNumber:   newOrder.order_number,
    orderDate,
    customerName:  order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    address: {
      street:     addr.street     ?? "",
      apartment:  addr.apartment,
      city:       addr.city       ?? "",
      province:   addr.province   ?? "",
      postalCode: addr.postalCode,
    },
    items: items.map((i) => ({
      title:      i.product_title,
      size:       i.size ?? null,
      sku:        i.sku  ?? null,
      quantity:   i.quantity,
      unitPrice:  i.unit_price,
      totalPrice: i.total_price,
    })),
    subtotal:      order.subtotal ?? 0,
    shipping:      order.shipping ?? 0,
    total:         order.total    ?? 0,
    paymentMethod: payment_method ?? "COD",
    status:        order.status   ?? "pending",
  }).catch((e) => console.error("[Email] Failed to send order emails:", e));

  return { order: newOrder, error: null };
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

export async function getOrdersByEmail(email: string) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("orders")
    .select("*, order_items(*)")
    .eq("customer_email", email)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Returns orders for the currently authenticated customer. Uses the SSR
 *  (cookie) client so Supabase RLS gates rows to the caller's own orders. */
export async function getMyOrders() {
  const sb = await createClient();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) return [];
  const { data, error } = await sb
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

/** Returns a single order BY order_number, scoped to the authenticated user
 *  by RLS. Returns null if the order does not belong to the caller. */
export async function getMyOrderByNumber(orderNumber: string) {
  const sb = await createClient();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) return null;
  const { data, error } = await sb
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error || !data) return null;
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
