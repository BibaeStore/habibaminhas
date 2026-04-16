# Module: Navigation

The discovery surface of the store — promo marquee, sticky navbar with hover mega-menus on desktop, slide-in drawer on mobile, and the Footer.

## Files

| Path                                         | Role                                        |
|----------------------------------------------|---------------------------------------------|
| `components/layout/promo-bar.tsx`            | Horizontal marquee with promo messages      |
| `components/layout/navbar.tsx`               | Sticky header shell (centered wordmark)     |
| `components/layout/mega-panel.tsx`           | Desktop mega-menu panel with feature tile   |
| `components/layout/mobile-menu.tsx`          | Off-canvas drawer menu                      |
| `components/layout/footer.tsx`               | Services grid + link columns + social       |
| `components/layout/newsletter.tsx`           | "The Atelier Letter" subscribe form         |
| `lib/data.ts` → `megaMenus`, `promoMessages` | Source of all nav content                   |

## Data contract — `MegaMenu`

```ts
type MegaMenu = {
  label: string;
  href: string;
  columns: {
    heading?: string;
    items?: { label: string; href: string; badge?: string }[];
  }[];
  feature?: {
    title: string;
    subtitle: string;
    href: string;
    tone: "rose" | "sage" | "gold" | "ink";
  };
};
```

Change `megaMenus` in `lib/data.ts` to reshape the entire information architecture — Navbar, MegaPanel, and MobileMenu all consume the same array.

## Desktop behavior

- Mega panel **opens on `onMouseEnter`** of the top-level label.
- It **closes on `onMouseLeave` of the entire `<header>`** (not the panel alone — this avoids flicker when crossing the boundary from button to panel).
- The panel is an absolutely-positioned sibling under the nav row, full-width against `max-w-[1440px]` inner grid.
- The active label turns gold; chevron rotates 180°.

## Mobile behavior

- The `lg:hidden` hamburger triggers `<MobileMenu open />`.
- Drawer = 86% viewport width, max 380px. Translate-X transition; backdrop fades.
- Sections are collapsible — only one open at a time. Tap outside or the × to close.
- Account / Wishlist / Cart shortcuts pinned to the drawer foot.

## Sticky + scroll shadow

Navbar listens to `window.scroll`; after `>8px` a 1px bottom shadow (`rgba(26,22,18,0.06)`) is applied. The promo bar sits **above** the navbar and scrolls away — this is intentional: it behaves like an announcement banner rather than a permanent chrome element.

## Search, Region, Wishlist, Cart

Icons only; wired to `/search`, a region selector popover (not yet built), `/wishlist`, `/cart`. The cart shows a hardcoded count badge of `2` — replace with `useCart()` in Phase 2.

## Footer

Footer composes four pieces:

1. **Services strip** — 4 links (Order Tracking, Exchanges & Returns, Stores, Secure Checkout) with Lucide icons.
2. **Link grid** — 4 columns (brand promise, Customer Care, Information, Shop, Contact).
3. **Newsletter** — two-column composition with form.
4. **Legal strip** — copyright + payment icons.

Brand icons (Instagram, Facebook, YouTube) are inline SVGs defined at the top of `footer.tsx` — Lucide does not ship brand marks.

## Extending

- New top-level menu item → append to `megaMenus`.
- New footer column → edit the `linkCols` array inline in `footer.tsx`.
- Swap payment method labels → edit the `<PayIcon label="…">` row at the bottom of `footer.tsx`.
