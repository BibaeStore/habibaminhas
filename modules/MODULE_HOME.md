# Module: Home (Landing)

The landing page is a composition of independent sections. Each one is a self-contained component in `components/home/` — the page itself (`app/page.tsx`) is just the ordering.

## Sections in order

```
1. HeroCarousel          — 3-slide full-bleed autoplay hero with CTA pair
2. AnnouncementStrip     — "300+ new in" stat bar, ship-to-42-countries etc.
3. CategoryTiles         — 6 mood tiles (Fluorescent, Smart Casual, Linen, Modern Muse, Andaaz, Modest)
4. EditorialBlock × 4    — Unstitched · West · Modest Wear · Ready to Wear
                           (orientation alternates left/right)
5. TrendTiles            — 4 trend blocks (Pink Perfection, Evergreen, Embroidered, Print Fever)
6. TrendingTabs          — 5 category tabs × 6 products each
7. TestimonialRow        — 3 customer quotes on cream bg
8. JournalTeaser         — 1 hero post + 2 sidebar posts
```

## Files

| Component                                       | Purpose                                  |
|-------------------------------------------------|------------------------------------------|
| `components/home/hero-carousel.tsx`             | 3-slide carousel, 6.5s autoplay, pause on hover, arrow + dot nav |
| `components/home/announcement-strip.tsx`        | Stat bar + `Shop the drop` link          |
| `components/home/category-tiles.tsx`            | 6-col mood grid with section heading     |
| `components/home/editorial-block.tsx`           | Image + copy + linked sub-navigation     |
| `components/home/trend-tiles.tsx`               | 4-col trend grid                         |
| `components/home/trending-tabs.tsx`             | Tabbed product rail (client component)   |
| `components/home/testimonial-row.tsx`           | 3-column quotes                          |
| `components/home/journal-teaser.tsx`            | Editorial hero + 2 side posts            |

## Hero carousel

- Uses `setInterval` with 6500ms tick.
- `paused` state toggled on container `mouseEnter`/`mouseLeave` so hover halts autoplay.
- Slide change keys the content `<div>` so `animate-fade-up` replays on transition (cheap solution, no library).
- Navigation: arrow buttons + numeric index `01 / 03` + 3 × 1px track bars.

## Editorial block composition

```
<EditorialBlock
  eyebrow="Unstitched"
  title="Fabric, first."
  body="…"
  tone={["#f2e6c9", "#d4b483", "#6b4a20"]}
  motif="floral"
  orientation="left"           // left | right (flip the image/column)
  links={[{ label, href }]}    // rendered as divider-separated rows with arrow
/>
```

`orientation="right"` reverses column order via `grid-flow-dense`-style Tailwind class. The links render as horizontal dividers with an arrow that translates on hover — keeps the density low but invites clicks.

## Trending tabs

Client component. `useState<string>` tracks the active tab key. Products are filtered client-side from `lib/data.ts`. When the catalog moves to a real API, keep the state client-side and fetch via a server action or React Query — don't server-render each tab because you'll lose the snappy tab switch.

## Extending

- **Add a section** → write a component in `components/home/`, import it in `app/page.tsx`, insert at the position you want.
- **Re-order sections** → just move the JSX in `app/page.tsx`. Each section is self-contained (margin, bg).
- **Swap a section for a CMS-driven one** → the component contract is `(props) => ReactNode`. Wrap it with a data-fetching server parent.
