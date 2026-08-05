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
| 9 | **What fabric?** (if not stated) | drives the spec line, the care instructions, and the keywords | **never guess** — see below |

**Always ask about fabric when the owner does not state it.** Cotton, cotton silk, lawn, and
linen look similar in a photo but their care instructions are opposites — machine wash vs. dry
clean. Publishing the wrong one gets a customer's garment ruined. On product 032 the sheen read
as cotton silk; the owner confirmed cotton.

**Do not infer the collection from the garment — default to `casual`.** Asked three times (032,
034, and by implication 033); the owner chose `casual` every time, including on 034 which has a
fully hand-embroidered yoke and matched `formal-wear`'s own copy. **Stop asking. Use `casual`
unless the owner says otherwise**, and mention the alternative in the reply rather than blocking
on it.

⚠️ This means `/ladies/casual/` now holds heavily embroidered pieces while its copy says the
collection has "little to no heavy embellishment". Softening that clause needs owner approval —
it is live collection copy.

**Match the care line to the embellishment, not to the fabric.** A plain cotton suit is machine
wash cold. A suit with individually placed sequins or beads (034) is hand wash or dry clean, dry
flat, iron on the reverse only. Off-white (035) needs "wash separately, never chlorine bleach,
dry in shade". Reusing one care block across all of them will eventually ruin a customer's
garment.

**Never trust the folder name as a product descriptor.** Product 033 arrived in a folder called
`green chicken kari`; the suit is a printed lawn with an applied lace trim and has no chikankari
on it at all. Craft and technique terms — chikankari, gota, mirror work, zari, block print,
hand-embroidered — are **material claims**. Read the close-up photos, and confirm with the owner
before any of them reaches the copy. Getting one wrong is a false product claim, not a bad keyword.

**Image filenames are crawler-visible.** They appear in Google Images. If the product name changes
after upload, re-run both scripts under the corrected slug and delete the old objects from the
bucket rather than leaving them orphaned:

```bash
node -e "const {createClient}=require('@supabase/supabase-js');require('dotenv').config({path:'.env.local',quiet:true});
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
sb.storage.from('products').remove(['old-name-1.webp','old-name-2.webp']).then(r=>console.log(r.error||r.data.length))"
```

**Watch for ambiguous stock phrasing.** "Sizes are three: medium, one large, and one small" meant
S×1, M×3, L×1 (five pieces), not one of each. Confirm before inserting — `stock` must equal the
sum of `sizes_stock`.

### 2b. Check resolution and decide image order before converting

The gallery shows `images[0]` as the main/LCP shot, so **order matters** and the script sorts by
filename. Rename into a staging folder as `1.png`, `2.png`, `3.png` in display order first —
best full-length front view, then back/side, then detail close-ups.

Check dimensions before converting. Owner folders have contained mixed resolutions (product 031
had a 561×701 front view alongside two 1122×1402 shots). The script caps the long edge at 1600px
and **never upscales**, so a small source stays small. If the intended hero image is under
~1000px wide, keep the order, flag it to the owner, and ask for a full-resolution replacement —
never upscale to hide it, that fakes detail and looks worse.

```bash
node -e "const s=require('sharp');['1','2','3'].forEach(f=>s(f+'.png').metadata().then(m=>console.log(f,m.width+'x'+m.height)))"
```

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

## If the product creates a NEW collection page

Tagging a product with a `subcategory` no product used before creates a live collection page
(`/ladies/<sub>/`). A brand-new collection row usually has `description`, `seo_title` and
`seo_desc` **null**, which means the page ships with no copy and a bare `Casual` as its title.
Fill all three on `public.categories` before leaving it.

How the copy renders (`components/collection/collection-template.tsx:33`):
- `description` is split on `'. '` — the **first two sentences become the hero intro** under the
  `<h1>`; the whole text also renders below the product grid, split into paragraphs on `\n\n`.
- Because of that split, **never put `Rs. ` in the first two sentences** — `"Rs. 250"` splits at
  `"Rs. "` and truncates the intro mid-thought. Write `250 rupees` there, or move it later.
- Target ~2,000–3,300 chars, 6–8 paragraphs. Sibling rows sit at 2,016–2,224.

### Writing collection copy for AEO / GEO

Answer engines (ChatGPT, Claude, Perplexity) and Google AI Overviews lift *sentences*, not pages.
Structure the copy so individual sentences survive being pulled out of context:

1. **Open with a definition.** `"Casual wear in Pakistani fashion means everyday stitched suits
   built for real life…"` — a definitional first sentence is what gets quoted for
   "what is casual Pakistani wear" style queries.
2. **Include one explicit contrast paragraph.** `"The difference between casual and formal
   Pakistani wear is not the cut, it is the weight."` Comparative statements are cited
   disproportionately because they answer a decision, not just a fact.
3. **Justify claims with reasoning.** `"Cotton breathes in Karachi summers where temperatures
   pass 40°C, and it machine washes at home"` beats `"premium quality cotton"`. Cited answers
   need a *because*.
4. **Give a negative recommendation.** `"For evening weddings, barat, and walima, choose formal
   wear instead."` Telling a reader when *not* to buy reads as trustworthy to both raters and
   models, and internally links the sibling collection.
5. **Anchor entities and numbers** — Habiba Minhas, Karachi, Lahore, Islamabad, Rawalpindi,
   Faisalabad, Multan, Peshawar, Quetta, flat Rs. 250, 14-day exchange, standard Pakistani sizes.
6. **Cover the practical tail** — care, washing, sizing, styling. These match long-tail
   conversational queries that product grids never rank for.

Verify the copy is server-rendered (not client-only), or crawlers never see it:
```bash
curl -s -L https://habibaminhas.com/ladies/<sub>/ | grep -oE '<first few words of paragraph 1>'
```

---

## Known gaps (not yet approved to fix)

- **Product FAQs do not emit `FAQPage` JSON-LD.** `app/product/[category]/[slug]/page.tsx`
  renders `faqs` in a tab but only emits `Product` + `BreadcrumbList` schema. The collection
  pages (`/new/`, `/ladies/`) *do* use `FAQSchema`. Wiring product FAQs into schema would be a
  real rich-result win — FAQ rich snippets and AI answer extraction — but it is an SEO-surface
  change and needs the owner's explicit go-ahead first.
- **Every collection page renders the brand name twice in its `<title>`.** The `seo_title` values
  stored in `public.categories` already end with `| Habiba Minhas`, and the root layout's title
  template appends it again:

  ```
  <title>Ladies Formal Wear Pakistan | Pakistani Wedding Outfits | Habiba Minhas | Habiba Minhas</title>
  <title>Stitched Suits Pakistan | Ready-to-Wear Ladies Suits | Habiba Minhas | Habiba Minhas</title>
  <title>3-Piece Silk Suits Pakistan | Ladies Formal Wear | Habiba Minhas | Habiba Minhas</title>
  <title>Ladies Party Wear Pakistan | Semi-Formal Suits | Habiba Minhas | Habiba Minhas</title>
  <title>Ladies Formal Suits Pakistan | Pakistani Women's Fashion | Habiba Minhas | Habiba Minhas</title>
  ```

  This wastes ~17 characters of an already over-length title and reads as low quality. The fix is
  one `UPDATE` stripping the trailing ` | Habiba Minhas` from those `seo_title` rows — but these
  are **live, ranking pages**, so it needs the owner's explicit approval first. Verified affected:
  `/ladies/`, `/ladies/formal-wear/`, `/ladies/stitched-suits/`, `/ladies/3-piece-suits/`,
  `/ladies/party-wear/` (2026-08-06). Likely the same across kids / baby / accessories.

  New rows should **omit** the brand from `seo_title` — the template supplies it. `casual` is
  already written this way and renders correctly.
- ~~`2-piece-suits` has null description/seo_title/seo_desc~~ — **filled 2026-08-06** when
  product 031 made `/ladies/2-piece-suits/` live. All ladies subcategories now have copy.
- Older ladies-suits rows have keyword-free `ld-sku-*` slugs. **Leave them alone** — they are
  indexed. Only new products get descriptive slugs.
- Most products have `seo_keywords` null.
- `size_guide` is unset on nearly every product, so the size-guide button has nothing to show.
