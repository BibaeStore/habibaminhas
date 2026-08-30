import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { normalizeTrackingSettings, primaryPixelId } from "@/lib/tracking/config";
import { toMatchKeys, type CustomerMatchInput } from "@/lib/tracking/normalize";

/**
 * Meta Conversions API — events sent from the server, alongside the browser pixel.
 *
 * WHY BOTH
 * --------
 * Browser-only tracking loses whatever the browser loses: ad-blockers, iOS tracking
 * restrictions, a tab closed before the beacon flushes, a flaky mobile connection. On a
 * Pakistani mobile-first audience that is a large and *biased* slice — the people it drops
 * are not a random sample — so Meta optimises against a distorted picture of who buys.
 *
 * DEDUPLICATION IS THE WHOLE TRICK
 * --------------------------------
 * Both halves report the same purchase. Meta collapses them into one only when they arrive
 * with an identical `event_id`, which is why `Purchase` uses the reproducible
 * `purchase-{orderNumber}` on both sides. Get that wrong and every sale is counted twice —
 * strictly worse than not sending server events at all.
 *
 * FAILURE POLICY
 * --------------
 * Nothing here may ever break an order. Every entry point returns a result object instead of
 * throwing, and the callers ignore it. A sale that succeeded but went unreported is a
 * reporting problem; an order that failed because Meta was slow is a lost customer.
 */

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION?.trim() || "v26.0";
const TIMEOUT_MS = 6000;

export type CapiResult =
  | { ok: true; eventsReceived: number }
  | { ok: false; reason: "not_configured" | "no_pixel" | "http_error" | "network"; message: string };

/**
 * The Conversions API needs a token with access to the *pixel*, which is not the same grant as
 * the page/Instagram publishing token the social pipeline uses. A dedicated variable is
 * checked first so the two can be scoped separately; the shared system-user token is accepted
 * as a fallback for the common case where one system user owns both.
 */
function accessToken(): string | undefined {
  return (
    process.env.META_CAPI_ACCESS_TOKEN?.trim() ||
    process.env.META_SYSTEM_USER_TOKEN?.trim() ||
    undefined
  );
}

export function isCapiConfigured(): boolean {
  return Boolean(accessToken());
}

/** Meta requires SHA-256 hex of the normalised value. */
function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/**
 * Hashes every match key. `client_ip_address` and `client_user_agent` are deliberately NOT
 * hashed — Meta expects those two raw, and hashing them silently destroys their matching value.
 */
function toUserData(
  customer: CustomerMatchInput,
  ctx: { ip?: string | null; userAgent?: string | null },
): Record<string, unknown> {
  const keys = toMatchKeys(customer);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(keys)) out[k] = [sha256(v)];
  if (ctx.ip) out.client_ip_address = ctx.ip;
  if (ctx.userAgent) out.client_user_agent = ctx.userAgent;
  return out;
}

/** Pixel ID and the optional Test Events code, read from the admin Marketing page's column. */
async function readPixelConfig(): Promise<{ pixelId: string; testEventCode?: string }> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("settings")
    .select("tracking_settings, seo_settings")
    .eq("id", 1)
    .single();

  const legacy = (data?.seo_settings as Record<string, unknown> | null)?.fb_pixel;
  const tracking = normalizeTrackingSettings(
    data?.tracking_settings,
    typeof legacy === "string" ? legacy : "",
  );
  return {
    pixelId: primaryPixelId(tracking),
    testEventCode: tracking.test_event_code || undefined,
  };
}

export type ServerEvent = {
  eventName: string;
  /** MUST match the browser event's ID for anything the pixel also sends. */
  eventId: string;
  /** Seconds since epoch. Defaults to now. Meta rejects events older than 7 days. */
  eventTime?: number;
  eventSourceUrl?: string;
  /** "website" for something the shopper did; "system_generated" for something we observed. */
  actionSource?: "website" | "system_generated" | "other";
  customer?: CustomerMatchInput;
  customData?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
};

/**
 * Sends one event. Never throws.
 */
export async function sendServerEvent(ev: ServerEvent): Promise<CapiResult> {
  const token = accessToken();
  if (!token) {
    return { ok: false, reason: "not_configured", message: "No Meta access token is configured." };
  }

  let pixelId: string;
  let testEventCode: string | undefined;
  try {
    ({ pixelId, testEventCode } = await readPixelConfig());
  } catch (e) {
    return { ok: false, reason: "network", message: e instanceof Error ? e.message : "Could not read the pixel ID." };
  }
  if (!pixelId) {
    return { ok: false, reason: "no_pixel", message: "No enabled Meta Pixel is configured." };
  }

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: ev.eventName,
        event_time: ev.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: ev.eventId,
        action_source: ev.actionSource ?? "website",
        ...(ev.eventSourceUrl ? { event_source_url: ev.eventSourceUrl } : {}),
        user_data: toUserData(ev.customer ?? {}, { ip: ev.ip, userAgent: ev.userAgent }),
        ...(ev.customData ? { custom_data: ev.customData } : {}),
      },
    ],
  };
  // Routes the event to Meta's Test Events screen instead of live reporting, when set.
  if (testEventCode) body.test_event_code = testEventCode;

  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    const json = (await res.json().catch(() => ({}))) as {
      events_received?: number;
      error?: { message?: string };
    };

    if (!res.ok) {
      return {
        ok: false,
        reason: "http_error",
        message: json.error?.message ?? `Meta returned HTTP ${res.status}.`,
      };
    }
    return { ok: true, eventsReceived: json.events_received ?? 1 };
  } catch (e) {
    const message =
      e instanceof Error && e.name === "TimeoutError"
        ? `Meta did not respond within ${TIMEOUT_MS / 1000}s.`
        : e instanceof Error
          ? e.message
          : "The Conversions API could not be reached.";
    return { ok: false, reason: "network", message };
  }
}

/** The event ID both halves of a purchase must agree on. Keep in step with lib/analytics.ts. */
export function purchaseEventId(orderNumber: string): string {
  return `purchase-${orderNumber}`;
}
