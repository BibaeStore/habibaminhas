# 03 — CRO Playbook

**Status:** 📋 Recommendations. **Not implemented.**
**Audience:** Owner / marketing decisions.

This document answers the "how *should* it work" questions: where CTAs belong, what the
WhatsApp button should do, how the bag should behave on mobile, and what the Pakistani market
expects at checkout.

> **Sequencing reminder:** ship [`02-FIX-PLAN.md`](02-FIX-PLAN.md) Phase 1 first, alone, and
> let it run for 7–14 days with GA4 events in place. Everything below is optimisation on top of
> a working funnel. Optimising a broken funnel produces numbers you cannot interpret.

---

## 1. The mobile CTA hierarchy — the core principle

The current cart drawer offers three actions with near-equal visual weight:

```
┌─────────────────────────────────┐
│  Subtotal:            Rs.4,200  │
├────────────────┬────────────────┤
│   VIEW BAG     │    CHECKOUT    │   ← identical black buttons
├────────────────┴────────────────┤
│      CONTINUE SHOPPING          │   ← bordered button
└─────────────────────────────────┘
```

**The problem:** when a user opens the bag, they have already made the decision to buy. There
is exactly one action that matters. Presenting three options with similar weight forces a
*decision* where there should be a *reflex*. On a 360px screen, at 11px uppercase with 0.28em
letter-spacing, the user has to actually read three labels to find the one they want.

"View Bag" is the worst offender because it is a **lateral move** — `/cart` shows the same
items, the same subtotal, and the same checkout button the user is already looking at. It adds
a page load and a step for no new information.

### Recommended structure

```
┌─────────────────────────────────┐
│  Subtotal              Rs.4,200 │
│  Shipping                  FREE │   ← show it here, don't surprise later
│  ─────────────────────────────  │
│  Total                 Rs.4,200 │
│                                 │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃  CHECKOUT  ·  RS.4,200      ┃ │   ← ONE primary. Full width. h-14.
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                 │
│   Continue shopping    View bag │   ← plain text links, muted, small
│                                 │
│  🔒 Secure  ·  ↩ 14-day returns │   ← trust row, directly under the CTA
└─────────────────────────────────┘
```

**Why each change:**

| Change | Reason |
|---|---|
| One primary button, full width | Removes the decision. The eye goes to one place. |
| Price inside the button | Reduces uncertainty about what happens next — consistently one of the highest-lift micro-changes in checkout testing. The user commits to a known number. |
| `h-14` (56px) not `h-12` | Comfortably above the 44px minimum, and it reads as *the* action. |
| Shipping shown in the drawer | The #1 cause of cart abandonment is unexpected shipping cost at the final step. Show it at the first step instead. This also structurally prevents F-03 from recurring. |
| "Continue shopping" / "View bag" demoted to text links | They remain available for the minority who want them, without competing. |
| Trust row under the CTA | Placed at the moment of hesitation, not buried on another page. |

### The same principle on the PDP sticky bar

Current (`add-to-cart-section.tsx:214-261`): `[− 1 +] [ Add to Bag ] [♡]` — three controls
sharing one 360px row, with the Add to Bag button squeezed into the middle.

Recommended: **drop the quantity stepper from the sticky bar entirely.** For fashion retail,
>90% of orders are quantity 1 per size — the stepper occupies ~90px of the most valuable
horizontal space on the site to serve a rare case, and (per F-05) it does not currently work
anyway. Quantity belongs in the bag, where it already exists and functions correctly.

That frees the bar to be:

```
┌──────────────────────────────────────────┐
│  Rs.4,200   ┃  ADD TO BAG           ┃ ♡  │
│  Size: M    ┗━━━━━━━━━━━━━━━━━━━━━━━┛    │
└──────────────────────────────────────────┘
```

Showing the price and selected size in the bar means the user never has to scroll back up to
confirm what they are buying — a real friction point on long mobile PDPs.

---

## 2. Should the bag be a drawer or a page on mobile?

**Recommendation: keep the drawer, but make it a bottom sheet on mobile.**

A right-side slide-in panel is a desktop pattern. On a phone it occupies the full screen anyway,
so it is functionally a page — but it inherits the fragile `100vh` full-height geometry that
caused F-01, and it puts the CTA at the very bottom of a tall column.

A **bottom sheet** (slides up from the bottom, covers ~85% of the screen, rounded top edge)
is the native mobile convention, and structurally it puts the CTA within thumb reach by
default rather than at the far edge of the screen.

The thumb-reach point is not cosmetic. On a modern phone held one-handed, the comfortable zone
is the lower ~40% of the screen. The current design places the single most important button in
the site at the extreme bottom edge — which is *technically* in the thumb zone, but is also
exactly where the OS gesture bar, the WhatsApp FAB, and the notification card all live. That
crowding is the root of three separate findings in this audit.

**If the drawer is kept as-is** (a reasonable choice — it is less work), the non-negotiables are:
`dvh` sizing, a pinned always-visible footer, safe-area padding, and nothing else allowed to
render in that bottom strip.

---

## 3. Checkout form — what the Pakistani market actually needs

The current form (`shipping-view.tsx`) asks for nine fields across two sections before the
user can move to payment. For a COD-dominant mobile market, that is heavy.

### Recommendations, in priority order

**a) Make email optional.** Currently blocking (`shipping-view.tsx:62`). For a COD audience,
phone is the identity — it is how the courier coordinates delivery and how the customer
expects to be contacted. A meaningful share of mobile buyers in this market either have no
email they check or will abandon rather than type one. If email is needed for order
confirmations, ask for it *after* the order is placed, on the confirmation screen, where the
user has already converted and has a reason to give it.

If it must stay required, at minimum explain why inline: *"For your order confirmation and
tracking link."* An unexplained required field reads as data harvesting.

**b) Add `autoComplete` to every field.** (F-08.) This is the single highest-leverage change in
this section — it can turn seven manual entries into one tap for returning and autofill-enabled
users. It is a one-line-per-field change.

**c) Consider collapsing to a single-page checkout.** Three steps (Bag → Shipping → Payment)
means three page loads and three opportunities to abandon. For a catalogue this size with COD
as the dominant method, a single scrolling page with the order summary pinned is measurably
better. This is a larger change — treat it as a Phase 5 experiment, not a Phase 1 fix, and only
after the funnel is instrumented well enough to prove it.

**d) Show the order total on mobile while the form is being filled.** Currently the summary
`<aside>` is second in DOM order (`shipping-view.tsx:255`), so on mobile it renders *below* the
entire form. The user fills in nine fields without seeing what they are paying. A collapsed
"Order total: Rs.4,450 ⌄" bar pinned to the top of the form solves this.

**e) A sticky "Continue to payment" CTA on mobile.** Right now it is an inline button at the
end of a long form (`shipping-view.tsx:245`). The user has to scroll to find it — and, per F-02,
the WhatsApp FAB may be sitting on it when they do.

**f) COD should be the visually default payment method.** `payment-view.tsx:24` already lists
`cod` first in `ALL_PAYMENT_OPTIONS` and it is selected by default — good. Consider giving it a
"Most popular" tag, which reassures first-time buyers that paying on delivery is normal here.

---

## 4. Free shipping — ~~AOV lever~~ removed

> **DECIDED 2026-07-31: the owner is not offering free shipping on any method.** The promise and
> its progress bar are being deleted from the drawer in Phase 1.5. This section is retained as
> a record of what was given up, not as a recommendation to revisit now.

For the record: a free-shipping threshold with a visible progress bar is one of the more
reliable average-order-value levers in e-commerce, and the drawer's implementation of the *UI*
(`cart-drawer.tsx:123-149`) was good — it just was never wired to the pricing. Removing it is a
legitimate call: a flat, always-honest Rs.250 beats a promise the system does not keep, and it
is far cheaper to ship than making the threshold real across four files.

**What to do instead, now that the promise is gone.** The drawer will show only a Subtotal, and
the customer first meets the Rs.250 charge on `/cart`. That is honest and early enough. But the
stronger move — and the one worth doing after Phase 1 — is to show the shipping line **in the
drawer**:

```
Subtotal              Rs.4,200
Shipping                Rs.250
──────────────────────────────
Total                 Rs.4,450
```

Flat, predictable, disclosed at the first possible moment. It removes the payment-step surprise
entirely, which is the actual mechanism behind the shipping-related abandonment statistic — the
problem is the *surprise*, not the fee. A store that shows Rs.250 from the first screen has no
surprise to spring.

**If free shipping is ever reconsidered:** set the threshold 20–30% above the real average
order value (Rs.3,500 was a guess made with no order data), and implement it in
`cart-view.tsx`, `shipping-view.tsx`, and `payment-view.tsx` — not only in the drawer's copy.
That is what went wrong the first time.

---

## 5. The WhatsApp button — the owner's specific question

**Question asked:** is the bottom-right floating WhatsApp icon in a good place? Should it be
hidden, merged with Add to Cart, or left where it is?

**Answer: keep it, but move it, shrink it, and remove it from the funnel.**

### Why keep it

WhatsApp is not a nice-to-have in the Pakistani e-commerce market — it is a primary sales
channel. A large share of buyers, particularly first-time buyers on an unfamiliar site, want to
ask "is this available in medium?" or "how long is delivery to Multan?" before committing.
Removing that channel would cost real sales. The shipping form already acknowledges this by
labelling the phone field *"Phone number (WhatsApp preferred)"*.

There is also a specific signal in the traffic pattern worth naming: **20–30 clicks/day with
zero checkouts.** Some of those visitors may not be abandoning — they may be converting through
WhatsApp, into a channel with no tracking attached. That is worth checking directly with the
sales inbox before concluding the funnel is producing nothing.

### Why the current placement is wrong

Three concrete collisions, all documented in [`01-AUDIT-FINDINGS.md`](01-AUDIT-FINDINGS.md) F-02:

1. **It sits on top of the cart drawer's "Continue Shopping" button** (`z-50` > `z-49`, and its
   24–80px bottom band fully contains the button's 24–68px band). A user tapping toward the
   right of the drawer's CTA area gets WhatsApp instead of checkout.
2. **It covers the wishlist heart** on the PDP sticky bar — the heart is flush-right at
   12–60px, the FAB is at 24–80px.
3. **It appears during checkout**, where every serious store strips distractions. A floating
   "chat with us" button at the payment step is an exit ramp placed at the finish line.

At 56px with a drop-shadow it is also visually louder than the actual Add-to-Bag button in some
viewport positions — a support channel out-competing the buy button.

### Recommended treatment

| Aspect | Current | Recommended |
|---|---|---|
| z-index | `z-50` (above drawer) | `z-[46]` — above content, below drawer |
| Mobile position | `bottom-6 right-6` | `bottom-[calc(5.5rem+safe-area)]` on PDPs — clears the sticky bar |
| Size (mobile) | 56px | ~48px |
| On `/checkout/*` | Shown | **Hidden** |
| While drawer is open | Shown, on top | **Hidden** |
| On `/cart` | Shown | Shown, repositioned |

### Should it be merged with Add to Cart?

**No — not as a co-equal button.** They serve opposite intents: Add to Bag is a commitment,
WhatsApp is a hesitation. Giving them equal weight in the same row tells the hesitant user that
not-buying is an equally valid path, and it halves the visual weight of the primary CTA.

The existing **desktop** treatment is already correct: `add-to-cart-section.tsx:179-186` places
"Inquire on WhatsApp" as a distinct, clearly-secondary button *below* Add to Bag and Wishlist,
in WhatsApp green, with product context pre-filled in the message
(`add-to-cart-section.tsx:90-95`). That is a good pattern. **The mobile PDP has no equivalent** —
mobile users get only the generic floating FAB with no product context, so an enquiry arrives
as "Hi" with no idea which garment it is about.

**Recommendation:** add the contextual "Inquire on WhatsApp" button to the mobile PDP as a
secondary action *in the scrollable content*, below the size selector — not in the sticky bar.
Keep the FAB as a general-purpose channel, repositioned as above. Same button, two intents,
correctly ranked.

---

## 6. Urgency and social proof — doing it honestly

The site currently uses two urgency devices, and neither is backed by anything (F-11):

- `"In Stock"` — a hardcoded literal on every cart line, shown regardless of actual stock.
- `"Held for 30 minutes"` — implies a reservation system that does not exist.

These should be removed or made real. Beyond the honesty issue, they are *weak* urgency —
"In Stock" on every item carries no information, so shoppers learn to ignore it, and it trains
them to discount the site's other claims too.

**Honest alternatives, all backed by data this codebase already has:**

| Device | Data source | Example |
|---|---|---|
| Real low-stock warning | `sizesStock` (already on the PDP) | *"Only 2 left in M"* |
| Real size scarcity | `sizesStock` | *"S and XL sold out"* |
| Free-shipping gap | Cart subtotal | *"Rs.800 away from free delivery"* — already built, just make it true |
| Genuine recent orders | The `orders` table | *"14 orders this week"* |

On the purchase-notification card (`purchase-notification.tsx`, sourced from
`public/data/sold.json`): it is labelled *"Verified"* and shows named customers with cities. **If
that data is not real orders, it should be removed** — fabricated purchase notifications are a
consumer-protection problem, not just a design one. If it *is* real, it is a strong asset that
needs three changes: never render inside the funnel, never overlap the CTA (F-04), and reduce
frequency from every 60s to every 3–4 minutes.

---

## 7. What competitors in this market do

Useful reference points, all verifiable directly on their mobile sites:

| Store | Pattern worth copying |
|---|---|
| **Sapphire** | Sticky bottom Add-to-Bag with price in the bar; free-shipping progress in the cart |
| **Khaadi** | Bottom-sheet cart; single full-width checkout CTA; COD prominent |
| **Gul Ahmed** | Size scarcity shown per-size on the PDP; order summary pinned during checkout |
| **Sana Safinaz** | Guest checkout with no account wall; minimal field count |
| **Limelight** | WhatsApp order option as a clearly secondary CTA, product context pre-filled |

Common to all of them: **one primary CTA per screen**, COD visible early, and nothing floating
over the buy button.

---

## 8. Prioritised roadmap

| # | Change | Effort | Expected impact | Phase |
|---|---|---|---|---|
| 1 | Fix drawer `100vh` (F-01) | XS | **Unblocks mobile checkout entirely** | 1 |
| 2 | WhatsApp/notification z-index + suppression (F-02, F-04) | XS | Unblocks CTA taps | 1 |
| 3 | Honour free-shipping threshold (F-03) | S | Removes bait-and-switch at payment | 1 |
| 4 | GA4 ecommerce events (F-10) | S | Makes everything else measurable | 1 |
| 5 | Fix qty stepper (F-05) | XS | Correct orders | 2 |
| 6 | `autoComplete` on checkout (F-08) | XS | Large mobile friction reduction | 4 |
| 7 | Single primary CTA + price in button (§1) | S | Removes decision friction | post-1 |
| 8 | Email optional (§3a) | XS | Removes a blocking field | post-1 |
| 9 | Safe-area insets (F-07) | S | Fixes iPhone gesture-strip taps | 3 |
| 10 | Mobile order summary during checkout (§3d) | M | Reduces surprise at payment | 4 |
| 11 | Contextual WhatsApp on mobile PDP (§5) | S | Captures pre-purchase questions | 3 |
| 12 | Bottom-sheet cart (§2) | M | Native feel, structurally safer CTA | later |
| 13 | Single-page checkout (§3c) | L | Fewer abandonment points | experiment |

Items 1–4 are the release that matters. Everything else is optimisation on a funnel that works.

---

## 9. One caution about expectations

The traffic figures — 600–700 impressions, 20–30 clicks/day — are Search Console *impression*
and *click* numbers, which measure the search result, not the site. 20–30 daily sessions is a
small base: even a perfectly-converting fashion store at a 1.5–2.5% rate would produce roughly
**one order every 1.5–3 days** at that volume.

So: the bugs in this audit are real, confirmed by code inspection, and almost certainly
responsible for the current zero. Fixing them should move the number off zero. But do not
expect the fix to produce a stream of daily orders at this traffic level — the next constraint
after the funnel is fixed will be **traffic volume**, which is what the existing SEO roadmap
(`docs/seo-optimization-2026/`) is already addressing.

Fix the funnel first — there is no point sending more traffic into a bag with no exit. Then
scale the traffic into it.
</content>
