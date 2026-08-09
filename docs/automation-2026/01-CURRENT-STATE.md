# Current State — what is already automated

**Audited:** 2026-08-03, against the live site, the repository, the Supabase database and
the admin panel. Figures are real, not estimated.

---

## Business reality check

Read this before anything else, because it reframes every recommendation.

| Metric | Value | Source |
|---|---|---|
| **Orders (all time)** | **0** | `orders` table |
| Order items | 0 | `order_items` |
| Customers | 29 | `customers` |
| — of which registered accounts | 28 | `auth_user_id IS NOT NULL` |
| — of which have ever ordered | 2 (stale — orders table is empty) | `total_orders > 0` |
| First customer | 2026-04-16 | |
| Most recent customer | 2026-07-30 | |
| Virtual Try Room uses | 52, by 25 distinct users | `try_on_usage` |
| Most recent try-on | 2026-08-01 | |
| Active products | 54 | `products` |
| — active but zero stock | 6 | |
| — on sale | 0 | `compare_at IS NULL` for all |
| Published blog posts | 33 (+60 queued, 1/day) | `journal_posts` |
| Contact form messages | 2 | `contact_messages` |
| Admin notifications | 92 | `notifications` |

**Interpretation:**

- Acquisition works. SEO is delivering, and 25 people cared enough to try clothes on
  virtually. That is a *high-intent* action, not a bounce.
- Conversion is at zero. Not low — zero.
- 6 active products advertise themselves and cannot be bought.
- Nothing is discounted, so there is no promotional lever currently pulled.

The Virtual Try Room number is the most encouraging figure on this page. 25 people
uploading a photo to see an outfit on themselves is strong purchase intent. **They are
reaching the top of the funnel and falling out before payment.**

---

## Automation inventory

### ✅ Live and working

| # | Automation | Tier | Trigger | What it does | Notes |
|---|---|---|---|---|---|
| A-01 | Blog publishing | 2 | `pg_cron` 08:30 + 08:40 PKT daily | Reads next queue file → quality gate → hero image → publish | 59 posts of runway. ~$0.04/post |
| A-02 | PostEx status sync | 2 | `pg_cron` every 15 min | Polls PostEx for tracking updates on active bookings | Currently no-ops — zero bookings |
| A-03 | Order confirmation email | 1 | Order placed | Email to customer + alert to owner | **Never fired in production** |
| A-04 | Contact form email | 1 | Form submitted | Auto-acknowledge + notify owner | 2 uses |
| A-05 | Low-stock notification | 1 | Stock crosses threshold | Admin notification row | 1 fired |
| A-06 | Live Sale notification card | 1 | Page view | Rotating "someone just bought" card, real products, ladies-weighted | Social proof, not automation of work |
| A-07 | Sitemap refresh | 2 | ISR, hourly | New blog posts enter `sitemap.xml` automatically | No manual step |
| A-08 | Storefront cache invalidation | 1 | Product edit / order placed | Keeps stock badges truthful | Added 2026-08-02 |
| A-09 | Invoice PDF generation | 1 | On demand | `pdfkit` / `pdf-lib` | Manual trigger |

### 🟡 Built but idle

| # | Thing | Why it is idle |
|---|---|---|
| B-01 | PostEx booking | Works, but there are no orders to book |
| B-02 | GA4 e-commerce events | Firing, but no purchase events exist to measure |
| B-03 | Admin AI insights panel | Summarises analytics that are currently near-empty |
| B-04 | Customer accounts | 28 registered, none have bought |

### ❌ Not automated at all

| Area | Current process | Cost to owner |
|---|---|---|
| **WhatsApp enquiries** | Manual reply to every message | Ongoing, unbounded, and the owner's stated pain |
| Abandoned carts | Nothing. No cart persistence to a server, no recovery | Unknown — not measured |
| Order confirmation (COD) | N/A — no orders yet | — |
| Post-delivery follow-up | Nothing | — |
| Review collection | Nothing | — |
| Restock alerts to customers | Product page mentions it; not built | Lost demand on 6 zero-stock products |
| Product descriptions | Written by hand | Hours per product |
| Product photography prep | Manual | Hours |
| Social media posting | Manual | Ongoing |
| Inventory reordering | Manual | Ongoing |
| Business reporting | Manual, via admin panel | Ongoing |

---

## The WhatsApp situation, precisely

The owner described WhatsApp as "integrated". It is worth being exact, because it changes
what is possible.

**What exists:** `components/common/whatsapp-button.tsx` — a floating button linking to
`https://wa.me/923120295812`. It opens WhatsApp with your number pre-filled.

**That is the entire integration.** It is a hyperlink.

There is:
- No WhatsApp Business API account
- No webhook receiving messages
- No message store
- No way for any code in this project to read or send a WhatsApp message

**Consequence:** the automation the owner wants — qualify the query, answer it, escalate to
a human when needed — **cannot be built on the current setup at all.** It requires the
WhatsApp Business API (a Meta product, accessed through a Business Solution Provider),
which is a commercial and verification exercise before it is an engineering one.

Fully costed in [03-WHATSAPP.md](./03-WHATSAPP.md).

---

## Known open defects that automation would amplify

Listed because automating over a broken step multiplies the breakage.

| Source | Issue | Why it matters here |
|---|---|---|
| `docs/checkout-cro-2026/` F-05 | Mobile quantity stepper is decorative — never affects the order | A customer ordering 3 receives 1. Automating order confirmation would confirm the *wrong* quantity |
| `docs/payments-fulfilment-2026/` | Non-COD orders marked `paid` before payment completes | PostEx would collect Rs. 0. Auto-booking would industrialise this loss |
| `docs/checkout-cro-2026/` F-11 | Hardcoded "In Stock" / "Held for 30 minutes" copy | Contradicts real stock. Any stock-driven automation inherits the lie |
| This audit | 6 active products with zero stock | They are indexed, crawlable and unbuyable |

**Rule of thumb: do not automate a process you would not be happy running by hand.**

---

## What is genuinely strong here

An honest audit should say what is working, and several things are:

1. **The blog pipeline is properly engineered.** Two-phase to survive Vercel's timeout, an
   offline quality gate, `journal_posts` as its own tracker so it cannot drift, and a cost
   model deliberately driven to near-zero. This is better than most small stores have.
2. **SEO is a real asset.** Ranking in Google *and* AI search is difficult and valuable.
3. **The Virtual Try Room is a genuine differentiator** — and it is being used.
4. **PostEx is integrated properly**, including bulk operations and scheduled sync.
5. **The admin panel is substantial** — analytics, inventory, customers, notifications,
   order activity log.

The infrastructure is ahead of the revenue. That is an unusual position, and it means the
gap is not capability. **It is the last three metres of the funnel.**
