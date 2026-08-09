# Social Media Automation — Habiba Minhas

**Created:** 2026-08-09
**Status:** 📋 Plan only. **Nothing implemented.** Awaiting owner setup + approval.
**Backlog ID:** A-6 "Social content pipeline" in `docs/automation-2026/02-BACKLOG.md`

---

## What this is

An automated posting pipeline that takes products straight from the Supabase `products`
table and publishes them to social platforms on a schedule the owner controls, without
repeating a product until every eligible one has had its turn.

**Phase 1 targets Facebook + Instagram.** The design is platform-agnostic so TikTok,
Pinterest, LinkedIn, X and the rest slot in later without a rewrite.

## Read in order

| # | Document | What it answers |
|---|---|---|
| 01 | [Setup Checklist](./01-SETUP-CHECKLIST.md) | **Start here.** Exactly what the owner must do and hand over |
| 02 | [Architecture](./02-ARCHITECTURE.md) | Database tables, rotation logic, cron, platform adapters |
| 03 | [Content & Schedule](./03-CONTENT-AND-SCHEDULE.md) | Captions, hashtags, social SEO/AEO, posting times |
| — | [TRACKER](./TRACKER.md) | What is done vs not |

---

## Five findings that shape the whole design

These came out of reading Meta's own documentation and querying the live database. Each
one changes what can be built, and at least two are the kind of thing that sinks a project
in week three if discovered late.

### 1. Instagram's API accepts JPEG only — every product image here is WebP

Meta's content publishing docs are explicit:

> *"JPEG is the only image format supported. Extended JPEG formats such as MPO and JPS are
> not supported."*

Every image uploaded by the product pipeline is `.webp` (that conversion is what makes them
94% smaller). **Instagram will reject all of them.** The pipeline must generate JPEG
derivatives. `sharp` is already a dependency and `scripts/optimize-product-images.mjs`
already does the conversion work — this is a solved problem here, but it must be built in
from the start, not bolted on.

### 2. There are only 20 eligible products right now

```
ladies-suits, status=active, stock > 0              →  20
  …of those, with 2+ images (carousel-capable)      →  19
  …of those, with 3+ images                         →  14
ladies-suits, active but out of stock (excluded)    →   5
```

At the requested "no repeats until all are used":

| Cadence | Runway before the rotation restarts |
|---|---|
| 1 post/day | **20 days** |
| 2 posts/day | **10 days** |
| 2 products per post, 1/day | **10 days** |

Two per day burns the entire catalogue in a week and a half. This is worth knowing before
choosing a cadence — see [03](./03-CONTENT-AND-SCHEDULE.md).

### 3. App Review is the long pole — 2 to 4 weeks

`instagram_content_publish` and `pages_manage_posts` both require Meta App Review before
they work on a live account. Nothing publishes until that is approved. **The application
should be started immediately**, in parallel with everything else, because the waiting is
free and it gates the entire project.

### 4. Use a System User token, not a personal one

A Page access token generated from a personal login dies when the owner changes their
Facebook password, or if their Page role changes. A **System User** token lives in the
Business Portfolio, belongs to the business rather than a person, and does not expire.
For an unattended daily job, the personal-token route means the automation silently stops
working one day and nobody knows why.

### 5. WhatsApp cannot be automated the way the others can

WhatsApp was mentioned alongside Facebook and Instagram, but it is a different kind of
product. The Cloud API sends **messages to people who have messaged you** — it is not a
broadcast channel, and WhatsApp Channels has no public posting API at all. Product
announcements to WhatsApp are a template-message campaign to an opted-in contact list,
which is a separate build with its own costs. See `docs/automation-2026/03-WHATSAPP.md`,
which already covers this.

---

## Honest note on sequencing

`docs/automation-2026/README.md` makes the case that automating on top of a funnel that has
never converted is the classic expensive mistake — the store still has **zero completed
orders**.

Social posting is a fairer bet than most of that backlog, because it sits *upstream*: it
creates demand rather than multiplying a conversion rate of zero. But it is worth being
clear-eyed — if the checkout is broken, more traffic produces more abandoned sessions, not
more revenue. `docs/checkout-cro-2026/` has 7 open findings, 3 of them rated as blocking
mobile purchase entirely.

**Recommendation:** build this, and fix the checkout blockers in the same period. Posting to
10,000 people through a broken checkout is the worst of both worlds.

---

## Standing constraints inherited from the project

1. **SEO is protected** (`AGENTS.md`). This pipeline writes to social platforms, not to the
   website, so it does not touch the SEO surface — but any change that adds pages, routes or
   structured data must be raised with the owner first.
2. **Vercel free plan — no Vercel cron.** Scheduling uses Supabase `pg_cron` + `pg_net`,
   exactly as `/api/cron/blog-generate` and `/api/cron/postex-sync` already do.
3. **Cost is a first-class constraint.** The blog pipeline was rebuilt from ~$0.53 to ~$0.04
   per post by moving generation out of the API. Apply the same scrutiny here.
4. **Branch per feature**, ask before merging to `main`.

---

## Sources

- [Instagram Content Publishing API](https://developers.facebook.com/docs/instagram-platform/content-publishing) — Meta official
- [Facebook Pages API — Posts](https://developers.facebook.com/docs/pages-api/posts) — Meta official
- [Long-Lived Access Tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/) — Meta official
