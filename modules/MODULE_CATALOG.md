# Module: Catalog (listing pages)

How category pages, collection pages, sale, and The Edit render. All share a single template so the site visual rhythm stays consistent.

## Files

| Path                                            | Role                                       |
|-------------------------------------------------|--------------------------------------------|
| `components/collection/collection-template.tsx` | Shared layout: hero, sticky filter, grid   |
| `components/product/product-grid.tsx`           | Responsive grid wrapper                    |
| `components/product/product-card.tsx`           | Individual tile (image + meta + hover CTA) |
| `app/women/page.tsx`                            | Women hub (all sub-cats)                   |
| `app/women/[...slug]/page.tsx`                  | Women/Unstitched, Ready to Wear, West, Modest, Accessories |
| `app/men/page.tsx`                              | Men hub                                    |
| `app/men/[...slug]/page.tsx`                    | Men sub-categories                         |
| `app/fragrances/page.tsx`                       | Fragrance hub                              |
| `app/fragrances/[...slug]/page.tsx`             | Fragrance sub-categories                   |
| `app/offers/page.tsx`                           | Sale                                       |
| `app/edit/page.tsx`                             | The Edit                                   |

## Shared template

`<CollectionTemplate>` props:

```ts
{
  crumbs: { label: string; href?: string }[];
  eyebrow: string;
  title: string;
  description?: string;
  tone?: [string, string, string];   // 3-color gradient for the banner
  motif?: "lattice" | "floral" | "ogee" | "stripes" | "arch";
  products: Product[];
}
```

Layout:

```
┌──────────────────────────────────────────────────────────┐
│  21:9 placeholder banner with overlay                    │
│  Crumbs › Eyebrow › Title (display italic)               │
│  Description                                             │
├──────────────────────────────────────────────────────────┤
│  ⟪ sticky filter/sort bar ⟫                              │
│  Filter · Colour · Size · Piece · Price · Featured▾      │
├──────────────────────────────────────────────────────────┤
│  ProductGrid (4 cols desktop, 3 tablet, 2 mobile)        │
├──────────────────────────────────────────────────────────┤
│            [ Load more ]                                 │
└──────────────────────────────────────────────────────────┘
```

## Catch-all routing

`app/women/[...slug]/page.tsx` demonstrates the pattern. `params` is a `Promise` (Next 16); we `await` it, derive `[sub, collection]`, and filter `products` accordingly. The crumbs, tone, and motif are picked from per-subcategory maps so each leaf gets a distinctive feel.

Example URLs:

| URL                               | Rendered                               |
|-----------------------------------|----------------------------------------|
| `/women/unstitched`               | Unstitched (all pieces)                |
| `/women/unstitched/sukoon`        | Unstitched › Sukoon                    |
| `/women/ready-to-wear/formal`     | Ready to Wear › Formal                 |
| `/women/west/dresses`             | West › Dresses                         |
| `/women/modest/abayas`            | Modest Wear › Abayas                   |

## Product card

`components/product/product-card.tsx`:

- Aspect ratio 3/4 (4/5 in compact mode, used by Trending tabs).
- Top-left stack: `Badge` for "New In" / "Bestseller" / "Limited" / "Restock" / "Sale".
- Top-right: heart icon (shows only on `group-hover` via opacity transition).
- Bottom overlay on hover: "Quick View" pill + round `+` add-to-bag button.
- Meta: title (1 line clamp), collection (11px tracked), price (+ compare-at strike).
- `PlaceholderImage` motif rotates through the set based on index — avoids five identical tiles side by side.

## Filters / sort — Phase 1 stubs

The chips in the sticky bar are non-functional placeholders. Phase 2 should:

1. Parse `searchParams` in the page component (`async` with `Promise`).
2. Pass a typed `filters` object into `<CollectionTemplate>`.
3. Let the template expose a sheet/popover for each facet, writing back to URL state with `useRouter().replace()`.
4. Restart a server-component render on URL change for crawlable, shareable filtered views.

## Extending

- **New sub-category:** just link it from `lib/data.ts` → `megaMenus`; the catch-all route will render it with a sensible default.
- **New product status:** extend `Product.badge` in `lib/data.ts` and add a matching `Badge` variant in `components/ui/badge.tsx`.
- **Bigger hero:** change `aspect="21/9"` to `16/9` in `CollectionTemplate`.
