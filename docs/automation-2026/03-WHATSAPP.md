# WhatsApp Automation — deep dive

**The owner's brief (2026-08-03):**

> *"Right now I have integrated WhatsApp… I am getting a message on WhatsApp that I have to
> manually reply to each one. A standard reply is auto-forwarded to everyone, but that is not
> automation. Automation means giving them a proper query and replies… If they properly need
> some personal assistance, then forward that message to me."*

That description is exactly right, and it is the correct first automation to want. This
document sets out what it actually takes.

---

## The blocker, stated plainly

**What you have is a hyperlink.**

`components/common/whatsapp-button.tsx` renders a floating button pointing at
`https://wa.me/923120295812`. It opens WhatsApp on the customer's phone with your number
filled in. That is the whole integration.

There is no API, no webhook, no message store, and **no way for any code in this project to
read or send a WhatsApp message.** Messages arrive on your personal WhatsApp and you reply
by hand — which is precisely the problem you described.

The auto-reply you mention is almost certainly the WhatsApp Business *app's* "away message"
or "greeting message". It sends the same text to everyone and cannot read, branch on, or
answer anything. You are right that it is not automation.

**Nothing on the roadmap below is buildable until this changes.**

---

## The three tiers of WhatsApp, and which one you need

| | WhatsApp (personal) | WhatsApp **Business app** | WhatsApp **Business API** |
|---|---|---|---|
| Cost | Free | Free | Per-message + provider fee |
| Setup | None | Minutes | Days to weeks (verification) |
| Canned greeting / away message | ✗ | ✓ | ✓ |
| Quick replies, labels, catalogue | ✗ | ✓ | ✓ |
| **Read incoming messages in code** | ✗ | ✗ | **✓** |
| **Send messages from your system** | ✗ | ✗ | **✓** |
| **Branch on what the customer said** | ✗ | ✗ | **✓** |
| **Look up their order and answer** | ✗ | ✗ | **✓** |
| **Escalate to a human on a condition** | ✗ | ✗ | **✓** |
| Multiple agents on one number | ✗ | Limited | ✓ |

**You are on tier 2 and you need tier 3.** There is no way around this. Every WhatsApp
automation vendor you have ever seen advertised is a reseller of tier 3.

---

## What tier 3 actually costs

Meta moved from per-conversation to **per-message** billing on 1 July 2025. Anything
describing "conversation pricing" is out of date.

**How you are billed now:**

| Category | What it is | Indicative rate |
|---|---|---|
| **Service** | Customer messaged you first; you reply inside 24 hrs | **1,000 free/month**, then charged |
| **Utility** | Order confirmations, shipping updates, receipts | ~$0.008–0.012/msg |
| **Marketing** | Promotions, offers, re-engagement | ~$0.016–0.020/msg |
| **Authentication** | OTP codes | Charged from first message |

Rates vary by recipient country. Add your provider's markup on top — typically
**$0.003–0.010 per message**.

**The number that matters for your use case:** when a customer messages *you* first, a
**24-hour free window** opens in which you can send any free-form reply at no charge. Your
support automation lives almost entirely inside that window.

### Realistic monthly cost for this business

| Scenario | Volume | Estimated cost |
|---|---|---|
| Support replies (inbound-initiated) | 300/mo | **Free** — within the 1,000 service allowance |
| Order confirmations (utility) | 100 orders | ~$1.00–1.50 |
| Shipping updates (utility) | 300 msgs | ~$3.00–4.50 |
| Provider platform fee | — | **$30–60/mo** typical for a small plan |

**Realistic total: roughly $35–70/month.** The platform subscription dominates, not the
messages. At current volume the messaging itself is close to free.

---

## Choosing a provider

You access the API through a **Business Solution Provider (BSP)**. You do not integrate
with Meta directly unless you want a much longer project.

**What to evaluate:**

1. **Does it operate in Pakistan?** Local billing, local support, PKR pricing.
2. **Does it give you a real API and webhooks**, or only a drag-and-drop flow builder? You
   need the API to query your own `orders` table.
3. **What is the markup per message**, on top of Meta's rate?
4. **Is there a shared team inbox** for the escalated conversations?
5. **Can it hand off cleanly to a human?** This is the requirement you named, and it is the
   one most vendors demo badly.
6. **Can you export your conversation history** if you leave?

Providers marketing to Pakistan and India include Interakt, Wati, Wetarseel, AiSensy, and
Twilio (global, developer-first, no hand-holding). **This is not a recommendation** — pricing
and quality change quickly and you should get live quotes.

**Start the application early.** Business verification with Meta requires documents and can
take days or weeks. That wait, not the engineering, is the long pole.

---

## The automation design

Once tier 3 exists, here is what to build. Note where it stops being a pipeline and becomes
a genuine agent — see [00-AGENTS-VS-AUTOMATION.md](./00-AGENTS-VS-AUTOMATION.md).

### Layer 1 — Deterministic routing (Tier 2, build first)

Cheap, predictable, and it handles a surprising share of volume.

```
Message arrives
  │
  ├─ Contains a tracking/order number?  → look up orders table → reply with status
  ├─ Matches "size|measurement|fit"      → send size guide link + offer Virtual Try Room
  ├─ Matches "delivery|shipping|charges" → send shipping info
  ├─ Matches "return|exchange|refund"    → send returns policy
  ├─ Matches "price|kitna|kitne ka"      → ask which product, then look it up
  ├─ Outside business hours              → set expectation + queue for morning
  └─ Anything else                        → Layer 2
```

**Build this layer first.** It is a week of work, it needs no model, it cannot hallucinate,
and it will resolve the routine questions that make up most of your manual replies.

### Layer 2 — AI agent (Tier 3, build second)

This is a genuine agent use case — one of the few in your business — because the questions
are open-ended and it must decide which tool to call.

**Tools it should have:**
- `lookup_order(phone_or_order_number)` — read-only
- `check_stock(product)` — read-only
- `get_product_info(product)` — price, fabric, sizes, link
- `search_journal(query)` — you now have 93 blog posts answering styling, fabric, care and
  occasion questions. **That is a ready-made knowledge base** and the highest-leverage reuse
  of the content pipeline
- `escalate_to_human(reason, summary)` — the important one

**Hard rules to give it:**
- Never quote a price it did not read from the database
- Never promise a delivery date
- Never offer a discount
- Never take payment details
- Escalate on: complaints, damaged goods, refund requests, custom/bulk orders, anything it
  is unsure about, and any request to speak to a person
- Reply in the customer's language — Urdu, English, or Roman Urdu. **This matters more than
  it sounds**; most of your market writes Roman Urdu

### Layer 3 — Escalation to you

The part the owner specifically asked for.

- Escalated conversations go to a shared inbox, not your personal phone
- The AI writes a one-line summary so you have context immediately
- The customer is told a person is joining — never leave them guessing
- The bot goes silent on that thread until you release it back
- Track: how many escalate, and why. **That list is your build queue for Layer 1.**

---

## Guardrails — non-negotiable

Automated replies to real customers are outward-facing and hard to take back.

1. **Log every automated message** with the reasoning that produced it.
2. **Rate-limit per customer** so a loop cannot spam someone.
3. **A kill switch you can hit from your phone** that disables all automated sending.
4. **Never auto-send anything that changes money** — no discounts, no refunds, no price
   overrides, no order cancellations without human confirmation.
5. **Soft launch:** run in draft mode first — the AI writes the reply, *you* press send.
   Watch it for two weeks. Only then let it send on its own.
6. **Respect the 24-hour window.** Outside it you can only send approved templates, and
   sending marketing templates to people who did not opt in is how numbers get banned.

Point 6 has teeth. **Meta bans business numbers for poor-quality sending.** Losing your
WhatsApp number would be worse than never automating it.

---

## Honest assessment

**Should you do this?** Yes — eventually. It is the right instinct and it addresses real
work you are doing by hand today.

**Should you do it first?** Probably not, and here is why.

You have **zero orders**. Most of the value in WhatsApp automation is order status,
confirmation, and post-purchase support — all of which are multipliers on zero. What is left
is pre-purchase support, which is real but is a smaller prize than finding out why nobody is
completing checkout.

**The sequencing I would advise:**

1. **This week:** buy something from your own store on your phone. Fix what you find.
2. **This week:** start the WhatsApp Business API application. The verification wait runs in
   the background and costs you nothing while you work on other things.
3. **Weeks 2–3:** build Layer 1 routing. No model, no risk, immediate time saved.
4. **Week 4+:** add Layer 2 in draft mode. Watch it. Let it send only when you trust it.
5. **When orders exist:** add COD confirmation (B-1 in the backlog). That is where WhatsApp
   automation genuinely pays for itself in this market.

Starting the API application now while fixing the funnel in parallel is the efficient path.
The waiting is free; the automation is not useful until there is something to automate.

---

## Sources

- [Blueticks — WhatsApp Business API pricing 2026](https://blueticks.co/blog/whatsapp-business-api-pricing-2026)
- [SetSmart — Per-message rates 2026](https://setsmart.io/blog/whatsapp-business-api-pricing)
- [SleekFlow — Worldwide pricing model 2026/2027](https://sleekflow.io/en-us/blog/whatsapp-business-price)
- [Tecveq — WhatsApp Business automation for e-commerce in Pakistan](https://tecveq.com/whatsapp-business-automation-for-ecommerce-in-pakistan/)
- [Interakt — RTO reduction via COD confirmation](https://www.interakt.shop/whatsapp-business-api/reduce-rto-with-whatsapp-business-api-cod-confirmations/)

Pricing changes frequently. **Verify against Meta's own developer documentation and a live
quote from a BSP before budgeting.**
