# Homepage — Trending Now: reorder + real product selection

**Status:** 📋 Planning only. **Nothing implemented.** Awaiting owner go-ahead.
**Opened:** 2026-07-31
**Scope:** `app/page.tsx`, `components/home/trending-tabs.tsx`, `components/product/product-card.tsx`,
`lib/actions/products.ts`

---

## What was asked

1. Move the **Trending Now** product section up so it appears immediately after the hero and
   announcement bar — i.e. as the second content section, above **Shop by Category**.
2. Stop the section showing every product as **Out of Stock**. Instead show products that are
   actually in stock and genuinely selling — best-sellers, with low-stock items ("only 2–3 left")
   welcome rather than hidden.

---

## Executive summary

The Out-of-Stock problem is **a one-line data bug, not a stock problem**. Your products are not
out of stock — the homepage simply forgets to pass the `stock` field into the card component,
and the card treats "missing" as "zero". It affects the homepage only; collection pages are fine.

The reorder is trivial — but there is an ambiguity to resolve first: **two adjacent sections on
your homepage are both labelled "Trending Now"**, and I need to know which one you meant.

The "show what's actually selling" request is the interesting one. The sales data exists and is
queryable, but you currently have close to zero completed orders — so a pure best-seller ranking
would return an empty section today. The plan below uses a fallback ladder that produces a
sensible result now and automatically becomes real best-seller data as orders arrive.

| # | Finding | Severity | Effort |
|---|---|---|---|
| A | Homepage drops `stock` → every product reads as Out of Stock | 🔴 Real bug | XS |
| B | Two different sections both titled "Trending Now" | 🟠 Needs your decision | XS |
| C | "Trending" is not trending — it is badge-then-newest, with no stock filter | 🟠 Feature gap | M |
| D | Entire product catalogue is serialised to the browser to render 6 cards | 🟡 Performance | S |
| E | Moving 6 product images up the page may affect mobile LCP | 🟡 Watch | S |

---

## Finding A — Why everything says "Out of Stock" 🔴

**This is a bug, and it is small.**

`app/page.tsx:30-42` re-maps the product rows into a narrower object before handing them to the
section:

```tsx
const trendingProducts: TrendingProduct[] = (allProducts ?? []).map((p) => ({
  id: p.id, slug: p.slug, title: p.title, price: p.price, images: p.images,
  compare_at: p.compare_at, palette: p.palette, badge: p.badge,
  subcategory: p.subcategory, subtype: p.subtype, category: p.category,
  //  ← `stock` is not in this list
}));
```

And `components/product/product-card.tsx:62` decides availability like this:

```tsx
const isOutOfStock = (product.stock ?? 0) <= 0;
```

`stock` arrives as `undefined`, `?? 0` turns it into `0`, and `0 <= 0` is true — so **every single
product in that grid renders the Out of Stock overlay**, regardless of real inventory.

### Why only this section is affected

`getProducts()` uses `select("*")` (`lib/actions/products.ts:37`), so `stock` *is* fetched. Every
other page that renders `ProductCard` passes the raw database row straight through:

| Page | How products reach the card | Out-of-Stock correct? |
|---|---|---|
| `/ladies`, `/kids`, `/accessories`, … | raw rows (`app/ladies/page.tsx:63`) | ✅ Yes |
| `/search`, `/wishlist` | raw rows | ✅ Yes |
| Related products on PDP | raw rows | ✅ Yes |
| **Homepage Trending Now** | **re-mapped, `stock` dropped** | ❌ **No** |

So the homepage is the only place with this bug — which matches exactly what you saw.

### The fix, and a second one worth doing

The immediate fix is to add `stock: p.stock` to that map. One line.

But the underlying design is fragile: `(product.stock ?? 0) <= 0` means **"I don't know the stock"
is treated as "it's gone"** — the most damaging possible default. A missing field should never
silently mark your entire catalogue unavailable. Recommend either making `stock` required on
`CardProduct` (so TypeScript catches the omission at compile time — it would have caught this one)
or defaulting unknown to available. I'd suggest making it required; it turns a silent visual bug
into a build error.

---

## Finding B — Two sections are both called "Trending Now" 🟠 **needs your decision**

Your homepage renders these back to back:

| Line | Component | Eyebrow | Title | Content |
|---|---|---|---|---|
| 110 | `TrendTiles` | **"Trending Now"** | "Four directions in one season." | 4 editorial link tiles — no products |
| 111 | `TrendingTabs` | "Most-loved this week" | **"Trending now."** | Product grid with category tabs |

Both read as "Trending Now" to a visitor, and they sit directly on top of each other.

**My reading:** you mean `TrendingTabs` — the product grid — because that is the one showing
Out of Stock labels on products. The plan below assumes that. Please confirm.

**Separate recommendation:** whichever moves, the duplicate labelling should go. Two sections
with the same name on one page is confusing for shoppers and splits the keyword signal for SEO.
Suggest re-labelling `TrendTiles` to something like "Shop the Season" or "Four Directions".

---

## Finding C — "Trending Now" is not currently trending 🟠

`components/home/trending-tabs.tsx:23-33`:

```tsx
if (active === "all") {
  const featured = products.filter((p) => p.badge === "Bestseller" || p.badge === "New In");
  const pool = featured.length >= 6 ? featured : [...featured, ...products];
  // dedupe, then .slice(0, 6)
}
return products.filter((p) => p.category === active).slice(0, 6);
```

What this actually does:

- **No stock filter at all.** Sold-out products are eligible for the grid.
- **No sales data.** "Trending" means *"has a Bestseller or New In badge"* — a label you set by
  hand in admin, not a measurement.
- **Falls back to newest.** `getProducts` orders by `created_at DESC`, so when there aren't 6
  badged products the grid is simply your 6 most recently added items.
- **Category tabs ignore badges entirely** — they are pure "6 newest in this category".

So the section is really "recently added products", presented as "most-loved this week".

### What data is actually available for real ranking

| Source | Field | Available? | Notes |
|---|---|---|---|
| `products` | `stock` | ✅ | Integer, not null |
| `products` | `sizes_stock` | ✅ | JSON per-size — the truer signal for sized items |
| `products` | `featured` | ✅ | Boolean, admin-controlled |
| `products` | `badge` | ✅ | "Bestseller" / "New In" / "Limited", admin-controlled |
| `order_items` | `product_id`, `quantity` | ✅ | **Real units-sold data** |
| `orders` | `status` | ✅ | Needed to exclude cancelled |
| — | page views / add-to-cart counts | ❌ | GA4 has these now, but not queryable server-side |

**The critical constraint:** real best-seller ranking requires orders, and you currently have
close to zero. A pure "sort by units sold" would render an **empty section**. Any plan has to
degrade gracefully — which is what the ladder below does.

There is already a working precedent for the aggregation in
`app/api/admin/analytics/ai-insights/route.ts:56-62`, though it groups by `product_title`; a new
implementation should group by `product_id` instead, since titles can change and are not unique.

---

## Proposed solution

### Step 1 — Hard filter (non-negotiable)

Before any ranking, exclude anything that cannot be bought:

```
status === "active"  AND  stock > 0
```

For sized products, "in stock" should mean *at least one size has stock* — read `sizes_stock`
rather than only the aggregate `stock` column, otherwise you can show a product whose every size
is sold out.

This alone solves your complaint. Nothing sold out ever reaches the grid.

### Step 2 — Rank by a real signal, with a fallback ladder

Fill the 6 slots in this priority order, stopping when full:

| Tier | Signal | Why |
|---|---|---|
| 1 | **Units sold**, last 90 days, excluding cancelled/returned orders | The genuine "most running" answer you asked for |
| 2 | `featured = true` | Your explicit editorial pick |
| 3 | `badge = "Bestseller"` then `"New In"` | Existing manual curation |
| 4 | Newest by `created_at` | Guarantees the grid is never empty |

**Today** this behaves roughly like tiers 2–4, i.e. curated + newest. **As orders arrive it
becomes genuinely sales-driven with no code change** — tier 1 simply starts filling the slots.
That is the property that matters: build it once, and it improves on its own.

### Step 3 — Turn low stock into an asset, not a warning

You said you're happy to show items with 2–3 left. Agreed, and it's the right instinct — but the
label matters:

| Stock | Current | Proposed |
|---|---|---|
| 0 | "Out of Stock" overlay | **Excluded from the section entirely** |
| 1–5 (`LOW_STOCK_THRESHOLD`) | Nothing | **"Only 2 left"** — small, honest urgency badge |
| 6+ | Nothing | Nothing |

`LOW_STOCK_THRESHOLD = 5` already exists in `lib/inventory-constants.ts` and is used by the admin
low-stock alerts, so this reuses a threshold you already maintain.

This is genuine scarcity backed by your real inventory — not a fabricated "selling fast" label.
It ties back to the honest-urgency recommendation in
`docs/checkout-cro-2026/03-CRO-PLAYBOOK.md` §6, and it is exactly the kind of signal that lifts
conversion without costing trust.

### Step 4 — The reorder

```
BEFORE                          AFTER
──────                          ─────
HeroCarousel                    HeroCarousel
AnnouncementStrip               AnnouncementStrip
CategoryTiles  (Shop by Cat.)   TrendingTabs   (Trending Now)   ← moved up
EditorialBlock ×4               CategoryTiles  (Shop by Cat.)
TryRoomBand                     EditorialBlock ×4
TrendTiles                      TryRoomBand
TrendingTabs   ← was here       TrendTiles
Founder / Testimonials / …      Founder / Testimonials / …
```

A pure JSX move in `app/page.tsx` — line 111 relocated to just after line 46.

**This is a good commercial call.** Putting real, buyable product above category navigation gives
a first-time mobile visitor something to click immediately rather than asking them to pick a
category first. It shortens the path to a product page, which is where buying decisions happen.

---

## Finding D — The whole catalogue is shipped to render 6 cards 🟡

`app/page.tsx:29` fetches **every active product**, maps all of them (line 30), and passes the
entire array into `TrendingTabs`, a `"use client"` component. All of it is serialised into the
page payload — roughly 55 products today — so the browser downloads your full catalogue to
display six cards.

It works, but it grows linearly with your catalogue, and it becomes more costly once this section
moves near the top of the page. Worth fixing in the same change: do the filtering and ranking on
the server and pass only what the tabs need (6 per tab ≈ 30 products maximum).

Doing so also makes Step 2 possible, since the sales aggregation must run server-side anyway.

---

## Finding E — Watch mobile LCP after the move 🟡

Six product images currently sit far down the page and load lazily. Moving them into position two
puts them much closer to the hero, competing for bandwidth on a mobile connection during the most
timing-sensitive part of the page load.

This is a **watch item, not a blocker** — the section will still be below the fold on most phones.
But given Core Web Vitals is the next focus on your SEO roadmap
(`docs/seo-optimization-2026/`), the move should be paired with:

- confirming the hero image keeps `priority` and the trending images do **not** get it
- explicit `sizes` on the grid images so mobile does not download desktop-sized files
- a before/after PageSpeed Insights check on the mobile homepage

If LCP regresses measurably, the fallback is to keep the section where it is and move only the
category tiles down — same net effect, no image-loading change.

---

## Open questions — please confirm before I implement

1. **Which section did you mean?** `TrendingTabs` (the product grid with tabs) — or `TrendTiles`
   (the 4 editorial tiles)? I've assumed the product grid.
2. **May I rename the other one** so two sections aren't both called "Trending Now"?
3. **Sold-out products: hide entirely, or show at the end?** I recommend hide entirely from this
   section. They remain visible on category pages, which is where a shopper browsing a full range
   expects to see them.
4. **Should the "Only N left" badge ship in this change**, or would you rather do the reorder and
   stock fix first and add urgency badging separately?
5. **Sales window — 90 days?** With low order volume a longer window (or all-time) gives a more
   stable ranking. Easy to change later; 90 days is the safer default once volume picks up.

---

## Recommended sequencing

| Phase | Contents | Risk | Ships |
|---|---|---|---|
| **1** | Pass `stock` through (A) + hard-filter sold-out (Step 1) + reorder (Step 4) | Very low | Immediately — fixes the visible embarrassment |
| **2** | Server-side ranking with the fallback ladder (Step 2) + payload trim (D) | Medium | After phase 1 is confirmed live |
| **3** | "Only N left" badge (Step 3) + rename duplicate section (B) + CWV check (E) | Low | Together with phase 2 or just after |

Phase 1 alone removes every "Out of Stock" label from the homepage and gets the section where you
want it. Phases 2–3 make "Trending" actually mean trending.

---

**Nothing here is implemented.** Say go and I'll start with Phase 1.
</content>
