# TRACKER — Homepage Trending Now

**Last updated:** 2026-07-31
**Status:** 📋 Planning only — nothing implemented, awaiting owner go-ahead.

---

## Findings

| ID | Finding | Severity | Phase | Status |
|---|---|---|---|---|
| A | `app/page.tsx:30-42` drops `stock` → every card reads Out of Stock | 🔴 Real bug | 1 | ⬜ Not started |
| B | Two sections both labelled "Trending Now" (`TrendTiles` + `TrendingTabs`) | 🟠 Decision | 3 | ⬜ Needs owner answer |
| C | "Trending" = badge-then-newest; no stock filter, no sales data | 🟠 Feature gap | 2 | ⬜ Not started |
| D | Whole catalogue (~55 products) serialised to client for 6 cards | 🟡 Perf | 2 | ⬜ Not started |
| E | Moving 6 images up the page may affect mobile LCP | 🟡 Watch | 3 | ⬜ Not started |

---

## Phase 1 — Visible fix (low risk)
- [ ] Add `stock: p.stock` to the map in `app/page.tsx:30-42`
- [ ] Make `stock` required on `CardProduct` so the compiler catches this class of bug
- [ ] Hard-filter `status === "active" && stock > 0` before the grid
- [ ] Use `sizes_stock` for sized products (all sizes sold out ⇒ not in stock)
- [ ] Move `<TrendingTabs />` from `app/page.tsx:111` to just after line 46
- [ ] Verify no "Out of Stock" overlay renders anywhere in the section
- [ ] Confirm collection pages still show Out of Stock correctly (they pass raw rows — must not regress)

## Phase 2 — Real ranking
- [ ] Server-side aggregation of `order_items.quantity` grouped by **`product_id`** (not title)
- [ ] Exclude cancelled/returned orders
- [ ] Fallback ladder: units sold → `featured` → `badge` → newest
- [ ] Pass only the products the tabs need (≤6 per tab) instead of the full catalogue
- [ ] Confirm the section is never empty at any tab

## Phase 3 — Polish
- [ ] "Only N left" badge for `stock <= LOW_STOCK_THRESHOLD` (5)
- [ ] Rename `TrendTiles` eyebrow to remove the duplicate "Trending Now"
- [ ] Hero keeps `priority`; trending images do not
- [ ] Explicit `sizes` on grid images
- [ ] PageSpeed Insights mobile before/after

---

## Open questions — blocking Phase 1 sign-off

- [x] **Q1** Which section moves? → **`TrendingTabs`** (the product grid at `app/page.tsx:111`,
      tabs All/Ladies/Kids/Baby). Confirmed by owner 2026-07-31. `TrendTiles` (line 110, the 4
      editorial tiles) stays where it is.
- [ ] **Q2** May the other section be renamed to kill the duplicate label?
- [ ] **Q3** Sold-out products — hide entirely (recommended) or show last?
- [ ] **Q4** Ship "Only N left" now, or separately after the reorder?
- [ ] **Q5** Sales window — 90 days, or all-time while order volume is low?

---

## Key file references

| What | Where |
|---|---|
| Homepage section order | `app/page.tsx:43-111` |
| The `stock`-dropping map | `app/page.tsx:30-42` |
| Out-of-stock logic | `components/product/product-card.tsx:62` |
| `CardProduct` type | `components/product/product-card.tsx:15-31` |
| Selection logic | `components/home/trending-tabs.tsx:23-33` |
| Product fetch (`select("*")`) | `lib/actions/products.ts:27-50` |
| Low-stock threshold (= 5) | `lib/inventory-constants.ts` |
| Existing sales aggregation precedent | `app/api/admin/analytics/ai-insights/route.ts:56-62` |

---

## Related

- `docs/checkout-cro-2026/` — checkout funnel work; §6 of the CRO playbook covers honest urgency,
  which the "Only N left" badge implements
- `docs/seo-optimization-2026/` — Core Web Vitals is the next focus there; finding E overlaps
</content>
