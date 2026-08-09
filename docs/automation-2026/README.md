# Automation Strategy — Habiba Minhas

**Created:** 2026-08-03
**Status:** 🔬 Research and planning only. **Nothing in this folder has been implemented.**
**Owner instruction (2026-08-03):** *"Do not implement anything right now. It's just planning,
it's just a suggestion, and it's just a learning phase."*

---

## Read these in order

| # | Document | What it answers |
|---|---|---|
| 00 | [Agents vs Automation](./00-AGENTS-VS-AUTOMATION.md) | "Is my blog system an agent?" — the vocabulary, honestly |
| 01 | [Current State](./01-CURRENT-STATE.md) | What is *already* automated here, audited against the live system |
| 02 | [Automation Backlog](./02-BACKLOG.md) | Every candidate automation, scored and sequenced |
| 03 | [WhatsApp Deep Dive](./03-WHATSAPP.md) | The owner's own example, costed and planned properly |
| — | [TRACKER](./TRACKER.md) | Single source of truth for what is done vs. not |

---

## The one thing to take away

**This store has never completed an order.**

```
orders          0
order_items     0
customers      29   (28 are registered accounts, not buyers)
try_on_usage   52   (25 distinct people, still active 2026-08-01)
```

Traffic is real. The site ranks in Google and in AI search. People are signing up and
using the Virtual Try Room. **Nobody has bought anything.**

That single fact should govern every automation decision for the next quarter, because
most e-commerce automation advice assumes a working funnel and optimises the edges of it:

- Abandoned-cart recovery assumes carts that would otherwise convert
- COD confirmation assumes COD orders exist
- Review requests assume deliveries
- Re-order reminders assume a first order
- Loyalty automation assumes repeat customers

Every one of those is a **multiplier on a number that is currently zero.**

Automating on top of a funnel that has never converted is the classic mistake of a
technically capable owner: it feels like progress, it produces impressive dashboards, and
it moves no money. The correct order is **diagnose → fix → measure → then automate.**

See [02-BACKLOG](./02-BACKLOG.md) § "Sequencing" for what that means concretely.

---

## What this folder is not

It is not a list of tools to buy. Most "AI automation for e-commerce" content is written by
companies selling the automation, and the numbers in it (*"recover 30% of abandoned carts"*,
*"reduce RTO by 40%"*) are vendor marketing measured on stores that already had volume.

Where those figures appear here they are labelled as vendor claims, with the source, and
with an honest note on whether they can apply to this business yet.

---

## Related existing work

| Folder | Relevance |
|---|---|
| `docs/checkout-cro-2026/` | **Read this first.** 12 findings on why mobile checkout fails. 5 fixed, 7 open |
| `docs/payments-fulfilment-2026/` | PostEx auto-booking + XPay gateway plan. Contains a known money-losing bug |
| `docs/blogging/` | The content pipeline that is now live and running daily |
| `docs/seo-optimization-2026/` | 45-task SEO roadmap, 15 done |
| `docs/analytics/` | Admin analytics work |

---

## Standing constraints on anything built from this folder

1. **SEO is protected.** See `AGENTS.md`. Any automation touching rendered pages, URLs,
   metadata or structured data must be raised with the owner *before* implementation.
2. **Vercel is on the free plan.** No Vercel cron. Scheduling goes through Supabase
   `pg_cron` + `pg_net`, as the blog and PostEx sync jobs already do.
3. **Branch per feature**, push to the branch, ask before merging to `main`.
4. **Cost is a first-class constraint.** The blog pipeline was deliberately redesigned from
   ~$0.53/post to ~$0.04/post by moving writing out of the API. Apply the same scrutiny to
   every proposal here.
