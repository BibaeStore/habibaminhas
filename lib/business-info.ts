/*
 * Single source of truth for the business postal address.
 *
 * ⚠️ TEMPORARY ADDRESS — set 2026-08-09 for the XPay payment gateway application.
 *
 * XPay require the address on the website to match the address on the owner's utility bill.
 * The owner intends to revert to the previous, less specific address once the gateway is
 * approved. Everything that renders the address imports from here, so reverting is a single
 * edit in this file rather than a hunt through pages, invoices and JSON-LD.
 *
 * PREVIOUS VALUE, for the revert:
 *   BUSINESS_ADDRESS.street     = ""                       (there was no street line)
 *   BUSINESS_ADDRESS.postalCode = "75533"
 *   BUSINESS_ADDRESS.full       = "Karachi, Pakistan — 75533"
 *   Structured data used streetAddress: "Karachi", postalCode: "75533".
 *
 * ⚠️ Local SEO note: Google weighs NAP (Name / Address / Phone) consistency across the web.
 * Whenever this changes, the Google Business Profile and any directory listings should be
 * updated the same day, or the site and Google will disagree about where the business is.
 */

export const BUSINESS_ADDRESS = {
  /** Street line. Empty string means "no street line" — callers must handle that. */
  street: "Flat No. B 1/3, 1st Floor, Pakistan Navy Highrise Apartment, Near Kalapul",
  locality: "Karachi",
  region: "Sindh",
  /** Empty string means no postcode is published. */
  postalCode: "",
  country: "Pakistan",
  /** ISO 3166-1 alpha-2, for schema.org addressCountry. */
  countryCode: "PK",
} as const;

/** One-line form: "Flat No. …, Near Kalapul, Karachi, Sindh, Pakistan" */
export const BUSINESS_ADDRESS_LINE = [
  BUSINESS_ADDRESS.street,
  BUSINESS_ADDRESS.locality,
  BUSINESS_ADDRESS.region,
  BUSINESS_ADDRESS.postalCode,
  BUSINESS_ADDRESS.country,
]
  .filter(Boolean)
  .join(", ");

/** Two-line form for stacked display (footer, contact card, invoice). */
export const BUSINESS_ADDRESS_LINES: string[] = [
  BUSINESS_ADDRESS.street,
  [BUSINESS_ADDRESS.locality, BUSINESS_ADDRESS.region, BUSINESS_ADDRESS.postalCode]
    .filter(Boolean)
    .join(", "),
  BUSINESS_ADDRESS.country,
].filter(Boolean);

/** schema.org PostalAddress. Keys are omitted when empty so no blank fields are published. */
export const BUSINESS_POSTAL_ADDRESS_SCHEMA = {
  "@type": "PostalAddress",
  ...(BUSINESS_ADDRESS.street ? { streetAddress: BUSINESS_ADDRESS.street } : {}),
  addressLocality: BUSINESS_ADDRESS.locality,
  addressRegion: BUSINESS_ADDRESS.region,
  ...(BUSINESS_ADDRESS.postalCode ? { postalCode: BUSINESS_ADDRESS.postalCode } : {}),
  addressCountry: BUSINESS_ADDRESS.countryCode,
} as const;
