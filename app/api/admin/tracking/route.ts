import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/actions/auth";
import {
  normalizeTrackingSettings,
  activePixels,
  primaryPixelId,
  isValidPixelId,
  type MetaPixel,
  type TrackingSettings,
} from "@/lib/tracking/config";
import { META_EVENT_MAP, eventMapSummary } from "@/lib/tracking/event-map";
import { isCapiConfigured } from "@/lib/tracking/capi";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://habibaminhas.com";
const VERIFY_TIMEOUT_MS = 8000;

/**
 * `/api/admin/**` is NOT covered by the middleware admin gate — that gate matches paths
 * starting with `/admin`, and these start with `/api`. Every handler here must therefore
 * check the session itself. Do not remove.
 */
async function requireAdmin() {
  const admin = await getAdminSession();
  return admin ? null : NextResponse.json({ error: "Not authorised." }, { status: 401 });
}

export type CapiStatus = {
  /** A Meta access token is present in the environment. */
  configured: boolean;
  /** When the server last successfully reported a sale, and a delivery. */
  lastPurchaseAt: string | null;
  lastDeliveredAt: string | null;
};

/**
 * Read from the send-markers on `orders` rather than from a counter, so this reflects what
 * Meta actually accepted rather than what we attempted.
 */
async function readCapiStatus(): Promise<CapiStatus> {
  const admin = createAdminClient();
  const [purchase, delivered] = await Promise.all([
    admin.from("orders").select("meta_capi_purchase_at")
      .not("meta_capi_purchase_at", "is", null)
      .order("meta_capi_purchase_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("orders").select("meta_capi_delivered_at")
      .not("meta_capi_delivered_at", "is", null)
      .order("meta_capi_delivered_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return {
    configured: isCapiConfigured(),
    lastPurchaseAt: purchase.data?.meta_capi_purchase_at ?? null,
    lastDeliveredAt: delivered.data?.meta_capi_delivered_at ?? null,
  };
}

export type PixelVerdict = { pixel_id: string; inPageSource: boolean };

export type Verification = {
  checkedAt: string;
  reachable: boolean;
  error: string | null;
  /** Meta's loader is referenced in the HTML the site actually served. */
  scriptTagPresent: boolean;
  /** The <noscript> beacon, which carries the pixel ID as a plain URL parameter. */
  noscriptBeaconPresent: boolean;
  pixels: PixelVerdict[];
};

/**
 * Verification that means something.
 *
 * A green tick because a text box is non-empty proves nothing — that is exactly the state the
 * store was in while the pixel was, in fact, absent from every page. So this fetches the live
 * homepage server-side and looks for the ID in the HTML the site really served.
 */
async function verifyLiveSite(pixels: MetaPixel[]): Promise<Verification> {
  const checkedAt = new Date().toISOString();
  const base: Verification = {
    checkedAt,
    reachable: false,
    error: null,
    scriptTagPresent: false,
    noscriptBeaconPresent: false,
    pixels: pixels.map((p) => ({ pixel_id: p.pixel_id, inPageSource: false })),
  };

  try {
    const res = await fetch(SITE_URL, {
      cache: "no-store",
      redirect: "follow",
      headers: { "user-agent": "HabibaMinhasAdmin/1.0 (+pixel verification)" },
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
    if (!res.ok) {
      return { ...base, error: `The homepage returned HTTP ${res.status}.` };
    }
    const html = await res.text();
    return {
      checkedAt,
      reachable: true,
      error: null,
      scriptTagPresent: html.includes("connect.facebook.net"),
      noscriptBeaconPresent: html.includes("facebook.com/tr?id="),
      pixels: pixels.map((p) => ({
        pixel_id: p.pixel_id,
        inPageSource: p.pixel_id !== "" && html.includes(p.pixel_id),
      })),
    };
  } catch (e) {
    const msg =
      e instanceof Error && e.name === "TimeoutError"
        ? `The homepage did not respond within ${VERIFY_TIMEOUT_MS / 1000}s.`
        : e instanceof Error
          ? e.message
          : "The homepage could not be reached.";
    return { ...base, error: msg };
  }
}

async function readTracking() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("settings")
    .select("tracking_settings, seo_settings")
    .eq("id", 1)
    .single();
  if (error) throw new Error(error.message);

  const legacy = (data.seo_settings as Record<string, unknown> | null)?.fb_pixel;
  return {
    settings: normalizeTrackingSettings(
      data.tracking_settings,
      typeof legacy === "string" ? legacy : "",
    ),
    rawSeo: (data.seo_settings as Record<string, unknown> | null) ?? {},
  };
}

// GET — current tracking settings, a live verification pass, and the event map.
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { settings } = await readTracking();
    // `?verify=0` renders the page without waiting on an external fetch.
    const skip = new URL(req.url).searchParams.get("verify") === "0";
    const [verification, capi] = await Promise.all([
      skip ? Promise.resolve(null) : verifyLiveSite(activePixels(settings)),
      readCapiStatus(),
    ]);

    return NextResponse.json({
      settings,
      verification,
      capi,
      siteUrl: SITE_URL,
      eventMap: META_EVENT_MAP,
      eventSummary: eventMapSummary(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not load tracking settings." },
      { status: 500 },
    );
  }
}

// POST — save tracking settings, and keep the storefront's single pixel field in step.
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as Partial<TrackingSettings> | null;
  if (!body || !Array.isArray(body.meta_pixels)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const next = normalizeTrackingSettings(body);
  const bad = next.meta_pixels.filter((p) => !isValidPixelId(p.pixel_id));
  if (bad.length > 0) {
    return NextResponse.json(
      { error: `Not a valid Meta Pixel ID: ${bad.map((p) => p.pixel_id).join(", ")}. IDs are 15–16 digits.` },
      { status: 400 },
    );
  }

  try {
    const { rawSeo } = await readTracking();
    const admin = createAdminClient();

    /*
     * The storefront still renders a single pixel from `seo_settings.fb_pixel`. Mirroring the
     * primary pixel there keeps the two in step, so this page is genuinely in control of what
     * is live rather than merely describing it. It is a MERGE, not a replace — dropping a key
     * out of that block is the bug this whole area exists to prevent. Pixels beyond the first
     * are stored and shown, but do not render until the storefront reads this column directly.
     */
    const { error } = await admin
      .from("settings")
      .update({
        tracking_settings: next,
        seo_settings: { ...rawSeo, fb_pixel: primaryPixelId(next) },
      })
      .eq("id", 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // The pixel lives in the root layout, so the whole tree has to re-render to pick it up.
    revalidatePath("/", "layout");
    revalidatePath("/admin/marketing");

    return NextResponse.json({ ok: true, settings: next });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not save tracking settings." },
      { status: 500 },
    );
  }
}
