# TRACKER — Automation

**Last updated:** 2026-08-03
**Overall status:** 🔬 Research complete. **Nothing implemented.** Awaiting owner decisions.

Keep this file as the single source of truth for what is live, what is approved, and what
is still only an idea. Update it whenever something moves.

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Live in production |
| 🟡 | Built but idle / not firing |
| 🔵 | Approved, not started |
| ⬜ | Proposed only — **no approval** |
| 🚫 | Blocked — see reason |

---

## Already live (audited 2026-08-03)

| ID | Automation | Tier | Status | Notes |
|---|---|---|---|---|
| A-01 | Blog publishing pipeline | 2 | ✅ | Daily 08:30 + 08:40 PKT. 59 posts of runway |
| A-02 | PostEx status sync | 2 | 🟡 | Runs every 15 min, no bookings to sync |
| A-03 | Order confirmation email | 1 | 🟡 | Never fired — zero orders |
| A-04 | Contact form auto-reply | 1 | ✅ | 2 uses |
| A-05 | Low-stock notification | 1 | ✅ | 1 fired |
| A-06 | Live Sale notification card | 1 | ✅ | Ladies-weighted, real products, no price |
| A-07 | Sitemap auto-refresh | 2 | ✅ | Hourly ISR, picks up new posts |
| A-08 | Storefront cache invalidation | 1 | ✅ | Added 2026-08-02 |
| A-09 | Invoice PDF | 1 | ✅ | Manual trigger |

---

## Phase 0 — Funnel diagnosis (not automation)

**These gate everything else.** No automation should be built before P0-1 and P0-2 are done.

| ID | Task | Status | Owner action needed |
|---|---|---|---|
| P0-1 | Place a real order on a phone, start to finish | ⬜ | **Owner** — 30 min |
| P0-2 | Watch 5 people try to buy | ⬜ | **Owner** — 2 hrs |
| P0-3 | Google Search Console setup | ⬜ | Owner + assistant |
| P0-4 | Verify GA4 funnel events fire | ⬜ | Assistant |
| P0-5 | Fix F-05 — mobile qty stepper does nothing | ⬜ | Assistant — 2 hrs |
| P0-6 | Fix `payment_status: "paid"` money-loss bug | ⬜ | Assistant — 2 hrs |
| P0-7 | Hide or restock 6 zero-stock active products | ⬜ | **Owner decision** |
| P0-8 | Confirm COD is offered and prominent | ⬜ | **Owner decision** — possibly the whole answer |

---

## Phase 1 — Buildable now

| ID | Automation | Effort | Cost | Status | Blocked by |
|---|---|---|---|---|---|
| A-1 | WhatsApp support automation | High | $35–70/mo | ⬜ | WhatsApp Business API access |
| A-2 | Back-in-stock alerts | Low | ~0 | ⬜ | — **best quick win** |
| A-3 | Abandoned cart recovery | Medium | ~0 | 🚫 | Phase 0 must complete first |
| A-4 | Weekly business digest | Low | ~$0.02/wk | ⬜ | — |
| A-5 | Product description drafting | Low | ~$0.03/ea | ⬜ | — |
| A-6 | Social content pipeline | Medium | Low | ⬜ | — |
| D-2 | SEO / GSC monitoring | Low | ~0 | ⬜ | P0-3 |
| D-3 | Sitemap watchdog | Low | ~0 | ⬜ | — |
| D-4 | Synthetic checkout monitor | Low | ~0 | ⬜ | — **cheapest insurance** |

---

## Phase 2 — Needs orders to exist

| ID | Automation | Status | Blocked by |
|---|---|---|---|
| B-1 | COD confirmation on WhatsApp | 🚫 | Orders + WhatsApp API |
| B-2 | PostEx auto-booking | 🚫 | P0-6 payment bug |
| B-3 | Shipping updates to customer | 🚫 | Orders |
| B-4 | Order risk / RTO scoring | 🚫 | ~100 orders of history |

---

## Phase 3 — Needs ~50+ delivered orders

| ID | Automation | Status |
|---|---|---|
| C-1 | Review request after delivery | 🚫 |
| C-2 | Win-back campaign | 🚫 |
| C-3 | Occasion-based reminders (Eid, wedding season) | 🚫 |
| C-4 | Loyalty tiers acting on `customers.tier` | 🚫 |
| C-5 | Personalised recommendations | 🚫 |
| C-6 | Post-delivery care instructions | 🚫 |

---

## Decisions the owner needs to make

| # | Decision | Why it matters |
|---|---|---|
| 1 | Is COD offered, and is it obvious on the product page? | ~70% of Pakistani e-commerce is COD. Could explain zero orders on its own |
| 2 | Start the WhatsApp Business API application? | Verification takes days–weeks. The wait is free and runs in parallel |
| 3 | Budget for a BSP subscription (~$35–70/mo)? | Gates all WhatsApp automation |
| 4 | The 6 zero-stock active products — restock or hide? | Currently indexed and unbuyable |
| 5 | Approve P0-5 and P0-6 fixes? | Both are silent and both cost money |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-03 | Folder created. Full system audit, research, and backlog written. Nothing implemented |
