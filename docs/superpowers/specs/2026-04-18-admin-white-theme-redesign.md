# Admin Dashboard — White Theme Redesign

**Date:** 2026-04-18
**Status:** Approved design, pending implementation plan
**Owner:** Dilawar Khan

## Problem

The current admin area shares the public storefront theme: ivory/cream palette, gold accents, Fraunces italic serif headings, decorative "boutique" styling, and information-dense pages (the dashboard home has ~11 sections of charts, stats, tables, and widgets). The end user is a non-technical, uneducated shop admin whose daily tasks are: check today's orders, mark orders as shipped, add/edit products, view customers. The decorative styling and dense layouts are obstacles to those tasks. Icon-only buttons and ambiguous navigation groupings compound the problem.

## Goals

- A visually simple, high-contrast admin UI that a non-technical user can scan at a glance.
- Reduce cognitive load on the dashboard home — answer "what do I need to do today?" and "where do I go next?" in the first screen.
- Make primary actions unambiguous: every button has a text label, a clear color meaning, and a generous hit target.
- Keep all existing admin functionality accessible — this is a re-skin + layout simplification, not a feature removal.
- Isolate admin styles so public storefront theme is untouched.

## Non-goals

- No change to the public (customer-facing) storefront.
- No change to data models, server actions, API routes, or auth.
- No bilingual (English + Urdu) UI in this pass. Reserved for a later iteration.
- No new features (marketing automation, reporting exports, etc.).
- No dark mode toggle — admin is light-only.

## Scope

All 9 admin pages plus the shell:

1. `app/admin/layout.tsx` — load admin-only stylesheet, apply Inter font variable.
2. `app/admin/page.tsx` — dashboard home.
3. `app/admin/orders/page.tsx` + order detail views.
4. `app/admin/products/page.tsx`.
5. `app/admin/categories/page.tsx`.
6. `app/admin/customers/page.tsx`.
7. `app/admin/analytics/page.tsx`.
8. `app/admin/marketing/page.tsx`.
9. `app/admin/notifications/page.tsx`.
10. `app/admin/settings/page.tsx`.
11. `app/admin/setup/page.tsx` (first-run wizard — same theme).
12. `app/admin/login/page.tsx`.
13. `components/admin/admin-shell.tsx`, `admin-sidebar.tsx`, `admin-topbar.tsx`.

## Design tokens

A new stylesheet `app/admin/admin.css` defines admin-only CSS variables and is imported only from `app/admin/layout.tsx`. The tokens live under an `.admin-root` class applied by the layout so they cannot leak into the public site. Tailwind is still used; admin-specific utility classes (e.g. `bg-admin-surface`) are added via `@theme` inside the admin stylesheet or via arbitrary value classes like `bg-[var(--admin-surface)]`.

**Palette**

| Token | Value | Use |
|---|---|---|
| `--admin-bg` | `#ffffff` | Page background |
| `--admin-surface` | `#ffffff` | Cards |
| `--admin-surface-alt` | `#f7f8fa` | Sidebar bg, hover rows, inputs bg |
| `--admin-border` | `#e5e7eb` | Hairlines, card borders |
| `--admin-text` | `#111827` | Headings, body |
| `--admin-text-soft` | `#4b5563` | Labels, secondary text |
| `--admin-text-muted` | `#9ca3af` | Captions, placeholders |
| `--admin-primary` | `#2563eb` | Primary buttons, active nav, links |
| `--admin-primary-hover` | `#1d4ed8` | Primary button hover |
| `--admin-primary-soft` | `#eff6ff` | Active-nav bg, tile hover bg |
| `--admin-success` | `#16a34a` | Delivered/active/in-stock |
| `--admin-success-soft` | `#dcfce7` | Success pill bg |
| `--admin-warning` | `#d97706` | Pending/low-stock |
| `--admin-warning-soft` | `#fef3c7` | Warning pill bg |
| `--admin-danger` | `#dc2626` | Destructive/cancelled/out-of-stock |
| `--admin-danger-soft` | `#fee2e2` | Danger pill bg |

No gold, rose, sage, ivory, cream, or ink tokens inside admin. No italic text anywhere.

**Typography**

- `--admin-font: "Inter", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`
- Inter is **not** currently loaded by the project. It must be added via `next/font/google` inside `app/admin/layout.tsx` only (exposes `--font-inter`), so it is excluded from the public storefront bundle. Do not add it to `app/layout.tsx`.
- Base size 16px, line-height 1.5, `font-feature-settings: "cv11"` for readable digits.
- Scale: body 16/400, label 14/600, caption 13/500, section heading 18/600, page heading 24/600, hero number 36/700.
- No italic.

**Sizing & shape**

- Buttons and inputs: min-height 44px.
- Card padding: 24px.
- Table row height: 56px.
- Card/button/input radius: 8px (`--admin-radius: 8px`).
- Elevated card shadow (optional): `0 1px 2px rgba(0,0,0,0.04)`. Most surfaces rely on borders, not shadow.

## Shell

### Sidebar

- Fixed 264px wide, white background, 1px right border, full height.
- Brand block at top: logo icon (32×32 in rounded white square with 1px border) + "Habiba Minhas" (Inter 18/600) + "Admin" (12/600 uppercase, tracking 0.12em, `--admin-text-muted`). No gold.
- Two nav groups with small uppercase section headers (12/600, `--admin-text-muted`, tracking 0.08em, 12px side padding):
  - **Daily tasks**: Orders, Products, Customers, Notifications
  - **Setup & reports**: Dashboard, Categories, Analytics, Marketing, Settings
- Nav item: 48px tall, 16px horizontal padding, icon (20px) + label (15/500), rounded 8px, gap 12px.
  - Default: `--admin-text-soft` text, transparent bg.
  - Hover: `--admin-surface-alt` bg.
  - Active: `--admin-primary-soft` bg, 3px left border `--admin-primary`, `--admin-primary` text.
- Orders nav item shows a pending-count pill on the right when `pendingOrders > 0`: solid `--admin-primary` bg, white text, 20px tall, 12/700.
- User block at bottom (border-top):
  - Avatar circle (32px, `--admin-primary-soft` bg, initial in `--admin-primary` 14/700).
  - Name (14/600) + role (12/500 muted) stacked.
  - **"Sign out"** as a labeled outline button beneath — not an icon-only button. 14/500, 44px tall, full width, red-on-hover.

### Topbar

- 72px tall, white, 1px bottom border.
- Left: hamburger (mobile only) + page title (24/600, no italic).
- Right:
  - Search input (hidden below `sm`): 44px tall, `--admin-surface-alt` bg, 1px border, search icon, 16px font.
  - Bell icon (44×44 square outline button) with notification count pill (same blue style as sidebar badge).
  - **"View store"** outline button (44px tall, 16px horizontal padding, 14/500). Opens public site in new tab.
- Mobile (`<md`): sidebar becomes a slide-in drawer with dim backdrop; only title + bell remain on the topbar.

## Page 1 — Dashboard home (`/admin`)

Three sections, in order:

### 1. "Today" panel

- Single white card, 24px padding, 1px border, optional light top accent (4px `--admin-primary` strip).
- Three equal columns divided by vertical hairlines (`--admin-border`), stacks to 3 rows on mobile.
  - **New orders today** — label 14/600 muted, value 36/700, caption 13/500 muted ("today").
  - **Revenue today** — same pattern, value formatted with `formatPrice`.
  - **Pending to ship** — value in `--admin-warning` color if > 0 else `--admin-text`, caption "waiting" or "all caught up".
- Data source: existing `getOrderStats()` — fields `todayCount`, `todayRevenue`, `byStatus.pending + byStatus.processing`.

### 2. "What do you want to do?" tiles

- 4-column grid (`grid-cols-4` desktop, `grid-cols-2` tablet, `grid-cols-1` mobile), 16px gap.
- Section heading above: "What do you want to do?" (18/600) + nothing else.
- Each tile: white card, 1px border, 120px tall, 20px padding, flex column.
  - Icon (28px, `--admin-text-soft`) top-left.
  - Label (16/600) below icon.
  - Hint (13/500 muted) below label — dynamic where possible.
  - Hover: bg → `--admin-primary-soft`, icon + label → `--admin-primary`, border → `--admin-primary`.
- Four tiles:
  - **View orders** → `/admin/orders`. Hint: "3 pending" (from orderStats).
  - **Add product** → `/admin/products?new=1`. Hint: "12 items" (total product count).
  - **Customers** → `/admin/customers`. Hint: "156 total" (from customerStats.total).
  - **Settings** → `/admin/settings`. Hint: no dynamic count — static "Store, shipping, payment".

### 3. "Needs your attention" panel

- Single white card, 1px border. No padding on outer card; internal sections have 24px padding.
- Two sub-sections separated by a hairline:
  - **Orders waiting** — heading 18/600, "View all" link (14/500 `--admin-primary`) right-aligned. List of up to 5 rows:
    - Row: order # (14/600) · customer name (14/500 soft) · amount (14/600 tabular) · **"Process →"** button (outline, 36px, 14/500).
    - Empty: "No pending orders. All caught up." (14/500 muted, centered).
  - **Low stock** — same heading treatment. List of up to 5 rows:
    - Row: 40×52 thumbnail · product name (14/500) · "X left" (14/600 `--admin-warning`) OR "Out of stock" (14/600 `--admin-danger`) · "Edit" outline button.
    - Empty: "All products well stocked." (14/500 muted, centered).

### Empty state (first-run)

If `getOrderStats()` fails AND `getCustomerStats()` fails AND `allProducts.length === 0`, render a single centered card:

- Heading "Welcome to your store" (24/600).
- Copy: "Your store is ready. Add your first product to get started." (16/500 soft).
- Primary button "Add product" → `/admin/products?new=1`.

Drop all skeleton-shimmer loaders from the dashboard. Replace with simple muted text when data is loading (`"Loading…"`). Server components already suspend so this is a safe simplification.

### Removed from dashboard home

- Weekly revenue bar chart → moves to Analytics.
- Daily orders line chart → moves to Analytics.
- Order status distribution bars → moves to Analytics.
- Active products table → merged implicitly into Products page (already exists there).
- "Today's activity" dark card → replaced by the Today panel (light).
- Quick actions list → replaced by the tile grid.

## Page 2 — Orders (`/admin/orders`)

- Page header: title "Orders" + subtitle ("X total, Y pending") + right-aligned **"Export"** outline button (keeps current export feature if it exists).
- Filter bar: pill buttons "All · Pending · Processing · Shipped · Delivered · Cancelled". Active pill = solid `--admin-primary` bg, white text. Inactive = `--admin-surface-alt` bg, `--admin-text-soft` text.
- Search input (44px, full-width on mobile, 320px on desktop) with search icon — filters by order # or customer name.
- Table (white card, 1px border, overflow-x-auto on narrow screens):
  - Headers (14/600 `--admin-text-soft`, `--admin-surface-alt` bg): Order # · Customer · Items · Total · Status · Action.
  - Rows 56px tall, hover `--admin-surface-alt`, hairline divider.
  - Status pill: pending=warning, processing=primary-soft, shipped=primary, delivered=success, cancelled=danger. Pill = 24px tall, 10px horizontal, 12/600, rounded 6px.
  - Action column: **"Update →"** outline button (36px, 14/500). Never icon-only.
- Pagination (if used currently): keep as-is but restyled with outline buttons.

### Order detail

- Two-column layout (stacks on mobile):
  - Left (8 cols): stacked cards — **Customer**, **Items**, **Payment**, **Shipping**. Each card = white, 24px padding, 1px border, heading 18/600 + content rows.
  - Right (4 cols): **Order summary** card (total, status, date) + primary action area.
- Big **"Mark as shipped"** primary button at the top of the right column (44px, full width, 16/600). Disabled with explanatory text when not applicable.
- Secondary actions ("Cancel order", "Print invoice") as outline buttons beneath.
- Destructive "Cancel order" opens a confirmation modal (see common rules).

## Page 3 — Products (`/admin/products`)

- Page header: title "Products" + subtitle ("X total") + primary **"Add product"** blue button.
- Filter/search bar: category dropdown + status pills (All · Active · Draft · Out of stock) + search input.
- View toggle (grid/list) — keep if already exists, restyled as two outline buttons.
- Grid view: responsive cards (`grid-cols-4` desktop, `grid-cols-2` tablet, `grid-cols-1` mobile).
  - Card: white, 1px border, 8px radius. Image area 4:5 ratio, object-cover. If no image: gray `--admin-surface-alt` bg with package icon centered (`--admin-text-muted`). No decorative gradient placeholders.
  - Body: 16px padding, product name (15/600, line-clamp-1), category (13/500 muted), price (16/700), stock pill.
  - Stock pill: `>5` → success-soft bg, success text; `1-5` → warning-soft bg, warning text; `0` → danger-soft bg, danger text. Always a pill, never a lone colored number.
  - Actions: **"Edit"** outline button + **"Delete"** outline button (red text), both labeled, below price.
- List view: table with columns Image · Name · Category · Price · Stock · Actions.
- New-product and edit-product forms (likely a modal or separate page — keep existing pattern) get the same input/button styling.

## Page 4 — Categories (`/admin/categories`)

- Page header: "Categories" + primary **"Add category"** button.
- Simple list (white card):
  - Row: category icon/color swatch · name (15/600) · product count (13/500 muted) · **"Edit"** + **"Delete"** outline buttons.
  - Hairline between rows.
- Add/edit = modal with name input, slug input (auto-filled), color picker (if current feature). **"Save"** primary + **"Cancel"** outline.

## Page 5 — Customers (`/admin/customers`)

- Page header: "Customers" + subtitle ("X total, Y new this month"). No primary action (customers are created via checkout, not manually).
- Search input (by name/email) + optional segment filter pills if they currently exist.
- Table: Name · Email · Orders · Total spent · Last order · Action.
  - Name cell: avatar circle (initials, `--admin-primary-soft` bg) + full name stacked with email below.
  - Action: **"View"** outline button.
- Customer detail (if it exists) gets the same stacked-card treatment as Order detail: cards for Profile, Order history, Addresses, Notes.

## Page 6 — Analytics (`/admin/analytics`)

This is where the charts removed from the dashboard live.

- Page header: "Analytics" + date-range dropdown ("Last 7 days" / "Last 30 days" / "Last 90 days" / "All time"). Default: last 7 days.
- Three stat cards at the top (revenue, orders, avg order value) — same card style as Today panel but without the top accent.
- Three charts stacked:
  1. **Revenue over time** — bar chart, `--admin-primary` bars.
  2. **Daily orders** — line chart, `--admin-primary` line with dots.
  3. **Order status distribution** — horizontal bars. Colors: warning (pending), primary (processing), primary-hover (shipped), success (delivered), danger (cancelled). No gold/sage/rose.
- Each chart lives in a white card (1px border, 24px padding) with heading + caption.
- Keep the existing SVG chart implementations; swap colors and drop the italic heading styling.

## Page 7 — Marketing (`/admin/marketing`)

- Page header: "Marketing" + primary **"Create promo"** button.
- Tabs or segmented control (outline-button style) for: Coupons · Campaigns · Announcements (whatever exists).
- Each list: white card with rows — name · type · date range · status pill · Edit/Delete outline buttons.
- Creation form = modal with plain inputs, same styling as rest of admin.

## Page 8 — Notifications (`/admin/notifications`)

- Page header: "Notifications" + **"Mark all as read"** outline button.
- Filter pills: All · Unread · Read.
- List (white card):
  - Row: blue dot (8px, solid `--admin-primary`) if unread else gray dot · icon (20px, muted) · title (15/600) · message (14/500 soft, line-clamp-2) · timestamp (13/500 muted, right) · **"Mark read"** outline button (only on unread rows).
  - Unread row bg: `--admin-primary-soft` at 30% opacity (very subtle).
  - Hairline between rows.
- Clicking a row marks read + navigates if it has a link target.

## Page 9 — Settings (`/admin/settings`)

- Page header: "Settings".
- Left side: vertical section nav (48px items, same style as sidebar) — Store info · Shipping · Payment · Account · Danger zone.
- Right side: the active section's form, all inputs 44px tall, labels 14/600 above each input, hint text 13/500 muted below each input when needed.
- **"Save changes"** primary button at the bottom of each section — not a floating save bar. This makes it unambiguous what's being saved.
- "Danger zone" section (destructive actions): red-bordered card with red heading, each destructive action is a red outline button + confirmation modal.

## Page 10 — Setup wizard (`/admin/setup`)

- Same theme. Each step is a centered white card (max 640px wide) on `--admin-surface-alt` bg.
- Progress indicator at the top: dots or numbered steps, completed in `--admin-primary`, upcoming in `--admin-border`.
- Primary **"Continue"** blue button + **"Back"** outline button at the bottom of each step.

## Page 11 — Login (`/admin/login`)

- Full-page centered layout on `--admin-surface-alt` bg.
- Centered white card (max 400px wide), 32px padding, 8px radius, subtle shadow.
- Logo icon (48px, centered) at top.
- "Sign in to admin" heading (20/600, centered).
- Subtitle (14/500 muted, centered).
- Email input + Password input (both 44px tall, labels above).
- Primary **"Sign in"** button (full width, 44px, 16/600).
- Error message: red text below the button, role="alert".

## Common rules applied everywhere

- **No icon-only buttons** for destructive or important actions. Labeled always.
- **Confirmation modals** for every delete/destructive action: centered white card (max 440px wide), heading ("Delete this product?"), body copy explaining consequences, **"Delete"** red button + **"Cancel"** outline button. Dim backdrop, focus-trap, Esc closes.
- **Toast notifications** (top-right, max 3 stacked, auto-dismiss 4s):
  - Success: green-soft bg, green text, check icon, 15/500.
  - Error: red-soft bg, red text, x icon.
  - Info: primary-soft bg, primary text, info icon.
- **Loading states**: replace skeleton shimmer with plain "Loading…" text in muted color. Inline spinners (16px, `--admin-primary`) on buttons during async actions, disabled state during submit.
- **Empty states**: centered muted text + a single primary action button when applicable (e.g., "No orders yet. Orders will appear here when customers check out.").
- **Error states**: red-bordered card, danger heading, muted body, retry button.
- **Focus ring**: `outline: 2px solid --admin-primary; outline-offset: 2px` on all interactive elements.
- **Keyboard**: all buttons/links tab-reachable in DOM order. Modals trap focus. Esc closes modals.

## Isolation guarantees

- `app/admin/admin.css` is imported only by `app/admin/layout.tsx`. Public site (`app/layout.tsx`) does not import it.
- All admin tokens are prefixed `--admin-*` so they cannot collide with public `--color-*` tokens.
- Admin wrapping `<div className="admin-root">` in the layout provides a scoping hook for Tailwind arbitrary-value classes if needed.
- Inter font is loaded via `next/font/google` in the admin layout only (kept out of the public bundle).
- No change to `app/globals.css` except additions if absolutely needed — but the design requires zero edits to public styles.

## Risks & open questions

- **Icon library**: keep `lucide-react` (already used). No change.
- **Chart library**: existing SVG-by-hand charts are small; keep them. No dependency additions.
- **Existing Tailwind classes in admin files**: many reference `bg-ivory`, `bg-cream`, `text-ink`, `font-display`, `italic`, `border-border-soft`, etc. All of those need to be swept out of admin files during implementation. This is a mechanical but large change across ~15 files.
- **Server actions / data shapes**: untouched. Only UI layer changes.
- **Middleware auth**: untouched.
- **`app/admin/setup/page.tsx`**: not explored in detail during brainstorming — may contain forms or flows that need per-step attention during implementation.
- **Mobile testing**: needs explicit verification that the sidebar drawer, tile grid, and tables degrade well on 360px-wide screens.

## Success criteria

- All 9 admin pages plus login and setup render in the new white + Inter + blue-accent theme.
- No italic text anywhere in the admin area.
- No gold/ivory/cream/ink color usage in admin files.
- Public storefront appearance is unchanged (no regressions).
- Dashboard home shows exactly 3 sections (Today panel, tile grid, Needs your attention).
- Every destructive action has a labeled button and a confirmation modal.
- All buttons and inputs have min-height 44px.
- Page loads successfully on mobile (360px), tablet (768px), and desktop (1280px).
