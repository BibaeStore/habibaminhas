# Automation Backlog — every candidate, scored and sequenced

**Status:** Research only. Nothing here is approved or built.

Each item carries an honest note on whether it can work *given zero orders today*. That is
the filter most automation advice skips.

---

## Sequencing — read this before the catalogue

The instinct is to pick the most exciting automation and build it. With a zero-conversion
funnel that is the wrong move, because most e-commerce automation multiplies an existing
number.

```
Phase 0   FIND OUT WHY NOBODY BUYS          ← not automation. Instrumentation + testing
   ↓
Phase 1   AUTOMATE WHAT WORKS AT ZERO ORDERS ← support, capture, content
   ↓
Phase 2   AUTOMATE ORDER OPERATIONS          ← unlocked by the first real orders
   ↓
Phase 3   AUTOMATE RETENTION                 ← unlocked by ~50+ delivered orders
```

**Phase 0 is not optional and it is not automation.** If you build Phase 2 first you will
have a beautifully automated pipeline processing zero orders, and you will have spent
weeks learning nothing about why they are zero.

---

## Phase 0 — Diagnose the funnel (do this first)

Not automation. Included because it is the highest-value work available and everything
else depends on it.

| ID | Task | Effort | Why |
|---|---|---|---|
| P0-1 | **Place a real order yourself on a phone**, start to finish, paying real money | 30 min | The fastest possible diagnostic. Do this before reading another report |
| P0-2 | Ask 5 people to buy something on their own phones, watch them | 2 hrs | You will learn more here than from any analytics tool |
| P0-3 | Set up Google Search Console properly | 1 hr | Still open on the SEO roadmap. Without it you are guessing about traffic |
| P0-4 | Verify GA4 funnel events fire end-to-end | 2 hrs | `lib/analytics.ts` exists; no purchase event has ever fired |
| P0-5 | Fix F-05 — mobile quantity stepper does nothing | 2 hrs | A customer ordering 3 gets 1. Silent and severe |
| P0-6 | Fix the `payment_status: "paid"` bug | 2 hrs | Non-COD orders marked paid before payment → PostEx collects Rs. 0 |
| P0-7 | Hide or restock the 6 zero-stock active products | 30 min | Indexed, crawlable, unbuyable |
| P0-8 | Decide COD vs prepaid strategy | — | ~70% of Pakistani e-commerce is COD. If you are not offering it, that alone could explain zero orders |

**P0-8 deserves emphasis.** Industry reporting puts Cash on Delivery at roughly 70% of
Pakistani online orders. If COD is missing, awkward, or not clearly advertised on the
product page, a large majority of your market cannot or will not buy. Worth checking before
anything else on this page.

---

## Phase 1 — Works today, with zero orders

These do not depend on order volume.

### 🥇 A-1. WhatsApp support automation
**Tier 2→3 · Effort: high · Cost: $30–60/mo + per-message · [Full plan](./03-WHATSAPP.md)**

The owner's own example, and the correct first pick — it is the only item that saves time
*today*, because the manual work is happening now.

- Qualify the enquiry, answer the routine 80%, escalate the rest to a human
- Order status, sizing, stock, shipping, returns, price — all answerable from your own data
- **Requires WhatsApp Business API.** The current `wa.me` link cannot do any of this
- **Honest caveat:** this is a commercial and verification project before it is an
  engineering one. See the deep dive for the real cost and timeline

### 🥈 A-2. Back-in-stock alerts
**Tier 1 · Effort: low (1–2 days) · Cost: ~zero**

6 active products are out of stock right now. Product pages already *mention* restock
notifications — the feature does not exist.

- "Email me when back in stock" → capture email → notify on restock
- Runs on Supabase + existing `nodemailer`. No new vendor
- Builds a list of people who wanted a *specific* item — the highest-intent list you can own
- **Works at zero orders.** Demand capture, not order processing

### 🥉 A-3. Abandoned cart recovery
**Tier 2 · Effort: medium · Cost: ~zero (email) · Prerequisite: P0 fixes**

Vendor claims of "recover 15–30% of carts" are measured on stores with working checkouts.
Yours cannot recover a cart that no one could have completed anyway.

- **Blocked until Phase 0 is done.** Recovering someone into a broken checkout wastes the
  one contact you get
- Requires server-side cart persistence — the cart is currently Zustand in `localStorage`
- Then: email at 1 hr / 24 hrs / 72 hrs
- WhatsApp performs far better than email in Pakistan — worth combining with A-1

### A-4. Weekly business digest
**Tier 2 · Effort: low · Cost: ~$0.02/week**

- Every Monday: orders, revenue, top products, low stock, traffic, blog performance
- Model writes a short plain-English summary, emails it to you
- Extends the existing admin AI-insights panel; sends rather than waits to be opened
- **Useful even at zero orders** — it will tell you plainly that the number is still zero

### A-5. Product description drafting
**Tier 2 · Effort: low · Cost: ~$0.03/product**

- Attributes in → draft title, description, meta description, keywords
- **Draft only. You approve before publish.** Product copy is SEO surface; see `AGENTS.md`
- Same shape as the blog queue: generate offline, gate it, publish deliberately

### A-6. Social media content pipeline
**Tier 2 · Effort: medium · Cost: low**

- Reuse each blog post as Instagram/Facebook captions and carousel text
- 60 posts are already queued — that is 60 sets of social content sitting unused
- Start with drafts to a folder you post manually; automate posting later

### A-7. Review and UGC request *(deferred)*
Requires deliveries. See Phase 3.

---

## Phase 2 — Unlocked by the first real orders

### B-1. COD order confirmation on WhatsApp
**Tier 1–2 · The single highest-ROI automation in Pakistani e-commerce**

- Order placed → WhatsApp message → "Confirm" / "Cancel" buttons → status updates
- Unconfirmed after N hours → do not ship, or escalate to a call

**Why it matters here:** Return-to-Origin is the defining economic problem of Pakistani COD.
Industry reporting describes RTO rates as high as 40% at some stores, and vendors claim
15–40% reductions from WhatsApp confirmation. Treat the reduction figures as vendor
marketing — but the *mechanism* is sound and widely adopted for good reason: you pay
shipping both ways on a refused parcel.

**Do not build this before you have orders.** Build it when RTO becomes a real cost.

### B-2. PostEx auto-booking
**Tier 1 · Already planned in `docs/payments-fulfilment-2026/`**

- Order confirmed → book with PostEx automatically → tracking number back to the customer
- ⚠️ **Blocked by the `payment_status` bug.** Automating on top of it means PostEx collects
  Rs. 0 on every non-COD order, at machine speed

### B-3. Shipping status notifications to the customer
**Tier 1 · Effort: low once B-1 exists**

- The 15-minute PostEx sync already detects status changes and tells *you*
- Extend it to tell the *customer* — dispatched, out for delivery, delivered
- Reduces "where is my order" enquiries, which is the top support volume in any store

### B-4. Order-risk scoring
**Tier 2 · Effort: medium · Needs ~100 orders of history**

- Score COD orders for RTO risk: address quality, order value, first-time vs repeat, city
- High risk → require confirmation or partial advance payment
- **Needs data you do not have yet.** Revisit after ~100 orders

---

## Phase 3 — Unlocked by ~50+ delivered orders

| ID | Automation | Note |
|---|---|---|
| C-1 | Review request after delivery | Timed WhatsApp/email. Reviews feed `AggregateRating` schema you already emit |
| C-2 | Win-back campaign | No purchase in 90 days → targeted offer |
| C-3 | Replenishment reminders | Weak fit — formal wear is not consumable. Better as occasion-based (Eid, wedding season) |
| C-4 | Loyalty / VIP tiers | `customers.tier` already computes New/Regular/VIP and nothing acts on it |
| C-5 | Personalised recommendations | Needs purchase history |
| C-6 | Post-delivery care instructions | Silk care guide sent automatically. Cheap, thoughtful, reduces returns |

---

## Cross-cutting: operations and insight

| ID | Automation | Phase | Note |
|---|---|---|---|
| D-1 | Inventory reorder alerts | 1 | Extend low-stock notifications with velocity — "will sell out in ~9 days" |
| D-2 | SEO monitoring | 1 | Weekly GSC pull → alert on ranking or impression drops. **Directly protects your stated most valuable asset** |
| D-3 | Sitemap / indexing watchdog | 1 | Alert if sitemap URL count drops unexpectedly — the AGENTS.md baseline check, automated |
| D-4 | Uptime + checkout monitoring | 1 | Synthetic test that adds to cart and reaches payment daily. Would have caught F-01 |
| D-5 | Competitor price monitoring | 3 | Low value at this size |
| D-6 | Automated bookkeeping export | 2 | Once orders exist |

**D-4 deserves attention.** A daily synthetic checkout test would have caught the mobile
cart blocker that plausibly cost every order this store never received. It is the cheapest
insurance on this page.

---

## Scoring summary

| ID | Automation | Impact today | Effort | Blocked by | Verdict |
|---|---|---|---|---|---|
| P0-* | Funnel diagnosis | 🔥 Critical | Low | — | **Do first** |
| A-2 | Back-in-stock alerts | High | Low | — | **Best quick win** |
| D-4 | Checkout monitoring | High | Low | — | **Cheapest insurance** |
| A-1 | WhatsApp support | High | High | API access | **Best big project** |
| D-2 | SEO monitoring | Medium | Low | GSC setup | Strong |
| A-4 | Weekly digest | Medium | Low | — | Nice, cheap |
| A-5 | Product descriptions | Medium | Low | — | Time-saver |
| A-6 | Social pipeline | Medium | Medium | — | Reuses existing work |
| A-3 | Abandoned cart | High *later* | Medium | Phase 0 | Wait |
| B-1 | COD confirmation | 🔥 High *later* | Medium | Orders | Wait |
| B-2 | PostEx auto-book | High *later* | Low | Payment bug | Wait |
| C-* | Retention | High *much later* | Medium | 50+ orders | Wait |

---

## Recommended first three, if you want a straight answer

1. **P0-1 — buy something from your own store on your phone, today.** Costs nothing, takes
   30 minutes, and it is the highest-information action available to you.
2. **A-2 — back-in-stock alerts.** A weekend of work, no new vendor, no ongoing cost, and it
   starts building a high-intent list immediately.
3. **A-1 — WhatsApp support automation.** The real project. Start the Business API
   application now, because the verification wait is the long pole, not the code.

Everything else can wait for orders to exist.

---

## Sources

Vendor and industry claims referenced above, for transparency:

- [Interakt — Reduce RTO with WhatsApp COD confirmations](https://www.interakt.shop/whatsapp-business-api/reduce-rto-with-whatsapp-business-api-cod-confirmations/)
- [HillTeck — RTO reduction flows](https://www.hillteck.com/rto-reduction-flows.html)
- [Tecveq — WhatsApp Business automation for e-commerce in Pakistan (2026)](https://tecveq.com/whatsapp-business-automation-for-ecommerce-in-pakistan/)
- [Wetarseel — Shopify WhatsApp API automation workflows 2026](https://wetarseel.ai/7-high-impact-shopify-whatsapp-api-automation-workflows-a-2026-guide/)
- [CommercePundit — 15 AI automation ideas for e-commerce 2026](https://www.commercepundit.com/blog/15-proven-ai-automation-ideas-for-ecommerce-businesses-to-save-time-and-boost-sales/)
- [HelloRep — Cart abandonment tools 2026](https://www.hellorep.ai/blog/best-shopping-cart-abandonment-solutions)

**All percentage claims in those sources are vendor marketing measured on stores with
existing volume.** They are directional, not predictions for this business.
