/**
 * Match a customer's free-text city against PostEx's operational city list.
 *
 * We never silently guess: an exact or case-insensitive match is accepted;
 * anything else returns matched:false with suggestions so an admin can pick
 * the correct PostEx city before booking.
 */
import type { PostexOperationalCity } from "./types";

export interface CityMatch {
  input: string;
  matched: boolean;
  /** The exact PostEx operationalCityName to send, when matched. */
  cityName: string | null;
  method: "exact" | "caseless" | "none";
  /** Up to `limit` likely candidates, for the admin's picker on a miss. */
  suggestions: string[];
}

type CityLike = Pick<PostexOperationalCity, "operationalCityName">;

export function matchOperationalCity(
  input: string | null | undefined,
  cities: CityLike[],
  limit = 12,
): CityMatch {
  const raw = (input ?? "").trim();
  if (!raw) return { input: "", matched: false, cityName: null, method: "none", suggestions: [] };

  const exact = cities.find((c) => c.operationalCityName === raw);
  if (exact) {
    return { input: raw, matched: true, cityName: exact.operationalCityName, method: "exact", suggestions: [] };
  }

  const lc = raw.toLowerCase();
  const caseless = cities.find((c) => c.operationalCityName.toLowerCase() === lc);
  if (caseless) {
    return { input: raw, matched: true, cityName: caseless.operationalCityName, method: "caseless", suggestions: [] };
  }

  // No confident match — offer candidates (prefix first, then contains).
  const starts = cities.filter((c) => c.operationalCityName.toLowerCase().startsWith(lc));
  const contains = cities.filter(
    (c) => !c.operationalCityName.toLowerCase().startsWith(lc) && c.operationalCityName.toLowerCase().includes(lc),
  );
  const suggestions = [...starts, ...contains].slice(0, limit).map((c) => c.operationalCityName);

  return { input: raw, matched: false, cityName: null, method: "none", suggestions };
}
