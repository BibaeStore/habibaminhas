/**
 * Map PostEx status labels onto our internal order lifecycle.
 *
 * Our statuses: pending → processing → dispatched → delivered, plus
 * `returned` (NEW for PostEx) and `cancelled`. We also keep PostEx's raw
 * label/history separately so admins see the granular truth.
 */
export type InternalStatus =
  | "pending"
  | "processing"
  | "dispatched"
  | "delivered"
  | "returned"
  | "cancelled";

// Keys are lowercased PostEx labels (from Order Status API + create-order).
const STATUS_MAP: Record<string, InternalStatus> = {
  unbooked: "processing",
  booked: "processing",
  "picked by postex": "dispatched",
  "en-route to postex warehouse": "dispatched",
  "postex warehouse": "dispatched",
  "out for delivery": "dispatched",
  "package on root": "dispatched",
  attempted: "dispatched",
  "delivery under review": "dispatched",
  delivered: "delivered",
  returned: "returned",
  "out for return": "returned",
  expired: "returned",
  "un-assigned by me": "cancelled",
};

/** Returns our internal status for a PostEx label, or null if unrecognized. */
export function mapPostexStatus(label: string | null | undefined): InternalStatus | null {
  if (!label) return null;
  return STATUS_MAP[label.trim().toLowerCase()] ?? null;
}
