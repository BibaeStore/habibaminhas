# Product Upload Playbook

**Purpose:** the owner drops a folder of raw product photos and says "upload this product."
This file is the standing procedure so that never needs re-explaining.

Created 2026-08-06 during the upload of `ld-cream-pink-floral-cotton-3-piece-suit-030`.

---

## The flow (do these in order)

### 1. Look at the images first
Read every photo in the folder before asking anything. Half the "questions" answer themselves
from the pictures: colour, cut, sleeve length, dupatta fabric, number of pieces, neckline.
Only ask about what genuinely cannot be seen.

### 2. Ask the owner the gap questions — all at once, not one at a time

Ask **only** what the photos can't tell you. As of the 2026-08-06 session the owner reliably
supplies: product type, fabric, category, sizes, stock, price. The recurring gaps are below.

| # | Question | Why it matters | Sensible default if owner says "you decide" |
|---|---|---|---|
| 1 | **Price in PKR?** | `price` is NOT NULL. Blocking. | none — must ask |
| 2 | **Strike-through "was" price?** | `compare_at`; drives the sale badge | `null` (all current ladies suits are null) |
| 3 | **Which sizes, and stock per size?** | `sizes_stock` jsonb + `stock` total | Medium ×1 (their usual single-piece studio model) |
| 4 | **Virtual try-on on or off?** | `tryon_enabled` | on for ladies suits |
| 5 | **Which photo is the try-on reference?** | `tryon_image` — needs a clean, straight-on, full-length shot | the clearest front-facing image |
| 6 | **Featured on homepage / New Arrivals?** | `featured` — this one boolean drives BOTH the homepage strip AND `/new/` | ask |
| 7 | **Badge?** | `badge` — constrained, see below | `New In` for a fresh drop |
| 8 | **Which subcategories?** | `subcategory` text[] drives `/ladies/<sub>/` pages | see mapping below |

### 3. Convert the images

```bash
node scripts/optimize-product-images.mjs "<raw folder>" "<out folder>" "<slug>"
```

PNG/JPG → WebP, long edge capped at 1600px, q=82 effort 6, EXIF stripped, named
`<slug>-1.webp`, `<slug>-2.webp`, … Typical result: **~94% smaller** (8.2 MB → 496 KB on the
2026-08-06 batch) with no visible loss in fabric texture.

Never upload the raw PNGs. They are ~2 MB each and will wreck LCP, which is a ranking factor.

### 4. Upload to storage

```bash
node scripts/upload-product-images.mjs "<out folder>"
```

Uploads to the public `products` bucket, keeps the readable filename (not a random hash), sets
a 1-year cache header, and prints the public URLs in order plus a ready-to-paste SQL array.

### 5. Write the content, then INSERT

Products are **Supabase `public.products` rows** — there are no per-product `.tsx` files.
Insert via `mcp__supabase__execute_sql`. Full column reference and copy rules below.

### 6. Verify live, and paste the results

```bash
# the new product URL resolves
curl -s -o /dev/null -w '%{http_code}' -L https://habibaminhas.com/product/ladies-suits/<slug>/

# metadata + indexability
curl -s -L https://habibaminhas.com/product/ladies-suits/<slug>/ \
  | grep -oiE '<title>[^<]*</title>|<meta name="description"[^>]*>|<link rel="canonical"[^>]*>|<meta name="robots"[^>]*>'

# structured data emitting
curl -s -L https://habibaminhas.com/product/ladies-suits/<slug>/ | grep -o '"@type":"[^"]*"' | sort | uniq -c

# sitemap grew, nothing vanished
curl -s -L https://habibaminhas.com/sitemap.xml | grep -c '<loc>'
curl -s -L https://habibaminhas.com/sitemap.xml | grep -o '<loc>[^<]*</loc>' \
  | sed 's|<loc>https://habibaminhas.com||;s|</loc>||' | awk -F/ '{print "/"$2"/"}' | sort | uniq -c | sort -rn
```

The sitemap has `revalidate = 3600`; the product page has `revalidate = 300`. A new row appears
without a redeploy. Do **not** use WebFetch to count sitemap URLs — it approximates.

---

## `public.products` — every column

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | auto |
| `slug` | text NOT NULL | see slug rules |
| `title` | text NOT NULL | see naming convention |
| `short_description` | text | **Details tab.** One `Label: Value` per line, split on newlines |
| `description` | text | **Description tab.** Prose, blank-line separated paragraphs |
| `price` | int NOT NULL | whole PKR, no decimals. CHECK >= 0 |
| `compare_at` | int | strike-through price. CHECK >= 0. null = no sale |
| `category` | text NOT NULL | `ladies-suits` \| `kids-formal` \| `baby-products` \| `accessories` |
| `subcategory` | text[] | drives `/ladies/<sub>/` etc. via `.contains()` |
| `subtype` | text | legacy, unused on new products |
| `sku` | text | `BIBA-{COLOUR}-{FABRIC}-{SIZE}-{NNN}` |
| `status` | text NOT NULL | CHECK: `active` \| `draft` only |
| `featured` | bool | homepage strip **and** `/new/` New Arrivals — one flag does both |
| `stock` | int NOT NULL | must equal the sum of `sizes_stock` |
| `images` | text[] NOT NULL | public WebP URLs, first = main/LCP image |
| `palette` | text[] NOT NULL | 3 hex codes sampled from the garment |
| `sizes_stock` | jsonb | `{"XS":0,"S":0,"M":1,"L":0,"XL":0,"XXL":0}` — always all six keys |
| `size_guide` | text | URL to a size chart image, or null |
| `seo_title` | text | ~55 chars — layout appends ` \| Habiba Minhas` |
| `seo_description` | text | ~155 chars |
| `seo_keywords` | text | comma-separated |
| `badge` | text | CHECK: `New In` \| `Bestseller` \| `Limited` \| `Restock` — **nothing else** |
| `faqs` | jsonb | `[{"question":"…","answer":"…"}]` |
| `tryon_image` | text | garment reference for Virtual Try Room |
| `tryon_enabled` | bool NOT NULL | |
| `created_at` / `updated_at` | timestamptz | auto |

### Check constraints that will bite you
- `badge` — only the four values above. "New Arrival" **fails**.
- `status` — only `active` / `draft`. "inactive" **fails** on insert (though the product page reads it).
- `price`, `compare_at`, `stock` — all must be >= 0.

### Valid subcategory slugs (ladies-suits)
`stitched-suits` · `3-piece-suits` · `2-piece-suits` · `party-wear` · `formal-wear` · `casual`

Note it is `casual`, **not** `casual-wear`.

---

## Slug rules

**URL shape:** `/product/{category}/{slug}/`

The admin panel's `generateProductSlug()` produces `ld-sku-{SKU}` (e.g. `ld-sku-nvy-slk-m-029`),
which is what most older rows use. That format carries **zero keywords** and is weak for both
Google and AI retrieval.

For products inserted by hand, prefer a **descriptive slug**:

```
ld-cream-pink-floral-cotton-3-piece-suit-030
```

This is safe. `generateProductSlug()` is called **only** in `handleCreate` in
`app/admin/products/page.tsx:591` — the edit/update path never touches `slug`, so editing the
product later in the admin panel will not rewrite the URL.

⚠️ **Once a slug is live and indexed, never change it.** A changed slug is a dead URL plus a
redirect, which is exactly the kind of SEO damage the standing rule forbids. Get it right on insert.

---

## Copy rules — writing for Google *and* for AI search

The site currently ranks in Google, AI Overviews, and ChatGPT. What earns AI citations is
different from classic keyword SEO, so write for both:

**Do:**
- State facts as complete, self-contained sentences. AI engines lift sentences out of context —
  "This suit is Rs. 4,500 for the complete 3-piece set" survives extraction; "Only 4500!" doesn't.
- Use hard numbers: price, piece count, size, delivery days, shipping cost, return window.
- Name entities: Habiba Minhas, Karachi, Pakistan, and the major delivery cities.
- Answer real questions in the `faqs` column — 8–9 of them, phrased the way a customer types
  into a search box ("Is this suit stitched or unstitched?", not "Stitching Info").
- Give honest contrast — "for a heavy evening wedding you'd want something more formal."
  Comparative statements get cited disproportionately by AI engines because they're useful.
- Explain *why*, not just *what*: "cotton, because it breathes in Pakistani summer and washes
  at home" beats "100% cotton."

**Don't:**
- Keyword-stuff. Repetition is a negative signal in both systems now.
- Write vague luxury filler ("exquisite craftsmanship, timeless elegance"). It ranks for nothing
  and gets ignored by extraction.
- Invent details you cannot see in the photos. Flag uncertain specifics to the owner instead.

### Title naming convention
```
{Evocative Name} – 3-Piece Stitched {Fabric} Suit with {Distinguishing Feature}
```
Existing set: *Indigo Radiance*, *Bronze Mocha*, *Pearl Radiance*, *Desert Rose*, *Cocoa Essence*,
*Blush Bouquet*.

---

## 🔴 SEO guard rails

`AGENTS.md` says: stop and ask before **any** SEO-touching change.

**Adding a new product is additive and does not trip that rule** — no existing URL, title,
canonical, or schema is modified. Nothing is removed from the sitemap. Proceed, then report the
before/after counts.

**These, however, DO trip the rule — stop and ask first:**
- changing the slug of an existing product
- setting a live product to `draft` (removes it from the sitemap → 404)
- editing `seo_title` / `seo_description` on an already-ranking product
- adding a subcategory that creates a brand-new collection URL — this is additive but worth
  telling the owner, since it's a new indexable page (adding `casual` created `/ladies/casual/`)
- anything in `components/seo/*`

---

## Known gaps (not yet approved to fix)

- **Product FAQs do not emit `FAQPage` JSON-LD.** `app/product/[category]/[slug]/page.tsx`
  renders `faqs` in a tab but only emits `Product` + `BreadcrumbList` schema. The collection
  pages (`/new/`, `/ladies/`) *do* use `FAQSchema`. Wiring product FAQs into schema would be a
  real rich-result win — FAQ rich snippets and AI answer extraction — but it is an SEO-surface
  change and needs the owner's explicit go-ahead first.
- Older ladies-suits rows have keyword-free `ld-sku-*` slugs. **Leave them alone** — they are
  indexed. Only new products get descriptive slugs.
- Most products have `seo_keywords` null.
- `size_guide` is unset on nearly every product, so the size-guide button has nothing to show.
