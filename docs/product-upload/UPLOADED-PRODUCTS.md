# Uploaded Products Log

One entry per product added via the [Product Upload Playbook](./PRODUCT-UPLOAD-PLAYBOOK.md).
Records what the owner specified vs. what was inferred, so any wrong inference can be traced.

---

## 030 — Blush Bouquet (cream cotton, pink rose print)

| Field | Value |
|---|---|
| **Uploaded** | 2026-08-06 |
| **id** | `6474fe78-96c0-4f8e-98c4-6689ef202861` |
| **slug** | `ld-cream-pink-floral-cotton-3-piece-suit-030` |
| **URL** | https://habibaminhas.com/product/ladies-suits/ld-cream-pink-floral-cotton-3-piece-suit-030/ |
| **SKU** | `BIBA-CRM-COT-M-030` |
| **Title** | Blush Bouquet – 3-Piece Stitched Cotton Suit with Pink Rose Print |
| **Price** | Rs. 4,500 (`compare_at` null) |
| **Category** | `ladies-suits` |
| **Subcategory** | `stitched-suits`, `3-piece-suits`, `casual` |
| **Sizes** | Medium ×1 (total stock 1) |
| **featured** | true → homepage strip + `/new/` |
| **badge** | `New In` |
| **Try-on** | enabled, reference = image 3 |
| **Images** | 4 × WebP, 1122×1402, 8.2 MB → 496 KB (−94%) |
| **Source folder** | `new articles august 2026/all hb clothes/cream froq with pink flowers` |

**Owner specified:** cotton, 3-piece (shirt + matching trousers + dupatta), ladies stitched
casual suit, Medium only ×1, stock 1, virtual try-on on, price Rs. 4,500, featured on homepage,
"New Arrival" badge (mapped to the allowed value `New In`), list under ladies + stitched suits +
new arrivals.

**Inferred from photos — verify if any are wrong:**
- Dupatta fabric read as **chiffon** (sheer, plain blush pink, soft drape). Could be net or
  organza; owner did not state it.
- Sleeves described as **three-quarter with picot trim cuffs**.
- Shirt described as **straight A-line, below-knee**.
- Print described as **digitally printed** all-over rose floral.
- Palette sampled as `#f6efe3` cream / `#eb9aa4` blush / `#d2416e` rose.

**Verified live after insert:**
- Product URL → 200; `/ladies/casual/` → 200; `/ladies/stitched-suits/` → 200
- `<title>`, `<meta description>`, canonical, `robots: index, follow` all correct
- Schema emitting: `Product`, `Offer`, `Brand`, `AggregateRating`, `BreadcrumbList`
- Sitemap 134 → 141 total. Delta: +1 `/product/` (this item), +1 `/ladies/` (new
  `/ladies/casual/` collection page), +5 `/journal/` (blog queue, unrelated). Nothing removed.

**Side effect worth knowing:** this was the first product tagged `casual`, so it created a new
indexable collection page at `/ladies/casual/`. That page is now in the sitemap.
