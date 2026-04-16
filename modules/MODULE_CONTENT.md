# Module: Content, Help, Legal, Stores, Journal

Non-catalog pages — editorial, customer care, legal, and store locator. These share a simpler visual grammar than catalog pages: a single hero or section heading, a readable single-column body, and occasional testimonial / callout.

## Files

| Path                                  | Role                                      |
|---------------------------------------|-------------------------------------------|
| `app/about/page.tsx`                  | Brand story, values grid, founder quote   |
| `app/contact/page.tsx`                | Contact points + contact form             |
| `app/stores/page.tsx`                 | 6-city store grid                         |
| `app/journal/page.tsx`                | Editorial index                           |
| `app/content/[slug]/page.tsx`         | Fabric Glossary, Size Guide, Denim Fit Guide |
| `app/help/[slug]/page.tsx`            | FAQ, Returns, Shipping, Payments          |
| `app/legal/[slug]/page.tsx`           | Privacy Policy, Terms of Service          |
| `app/not-found.tsx`                   | 404                                       |

## Slug-driven pattern

`content/`, `help/`, and `legal/` each use a single dynamic route fed by an in-file dictionary. This keeps all structured copy in one place per area rather than spread across dozens of files.

```ts
// app/help/[slug]/page.tsx
const helpPages: Record<string, { eyebrow; title; intro; faqs: { q; a }[] }> = {
  faq: { ... },
  returns: { ... },
  shipping: { ... },
  payments: { ... },
};
```

`generateStaticParams()` returns `Object.keys(dict).map(slug => ({ slug }))` so every entry is pre-rendered.

Phase 2: migrate these to a CMS (Sanity / Hygraph / KeyStatic) and read in the same `async` function. The page components don't need to change.

## FAQ pattern

Help pages render an accordion using **native `<details>` elements** — no JS, no library. The `+` icon rotates 45° when the `<details>` is `open` via a pure CSS selector. That's the simplest accessible accordion you can ship.

## About page

Hero 21:9 banner → story block (2-column grid: heading left, prose right) → 4-card values grid → image triptych (1 large left, 2 stacked right) → closing quote on cream background.

## Stores

Six store cards, 3-up on desktop, 2-up tablet, 1-up mobile. Each card = tall placeholder + address block (icon-prefixed meta). Replace the hard-coded list with a data call in Phase 2.

## 404

Full-bleed `PlaceholderImage` with centered copy and two CTAs (Back home / Shop women). Not wrapped inside the nav/footer — the `app/not-found.tsx` file handles the composition itself.

## Extending

- **New fabric entry:** add a row to the `fabric-glossary.sections` array in `app/content/[slug]/page.tsx`.
- **New FAQ section:** add a top-level key to `helpPages` in `app/help/[slug]/page.tsx` — the route auto-generates.
- **New journal post:** add an object to the array in `app/journal/page.tsx` and (when we add them) `app/journal/[slug]/page.tsx`.
- **New city:** add an object to the `stores` array in `app/stores/page.tsx`.

## Copy tone

Short, sensory, declarative. Avoid marketing superlatives. Prefer fabric names, weights, and specific places over abstractions. Set paragraph max-width to 3xl for readability; use the `font-display italic` for headings, never body.
