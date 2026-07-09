/**
 * PostEx Merchant API v4.1.9 — response/request types.
 * Guide: docs/PostEx/PostEx-COD_API_Integration_Guide_V4.1.9.pdf
 * Plan:  docs/PostEx/INTEGRATION-PLAN.md
 *
 * Every PostEx response is wrapped in this envelope. `dist` is the payload
 * (an object for single results, an array for lists). Note: PostEx sometimes
 * returns booleans as the strings "true"/"false" — normalize at the edge.
 */
export interface PostexEnvelope<T> {
  statusCode: string; // "200" / "400" (string, not number)
  statusMessage: string;
  dist: T;
}

/** 3.1 Operational Cities API */
export interface PostexOperationalCity {
  operationalCityName: string;
  countryName: string;
  isPickupCity: boolean | string;
  isDeliveryCity: boolean | string;
}

/** 3.2 Pickup Address API (shape confirmed live 2026-07-09) */
export interface PostexMerchantAddress {
  merchantAddressId: number;
  address: string;
  phone1: string;
  phone2: string;
  contactPersonName: string;
  merchantId: number;
  cityId: number;
  cityName: string;
  addressCode: string;
  addressType: string;
}

/** 3.4 Order Types API — dist is a string[] e.g. ["Normal","Reversed","Replacement","Overland"] */
export type PostexOrderType = string;

/** 3.5 Order Creation API — response */
export interface PostexCreateOrderResult {
  trackingNumber: string; // "CX-XXXXXXXXXXX"
  orderStatus: string; // e.g. "UnBooked"
  orderDate: string; // "yyyy-mm-dd hh:mm:ss"
}

/** A single leg of the delivery journey (3.8 tracking history) */
export interface PostexStatusHistoryEntry {
  transactionStatusMessage: string; // "At Merchant's Warehouse", "Delivered", ...
  transactionStatusMessageCode: string; // "0001".."0013"
}

/** 3.8 Order Tracking API — response payload */
export interface PostexTrackingResult {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  invoicePayment: number;
  orderDetail?: string;
  orderRefNumber: string;
  trackingNumber: string;
  transactionDate: string;
  transactionStatus?: string; // current status label
  merchantName: string;
  cityName: string;
  transactionNotes?: string;
  transactionStatusHistory?: PostexStatusHistoryEntry[];
  [key: string]: unknown; // tolerate the many optional money fields
}

/** 3.14 Payment Status API — response payload */
export interface PostexPaymentStatus {
  orderRefNumber: string;
  trackingNumber: string;
  settle: boolean;
  settlementDate?: string;
  upfrontPaymentDate?: string;
  cprNumber_1?: string;
  reservePaymentDate?: string;
  cprNumber_2?: string;
}
