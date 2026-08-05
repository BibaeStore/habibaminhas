# Uploaded Products Log

One entry per product added via the [Product Upload Playbook](./PRODUCT-UPLOAD-PLAYBOOK.md).
Records what the owner specified vs. what was inferred, so any wrong inference can be traced.

---

## 033 — Mehndi Bloom (olive green branded lawn, floral print, lace trim)

| Field | Value |
|---|---|
| **Uploaded** | 2026-08-06 |
| **id** | `b99aff4c-af57-4318-b739-65f2aebf7136` |
| **slug** | `ld-olive-green-floral-lawn-3-piece-suit-033` |
| **URL** | https://habibaminhas.com/product/ladies-suits/ld-olive-green-floral-lawn-3-piece-suit-033/ |
| **SKU** | `BIBA-OLV-LWN-SML-033` |
| **Title** | Mehndi Bloom – 3-Piece Stitched Lawn Suit with Lace Trim and Chiffon Dupatta |
| **Price** | Rs. 5,500 (`compare_at` null) |
| **Category** | `ladies-suits` |
| **Subcategory** | `stitched-suits`, `3-piece-suits`, `casual` |
| **Sizes** | S ×1, M ×2, L ×1 (total stock 4) |
| **featured** | true → homepage strip + `/new/` |
| **badge** | `New In` |
| **Try-on** | enabled, reference = image 1 |
| **Images** | 3 × WebP, 7.0 MB → 493 KB (−93%) |
| **Source folder** | `new articles august 2026/all hb clothes/green chicken kari` |

**Owner specified:** green, long shirt + trousers + chiffon dupatta, lace on all four sides of
the dupatta, price Rs. 5,500, stock M ×2 / L ×1 / S ×1. Fabric given as "cotton, or you can say
branded lawn."

### ⚠️ Mid-upload correction — the source folder name is wrong

The folder is named **"green chicken kari"** (chikankari), and work had started on that basis.
The owner corrected mid-flight: *"It's not chicken curry. It's just a simple green cotton suit,
or you can say branded lawn."*

The photos supported the correction — the close-up shows a **printed** floral vine plus an
**applied openwork cotton lace trim**, not hand-worked chikankari embroidery. Chikankari appears
nowhere in the title, slug, copy, or keywords. Verified: `grep -ci chikankari` on the live page
returns 0.

**Three image files had already been uploaded as `olive-green-chikankari-lawn-3-piece-*.webp`.**
They were re-generated as `olive-green-floral-lawn-3-piece-*.webp` and the mis-named originals
deleted from the bucket. Storage filenames are crawler-visible and surface in Google Images, so
a wrong one is worth correcting rather than leaving orphaned.

**Lesson for next time: never trust the folder name as a product descriptor.** Read the photos,
and confirm any technique or craft term with the owner before it reaches copy — claiming
chikankari on a printed lawn suit is a false material claim, not just a bad keyword.

**Inferred from photos:**
- Olive / mehndi green ground; fine climbing floral vine in peach, white, and soft blue.
- White openwork lace at neckline, front placket, both cuffs, and all four dupatta edges.
- Long straight shirt with side slits; full sleeves; wide-leg trousers in matching print.
- Dupatta is plain olive chiffon, not printed lawn.
- Palette sampled `#7f9243` / `#e8a06a` / `#f5f3ec`.

**Copy angle:** the AEO hook is *"Is lawn the same as cotton?"* — a real, high-volume question
that the owner's own phrasing ("cotton, or you can say branded lawn") raised. The copy answers
it directly and plainly, which is exactly the sentence shape answer engines extract. Second hook
is the honest lace-vs-embroidery distinction.

**Verified live after insert:**
- Product URL → 200; title, description, canonical, `robots: index, follow` correct
- Schema: `Product`, `Offer`, `Brand`, `AggregateRating`, `BreadcrumbList`
- Sitemap 144 → 145. +1 `/product/` only, no new collection page. Nothing removed.

---

## 032 — Emerald Grace (solid emerald green cotton, embroidered cuffs)

| Field | Value |
|---|---|
| **Uploaded** | 2026-08-06 |
| **id** | `ab55a049-fd25-4ed1-8d01-3b983d9623b6` |
| **slug** | `ld-emerald-green-embroidered-cotton-3-piece-suit-032` |
| **URL** | https://habibaminhas.com/product/ladies-suits/ld-emerald-green-embroidered-cotton-3-piece-suit-032/ |
| **SKU** | `BIBA-GRN-COT-SML-032` |
| **Title** | Emerald Grace – 3-Piece Stitched Cotton Suit with Embroidered Cuffs and Chiffon Dupatta |
| **Price** | Rs. 4,900 (`compare_at` null) |
| **Category** | `ladies-suits` |
| **Subcategory** | `stitched-suits`, `3-piece-suits`, `casual` |
| **Sizes** | S ×1, M ×3, L ×1 (total stock 5) — **first product with a real size range** |
| **featured** | true → homepage strip + `/new/` |
| **badge** | `New In` |
| **Try-on** | enabled, reference = image 1 (clean front) |
| **Images** | 4 × WebP, 8.1 MB → 385 KB (−95%), all 1122×1402 |
| **Source folder** | `new articles august 2026/all hb clothes/dark green dress` |

**Owner specified:** dark green, price Rs. 4,900, sizes S ×1 / M ×3 / L ×1, and "everything else
per the playbook." Confirmed on asking: fabric is **cotton**, and it belongs in **casual**.

**Asked rather than assumed — worth repeating next time:**
- **Fabric was not stated.** The photos show a soft sheen that could read as cotton silk, and the
  care line changes completely between the two (machine wash vs. dry clean). Wrong care advice
  ruins a garment, so this is worth a question every time it is not stated.
- **Collection placement.** The embroidered cuffs and worked chiffon dupatta border read
  semi-formal, and `party-wear`'s own copy ("lighter embroidery, dinners, Eid dawat") matched
  it closely. Owner chose `casual` anyway — follow the owner, not the category description.
- **"Sizes are three: medium, one large, and one small"** was genuinely ambiguous between
  1 each (3 total) and 3 medium + 1 + 1 (5 total). It was the latter.

**Inferred from photos:**
- Solid emerald / bottle green, no print. Detail is tonal thread + fine sequin work on the sleeve
  cuffs and an embroidered scalloped border on the dupatta. Trousers plain.
- Straight-cut shirt, side slits, below-knee; round neck with a centre-front V-notch.
- Full-length sleeves; wide-leg palazzo trousers; chiffon dupatta.
- Palette sampled `#1e4a3c` / `#2d5c4b` / `#0f3329`.

**Copy angle:** because this is the first solid-colour product, the AEO contrast paragraph is
*solid vs printed* ("a solid suit asks more of its construction than a printed one"), and there
is a colour-advice paragraph on deep green, which targets conversational queries that a product
grid cannot rank for.

**Verified live after insert:**
- Product URL → 200; title, description, canonical, `robots: index, follow` correct, brand not duplicated
- Schema: `Product`, `Offer`, `Brand`, `AggregateRating`, `BreadcrumbList`
- Sitemap 143 → 144. Delta: +1 `/product/` only — no new collection page, since `casual` and
  `3-piece-suits` both already existed and had copy. Nothing removed.

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
