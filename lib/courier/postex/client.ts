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
  PostexEnvelope,
  PostexMerchantAddress,
  PostexOperationalCity,
  PostexOrderType,
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

/** Exposed for later phases (booking/tracking) that live in their own modules. */
export const __internal = { request };
