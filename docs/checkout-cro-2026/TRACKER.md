# TRACKER — Checkout & Cart CRO

**Last updated:** 2026-07-31
**Overall status:** ✅ Phase 1 implemented on `fix/mobile-checkout-blockers` — awaiting real-device
verification by the owner before merge. 5 / 12 findings fixed (F-01, F-02, F-03, F-04, F-06).

Update this file as work lands. Keep it the single source of truth for what is done.

---

## Findings

| ID | Finding | Severity | Phase | Status |
|---|---|---|---|---|
| F-01 | Cart drawer footer off-screen on mobile (`100vh`) | 🔴 Critical | 1 | ✅ Fixed (svh/dvh) |
| F-02 | WhatsApp FAB (`z-50`) overlaps drawer CTAs (`z-49`) | 🔴 Critical | 1 | ✅ Fixed (z-46 + suppression) |
| F-03 | Free-shipping promise never applied at checkout | 🔴 Critical | 1 | ✅ Fixed — promise removed (owner decision 2026-07-31) |
| F-04 | Purchase notification (`z-60`) covers Add-to-Bag bar | 🟠 High | 1 / 3 | ✅ Fixed (z-47 + suppression) |
| F-05 | Mobile qty stepper never affects the order | 🟠 High | 2 | ⬜ Not started |
| F-06 | `drawerOpen` persisted to localStorage | 🟡 Medium | 1 | ✅ Fixed (partialize) |
| F-07 | No safe-area insets on fixed bottom elements | 🟡 Medium | 1 / 3 | ⬜ Not started |
| F-08 | No `autoComplete`; email mandatory | 🟡 Medium | 4 | ⬜ Not started |
| F-09 | Three co-equal CTAs in drawer | 🟡 Medium | post-1 | ⬜ Not started |
| F-10 | No GA4 ecommerce events | 🟡 Medium | 1 | ✅ Fixed (lib/analytics.ts) |
| F-11 | Hardcoded "In Stock" / "Held for 30 minutes" | 🟢 Low | 2 | ⬜ Not started |
| F-12 | Mobile nav tap targets <44px; logo overflows navbar | 🟢 Low | 3 | ⬜ Not started |

---

## Phases

### Phase 1 — Unblock mobile checkout 🔴 `fix/mobile-checkout-blockers`
> Ships alone. Do not bundle with the CRO redesign.

- [x] 1.1 Drawer `h-screen` → `h-[100svh]` + `supports-[height:100dvh]:h-[100dvh]` + `overflow-hidden` guard
- [x] 1.1b Same treatment for `mobile-menu.tsx:46`
- [x] 1.2 Safe-area padding on drawer footer + `viewport-fit=cover` via `viewport` export in `app/layout.tsx`
- [x] 1.3 WhatsApp `z-50 → z-[46]`; notification `z-[60] → z-[47]`
- [x] 1.4 Suppress FAB + notification while drawer is open **and on all `/checkout/*` routes**
- [x] 1.5 Deleted free-shipping constants, derived values, and the whole banner/progress block
- [x] 4.1 GA4 ecommerce events — 7 events via new `lib/analytics.ts` (also fires Meta Pixel when configured)
- [ ] 1.5b Note in `admin.md` that `freeThreshold` is inert
- [ ] 1.5c Reconcile default mismatch (`settings.ts:78` = 250 vs `admin/settings:187` = "200")
- [ ] **Verified on a real iPhone (Safari)** ← owner
- [ ] **Verified on a real Android (Chrome)** ← owner

**Pulled forward into Phase 1 (were Phase 2 / not planned):**
- [x] 2.2 `partialize: (s) => ({ items: s.items })` — **required** by 1.4. Once `layout-shell`
      reads `drawerOpen`, persisting that flag desyncs SSR (always false) from the client's
      first render (rehydrated from localStorage) and causes a hydration mismatch.
- [x] `@source not` for `docs/` + root `*.md` in `globals.css` — Tailwind v4 scans markdown, so
      the CSS snippets in these very planning docs were being compiled into real utilities and
      shipped, including one invalid rule (`max(…, env(...))` from a prose ellipsis).
- [x] `add_payment_info` also fires on mount for the pre-selected default — a radio's `onChange`
      never fires for the already-checked option, so COD (the majority of orders) would have
      reported ~0 on that funnel step.

**Verification done (2026-07-31):** `tsc --noEmit` clean · `next build` compiles · `viewport-fit=cover`
confirmed in served HTML · `100svh` / `@supports (height:100dvh)` / `max(1.5rem, env(safe-area-inset-bottom))`
confirmed in the built CSS · free-shipping copy absent from all client bundles · WhatsApp FAB present
on `/` and absent on `/checkout/shipping/` · `/`, `/cart/`, `/checkout/shipping/`, `/checkout/payment/` all 200.

> ⚠️ DevTools responsive mode does **not** reproduce F-01 or F-07. Real device or BrowserStack required.

**Decisions — resolved 2026-07-31:**
- [x] Free shipping → **Option B: remove it.** Not offered on any method. Flat shipping always.
      Pricing code needs no change; only the drawer's false promise is deleted.
- [x] Express free-shipping question → **moot**, no free shipping at all.
- [x] WhatsApp FAB position → **stays bottom-right.** Phase 1 changes stacking + funnel
      visibility only, not position.

**Still open:**
- [ ] Phase 3.2 — may the FAB be nudged ~40px up **on product pages only** so it stops covering
      the wishlist heart? Still bottom-right, just above the sticky bar. Not a blocker.

### Phase 2 — Correctness 🟠 `fix/cart-correctness`
- [ ] 2.1 `addItem(item, qty)` + pass `mobileQty`; reset to 1 after add
- [x] 2.2 `partialize: (s) => ({ items: s.items })` — **done in Phase 1** (was a prerequisite for 1.4)
- [ ] 2.3 Remove/ground "In Stock" and "Held for 30 minutes"
- [ ] Decision: should try-on stop silently adding to the bag? *(product call, see 02 §2.1)*

### Phase 3 — Distraction control & layout 🟡 `feat/checkout-focus`
- [ ] 3.1 Overlay suppression policy in `layout-shell.tsx` (per-route table in 02 §3.1)
- [ ] 3.2 Reposition + shrink WhatsApp FAB on mobile
- [ ] 3.3 Safe-area insets on sticky bar, notification, cookie banner
- [ ] 3.4 Bottom clearance on PDP sections (`pb-16` → clears the 73px bar)
- [ ] 3.5 Navbar: logo/container height, `--header-h`, ≥44px tap targets
- [ ] Decision: is the mobile sticky bar intended for tablet? (`lg:` = 1024px)

### Phase 4 — Measurement & checkout UX 🟡
- [ ] 4.1 GA4 events — *moved into Phase 1*
- [ ] 4.1b Meta Pixel (if paid social is planned)
- [ ] 4.2a `autoComplete` on all 9 fields + province select
- [ ] 4.2b Email optional (or justified inline)
- [ ] 4.2c "(optional)" on postal code
- [ ] 4.2d Real email pattern validation
- [ ] 4.2e Validate on blur; scroll-to-first-error on submit
- [ ] 4.2f Sticky/collapsible order total on mobile checkout

### Post-Phase-1 CRO (see `03-CRO-PLAYBOOK.md`)
- [ ] Single primary CTA with price in the button
- [ ] Demote "View Bag" / "Continue Shopping" to text links
- [ ] Show flat `Shipping  Rs.250` line in the drawer *(needs `ShippingConfig` threaded to the
      client — deliberately out of Phase 1; more valuable now that free shipping is gone)*
- [ ] Trust row under the drawer CTA
- [ ] Remove qty stepper from the PDP sticky bar; show price + size instead
- [ ] Contextual "Inquire on WhatsApp" on the mobile PDP
- [ ] Bottom-sheet cart on mobile
- [ ] ~~Actionable free-shipping gap message~~ — **dropped**, no free shipping (2026-07-31)
- [ ] Single-page checkout *(experiment, after instrumentation)*

---

## Verification log

Record real-device test results here as phases land.

| Date | Phase | Device / browser | Result | Notes |
|---|---|---|---|---|
| 2026-07-31 | 1 | Build/CI (no device) | ✅ Pass | tsc clean, build compiles, CSS + viewport meta + overlay suppression verified in output |
| — | 1 | **Real iPhone (Safari)** | ⬜ Pending | Owner to confirm the Checkout button is visible & tappable with the URL bar shown |
| — | 1 | **Real Android (Chrome)** | ⬜ Pending | Same |

---

## Conversion baseline

Capture these **before** Phase 1 ships, so the effect is measurable.

| Metric | Baseline (pre-fix) | Post-Phase-1 | Source |
|---|---|---|---|
| Daily sessions (mobile) | ~20–30 clicks/day, ~83% mobile | — | Search Console |
| `add_to_cart` events | **Not tracked** | — | GA4 (after 4.1) |
| `begin_checkout` events | **Not tracked** | — | GA4 (after 4.1) |
| `purchase` events | **Not tracked** | — | GA4 (after 4.1) |
| Orders in DB | ~0 | — | Supabase `orders` |
| WhatsApp enquiries/day | **Unknown — check the inbox** | — | Manual |

> The WhatsApp row matters: some current visitors may already be converting through WhatsApp,
> untracked. Check before concluding the funnel produces nothing. See `03-CRO-PLAYBOOK.md` §5.

---

## Related docs

- [`README.md`](README.md) — overview and severity summary
- [`01-AUDIT-FINDINGS.md`](01-AUDIT-FINDINGS.md) — full technical detail per finding
- [`02-FIX-PLAN.md`](02-FIX-PLAN.md) — sequenced remediation
- [`03-CRO-PLAYBOOK.md`](03-CRO-PLAYBOOK.md) — conversion recommendations
- `docs/seo-optimization-2026/TRACKER.md` — traffic-side work (the constraint *after* this one)
</content>
