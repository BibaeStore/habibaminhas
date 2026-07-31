# 01 — Audit Findings

**Date:** 2026-07-31
**Method:** Static audit of the full add-to-cart → order-placed path, plus the global overlay
stack (`components/layout/layout-shell.tsx`) that renders on every page.
**Status:** Findings only. No code modified.

---

## Files in scope

| File | Role |
|---|---|
| `components/product/add-to-cart-section.tsx` | PDP Add-to-Bag, mobile sticky bar, size picker |
| `components/cart/cart-drawer.tsx` | The slide-in bag (the reported bug lives here) |
| `components/cart/cart-trigger.tsx` | Navbar bag icon + badge |
| `lib/cart-store.ts` | Zustand cart state, localStorage persistence |
| `app/cart/cart-view.tsx` | Full `/cart` page |
| `app/checkout/shipping/shipping-view.tsx` | Step 2 — address form |
| `app/checkout/payment/payment-view.tsx` | Step 3 — payment + place order |
| `components/layout/layout-shell.tsx` | Global overlays (WhatsApp, notifications, cookies) |
| `components/common/whatsapp-button.tsx` | Floating WhatsApp CTA |
| `components/common/purchase-notification.tsx` | Social-proof card |
| `lib/actions/settings.ts` | Shipping rates + free-shipping threshold |

---

## The global z-index stack (context for F-02 and F-04)

Measured across all customer-facing components:

```
 9999  page-loader, order loading, payment "placing order" overlay
 9998  cookie-consent
  200  mobile-menu, try-on-modal
  100  try-room-popup, product-card quick-view
   60  purchase-notification        ← above the cart drawer
   50  whatsapp-button              ← above the cart drawer
   49  cart-drawer panel
   48  cart-drawer backdrop
   45  PDP mobile sticky Add-to-Bag bar
   40  fixed header (promo bar + navbar)
```

**There is no z-index scale or convention.** Values were picked ad hoc per component, and the
result is that the two elements which should sit *below* the cart drawer — the WhatsApp button
and the social-proof card — both sit *above* it. This is the structural cause of F-02 and F-04,
and it will keep producing this class of bug until a documented scale exists.

---

## 🔴 F-01 — Cart drawer footer is rendered below the visible viewport on mobile

**This is the bug the owner reported.** Confirmed.

**Location:** `components/cart/cart-drawer.tsx:74`

```tsx
className={`fixed right-0 top-0 z-[49] flex h-screen w-full max-w-[420px] flex-col ...`}
```

### Root cause

`h-screen` compiles to `height: 100vh`. On mobile browsers, `100vh` is defined as the height of
the **large viewport** — the viewport as it would be with the browser's URL bar and toolbars
*retracted*. When those bars are visible (which they are on page load, and whenever the user
scrolls up), the actually-visible area is **60–110px shorter than `100vh`**, depending on
device and browser:

| Browser | Typical `100vh` overshoot |
|---|---|
| Chrome Android | ~56–72px |
| Safari iOS | ~75–110px (top bar + bottom tab bar) |
| Samsung Internet | ~60–80px |

The drawer is `position: fixed; top: 0`, so it is anchored to the top of the viewport and
extends `100vh` downward — meaning its bottom 60–110px lands **underneath the browser chrome,
outside the visible area**.

### Why the buttons specifically disappear

The drawer is a flex column with three children:

```
├── Header                       flex-none   (lines 81–100)
├── Free-shipping banner         flex-none   (lines 123–149)
├── Items list  <ul>             flex-1  overflow-y-auto   (lines 152–249)
└── Footer                       flex-none   (lines 252–290)   ← contains ALL the CTAs
    ├── Subtotal row
    ├── [ View Bag ] [ Checkout ]     grid-cols-2, h-12
    └── [ Continue Shopping ]         h-11
```

The footer is the **last** `flex-none` child, so it is pinned to the bottom of the 100vh box —
i.e. precisely into the 60–110px dead zone. The footer's own height is:

```
pt-4 (16) + subtotal row (~21 + pb-4 16) + grid h-12 (48) + mt-2 (8) + h-11 (44) + pb-6 (24)
= ~177px
```

So on a typical Android phone, roughly **the bottom 70px of a 177px footer is invisible** — the
"Continue Shopping" button is fully gone and "View Bag" / "Checkout" are partially clipped. On
iOS Safari with the bottom tab bar showing, the overshoot can consume the entire button block.

### Why the user cannot scroll to it

Three things combine to make this unrecoverable:

1. The drawer `<aside>` has **no `overflow-y`** — the panel itself does not scroll.
2. Only the inner `<ul>` scrolls (`flex-1 overflow-y-auto`, line 152) — and it stops where the
   footer begins, so scrolling it never reveals the footer.
3. Body scroll is locked (`document.body.style.overflow = "hidden"`, line 40) while the drawer
   is open, so the page behind cannot be moved either.

**Result: on mobile the cart drawer is a dead end.** The user adds an item, the drawer slides
in, they see their product and the subtotal, and there is no reachable way to proceed to
checkout. The only escape is the X or the backdrop.

### Reproduction

1. Open any product page on a real Android/iOS device (or DevTools device emulation with the
   "show device frame" toolbars — note that plain DevTools responsive mode does **not**
   reproduce this, because it has no URL bar; this is why the bug survived desktop testing).
2. Select a size → tap "Add to Bag".
3. Drawer opens. Scroll — nothing moves. The Checkout button is not reachable.

### Why desktop is unaffected

On desktop, `100vh` == the real viewport height. There is no URL-bar overshoot. This is exactly
why the owner reports "on desktop everything is working fine" — the bug is structurally
mobile-only.

### Severity

🔴 **Critical.** This single defect is sufficient to explain a 0% mobile conversion rate on a
site where ~83% of traffic is mobile.

---

## 🔴 F-02 — The WhatsApp floating button renders on top of the cart drawer's CTAs

**Location:** `components/common/whatsapp-button.tsx:13` vs `components/cart/cart-drawer.tsx:74`

```tsx
// whatsapp-button.tsx:13
className="group fixed bottom-6 right-6 z-50 ..."      // 56×56 image

// cart-drawer.tsx:74
className="fixed right-0 top-0 z-[49] ..."             // drawer panel
```

`z-50 > z-[49]`. The WhatsApp FAB is painted **above the cart drawer**, and it is rendered
unconditionally in `layout-shell.tsx:40` on every non-admin page — including while the drawer
is open.

### Geometry of the collision (mobile, drawer is full-width)

Measuring from the bottom edge of the viewport:

| Element | Vertical span | Horizontal span |
|---|---|---|
| WhatsApp FAB | 24px → 80px | 24px → 80px from right |
| Drawer "Continue Shopping" (`h-11`, `pb-6`) | 24px → 68px | full width |
| Drawer "Checkout" (`h-12`, right grid cell) | 76px → 124px | right half |

**"Continue Shopping" is entirely inside the FAB's footprint** on its right-hand side, and the
FAB's top edge clips the bottom ~4px of the "Checkout" button.

**Consequence:** even after F-01 is fixed and the footer becomes visible, a user tapping toward
the right side of the bottom CTA area **opens WhatsApp instead of proceeding to checkout**.
Two independent defects both had to be fixed for mobile checkout to work at all.

### The same FAB also collides elsewhere

- **PDP mobile sticky bar** (`add-to-cart-section.tsx:208`, `z-[45]`): the wishlist heart
  button (`h-12 w-12`, flush right) sits at 12px→60px vertical, flush to the right edge. The
  FAB at 24px→80px covers it almost completely. The heart is effectively untappable on mobile.
- **Checkout form:** `shipping-view.tsx:245` puts "Continue to payment" at the bottom-right of
  the form (`justify-between`, `h-14 px-10`). Whenever the user scrolls so that button is near
  the bottom of the screen, the FAB overlaps it.

### Severity

🔴 **Critical.** Blocks the primary CTA and hijacks taps to an external app.

---

## 🔴 F-03 — "Free Shipping Over Rs.3,500" is promised but never applied

**Location:** `components/cart/cart-drawer.tsx:10-11, 56, 123-135` vs
`app/cart/cart-view.tsx:17` and `app/checkout/shipping/shipping-view.tsx:28-32`

The cart drawer hardcodes its own constants and prominently advertises free shipping:

```tsx
// cart-drawer.tsx:10-11
const SHIPPING       = 250;
const FREE_THRESHOLD = 3500;

// cart-drawer.tsx:56  — computed…
const shipping = subtotal >= FREE_THRESHOLD ? 0 : SHIPPING;   // …and never rendered anywhere

// cart-drawer.tsx:124-135 — the promise, with a progress bar and a 🎉 celebration
"Free Shipping Over Rs.3,500"
"Amount Left for Free Shipping: Rs.X"
"🎉 You've unlocked free shipping!"
```

But the two places that actually compute what the customer pays ignore it completely:

```tsx
// app/cart/cart-view.tsx:17
const shipping = shippingCfg.standard;          // flat, no threshold check

// app/checkout/shipping/shipping-view.tsx:28-32
const shippingCost = method === "express" ? shippingCfg.express : shippingCfg.standard;
```

`lib/actions/settings.ts:34,80,125` **does** define and load a `freeThreshold` field, and
`app/admin/settings/page.tsx:332` exposes it in the admin UI with the label *"Orders above this
value ship free"*. A grep for `freeThreshold` across `app/`, `components/` and `lib/` shows it
is read in exactly three places: the type, the default, and the admin form. **It is never used
in any customer-facing price calculation.**

### The customer experience this produces

1. Customer adds Rs.4,200 of product.
2. Drawer shows a filled progress bar and *"🎉 You've unlocked free shipping!"*
3. Customer proceeds. `/cart` shows **Shipping: Rs.250**.
4. Checkout shows **Shipping: Rs.250**. Total is Rs.250 higher than promised.

Unexpected shipping cost at the final step is the **single most cited reason for cart
abandonment** in every published e-commerce study (Baymard puts it around 48% of abandonments).
Here the site is not merely revealing a cost late — it is **contradicting a promise it made
three screens earlier**, which is worse: it reads as a bait-and-switch.

### Also: the drawer is out of sync with admin settings

The drawer's `SHIPPING = 250` / `FREE_THRESHOLD = 3500` are hardcoded, while `/cart` and
checkout read live values from `lib/actions/settings.ts`. If the owner changes the shipping rate
in admin, **the drawer keeps advertising the old number.** The default `standard` in
`settings.ts:78` is `250`, but `app/admin/settings/page.tsx:187` seeds the form with `"200"` —
so the two are already capable of disagreeing out of the box.

### Severity

🔴 **Critical.** Trust-destroying, and it fires at the exact moment of highest purchase intent.

---

## 🟠 F-04 — The purchase-notification card covers the mobile Add-to-Bag button

**Location:** `components/common/purchase-notification.tsx:110` vs
`components/product/add-to-cart-section.tsx:208`

```tsx
// purchase-notification.tsx:110
fixed bottom-6 left-4 z-[60] w-[calc(100vw-2rem)] max-w-[384px]

// add-to-cart-section.tsx:208
fixed bottom-0 left-0 right-0 z-[45] ...
```

On mobile the notification card is `100vw − 2rem` wide — i.e. **nearly full-width** — and
`z-[60]` puts it above both the sticky bar (`z-45`) and the cart drawer (`z-49`).

**Geometry:** the card sits 24px from the bottom and is ~110px tall, so it occupies 24px→134px.
The sticky bar occupies 0→73px, with the "Add to Bag" button itself at 12px→60px. The card
therefore **covers roughly 36px of the 48px-tall Add to Bag button**, across nearly the full
screen width.

**Timing** (lines 7–9): first card after 8s, then every 60s, each visible for 8s.

So on every mobile product page, **the primary Add-to-Bag CTA is obscured for 8 seconds out of
every 60** — about 13% of the time, and the first occurrence lands at the 8-second mark, which
is roughly when a mobile shopper has finished reading the price and is reaching for the button.

The card also renders over the cart drawer and over the checkout form. It should not appear on
`/cart` or `/checkout/*` at all — suppressing distractions inside the funnel is standard
practice.

### Related: the card's content

`public/data/sold.json` drives cards labelled *"Verified"* with named customers and cities. If
these are not real orders, that is a fabricated-review problem with legal exposure under
consumer-protection rules and platform policies, separate from the layout issue. Worth
confirming the data source before this ships more widely.

### Severity

🟠 **High.** Intermittent but frequent obstruction of the primary CTA.

---

## 🟠 F-05 — The mobile quantity stepper is decorative; it never affects the order

**Location:** `components/product/add-to-cart-section.tsx:36, 216-236, 68-74` +
`lib/cart-store.ts:37-49`

The mobile sticky bar renders a working-looking qty stepper bound to local state:

```tsx
const [mobileQty, setMobileQty] = useState(1);          // line 36
// …stepper increments/decrements mobileQty (lines 216–236)
```

But `handleAdd` never reads it:

```tsx
function handleAdd() {                                   // line 68
  if (!canAdd) return;
  addItem({ id, slug, category, title, image, palette, price, compare_at, size, sku });
  //        ^ no quantity passed
  ...
}
```

And the store hardcodes a quantity of 1:

```ts
// lib/cart-store.ts:37-49
addItem: (item) => {
  const existing = get().items.find(i => i.cartKey === cartKey);
  if (existing) { ...qty: i.qty + 1 }              // always +1
  else          { ...{ ...item, cartKey, qty: 1 }} // always 1
}
```

`mobileQty` is written but **never read anywhere in the file.**

**Consequence:** a mobile customer who sets the quantity to 3 and taps "Add to Bag" gets **one**
item. Nothing warns them. They either notice in the drawer (and lose trust in the site's
correctness), or they don't notice and receive the wrong order — which becomes a return, a
refund, and a bad review.

Note the desktop path has no stepper at all, so this is mobile-only — consistent with the
overall pattern that the mobile path was never exercised end-to-end.

### Severity

🟠 **High.** Silent data loss on the primary conversion action.

---

## 🟡 F-06 — `drawerOpen` is persisted to localStorage

**Location:** `lib/cart-store.ts:30-66`

```ts
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,     // ← part of the persisted state
      ...
    }),
    { name: "hm-cart", storage: createJSONStorage(() => localStorage) }
    //  ↑ no `partialize` — the ENTIRE state object is written to localStorage
  )
);
```

With no `partialize`, zustand's `persist` middleware serialises every key — including the
transient UI flag `drawerOpen`. If a user closes the tab, navigates away, or their browser is
killed while the drawer is open, `drawerOpen: true` is written to `hm-cart` and **rehydrated on
their next visit** — so the cart drawer is already open, over the homepage, before they have
done anything.

Combined with F-01 (the drawer's exit affordances are partly off-screen on mobile) and F-02
(the WhatsApp FAB covers the remaining ones), a returning mobile visitor can land on a homepage
covered by a drawer they did not open and struggle to dismiss it. The X button at the top-right
(line 92) is still reachable, so this is recoverable — but it is a bad first impression on a
returning visitor, who is your highest-intent traffic.

`persist` should carry `items` only.

### Severity

🟡 **Medium.**

---

## 🟡 F-07 — No safe-area insets on any fixed bottom element

**Locations:** `add-to-cart-section.tsx:208`, `cart-drawer.tsx:252`,
`whatsapp-button.tsx:13`, `purchase-notification.tsx:110`, `cookie-consent.tsx:33`

None of the fixed bottom-anchored elements account for `env(safe-area-inset-bottom)`. On any
iPhone with a home indicator (X and later — a large share of premium PK mobile traffic) and on
Android gesture-navigation devices, the bottom ~34px is a system gesture area.

**Effect on the sticky Add-to-Bag bar** (`bottom-0`, `py-3`, `h-12` button): the button's lower
portion sits inside the gesture strip. Taps there are frequently swallowed by the OS as a
home-swipe. The user taps "Add to Bag", the app switcher appears, and they leave.

**Effect on the drawer footer:** stacks with F-01 — even after switching to `dvh`, the CTA row
would still land in the gesture strip without an inset.

I also could not find a `viewport-fit=cover` declaration, which is required for `env()` insets
to return non-zero values on iOS. That needs to be part of the fix.

### Severity

🟡 **Medium** on its own; compounds F-01 significantly.

---

## 🟡 F-08 — Checkout form has no autofill, and email is mandatory

**Location:** `app/checkout/shipping/shipping-view.tsx:80-94, 145-177, 57-67`

### No `autoComplete` attributes anywhere

The shared `field()` helper (lines 80–94) renders:

```tsx
<input type={type} placeholder={placeholder} value={...} onChange={...} className={...} />
```

There is **no `autoComplete` attribute** on any of the nine inputs, and none on the `<select>`.
Browser and OS autofill therefore cannot populate the form. On mobile — where typing a full
address on a touch keyboard is the single highest-friction step in the funnel — this forces
manual entry of ~7 fields.

The required attributes are the standard WHATWG tokens: `given-name`, `family-name`, `tel`,
`email`, `address-line1`, `address-line2`, `address-level2` (city), `address-level1`
(province), `postal-code`. `type="tel"` and `type="email"` are correctly set, so the keyboard
switches — but that only helps typing, not autofill.

### Email is a hard requirement

```tsx
// lines 61-62
if (!form.phone.trim()) e.phone = "Required";
if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
```

For a Pakistani cash-on-delivery audience, phone is the real identity and delivery-coordination
channel; email is often absent, mistyped, or a throwaway. Making it a blocking requirement adds
a field that some share of mobile buyers simply cannot complete. See `03-CRO-PLAYBOOK.md` for
the recommended treatment.

### Also

- Postal code is displayed with the same visual weight as required fields but is optional in
  `validate()` — no "(optional)" label. Users stop to look it up.
- `email.includes("@")` is a weak check; `a@` passes. Order confirmation emails will bounce.
- Validation is submit-only. On a long mobile form, submitting scrolls nowhere — errors appear
  above the fold while the user is looking at the button. There is no scroll-to-first-error.

### Severity

🟡 **Medium.** Pure friction, but it compounds across every field.

---

## 🟡 F-09 — Three co-equal CTAs in the drawer with no visual hierarchy

**Location:** `components/cart/cart-drawer.tsx:265-289`

```tsx
<div className="grid grid-cols-2 gap-2">
  <Link href="/cart"              className="... bg-ink text-ivory ...">View Bag</Link>
  <Link href="/checkout/shipping" className="... bg-ink text-ivory ...">Checkout</Link>
</div>
<button className="... border border-ink text-ink ...">Continue Shopping</button>
```

"View Bag" and "Checkout" are rendered with **byte-identical styling** — same background, same
size, same weight, same tracking — sitting side by side. Nothing signals which one is the step
forward. A third bordered button sits directly below.

This is a textbook hierarchy failure: when two options are presented identically, the user must
stop and read rather than recognise. On mobile, at a 11px uppercase font with 0.28em tracking,
in a bottom-of-screen strip, that read is genuinely hard. And "View Bag" is a **lateral** move —
it takes the user to a page showing the same information they are already looking at.

Recommended hierarchy is in `03-CRO-PLAYBOOK.md`.

### Severity

🟡 **Medium.** Dilutes the primary action; cheap to fix.

---

## 🟡 F-10 — GA4 is installed but no ecommerce events are fired

**Location:** `app/layout.tsx:119-126`

GA4 is loaded and `gtag('config', ...)` runs, so pageviews are collected. A grep for `gtag(`,
`dataLayer.push`, and `fbq(` across `app/`, `components/` and `lib/` returns hits in
`app/layout.tsx` only.

**No `view_item`, `add_to_cart`, `view_cart`, `begin_checkout`, `add_shipping_info`,
`add_payment_info`, or `purchase` events exist anywhere in the codebase.**

This is why the funnel is being diagnosed by inference. The owner can see 600–700 impressions
and 20–30 clicks in Search Console, and zero orders in the database, but has **no visibility
into the 5 steps in between**. There is no data answering: how many mobile users reached the
PDP? tapped Add to Bag? opened the drawer? reached `/checkout/shipping`? abandoned mid-form?

The bugs above are real and confirmed by code inspection — fixing them is not contingent on
this. But without event tracking there is no way to *verify* the fixes worked, or to find the
next bottleneck. Instrumentation should ship in the same release as the fixes so that a
before/after comparison exists.

### Severity

🟡 **Medium** for the bug itself, **High** as a strategic gap.

---

## 🟢 F-11 — Hardcoded stock and reservation claims

**Location:** `components/cart/cart-drawer.tsx:198`, `app/cart/cart-view.tsx:52`

```tsx
// cart-drawer.tsx:198 — rendered for every line item unconditionally
<span className="text-[11px] font-medium text-sage">In Stock</span>

// cart-view.tsx:52
{items.length} pieces · Held for 30 minutes.
```

Neither is backed by anything. "In Stock" is a literal — it is shown even for an item whose
stock has since gone to zero (the PDP *does* have real stock data via `sizesStock`, so the
correct value is available and simply is not being used). "Held for 30 minutes" implies an
inventory-reservation system that does not exist in this codebase.

The `git log` shows a recent commit — *"content: switch help/FAQ pages from TCS to PostEx, and
fix false claims"* — so the owner is already actively removing unsupported claims. These two are
the same category and were missed.

### Severity

🟢 **Low** functionally; matters for trust and consistency.

---

## 🟢 F-12 — Mobile navbar: sub-minimum tap targets and an overflowing logo

**Location:** `components/layout/navbar.tsx:69, 100, 141-163`

```tsx
<div className="mx-auto flex h-[52px] ... sm:h-[72px] ...">     // line 69
  ...
  <Image ... className="h-[60px] w-auto sm:h-[84px]" />          // line 100
```

The logo is **60px tall inside a fixed 52px container** — it overflows the header box by ~4px
top and bottom. On desktop the same mismatch exists (84px logo in a 72px bar).

The right-hand icon cluster (lines 141–163) renders **four** targets on mobile — Track, Account,
Wishlist, Cart — each `h-[18px]` icon with `p-2`, giving a **34×34px** tap target. Both Apple
(44×44pt) and Google (48×48dp) minimums are missed. The cart icon in particular — the entry
point to the whole funnel — is a 34px target competing for space with three lower-value icons.

`--header-h` in `app/globals.css:34` is set to `88px` (documented as "PromoBar ~36px + Navbar
mobile 52px"). Because the logo overflows, the rendered header is taller than the spacer
reserves, so page content can tuck under the fixed header.

### Severity

🟢 **Low** individually; contributes to overall mobile friction.

---

## Cross-cutting observations

### The mobile path was never tested on a real device

Every critical finding here is mobile-only and would be invisible in desktop DevTools
responsive mode (which has no URL bar, so it does not reproduce F-01, and which does not
render safe-area insets, so it does not reproduce F-07). The desktop path is genuinely sound —
which matches the owner's report exactly.

### Overlays are unmanaged

Five separate components render fixed overlays on every page — WhatsApp FAB, purchase
notifications, cookie consent, page loader, try-room popup — none of which are aware of the
others, or of whether the user is mid-funnel. On a 390px-wide screen, they compete for the same
bottom 150px of the screen where the primary CTAs also live. This needs a policy, not just
individual fixes. See `02-FIX-PLAN.md` Phase 3.

### There is no free-shipping logic anywhere in the pricing path

Worth restating because it is easy to read F-03 as a display bug. It is not. The feature is
configured in admin, typed in the settings module, advertised in the UI, and **not implemented**.

---

**Next:** [`02-FIX-PLAN.md`](02-FIX-PLAN.md) — sequenced remediation.
</content>
