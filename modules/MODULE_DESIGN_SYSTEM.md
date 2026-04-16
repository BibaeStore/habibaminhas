# Module: Design System

The shared visual vocabulary. If you're picking colors, typography, motion, spacing, or building a new atom, stop here first.

## Files

| Path                                              | Role                                   |
|---------------------------------------------------|----------------------------------------|
| `app/globals.css`                                 | Tailwind v4 `@theme` tokens, keyframes, utility classes |
| `app/layout.tsx`                                  | Loads Fraunces + Manrope via `next/font` |
| `components/ui/button.tsx`                        | `Button` + `buttonStyles` CVA          |
| `components/ui/badge.tsx`                         | `Badge` with 5 variants                |
| `components/ui/input.tsx`                         | Underline-style `Input`                |
| `components/common/placeholder-image.tsx`         | Motif-backed gradient placeholders     |
| `components/common/section-heading.tsx`           | Eyebrow + display title + body         |
| `lib/utils.ts`                                    | `cn()` (clsx + tailwind-merge), `formatPrice()` |

## Tokens

See `DEVELOPMENT.md` §3 for the color + typography table. All tokens live in `app/globals.css` inside a Tailwind v4 `@theme { … }` block — they become Tailwind utilities automatically (`bg-ink`, `text-gold`, `border-border-soft`).

## Button variants

| Variant   | Surface              | When to use                        |
|-----------|----------------------|------------------------------------|
| `primary` | `bg-ink`             | Default CTA                        |
| `gold`    | `bg-gold`            | Secondary CTA or luxe highlight    |
| `outline` | 1px ink border       | Secondary / ghost                  |
| `ghost`   | Transparent          | Nav-style links                    |
| `soft`    | `bg-cream`           | Tertiary (filters, chips)          |

Sizes: `sm` (9h), `md` (11h, default), `lg` (14h).

Shapes: `square` (default) or `rounded` (pill).

Example:

```tsx
<Button variant="outline" size="lg">Shop the drop</Button>
```

## Badge variants

| Variant   | Use                                 |
|-----------|-------------------------------------|
| `default` | Generic label (ink on ivory text)   |
| `new`     | New In / subtle outline             |
| `gold`    | Bestseller                          |
| `sale`    | Sale / markdown                     |
| `outline` | Ghost tag on darker imagery         |

## Placeholder image

The site ships without photography in Phase 1. Every image is a `<PlaceholderImage>` which renders:

- A radial gradient across three tones
- An overlaid SVG motif (`lattice | floral | ogee | stripes | arch | plain`)
- Optional `overlay` scrim for legibility of overlaid copy
- Optional `animate` for a subtle Ken-Burns pan
- Optional `label` pill in the top-left (used on stores / categories)

Its API is tuned so Phase 2 replacement is a minimal change — every usage has a clear `aspect` and no positioning tricks that rely on placeholder internals.

## Motion

Four primitives, all CSS-only:

- `animate-marquee` — infinite ticker (PromoBar).
- `animate-fade-up` — 0.7s ease-out reveal; used per-slide key on hero.
- `animate-slow-pan` — 16s alternating ken-burns on hero / banner placeholders.
- Hover: `link-underline` reveals a 1px underline in 350ms; `Button` variants shift bg in 300ms.

Use sparingly. Stick to CSS. Reach for a motion library only if a component has multi-step choreography that CSS keyframes can't express.

## Spacing rhythm

- Sections: `py-20` on the full-size, `py-16` on the denser ones, `py-14` on utility strips.
- Container: `mx-auto w-full max-w-[1440px] px-4 sm:px-8`.
- Vertical gap within sections: `gap-10` default; `gap-6` on denser grids.

## Typography scale (display)

- Hero titles: `text-6xl` → `text-8xl` clamped by breakpoint.
- Section titles: `text-3xl` → `text-[44px]`.
- Card titles: `text-xl` → `text-2xl`.

Body scale: `text-[13px]` for meta, `text-[14px]` for prose, `text-[15px]` for callouts.

Tracked labels (eyebrows / uppercase meta): `tracking-[0.22em]` through `tracking-[0.34em]` depending on size.

## Do

- Use CSS variables / Tailwind tokens — never hex literals in components.
- Use `<PlaceholderImage>` for every image spot — it keeps proportions and reduces layout shift.
- Respect the 12-column Tailwind grid — 3/4/5/7/8/12 span patterns.

## Don't

- Don't pull in another icon library — Lucide is the only one.
- Don't add another font — Fraunces (display) + Manrope (body) are the whole story.
- Don't reach for shadcn/radix yet — we use simple custom components for the scale we have; revisit if we need menus, dialogs, or combobox.
