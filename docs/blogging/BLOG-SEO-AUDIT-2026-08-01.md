# Blog SEO / AEO / GEO Audit — 2026-08-01

**Scope:** all 31 published posts in `journal_posts`, plus the publishing pipeline and schema.
**Method:** direct database query + live-page inspection as Googlebot. Nothing changed.

---

## 1. The numbers

| | Count |
|---|---|
| **Published** (live, in sitemap) | **31** |
| Planned in `topical-map.md` | 106 |
| **Remaining to write** | **75** |
| Unique hero images on disk | 21 (so **10 posts reuse another post's image**) |

All 31 are `status: published`. There is no backlog of written-but-unpublished drafts — **the
"100 written" are titles and outlines in `topical-map.md`, not finished posts.** That is the
single most important thing to know before planning today's work.

---

## 2. What's genuinely good

Credit where it's due — the foundations are solid:

- ✅ **100% metadata completeness.** Every post has title, meta description, keywords, excerpt,
  hero image, author, category tag. No gaps at all.
- ✅ **`BlogPosting` + `BreadcrumbList` + `WebPage` schema** on every post. Verified live.
- ✅ **Every post has an FAQ block** — the raw material for AEO is already there.
- ✅ **All hero images exist**, WebP, ~1920×1080, 127–308 KB. Properly optimised.
- ✅ **Clean slug structure**, keyword-led, no dates, no IDs.
- ✅ **Auto-sitemap inclusion** — all 37 journal URLs are in `sitemap.xml`.
- ✅ **Related Articles** block on each post.
- ✅ Genuinely useful topic selection — buyer-intent queries, not filler.

This is a better base than most small e-commerce sites have.

---

## 3. 🔴 The biggest find — FAQ schema is imported but never rendered

**`app/journal/[slug]/page.tsx`**

```tsx
line  16:  import { FAQSchema } from "@/components/seo/faq-schema";   // ← imported
line 482:  if (section.type === "faq" && section.questions?.length > 0) { … }  // ← rendered visually
           // FAQSchema is NEVER used anywhere in the file
```

Verified on the live page — the schema types present are `BlogPosting`, `BreadcrumbList`,
`WebPage`, `Organization`, `Person`, `ImageObject`, `ListItem`, `SearchAction`, `ContactPoint`.
**There is no `FAQPage`.**

### Why this is the single highest-value fix on the site

Every one of your 31 posts already contains a hand-written FAQ. Google, Bing, ChatGPT and
Perplexity cannot see it as structured Q&A — they see body text.

You are losing:
- **FAQ rich results** in Google (the expandable accordions under your listing)
- **AI Overview / AEO citations** — answer engines preferentially quote `FAQPage`-marked content
- **GEO visibility** — ChatGPT and Perplexity lean heavily on structured Q&A when composing answers

**The homepage already does this correctly** (`FAQSchema` renders there — I confirmed `FAQPage`
in the homepage's live JSON-LD). It is just missing on the posts.

**Effort: ~5 lines.** It instantly upgrades all 31 published posts *and* every future one. Do this
before writing a single new blog.

---

## 4. Quality problems in what's already published

Measured across all 31:

| Metric | Average | Ideal | Verdict |
|---|---|---|---|
| Words per post | **874** | 1,200–1,800 | ⚠️ Thin |
| Title length | **65 chars** | 50–60 | ⚠️ 20/31 truncate in search results |
| Meta description | **178 chars** | 140–160 | ⚠️ 24/31 truncate |
| Keywords per post | 6 | — | ✅ Fine |
| FAQ blocks | 1 per post | — | ✅ Good (but unmarked, §3) |
| **In-content internal links** | **0** | 3–5 | 🔴 **Zero across all 31** |

### 4a. 🔴 Zero in-content internal links

Not one of the 31 posts links to a product, collection, or another post **from within the body
text**. The only internal links on the page come from the template's "Related Articles" block.

This costs you three things at once:
1. **No link equity** flows from your content to your money pages (`/ladies`, `/product/…`)
2. **No path to purchase** — a reader finishing "Capsule Wardrobe" has nowhere to buy the suits
   just described
3. **Weaker topical clustering** — Google uses internal links to understand which pages are
   authoritative on a topic

`topical-map.md` even has an **"INTERNAL LINKING MASTER STRUCTURE"** section (line 1198) that was
planned and never implemented.

### 4b. The first 10 posts are genuinely thin

| Words | Slug |
|---|---|
| 249 | `walima-guest-outfit-guide-pakistan` |
| 256 | `barat-outfit-ideas-guests-pakistan` |
| 258 | `what-to-wear-mehndi-night-pakistan` |
| 296 | `how-to-style-silk-suit-pakistani-wedding` |
| 296 | `best-eid-outfits-women-pakistan-2026` |
| 483 | `how-to-dress-eid-dawat-pakistan` |
| 491 | `pakistani-formal-wear-guide-party-semi-formal-festive` |
| 526 | `unstitched-vs-ready-to-wear-suits-pakistan` |
| 539 | `how-to-pick-size-pakistani-ready-to-wear` |
| 688 | `5-things-check-buying-unstitched-suit-online-pakistan` |

Posts under 300 words competing for terms like *"best Eid outfits women Pakistan 2026"* will not
rank — the competition is publishing 2,000+ word guides. These are also your **highest
commercial-intent** topics, which makes it worse.

Notably, the later posts are much better — `hair-accessories…` (1,983), `7-ways-drape-dupatta…`
(1,940), `how-to-match-accessories…` (1,863). **The writing quality improved a lot over time.** The
early posts simply need bringing up to that standard.

---

## 5. AEO / GEO readiness

**AEO** (Answer Engine Optimization — winning the answer box / AI Overview) and **GEO**
(Generative Engine Optimization — being cited by ChatGPT, Perplexity, Gemini).

| Signal | Status |
|---|---|
| FAQ content written | ✅ Every post |
| **`FAQPage` schema** | 🔴 **Missing — §3** |
| `BlogPosting` schema | ✅ Present |
| Author attribution | ⚠️ "Habiba Minhas" string, no `Person` entity with credentials |
| Clear question-shaped H2s | ✅ Mostly |
| Direct answers near the top | ⚠️ Intros are narrative; answer engines prefer a direct answer in the first 2–3 sentences |
| Statistics / citations | 🔴 None — AI engines favour content with concrete, citable data |
| `llms.txt` | 🔴 Absent |
| AI crawler rules in robots.txt | ⚠️ `Allow: /` covers GPTBot/PerplexityBot by default, but nothing explicit |
| Freshness signals | ⚠️ `published_at` only; no visible "updated" date |
| Entity consistency | ✅ Strong — Pakistani fashion terms used consistently |

**Biggest AEO wins available, in order:** FAQ schema (§3) → direct answers in the first paragraph
→ `llms.txt` → author entity with credentials.

---

## 6. On publishing 50 posts today

I have to be straight with you about two separate problems.

### 6a. They are not written

The 75 remaining items in `topical-map.md` are **titles, target keywords and outlines** — not
drafts. 50 finished posts at a competitive standard is **60,000–75,000 words** of original
content, plus 50 meta descriptions, 50 keyword sets, 50 excerpts, 50 FAQ sets and 50 images.
That is not a one-session job, and anything produced at that speed would land at the 300-word
quality of your first ten posts — which is exactly what is *not* working.

### 6b. Publishing 50 at once is itself an SEO risk

You currently have 37 journal URLs indexed. Adding 50 in a day is a **135% content spike**.
Combined with uniform structure and formulaic writing, that is a recognised spam pattern —
"content velocity" abuse. On a site that already carries thin posts, the realistic outcomes are
slow indexation, or a quality classifier applied sitewide.

**Given your standing instruction to protect SEO above all else, I am flagging this rather than
executing it.** Mass publication is the one blog action that could genuinely damage the rankings
you asked me to protect.

### 6c. What I recommend instead

**Phase 1 — Foundation (today, ~2 hours, no new content)**
1. Render `FAQSchema` on journal posts → upgrades all 31 posts for AEO instantly
2. Add 3–5 in-content internal links to each existing post
3. Trim the 20 over-long titles and 24 over-long meta descriptions

This lifts every existing post's performance without publishing a single new word — and it is
**strictly lower risk and higher return** than 50 new posts.

**Phase 2 — Rescue the thin posts (next)**
Expand the 10 posts under 700 words to 1,200–1,500. These are your highest commercial-intent
topics and they are currently unable to compete.

**Phase 3 — New content, in batches**
**10–12 posts per batch, 2–3 batches per week.** Reaches 50 new posts in roughly 4–5 weeks at a
quality that ranks, with a natural publishing cadence. Sequence by commercial value:
Baby pillar (purchase intent) → Fabric education (semantic authority) → Culture/gifting.

If you want to go faster than that, I'll do it — but you should make that call knowing the risk,
not by accident.

---

## 7. Images needed

**Spec (matching what's live):**

| Property | Value |
|---|---|
| Format | **WebP** |
| Dimensions | **1920 × 1080** (16:9) — some are 1448×1086, standardise on 1920×1080 |
| File size | 130–300 KB |
| Path | `public/blog/{exact-slug}.webp` |
| Filename | **Must exactly match the post slug** |

**Immediately needed:**
- **10 replacement images** — 31 posts currently share only 21 files, so ten posts reuse another
  post's hero. I can list exactly which on request.
- **1 image per new post.** For a 12-post batch: 12 images, named for the slugs I'll give you.

**Do not** generate 50 images yet — the slugs must be finalised first, or the filenames won't
match and every hero will 404.

---

## 8. Recommended order of work

| # | Task | Effort | Impact |
|---|---|---|---|
| 1 | **Render `FAQSchema` on posts** | ~5 lines | 🔥 Highest — upgrades all 31 for AEO/GEO |
| 2 | In-content internal links | Medium | 🔥 High — link equity + conversion path |
| 3 | Trim titles + meta descriptions | Low | High — stops SERP truncation |
| 4 | Expand the 10 thin posts | High | High — commercial-intent terms |
| 5 | `llms.txt` + direct-answer intros | Low | Medium — GEO |
| 6 | New posts, 10–12 per batch | High | Compounding |

---

**Nothing in this audit has been implemented.** Tell me which item to start with — I'd recommend
#1, because it takes minutes and improves all 31 posts at once.
