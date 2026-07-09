/**
 * PostEx configuration + kill-switch.
 *
 * The whole integration is env-gated: if POSTEX_API_TOKEN is absent, the site
 * behaves exactly as it did before PostEx (all PostEx UI hidden, all actions
 * no-op). This is what keeps the feature isolated and safe to ship dark.
 */

const DEFAULT_BASE = "https://api.postex.pk/services/integration/api";

export interface PostexConfig {
  token: string;
  baseUrl: string;
  pickupAddressCode: string;
}

/** Returns config, or null when PostEx is not configured (the kill-switch). */
export function getPostexConfig(): PostexConfig | null {
  const token = process.env.POSTEX_API_TOKEN?.trim();
  if (!token) return null;
  return {
    token,
    baseUrl: (process.env.POSTEX_API_BASE?.trim() || DEFAULT_BASE).replace(/\/$/, ""),
    pickupAddressCode: process.env.POSTEX_PICKUP_ADDRESS_CODE?.trim() || "",
  };
}

/** True when PostEx is switched on (token present). Cheap; safe on client too. */
export function isPostexEnabled(): boolean {
  return Boolean(process.env.POSTEX_API_TOKEN?.trim());
}
