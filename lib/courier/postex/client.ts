/**
 * PostEx Merchant API client (server-only).
 *
 * Phase 0 scope: read-only endpoints used for connectivity + reference data.
 * Booking / tracking / payment / cancel methods are added in their own phases
 * so nothing that writes to PostEx exists until we deliberately build it.
 *
 * Auth: a single `token` header on every request (see docs/PostEx guide §3).
 */
import { getPostexConfig } from "./config";
import type {
  PostexCreateOrderRequest,
  PostexCreateOrderResult,
  PostexEnvelope,
  PostexMerchantAddress,
  PostexOperationalCity,
  PostexOrderType,
  PostexBulkTrackingEntry,
  PostexPaymentStatus,
  PostexTrackingResult,
} from "./types";

export class PostexError extends Error {
  readonly httpStatus?: number;
  readonly statusCode?: string;
  readonly body?: unknown;
  constructor(message: string, opts?: { httpStatus?: number; statusCode?: string; body?: unknown }) {
    super(message);
    this.name = "PostexError";
    this.httpStatus = opts?.httpStatus;
    this.statusCode = opts?.statusCode;
    this.body = opts?.body;
  }
}

/** Coerce PostEx's occasional string-booleans ("true"/"false") to real booleans. */
export function asBool(v: boolean | string | undefined): boolean {
  return v === true || v === "true";
}

interface RequestOpts {
  method?: "GET" | "POST" | "PUT";
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  timeoutMs?: number;
}

/**
 * Low-level request. Throws PostexError on transport failure, non-2xx HTTP,
 * or a non-200 PostEx statusCode. Returns the parsed `dist` payload.
 */
async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const cfg = getPostexConfig();
  if (!cfg) {
    throw new PostexError("PostEx is not configured (POSTEX_API_TOKEN missing).");
  }

  const url = new URL(path.startsWith("http") ? path : `${cfg.baseUrl}${path}`);
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30_000);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: opts.method ?? "GET",
      headers: {
        token: cfg.token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    throw new PostexError(`PostEx request failed: ${(err as Error).message}`, {});
  } finally {
    clearTimeout(timeout);
  }

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new PostexError(`PostEx returned non-JSON (HTTP ${res.status})`, {
      httpStatus: res.status,
      body: text.slice(0, 500),
    });
  }

  if (!res.ok) {
    const msg =
      (json as { error?: string; statusMessage?: string })?.statusMessage ??
      (json as { error?: string })?.error ??
      `HTTP ${res.status}`;
    throw new PostexError(`PostEx error: ${msg}`, { httpStatus: res.status, body: json });
  }

  const env = json as PostexEnvelope<T>;
  // Reference/list endpoints return a statusCode string; enforce success when present.
  if (env.statusCode && env.statusCode !== "200") {
    throw new PostexError(`PostEx error: ${env.statusMessage ?? env.statusCode}`, {
      httpStatus: res.status,
      statusCode: env.statusCode,
      body: json,
    });
  }

  return env.dist as T;
}

/* ------------------------------------------------------------------ *
 * Phase 0 — read-only endpoints
 * ------------------------------------------------------------------ */

/**
 * 3.1 Operational Cities. We fetch the full list (the `operationalCityType`
 * query param rejected "Delivery" in testing) and filter client-side, which
 * is more robust than depending on their enum values.
 */
export async function getOperationalCities(): Promise<PostexOperationalCity[]> {
  return request<PostexOperationalCity[]>("/order/v2/get-operational-city");
}

/** Delivery-eligible cities only (isDeliveryCity truthy). */
export async function getDeliveryCities(): Promise<PostexOperationalCity[]> {
  const all = await getOperationalCities();
  return all.filter((c) => asBool(c.isDeliveryCity));
}

/** 3.2 Pickup Address(es) — our warehouse addresses + their addressCode(s). */
export async function getMerchantAddresses(cityName?: string): Promise<PostexMerchantAddress[]> {
  return request<PostexMerchantAddress[]>("/order/v1/get-merchant-address", {
    query: { cityName },
  });
}

/** 3.4 Order Types — ["Normal","Reversed","Replacement","Overland"]. */
export async function getOrderTypes(): Promise<PostexOrderType[]> {
  return request<PostexOrderType[]>("/order/v1/get-order-types");
}

/* ------------------------------------------------------------------ *
 * Phase 3 — booking, cancel, tracking, airway bill
 * ------------------------------------------------------------------ */

/** 3.5 Create Order — books a shipment; returns the CX-… tracking number. */
export async function createPostexOrder(
  payload: PostexCreateOrderRequest,
): Promise<PostexCreateOrderResult> {
  return request<PostexCreateOrderResult>("/order/v3/create-order", {
    method: "POST",
    body: payload,
  });
}

/** 3.13 Cancel Order by tracking number. */
export async function cancelPostexOrder(trackingNumber: string): Promise<void> {
  await request<unknown>("/order/v1/cancel-order", {
    method: "PUT",
    body: { trackingNumber },
  });
}

/** 3.8 Track a single order (includes transactionStatusHistory). */
export async function trackPostexOrder(trackingNumber: string): Promise<PostexTrackingResult> {
  return request<PostexTrackingResult>(
    `/order/v1/track-order/${encodeURIComponent(trackingNumber)}`,
  );
}

/**
 * 3.9 Bulk Order Tracking. The guide shows a JSON body, but the live API
 * requires a GET with a comma-separated `TrackingNumbers` query param
 * (verified 2026-07-09). Returns one entry per requested number.
 */
export async function trackPostexOrdersBulk(
  trackingNumbers: string[],
): Promise<PostexBulkTrackingEntry[]> {
  if (trackingNumbers.length === 0) return [];
  return request<PostexBulkTrackingEntry[]>("/order/v1/track-bulk-order", {
    query: { TrackingNumbers: trackingNumbers.join(",") },
  });
}

/**
 * 3.7 Generate Load Sheet — the rider pickup manifest PDF for a batch of
 * consignments. Returns base64. Note PostEx rejects cancelled/ineligible
 * tracking numbers with "INVALID TRACKING NUMBER(S)".
 */
export async function fetchPostexLoadSheetBase64(
  trackingNumbers: string[],
  pickupAddress?: string,
): Promise<string> {
  const cfg = getPostexConfig();
  if (!cfg) throw new PostexError("PostEx is not configured (POSTEX_API_TOKEN missing).");
  if (trackingNumbers.length === 0) throw new PostexError("No tracking numbers provided.");

  const res = await fetch(`${cfg.baseUrl}/order/v2/generate-load-sheet`, {
    method: "POST",
    headers: { token: cfg.token, "Content-Type": "application/json", Accept: "application/pdf" },
    body: JSON.stringify({ trackingNumbers, ...(pickupAddress ? { pickupAddress } : {}) }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try {
      msg = (JSON.parse(t) as { statusMessage?: string }).statusMessage ?? msg;
    } catch {
      /* non-JSON error body */
    }
    throw new PostexError(`PostEx load sheet error: ${msg}`, { httpStatus: res.status, body: t.slice(0, 300) });
  }
  return Buffer.from(await res.arrayBuffer()).toString("base64");
}

/** 3.14 COD payment/settlement status for a tracking number. */
export async function getPostexPaymentStatus(trackingNumber: string): Promise<PostexPaymentStatus> {
  return request<PostexPaymentStatus>(
    `/order/v1/payment-status/${encodeURIComponent(trackingNumber)}`,
  );
}

/**
 * 3.10 Airway Bill PDF (max 10 tracking numbers). Non-JSON endpoint — we fetch
 * the raw PDF and return it base64-encoded so a server action can hand it to
 * the browser for download.
 */
export async function fetchPostexAirwayBillBase64(trackingNumbers: string[]): Promise<string> {
  const cfg = getPostexConfig();
  if (!cfg) throw new PostexError("PostEx is not configured (POSTEX_API_TOKEN missing).");
  if (trackingNumbers.length === 0) throw new PostexError("No tracking numbers provided.");
  if (trackingNumbers.length > 10) throw new PostexError("Airway Bill supports at most 10 tracking numbers.");

  // NOTE: the v4.1.9 guide documents this as `getinvoice`, but the live API
  // only answers on the hyphenated `get-invoice` (verified 2026-07-09).
  const url = `${cfg.baseUrl}/order/v1/get-invoice?trackingNumbers=${trackingNumbers
    .map(encodeURIComponent)
    .join(",")}`;
  const res = await fetch(url, { headers: { token: cfg.token, Accept: "application/pdf" } });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new PostexError(`PostEx airway bill error: HTTP ${res.status}`, {
      httpStatus: res.status,
      body: t.slice(0, 300),
    });
  }
  return Buffer.from(await res.arrayBuffer()).toString("base64");
}

/** Exposed for internal reuse (e.g. status sync in later phases). */
export const __internal = { request };
