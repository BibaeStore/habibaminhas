# "Live Sale" Notification — show real products, not stock data

**Status:** 📋 Plan only. **Nothing implemented.** Awaiting go-ahead.
**Opened:** 2026-08-01
**File:** `components/common/purchase-notification.tsx` · `public/data/sold.json`

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
[{ id, title, slug, category, price, image, badge, createdAt }]
```

Rules:
- **Categories: `ladies-suits` and `baby-products` ONLY** — kids and accessories are excluded by
  owner decision (2026-08-01). Enforced as a hard `.in()` filter on the query, and controlled
  from a single `CATEGORIES` constant in the route
- `status = 'active'` **and** `stock > 0` — never advertise something sold out
- **Round-robin across the two categories**, newest-first within each, capped at 12.
  Not "newest-first overall": the catalogue's newest products are heavily weighted to baby, and
  a plain newest-first fill produced **11 baby products and 1 ladies suit**, burying the flagship
  category. Alternating fixes that. If one category runs out, the other fills the remainder
- Cached (`revalidate = 300`) so it isn't a database hit per visitor

### ⚠️ Observed constraint — ladies stock

With round-robin in place, the feed returns **3 ladies suits and 9 baby products**. That is not a
bug in the rotation — it is the catalogue: only **3 ladies-suits products currently have
`stock > 0`**. The card takes every in-stock ladies suit that exists and fills the rest with baby.

To get a more even split, more ladies suits need stock. Nothing in the code needs changing — the
balance will improve automatically as ladies stock is replenished.

### 2. Component changes

`components/common/purchase-notification.tsx`:
- Fetch the new route instead of `/data/sold.json`
- Render: badge · product image · title · price · optional "Only N left"
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
