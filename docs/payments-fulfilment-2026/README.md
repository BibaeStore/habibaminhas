# Payments & Fulfilment — 2026 Plan

**Status:** 📋 Planning and research only. **Nothing implemented.**
**Opened:** 2026-07-31
**Covers:** payment gateway selection + integration, automated PostEx booking, international
shipping strategy, and the admin order-page workflow.

---

## Documents

| File | Contents |
|---|---|
| [`01-RESEARCH.md`](01-RESEARCH.md) | Live web research — payment gateways and couriers, with sources |
| [`02-AUTO-BOOKING.md`](02-AUTO-BOOKING.md) | Why bulk booking feels broken, and how to automate PostEx assignment |
| [`03-PAYMENT-GATEWAY.md`](03-PAYMENT-GATEWAY.md) | End-to-end gateway integration: checkout → order → webhook → admin |
| [`04-POSTEX-DIGITAL-PAYMENTS.md`](04-POSTEX-DIGITAL-PAYMENTS.md) | **PostEx "Paid" is already live in your merchant portal** — dashboard decoded, 3-stage rollout, what to send me |
| [`TRACKER.md`](TRACKER.md) | Checklist + open decisions |

---

## 🔴 Read this first — a live money-loss bug sits directly in the path of this work

`app/checkout/payment/payment-view.tsx:121`

```tsx
payment_status: payMethod === "cod" ? "pending" : "paid",
```

**Any non-COD order is marked `paid` the moment it is placed — before a single rupee is
collected.** Every non-COD method you currently offer (Bank Transfer, JazzCash, Easypaisa) is
manual/offline; the money arrives later, if at all.

That alone corrupts revenue reporting. But it chains into something worse:

`lib/courier/postex/payload.ts:31-34`

```ts
export function isCodOrder(o): boolean {
  if ((o.payment_method ?? "").toUpperCase() === "COD") return true;
  return (o.payment_status ?? "").toLowerCase() !== "paid";   // ← "paid" ⇒ not COD
}
```

So a fake-`paid` order books with PostEx at **`invoicePayment: "0"`** — the rider is told to
collect **nothing**. The customer receives the goods free and you have no COD claim.

**Current exposure: ZERO — verified 2026-08-01.** I queried the database directly:

```
total orders in DB:                        0
NON-COD orders marked paid (exposure):     0
```

Nothing has been lost. The blocking question from the original version of this doc ("have you
enabled Bank Transfer?") is now moot — there are no orders at all, so no money can have leaked.

**Why it matters most right now:** the entire point of adding a payment gateway is to start
taking non-COD orders. The instant that ships, this bug moves from latent to load-bearing.
It must be fixed *as part of* the gateway work, not after — it is item 1 of Phase 1 in
[`03-PAYMENT-GATEWAY.md`](03-PAYMENT-GATEWAY.md).

---

## Answers to your three questions, in short

### 1. "Should I use PostEx Pay, or XPay?"

**They are the same product.** XPay *is* PostEx's payment gateway — it lives at
`xpay.postexglobal.com` and is operated by PostEx (PostEx Global), powered in partnership with
HBL. There is no separate "PostEx Pay" gateway to choose between.

So the recommendation you were given holds — but the reasoning is stronger than "you already
have a PostEx account":

- **One vendor for money-in and money-out.** PostEx already holds your COD float and settles it
  to you. Putting the gateway on the same account means one settlement relationship, one
  reconciliation, one support line — instead of chasing two companies when a payment and a
  parcel disagree.
- **You already run their API.** Your team has PostEx credentials, a working integration, and
  a support contact. That is a real, non-trivial head start.

**But do not sign before you have these in writing** — XPay publishes no pricing publicly, only
a "book a demo" link. Get: MDR % per method (card vs wallet vs bank), settlement period (T+1?
T+3?), setup/annual fee, refund and chargeback fees, and **explicit written confirmation of
international card acceptance and the settlement currency.** That last one is the whole reason
you are considering this. Details and alternatives in [`01-RESEARCH.md`](01-RESEARCH.md).

### 2. "If I take online payment, can I ship with TCS? Is PostEx good enough internationally?"

**Two separate answers.**

**Domestically:** keep PostEx. It is built, working, and prepaid-ready — see below. Nothing
about adding a gateway forces you off PostEx.

**Internationally:** PostEx is not the right tool, and honestly, neither is this the right
moment. PostEx does offer some international service (reportedly China, UAE and USA by air,
with a 2024 KSA/UAE expansion) but it is not their core business and not comparable to the
specialists. For international, **TCS is the practical Pakistani choice** (200+ destinations),
**DHL is the premium option** (faster, pricier, best for high-value), and **Leopards is weak**
internationally — largely partner-based.

**My actual recommendation: don't build international fulfilment yet.** Reasoning in
[`01-RESEARCH.md`](01-RESEARCH.md) §3 — the short version is that your 35% Gulf/Western figure
is *impressions*, not buyers, and international selling drags in customs, duties, currency,
and a returns process that is brutal on a small operation. Your domestic funnel was literally
unusable on mobile until this week. Prove that first.

### 3. "Can PostEx booking survive a payment gateway?"

**Yes — and better than expected.** The prepaid path is already implemented:
`isCodOrder()` returns `false` for genuinely paid orders, which sets `invoicePayment: "0"` and
books the parcel as a delivery-only consignment with no cash collection. Whoever built the
PostEx layer anticipated this.

That means the gateway work does **not** require touching the courier layer at all. Fix the
`payment_status` bug above, and the existing booking code does the right thing automatically.

---

## The automation problem — why bulk booking disappoints

You are right that it is hectic, and there are three concrete reasons, not a vague one:

1. **Select-all only selects the visible page.** `PAGE_SIZE = 10`
   (`app/admin/orders/page.tsx:156`), and the header checkbox operates on `paginated`, not the
   filtered set. With 100 orders that is **ten separate select-and-book rounds**.
2. **A 100-order bulk book will almost certainly time out.** `bulkBookPostex` runs strictly
   sequentially with a 250 ms throttle *plus* PostEx API latency per order. That is minutes of
   wall-clock inside a single server action, against a Vercel function timeout that
   `vercel.json` only raises for the virtual-try-on route.
3. **City mismatches are silently skipped by design** — a deliberate, correct choice (a wrong
   city means a misrouted parcel), but it reads as "it didn't work" when the report scrolls past.

The fix is not a bigger bulk button. It is to **stop having a human press the button at all**
for the routine cases. Full design in [`02-AUTO-BOOKING.md`](02-AUTO-BOOKING.md).

---

## Recommended sequencing

Each phase is independently shippable and independently revertible.

| Phase | What | Why this order |
|---|---|---|
| **0** | Fix the `payment_status: "paid"` bug + audit any affected past orders | Stops money leaking; unblocks everything else |
| **1** | Auto-book worker + bulk-selection fixes | Solves your daily pain with zero external dependencies |
| **2** | XPay integration behind a kill-switch, dark | No customer sees it until you flip it on |
| **3** | Enable XPay on checkout for a slice of traffic | Real money, controlled blast radius |
| **4** | International — only if Phase 3 proves demand | Deliberately last |

Phase 1 needs nothing from XPay, so **it can start immediately** while gateway commercials are
still being negotiated. That is the main reason for this ordering.

---

## Open decisions — I need these before implementing anything

Listed in full in [`TRACKER.md`](TRACKER.md). The blocking ones:

1. Have you enabled Bank Transfer / JazzCash / Easypaisa in admin settings? (determines whether
   the money-loss bug is live right now)
2. Auto-book trigger: on payment confirmed, on a timer, or on admin marking "processing"?
3. How long a **cancellation grace window** before an order auto-books? (recommend 30–60 min)
4. Should COD orders auto-book, or only prepaid ones? (recommend: both, but COD after the grace
   window, since COD fraud is the bigger risk)
5. XPay commercial terms — can you get the written quote before we build?

---

**Nothing in this folder is implemented.** Confirm the decisions and I'll start with Phase 0.
</content>
