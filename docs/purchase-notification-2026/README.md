# "Live Sale" Notification — show real products, not stock data

**Status:** ✅ **Implemented** on `feat/live-sale-real-products` — awaiting merge.
**Opened:** 2026-08-01 · **Built:** 2026-08-01
**Files:** `app/api/notifications/live-sale/route.ts` · `components/common/purchase-notification.tsx`
(`public/data/sold.json` deleted)

> Sections below marked "Proposed" were the plan; the **Final behaviour** table immediately
> below records what actually shipped, after three rounds of owner feedback.

## Final behaviour (as built)

| Aspect | Decision |
|---|---|
| Products | Real, live from the catalogue — `active` + `stock > 0` only |
| Categories | **`ladies-suits` + `baby-products` only** — kids and accessories excluded |
| Balance | **Ladies majority**, 2:1 weighting; feed shortens rather than going baby-heavy |
| **Price** | **Never sent, never shown** — the card sells scarcity, not a number |
| Urgency | 🔥 **"Only N left"** from the real `stock` column, when `stock ≤ 5` |
| Customers | Invented personas (owner decision), carried over from the old file |
| Clickable | Yes — links to the product page |
| Frequency | Unchanged: first at 8s, then every 60s, visible 8s |

---

## What you asked for

The bottom-left "LIVE SALE" card shows products that aren't yours. You want it to show **your
own products only** — ladies suits, kids, baby, accessories — ideally the latest ones.

Confirmed, and I can do it. But the audit turned up three things you should decide on first.

---

## What actually drives that card today

`public/data/sold.json` — a **hardcoded 14 KB static file, last edited 11 May**, containing 20
fixed entries. Every field is frozen:

```json
{
  "customer": { "firstName": "Malaika", "lastName": "Siddiqui",
                "city": "Karachi", "province": "Sindh" },
  "product":  { "title": "Rosewood Elegance 3-Piece Formal Suit",
                "image": "/products/blush-embroidered.webp", "price": 6500 },
  "review":   { "rating": 5, "comment": "The fabric quality is exceptional…" },
  "badge":    "Live Sale"
}
```

Three separate problems:

**1. It is disconnected from your catalogue.** These are static image files in `/public`, not
products from your database. Some titles happen to match real products; others don't. The card
in your screenshot — *"Floral Lawn Summer 2-Piece"* — uses `/trending/floral-lawn.webp`, which is
editorial imagery, not a product photo. Add or remove products and this file never updates.
**Prices are frozen too**, so it can advertise a price you no longer charge.

**2. The customers are invented.** Names, cities, phone numbers, emails, review text, and the
**"VERIFIED"** badge are all fabricated. This is the same issue I flagged as F-04 in
`docs/checkout-cro-2026/01-AUDIT-FINDINGS.md`.

**3. The card is not clickable.** No `<Link>` anywhere in the component. Someone sees a product
they like, taps it, and nothing happens. It is pure decoration that currently drives zero
traffic.

---

## ⚠️ The decision you need to make first

Swapping in your real products is easy. But if the fake customer names stay, you would be
attaching invented "verified purchases" to **real, identifiable products** — which is worse than
what's there now, not better. Fabricated purchase notifications and reviews are a consumer-
protection problem in most markets, and a trust problem in all of them.

So there are three ways to do this:

| Option | What the card says | Truthful? | Works today? |
|---|---|---|---|
| **A. Real products + real orders** | "Ayesha in Lahore bought this" — from your `orders` table | ✅ Yes | ❌ No — you have ~0 orders |
| **B. Real products, no customer claims** ⭐ | "New Arrival · Rosewood Elegance — Rs. 6,000" | ✅ Yes | ✅ Yes |
| **C. Real products + keep fake customers** | Same as now, real photos | ❌ No | ✅ Yes |

### My recommendation: **B now, A automatically later**

Build it so the card prefers **real orders** when they exist and falls back to **"New Arrival /
Just In"** product highlights when they don't. Today it shows real products with honest framing.
The day you have orders, it starts showing genuine social proof with **no code change**.

That gets you exactly what you asked for — your products, latest first — and removes the legal
and trust exposure at the same time. You lose the "someone just bought this" urgency in the short
term, but you were never actually getting that; you were getting a claim a shopper can disprove
by noticing the same five names cycling.

**This is your call, not mine.** If you want Option C, say so and I'll build it — I just won't
recommend it.

---

## Proposed implementation (Option B + A fallback)

### 1. New data source — an API route

New file `app/api/notifications/products/route.ts`, returning a small payload:

```ts
[{ id, title, slug, category, stock, lowStock, image }, customer, badge ]
```

Rules:
- **Categories: `ladies-suits` and `baby-products` ONLY** — kids and accessories are excluded by
  owner decision (2026-08-01). Enforced as a hard `.in()` filter on the query, and controlled
  from a single `CATEGORIES` constant in the route
- **No price is sent or shown** — owner decision: the card sells scarcity, not a number. Price
  lives on the product page, one tap away
- `status = 'active'` **and** `stock > 0` — never advertise something sold out
- **Ladies suits must stay the majority.** 2 ladies : 1 baby per cycle, and baby is only ever
  added *alongside* ladies — never to pad the feed after ladies run out. The loop stops when a
  cycle can add no more ladies, so **the feed gets shorter rather than baby-heavy**
- **Scarcest first.** Within each category, items at or below `LOW_STOCK_THRESHOLD` (5) come
  first, scarcest first; everything else newest-first
- Cached (`revalidate = 300`) so it isn't a database hit per visitor

### The urgency mechanic — the point of the card

The card exists to create scarcity pressure: *"only 1 left"*. That claim is driven by the real
`stock` column and prints the actual number.

| Real stock | Card shows |
|---|---|
| 0 | Product never reaches the card — filtered server-side |
| 1–5 (`LOW_STOCK_THRESHOLD`) | 🔥 **"Only N left"** |
| 6+ | Nothing — no scarcity claim, and no price either |

**It can never overstate.** If stock is 4 it says 4. If stock is healthy it says nothing rather
than inventing pressure. That is the difference between urgency that converts and urgency a
shopper can catch you out on.

### Why two earlier approaches failed — recorded so they aren't retried

| Approach | Real-world result |
|---|---|
| Newest-first overall | **1 ladies / 11 baby** — the newest products are mostly baby |
| Plain 1:1 round-robin | **3 ladies / 9 baby** — baby kept filling to `FEED_SIZE` once ladies ran out |
| **Weighted 2:1, stop when ladies exhausted** ✅ | **3 ladies / 2 baby — 60% ladies** |

### ⚠️ Observed constraint — ladies stock

Verified against the live database: of **13** ladies-suits products, 12 are `active`, and only
**3 have `stock > 0` — each with exactly 1 unit.** Nine active ladies suits sit at zero stock and
currently show "Out of Stock" on `/ladies`. All 13 carry the `stitched-suits` subcategory, so
"ladies suits" and "ladies stitched suits" are the same set.

The feed is therefore 5 items, not 12. That is correct behaviour, not a bug — the card shows
every in-stock ladies suit that exists and refuses to pad the rest with baby. **Restock ladies
and the feed grows and stays ~2/3 ladies, with no code change.**

Worth checking whether those nine are genuinely sold out or whether `stock` simply isn't being
maintained in admin. If it's the latter, the same field is also suppressing them from Trending
Now and blocking Add to Bag sitewide.

### 2. Component changes

`components/common/purchase-notification.tsx`:
- Fetch the new route instead of `/data/sold.json`
- Render: badge · product image · title · "Only N left" — **no price**
- **Make the card a `<Link>` to the product page** — turns decoration into traffic
- Keep everything else: 8s display, 60s interval, dismiss button, slide animation

### 3. Retire the old file

`public/data/sold.json` gets deleted (or renamed `.bak`) once the new source is live. Nothing
else in the codebase reads it — verified.

### 4. Frequency

Currently: first card at 8s, then every 60s, visible 8s each. That is fairly aggressive. Suggest
**every 3–4 minutes**. Your call — easy to tune either way.

---

## 🔴 SEO check (per `AGENTS.md`)

**Verdict: zero SEO impact — but only if built the way described below.**

The component is `"use client"` and does `if (!current) return null;` (line 100), with data
fetched in a `useEffect`. **It renders nothing in the server HTML**, so Google never sees this
card in either version.

| Aspect | Impact |
|---|---|
| Server-rendered HTML | None — component SSRs to `null` |
| Metadata / canonical / robots | Not touched |
| Structured data | Not touched |
| Sitemap | Not touched — no new indexable routes (`/api/*` is `Disallow`ed in robots.txt) |
| Internal links | The new `<Link>` is client-rendered, so it is **not** a crawlable link — no link-equity change either way |
| Core Web Vitals | Neutral-to-positive: fewer, smaller images than the current static set |

**The one thing that would change this:** if the product data were fetched in a *server*
component and passed down as props, the markup would land in the SSR HTML on every page. **I
will not do that.** The plan deliberately keeps the client-side fetch pattern the component
already uses, for exactly this reason.

I'll re-run the live verification from `AGENTS.md` after implementing and paste the output.

---

## What will not be disturbed

- **The overlay suppression rules stay** — the card remains hidden on `/checkout/*` and while the
  cart drawer is open (shipped in `docs/checkout-cro-2026/` Phase 1)
- `z-[47]` stacking stays — it must remain below the cart drawer
- No changes to products, orders, cart, checkout, or admin
- No database schema changes
- No new dependencies
- Only two files touched, plus one new API route

**Rollback:** a single `git revert`. And if the API route fails at runtime, the component simply
renders nothing — the same as it does today before data loads. It cannot break a page.

---

## Open questions

1. **Option A / B / C?** (recommend **B**, auto-upgrading to A)
2. **Frequency** — keep 60s, or move to 3–4 minutes? (recommend 3–4)
3. **Category mix** — rotate across all four categories, or purely newest-first regardless of
   category?
4. **Make the card clickable?** (recommend yes — it currently does nothing)
5. **Delete `sold.json`, or keep it as `.bak`** for a while?

---

**Nothing implemented.** Confirm the options and I'll build it.
</content>
