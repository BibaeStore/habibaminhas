# HREF / Ahrefs Site-Audit Issues — Resolution Tracker

This folder tracks every issue from the **Ahrefs Site Audit** (project: Habibaminhas, audit #9686006) as we resolve them one by one — what the issue was, how it was fixed, the impact, and any risk, so nothing breaks silently and every change is traceable.

**Site:** https://habibaminhas.com
**Audit snapshot:** 12 Jun 2026 — 6 critical errors at start.

---

## How site architecture affects these issues (read once)

A journal/blog post at `/journal/<slug>/` resolves from **one of two sources** (`app/journal/[slug]/page.tsx`):
1. **Hard-coded editorial posts** — the `editorialPosts` object in that file. Valid slugs: `dupatta-five-ways`, `linen-notes`, `layering-oud`, `summer-wardrobe-edit`, `behind-the-sukoon`.
2. **Supabase `journal_posts` table** — any row with `status = 'published'`. (Blogs are DB rows, **not** `.tsx` files.)

If a slug matches **neither** source, the page calls `notFound()` → **404**. So a "404" almost always means an **internal link pointing at a slug that does not exist** — the fix is to repoint the link at a real page, NOT to create/delete pages.

---

## Status overview

| # | Issue (Ahrefs) | Count | Status | Date |
|---|---|---|---|---|
| 1 | 404 page | 1 | ✅ Fixed | 2026-06-13 |
| 1 | 4XX page (same URL as #1) | 1 | ✅ Fixed | 2026-06-13 |
| 2 | Orphan page (no incoming internal links) | 17 | ✅ Fixed in code → [details](issue-02-orphan-pages.md) | 2026-06-13 |
| 3 | Page has links to broken page | 1 | ✅ Fixed (same link as #1) | 2026-06-13 |
| 4 | Image file size too large | 1 | ⏳ Pending | — |
| 5 | 3XX redirect in sitemap | 1 | ⏳ Pending | — |

> Note: **404 page** and **4XX page** are the *same* finding. 4XX is the umbrella (any 4xx status); 404 is the specific subset. The audit flagged one URL under both, so fixing it once clears both rows.

---

## Issue #1 — 404 page / 4XX page ✅ RESOLVED (2026-06-13)

### What Ahrefs reported
- **Broken URL:** `https://habibaminhas.com/journal/eid-dressing/` → HTTP **404**
- **Inlinks:** 1, first found at `https://habibaminhas.com/` (the **homepage** linked to it)
- Appeared in BOTH "404 page" and "4XX page" reports (same URL).

### Root cause
The homepage "The Journal" teaser (`components/home/journal-teaser.tsx`) had a hard-coded `posts` array with three links. Two of them pointed at slugs that **do not exist** in either the editorial list or the `journal_posts` table:
- `/journal/eid-dressing` ← the one Ahrefs flagged as 404
- `/journal/modest-dressing` ← **latent 404** — same problem, Ahrefs simply hadn't recrawled it yet

(The third, `/journal/dupatta-five-ways`, is a valid editorial post and was left untouched.)

### The fix (repoint links to real, published pages — no page created or deleted)
Edited `components/home/journal-teaser.tsx`:

| Slot | Old href (404) | New href (200 OK, verified real) | Theme match |
|---|---|---|---|
| Post 2 | `/journal/modest-dressing` | `/journal/capsule-wardrobe-pakistani-women-10-pieces` | Everyday / modest styling |
| Post 3 | `/journal/eid-dressing` | `/journal/how-to-dress-eid-dawat-pakistan` | Eid / Occasion (exact original intent) |

For each, the `title`, `excerpt`, `tag`, and `image` were also updated to match the destination post (honest anchor text + image = better SEO and UX). New images verified to exist on disk:
- `/blog/capsule-wardrobe-pakistani-women-10-pieces.webp` ✓
- `/journal/how-to-dress-eid-dawat-pakistan.png` ✓

Both destination slugs confirmed present in `journal_posts` with `status = 'published'`.

### Why this is safe (impact analysis)
- **No page created, no page deleted** → zero new 404 risk.
- **Only an internal link target changed** → the homepage still renders; only where two cards point now differs.
- Verified via repo-wide search that `eid-dressing` and `modest-dressing` are referenced **nowhere else** — this teaser was the sole source.
- Fixes the flagged 404 **and** pre-empts the latent `modest-dressing` 404 before it could appear in the next crawl.

### SEO / Core Web Vitals impact (education)
- **Crawl budget & link equity:** Search engines waste crawl budget on 404s and can't pass "link equity" (ranking value) through a dead link. Repointing the homepage's links to live, relevant posts means that internal authority now flows to real, indexable content instead of into a void.
- **User experience signal:** A homepage link that 404s is a poor UX signal; removing it protects engagement metrics (bounce/dwell) that indirectly support rankings.
- **Core Web Vitals:** CWV (LCP/CLS/INP) measures *page-load* quality, not links — so this change doesn't directly move CWV numbers. Its value is on the **crawlability / indexation / internal-linking** side of SEO health, which is exactly what the Ahrefs "Errors" bucket grades. (The dedicated CWV wins come under Issue #4 "Image file size too large" and image optimization.)

### Verification checklist
- [x] `grep` for `eid-dressing` / `modest-dressing` across repo → 0 remaining references
- [x] Both new slugs exist in `journal_posts` (status = published)
- [x] Both new image paths exist in `public/`
- [ ] After deploy: visit `/journal/how-to-dress-eid-dawat-pakistan` and `/journal/capsule-wardrobe-pakistani-women-10-pieces` → expect 200
- [ ] Re-run Ahrefs crawl → "404 page" and "4XX page" should drop to 0

### Files changed
- `components/home/journal-teaser.tsx`

### Rollback
Revert the single edit to `components/home/journal-teaser.tsx` (restores the two old `href`/`title`/`excerpt`/`tag`/`image` values). No data or pages were touched, so rollback is purely this one file.

---

## Issue #3 — Page has links to broken page ✅ RESOLVED (2026-06-13)

### What Ahrefs reported
- **Page with the broken link:** `https://habibaminhas.com/` (homepage, HTTP 200)
- **Internal outlink to 4xx:** `https://habibaminhas.com/journal/eid-dressing/` → **404** (1 such outlink)

### Relationship to Issue #1 (important to understand)
This is the **same single broken link** as Issue #1, seen from the opposite direction:
- **Issue #1 "404 page / 4XX page"** = the *destination* view (the URL that returns 404).
- **Issue #3 "Page has links to broken page"** = the *source* view (the page that *contains* the broken link).

One link — homepage → `/journal/eid-dressing/` — produced **three** Ahrefs rows (404 page, 4XX page, Page has links to broken page). Fixing the one link clears all three.

### The fix
1. **Already done in Issue #1:** removed the homepage's link to `/journal/eid-dressing/` (the journal teaser now points to 3 valid published posts). So the homepage no longer has any broken outlink. Verified via repo-wide search — 0 code references to `eid-dressing` remain.
2. **Added as hardening (this issue):** a permanent 301 redirect in `lib/legacy-product-redirects.ts` (which is wired into `next.config.ts` → `redirects()`):
   `/journal/eid-dressing/:path*` → `/journal/how-to-dress-eid-dawat-pakistan/`
   This mirrors the pre-existing `modest-dressing` redirect. Now if Google's cached copy, a bookmark, or any external site still points at the old URL, it **301-redirects to the real Eid article** instead of 404-ing — passing link equity to a relevant page.

### Why this is safe
- The homepage change was already verified (Issue #1).
- `/journal/eid-dressing/` is **not** in `sitemap.xml` (sitemap only lists published DB posts + the 5 editorial slugs), so adding a redirect does **not** create a "3XX redirect in sitemap" issue.
- Redirects run before routing; no page/data deleted → zero 404 risk.

### Verification
- [x] Repo search: 0 code links to `eid-dressing`
- [x] Redirect file confirmed wired into `next.config.ts` `redirects()`
- [ ] After deploy: `curl -I https://habibaminhas.com/journal/eid-dressing/` → expect **301** to the Eid article
- [ ] Re-run Ahrefs crawl → "Page has links to broken page" drops to 0

### Files changed
- `lib/legacy-product-redirects.ts` (added 1 redirect line)
- (homepage link itself was changed under Issue #1 in `components/home/journal-teaser.tsx`)

### Rollback
Remove the single added redirect line from `lib/legacy-product-redirects.ts`.
