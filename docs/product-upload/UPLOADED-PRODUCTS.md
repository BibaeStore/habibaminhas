# Uploaded Products Log

One entry per product added via the [Product Upload Playbook](./PRODUCT-UPLOAD-PLAYBOOK.md).
Records what the owner specified vs. what was inferred, so any wrong inference can be traced.

---

## 037 — Coral Lattice (coral chikankari shirt + digital print trousers) — ⏸ NOT YET LIVE

**Blocked 2026-08-06 by a local network outage.** DNS failed for every host (Supabase, the live
site, and google.com all returned 000 / exit 6), so the images could not be uploaded and the row
was never inserted.

**To finish, in this order:**
1. `node scripts/upload-product-images.mjs "<scratchpad>/coral-webp"` — the 2 WebPs are already
   converted and waiting (4.2 MB → 266 KB, −93.6%)
2. Run the prepared insert: `scratchpad/037-coral-insert.sql` — complete, with copy, SEO fields,
   and 10 FAQs already written. Image URLs in it match what step 1 will produce.
3. Verify the product URL, and check the sitemap moved 148 → 149.

| Field | Value |
|---|---|
| **slug** | `ld-coral-pink-chikankari-2-piece-suit-037` |
| **SKU** | `BIBA-COR-COT-SML-037` · **Price** Rs. 3,999 · **Stock** S ×1, M ×2, L ×1 (4) |
| **Subcategory** | `stitched-suits`, `2-piece-suits`, `casual` |
| **Source folder** | `new articles august 2026/all hb clothes/pink chicken kaari` |

**The owner's description needed the photos to decode.** They said "the shirt is a pink chikan
kari with a digital print, and the trouser is a trouser." The photos show the opposite split:
**chikankari on the shirt, digital print on the trousers.** Worth confirming with the owner, but
the images are unambiguous.

**Copy angle:** this is the inverse of the standard Pakistani formula (printed shirt + plain
trouser), and the copy leads on why reversing it works — the eye lands on the trousers, which
lengthens the leg line, and a tonal top is more forgiving through the torso than a busy print.
Second angle is **tonal chikankari** vs the white-on-white of 035, which cross-links the two
products.

**Not claimed: hand embroidery.** The owner did not say hand-worked, same as 035. Only 034 has
that claim, because the owner stated it explicitly.

---

## 036 — Marigold Garden (orange digital floral, 3-piece)

| Field | Value |
|---|---|
| **Uploaded** | 2026-08-06 |
| **id** | `76705c62-519b-499f-bcea-8e06b69d4446` |
| **slug** | `ld-orange-floral-digital-print-cotton-3-piece-suit-036` |
| **SKU** | `BIBA-ORG-COT-SML-036` · **Price** Rs. 3,999 · **Stock** S ×1, M ×2, L ×1 (4) |
| **Subcategory** | `stitched-suits`, `3-piece-suits`, `casual` |
| **Images** | 4 × WebP, 8.5 MB → 513 KB (−94%) |
| **Source folder** | `new articles august 2026/all hb clothes/orangee no1 dress` |

**Owner specified:** orange, all-over digital print, shirt and trousers the same print, plain
chiffon dupatta, 3-piece, Rs. 3,999.

⚠️ **Stock was corrected after insert.** Originally given as "three medium, one large, one small,
and three medium" and entered as M ×3 (stock 5); the owner corrected to **M ×2 (stock 4)**. The
fix had to touch three places, not one — `sizes_stock`, `stock`, and **two sentences of copy**
that stated the quantity ("three pieces in Medium" in the description, "Medium has three pieces
in stock" in the FAQs). **When stock changes, grep the description and faqs for the old number.**

**Fabric was not stated** — cotton assumed from the six previous products and the matte, sheen-free
drape in the photos. Confirm with the owner; the care line depends on it.

**Copy angle:** *"What is digital printing on fabric?"* — a genuinely useful explanation (single
pass, unlimited colours and gradients, versus one screen per colour for block/screen printing)
that justifies the print quality. Plus colour advice on orange, which most buyers assume will not
suit them.

---

## 035 — Ivory Whisper (off-white chikankari cotton, 2-piece)

| Field | Value |
|---|---|
| **Uploaded** | 2026-08-06 |
| **id** | `9c9adacb-cc32-41e1-a81f-e046e40b1566` |
| **slug** | `ld-off-white-chikankari-cotton-2-piece-suit-035` |
| **SKU** | `BIBA-OWH-COT-SML-035` · **Price** Rs. 4,900 · **Stock** S ×1, M ×2, L ×1 (4) |
| **Subcategory** | `stitched-suits`, `2-piece-suits`, `casual` |
| **Images** | 3 × WebP, 6.2 MB → 325 KB (−94.8%) |
| **Source folder** | `new articles august 2026/all hb clothes/off white chicken kari` |

**Owner specified:** off-white chikankari shirt + plain trousers, "normal" (not long) shirt
length, cotton, casual, Rs. 4,900, M ×2 / L ×1 / S ×1.

**This time chikankari is accurate** — unlike 033, which came from a similarly named folder. The
close-up shows genuine white-on-white embroidery with cut eyelet openwork across the whole shirt.
Compare the two entries before writing any chikankari copy again: **the folder name proved
nothing in either direction; the close-up photo settled it both times.**

**Deliberately NOT claimed: hand embroidery.** The owner said "hand-embroidered" explicitly for
034 and did not for this one, and the eyelets here are regular enough to read as machine schiffli.
The copy says "chikankari" and "white-on-white embroidery" throughout and never "hand". If it is
in fact hand-worked, that is a valuable claim worth adding — ask the owner.

**Copy angles:** the definitional *"What is chikankari?"* opener, and *"How do I keep white
cotton from turning yellow?"* — a real high-volume query, answered with the genuinely useful
detail that chlorine bleach yellows cotton over time rather than whitening it, and that strong
Pakistani sun yellows white faster than it brightens. The no-dupatta angle is reframed as an
advantage specific to white: a neutral base takes any dupatta the customer already owns.

---

## 034 — Lilac Meadow (light purple cotton, hand-embroidered yoke)

| Field | Value |
|---|---|
| **Uploaded** | 2026-08-06 |
| **id** | `ed4aec9a-53a3-4de6-9582-4efcd7dd1f46` |
| **slug** | `ld-lilac-hand-embroidered-cotton-3-piece-suit-034` |
| **SKU** | `BIBA-LIL-COT-SML-034` · **Price** Rs. 5,500 · **Stock** S ×1, M ×1, L ×1 (3) |
| **Subcategory** | `stitched-suits`, `3-piece-suits`, `casual` |
| **Images** | 3 × WebP, 6.6 MB → 398 KB (−94%) |
| **Source folder** | `new articles august 2026/all hb clothes/light purple dress` |

**Owner specified:** light purple, neck embroidery + border embroidery, **hand-embroidered**,
cotton, long shirt, Rs. 5,500, one piece each in S / M / L.

**Collection placement — asked and overridden again.** Recommended `formal-wear`, since this is
the first product that actually matches that page's "substantial embroidery" copy. Owner chose
`casual`. That is now three for three: **the owner wants casual; recommend once, then follow.**

⚠️ **Known copy conflict.** `/ladies/casual/` says the collection has "little to no heavy
embellishment", and this piece has a fully hand-worked yoke. Softening that one clause would
resolve it, but the casual page is live, so it needs owner approval before editing.

**Care instructions deliberately differ from every other product here.** Individually placed
sequins and beads mean this one is hand wash or dry clean, dry flat, iron on the reverse only —
not the machine-wash line used on the plain cotton suits. Copying the standard care block onto
an embroidered piece would damage a customer's garment.

**Copy angle:** *"How can I tell hand embroidery from machine embroidery?"* — a real question
with a real answer (machine work is perfectly uniform with a dense backing; hand work varies in
stitch tension and motif spacing, and threads follow the shape of a petal rather than filling it
mechanically). It justifies the price without asserting anything unverifiable.

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
