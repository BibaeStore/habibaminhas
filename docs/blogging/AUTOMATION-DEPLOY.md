# Blog Automation — Deployment Guide

**Status:** ✅ Built and proven end-to-end. One real post published by the pipeline.
**Cadence:** 1 post per day.
**Branch:** `feat/blog-automation`

---

## 1. Environment variables to add in Vercel

Project → Settings → Environment Variables. Apply to **Production** (and Preview if you
want to test there).

| Variable | Value | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | **Rotate first** — the key used in development was pasted in chat |
| `OPENAI_API_KEY` | `sk-proj-...` | **Rotate first** — same reason |
| `CRON_SECRET` | *(already set)* | Reused from the PostEx sync |
| `BLOG_POSTS_PER_RUN` | `1` | One post per cron firing |
| `BLOG_MAX_PER_DAY` | `1` | Hard ceiling — nothing can exceed this |
| `BLOG_WRITER_EFFORT` | `high` | Cost lever — `medium` roughly halves the writing bill |
| `BLOG_AUTOMATION_ENABLED` | *(omit)* | Set to `false` to kill the feature instantly |

**Kill switch:** deleting `ANTHROPIC_API_KEY` or setting `BLOG_AUTOMATION_ENABLED=false`
stops all generation. No deploy needed beyond the env change.

---

## 2. Top up both accounts

Generation stops the moment either balance runs out. It failed exactly this way during
testing — the Anthropic balance emptied after the first post.

**At 1 post per day (30/month):**

| Account | Per post | Per month | Where |
|---|---|---|---|
| **Anthropic** (writing) | $0.4897 | **$14.69** | console.anthropic.com → Billing |
| **OpenAI** (image) | $0.0412 | **$1.23** | platform.openai.com → Billing |
| | **$0.5309** | **$15.93** | |

Your existing $10 of OpenAI credit covers roughly **8 months** of images. Anthropic is
the one that needs topping up — it is currently at zero.

### Where the writing cost actually goes

Reconstructed from the measured run: of ~17,500 output tokens, only ~3,900 were the
article itself. **Roughly 78% was thinking.** Claude Opus 5 reasons by default and
`effort` controls how much.

| `BLOG_WRITER_EFFORT` | Est. per post | Est. per month | Trade |
|---|---|---|---|
| `high` (default) | ~$0.53 | **~$16** | Best quality — what produced the verified test post |
| `medium` | ~$0.30 | **~$9** | Modest quality drop, ~45% cheaper |
| `low` | ~$0.18 | **~$5** | Noticeably thinner reasoning; may fail the 1,200-word gate |

Change it in Vercel env — no redeploy needed. Start at `high`, and if the monthly bill
matters more than the last increment of quality, move to `medium` and compare a few posts.

---

## 3. Schedule the cron (after deploying)

Supabase Dashboard → SQL Editor → run
`supabase/migrations/20260802_blog_automation_cron.sql`,
replacing `<CRON_SECRET>` with the real value first.

**Vercel Cron is deliberately not used** — free plan. This uses Supabase `pg_cron`, the
same scheduler already running your PostEx sync.

Two jobs, one post a day (UTC; Pakistan is UTC+5):

| Time (UTC) | Time (PKT) | Job |
|---|---|---|
| 03:30 | 08:30 | write the day's post → draft |
| 03:40 | 08:40 | illustrate + publish it |

### Why two phases

The full end-to-end run measured **259 seconds**. That would time out on a serverless
function limit. Splitting into `?phase=write` and `?phase=image` keeps each request
short, and means a failed image never forces the expensive writing to be redone — the
draft simply waits for the next image run.

**Drafts are invisible.** Every read path filters `status='published'`: journal listing,
post page, related articles, and the sitemap. A half-finished post cannot leak.

---

## 4. Sitemap — already automatic

`app/sitemap.ts` queries `journal_posts` where `status='published'` on every request, so
new posts appear with no action. Verified live: after the pipeline published its test
post, the sitemap went **134 → 135 URLs** and journal entries **37 → 38**, with the new
slug present.

Nothing to configure.

---

## 5. What the quality gate blocks

A post is **never written to the database** unless it passes all of these. Thresholds
come from the audit of the existing 31 posts — these are the numbers that were holding
them back.

| Check | Threshold |
|---|---|
| Word count | ≥ 1,200 |
| Title length | ≤ 60 chars |
| Meta description | ≤ 165 chars |
| Sections | ≥ 5 |
| FAQ block | exactly 1, with ≥ 3 Q&As |
| **Internal links** | **≥ 3, and every URL must resolve to a real page** |
| Slug | valid format |
| AI filler phrases | ≥ 3 hits = rejected |

The link check is the important one: the model is given a list of real collection,
product and article URLs and may only use those. An invented URL fails the post.

---

## 6. Verified test run

```
Topic      Post 31 — care-for-kids-embroidered-outfits-washing-storage
Words      2,307        Title 56 chars      Meta 155 chars
Sections   9            FAQ 6 Q&As          Internal links 6
Image      1920x1080 WebP, 314 KB, Supabase Storage
Schema     BlogPosting + BreadcrumbList + FAQPage (6 Questions)
Sitemap    auto-added
Cost       $0.5309
```

Live at `/journal/care-for-kids-embroidered-outfits-washing-storage/`.

---

## 7. Monitoring

```sql
-- Cron schedules
select jobname, schedule, active from cron.job where jobname like 'blog-%';

-- Recent runs
select j.jobname, r.status, r.start_time
  from cron.job_run_details r join cron.job j on j.jobid = r.jobid
 where j.jobname like 'blog-%' order by r.start_time desc limit 10;

-- Drafts stuck without an image (phase 2 failed)
select slug, created_at from journal_posts
 where status = 'draft' and hero_image like 'PENDING::%';

-- Pause publishing without deleting the jobs
update cron.job set active = false where jobname like 'blog-%';
```

**Manual trigger** (useful for testing after deploy):

```bash
curl -X POST "https://habibaminhas.com/api/cron/blog-generate/?phase=write" \
  -H "x-cron-secret: YOUR_SECRET"
```

---

## 8. Topic queue

Topics come from `docs/blogging/topical-map.md` — 100 parsed, minus whatever is already
in `journal_posts`. At 1/day the queue lasts about **ten weeks**, then the run returns
`queue_empty` and stops cleanly. Add more entries to that file in the same format to
extend it.

---

## 9. Honest caveats

| Item | Status |
|---|---|
| Cost is ~2.9× my original estimate | Measured $0.53/post, not $0.18. Documented above |
| Fully automatic publishing | Your explicit decision; the quality gate is the mitigation |
| 1/day = 30 posts/month on a 38-post site | Still a fast ramp; risk flagged in `AUTOMATION-PLAN-2026-08-01.md` §4 |
| Topic queue runs dry in ~10 weeks | Extend `topical-map.md` before then |
| Both API keys were pasted in chat | **Rotate both before deploying** |

