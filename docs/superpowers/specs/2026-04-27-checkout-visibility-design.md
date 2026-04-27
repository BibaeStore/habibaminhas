# Checkout Visibility Redesign

**Date:** 2026-04-27  
**Scope:** `app/checkout/shipping/page.tsx`, `app/checkout/payment/page.tsx`  
**Approach:** Option A — same palette, same typography, targeted contrast fixes only

---

## Problem

The checkout forms are hard to read and interact with because:
- Field labels use `text-muted` (low contrast gray), nearly invisible against the ivory background
- Form inputs use `bg-transparent` — fields have no visual presence; only a hairline border separates them from the page background
- Selected shipping / payment options look nearly identical to unselected ones — the `border` vs `border border-ink` distinction is too subtle
- Native radio inputs styled with `accent-ink` are too small and don't match the brand's custom aesthetic
- Completed step indicator uses `bg-sage` instead of the brand's established `gold-dark` accent
- Sidebar `sticky top-[116px]` is hardcoded and no longer matches the fixed header height

---

## Changes

### 1. Field labels
| Before | After |
|--------|-------|
| `text-[11px] uppercase tracking-[0.22em] text-muted` | `text-[11px] font-semibold uppercase tracking-[0.22em] text-ink` |

Applied to every `<label>` span in both pages, including the Province select label and apartment optional label.

### 2. Input and select backgrounds
| Property | Before | After |
|----------|--------|-------|
| Background | `bg-transparent` | `bg-cream` |
| Border (rest) | `border-border-soft` | `border-border-soft` (unchanged) |
| Border (focus) | `focus:border-ink` | `focus:border-ink focus:bg-ivory` |
| Placeholder | — | `placeholder:text-muted/60` |
| Height | `h-11` (44px) | `h-12` (48px) |

Applied to all `<input>` and `<select>` elements on both pages.

### 3. Shipping method option cards (shipping page)
| State | Before | After |
|-------|--------|-------|
| Selected border | `border border-ink` | `border-2 border-ink` |
| Selected background | `bg-cream` | `bg-cream` (unchanged) |
| Unselected border | `border border-border-soft` | `border-2 border-border-soft` |
| Radio input | native `accent-ink` | visually hidden (`sr-only`); replaced with a styled `div`: 20×20px circle, `border-2 border-border-soft` at rest → `bg-ink border-ink` selected with a `6×6px ivory dot` inside |

### 4. Payment method option cards (payment page)
Same border and radio treatment as shipping method cards.

| State | Before | After |
|-------|--------|-------|
| Selected border | `border border-ink` | `border-2 border-ink` |
| Unselected border | `border border-border-soft` | `border-2 border-border-soft` |
| Hover | `hover:border-ink/40` | `hover:border-ink/40` (unchanged) |
| Active dot indicator | `h-2 w-2 rounded-full bg-ink` (kept as extra) | removed (redundant once border-2 is applied) |

### 5. Step indicator
| State | Before | After |
|-------|--------|-------|
| Completed circle | `bg-sage text-ivory` | `bg-gold-dark text-ivory` |
| Connector line | always `bg-border-soft` | `bg-gold-dark` when step is done, `bg-border-soft` when pending |

No size changes to circles or labels.

### 6. Sidebar sticky positioning
| Page | Before | After |
|------|--------|-------|
| Shipping | `className="sticky top-[116px]"` | `style={{ top: "calc(var(--header-h) + 24px)" }}` with `className="sticky ..."` |
| Payment | `className="sticky top-[116px]"` | same |

---

## What does NOT change
- Font families, font sizes, letter-spacing, line-height
- Layout grid (7-col form / 5-col sidebar)
- Colour palette (ivory, cream, parchment, ink, gold-dark, border-soft)
- CTA button styles (`bg-ink → hover:bg-gold-dark`)
- All copy, placeholders (text content only), section headings
- Card fields panel (card number / expiry / CVV) — same treatment as other inputs
- Gift message textarea — same label + background treatment
- Security notice and trust badge rows — unchanged
- All business logic, validation, state management, routing

---

## Files affected
- `app/checkout/shipping/page.tsx`
- `app/checkout/payment/page.tsx`
