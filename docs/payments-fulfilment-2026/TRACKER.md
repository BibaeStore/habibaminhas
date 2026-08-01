# TRACKER — Payments & Fulfilment

**Last updated:** 2026-07-31
**Status:** 📋 Planning complete · nothing implemented · awaiting decisions

---

## 🔴 Blocking question

- [ ] **Have you enabled Bank Transfer / JazzCash / Easypaisa in admin settings?**
      Defaults are COD-only (`lib/actions/settings.ts:86`). If any non-COD method is ON, the
      `payment_status: "paid"` bug is **live today** and Phase 0 is urgent, not merely important.
      → See [`README.md`](README.md) and [`03-PAYMENT-GATEWAY.md`](03-PAYMENT-GATEWAY.md) §0.

---

## Open decisions

### Auto-booking
- [ ] **D1** Trigger: scheduled worker (recommended) / on payment confirmed / on "processing"?
- [ ] **D2** Grace window before auto-booking? *(recommend 45 min)*
- [ ] **D3** Auto-book COD orders too, or prepaid only? *(recommend both, COD after grace)*
- [ ] **D4** Hold orders above a value threshold for manual review? If so, what value?
- [ ] **D5** Cron interval — 10 min? Cap per run — 25?

### Payments
- [ ] **D6** Confirm XPay (PostEx) as the gateway, subject to quote
- [ ] **D7** Obtain written commercials — checklist in [`01-RESEARCH.md`](01-RESEARCH.md) §1.4
- [ ] **D8** Obtain API docs + sandbox credentials *(blocks all gateway code)*
- [ ] **D9** Keep COD as default/first payment option? *(recommend yes)*
- [ ] **D10** Stock: reserve-on-create with release *(recommended)* vs decrement-on-paid?

### International
- [ ] **D11** Defer international entirely for now? *(recommend yes — validate via manual
      WhatsApp quote flow first, see [`01-RESEARCH.md`](01-RESEARCH.md) §3)*
- [ ] **D12** If pursued later: TCS (practical) or DHL (premium)?

---

## Phase 0 — Stop the money leak 🔴 *(no external dependency — can start now)*
- [ ] Change `payment-view.tsx:121` so offline methods write `unpaid`, never `paid`
- [ ] Define the `payment_status` vocabulary (unpaid / pending_payment / paid / failed / refunded)
- [ ] Audit: `SELECT * FROM orders WHERE payment_status='paid' AND payment_method != 'COD'`
- [ ] Add admin **"Confirm payment received"** action for offline bank transfers
- [ ] Verify no already-booked order went to PostEx with `invoicePayment: 0` in error

## Phase 1 — Auto-booking *(no external dependency — can start now)*
- [ ] Migration: `postex_autobook_hold`, `_attempts`, `_error`, `_at` (additive, nullable)
- [ ] `postex_autobook` settings block, **default disabled**
- [ ] `app/api/cron/postex-autobook/route.ts` (mirrors the proven sync route + `CRON_SECRET`)
- [ ] Eligibility query per [`02-AUTO-BOOKING.md`](02-AUTO-BOOKING.md) §3.1
- [ ] Classify outcomes; **never retry** data errors (city/phone/address)
- [ ] pg_cron schedule (every 10 min)
- [ ] Admin: PostEx column, "Needs attention" filter, per-row Hold toggle
- [ ] Admin: "last auto-book run" indicator so silent failure is visible

## Phase 1b — Bulk UX fixes
- [ ] "Select all N matching orders" across the filtered set, not just the page
- [ ] Configurable page size (10/25/50/100)
- [ ] Route batches >20 through the worker instead of a long server action
- [ ] Result modal split: Booked / Skipped / Needs attention
- [ ] Persist city-alias map so corrections are made once
- [ ] Consider raising `maxDuration` in `vercel.json` (belt-and-braces, not the fix)

## Phase 2 — Gateway, dark *(blocked on D8)*
- [ ] `lib/payments/xpay/{config,client,types,signature}.ts` — env kill-switch
- [ ] Migration: `payment_*` columns + unique index on `payment_reference`
- [ ] `app/api/payments/xpay/webhook/route.ts` — signature, amount check, idempotency
- [ ] ⚠️ Exclude the webhook route from the `habibaminhas.com` CORS rule in `vercel.json`
- [ ] Abandoned-payment sweeper (60 min) + stock release
- [ ] Sandbox end-to-end proof

## Phase 3 — Gateway, live
- [ ] `payment.xpay` settings flag (default off)
- [ ] Checkout option + `/checkout/processing` page
- [ ] Admin payment column, filter, refund action
- [ ] `/admin/payments` reconciliation page
- [ ] Daily settlement reconciliation job
- [ ] Live rollout, COD remains default; monitor 2 weeks

## Phase 4 — International *(only if data justifies)*
- [ ] Segment GSC **clicks** (not impressions) + GA4 `begin_checkout` by country
- [ ] Manual WhatsApp quote flow as the validation test
- [ ] Only then: courier selection, customs, duties, returns policy

---

## Key file references

| What | Where |
|---|---|
| 🔴 Money-loss bug | `app/checkout/payment/payment-view.tsx:121` |
| COD-vs-prepaid decision | `lib/courier/postex/payload.ts:31-34` |
| Booking action (reuse, don't modify) | `lib/actions/postex.ts:69` |
| Bulk actions | `lib/actions/postex-bulk.ts:72` |
| Page size 10 / select-all bug | `app/admin/orders/page.tsx:156,319` |
| Proven cron pattern to copy | `app/api/cron/postex-sync/route.ts` |
| pg_cron schedule pattern | `supabase/migrations/20260709_postex_sync_cron.sql` |
| Additive-migration pattern | `supabase/migrations/20260709_postex_integration_columns.sql` |
| Kill-switch pattern to copy | `lib/courier/postex/config.ts` |
| Payment method flags | `lib/actions/settings.ts:41-46,86` |
| Order creation + stock decrement | `lib/actions/orders.ts:53,77` |

---

## Related

- `docs/checkout-cro-2026/` — checkout funnel; F-11 ("Held for 30 minutes") is made true by the
  stock-reservation decision D10
- `docs/PostEx/INTEGRATION-PLAN.md` — the original PostEx integration plan
- `docs/PostEx/PostEx-COD_API_Integration_Guide_V4.1.9.pdf` — vendor API reference
</content>
