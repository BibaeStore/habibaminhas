# Meta Pixel — what is already wired up

Written 2026-08-07, when the pixel was activated for the first ad campaigns.

**Read this before adding any Meta Pixel code.** Every event below already fires. The most
likely way to damage this setup is to add tracking that already exists.

---

## 🔴 Purchase already fires. Do not add another one.

`trackPurchase()` is called in **`app/checkout/payment/payment-view.tsx:135`**, immediately
after the order is created and before the redirect to `/order/{order_number}`. It fires GA4
`purchase` **and** Meta `Purchase` together.

A second Purchase event on the order confirmation page would double-count **every sale**,
inflate reported revenue, and mistrain the ad algorithm. This has already been proposed once —
by an AI assistant that had not seen the codebase — and was caught before it shipped.

If you are asked to "add Purchase tracking to the order confirmation page", the answer is that
it already exists one step earlier in the flow.

---

## Where the pixel ID lives

**Not hardcoded.** It is read from Supabase:

```
settings.seo_settings.fb_pixel   →   1970498470269953
```

`app/layout.tsx` renders the pixel only when that value is non-empty:

```tsx
{seo.fb_pixel && ( <Script id="fb-pixel" strategy="afterInteractive"> … )}
```

This means the pixel can be swapped or switched off from the admin settings page with **no
deploy**. It also means an empty value silently disables all Meta tracking — which is exactly
why nothing was being recorded before 2026-08-07.

GA4 works the same way via `settings.seo_settings.ga4_id` (`G-G9W6K3QBQG`).

---

## Events currently firing

All defined in `lib/analytics.ts`. Each is a no-op when the tag is absent, so they are safe to
call unconditionally.

| Shopper action | GA4 event | Meta event | Fired from |
|---|---|---|---|
| Any page load | — | `PageView` | `app/layout.tsx` (root, so every route) |
| Product page viewed | `view_item` | `ViewContent` | `trackViewItem()` |
| Add to Bag | `add_to_cart` | `AddToCart` | `trackAddToCart()` |
| Cart opened | `view_cart` | — | `trackViewCart()` |
| Reached shipping step | `begin_checkout` | `InitiateCheckout` | `trackBeginCheckout()` |
| Shipping submitted | `add_shipping_info` | — | `trackAddShippingInfo()` |
| Payment method chosen | `add_payment_info` | `AddPaymentInfo` | `trackAddPaymentInfo()` |
| **Order created** | `purchase` | **`Purchase`** | `trackPurchase()` — payment-view.tsx:135 |

GA4 event names follow Google's recommended ecommerce schema. **Do not rename them** or the
built-in Monetisation reports stop populating.

---

## Catalog IDs — keep them consistent

Every Meta event sends `content_ids: items.map(i => i.id)`, where `i.id` is the **product UUID**
from the cart.

Meta matches events to your product catalog by whatever key the feed uses. So:

- If you build a catalog feed, **key it on the product UUID**, not the SKU.
- If you would rather key on SKU, you must change **all** events together, not just Purchase.
  Changing one event alone breaks funnel attribution, because ViewContent and AddToCart would
  no longer refer to the same items as Purchase.

Consistency across the funnel matters more than which identifier you pick.

---

## ⚠️ Reading campaign numbers on cash-on-delivery

`payment_methods` is `cod: true` with everything else false, and Purchase fires **when the order
is placed**, not when it is delivered.

That means Meta counts orders that can still be refused at the door. Return-to-origin rates in
Pakistan commonly run 20–40%, so **Meta-reported revenue will sit meaningfully above settled
revenue.** This is normal practice for COD stores and is the right trade — firing only on
delivery would starve the algorithm of the early signal it needs to optimise — but budget
decisions should be made against settled revenue, not the Meta dashboard figure.

To close that gap properly you would need the Conversions API plus a PostEx delivery webhook,
sending a server-side event on delivery with a shared `event_id` for deduplication. That is a
real project, not a snippet.

---

## Known gap: no `order_id` on the Meta payload

`track()` in `lib/analytics.ts` sends `currency`, `value`, `content_type`, and `content_ids` to
Meta. GA4 gets `transaction_id`, but **Meta does not get `order_id`**.

That is harmless today, because only the browser pixel is sending events. It becomes a real
problem the moment the Conversions API is added — without a shared identifier, Meta cannot
deduplicate the browser event against the server event and every sale is counted twice.

Fix it before any Conversions API work, not after.

---

## Verifying the pixel is live

```bash
# base pixel present on a page
curl -s -L https://habibaminhas.com/ | grep -oE "fbq\('init', '[0-9]+'\)|fbq\('track', 'PageView'\)"

# noscript fallback beacon (note: & is HTML-escaped to &amp; in the source)
curl -s -L https://habibaminhas.com/ | grep -c 'facebook.com/tr'

# GA4 not broken
curl -s -L https://habibaminhas.com/ | grep -oE 'G-[A-Z0-9]+' | head -1
```

For live event inspection use Meta Events Manager → **Test Events**, or the Meta Pixel Helper
browser extension. Purchase can only be tested by completing a real checkout, since it fires on
order creation.

---

## Performance note

The pixel loads with `strategy="afterInteractive"`, so it never blocks rendering, and
`connect.facebook.net` is preconnected in `<head>` alongside the existing Google Tag Manager and
Trustpilot preconnects. Core Web Vitals is a ranking factor and this site ranks in Google and AI
search — see `AGENTS.md`. **Do not change the script strategy to `beforeInteractive`.**
