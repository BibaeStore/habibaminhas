/**
 * Customer-detail normalisation, shared by the browser pixel and the server-side
 * Conversions API.
 *
 * THIS FILE EXISTS TO PREVENT ONE SPECIFIC BUG.
 *
 * Meta matches a buyer by comparing SHA-256 hashes. Hashing is exact: `"Habiba@Example.COM "`
 * and `"habiba@example.com"` produce completely different digests, so if the browser and the
 * server normalise even slightly differently, the two halves of the same purchase stop
 * matching the same person. Nothing errors — the match rate simply degrades, quietly, and the
 * only symptom is worse ad performance months later.
 *
 * So both sides import from here. If a rule changes, it changes for both at once.
 *
 * The rules are Meta's own: lower-case, trim, strip punctuation from phone numbers, remove
 * spaces from city names. See the Conversions API "customer information parameters" docs.
 */

/** Lower-cased and trimmed; empty becomes undefined so it is omitted rather than hashed. */
export function normText(v: string | undefined | null): string | undefined {
  const out = (v ?? "").trim().toLowerCase();
  return out === "" ? undefined : out;
}

/** Digits only, so "+92 312-029 5812" and "0312 0295812" reduce to the same customer. */
export function normPhone(v: string | undefined | null): string | undefined {
  const digits = (v ?? "").replace(/\D/g, "");
  return digits === "" ? undefined : digits;
}

/** Lower-cased with all whitespace removed — "Karachi City" becomes "karachicity". */
export function normCity(v: string | undefined | null): string | undefined {
  const out = normText(v)?.replace(/\s/g, "");
  return out === "" ? undefined : out;
}

/** ISO 3166-1 alpha-2, lower-cased. This store ships within Pakistan. */
export const COUNTRY_CODE = "pk";

export type CustomerMatchInput = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  province?: string;
  postalCode?: string;
};

/**
 * The normalised, still-unhashed match keys, under Meta's short parameter names.
 *
 * Returns plain values because the two callers hash at different points: the browser pixel
 * hashes these itself before transmitting, while the server must hash them explicitly before
 * they go anywhere near the network.
 */
export function toMatchKeys(c: CustomerMatchInput): Record<string, string> {
  const out: Record<string, string> = {};
  const em = normText(c.email);        if (em) out.em = em;
  const ph = normPhone(c.phone);       if (ph) out.ph = ph;
  const fn = normText(c.firstName);    if (fn) out.fn = fn;
  const ln = normText(c.lastName);     if (ln) out.ln = ln;
  const ct = normCity(c.city);         if (ct) out.ct = ct;
  const st = normText(c.province);     if (st) out.st = st;
  const zp = normText(c.postalCode);   if (zp) out.zp = zp;
  if (Object.keys(out).length > 0) out.country = COUNTRY_CODE;
  return out;
}
