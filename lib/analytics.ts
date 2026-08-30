/**
 * GA4 ecommerce event helpers.
 *
 * GA4 and the Meta Pixel are bootstrapped in `app/layout.tsx` (both are optional and
 * only load when `seo.ga4_id` / `seo.fb_pixel` are configured in admin settings). Until
 * now nothing beyond pageviews was ever sent, so the checkout funnel was invisible —
 * there was no way to tell where shoppers dropped off, or to verify that a fix worked.
 *
 * Every function here is a no-op when the tag is absent, so these are safe to call
 * unconditionally from client components.
 *
 * Event names follow the GA4 recommended ecommerce schema — do not rename them, or the
 * built-in Monetisation reports in GA4 will stop populating.
 * https://developers.google.com/analytics/devguides/collection/ga4/reference/events
 */

const CURRENCY = "PKR";

type Gtag = (command: string, eventName: string, params?: Record<string, unknown>) => void;
type Fbq = (
  command: string,
  /** Event name for `track`; the pixel ID for `init`. */
  eventNameOrPixelId: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: Fbq;
    /** Set alongside `fbq('init')` in app/layout.tsx. Advanced Matching has to re-init the
     *  same pixel to attach customer details, and the ID lives in the database, not in code. */
    __hmPixelId?: string;
  }
}

/** A cart line reduced to what GA4 needs. Matches the shape of `CartItem`. */
export type AnalyticsItem = {
  id: string;
  title: string;
  price: number;
  qty?: number;
  size?: string | null;
  category?: string;
};

type GA4Item = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
  item_variant?: string;
};

/**
 * Meta's richer per-line format. `content_ids` alone tells Meta *which* products were involved;
 * `contents` also tells it how many and at what price, which is what catalog ads and
 * value-based (ROAS) campaigns need in order to bid on anything.
 */
function toMetaContents(items: AnalyticsItem[]) {
  return items.map((i) => ({
    id: i.id,
    quantity: i.qty ?? 1,
    item_price: i.price,
  }));
}

function toGA4Items(items: AnalyticsItem[]): GA4Item[] {
  return items.map((i) => ({
    item_id: i.id,
    item_name: i.title,
    price: i.price,
    quantity: i.qty ?? 1,
    ...(i.category ? { item_category: i.category } : {}),
    ...(i.size && i.size !== "onesize" ? { item_variant: i.size } : {}),
  }));
}

function totalValue(items: AnalyticsItem[]): number {
  return items.reduce((sum, i) => sum + i.price * (i.qty ?? 1), 0);
}

function ga(eventName: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

/**
 * Page identity as ordinary event data.
 *
 * Meta's own script truncates the address it reports to the bare origin and marks it with its
 * privacy-mode flags, so without this every event on this site looks like it happened on the
 * homepage: "people who viewed this product" cannot be built by URL, URL-rule Custom
 * Conversions never fire, and landing-page reporting shows 100% of traffic landing on `/`.
 * The truncation happens inside Meta's code and cannot be switched off from here — so we stop
 * depending on the URL and send the path explicitly instead. This is more reliable than a URL
 * rule even on sites where URL rules work.
 */
function pageContext(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return {
    page_path: window.location.pathname,
    page_title: document.title,
  };
}

/**
 * A unique ID for this single occurrence of an event.
 *
 * When the Conversions API starts sending the same events from the server, Meta needs a way to
 * tell "one purchase, reported twice" from "two purchases". That way is a shared `eventID`:
 * matching IDs are collapsed into one. Sending it now, before the server side exists, costs
 * nothing and means the browser half is already correct when the other half arrives.
 */
function newEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function meta(eventName: string, params: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  // Page context first, so a caller can always override it deliberately.
  window.fbq(
    "track",
    eventName,
    { ...pageContext(), ...params },
    { eventID: eventId ?? newEventId() },
  );
}

/* ── Advanced Matching ─────────────────────────────────────────────────────
 *
 * Meta matches a buyer to an ad they saw by comparing customer details. Supplying them lifts
 * the share of conversions Meta can attribute — often substantially, because a shopper who
 * clicked an ad on one device and bought on another is otherwise invisible.
 *
 * The pixel hashes every value with SHA-256 in the browser before it is transmitted, so Meta
 * receives codes it can match against but cannot read back. Nothing is sent from browsing
 * pages: this is called at checkout, where the shopper has deliberately given us the details.
 *
 * Enabled on the owner's explicit instruction (30 Aug 2026) after being shown what is sent.
 */

export type CustomerMatch = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  province?: string;
  postalCode?: string;
};

/** Meta expects lower-case, trimmed values with punctuation removed before hashing. */
function norm(v: string | undefined): string | undefined {
  const out = (v ?? "").trim().toLowerCase();
  return out === "" ? undefined : out;
}

/** Digits only, so "+92 312 029 5812" and "0312-0295812" hash to the same customer. */
function normPhone(v: string | undefined): string | undefined {
  const digits = (v ?? "").replace(/\D/g, "");
  return digits === "" ? undefined : digits;
}

/**
 * Attaches customer details to every subsequent event on this page.
 *
 * Re-initialising the same pixel ID is Meta's documented way to add Advanced Matching after
 * the initial bootstrap; it updates the matching parameters and does not fire a second
 * PageView. A no-op when the pixel is absent or nothing usable was supplied.
 */
export function setCustomerMatch(c: CustomerMatch) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  const pixelId = window.__hmPixelId;
  if (!pixelId) return;

  const data: Record<string, string> = {};
  const em = norm(c.email);          if (em) data.em = em;
  const ph = normPhone(c.phone);     if (ph) data.ph = ph;
  const fn = norm(c.firstName);      if (fn) data.fn = fn;
  const ln = norm(c.lastName);       if (ln) data.ln = ln;
  const ct = norm(c.city)?.replace(/\s/g, ""); if (ct) data.ct = ct;
  const st = norm(c.province);       if (st) data.st = st;
  const zp = norm(c.postalCode);     if (zp) data.zp = zp;

  if (Object.keys(data).length === 0) return;
  data.country = "pk";
  window.fbq("init", pixelId, data);
}

/** Fires both tags with a matching GA4 / Meta event pair. */
function track(
  ga4Event: string,
  metaEvent: string | null,
  items: AnalyticsItem[],
  extra: Record<string, unknown> = {},
  eventId?: string,
) {
  const value = extra.value ?? totalValue(items);

  ga(ga4Event, { currency: CURRENCY, value, items: toGA4Items(items), ...extra });

  if (metaEvent) {
    // `content_name` / `content_category` describe a single product. For a basket the per-line
    // detail is in `contents`, and a single name would be actively misleading, so it is omitted.
    const single = items.length === 1 ? items[0] : null;
    meta(metaEvent, {
      currency: CURRENCY,
      value,
      content_type: "product",
      content_ids: items.map((i) => i.id),
      contents: toMetaContents(items),
      num_items: items.reduce((n, i) => n + (i.qty ?? 1), 0),
      ...(single?.title ? { content_name: single.title } : {}),
      ...(single?.category ? { content_category: single.category } : {}),
    }, eventId);
  }
}

/* ── Funnel events, in the order a shopper hits them ──────────────── */

/** Product detail page viewed. */
export function trackViewItem(item: AnalyticsItem) {
  track("view_item", "ViewContent", [item]);
}

/** "Add to Bag" tapped. */
export function trackAddToCart(item: AnalyticsItem) {
  track("add_to_cart", "AddToCart", [item]);
}

/** Cart drawer opened, or /cart visited. */
export function trackViewCart(items: AnalyticsItem[]) {
  track("view_cart", null, items);
}

/** Shopper reached /checkout/shipping with a non-empty bag. */
export function trackBeginCheckout(items: AnalyticsItem[]) {
  track("begin_checkout", "InitiateCheckout", items);
}

/** Shipping form submitted successfully. */
export function trackAddShippingInfo(items: AnalyticsItem[], shippingTier: string) {
  track("add_shipping_info", null, items, { shipping_tier: shippingTier });
}

/** Payment method chosen on /checkout/payment. */
export function trackAddPaymentInfo(items: AnalyticsItem[], paymentType: string) {
  track("add_payment_info", "AddPaymentInfo", items, { payment_type: paymentType });
}

/** Order successfully created. `transactionId` is the human order number. */
export function trackPurchase(
  items: AnalyticsItem[],
  opts: { transactionId: string; value: number; shipping: number },
) {
  /*
   * Deliberately NOT a random ID. When the Conversions API sends this same purchase from the
   * server, it must arrive with an identical `eventID` or Meta counts the sale twice. The order
   * number is the one value both sides already know, so it is the key.
   */
  track(
    "purchase",
    "Purchase",
    items,
    { transaction_id: opts.transactionId, value: opts.value, shipping: opts.shipping },
    `purchase-${opts.transactionId}`,
  );
}

/* ── Intent signals outside the buying funnel ──────────────────────────
 *
 * Each of these was firing nowhere before. They are standard Meta event names, which is what
 * makes them usable as campaign objectives and audience rules — an invented name would be
 * recorded but could not be optimised against.
 */

/** Site search. `search_string` is what makes this usable for interest targeting. */
export function trackSearch(query: string) {
  const term = query.trim();
  if (!term) return;
  ga("search", { search_term: term });
  meta("Search", { search_string: term, content_type: "product" });
}

/** Saved to the wishlist. Fires on add only — un-saving is not a signal Meta has a name for. */
export function trackAddToWishlist(item: AnalyticsItem) {
  track("add_to_wishlist", "AddToWishlist", [item]);
}

/** A collection or category page opened. */
export function trackViewCategory(category: string, items: AnalyticsItem[] = []) {
  ga("view_item_list", { item_list_name: category, items: toGA4Items(items) });
  meta("ViewCategory", {
    content_category: category,
    content_type: "product_group",
    ...(items.length > 0 ? { content_ids: items.map((i) => i.id) } : {}),
  });
}

/** Account created. The seed audience Meta needs to build lookalikes. */
export function trackCompleteRegistration(method: string) {
  ga("sign_up", { method });
  meta("CompleteRegistration", { status: true, registration_method: method });
}

/** Newsletter signup. */
export function trackSubscribe(source: string) {
  ga("generate_lead", { method: source });
  meta("Subscribe", { content_name: source, currency: CURRENCY, value: 0 });
}

/** Contact form submitted, or WhatsApp opened. */
export function trackContact(channel: string) {
  ga("contact", { method: channel });
  meta("Contact", { content_name: channel });
}

/**
 * Virtual Try Room used.
 *
 * The strongest buying signal on this site and unique to it — nobody tries a garment on unless
 * they are seriously considering it. `CustomizeProduct` is Meta's standard name for exactly
 * this kind of configure-before-buying action.
 */
export function trackCustomizeProduct(item: AnalyticsItem) {
  track("customize_product", "CustomizeProduct", [item]);
}
