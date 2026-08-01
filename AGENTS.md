<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🔴 SEO IS PROTECTED — read this before every change

**The owner's explicit standing instruction (2026-08-01):**

> The site currently ranks in Google, Google AI Overviews, and ChatGPT/AI search. That ranking is
> the single most valuable asset of this business. **Do not disturb SEO. Not by a single dot.**
> If a change touches anything SEO-related — even indirectly, even if you think it's safe —
> **stop and tell the owner FIRST.** Do not make the change and mention it afterwards.

This applies **every session, whether or not the owner repeats it.** Check this file before
starting work.

## Before ANY change, ask: does this touch the SEO surface?

Treat a change as **SEO-touching** if it involves any of these:

| Area | Files / things to watch |
|---|---|
| Metadata | any `export const metadata`, `generateMetadata`, `title`, `description`, `keywords` |
| Canonical URLs | `alternates.canonical`, any change to a route/path/slug |
| Indexability | `robots` meta, `app/robots.ts`, `next.config.ts` redirects/rewrites, `middleware.ts` |
| Sitemap | `app/sitemap.ts`, anything changing which URLs exist |
| Structured data | `components/seo/*`, any JSON-LD (`Product`, `Offer`, `FAQPage`, `BreadcrumbList`, `Organization`, `WebSite`, `Person`) |
| Headings | `<h1>`/`<h2>` text or hierarchy on any indexed page |
| Crawlable content | server-rendered text, product titles/prices, internal `<Link>`s |
| Hiding content | `display:none` / `hidden` on **server-rendered content** (Google discounts hidden text) |
| URLs & routing | slugs, `trailingSlash`, folder renames, deleted pages (→ 404s) |
| Images | `alt` text, removing `priority` from the LCP image |
| Performance | Core Web Vitals — LCP/CLS/INP regressions are a ranking factor |
| Content pages | `app/journal/**`, `app/help/**`, `app/content/**`, `app/legal/**`, collection page copy |

## What is SEO-SAFE (proceed normally)

- Colours, spacing, fonts, and other pure CSS with no layout-shift impact
- Client-only components that render `null` during SSR (cart drawer, modals, toasts) — **these
  are not in the HTML Google sees at all**
- Anything under `/admin/**`, `/api/**`, `/cart/**`, `/checkout/**`, `/account/**`, `/order/**`,
  `/wishlist/**` — all `Disallow`ed in `robots.txt`
- Analytics events, server actions, database work
- Bug fixes that don't change rendered text or markup structure

## Required verification after any SEO-adjacent change

Run these against the built site and paste the results into the reply:

```bash
# metadata + indexability intact
curl -s https://habibaminhas.com/ | grep -oiE '<title>[^<]*</title>|<meta name="description"[^>]*>|<link rel="canonical"[^>]*>|<meta name="robots"[^>]*>'

# structured data still emitting
curl -s https://habibaminhas.com/product/<any-slug>/ | grep -o '"@type":"[^"]*"' | sort | uniq -c

# sitemap URL count did not drop (baseline: 134 URLs — 2026-08-01)
curl -s -L https://habibaminhas.com/sitemap.xml | grep -c '<loc>'

# per-section breakdown — catches "one category vanished" better than the total alone
curl -s -L https://habibaminhas.com/sitemap.xml | grep -o '<loc>[^<]*</loc>' \
  | sed 's|<loc>https://habibaminhas.com||;s|</loc>||' \
  | awk -F/ '{print "/"$2"/"}' | sort | uniq -c | sort -rn
```

⚠️ **Count the raw XML with `grep -c`. Do NOT use WebFetch to count sitemap URLs** — it
summarises through a small model and returns approximations. It reported "188 URLs / 44 journal
posts" for a sitemap that actually contains 134 / 37.

**Baseline verified 2026-08-01 (raw counts, local build matched production exactly):**

| Section | Count |
|---|---|
| **Total `<loc>`** | **134** |
| `/product/` | 54 |
| `/journal/` | 37 |
| `/baby/` | 7 |
| `/ladies/` | 5 |
| `/kids/` | 5 |
| `/help/` | 4 |
| `/accessories/` | 4 |
| `/content/` | 3 |
| `/legal/`, `/about/` | 2 each |

Homepage, `/ladies/` and product pages all `index, follow` with canonicals; product pages emit
`Product`, `Offer`, `Brand`, `AggregateRating`, `BreadcrumbList`; homepage emits `Organization`,
`WebSite`, `Person`, `FAQPage`, `SearchAction`, `ContactPoint`.

## If a change is unavoidably SEO-touching

1. **Stop. Do not implement.**
2. Explain to the owner exactly what would change and the likely SEO impact.
3. Get explicit approval.
4. Record it in `docs/seo-optimization-2026/` (and its `TRACKER.md`) so there is a written trail.

Related: `docs/seo-optimization-2026/` (roadmap + working rules) ·
`docs/href-issues-resolved/` (Ahrefs audit fixes)
