# 03 — Payment Gateway Integration (XPay by PostEx)

**Status:** 📋 Plan only. Nothing implemented.
**Principle:** ship it dark, behind a kill-switch, so nothing existing can break.

---

## 0. Phase 0 — fix the money-loss bug first 🔴

**This is not optional and it comes before everything else.**

`app/checkout/payment/payment-view.tsx:121`

```tsx
payment_status: payMethod === "cod" ? "pending" : "paid",
```

Every non-COD order is written as `paid` before any money is collected. All three non-COD
methods you can currently enable (Bank Transfer, JazzCash, Easypaisa) are **manual/offline** —
the customer is expected to transfer and upload a receipt (`lib/actions/upload-receipt.ts`).
Nothing verifies that they did.

Two consequences:

1. **Revenue reporting is wrong** — unpaid orders counted as paid.
2. **PostEx books with COD = 0.** `isCodOrder()` (`lib/courier/postex/payload.ts:31`) treats
   `payment_status === "paid"` as "prepaid, collect nothing". The rider hands over the goods and
   collects nothing. You have no claim.

### The fix

```tsx
// Offline methods are UNPAID until an admin confirms receipt.
// Only a gateway callback may ever set "paid".
payment_status: "unpaid",
```

…with a `payment_status` vocabulary made explicit:

| Value | Meaning | Who sets it |
|---|---|---|
| `unpaid` | No money received | Checkout, for every offline method |
| `pending_payment` | Redirected to gateway, awaiting result | Gateway initiation |
| `paid` | Money confirmed received | **Gateway webhook only**, or admin manually confirming a bank receipt |
| `failed` | Gateway declined | Gateway webhook |
| `refunded` | Returned to customer | Admin / gateway |

Note `cod` orders keep `pending` (collect-on-delivery) — `isCodOrder()` already short-circuits
on `payment_method === "COD"`, so COD is unaffected either way.

### Also required in Phase 0

- **Audit historical orders**: `SELECT * FROM orders WHERE payment_status = 'paid' AND payment_method != 'COD'`
  — every row is a potentially-unpaid order. Some may have paid by bank transfer; they need
  checking by hand against receipts.
- **Admin action "Confirm payment received"** for offline methods, writing `paid` + who
  confirmed + when. Without this, fixing the default leaves you no way to mark a genuine bank
  transfer as paid.

Phase 0 is small, has no external dependency, and can ship this week independently of XPay.

---

## 1. Isolation strategy — how this cannot break what works

The PostEx integration already demonstrates the right pattern, and it is worth copying exactly
(`lib/courier/postex/config.ts`):

> *"The whole integration is env-gated: if `POSTEX_API_TOKEN` is absent, the site behaves exactly
> as it did before PostEx (all PostEx UI hidden, all actions no-op)."*

**Same approach for payments:**

```ts
// lib/payments/xpay/config.ts
export function getXpayConfig(): XpayConfig | null {
  const key = process.env.XPAY_API_KEY?.trim();
  if (!key) return null;          // kill-switch: feature does not exist
  return { key, secret: ..., baseUrl: ..., merchantId: ... };
}
export function isXpayEnabled(): boolean { ... }
```

Layered so each is independently reversible:

| Layer | Guard |
|---|---|
| Code | `XPAY_API_KEY` unset ⇒ every function no-ops, no UI renders |
| Settings | `payment.xpay: false` in admin ⇒ hidden from checkout even with keys present |
| Mode | `XPAY_MODE=sandbox\|live` ⇒ test end-to-end with no real money |

**All new code lives in new files.** `lib/payments/xpay/{config,client,types,signature}.ts`,
`lib/actions/payments.ts`, `app/api/payments/xpay/webhook/route.ts`. Existing files get only
small additive edits (one new payment option in the checkout list, new nullable columns).

**Rollback is `vercel env rm XPAY_API_KEY` + redeploy.** No code revert needed.

---

## 2. Database changes (additive, nullable)

```sql
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_provider    text,        -- 'xpay'
  ADD COLUMN IF NOT EXISTS payment_reference   text,        -- gateway transaction id
  ADD COLUMN IF NOT EXISTS payment_amount      integer,     -- PKR, as actually charged
  ADD COLUMN IF NOT EXISTS payment_currency    text,
  ADD COLUMN IF NOT EXISTS payment_paid_at     timestamptz,
  ADD COLUMN IF NOT EXISTS payment_failure     text,
  ADD COLUMN IF NOT EXISTS payment_raw         jsonb;       -- full gateway payload, for disputes

-- Idempotency: the same gateway transaction can never be applied twice.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_reference
  ON public.orders (payment_reference) WHERE payment_reference IS NOT NULL;
```

`payment_raw` matters more than it looks: when a customer disputes a charge months later, the
stored gateway payload is your evidence.

---

## 3. The order flow — where things go wrong and how to avoid it

### The central question: create the order before or after payment?

| Approach | Problem |
|---|---|
| Create **after** payment succeeds | If the customer pays and the browser dies before your code runs, **money taken, no order**. Unacceptable |
| Create **before**, mark paid on callback | Unpaid abandoned orders accumulate — manageable |

**Create before.** Losing an order after taking money is unrecoverable; a few abandoned rows are
a housekeeping task.

### Proposed sequence

```
1. Customer completes checkout, selects "Pay online"
2. createOrder(...) → status: 'pending_payment', payment_status: 'pending_payment'
   ├─ stock RESERVED (see §4)
   └─ order NOT visible in the normal fulfilment queue
3. Server action initiates XPay payment for order.total, returns checkout/redirect data
4. Customer pays on the XPay on-site widget
5a. XPay WEBHOOK → /api/payments/xpay/webhook   ← the ONLY source of truth
    ├─ verify signature
    ├─ verify amount matches order.total
    ├─ idempotency check on payment_reference
    └─ status: 'pending', payment_status: 'paid', payment_paid_at: now()
        → order now enters the normal queue and becomes auto-book eligible
5b. Customer's browser returns to /checkout/processing?order=…
    └─ polls order status; shows success once the webhook has landed
6. Auto-book worker picks it up after the grace window (02-AUTO-BOOKING §3.1)
```

### Non-negotiable rules

1. **Never trust the browser redirect for payment confirmation.** A return URL with
   `?status=success` is trivially forged. Only the signed server-to-server webhook may set
   `paid`. The redirect exists solely to show the customer a screen.
2. **Verify the amount.** Confirm the webhook's amount equals `order.total`. Never mark paid on
   a mismatch — flag it.
3. **Idempotency.** Gateways retry webhooks. The unique index on `payment_reference` plus an
   early "already processed?" check makes duplicates harmless.
4. **Verify the signature** using the shared secret before reading any field.
5. **Log everything** to `order_activity_log` (the pattern already exists) and store the raw
   payload.

### Timeouts and reconciliation

- Orders stuck in `pending_payment` beyond ~60 minutes → mark `abandoned`, **release reserved
  stock**, exclude from analytics.
- A **daily reconciliation job**: fetch the day's XPay settlements, compare against orders
  marked `paid`. Catches missed webhooks — which will happen. This is how you find the order
  where the customer's money left their account and your webhook never arrived.

---

## 4. Stock handling — a real trap

Today `createOrder()` decrements stock immediately (`lib/actions/orders.ts:77`). That is correct
for COD, where placing the order *is* the commitment.

With prepaid it breaks: every abandoned payment attempt permanently eats stock. Ten people open
the payment page for your last item and walk away, and it reads as sold out with nothing sold.

**Options:**

| Option | Trade-off |
|---|---|
| **A. Reserve on create, release on failure/timeout** ✅ | Correct behaviour. Needs the timeout job from §3 |
| B. Decrement only on `paid` | Simpler, but oversells — two customers can pay for the same last item |
| C. Leave as-is | Phantom stock-outs |

**Recommend A.** It needs the abandoned-order sweeper to exist, which §3 already requires — so
it is not extra infrastructure, just one more thing the sweeper does.

Worth noting this interacts with `docs/checkout-cro-2026/` finding F-11: the cart currently
claims *"Held for 30 minutes"* with no reservation system behind it. Option A would make that
claim true for prepaid orders for the first time.

---

## 5. Checkout UI changes

`app/checkout/payment/payment-view.tsx` — the payment options list is already driven by
`PaymentMethodsConfig`, so adding a gateway is genuinely additive:

```ts
payment: {
  cod: boolean;
  bank: boolean;
  jazzcash: boolean;
  easypaisa: boolean;
  xpay: boolean;      // ← new; false by default
}
```

- New option: **"Pay Online — Card / Wallet"** with Visa / Mastercard / Google Pay marks
- Renders **only** when `isXpayEnabled() && settings.payment.xpay`
- COD stays first and default (see `docs/checkout-cro-2026/03-CRO-PLAYBOOK.md` §3f — COD is what
  your market trusts; the gateway is an addition, not a replacement)
- New `/checkout/processing` page for the post-payment wait, polling until the webhook lands
- Failure path returns to payment with the order intact and a retry — never a dead end

**Trust markers matter here.** First-time buyers entering card details on an unfamiliar
Pakistani site need reassurance: show the card-network logos, a padlock, and "Secured by XPay".

---

## 6. Admin order page changes

**Orders list:**
- **Payment column**: `COD` / `Paid ✓ (XPay)` / `Unpaid` / `Awaiting payment` / `Failed` / `Refunded`
- Filter by payment status
- Visually separate `pending_payment` orders — they are not real orders yet and should never sit
  in the fulfilment queue

**Order detail:**
- Payment panel: provider, reference, amount charged, paid-at, and the raw payload behind a
  "view details" toggle
- **"Confirm payment received"** for offline bank transfers (required by Phase 0)
- **Refund** action (once XPay's refund API terms are known)
- Existing PostEx panel untouched

**New reconciliation page** `/admin/payments`:
- Today's gateway settlements vs orders marked paid
- Mismatches highlighted
- Orders stuck in `pending_payment`
- Amount mismatches flagged in §3

This page is what makes the money auditable. Without it you are trusting webhooks blindly.

---

## 7. Security checklist

- [ ] Webhook signature verified before any field is read
- [ ] Webhook endpoint **not** behind the CORS rule in `vercel.json` that restricts to
      `habibaminhas.com` — XPay's servers are a different origin. **This will silently break the
      webhook if missed.**
- [ ] Amount + currency verified against the order
- [ ] Idempotency via unique `payment_reference`
- [ ] Secrets in env only, never in the client bundle, never in `NEXT_PUBLIC_*`
- [ ] Raw payloads stored for dispute evidence
- [ ] Sandbox mode proven end-to-end before live keys
- [ ] Rate-limit the webhook route
- [ ] Never log full card data (XPay shouldn't send it — verify)

---

## 8. Phased rollout

| Phase | Contents | Customer impact |
|---|---|---|
| **0** | Fix `payment_status`; audit historical orders; add "Confirm payment received" | None visible |
| **2a** | XPay client, config, DB columns, webhook — **no checkout UI**. Test in sandbox with a hidden test route | None — invisible |
| **2b** | Admin payment column + reconciliation page | Admin only |
| **3a** | Enable on checkout **in sandbox** for internal testing | None (staging) |
| **3b** | Enable live, COD still default and first | Customers can pay online |
| **3c** | Monitor 2 weeks: success rate, webhook reliability, disputes | — |
| **4** | International — only if data justifies (`01-RESEARCH.md` §3) | — |

**Kill-switch at every step:** remove the env var, or flip `payment.xpay` off in admin.

---

## 9. What I need from you

1. **XPay written quote** — the checklist in `01-RESEARCH.md` §1.4
2. **XPay API documentation + sandbox credentials** — I cannot design the client until I see
   their actual API. There is no public Next.js/headless integration; everything published is
   Shopify/WooCommerce/Magento plugins
3. **Answers to the open decisions** in [`TRACKER.md`](TRACKER.md)
4. **Confirmation of which payment methods you have enabled** in admin settings today — this
   determines whether Phase 0 is urgent or merely important

**Phase 0 and all of [`02-AUTO-BOOKING.md`](02-AUTO-BOOKING.md) need none of the above and can
start immediately.**
</content>
