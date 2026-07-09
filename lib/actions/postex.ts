"use server";

/**
 * Server actions that bridge our admin dashboard to the PostEx courier module.
 * All PostEx writes live here (nothing in the customer checkout path calls this).
 * Every action is a no-op when PostEx is not configured (the env kill-switch).
 */
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { Json, TablesUpdate } from "@/lib/supabase/types";
import { getPostexConfig, isPostexEnabled } from "@/lib/courier/postex/config";
import {
  cancelPostexOrder,
  createPostexOrder,
  fetchPostexAirwayBillBase64,
  getDeliveryCities,
  getPostexPaymentStatus,
  trackPostexOrder,
} from "@/lib/courier/postex/client";
import { matchOperationalCity } from "@/lib/courier/postex/city";
import { mapPostexStatus } from "@/lib/courier/postex/status";
import { buildCreateOrderPayload } from "@/lib/courier/postex/payload";

type Sb = ReturnType<typeof createAdminClient>;

async function logActivity(
  sb: Sb,
  orderId: string,
  actionType: string,
  oldValue: unknown,
  newValue: unknown,
  adminEmail?: string,
) {
  try {
    await sb.from("order_activity_log").insert({
      order_id: orderId,
      action_type: actionType,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      old_value: oldValue as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new_value: newValue as any,
      admin_email: adminEmail ?? null,
    });
  } catch {
    // activity logging is non-critical — never block the operation
  }
}

/** Client-safe check so admin UI can show/hide PostEx controls. */
export async function postexEnabled(): Promise<boolean> {
  return isPostexEnabled();
}

export type BookPostexResult =
  | { ok: true; trackingNumber: string; codAmount: number; cityName: string }
  | {
      ok: false;
      reason: "disabled" | "already_booked" | "invalid_phone" | "city_unmatched" | "empty_address" | "error";
      message: string;
      suggestions?: string[];
    };

/**
 * Book a shipment with PostEx for an order. Manual, admin-triggered.
 * Idempotent: refuses if the order already has a PostEx tracking number.
 * On a city mismatch it returns suggestions so the admin can retry with
 * `cityNameOverride` instead of failing blindly.
 */
export async function bookPostexShipment(
  orderId: string,
  opts: { cityNameOverride?: string; adminEmail?: string } = {},
): Promise<BookPostexResult> {
  if (!isPostexEnabled()) return { ok: false, reason: "disabled", message: "PostEx is not configured." };

  const sb = createAdminClient();
  const { data: order, error } = await sb
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();
  if (error || !order) return { ok: false, reason: "error", message: error?.message ?? "Order not found." };

  if (order.postex_tracking_number) {
    return { ok: false, reason: "already_booked", message: `Already booked with PostEx: ${order.postex_tracking_number}` };
  }

  const addr =
    order.address && typeof order.address === "object" && !Array.isArray(order.address)
      ? (order.address as Record<string, string>)
      : {};

  const cfg = getPostexConfig()!;

  // Validate city against PostEx operational list.
  let cities;
  try {
    cities = await getDeliveryCities();
  } catch (e) {
    return { ok: false, reason: "error", message: `Could not load PostEx cities: ${(e as Error).message}` };
  }
  const desiredCity = (opts.cityNameOverride?.trim() || addr.city || "").trim();
  const cm = matchOperationalCity(desiredCity, cities);
  if (!cm.matched || !cm.cityName) {
    return {
      ok: false,
      reason: "city_unmatched",
      message: `"${desiredCity || "(no city)"}" is not a PostEx delivery city. Choose the correct city and retry.`,
      suggestions: cm.suggestions,
    };
  }

  const { payload, codAmount, warnings } = buildCreateOrderPayload({
    order,
    items: order.order_items ?? [],
    cityName: cm.cityName,
    pickupAddressCode: cfg.pickupAddressCode,
  });

  if (!payload.deliveryAddress) return { ok: false, reason: "empty_address", message: "Delivery street address is empty." };
  if (!payload.customerPhone || warnings.some((w) => w.includes("phone"))) {
    return {
      ok: false,
      reason: "invalid_phone",
      message: `Customer phone "${order.customer_phone}" is not a valid PK mobile (03xxxxxxxxx).`,
    };
  }

  let result;
  try {
    result = await createPostexOrder(payload);
  } catch (e) {
    return { ok: false, reason: "error", message: (e as Error).message };
  }

  const tn = result.trackingNumber;
  const now = new Date().toISOString();
  const patch: TablesUpdate<"orders"> = {
    postex_tracking_number: tn,
    postex_status: result.orderStatus || "UnBooked",
    postex_cod_amount: codAmount,
    postex_booked_at: now,
    postex_synced_at: now,
    // Mirror into existing fields so the customer /track page + emails keep working unchanged.
    courier: "PostEx",
    tracking_number: tn,
    // Advance a fresh order to "processing" (booked, awaiting pickup).
    ...(order.status === "pending" ? { status: "processing" } : {}),
  };
  await sb.from("orders").update(patch).eq("id", orderId);
  await logActivity(sb, orderId, "postex_booked", null, { trackingNumber: tn, city: cm.cityName, codAmount }, opts.adminEmail);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, trackingNumber: tn, codAmount, cityName: cm.cityName };
}

/** Cancel a PostEx booking and mark the order cancelled. */
export async function cancelPostexShipment(
  orderId: string,
  opts: { adminEmail?: string } = {},
): Promise<{ ok: boolean; message?: string }> {
  if (!isPostexEnabled()) return { ok: false, message: "PostEx is not configured." };
  const sb = createAdminClient();
  const { data: order } = await sb.from("orders").select("*").eq("id", orderId).single();
  if (!order?.postex_tracking_number) return { ok: false, message: "This order has no PostEx booking to cancel." };

  try {
    await cancelPostexOrder(order.postex_tracking_number);
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }

  await sb
    .from("orders")
    .update({ postex_status: "Cancelled", status: "cancelled", postex_synced_at: new Date().toISOString() })
    .eq("id", orderId);
  await logActivity(sb, orderId, "postex_cancelled", { trackingNumber: order.postex_tracking_number }, { status: "cancelled" }, opts.adminEmail);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

/**
 * Pull the latest status + COD settlement from PostEx and reflect it on the
 * order. Used by the manual "Sync" button and (later) the scheduled poll.
 */
export async function syncPostexStatus(
  orderId: string,
  opts: { adminEmail?: string } = {},
): Promise<{ ok: boolean; message?: string; status?: string; postexStatus?: string }> {
  if (!isPostexEnabled()) return { ok: false, message: "PostEx is not configured." };
  const sb = createAdminClient();
  const { data: order } = await sb.from("orders").select("*").eq("id", orderId).single();
  if (!order?.postex_tracking_number) return { ok: false, message: "This order has no PostEx booking to sync." };

  let t;
  try {
    t = await trackPostexOrder(order.postex_tracking_number);
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }

  const history = t.transactionStatusHistory ?? [];
  const lastHist = history.length ? history[history.length - 1]?.transactionStatusMessage : undefined;
  const rawStatus = t.transactionStatus || lastHist || order.postex_status || "";
  const internal = mapPostexStatus(rawStatus);

  const patch: TablesUpdate<"orders"> = {
    postex_status: rawStatus || order.postex_status,
    postex_status_history: (history as unknown as Json) ?? null,
    postex_synced_at: new Date().toISOString(),
  };
  const statusChanged = Boolean(internal && internal !== order.status);
  if (statusChanged) patch.status = internal!;
  await sb.from("orders").update(patch).eq("id", orderId);

  // Best-effort COD settlement pull (may 404 until PostEx settles).
  try {
    const pay = await getPostexPaymentStatus(order.postex_tracking_number);
    await sb
      .from("orders")
      .update({
        postex_cod_settled: Boolean(pay.settle),
        postex_settlement_date: pay.settlementDate || null,
        postex_cpr: pay.cprNumber_1 || null,
      })
      .eq("id", orderId);
  } catch {
    // settlement not available yet — ignore
  }

  if (statusChanged) {
    await logActivity(sb, orderId, "postex_status_sync", { status: order.status }, { status: internal, postex: rawStatus }, opts.adminEmail);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, status: internal ?? order.status, postexStatus: rawStatus };
}

/** Fetch the PostEx Airway Bill (shipping label) PDF for an order, base64-encoded. */
export async function getPostexAirwayBill(
  orderId: string,
): Promise<{ ok: boolean; base64?: string; filename?: string; message?: string }> {
  if (!isPostexEnabled()) return { ok: false, message: "PostEx is not configured." };
  const sb = createAdminClient();
  const { data: order } = await sb
    .from("orders")
    .select("postex_tracking_number, order_number")
    .eq("id", orderId)
    .single();
  if (!order?.postex_tracking_number) return { ok: false, message: "No PostEx booking on this order." };

  try {
    const base64 = await fetchPostexAirwayBillBase64([order.postex_tracking_number]);
    return { ok: true, base64, filename: `PostEx-AWB-${order.order_number}.pdf` };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
