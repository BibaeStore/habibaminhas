# 04 — PostEx Digital Payments ("Paid"): how it works and how to integrate it

**Status:** 📋 Guide + plan. **Nothing implemented.**
**Written:** 2026-08-01, after the owner confirmed Digital Payments is live in their PostEx
merchant portal (`merchant.postex.pk`).

---

## 1. What you actually have

Your PostEx merchant account already has **Digital Payments** enabled. This is PostEx's payment
gateway product, branded **"Paid"** — and it is the same family as XPay by PostEx discussed in
[`01-RESEARCH.md`](01-RESEARCH.md). You do **not** need a separate signup.

**Confirmed commercials from PostEx's own page:**

| Item | Value |
|---|---|
| Transaction fee | **3.0% per successful transaction** |
| Setup fee | None |
| Monthly fee | None |
| Hidden fees | None claimed |
| Cards | Visa, Mastercard — local **and international** |
| Custom pricing | Available for high volume |

3.0% sits at the upper end of the Pakistani fintech range (1.5–3.5%). Worth asking for a lower
rate once you have volume — but there is nothing to negotiate before you have transactions, so
do not let that delay you.

---

## 2. Your dashboard menu, decoded

Every item in the Digital Payments menu, and what it means for you:

### ACTION
| Menu item | What it does | You'll use it… |
|---|---|---|
| **Create Payment Link** | Generates a shareable checkout link for a named item + price | **Constantly, from day one** |
| **Payment Link Logs** | Every link you've created and its state | To chase unpaid links |
| **Refund Transactions** | Refund a completed payment | On returns |
| **Mark Capture/Void** | Capture an authorised payment, or void it | Rare — see §3 |

### VIEW
| Menu item | Meaning |
|---|---|
| **Pending Payment Links** | Links sent but not yet paid — **your follow-up list** |
| **Pending Settlements** | Money collected but not yet paid out to your bank |

### REPORTS
| Menu item | Meaning |
|---|---|
| **Monthly/Weekly Transactions** | Revenue reporting |
| **Transaction Logs** | Every payment attempt, success and failure |
| **Settlement Logs** | What PostEx actually paid into your bank, and when |

> **Settlement Logs is how you reconcile.** "Customer paid" and "money in my bank" are different
> events, days apart. Never treat a successful payment as cash received until it appears here.

### DISPUTE
| Menu item | Meaning |
|---|---|
| **Create Dispute** | Raise a dispute with PostEx |
| **My Dispute Logs** | Disputes you raised |
| **Customer Dispute Logs** | **Chargebacks — customers disputing your charges** |

> Chargebacks are the real cost of card payments. A customer claims they didn't authorise a
> charge, and you can lose both the goods and the money. Watch this section.

### TESTING DATA ⭐
| Menu item | Meaning |
|---|---|
| **Credit Card** | Test card numbers |
| **Account Transfer** | Test bank-transfer details |

**This is the most important menu for us.** It means you can run the entire payment flow end to
end without moving real money. **Nothing goes live until the full flow has been proven with these
test credentials.**

---

## 3. The one distinction that decides your whole approach

There are **two completely different ways** to take money with PostEx Paid, and they suit
different parts of your business:

### Model A — Payment Link / "Request to Pay" (R2P)

You create a link (name + price), share it by WhatsApp / SMS / email, the customer opens a hosted
PostEx checkout page and pays.

- ✅ **Works today. Zero code. Zero risk to the website.**
- ✅ Perfect for WhatsApp enquiries, Instagram selling, and converting a hesitant COD order
- ❌ Not part of your website checkout — the customer has to leave and come back
- ❌ Manual, one link at a time (unless automated via API — see Stage 2)

### Model B — Website checkout integration

Customer pays on `habibaminhas.com` during checkout. Requires the API: a payment intent is
created server-side, the customer pays, and a **webhook** tells your site the money arrived.

- ✅ Proper e-commerce experience, no channel switch
- ❌ Needs API credentials, API docs, webhook handling, and careful testing
- ❌ Real money is at stake if it's wrong

**What's in your screenshot is Model A.** Model B needs the developer documentation, which PostEx
keeps behind a link they hand to merchants (not publicly indexed).

**Known API detail** (from XPay's developer material): payments are created with
`POST /public/v1/payment/intent`, authenticated with an API key, using your order ID as an
idempotency key, with webhooks for success/failure. That is the right shape — but I will not
write code against a signature I have inferred rather than read.

---

## 4. Recommended path — three stages, each independently safe

### Stage 1 — Manual payment links (**start today, no code**)

Use the portal exactly as it is:

1. **Digital Payments → Create Payment Link**
2. Enter the product name and price
3. Save, copy the link
4. Send it to the customer on WhatsApp
5. Track it under **Pending Payment Links**; confirm under **Transaction Logs**

**Use it for:**
- Anyone who messages you on WhatsApp about a product
- A customer who wants to pay in advance instead of COD
- Instagram / Facebook enquiries
- High-value orders where COD risk is uncomfortable

**Why this matters more than it looks:** it lets you start taking card payments **this week**,
with no code, no risk, and no deployment. It also generates real transactions — which is exactly
what you need to (a) prove the flow works, (b) negotiate below 3.0%, and (c) justify Stage 3.

### Stage 2 — Semi-automated links from the admin panel (**low risk**)

Add a **"Send payment link"** button on the admin order page.

```
Order placed (COD) → admin opens order → "Send payment link"
   → calls PostEx Create Payment Link API
   → link saved on the order + sent to the customer by WhatsApp/email
   → customer pays
   → webhook (or a status poll) marks the order paid
   → PostEx books the shipment with COD amount 0
```

**This is the sweet spot for your business right now**, because:
- The customer-facing checkout is **completely untouched** — zero risk to conversion
- It converts COD orders to prepaid, which removes COD fraud and improves cash flow
- It reuses the PostEx auth and client patterns already in `lib/courier/postex/`
- If it breaks, the order simply stays COD. **There is no failure mode that loses a sale.**

### Stage 3 — Full website checkout (**highest value, highest care**)

Everything in [`03-PAYMENT-GATEWAY.md`](03-PAYMENT-GATEWAY.md) — "Pay Online" at checkout,
webhook as the single source of truth, reconciliation page. Do this once Stages 1–2 have proven
the account, the fees, and the settlement behaviour.

---

## 5. Isolation — how this cannot break what already works

Same pattern as the PostEx courier integration, which has been running safely
(`lib/courier/postex/config.ts`):

> *"The whole integration is env-gated: if `POSTEX_API_TOKEN` is absent, the site behaves exactly
> as it did before PostEx."*

**Applied to payments:**

```
lib/payments/postex/          ← ALL new code lives here, nothing existing is rewritten
  config.ts    → getPostexPayConfig() returns null when POSTEX_PAY_API_KEY is unset
  client.ts    → API calls
  types.ts     → response shapes
  signature.ts → webhook verification

app/api/payments/postex/webhook/route.ts   ← new route
lib/actions/payments.ts                    ← new server actions
```

Four independent layers of protection, each reversible on its own:

| Layer | Effect when off |
|---|---|
| `POSTEX_PAY_API_KEY` unset | Every function no-ops; no UI renders; feature does not exist |
| `POSTEX_PAY_MODE=sandbox` | Real flow, test money only |
| `payment.postex_pay: false` in admin settings | Hidden from customers even with keys present |
| Stage 2 before Stage 3 | Checkout page untouched until you choose otherwise |

**Rollback = delete an environment variable and redeploy.** No code revert.

Existing files get only **additive** edits: new nullable DB columns, one new settings flag, one
new admin button. Nothing in the current order, cart, checkout, or courier flow is rewritten.

---

## 6. 🔴 The one thing that must be fixed first

`app/checkout/payment/payment-view.tsx:121`

```tsx
payment_status: payMethod === "cod" ? "pending" : "paid",
```

Non-COD orders are written as **`paid` before any money is collected**, and
`isCodOrder()` then books the PostEx shipment with **COD = 0** — goods delivered, nothing
collected.

**Current exposure: ZERO.** I queried the database directly on 2026-08-01:

```
total orders in DB: 0
NON-COD orders marked paid: 0
```

So nothing has been lost. But the moment a payment method other than COD goes live — which is
precisely what this whole document is about — the bug becomes load-bearing.

**Fix it in the same change as Stage 1 or Stage 2. Not after.**

---

## 7. What I need from you before writing any code

| # | Item | Where to get it |
|---|---|---|
| 1 | **API documentation** | Ask PostEx support for the Digital Payments / Paid API guide (they keep it on a private link). You already have the *COD* guide as a PDF; this is a different product |
| 2 | **API key / merchant credentials** | Portal → **Setting**, or PostEx support |
| 3 | **Sandbox credentials** | You have **Testing Data → Credit Card / Account Transfer** in the menu already |
| 4 | **Webhook capability** | Confirm they can POST to a URL on payment success, and how the signature is verified. If there is **no** webhook, we must poll — design changes materially |
| 5 | **Settlement period** | T+1? T+3? Affects your cash flow, not the code |
| 6 | **Refund + chargeback fees** | Not on the public page |
| 7 | **A screenshot of the Create Payment Link form** | So I can tell you exactly what to put in each field |

**Items 1 and 4 are hard blockers for Stage 2 and 3.** Stage 1 needs none of them — you can start
today.

---

## 8. Honest limits of this document

- I have **not** seen PostEx's Digital Payments API documentation. The endpoint shape in §3 comes
  from XPay's public developer blog, not from the actual spec. I will not write an integration
  against a guessed signature.
- I have **not** seen the Create Payment Link form, so §4 Stage 1 describes PostEx's own published
  description ("give it a name, give it a price, save") rather than the exact fields.
- Fees are from PostEx's public marketing page. **Get them in writing** before volume builds.

---

**Next:** start Stage 1 today by hand. Send me the API docs and a screenshot of the link form,
and I'll build Stage 2.
