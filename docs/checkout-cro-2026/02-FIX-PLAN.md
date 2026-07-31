# 02 — Fix Plan

**Status:** 📋 Proposed. **Not implemented.** Awaiting owner approval.
**Prerequisite reading:** [`01-AUDIT-FINDINGS.md`](01-AUDIT-FINDINGS.md)

---

## Sequencing principle

Phase 1 is everything that **blocks a purchase**. It is small, low-risk, and should ship on its
own so that its effect is measurable in isolation. Phases 2–4 are correctness, distraction
control, and optimisation, in that order.

Do **not** bundle Phase 1 with the CRO redesign in `03-CRO-PLAYBOOK.md`. If the redesign ships
in the same release, there will be no way to tell whether recovered conversions came from
unblocking the button or from the new layout — and that attribution matters for every decision
after this one.

Per the project's branch-per-feature convention, each phase gets its own branch and is pushed
for review before any merge to `main`.

---

## Phase 1 — Unblock mobile checkout 🔴

**Branch:** `fix/mobile-checkout-blockers`
**Addresses:** F-01, F-02, F-03
**Estimated size:** ~6 files, small diffs
**Ships alone.**

### 1.1 — Make the cart drawer fit the visible viewport (F-01)

**File:** `components/cart/cart-drawer.tsx:74`

Replace `h-screen` with the dynamic viewport unit, with a static fallback for older browsers:

```
h-screen            →   h-[100svh] supports-[height:100dvh]:h-[100dvh]
```

Why `svh` as the base and `dvh` as the enhancement:

| Unit | Meaning | Behaviour |
|---|---|---|
| `vh` | Large viewport (URL bar hidden) | **Current — overshoots, causes the bug** |
| `svh` | Small viewport (URL bar shown) | Always fits. Never clips. May leave a gap when bars retract. |
| `dvh` | Dynamic — tracks the current state | Always exactly right, but animates as bars show/hide |

`dvh` is correct in every browser that supports it (Chrome 108+, Safari 15.4+, Firefox 101+ —
comfortably >95% of PK mobile traffic). `svh` guarantees the buttons are reachable in the
remainder. Either way the failure mode becomes "small gap at the bottom", never "buttons
invisible".

**Belt-and-braces:** also give the `<aside>` `max-h-[100dvh] overflow-hidden` so that if the
content ever exceeds the viewport, the panel clips rather than pushing the footer out of view.
The footer must be structurally guaranteed to be on screen, not merely arithmetically likely.

**Same treatment needed at** `components/layout/mobile-menu.tsx:46` (`h-full` on a fixed
element resolves against the layout viewport and has the same class of problem, though it is
less severe there because the menu's content scrolls).

### 1.2 — Add safe-area padding to the drawer footer (F-07, partial)

**File:** `components/cart/cart-drawer.tsx:252`

```
pb-6   →   pb-[max(1.5rem,env(safe-area-inset-bottom))]
```

And add `viewport-fit=cover` to the viewport meta in `app/layout.tsx` — without it, `env()`
returns `0` on iOS and the padding does nothing.

**Verification for 1.1 + 1.2:** on a real iPhone (Safari) and a real Android (Chrome), open a
PDP, add to bag, and confirm the Checkout button is fully visible and tappable **both** with
the URL bar shown (immediately on load) and hidden (after scrolling down). DevTools responsive
mode does not reproduce this — a real device or BrowserStack is required.

### 1.3 — Put the WhatsApp FAB and the notification below the drawer (F-02, F-04)

**Files:** `components/common/whatsapp-button.tsx:13`,
`components/common/purchase-notification.tsx:110`, plus a new constants file.

Introduce a single documented z-index scale and use it everywhere. Proposed:

```ts
// lib/z-index.ts
export const Z = {
  header:        40,   // fixed promo bar + navbar
  stickyBar:     45,   // PDP mobile Add-to-Bag
  floatingCta:   46,   // WhatsApp FAB          ← was 50
  toast:         47,   // purchase notification ← was 60
  overlayBackdrop: 48,
  overlayPanel:  49,   // cart drawer, mobile menu
  modal:        100,   // try-on, try-room popup, size guide
  consent:      110,   // cookie banner         ← was 9998
  loader:       120,   // page loader           ← was 9999
} as const;
```

The specific numbers matter less than the ordering and the fact that they live in one file with
a comment explaining the layering. The current values (9998, 9999, 200, 100, 60, 50, 49, 48, 45)
were chosen independently per component and will keep colliding otherwise.

**Minimum change to unblock Phase 1:** WhatsApp `z-50 → z-[46]`, notification `z-[60] → z-[47]`.
The full scale can follow in Phase 3.

### 1.4 — Hide the FAB and notifications when the drawer is open

> **DECIDED 2026-07-31 by the owner: the WhatsApp button stays in the bottom-right corner.**
> Phase 1 does not move it. Only its stacking and its visibility inside the funnel change.

Lowering the z-index stops the FAB painting *over* the drawer. On top of that, suppress both
the FAB and the notification while the drawer is open, by reading
`useCartStore(s => s.drawerOpen)` in `layout-shell.tsx` and not rendering them. This is the
cheapest guaranteed fix and removes any dependence on getting the stacking exactly right.

**Known remaining collision, deferred to Phase 3:** with the FAB staying at `bottom-6 right-6`,
it still overlaps the **wishlist heart** on the mobile product page — the heart occupies
12–60px from the bottom flush right, the FAB occupies 24–80px, and the FAB is `z-46` vs the
sticky bar's `z-45`. This does **not** block checkout (the Add-to-Bag button itself is clear),
so it is not a Phase 1 blocker. The Phase 3 fix is a ~40px vertical nudge on product pages only
— still the bottom-right corner, just sitting above the sticky bar instead of on it. Needs the
owner's nod before it is applied.

### 1.5 — Remove the free-shipping promise (F-03)

> **DECIDED 2026-07-31 by the owner: Option B — remove it.** Free shipping is not offered on
> any method. Shipping is a flat charge at all times. Option A (implementing the threshold) is
> recorded below for history only and is **not** being built.

**Files:** `components/cart/cart-drawer.tsx:10-11, 56, 123-149`

The fix is a deletion — the checkout pricing code is already correct under this decision, since
`cart-view.tsx:17` and `shipping-view.tsx:28-32` already charge flat rates with no threshold
logic. **Nothing in the pricing path changes.** Only the drawer's false advertising is removed:

1. Delete the constants at lines 10–11 (`SHIPPING = 250`, `FREE_THRESHOLD = 3500`).
2. Delete the derived values at lines 56–58 (`shipping`, `remaining`, `progress`) — `shipping`
   was already computed and never rendered; the other two only feed the banner.
3. Delete the entire free-shipping banner block at lines 123–149: the "Free Shipping Over
   Rs.3,500" heading, the "Amount Left for Free Shipping" line, the "🎉 You've unlocked free
   shipping!" line, and the progress bar with its Rs.0 / Rs.3,500 labels.

After this the drawer's promise and the checkout's charge agree, because the drawer makes no
promise at all.

**Leave `freeThreshold` in place** in `lib/actions/settings.ts` and the admin form. It is
harmless where it is, and removing a configured field is a separate decision. Just note in
`admin.md` that it is currently inert so nobody sets it expecting an effect.

**Follow-up worth doing after Phase 1 (not in Phase 1):** with free shipping gone, the customer
now first learns about the Rs.250 charge on `/cart`. That is honest and it is step 1 of 3, so it
is acceptable — but showing a `Shipping  Rs.250` line in the drawer alongside Subtotal would be
better still, removing any surprise entirely. It is deliberately out of Phase 1 scope because it
requires threading `ShippingConfig` into a client component (a context provider in
`layout-shell.tsx`, or a small settings store), and Phase 1 is meant to stay small and
low-risk. Tracked in `TRACKER.md` under post-Phase-1.

Also reconcile the default mismatch: `lib/actions/settings.ts:78` seeds `standard: 250`,
`app/admin/settings/page.tsx:187` seeds `"200"`.

**Verification:** add Rs.4,000 of product → drawer says free shipping → `/cart` shows
Shipping Rs.0 → checkout shows Shipping Rs.0 → order total in the database excludes shipping.
Then repeat with Rs.2,000 and confirm Rs.250 is charged consistently at all four points.

---

## Phase 2 — Correctness 🟠

**Branch:** `fix/cart-correctness`
**Addresses:** F-05, F-06, F-11

### 2.1 — Make the mobile quantity stepper work (F-05)

**Files:** `lib/cart-store.ts:24,37-49`, `components/product/add-to-cart-section.tsx:68-74`

Add an optional quantity parameter to the store action:

```ts
addItem: (item: Omit<CartItem, "cartKey" | "qty">, qty = 1) => { ... }
```

…incrementing by `qty` on an existing line and seeding `qty` on a new one. Then pass `mobileQty`
from `handleAdd`. Reset `mobileQty` to 1 after a successful add so the next product starts clean.

`handleTryOnClick` (line 61) also calls `addItem` — it should keep passing 1, since try-on is
not an explicit purchase-quantity decision.

**Also worth deciding:** the try-on flow silently adds the product to the bag before the modal
opens (line 64, with the comment "Silently add product to bag"). A user who tries a garment on
and decides against it now has it in their cart without ever asking for it. That inflates the
badge with unwanted items and produces surprise at checkout. Recommend adding *after* the user
acts on the modal, not before — flagging it here rather than in Phase 2 scope because it is a
product decision, not a bug fix.

### 2.2 — Stop persisting UI state (F-06)

**File:** `lib/cart-store.ts:65`

```ts
{
  name: "hm-cart",
  storage: createJSONStorage(() => localStorage),
  partialize: (s) => ({ items: s.items }),     // ← add this
}
```

**Verification:** open the drawer, close the tab, reopen the site — the drawer must be closed
and the items must still be there.

### 2.3 — Remove unsupported claims (F-11)

**Files:** `components/cart/cart-drawer.tsx:198`, `app/cart/cart-view.tsx:52`

Either drive "In Stock" from real stock data (available via `sizesStock` on the PDP — it would
need to be captured into the cart item at add time) or remove the badge. Remove "Held for 30
minutes" unless a reservation system is built.

If the owner wants urgency in the bag, use something true instead — see
`03-CRO-PLAYBOOK.md` §6.

---

## Phase 3 — Distraction control & layout 🟡

**Branch:** `feat/checkout-focus`
**Addresses:** F-04, F-07, F-12, plus the overlay policy

### 3.1 — Overlay suppression policy

Establish, in `components/layout/layout-shell.tsx`, a single rule for what may appear where:

| Route | WhatsApp FAB | Purchase notification | Cookie consent | Try-room popup |
|---|---|---|---|---|
| Home, collections, journal | ✅ | ✅ | ✅ | ✅ |
| Product detail (PDP) | ✅ (repositioned) | ❌ | ✅ | ✅ |
| `/cart` | ✅ | ❌ | ✅ | ❌ |
| `/checkout/*` | ❌ | ❌ | ❌ | ❌ |
| Cart drawer open | ❌ | ❌ | — | ❌ |

**Rationale:** everything competing for attention inside the funnel is, by definition, competing
with the purchase. This is standard for every serious e-commerce checkout — Shopify's own
checkout strips the site nav entirely for this reason. `layout-shell.tsx` already reads
`usePathname()` for its admin/invoice check, so the plumbing exists.

### 3.2 — Reposition the WhatsApp FAB above the sticky bar

**File:** `components/common/whatsapp-button.tsx:13`

On mobile PDPs the FAB must clear the 73px sticky bar plus the safe-area inset:

```
bottom-6   →   bottom-6 max-lg:bottom-[calc(5.5rem+env(safe-area-inset-bottom))]
```

Reduce the mobile size from `h-14 w-14` (56px) to ~48px so it is present but not dominant. Full
discussion of whether the FAB should exist at all is in `03-CRO-PLAYBOOK.md` §5 — **short answer:
keep it, move it, shrink it, and hide it inside the funnel.**

### 3.3 — Safe-area insets on all fixed bottom elements

Apply the `pb-[max(…,env(safe-area-inset-bottom))]` treatment from 1.2 to the PDP sticky bar
(`add-to-cart-section.tsx:208`), the notification card, and the cookie banner. Confirm
`viewport-fit=cover` is set.

### 3.4 — Bottom clearance on scrollable content

`app/product/[category]/[slug]/page.tsx:249,262` use `pb-16` (64px) on sections that sit above
the 73px sticky bar — content is clipped. Standardise on a `pb-[calc(5rem+env(safe-area-inset-bottom))]`
utility for any page that renders the sticky bar, and confirm the global footer is not the last
thing hidden behind it.

### 3.5 — Navbar (F-12)

- Fix the logo/container height mismatch (`navbar.tsx:69` vs `:100`); reconcile `--header-h`
  in `app/globals.css:34,40` with what actually renders.
- Raise mobile tap targets to ≥44px.
- Consider dropping Track and Account from the mobile icon row into the hamburger menu — four
  icons at 34px each is worse than two at 44px, and the cart is the one that matters.

---

## Phase 4 — Measurement & checkout optimisation 🟡

**Branch:** `feat/checkout-analytics` and `feat/checkout-ux`
**Addresses:** F-08, F-10

### 4.1 — GA4 ecommerce events (F-10) — do this *with* Phase 1, not after

Fire the standard GA4 events at these exact points:

| Event | Where |
|---|---|
| `view_item` | PDP mount |
| `add_to_cart` | `add-to-cart-section.tsx` `handleAdd` |
| `view_cart` | drawer open + `/cart` mount |
| `begin_checkout` | `/checkout/shipping` mount |
| `add_shipping_info` | `handleContinue` success |
| `add_payment_info` | payment method selected |
| `purchase` | `handlePlaceOrder` success, with `transaction_id` = order number |

Without this there is no way to prove Phase 1 worked. It is the cheapest high-value item in
this entire document and should ship in the same release as the blocker fixes so that a clean
before/after exists.

Also worth adding: Meta Pixel, if the owner runs or plans to run paid social — retargeting cart
abandoners is the highest-ROI paid channel available to a store this size.

### 4.2 — Checkout form friction (F-08)

- `autoComplete` on all nine fields + the province select.
- Make email optional, or clearly mark it optional with a reason
  (*"for your order confirmation and tracking link"*). See `03-CRO-PLAYBOOK.md` §3.
- Label postal code "(optional)".
- Replace `email.includes("@")` with a real pattern check.
- Validate on blur, not only on submit; scroll to and focus the first error on failed submit.
- Show a sticky order-total summary on mobile so the total is never off-screen — currently
  the summary `<aside>` is second in DOM order (`shipping-view.tsx:255`) so on mobile it sits
  below the entire form and is invisible while filling it in.

---

## Testing matrix

Every phase must be verified at these widths, **on real devices for the mobile column** —
DevTools responsive mode does not reproduce F-01 or F-07:

| Width | Device class | Must verify |
|---|---|---|
| 360px | Small Android | Drawer CTAs visible w/ URL bar shown; no overlay collisions |
| 390px | iPhone 14/15 | Safe-area insets; gesture strip does not eat the CTA |
| 430px | iPhone Pro Max | As above |
| 768px | iPad portrait | Drawer max-w-420 behaviour; sticky bar hidden (`lg:hidden` — **note: at 768px the mobile bar is still shown, since `lg` = 1024px. Confirm this is intended on tablet.**) |
| 1024px | iPad landscape / small laptop | Desktop Add-to-Bag path takes over |
| 1440px | Desktop | Regression check — this path currently works |

**Tablet note:** the `lg:` breakpoint (1024px) means iPads in portrait *and* landscape get the
mobile sticky-bar experience, including the broken qty stepper. Worth an explicit decision —
the audit assumes the mobile treatment is intended for tablet, but it has clearly never been
looked at.

---

## What NOT to do

- **Do not** fix F-01 by removing the body scroll lock or making the whole drawer scrollable.
  That hides the CTA below the fold instead of below the viewport — a different bug with the
  same outcome. The footer must be pinned and always visible.
- **Do not** raise the drawer's z-index above 50 to beat the WhatsApp button. That fixes one
  collision and leaves the underlying unmanaged-stack problem for the next component.
- **Do not** ship the CRO redesign in Phase 1. Attribution matters.
- **Do not** delete the purchase notification outright before checking whether `sold.json`
  represents real orders — if it does, it is a legitimate and effective social-proof asset that
  just needs to be positioned and scheduled correctly.

---

**Next:** [`03-CRO-PLAYBOOK.md`](03-CRO-PLAYBOOK.md) — the conversion-optimisation layer.
</content>
