# Module: Product Detail (PDP)

The single-product page — gallery, summary, variant picker, details, cross-sell.

## Files

| Path                               | Role                                  |
|------------------------------------|---------------------------------------|
| `app/product/[slug]/page.tsx`      | PDP                                   |
| `components/product/product-card.tsx` | Related products row               |
| `components/common/placeholder-image.tsx` | Gallery + thumbnails images   |

## Data

Single product is looked up from `lib/data.ts` → `products` by slug. `generateStaticParams()` pre-renders every product at build time.

```ts
type Product = {
  id: string;
  slug: string;
  title: string;
  collection: string;
  price: number;
  compareAt?: number;
  badge?: "New In" | "Bestseller" | "Limited" | "Restock";
  palette: [string, string, string];
  category: string;
  pieces?: string;
};
```

## Layout (desktop)

```
┌─ crumbs ────────────────────────────────────────────────┐
│                                                          │
│  ┌───────────── gallery (col-span 7) ────────────────┐  │
│  │ big 4/5 hero                                      │  │
│  │ ┌──┐ ┌──┐ ┌──┐ ┌──┐  thumbnails                   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ summary (col-span 5, sticky top-28) ─────────────┐  │
│  │ Badge · Rating                                     │  │
│  │ Title (display italic)                             │  │
│  │ Collection · SKU                                   │  │
│  │ Price · compareAt · savings                        │  │
│  │ Colour swatches                                    │  │
│  │ Size pills (XS S M L XL)                           │  │
│  │ [ Add to bag ]                                     │  │
│  │ [ Wishlist ] [ Share ]                             │  │
│  │ Trust strip (4 icons, 2 cols)                      │  │
│  │ Details (fabric, GSM, care)                        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  You may also love — 4 related products                 │
└──────────────────────────────────────────────────────────┘
```

## Gallery

Phase 1: six placeholder panels (1 hero + 5 motif variants) using `tone = product.palette`. Each panel is a different motif so the gallery reads as diverse without real photography.

Phase 2: swap `<PlaceholderImage>` for `<Image fill sizes="…">` wrapped in the existing aspect-ratio divs. Add a lightbox (suggest `react-photo-view` or vanilla `dialog`).

## Variants

- **Size** is UI-only right now (pill buttons; medium pre-selected). Wire to URL state + cart payload in Phase 2.
- **Colour** uses the three palette entries as swatch chips. Phase 2: switch to an explicit `variants: { colour, image[] }[]` shape on `Product`.

## Cross-sell

Related products = same `category`, excluding the current product, take 4. Deliberately **not** the same collection — we found the mix sells better across collections.

## SEO

`generateMetadata` returns the product title. Extend with Open Graph and product JSON-LD when images land.
