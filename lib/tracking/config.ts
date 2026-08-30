/**
 * Shape, parsing and validation for the `settings.tracking_settings` column.
 *
 * Pure functions only — no database, no "use server" — so this can be imported from a route
 * handler, a server component, or a client component without dragging a Supabase client along.
 *
 * The column is deliberately separate from `seo_settings`: those two blocks are each saved by
 * replacing the whole JSON value, so sharing one column means either screen's Save can silently
 * drop the other's fields. That is exactly how the Meta Pixel disappeared once already.
 */

export type MetaPixel = {
  /** Stable key for React lists and for matching a row across a save. */
  id: string;
  /** Human label, e.g. "Main store pixel" or "Ravi's agency pixel". */
  label: string;
  pixel_id: string;
  enabled: boolean;
};

export type TrackingSettings = {
  meta_pixels: MetaPixel[];
  /** Meta's Test Events code. Optional, and never persisted as a live tracking change —
   *  it only makes Meta's Test Events screen light up while someone is watching it. */
  test_event_code: string;
};

export const EMPTY_TRACKING: TrackingSettings = { meta_pixels: [], test_event_code: "" };

/** Meta pixel IDs are numeric and 15–16 digits today. Accept a wider band so a valid-but-
 *  unusual ID is never rejected outright, and let the UI flag anything outside it. */
const PIXEL_ID_RE = /^\d{10,20}$/;

export function isValidPixelId(value: string): boolean {
  return PIXEL_ID_RE.test(value.trim());
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Parses whatever is in the column into a known-good shape.
 *
 * `legacyPixelId` is the old `seo_settings.fb_pixel` value. It seeds the list when
 * `tracking_settings` is still empty, so a store that has not saved this page yet is described
 * accurately rather than appearing to have no pixel at all.
 */
export function normalizeTrackingSettings(raw: unknown, legacyPixelId = ""): TrackingSettings {
  const obj = isObj(raw) ? raw : {};
  const list = Array.isArray(obj.meta_pixels) ? obj.meta_pixels : [];

  const meta_pixels = list
    .filter(isObj)
    .map((p, i): MetaPixel => ({
      id: str(p.id) || `pixel-${i + 1}`,
      label: str(p.label).trim() || `Pixel ${i + 1}`,
      pixel_id: str(p.pixel_id).trim(),
      enabled: typeof p.enabled === "boolean" ? p.enabled : true,
    }))
    .filter((p) => p.pixel_id !== "");

  if (meta_pixels.length === 0 && legacyPixelId.trim() !== "") {
    meta_pixels.push({
      id: "primary",
      label: "Main store pixel",
      pixel_id: legacyPixelId.trim(),
      enabled: true,
    });
  }

  return { meta_pixels, test_event_code: str(obj.test_event_code).trim() };
}

/** The pixels that should actually be on the site: switched on, and a well-formed ID. */
export function activePixels(t: TrackingSettings): MetaPixel[] {
  return t.meta_pixels.filter((p) => p.enabled && isValidPixelId(p.pixel_id));
}

/**
 * The one pixel the storefront renders today.
 *
 * The storefront still reads `seo_settings.fb_pixel`, a single value, so until that is changed
 * the first enabled pixel is the live one. Saving this page mirrors it back to `fb_pixel` so
 * the two never disagree; any pixel after the first is stored but not yet rendered.
 */
export function primaryPixelId(t: TrackingSettings): string {
  return activePixels(t)[0]?.pixel_id ?? "";
}
