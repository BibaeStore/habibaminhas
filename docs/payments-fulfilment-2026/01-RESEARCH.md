# 01 — Market Research (live, July 2026)

Researched on 2026-07-31 via web search, not from prior knowledge, as requested.
Sources listed at the bottom of each section.

---

## 1. Payment gateways for Pakistan

### 1.1 The key finding: XPay *is* PostEx

"PostEx Pay" and "XPay" are not two options. **XPay is PostEx's payment gateway**, hosted at
`xpay.postexglobal.com`, operated by PostEx Global and delivered in partnership with **HBL**.
PostEx is now positioned as a courier *and* fintech company, not just a courier.

So the choice in front of you is not "PostEx Pay vs XPay" — it is "XPay (PostEx) vs Safepay vs
PayFast vs the rest".

### 1.2 What XPay offers

| Aspect | What is publicly stated |
|---|---|
| Methods | Cards (Visa, Mastercard, UnionPay), wallets, bank transfer, Google Pay, Payment-on-Delivery |
| Checkout | **On-site** — no redirect away from your site |
| International cards | Reported as supported, with multi-currency settlement |
| Compliance | PCI-DSS certified; operates under SBP licensing |
| Integrations | Shopify, WooCommerce, Magento plugins; REST API; SDKs for React Native, Flutter, Kotlin, Swift |
| Onboarding | "Start collecting payments in 30 minutes"; MID approval described as quick |
| Fees | **Not published.** One third-party source cites "from 3%". The XPay site itself says only "transparent pricing, no hidden fees" and directs you to book a demo |
| Multi-gateway | Can route across HBL, Meezan, MCB, PayFast from one integration |

**The on-site checkout matters commercially.** Redirect-based gateways lose customers at the
hand-off — the shopper leaves your branded page, sees an unfamiliar bank screen, and some
fraction abandons. XPay markets a "35% transaction success increase" from on-site checkout;
treat the specific number as marketing, but the direction is real and well-established.

**There is no Next.js / headless plugin.** Every published integration is Shopify/WooCommerce/
Magento. Your site is a custom Next.js app, so you will be working against their REST API
directly. That is normal and fine — but it means "one-click integration" does not apply to you,
and you should ask for **API documentation and a sandbox/test-mode credential** before signing.

### 1.3 The credible alternatives

| Gateway | Strength | Consider it if |
|---|---|---|
| **XPay (PostEx)** | Same vendor as your courier; on-site checkout; one settlement relationship | ✅ Default recommendation |
| **Safepay** | On-site checkout, genuinely developer-friendly API, strong DTC reputation | XPay's API docs turn out to be poor, or their quote is bad |
| **PayFast** | The most established; SBP-licensed; 3,500+ merchants incl. **Gul Ahmed, Sana Safinaz, Junaid Jamshed** | You want the option your direct competitors already trust |
| PayPro / NayaPay / JazzCash / Easypaisa | Wallet-led, wide local reach | As *additional* methods later, not as the primary gateway |

Industry fee benchmarks to negotiate against: **fintech gateways ~1.5–3.5%** per transaction;
**bank gateways ~2–4.5%**, and banks more often add annual fees. If XPay quotes above ~3.5% with
no volume commitment, that is worth pushing back on or taking to Safepay.

**Worth noting:** PayFast is what Gul Ahmed and Sana Safinaz use. That is not automatically the
right answer for you — they have volumes and negotiating power you don't — but if XPay's
commercials come back unattractive, PayFast is the proven-at-scale fallback in exactly your
market segment.

### 1.4 What to demand in writing before committing

XPay's public pricing opacity is the single biggest risk in this decision. Get all of it in a
written quote:

1. **MDR per method** — card, wallet, bank transfer are usually priced differently
2. **International card rate** — nearly always higher than domestic; this is the whole reason
   you're interested
3. **Settlement period** — T+1, T+2, T+3? This is working capital
4. **Settlement currency** for international transactions, and the FX spread applied
5. **Setup fee, annual fee, minimum monthly volume**
6. **Refund fee and chargeback fee** — chargebacks on international cards are a real cost
7. **Sandbox credentials + API docs** — before signing, not after
8. **Whether your entity type qualifies** — sole proprietor vs registered company changes
   onboarding requirements at most Pakistani PSPs

**Sources:**
[XPay by PostEx](https://xpay.postexglobal.com/) ·
[XPay — payment gateway for developers](https://xpay.postexglobal.com/blog/payment-gateway-for-developers) ·
[XPay multi-gateway for Shopify](https://xpay.postexglobal.com/blog/multi-gateway-shopify-pakistan) ·
[XSTAK — 9 best payment gateways in Pakistan 2026](https://www.xstak.com/blog/payment-gateways-in-pakistan) ·
[Rapid Gateway — best payment gateway Pakistan 2026](https://rapidgateway.pk/resources/best-payment-gateway-pakistan) ·
[Rapid Gateway — PayFast review 2026](https://rapidgateway.pk/resources/payfast-pakistan-review) ·
[PayAtlas — accepting payments in Pakistan](https://payatlas.com/countries/pakistan-pk)

---

## 2. Couriers — domestic and international

### 2.1 Domestic: keep PostEx

Nothing in the research suggests changing. PostEx is purpose-built for Pakistani e-commerce COD,
you have a working API integration, and it offers early COD settlement — genuinely useful for
cash flow at your stage. Switching domestic couriers now would throw away working code to solve
a problem you don't have.

### 2.2 International: PostEx is not the tool

PostEx **does** offer international shipping — reportedly to China, UAE and USA by air, with a
2024 announced expansion into Saudi Arabia and the UAE. But it is a peripheral service, not
their core competency, and I could find no published international rate card, no country list on
their own FAQ, and no API documentation for international consignments.

Critically: **your integrated PostEx API is the COD API** — `orderType: "Normal"`, domestic city
validation against `getDeliveryCities()`, and PK mobile-number validation
(`lib/courier/postex/phone.ts`). International shipping through PostEx would be a **different
product with a different onboarding and probably a different API** — not a config change.

| Courier | International reality | Verdict |
|---|---|---|
| **TCS** | 200+ destinations; the standard Pakistani choice for international parcels; strong tracking | ✅ Best practical option |
| **DHL** | Premium global express; fastest and most reliable; significantly more expensive | ✅ For high-value orders |
| **Leopards** | Small / partner-based international network | ❌ Not for international |
| **PostEx** | Exists, limited, undocumented publicly, not core | ❌ Not for international |

On domestic performance for context: TCS on-time ~85–90% (Overnight) vs Leopards ~75–85%
(Standard); Leopards runs roughly 10–15% cheaper under 2 kg. Neither displaces PostEx for your
COD-led domestic model.

**Sources:**
[PostEx FAQs](https://postex.pk/faqs) ·
[PostEx COD](https://postex.pk/cod) ·
[TechBullion — top 10 courier services for eCommerce in Pakistan 2026](https://techbullion.com/top-10-courier-services-for-ecommerce-in-pakistan-2026/) ·
[TCS rates Pakistan — domestic & international](https://tcsexpress.com.pk/tcs-rates-pakistan/) ·
[TCS vs Leopards 2026 comparison](https://tcsexpress.com.pk/tcs-vs-leopards-comparison/) ·
[Leopards courier rates 2026](https://trackmyorder.pk/blog/guides/leopards-courier-rates-2026)

---

## 3. Should you sell internationally at all — yet?

You asked for a view beyond your own. Here it is, plainly: **not yet.** I'd hold international
until Phase 3 has run for a quarter.

**Your 35% figure is impressions, not buyers.** Google Search Console impressions count people
who saw a result — including people who never clicked, and including a large diaspora audience
who search Pakistani fashion brands out of interest and buy locally or when visiting. Clicks and
purchase intent from that segment are far lower than the impression share suggests. Before
building anything, segment **clicks** by country in GSC, and once GA4 ecommerce events are
collecting (shipped last week — see `docs/checkout-cro-2026/`), look at `begin_checkout` by
country. That is the number that justifies investment; impressions are not.

**What international selling actually drags in:**

| Cost | Reality |
|---|---|
| Shipping | Often **exceeds the garment's value**. A Rs. 5,000 suit to the UAE can cost Rs. 4,000–6,000 to send |
| Customs & duties | Someone pays. If it's the customer at the door, you get refusals and returns |
| Returns | An international return frequently costs more than writing the item off |
| Currency & settlement | FX spread, higher international-card MDR, longer settlement |
| Chargebacks | Materially higher risk on international cards, and you carry the loss |
| Regulatory | Selling abroad brings SBP foreign-exchange/remittance considerations. Exporters of digital services must register with SBP; get an accountant's view on where physical-goods e-commerce sits before you take foreign money at volume |

**The strategic argument:** your mobile checkout was completely broken until last week — the
drawer's Checkout button was unreachable on the ~83% of traffic that is mobile. You have not yet
seen what your **domestic** conversion looks like on a working funnel. Spending the next month on
customs and international couriers, instead of learning what your fixed funnel actually does,
would be optimising the wrong end of the business.

**A middle path, if you want to test demand without building anything:** add a "Ship outside
Pakistan?" link on the product page that opens WhatsApp with the product pre-filled. Quote and
invoice manually, ship via TCS, take payment by bank transfer. Zero code, zero risk, and after
20–30 enquiries you will know from real data whether the demand justifies an automated
international flow. If it does, Phase 4 builds it properly.

---

## 4. Bottom line

| Question | Answer |
|---|---|
| PostEx Pay or XPay? | Same product. **XPay by PostEx** — recommended, subject to a written quote |
| Is the earlier XPay advice right? | **Yes**, and for a better reason: one vendor for both money-in and money-out |
| Anything else worth considering? | **Safepay** if XPay's API/docs disappoint; **PayFast** if the commercials do |
| Ship prepaid orders via TCS? | You *can* — but you don't need to. PostEx already handles prepaid (COD amount 0) |
| Is PostEx good enough internationally? | **No.** Use TCS, or DHL for high-value |
| Should I go international now? | **Not yet.** Validate with a manual WhatsApp flow first |
</content>
