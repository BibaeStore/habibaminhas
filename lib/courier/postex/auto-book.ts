/**
 * Automatic PostEx booking for new COD orders — the owner asked not to book by hand.
 *
 * Runs from `createOrder` inside `after()`, i.e. once the customer already has their
 * confirmation. Nothing here may throw: a PostEx outage must never cost a sale. When a step
 * fails the order simply stays as it is, and a notification tells the admin to finish it
 * by hand with the existing buttons.
 *
 * Two PostEx steps, both done here:
 *   1. create-order     → the shipment exists, PostEx status "Unbooked"
 *   2. generate-load-sheet → PostEx status "Booked", i.e. handed over for pickup
 * Verified 2026-09-23 on ORD-2026-0051: step 2 alone moved it from Unbooked to Booked.
 *
 * COD only. Prepaid orders are marked "paid" at checkout before any payment is confirmed
 * (docs/payments-fulfilment-2026/), so booking them would tell PostEx to collect Rs. 0 on
 * an order nobody has paid for.
 *
 * Deliberately NOT a "use server" module: everything exported from one of those is a public
 * endpoint, and this must only ever be called from our own server code.
 */
import { createAdminClient } from "@/lib/supabase/server";
import { isPostexEnabled } from "@/lib/courier/postex/config";
import { fetchPostexLoadSheetBase64 } from "@/lib/courier/postex/client";
import { bookPostexShipment } from "@/lib/actions/postex";

const ACTOR = "auto (checkout)";

/** Kill switch: set POSTEX_AUTO_BOOK=false to go back to booking by hand. */
export function isPostexAutoBookEnabled(): boolean {
  return isPostexEnabled() && process.env.POSTEX_AUTO_BOOK !== "false";
}

export async function autoBookPostex(orderId: string): Promise<void> {
  if (!isPostexAutoBookEnabled()) return;
  const sb = createAdminClient();

  const notifyFailure = async (orderNumber: string, step: string, reason: string) => {
    console.error(`[PostEx auto-book] ${orderNumber}: ${step} — ${reason}`);
    try {
      await sb.from("notifications").insert({
        type: "order_updated",
        title: "PostEx auto-booking needs you",
        message: `${orderNumber}: ${step}. ${reason} Open the order and finish it by hand.`,
        data: { order_id: orderId, order_number: orderNumber },
      });
    } catch {
      // a missing notification is not worth failing over
    }
  };

  try {
    const { data: order } = await sb
      .from("orders")
      .select("order_number, payment_method, postex_tracking_number")
      .eq("id", orderId)
      .single();
    if (!order || order.payment_method !== "COD" || order.postex_tracking_number) return;

    // Step 1 — create the shipment.
    let failure: string | null = null;
    try {
      const booked = await bookPostexShipment(orderId, { adminEmail: ACTOR });
      if (!booked.ok) failure = booked.message;
    } catch (e) {
      // bookPostexShipment writes the tracking number before it revalidates, so a throw
      // here can still mean the shipment exists — the re-read below decides.
      failure = (e as Error).message;
    }

    const { data: fresh } = await sb
      .from("orders")
      .select("postex_tracking_number")
      .eq("id", orderId)
      .single();
    const tn = fresh?.postex_tracking_number;
    if (!tn) {
      await notifyFailure(order.order_number, "Could not book with PostEx", failure ?? "Unknown error.");
      return;
    }

    // Step 2 — request pickup. Only the side effect matters here; the PDF is not stored.
    try {
      await fetchPostexLoadSheetBase64([tn]);
      await sb
        .from("orders")
        .update({ postex_status: "Booked", postex_synced_at: new Date().toISOString() })
        .eq("id", orderId);
      await sb.from("order_activity_log").insert({
        order_id: orderId,
        action_type: "postex_pickup_requested",
        old_value: null,
        new_value: { trackingNumber: tn },
        admin_email: ACTOR,
      });
    } catch (e) {
      await notifyFailure(
        order.order_number,
        `Booked (${tn}) but the pickup request failed`,
        (e as Error).message,
      );
    }
  } catch (e) {
    console.error("[PostEx auto-book] unexpected:", e);
  }
}
