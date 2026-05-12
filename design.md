# Habiba Minhas — Design System

Luxury-minimal Pakistani fashion house. The visual language is warm ivory, editorial serif headings, restrained gold accents, and generous whitespace.

---

## Colour Palette

All tokens live in `app/globals.css` inside a Tailwind v4 `@theme` block and become utilities automatically.

| Token | Hex | Tailwind class | Use |
|---|---|---|---|
| `ivory` | `#faf7f1` | `bg-ivory` / `text-ivory` | Page background, card surfaces |
| `cream` | `#f3eee3` | `bg-cream` | Secondary surfaces, sidebar fills |
| `parchment` | `#ece4d4` | `bg-parchment` | Scrollbar track, hover fills |
| `border-soft` | `#e5ddd0` | `border-border-soft` | All dividers and card borders |
| `ink` | `#1a1612` | `bg-ink` / `text-ink` | Primary text, CTA buttons |
| `ink-soft` | `#3d3731` | `text-ink-soft` | Body copy, secondary text |
| `muted` | `#8a8179` | `text-muted` | Captions, labels, placeholders |
| `gold` | `#ebd7bc` | `bg-gold` | Text selection highlight |
| `gold-dark` | `#b89464` | `text-gold-dark` / `bg-gold-dark` | Accent CTAs, active states, links |
| `gold-light` | `#f5ede0` | `bg-gold-light` | Warm notification banners |
| `rose` | `#c9917e` | `text-rose` | Soft accent (rarely used) |
| `sage` | `#8c9b7e` | `text-sage` / `bg-sage` | Delivered / success states |
| `sale` | `#9c3b2f` | `text-sale` / `bg-sale` | Discounts, errors, cancelled |

### Usage rules
- Page backgrounds: `bg-ivory`
- Nested card on page: `bg-cream`
- Card inside card: `bg-ivory`
- Borders: always `border-border-soft` (never `border-gray-*`)
- Primary CTA: `bg-ink text-ivory hover:bg-gold-dark`
- Secondary CTA: `border border-border-soft hover:bg-cream`
- Error / destructive: `text-sale`
- Success / confirmed: `text-sage`

---

## Typography

Two fonts loaded via `next/font` in `app/layout.tsx`:

| Variable | Font | Class | Use |
|---|---|---|---|
| `--font-display` | Fraunces (serif, italic-first) | `font-display` | H1–H3, product names, pull quotes |
| `--font-sans` | Manrope (humanist sans) | `font-sans` (default) | All body copy, labels, UI |

### Heading scale

```
text-4xl italic font-display  →  Hero / page H1  (typically sm:text-5xl or sm:text-6xl)
text-3xl italic font-display  →  Section headings
text-2xl italic font-display  →  Card headings
text-xl  italic font-display  →  Sub-section labels
```

### Label / overline convention

```
text-[11px] uppercase tracking-[0.3em] text-gold-dark   →  section eyebrow
text-[11px] uppercase tracking-[0.22em] text-muted      →  field labels, meta
text-[9px]  uppercase tracking-[0.22em] text-muted      →  micro-labels inside cards
```

### Body text

```
text-[14px] leading-relaxed   →  paragraph / description copy
text-[13px]                   →  table rows, item details
text-[12px]                   →  footer links, trust badges
text-[11px]                   →  captions, timestamps
```

---

## Spacing & Layout

Max content width: `max-w-[1440px] mx-auto`  
Horizontal padding: `px-4 sm:px-8`  
Section vertical rhythm: `py-16 sm:py-20` (top-level sections), `mt-10`–`mt-14` (within a section)

Header height CSS variable:
```css
--header-h: 88px;    /* mobile  (PromoBar ~36px + Navbar 52px) */
--header-h: 108px;   /* desktop (PromoBar ~36px + Navbar 72px) */
```
Use `style={{ paddingTop: "var(--header-h)" }}` on the main content wrapper.

---

## Component Patterns

### Buttons

```tsx
/* Primary — ink background */
className="inline-flex h-12 items-center gap-2 bg-ink px-8 text-[12px] uppercase tracking-[0.28em] text-ivory hover:bg-gold-dark transition-colors"

/* Secondary — outline */
className="inline-flex h-12 items-center gap-2 border border-border-soft px-8 text-[12px] uppercase tracking-[0.28em] text-ink hover:bg-cream transition-colors"
```

Height: `h-10` (compact), `h-11` (default), `h-12` (large/CTA)  
Text: always `text-[11px]–text-[12px] uppercase tracking-[0.22em–0.28em]`  
No border-radius (sharp corners are the brand standard).

### Form inputs

```tsx
className="h-12 border border-border-soft bg-ivory px-4 text-[14px] outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:bg-white"
```

Labels: `text-[11px] font-semibold uppercase tracking-[0.22em] text-ink`

### Cards / panels

```tsx
/* Standard panel */
className="border border-border-soft bg-cream px-6 py-5"

/* On-page section box */
className="border border-border-soft bg-ivory p-6"

/* Gold accent banner */
className="border border-gold-dark/30 bg-gold-light px-5 py-4"

/* Error/alert */
className="border border-sale/30 bg-sale/5 px-6 py-8"
```

### Dividers

```tsx
<div className="border-t border-border-soft" />
```

Never use `border-gray-*` — always `border-border-soft`.

---

## CSS Utility Classes

Defined in `app/globals.css`:

| Class | Effect |
|---|---|
| `.animate-marquee` | Continuous horizontal scroll (promo bar) |
| `.animate-fade-up` | 0.7s fade + 8px upward entrance |
| `.animate-slow-pan` | 16s subtle Ken Burns pan (hero images) |
| `.no-scrollbar` | Hides scrollbar on horizontal rail |
| `.skeleton` | Shimmer loading placeholder |
| `.link-underline` | Hover underline that grows left-to-right |
| `.grain` | Micro film-grain overlay (3px dot pattern) |

---

## Logo & Brand Assets

All in `public/logo/`:

| File | Use |
|---|---|
| `habiba-minhas-logo-t.png` | Navbar, footer, mobile menu header, email header (transparent background) |
| `habiba-minhas-logo.png` | Invoice PDF header (white background) |
| `habiba-minhas-icon.png` | Page loader spinner, cookie consent |
| `habiba-minhas-icon-t.png` | Admin login page |
| `habiba-minhas-logo.ai` | Source design file (do not serve) |

### Email logo rule
Use the full URL `https://habibaminhas.com/logo/habiba-minhas-logo-t.png` in email HTML — email clients cannot resolve relative paths. Always render on an ivory (`#f9f6f0`) background cell.

---

## Image Folders

| Folder | Content |
|---|---|
| `public/HeroSection/` | WebP hero/banner images (ladies-suits, kids-formal, baby-bedding, baby-nests, accessories, new-arrivals) |
| `public/categories/` | WebP category tile thumbnails (same set, smaller) |
| `public/editorial/` | Editorial lifestyle shots (ladies-collection, kids-festive, baby-nursery, accessories) |
| `public/trending/` | Trending product thumbnails (floral-lawn, emerald-embroidery, sage-bloom, pink-blossom) |
| `public/profiles/` | Testimonial customer avatars (fatima-r, nadia-k, sara-a) |
| `public/products/` | Static product demo images (referenced by public/data/sold.json + reviews.json) |
| `public/logos/payments/` | Payment method logos (cod, jazzcash, easypaisa, visa, mastercard, bank-transfer) |
| `public/icons/` | `whatsapp.png` only — social icons are inline SVG in `components/common/social-icons.tsx` |

---

## Shadows

```css
shadow-soft   →  box-shadow: 0 1px 2px rgba(26,22,18,0.04), 0 8px 24px rgba(26,22,18,0.05)
shadow-lift   →  box-shadow: 0 2px 6px rgba(26,22,18,0.06), 0 20px 40px rgba(26,22,18,0.08)
```

Use `shadow-soft` on cards at rest, `shadow-lift` on drawers and modals.

---

## Motion Principles

- **Transitions**: `transition-colors` for colour changes, `transition-transform duration-300 ease-in-out` for panels/drawers.
- **Entrance**: `animate-fade-up` for hero text and section introductions.
- **Marquee**: `animate-marquee 40s linear infinite` on the promo bar.
- **No bounce**: Use cubic-bezier(0.2, 0.6, 0.2, 1) — smooth deceleration, not spring physics.
