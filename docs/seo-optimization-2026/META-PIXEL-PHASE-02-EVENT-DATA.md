# SEO-touching change record — Meta Pixel Phase 02 (event data enrichment)

**Date**: 30 August 2026
**Branch**: `fix/settings-pixel-key-collision`
**Approval**: requested and granted by the owner before implementation, per the standing rule
in `AGENTS.md` ("stop and tell the owner FIRST"). The owner chose the full option — both files —
over an analytics-only variant that would have left `app/layout.tsx` untouched.

---

## Why this needed approval at all

Everything before it in the Meta Pixel plan lived under `/admin`, which is `Disallow`ed in
`robots.txt` and therefore has no SEO surface. Phase 02 is the first phase that edits a file
rendering on indexed pages, and the audit's own impact table classified phases 2–3 as
**◐ Indirect**: no new markup and no new scripts, but every event handler is JavaScript, so it
must be measured against INP before it can be called safe.

## What changed

| File | Change | On indexed pages? |
|---|---|---|
| `lib/analytics.ts` | `pageContext()` attaches `page_path` + `page_title` to every Meta event; `toMetaContents()` adds Meta's per-line `contents` array; events now also carry `num_items`, and `content_name` / `content_category` for single-product events | No — a module, not markup |
| `app/layout.tsx` | One line inside the existing `<Script>` body: `fbq('track','PageView')` → `fbq('track','PageView',{page_path: window.location.pathname, page_title: document.title})` | **Yes** |
| `lib/tracking/event-map.ts` | PageView row moved from `partial` to `live`, since it now carries the path | No — admin only |

## The problem being solved (F2)

Meta's own script truncates the address it reports to the bare origin and flags it with
privacy-mode markers. Captured live from four different pages, every event reported
`https://habibaminhas.com` with the path stripped, and no other beacon parameter carried it
either. Ruled out during the audit: canonical tags (correct on every page), a `<base>` tag
(none present), referrer policy (relaxed at runtime, no change), and sensitive-word redaction
(the neutral `/about/` page behaved identically).

The truncation is inside Meta's code and cannot be switched off from here, so the fix does not
depend on knowing why: stop depending on the URL, and send the path as ordinary event data.
That is more reliable than a URL rule even on sites where URL rules work.

## SEO impact assessment

**Unchanged**: rendered markup, `metadata` / `generateMetadata`, canonical URLs, `robots`,
`sitemap.xml`, JSON-LD structured data, headings, internal links, images and `alt` text,
crawlable text. No route, slug or redirect was touched. No server-rendered content differs.

**Core Web Vitals**:

- **LCP / CLS** — no effect. Nothing renders; no element, style or image changed.
- **INP** — the added work is reading `window.location.pathname` and `document.title` inside
  handlers that already ran, plus building a small array. No new event listeners, no new
  re-renders, no new network requests, and no additional scripts.
- **Bundle** — measured before and after on a full production build:

  | | Chunks | Total client JS |
  |---|---|---|
  | Before | 63 | 2,472,953 bytes (2415.0 KB) |
  | After | 63 | 2,473,251 bytes (2415.3 KB) |
  | **Delta** | **0** | **+298 bytes (+0.012%)** |

## Verification performed

- `npx tsc --noEmit` — clean across the project.
- `npx eslint` on all three changed files — 0 errors, 0 warnings.
- `npm run build` — exit 0.
- 21 payload assertions driving the real helpers against a faked `window.fbq`, checking the
  actual object that leaves the browser: page path present, `contents` carrying quantity and
  per-item price, `num_items` summing quantities, `content_name` omitted on multi-item baskets
  where a single name would mislead, `Purchase` keeping its explicit value rather than the
  recomputed line total, and `view_cart` still sending nothing to Meta.
- Live sitemap re-counted: **182 URLs**, every section at or above the recorded baseline.

## Note on the recorded baseline

`AGENTS.md` records a sitemap baseline of 134 URLs verified 2026-08-01. The live sitemap is now
**182** (71 `/product/`, 66 `/journal/`, both grown since). That is growth from new products and
the daily blog queue, not a regression — but the figure in `AGENTS.md` is stale and should be
refreshed so the check stays meaningful.
