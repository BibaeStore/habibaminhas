# Checkout & Cart CRO Audit — 2026

**Status:** 📋 Audit complete · owner decisions recorded · **nothing implemented yet**
**Opened:** 2026-07-31 · **Decisions logged:** 2026-07-31
**Owner:** Habiba Minhas
**Scope:** Add-to-Bag → Cart drawer → /cart → /checkout/shipping → /checkout/payment, across mobile / tablet / desktop.

---

## Why this exists

Site traffic is ~600–700 impressions and 20–30 clicks per day, **~83% of it mobile**, with
effectively zero completed checkouts. The reported symptom was:

> "On mobile, when I open the cart, the Checkout button and the Continue Shopping button are
> not displaying."

This folder is the audit of that symptom and everything around it. The audit confirmed the
reported bug **and** found five other defects on the same path, two of which independently
block or sabotage a mobile purchase.

**This is a planning artefact. No code has been changed.**

---

## Documents

| File | What it contains |
|---|---|
| [`01-AUDIT-FINDINGS.md`](01-AUDIT-FINDINGS.md) | Every defect found, with root cause, exact file:line, reproduction, and severity. Read this first. |
| [`02-FIX-PLAN.md`](02-FIX-PLAN.md) | The sequenced remediation plan — 4 phases, what changes in which file, and how to verify each one. |
| [`03-CRO-PLAYBOOK.md`](03-CRO-PLAYBOOK.md) | The marketing/conversion layer: where CTAs belong, the WhatsApp button question, button hierarchy, PK-market checkout norms, and what competitors do. |
| [`TRACKER.md`](TRACKER.md) | Live checklist. Update as work lands. |

---

## The headline finding, in one paragraph

`components/cart/cart-drawer.tsx:74` sizes the cart drawer with `h-screen` (`height: 100vh`).
On mobile browsers `100vh` is the height of the viewport **with the URL bar hidden** — it is
60–110px taller than what the user can actually see. The drawer is `position: fixed; top: 0`,
so its bottom 60–110px is rendered *below the visible area*. The drawer's footer — which is
where **View Bag, Checkout, and Continue Shopping** live (lines 252–290) — is exactly what
falls into that dead zone. The user cannot scroll to it, because the drawer itself does not
scroll (only the inner item list does) and body scroll is locked. **On mobile the cart is a
dead end: items go in, and there is no visible way to proceed.** That alone is sufficient to
explain a 0% mobile conversion rate.

Two other issues would have blocked checkout even if that were fixed:

- The **WhatsApp floating button** (`z-50`) renders *above* the cart drawer (`z-49`) and sits
  physically on top of the drawer's "Continue Shopping" button.
- The **purchase-notification card** (`z-60`) covers the mobile "Add to Bag" bar (`z-45`) for
  8 seconds out of every 60.

And one that destroys trust at the final step:

- The cart drawer promises **"Free Shipping Over Rs.3,500"** — and the checkout **never applies
  it**. The customer is charged Rs.250 shipping anyway.

---

## Owner decisions — 2026-07-31

| Question | Decision |
|---|---|
| Free shipping — implement the threshold, or remove the promise? | **Remove it.** Not offered on any method. Shipping is flat, always. The pricing code already behaves this way, so only the drawer's advertising is deleted. |
| Does free shipping apply to Express? | Moot — no free shipping at all. |
| WhatsApp button placement | **Stays bottom-right.** Phase 1 changes only its stacking (`z-50` → `z-46`) and hides it inside the funnel. It is not moved. |
| Phase 1 | Approved in principle; owner reviewing the exact contents before go-ahead. |

---

## Severity summary

| # | Finding | Severity | Blocks purchase? |
|---|---|---|---|
| F-01 | Cart drawer footer off-screen on mobile (`100vh`) | 🔴 Critical | **Yes — completely** |
| F-02 | WhatsApp FAB overlaps drawer CTAs | 🔴 Critical | Yes |
| F-03 | Free-shipping promise never honoured | 🔴 Critical | Trust/abandonment |
| F-04 | Purchase notification covers Add-to-Bag bar | 🟠 High | Intermittently |
| F-05 | Mobile qty stepper does nothing | 🟠 High | No — but wrong order |
| F-06 | `drawerOpen` persisted to localStorage | 🟡 Medium | No |
| F-07 | No safe-area insets on fixed bottom bars | 🟡 Medium | On iPhone, partly |
| F-08 | No `autoComplete` on checkout form | 🟡 Medium | Friction |
| F-09 | Three competing CTAs in drawer, no hierarchy | 🟡 Medium | Friction |
| F-10 | No GA4 ecommerce events — funnel is unmeasurable | 🟡 Medium | Blind spot |
| F-11 | Hardcoded "In Stock" / "Held for 30 minutes" claims | 🟢 Low | Trust |
| F-12 | Mobile nav tap targets under 44px; logo overflows navbar | 🟢 Low | Friction |

Full detail for each in [`01-AUDIT-FINDINGS.md`](01-AUDIT-FINDINGS.md).
</content>
</invoke>
