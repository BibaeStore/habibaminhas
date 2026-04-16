# Habiba Minhas — Development Guide

A luxury-minimal, mobile-first e-commerce storefront built on **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **lucide-react** — structured after the mega-menu-led merchandising pattern used by large Pakistani fashion houses (Sapphire-style IA: Women / Men / Fragrances, Unstitched / Ready to Wear / West, Modest Wear, Sale, The Edit).

This file covers environment, conventions, architecture, and how to extend the codebase. For per-module details, see each `modules/MODULE_*.md`.

---

## 1. Environment

| Tool    | Version           |
| ------- | ----------------- |
| Node    | ≥ 18.18           |
| npm     | ≥ 10              |
| Next.js | 16.2.4 (Turbopack)|
| React   | 19.2.x            |
| Tailwind| 4.x (PostCSS plugin) |

### Install & run

```bash
npm install
npm run dev   # http://localhost:3000 (Turbopack)
npm run build
npm run start
npm run lint
```

### TypeScript path aliases

`@/*` → repository root (configured in `tsconfig.json`).

---

## 2. Project structure

```
app/
├─ layout.tsx                 # Root shell — fonts, PromoBar, Navbar, Footer
├─ page.tsx                   # Landing
├─ globals.css                # Tailwind v4 @theme + design tokens + keyframes
├─ not-found.tsx              # 404
├─ women/
│  ├─ page.tsx                # Women hub
│  └─ [...slug]/page.tsx      # Sub-categories (unstitched, ready-to-wear, west, modest, accessories)
├─ men/
│  ├─ page.tsx
│  └─ [...slug]/page.tsx
├─ fragrances/
│  ├─ page.tsx
│  └─ [...slug]/page.tsx
├─ product/[slug]/page.tsx    # PDP
├─ cart/page.tsx
├─ wishlist/page.tsx
├─ account/
│  ├─ page.tsx                # Dashboard
│  ├─ login/page.tsx
│  └─ signup/page.tsx
├─ offers/page.tsx            # Sale
├─ edit/page.tsx              # The Edit (curated)
├─ stores/page.tsx
├─ journal/page.tsx
├─ about/page.tsx
├─ contact/page.tsx
├─ content/[slug]/page.tsx    # Fabric Glossary, Size Guide, Denim Fit Guide
├─ help/[slug]/page.tsx       # FAQ, Returns, Shipping, Payments
└─ legal/[slug]/page.tsx      # Privacy, Terms

components/
├─ layout/                    # PromoBar, Navbar, MegaPanel, MobileMenu, Footer, Newsletter
├─ home/                      # HeroCarousel, CategoryTiles, EditorialBlock, TrendTiles, TrendingTabs, TestimonialRow, JournalTeaser
├─ collection/                # CollectionTemplate (shared listing page)
├─ product/                   # ProductCard, ProductGrid
├─ ui/                        # Button (cva), Badge, Input
└─ common/                    # PlaceholderImage (SVG motifs), SectionHeading

lib/
├─ data.ts                    # Mock catalog: megaMenus, products, heroSlides, categoryTiles, trendTiles, testimonials
└─ utils.ts                   # cn() (clsx + tailwind-merge), formatPrice()

modules/                      # Per-module documentation (see MODULE_*.md)
```

---

## 3. Design system

### Typography
- **Display** — `Fraunces` (variable serif) via `next/font/google`. Used for headings, editorial quotes, and brand wordmark (italic).
- **Sans** — `Manrope` (variable sans). Body, UI, form controls.

Exposed as CSS variables: `--font-fraunces`, `--font-manrope`. Tailwind classes: `font-display`, `font-sans`.

### Color tokens (in `app/globals.css` via `@theme`)

| Token              | Hex      | Usage                                 |
|--------------------|----------|---------------------------------------|
| `--color-ivory`    | #faf7f1  | Page background                       |
| `--color-cream`    | #f3eee3  | Section bg, cards                     |
| `--color-parchment`| #ece4d4  | Hover surfaces                        |
| `--color-border-soft` | #e5ddd0 | Dividers, card borders              |
| `--color-ink`      | #1a1612  | Primary text, CTA                     |
| `--color-ink-soft` | #3d3731  | Secondary text                        |
| `--color-muted`    | #8a8179  | Tertiary / meta                       |
| `--color-gold`     | #a8804b  | Accent, links, focus                  |
| `--color-gold-dark`| #7a5b35  | CTA hover, deep accent                |
| `--color-gold-light`| #d4b483 | Light accent (eyebrow on dark)        |
| `--color-rose`     | #c9917e  | Secondary accent                      |
| `--color-sage`     | #8c9b7e  | Status / delivered                    |
| `--color-sale`     | #9c3b2f  | Sale badges, destructive              |

### Animation utilities

- `animate-marquee` — infinite horizontal marquee (PromoBar)
- `animate-fade-up` — staggered reveal (hero copy, mega-panel)
- `animate-slow-pan` — subtle ken-burns on hero placeholders
- `.link-underline` — thin reveal underline on hover
- `.grain` — noise overlay

### Placeholder imagery

Phase 1 uses `<PlaceholderImage>` in `components/common/placeholder-image.tsx` to render gradient + SVG-motif placeholders (lattice, floral, ogee, stripes, arch). Every placeholder accepts a `tone` (3 colors) and a `motif`. This keeps the visual rhythm of the site without shipping stock photography.

When real assets arrive in Phase 2, replace each `<PlaceholderImage>` with `next/image`. The prop API is compatible enough that a codemod-style find/replace is viable — see **Phase 2 migration** below.

---

## 4. Conventions

### Next.js 16 specifics

- **`params`/`searchParams` are `Promise`s.** Always `await` them inside page components, `generateMetadata`, and `generateStaticParams`. See `app/women/[...slug]/page.tsx` for the pattern.
- **App Router only.** No `pages/` folder.
- **Turbopack** is the default dev bundler.

### Server vs client components

- Default: **server component**. Only mark `"use client"` when the file uses state, effects, or browser APIs.
- Current client components:
  - `components/layout/navbar.tsx` (hover state, scroll listener)
  - `components/layout/mega-panel.tsx` (nested use of onClose)
  - `components/layout/mobile-menu.tsx` (open/close state)
  - `components/layout/newsletter.tsx` (form state)
  - `components/home/hero-carousel.tsx` (autoplay + manual nav)
  - `components/home/trending-tabs.tsx` (tab state)

### Imports

- Icons: `import { IconName } from "lucide-react"`. Brand icons (Facebook/Instagram/YouTube) are **not shipped by Lucide** and are declared as inline SVGs in `components/layout/footer.tsx`. Keep them there; avoid adding a separate icon package.
- Styling: every component uses Tailwind utility classes. Variant-heavy components use `class-variance-authority` (see `components/ui/button.tsx`).
- Utility: `cn(...)` from `lib/utils.ts` to merge class names safely.

### Accessibility

- All icon-only buttons ship `aria-label`.
- Focus-visible ring on all primary buttons.
- Mobile menu is dismissable via backdrop click, close button, and link click.
- Navigation uses real `<Link>`; no `<div onClick>` routing.

---

## 5. Data layer (mock)

All content lives in `lib/data.ts`:

- `megaMenus` — the Navbar/MegaPanel/MobileMenu data. Change this to reshape the IA.
- `products` — mock catalog (~30 SKUs across `unstitched | ready-to-wear | west | men | fragrance`). `palette` drives the placeholder colors.
- `heroSlides` — hero carousel (3 slides).
- `categoryTiles`, `trendTiles` — landing grids.
- `testimonials`, `promoMessages` — marketing.

When wiring real data in Phase 2, replace these exports with async functions that fetch from a CMS / backend, but keep the same shapes so the consuming components stay untouched.

---

## 6. Routing pattern

Listing pages use a shared `<CollectionTemplate>` that takes `crumbs`, `eyebrow`, `title`, `description`, `tone`, `motif`, and `products`. This keeps /women, /men, /fragrances, /offers, /edit, and all their sub-routes visually identical and easy to extend.

Catch-all routes (`[...slug]`) are used for nested categories. For example:

```
/women/unstitched             → slug = ["unstitched"]
/women/unstitched/sukoon      → slug = ["unstitched", "sukoon"]
/women/west/dresses           → slug = ["west", "dresses"]
```

---

## 7. Phase 2 migration (placeholders → real assets)

1. Add images to `public/` (recommend `public/products/<slug>/01.jpg` etc.).
2. Extend the `Product` type in `lib/data.ts` with `images: string[]`.
3. In `components/product/product-card.tsx` and PDP, swap `<PlaceholderImage>` for `next/image` with `fill` + `sizes`. Keep the `aspect-*` wrapper for layout stability.
4. Configure remote patterns in `next.config.ts` if assets come from a CDN.
5. Keep `<PlaceholderImage>` as a fallback for editorial/hero sections where art direction matters (mega panels, 404).

---

## 8. Testing the site manually

Happy paths to click through after each change:

- `/` — hero autoplays, mega-menus open on hover, promo bar scrolls, carousel dots track slide.
- `/women/unstitched/sukoon` — crumbs render; 6 items in the grid; sticky filter bar on scroll.
- `/product/uns-1` — gallery on left, sticky summary on right (desktop); size pills + colour swatches are keyboard-focusable.
- `/cart` — subtotal = sum of line items; shipping shows `Complimentary` over Rs. 3,500.
- `/account` — sidebar is horizontally scrollable on mobile; stats update.
- `/doesnotexist` — renders the 404 page without the main navbar breaking.
- Resize to 375px — hamburger replaces menu; drawer slides in; overlay dims; close button + backdrop both dismiss.

---

## 9. Deployment

The app is a standard Next.js 16 app; any platform that supports Next 16 works (Vercel, Netlify, AWS with OpenNext, self-hosted node). No server-only secrets required for Phase 1.

---

## 10. Where to look when…

| You want to…                            | Open                                                 |
|----------------------------------------|------------------------------------------------------|
| Change primary color or font           | `app/globals.css`                                    |
| Add a nav menu item                    | `lib/data.ts` → `megaMenus`                          |
| Add a product                          | `lib/data.ts` → `products`                           |
| Edit the landing composition           | `app/page.tsx`                                       |
| Change category tiles / trends         | `lib/data.ts` → `categoryTiles` / `trendTiles`       |
| Add a new static page (FAQ, legal…)   | `app/help/[slug]/page.tsx` or `app/legal/[slug]/page.tsx` |
| Tweak the hero slides                  | `lib/data.ts` → `heroSlides`                         |
| Swap a placeholder for real imagery    | See **Phase 2 migration** above                      |
