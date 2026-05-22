# 🎨 Design Standards

**Last Updated:** 2026-05-22  
**Owner:** Design Team  
**Status:** Active

---

## 📋 Quick Reference

Habiba Minhas uses a **luxury-minimal** aesthetic with warm, boutique tones for the public storefront and a clean, high-contrast white theme for the admin dashboard.

---

## 🎨 Public Storefront Design System

### **Color Palette**

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-ivory` | `#faf7f1` | Page backgrounds, light surfaces |
| `--color-cream` | `#f3eee3` | Input backgrounds, hover states |
| `--color-parchment` | `#ece4d4` | Borders, dividers |
| `--color-border-soft` | `#e5ddd0` | Subtle borders |
| `--color-ink` | `#1a1612` | Primary text, headings |
| `--color-ink-soft` | `#3d3731` | Secondary text |
| `--color-muted` | `#8a8179` | Captions, placeholders |
| `--color-gold` | `#ebd7bc` | Accents, highlights |
| `--color-gold-dark` | `#b89464` | Hover states, active elements |
| `--color-gold-light` | `#f5ede0` | Light accents |
| `--color-rose` | `#c9917e` | Ladies collection accent |
| `--color-sage` | `#8c9b7e` | Baby/nursery accent |
| `--color-sale` | `#9c3b2f` | Sale tags, urgent CTAs |

**Location:** `app/globals.css` lines 3-16

---

### **Typography**

#### **Display Font (Headings)**
- **Family:** Fraunces (serif)
- **Variable:** `--font-display`
- **Weights:** 300, 400, 600
- **Styles:** Normal, **Italic** (used for all headings)
- **Fallback:** Cormorant Garamond, serif

#### **Sans-serif Font (Body)**
- **Family:** Manrope
- **Variable:** `--font-sans`
- **Weights:** 400, 500, 600
- **Fallback:** ui-sans-serif, system-ui

#### **Font Scale (Public Site)**
- Page heading: 36px / 600 / italic
- Section heading: 24px / 600 / italic
- Subsection: 18px / 600 / italic
- Body: 16px / 400
- Small: 14px / 400
- Caption: 13px / 500

**Feature settings:**
```css
font-feature-settings: "ss01", "cv11";
```

**Location:** `app/globals.css` lines 18-19, `app/layout.tsx` lines 9-26

---

### **Spacing & Sizing**

- Base unit: 4px (use Tailwind spacing scale)
- Container max-width: 1280px
- Section padding: 64px vertical (mobile: 40px)
- Card padding: 24px
- Button min-height: 44px (accessibility)
- Input min-height: 44px

---

### **Shadows**

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-soft` | `0 1px 2px rgba(26,22,18,0.04), 0 8px 24px rgba(26,22,18,0.05)` | Cards, modals |
| `--shadow-lift` | `0 2px 6px rgba(26,22,18,0.06), 0 20px 40px rgba(26,22,18,0.08)` | Elevated elements, dropdowns |

---

### **Border Radius**

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 2px | Buttons (subtle) |
| `--radius-md` | 4px | Cards, inputs |
| `--radius-lg` | 8px | Modals, large cards |

---

### **Animations**

#### **Marquee (Announcement Strip)**
```css
animation: marquee 40s linear infinite;
```

#### **Fade Up (Page Entry)**
```css
animation: fade-up 0.7s cubic-bezier(0.2, 0.6, 0.2, 1) both;
```

#### **Slow Pan (Hero Backgrounds)**
```css
animation: slow-pan 16s ease-in-out infinite alternate;
```

**Location:** `app/globals.css` lines 68-106

---

## 🖥️ Admin Dashboard Design System

### **Color Palette (Admin Only)**

| Token | Hex | Usage |
|-------|-----|-------|
| `--admin-bg` | `#ffffff` | Page background |
| `--admin-surface` | `#ffffff` | Cards |
| `--admin-surface-alt` | `#f7f8fa` | Sidebar, hover rows, inputs |
| `--admin-border` | `#e5e7eb` | Borders, dividers |
| `--admin-text` | `#111827` | Headings, body |
| `--admin-text-soft` | `#4b5563` | Labels, secondary |
| `--admin-text-muted` | `#9ca3af` | Captions |
| `--admin-primary` | `#2563eb` | Primary buttons, active nav |
| `--admin-primary-hover` | `#1d4ed8` | Hover states |
| `--admin-primary-soft` | `#eff6ff` | Active nav bg |
| `--admin-success` | `#16a34a` | Success states |
| `--admin-warning` | `#d97706` | Warning states |
| `--admin-danger` | `#dc2626` | Error states |

**Location:** `docs/superpowers/specs/2026-04-18-admin-white-theme-redesign.md` lines 45-68

---

### **Typography (Admin Only)**

- **Family:** Inter (NOT loaded on public site)
- **Base:** 16px / 400
- **Label:** 14px / 600
- **Caption:** 13px / 500
- **Section heading:** 18px / 600
- **Page heading:** 24px / 600
- **NO ITALIC** anywhere in admin

---

## 🎯 Component Design Patterns

### **Buttons**

#### **Public Site**
- Primary: `bg-ink hover:bg-gold-dark` with transition
- Secondary: `border border-ink hover:border-gold-dark`
- Text only: Underline on hover

#### **Admin**
- Primary: `bg-admin-primary hover:bg-admin-primary-hover`
- Outline: `border-2 border-admin-border`
- Danger: `bg-admin-danger text-white`

**Rule:** All buttons must be **labeled** (no icon-only buttons)

---

### **Cards**

#### **Public Site**
```css
background: var(--color-ivory);
border: 1px solid var(--color-border-soft);
border-radius: var(--radius-md);
padding: 24px;
box-shadow: var(--shadow-soft);
```

#### **Admin**
```css
background: var(--admin-surface);
border: 1px solid var(--admin-border);
border-radius: 8px;
padding: 24px;
```

---

### **Forms**

#### **Public Site**
- Label: 11px uppercase tracking-wide, `text-ink`
- Input bg: `bg-cream` (not transparent)
- Input height: 48px
- Focus: `border-ink`, `bg-ivory`

#### **Admin**
- Label: 14px / 600, above input
- Input bg: `bg-admin-surface-alt`
- Input height: 44px
- Focus: `border-admin-primary`

---

### **Product Cards**

- Image ratio: 3:4 (portrait)
- Image loading: `loading="lazy"`
- Placeholder: Cream background with subtle grain
- Price: Tabular figures
- Badge: Absolute position, top-right

---

## 🌐 Responsive Design

### **Breakpoints (Tailwind)**

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### **Mobile-First Approach**

All styles default to mobile, then enhanced for larger screens using `sm:`, `md:`, `lg:` prefixes.

---

## ♿ Accessibility Standards

1. **Color Contrast:** Minimum WCAG AA (4.5:1 for text)
2. **Focus States:** Visible on all interactive elements
3. **Touch Targets:** Minimum 44×44px
4. **Alt Text:** All images require descriptive alt attributes
5. **Semantic HTML:** Use proper heading hierarchy (H1→H2→H3)
6. **Screen Readers:** Use `sr-only` for visually hidden but accessible text

---

## 🚫 Design Don'ts

### **Public Site**
- ❌ No pure black (`#000000`) - use `--color-ink`
- ❌ No pure white (`#ffffff`) for backgrounds - use `--color-ivory`
- ❌ No italic text in admin area
- ❌ No gold/rose/sage colors in admin area

### **Admin**
- ❌ No decorative fonts (Inter only)
- ❌ No italic text
- ❌ No boutique colors (ivory, cream, gold, rose, sage)
- ❌ No icon-only buttons

---

## 📚 References

- **Design Specs:** `docs/superpowers/specs/`
- **Global CSS:** `app/globals.css`
- **Color Palette:** Lines 3-16 in globals.css
- **Fonts:** `app/layout.tsx` (Fraunces, Manrope)
- **Admin Theme:** `docs/superpowers/specs/2026-04-18-admin-white-theme-redesign.md`

---

**Last Major Update:** 2026-05-22  
**Review Frequency:** Quarterly  
**Questions?** Ask the design team or check [cloud.md](../cloud.md)
