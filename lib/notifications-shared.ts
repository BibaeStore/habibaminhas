/*
 * Shared notification constants.
 *
 * Deliberately a plain module, not a "use server" one: `lib/actions/notifications.ts` may
 * only export async functions, and these values are needed by client components too (the
 * topbar badge, the notifications page, the new-order alert).
 *
 * Everything about which notifications "count" flows from here. The stuck-badge bug existed
 * because the badge and the page each had their own idea of what mattered — the badge
 * counted every type while the page hid `order_updated`, so reading could never clear it.
 * One constant, three consumers, no drift.
 */

/**
 * The only notification types the owner wants to be alerted about.
 *
 * - `new_order` — an order has arrived. Created by the `on_new_order` trigger on `orders`.
 * - `low_stock` — an article has run low. Created by emitLowStockNotifications().
 *
 * Not included, on purpose:
 * - `order_updated` — the owner changes statuses themselves, so these were self-inflicted
 *   noise. The trigger that produced them has been dropped; history lives in
 *   `order_activity_log`. Old rows stay in the table and are filtered out by type.
 * - `contact_form` — contact submissions already email the admin from submitContactMessage(),
 *   and the trigger sits on the unused `contact_messages` table, so it has never fired.
 */
export const ALERT_TYPES = ["new_order", "low_stock"] as const;

export type AlertType = (typeof ALERT_TYPES)[number];

export function isAlertType(type: string): type is AlertType {
  return (ALERT_TYPES as readonly string[]).includes(type);
}

/** TanStack Query key for the topbar's unread badge. Invalidate this to update the badge. */
export const NOTIFICATIONS_UNREAD_KEY = ["notifications", "unread"] as const;

/** TanStack Query key for the notifications list. */
export const NOTIFICATIONS_LIST_KEY = ["notifications"] as const;
