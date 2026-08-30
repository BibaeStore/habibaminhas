# SEO-touching change record — Meta Pixel Phase 03 (missing events + Advanced Matching)

**Date**: 30 August 2026
**Branch**: `fix/settings-pixel-key-collision`
**Approval**: the owner was shown exactly what Advanced Matching transmits and chose the full
option (email, phone, name, city, province, postcode) before any code was written. The storefront
event wiring is the same ◐ Indirect class approved for Phase 02, and the same measure-and-record
discipline was applied.

---

## Part 1 — the seven events that fired nowhere

Each is a **standard** Meta event name. That matters: standard names can be used as campaign
objectives and audience rules, whereas an invented name is recorded but cannot be optimised
against.

| Shopper action | Meta event | Wired into |
|---|---|---|
| Searches the site | `Search` | `app/search/page.tsx` — on the debounced settle, so one event per finished phrase, not one per keystroke |
| Saves to wishlist | `AddToWishlist` | `components/product/product-card.tsx` and `add-to-cart-section.tsx` — on **add** only |
| Browses a collection | `ViewCategory` | `components/collection/paginated-products.tsx` |
| Signs up | `CompleteRegistration` | `app/account/signup/page.tsx` |
| Joins the newsletter | `Subscribe` | `components/layout/newsletter.tsx` |
| Contact form or WhatsApp | `Contact` | `app/contact/page.tsx`, `components/common/whatsapp-button.tsx` |
| Uses Virtual Try Room | `CustomizeProduct` | `components/product/add-to-cart-section.tsx` |

`ViewCategory` is fired from `PaginatedProducts` because that component backs all twelve
collection pages and nothing else — putting it on the pages would mean twelve copies that drift
apart. Wishlist events fire only on adding; removing is not a signal Meta has a standard name for.

## Part 2 — shared event IDs (the Phase 04 prerequisite)

Every event now carries an `eventID`. When the Conversions API begins sending the same events
from the server, Meta needs a way to tell "one purchase reported twice" from "two purchases";
matching IDs are collapsed into one.

`Purchase` deliberately uses a **reproducible** ID — `purchase-{orderNumber}` — because the
server must be able to derive the identical value. Every other event uses a fresh UUID.

## Part 3 — Advanced Matching

Set at checkout only, at the moment the shopper has deliberately given us the details. Nothing
is sent from browsing pages. Meta's pixel applies SHA-256 in the browser before transmission, so
Meta receives codes it can match a buyer against but cannot read back.

Values are normalised first, because Meta hashes them literally — `+92 312-029 5812` and
`03120295812` must reduce to the same string or they hash differently and never match:

```
em      lower-cased, trimmed          ph   digits only
fn/ln   lower-cased, trimmed          ct   lower-cased, spaces stripped
st      lower-cased, trimmed          zp   trimmed
country pinned to "pk"
```

## SEO impact assessment

**Unchanged**: rendered markup, metadata, canonical URLs, robots, sitemap, JSON-LD, headings,
internal links, images and `alt` text. No route, slug or redirect touched. The crawlable
all-products `<nav>` in `collection-template.tsx` — which exists so no product page becomes an
orphan — was not modified; only a prop was added to the sibling `PaginatedProducts` call.

**Core Web Vitals**:

- **LCP / CLS** — no effect. Every change is an event handler or an effect that renders nothing.
- **INP** — new work is one `useEffect` per collection page and a handful of handlers that build
  small objects. No new listeners on hot paths, no re-renders, no new network requests, no new
  scripts. `ViewCategory` runs once per collection view, keyed on the category.
- **Bundle** — measured on full production builds:

  | | Chunks | Total client JS |
  |---|---|---|
  | Before Phase 02 | 63 | 2,472,953 bytes |
  | After Phase 02 | 63 | 2,473,251 bytes |
  | After Phase 03 | 63 | 2,476,080 bytes |
  | **Phase 03 delta** | **0** | **+2,829 bytes (+0.11%)** |
  | **Cumulative** | **0** | **+3,127 bytes (+0.13%)** |

## Verification performed

- `npx tsc --noEmit` — clean across the project.
- `npx eslint` on all 13 changed files — **no new problems**. Three pre-existing errors
  (`react/no-unescaped-entities` in `contact/page.tsx`, `react-hooks/set-state-in-effect` in
  `search/page.tsx` and `product-card.tsx`) were confirmed present at HEAD by linting a stashed
  tree, so none originate here.
- `npm run build` — exit 0.
- **25 assertions** driving the real helpers against a faked `window.fbq`: every new event fires
  under its standard name, `Search` ignores an empty query, each event carries an `eventID`,
  ordinary events get a fresh ID while `Purchase` reproduces `purchase-{orderNumber}`, Advanced
  Matching normalises all seven fields correctly, and it transmits **nothing** when the pixel ID
  is absent or no usable detail was supplied. Phase 02 behaviour re-checked for regressions.

## Known gap, unrelated to tracking

`components/layout/newsletter.tsx` does not persist the address anywhere — the form sets a local
`sent` flag and clears the input. The `Subscribe` event now fires correctly, but **no newsletter
list is being built.** Flagged to the owner; out of scope here.
