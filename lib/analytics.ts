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
type Fbq = (command: string, eventName: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: Fbq;
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

function meta(eventName: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  // Page context first, so a caller can always override it deliberately.
  window.fbq("track", eventName, { ...pageContext(), ...params });
}

/** Fires both tags with a matching GA4 / Meta event pair. */
function track(
  ga4Event: string,
  metaEvent: string | null,
  items: AnalyticsItem[],
  extra: Record<string, unknown> = {},
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
    });
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
  track("purchase", "Purchase", items, {
    transaction_id: opts.transactionId,
    value: opts.value,
    shipping: opts.shipping,
  });
}
