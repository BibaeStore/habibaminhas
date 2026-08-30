/**
 * The read-only event map shown on Admin › Marketing & Tracking.
 *
 * WHY THIS EXISTS
 * ---------------
 * Meta's Event Setup Tool — the point-and-click dialog that lets a marketer attach an event
 * to a button — is blocked on this site by our own Content-Security-Policy `frame-src`, and
 * unblocking it would permanently widen what can embed itself in our pages. This table is the
 * replacement: it answers "what does the site already send Meta?" without a developer, a
 * screen-share, or a security trade-off.
 *
 * `helper` names the exact function in `lib/analytics.ts` that fires the event, so any claim
 * here is one grep away from being checked. Rows marked `missing` are wired in a later phase;
 * they are listed deliberately, because the gaps are the useful half of this table.
 *
 * ⚠️ When you add or rename a tracking call in `lib/analytics.ts`, update the matching row.
 */

export type EventStatus = "live" | "partial" | "missing";

export type TrackedEvent = {
  /** What the shopper actually does, in the words a marketer would use. */
  action: string;
  /** The standard Meta event name. Standard names unlock Meta's built-in optimisation;
   *  invented names do not, so these must not be renamed to something friendlier. */
  metaEvent: string;
  status: EventStatus;
  /** Function in `lib/analytics.ts` that fires it, or null when nothing fires it yet. */
  helper: string | null;
  /** Why a marketer should care that this event exists. */
  why: string;
};

export const META_EVENT_MAP: TrackedEvent[] = [
  { action: "Opens any page",          metaEvent: "PageView",             status: "live",    helper: "app/layout.tsx",      why: "Retargeting base. Carries the page path as event data, because Meta truncates the URL it reports." },
  { action: "Views a product",         metaEvent: "ViewContent",          status: "live",    helper: "trackViewItem",       why: "Warm audience and catalog ads." },
  { action: "Adds to bag",             metaEvent: "AddToCart",            status: "live",    helper: "trackAddToCart",      why: "Highest-value retargeting pool." },
  { action: "Starts checkout",         metaEvent: "InitiateCheckout",     status: "live",    helper: "trackBeginCheckout",  why: "Abandoned-cart campaigns." },
  { action: "Picks a payment method",  metaEvent: "AddPaymentInfo",       status: "live",    helper: "trackAddPaymentInfo", why: "Late-funnel intent." },
  { action: "Places an order",         metaEvent: "Purchase",             status: "live",    helper: "trackPurchase",       why: "The conversion you bid on." },
  { action: "Searches the site",       metaEvent: "Search",               status: "live", helper: "trackSearch",                  why: "Strong intent; feeds interest targeting." },
  { action: "Saves to wishlist",       metaEvent: "AddToWishlist",        status: "live", helper: "trackAddToWishlist",                  why: "Buy-later audience." },
  { action: "Signs up for an account", metaEvent: "CompleteRegistration", status: "live", helper: "trackCompleteRegistration",                  why: "Lookalike seed audience." },
  { action: "Joins the newsletter",    metaEvent: "Subscribe",            status: "live", helper: "trackSubscribe",                  why: "Lead capture." },
  { action: "Contact form or WhatsApp",metaEvent: "Contact",              status: "live", helper: "trackContact",                  why: "Enquiry conversions." },
  { action: "Browses a collection",    metaEvent: "ViewCategory",         status: "live", helper: "trackViewCategory",                  why: "Category-level retargeting." },
  { action: "Uses Virtual Try Room",   metaEvent: "CustomizeProduct",     status: "live", helper: "trackCustomizeProduct",                  why: "The strongest buying signal on this site, and unique to it. Nobody tries a garment on unless they are seriously considering it." },
];

/** Counts for the "Events firing — n of m" status row. */
export function eventMapSummary() {
  const total = META_EVENT_MAP.length;
  const live = META_EVENT_MAP.filter((e) => e.status === "live").length;
  const partial = META_EVENT_MAP.filter((e) => e.status === "partial").length;
  return { total, live, partial, missing: total - live - partial };
}
