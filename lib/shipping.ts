/**
 * What the customer pays for delivery.
 *
 * Delivery is billed once per ORDER, never per item, so no single product can decide the
 * charge on its own. Everything that shows or charges shipping - the cart, both checkout
 * steps, and the order written to the database - calls `resolveShipping` so there is exactly
 * one place where the rule lives and no chance of the summary disagreeing with the charge.
 *
 * Three things can waive the fee, checked in this order:
 *
 *   1. The store-wide rate is 0. Set Standard delivery to 0 in Admin > Settings > Shipping
 *      and everything ships free - the simplest way to run a site-wide campaign.
 *   2. Every item in the bag is marked `free_delivery`.
 *   3. The subtotal reaches the free-shipping threshold.
 *
 * On rule 2 - ALL items, not any. Waiving the fee when *any* qualifying item is present reads
 * as more generous but is straightforwardly exploitable: a customer adds the cheapest
 * free-delivery item to a full-price order and never pays delivery again. Requiring the whole
 * bag to qualify is also the only version that can be stated honestly on a product page,
 * because "this item ships free" stays true of the item rather than of some carts containing
 * it. Chosen by the owner on 2026-09-16.
 *
 * On rule 3 - the `freeThreshold` setting has existed, and been settable in the admin, since
 * the settings page was built. It was read into config and then never consulted by any
 * calculation, so a store configured to ship free above Rs. 3,500 charged Rs. 250 on every
 * order regardless. Rule 3 is that field finally doing what its label promises. A threshold of
 * 0 disables it rather than making everything free, which is what an empty field means.
 */

export type ShippingMethod = "standard" | "express";

/** The shipping-relevant part of a cart line. Kept minimal so any cart shape can be passed. */
export interface ShippableItem {
  price: number;
  qty: number;
  free_delivery?: boolean | null;
}

/** The shipping-relevant part of the store settings. */
export interface ShippingRates {
  standard: number;
  express: number;
  freeThreshold: number;
}

/** Why delivery ended up free - drives the wording shown to the customer. */
export type FreeReason = "store-wide" | "all-items" | "threshold" | null;

export interface ShippingResult {
  /** What to charge, in whole rupees. */
  cost: number;
  /** The rate that would have applied with nothing waiving it, for "FREE (was Rs. 250)". */
  baseCost: number;
  isFree: boolean;
  reason: FreeReason;
  /**
   * Rupees still needed to reach the free-shipping threshold, or null when the threshold is
   * off, already met, or irrelevant because delivery is free for another reason. Drives the
   * "Add Rs. 800 more for free delivery" nudge - the entire commercial point of a threshold.
   */
  amountToThreshold: number | null;
}

export function cartSubtotal(items: ShippableItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

/**
 * True when every line in the bag ships free.
 *
 * An empty cart returns false, not true: `[].every(...)` is vacuously true, which would have
 * made the summary announce free delivery on an empty bag.
 */
export function allItemsShipFree(items: ShippableItem[]): boolean {
  return items.length > 0 && items.every((i) => i.free_delivery === true);
}

export function resolveShipping(
  items: ShippableItem[],
  rates: ShippingRates,
  method: ShippingMethod = "standard",
): ShippingResult {
  const baseCost = method === "express" ? rates.express : rates.standard;
  const subtotal = cartSubtotal(items);

  // Express is a service the customer chose and paid for on top; a free-delivery promise
  // covers standard shipping, not an upgrade. Without this, marking one product free_delivery
  // would hand away express delivery too.
  const waivable = method === "standard";

  if (baseCost <= 0) {
    return { cost: 0, baseCost: 0, isFree: true, reason: "store-wide", amountToThreshold: null };
  }

  if (waivable && allItemsShipFree(items)) {
    return { cost: 0, baseCost, isFree: true, reason: "all-items", amountToThreshold: null };
  }

  const thresholdOn = waivable && rates.freeThreshold > 0;

  if (thresholdOn && subtotal >= rates.freeThreshold) {
    return { cost: 0, baseCost, isFree: true, reason: "threshold", amountToThreshold: null };
  }

  return {
    cost: baseCost,
    baseCost,
    isFree: false,
    reason: null,
    amountToThreshold: thresholdOn ? rates.freeThreshold - subtotal : null,
  };
}

/** One-line explanation of a free-delivery result, for the cart and checkout summaries. */
export function freeDeliveryLabel(result: ShippingResult): string | null {
  switch (result.reason) {
    case "store-wide":
      return "Free delivery on every order";
    case "all-items":
      return "Every item in your bag ships free";
    case "threshold":
      return "Free delivery on this order";
    default:
      return null;
  }
}
