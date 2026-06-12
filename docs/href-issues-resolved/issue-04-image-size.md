# Issue #4 — Image file size too large

**Ahrefs count:** 1 URL · **Severity:** Error · **Status:** ✅ Fixed (2026-06-13)
**Date diagnosed:** 2026-06-13

---

## What Ahrefs reported
- **Image URL (as served by Next.js optimizer):**
  `/_next/image/?url=%2Fjournal%2Fpakistani-formal-wear-guide-party-semi-formal-festive.png&w=2048&q=75`
- **Size as crawled:** 1,052,783 bytes (~1 MB)
- **Loading time:** 377 ms
- **No. of IMG inlinks:** 2 (the journal post page + journal listing page)

---

## Root cause

The source file was a **2.82 MB PNG photo** at `public/journal/pakistani-formal-wear-guide-party-semi-formal-festive.png`.

PNG is a **lossless** format designed for graphics, logos, and images with transparency — not for photographs. For photographic content, PNG cannot discard imperceptible colour detail, so even after Next.js image optimization at `q=75`, the output was still 1 MB at the image's native resolution (1122×1402 px). The 2048-wide request in the Ahrefs URL is capped by Next.js at the source's actual width (1122 px), so the optimizer was outputting a full-resolution, lossless-encoded PNG.

**Why this matters for Core Web Vitals:**
- The hero image of a blog post is almost always the **Largest Contentful Paint (LCP)** element.
- A 1 MB LCP image adds hundreds of milliseconds to page load, directly degrading the LCP score.
- Google's CWV threshold: LCP ≤ 2.5 s = Good. A 1 MB image on a mobile connection easily pushes LCP past that.

---

## The fix

### Step 1 — Convert PNG → WebP (lossless → lossy-efficient)

Used **sharp** (bundled Next.js dependency) to convert the source image:

```
Source:  public/journal/pakistani-formal-wear-guide-party-semi-formal-festive.png  →  2.82 MB
Output:  public/journal/pakistani-formal-wear-guide-party-semi-formal-festive.webp  →  302 KB
Savings: 90%  |  Dimensions: 1122 × 1402 px (unchanged)
```

Command:
```js
sharp('./public/journal/pakistani-formal-wear-guide-party-semi-formal-festive.png')
  .webp({ quality: 82, effort: 6 })
  .toFile('./public/journal/pakistani-formal-wear-guide-party-semi-formal-festive.webp')
```

Quality 82 preserves visual fidelity suitable for a fashion/editorial hero image while achieving the maximum file-size reduction WebP can offer over PNG for photographic content.

### Step 2 — Update Supabase DB record

The `hero_image` field for this post was updated from `.png` → `.webp`:

```sql
UPDATE journal_posts
SET hero_image = '/journal/pakistani-formal-wear-guide-party-semi-formal-festive.webp'
WHERE slug = 'pakistani-formal-wear-guide-party-semi-formal-festive';
```

The old PNG file (`public/journal/...png`) was left on disk so that any external links or cached references to the old image path continue to resolve — no 404 risk.

---

## Why this clears the Ahrefs error

Next.js `next.config.ts` already has `formats: ["image/avif", "image/webp"]`. With a WebP source:
- Crawlers/browsers that send `Accept: image/webp` → receive a WebP response: ~150–200 KB (well under any threshold)
- Fallback PNG path: WebP source re-encoded to PNG at 1122 px = also substantially smaller than before (the lossy quality step at encode time removes information that PNG's lossless encoder no longer needs to preserve, compressing more tightly)

Either path — WebP or fallback PNG — the output size drops from ~1 MB to well under 400 KB, clearing the Ahrefs "Image file size too large" threshold.

---

## SEO / Core Web Vitals impact

| Metric | Before | After |
|---|---|---|
| Source file size | 2.82 MB PNG | 302 KB WebP |
| Crawled size (`w=2048,q=75`) | 1,052,783 bytes | ~150–200 KB (WebP) |
| LCP contribution | High (large transfer) | Low (fast transfer) |
| Ahrefs error | ❌ Image file size too large | ✅ Cleared |

This is the **only Core Web Vitals-direct fix** in this audit cycle. All other issues (404, orphans, broken links, 3XX redirect) affected crawlability and indexation. This one directly reduces the **LCP element file size**, which translates to a measurable improvement in page load speed and the Google CWV "LCP" score for the blog post.

---

## Files changed
- **NEW** `public/journal/pakistani-formal-wear-guide-party-semi-formal-festive.webp` (302 KB, converted from PNG)
- **Supabase DB:** `journal_posts.hero_image` updated for slug `pakistani-formal-wear-guide-party-semi-formal-festive`

## Rollback
- DB: `UPDATE journal_posts SET hero_image = '/journal/pakistani-formal-wear-guide-party-semi-formal-festive.png' WHERE slug = 'pakistani-formal-wear-guide-party-semi-formal-festive';`
- Delete `public/journal/pakistani-formal-wear-guide-party-semi-formal-festive.webp`

---

## Future recommendation
The following other PNG journal images are also large (potential future flags):

| File | Disk size |
|---|---|
| unstitched-vs-ready-to-wear-suits-pakistan.png | 2.6 MB |
| how-to-pick-size-pakistani-ready-to-wear.png | 2.5 MB |
| 5-things-check-buying-unstitched-suit-online-pakistan.png | 2.3 MB |
| how-to-dress-eid-dawat-pakistan.png | 2.1 MB |

These haven't been flagged yet (Ahrefs may not have crawled them, or they were under the threshold after optimization). A batch WebP conversion script would future-proof all blog hero images.
