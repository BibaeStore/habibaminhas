/**
 * Normalize a Pakistani phone number to the format PostEx requires: 03xxxxxxxxx.
 * Handles +92 / 0092 / 92 country-code prefixes, spaces, dashes, and a leading 0.
 * Returns null when the input is not a valid PK mobile number (so callers can
 * surface a clear error instead of sending PostEx a bad number).
 */
export function normalizePakPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.replace(/\D/g, "");

  // Strip country code in any common form → leaves a local number.
  if (d.startsWith("0092")) d = d.slice(4);
  else if (d.startsWith("92") && d.length >= 12) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);

  // A valid PK mobile is now exactly 10 digits starting with 3 (e.g. 3001234567).
  if (d.length === 10 && d.startsWith("3")) return "0" + d;
  return null;
}

/** True if the value normalizes to a valid PK mobile number. */
export function isValidPakMobile(raw: string | null | undefined): boolean {
  return normalizePakPhone(raw) !== null;
}
