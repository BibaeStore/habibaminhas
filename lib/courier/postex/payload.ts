/**
 * Build a PostEx create-order request from one of our orders + its items.
 * Pure & side-effect free so it is easy to unit test. City must already be a
 * validated PostEx operational city (see city.ts).
 */
import { normalizePakPhone } from "./phone";
import type { PostexCreateOrderRequest } from "./types";

export interface OrderForBooking {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  payment_method: string;
  payment_status: string;
  address: unknown; // jsonb blob
}

export interface ItemForBooking {
  product_title: string;
  sku: string | null;
  size: string | null;
  quantity: number;
}

function parseAddr(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, string>;
}

/** COD unless a prepaid payment has actually been confirmed as paid. */
export function isCodOrder(o: { payment_method: string; payment_status: string }): boolean {
  if ((o.payment_method ?? "").toUpperCase() === "COD") return true;
  return (o.payment_status ?? "").toLowerCase() !== "paid";
}

export function buildCreateOrderPayload(args: {
  order: OrderForBooking;
  items: ItemForBooking[];
  cityName: string;
  pickupAddressCode?: string;
}): { payload: PostexCreateOrderRequest; codAmount: number; warnings: string[] } {
  const { order, items, cityName, pickupAddressCode } = args;
  const warnings: string[] = [];

  const addr = parseAddr(order.address);
  const deliveryAddress = [addr.street, addr.apartment]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(", ");
  if (!deliveryAddress) warnings.push("Delivery address is empty.");

  const pieces = items.reduce((s, i) => s + (i.quantity ?? 0), 0) || 1;
  const cod = isCodOrder(order);
  const codAmount = cod ? order.total : 0;

  const phone = normalizePakPhone(order.customer_phone);
  if (!phone) warnings.push("Customer phone is not a valid PK mobile number.");

  const orderDetail = items
    .map((i) => `${i.product_title}${i.size ? ` (${i.size})` : ""} x${i.quantity}${i.sku ? ` [${i.sku}]` : ""}`)
    .join("; ")
    .slice(0, 250);

  const payload: PostexCreateOrderRequest = {
    orderRefNumber: order.order_number,
    invoicePayment: String(codAmount),
    orderDetail,
    customerName: order.customer_name,
    customerPhone: phone ?? order.customer_phone,
    deliveryAddress,
    cityName,
    invoiceDivision: 1,
    items: pieces,
    orderType: "Normal",
    transactionNotes: addr.province ? `Province: ${addr.province}` : undefined,
    ...(pickupAddressCode ? { pickupAddressCode } : {}),
  };

  return { payload, codAmount, warnings };
}
