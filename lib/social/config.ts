import { createAdminClient } from "@/lib/supabase/server";

/**
 * Configuration for the social posting pipeline.
 *
 * Two sources, deliberately separated:
 *   - Credentials come from environment variables. They are never stored in the database,
 *     so loosening RLS on a social_* table can never leak a token.
 *   - Behaviour (cadence, slots, categories, kill switch) comes from `social_settings`,
 *     so the owner can change how the pipeline runs with one UPDATE and no deploy.
 */

/** Meta Graph API version. Pinned so a platform version bump cannot silently change behaviour. */
export const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION?.trim() || "v26.0";
export const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export type MetaCredentials = {
  appId: string;
  appSecret?: string;
  token: string;
  pageId: string;
  igUserId: string;
};

/**
 * Reads Meta credentials from the environment.
 *
 * Returns null rather than throwing when unconfigured, so the cron route can answer
 * "skipped: not configured" with a 200 instead of erroring every 15 minutes.
 *
 * `appSecret` is optional: publishing only needs the access token. The secret is used
 * for appsecret_proof hardening when present.
 */
export function getMetaCredentials(): MetaCredentials | null {
  const appId = process.env.META_APP_ID?.trim();
  const token = process.env.META_SYSTEM_USER_TOKEN?.trim();
  const pageId = process.env.META_FB_PAGE_ID?.trim();
  const igUserId = process.env.META_IG_BUSINESS_ACCOUNT_ID?.trim();

  if (!appId || !token || !pageId || !igUserId) return null;

  return {
    appId,
    appSecret: process.env.META_APP_SECRET?.trim() || undefined,
    token,
    pageId,
    igUserId,
  };
}

export type SocialSettings = {
  enabled: boolean;
  posts_per_period: number;
  period: "day" | "week";
  products_per_post: number;
  timezone: string;
  slot_times: string[];
  categories: string[];
  require_in_stock: boolean;
  min_images: number;
  approval_required: boolean;
  max_posts_per_day: number;
  platforms: string[];
};

/** Loads the single settings row. Returns null if the migration has not been applied. */
export async function getSocialSettings(): Promise<SocialSettings | null> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("social_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as SocialSettings;
}

/**
 * Public URL for a product page, with UTM parameters so GA4 can attribute the session.
 *
 * `utm_content` carries the slug, which is what makes it possible to see *which products*
 * actually drive clicks rather than just "social sent us traffic".
 */
export function productUrl(
  category: string,
  slug: string,
  platform: string,
): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://habibaminhas.com").replace(/\/$/, "");
  const params = new URLSearchParams({
    utm_source: platform,
    utm_medium: "social",
    utm_campaign: "auto_product",
    utm_content: slug,
  });
  return `${base}/product/${category}/${slug}/?${params.toString()}`;
}

/**
 * Is a configured slot due right now?
 *
 * The cron fires every 15 minutes and decides for itself whether to act. That is more
 * robust than encoding cadence in the cron expression: going from 1/day to 2/day becomes
 * a database edit rather than a migration and redeploy.
 *
 * A slot counts as due inside a tolerance window after its time, so a late or skipped
 * cron tick does not silently drop the day's post. `alreadyPostedInSlot` prevents the
 * same slot firing twice within that window.
 */
export function findDueSlot(
  slotTimes: string[],
  timezone: string,
  now: Date = new Date(),
  toleranceMinutes = 30,
): string | null {
  const localMinutes = minutesSinceMidnight(now, timezone);
  if (localMinutes === null) return null;

  for (const slot of slotTimes) {
    const parsed = parseSlot(slot);
    if (parsed === null) continue;
    const delta = localMinutes - parsed;
    if (delta >= 0 && delta < toleranceMinutes) return slot;
  }
  return null;
}

/** "19:00" -> 1140. Returns null for anything malformed rather than guessing. */
function parseSlot(slot: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(slot.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/**
 * Minutes since midnight in the given IANA timezone.
 *
 * Uses Intl rather than manual offset arithmetic so daylight-saving and any future
 * change to Pakistan's UTC offset are handled by the platform, not by us.
 */
function minutesSinceMidnight(date: Date, timezone: string): number | null {
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(date);
    const h = Number(parts.find((p) => p.type === "hour")?.value);
    const min = Number(parts.find((p) => p.type === "minute")?.value);
    if (Number.isNaN(h) || Number.isNaN(min)) return null;
    return h * 60 + min;
  } catch {
    return null; // invalid timezone string
  }
}

/** Local calendar date in the configured timezone, as YYYY-MM-DD. */
export function localDateKey(timezone: string, date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** Offset of a timezone from UTC, in minutes, at a given instant (DST-aware). */
function offsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  // `hour` comes back as 24 rather than 0 at midnight in some runtimes.
  const hour = get("hour") % 24;
  const asIfUtc = Date.UTC(get("year"), get("month") - 1, get("day"), hour, get("minute"), get("second"));
  return (asIfUtc - date.getTime()) / 60000;
}

/**
 * Midnight of the current local day, expressed as a UTC instant.
 *
 * The daily ceiling has to mean "today in Karachi", not "today in UTC" — at 02:00 PKT
 * those are different days, and a UTC-based count would let the cap reset five hours late.
 */
export function startOfLocalDayUtc(timezone: string, date: Date = new Date()): Date {
  try {
    const [y, m, d] = localDateKey(timezone, date).split("-").map(Number);
    const offset = offsetMinutes(date, timezone);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - offset * 60000);
  } catch {
    const fallback = new Date(date);
    fallback.setUTCHours(0, 0, 0, 0);
    return fallback;
  }
}
