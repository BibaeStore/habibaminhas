# Uploaded Products Log

One entry per product added via the [Product Upload Playbook](./PRODUCT-UPLOAD-PLAYBOOK.md).
Records what the owner specified vs. what was inferred, so any wrong inference can be traced.

---

## 031 — Midnight Blossom (royal blue cotton, pink blossom print)

| Field | Value |
|---|---|
| **Uploaded** | 2026-08-06 |
| **id** | `8bbd8e9b-2d54-4bac-8b06-d177b5d56f24` |
| **slug** | `ld-royal-blue-pink-floral-cotton-2-piece-frock-031` |
| **URL** | https://habibaminhas.com/product/ladies-suits/ld-royal-blue-pink-floral-cotton-2-piece-frock-031/ |
| **SKU** | `BIBA-BLU-COT-M-031` |
| **Title** | Midnight Blossom – 2-Piece Stitched Cotton Frock Suit with Pink Floral Print |
| **Price** | Rs. 3,900 (`compare_at` null) |
| **Category** | `ladies-suits` |
| **Subcategory** | `stitched-suits`, `2-piece-suits`, `casual` |
| **Sizes** | Medium ×1 (total stock 1) |
| **featured** | true → homepage strip + `/new/` |
| **badge** | `New In` |
| **Try-on** | enabled, reference = image 1 (front view) |
| **Images** | 3 × WebP, 5.1 MB → 352 KB (−93%) |
| **Source folder** | `new articles august 2026/all hb clothes/dark blue` |

**Owner specified:** cotton, dark blue, 2-piece (long frock + trouser), pink flowers, Medium
only ×1, price Rs. 3,900, and "everything else per the playbook."

**Applied from playbook defaults** (owner did not specify, matched the 030 upload):
`compare_at` null · `featured` true · badge `New In` · try-on enabled · subcategories
stitched-suits + 2-piece-suits + casual.

**Inferred from photos — verify if any are wrong:**
- Colour called **deep royal blue**, not navy — the fabric is visibly brighter than navy.
  "dark blue" and "navy blue" are both carried in `seo_keywords` so either search term matches.
- Silhouette read as a **frock**: fitted yoke, gathered raised waist seam, flared skirt to mid-calf.
- **Four pink fabric-covered buttons** on a short front placket (clear in the close-up shot).
- Full-length straight sleeves; trousers read as **wide-leg palazzo**.
- Print described as digitally printed pink blossom sprigs on olive-brown stems.
- Palette sampled as `#2a3a8c` blue / `#e96fa0` pink / `#d6317e` button pink.

⚠️ **Image resolution issue.** The front-facing shot (`third_image.png`) is only **561×701**,
versus 1122×1402 for the back view and the close-up. It is the main/LCP image and the try-on
reference, so it will look soft on high-DPI screens. Not upscaled — that would fake detail.
**Ask the owner for a full-resolution front shot and re-run the two scripts to replace it.**

**Verified live after insert:**
- Product URL → 200; `/ladies/2-piece-suits/` → 200; `/ladies/casual/` → 200; `/new/` → 200
- `<title>`, `<meta description>`, canonical, `robots: index, follow` all correct, brand not duplicated
- Schema emitting: `Product`, `Offer`, `Brand`, `AggregateRating`, `BreadcrumbList`
- Sitemap 141 → 143. Delta: +1 `/product/`, +1 `/ladies/` (new `/ladies/2-piece-suits/`). Nothing removed.

**Side effect:** first product tagged `2-piece-suits`, so `/ladies/2-piece-suits/` went live. Its
category row was null — filled with 2,910 chars of AEO/GEO copy plus `seo_title` / `seo_desc` in
the same session, so the page never shipped empty.

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
