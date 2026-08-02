# Automated Daily Blog Pipeline — Plan

**Status:** 📋 Plan only. **Nothing implemented.**
**Written:** 2026-08-01
**Goal:** write, illustrate, and publish blog posts daily with no manual step.

---

## 1. First — the thing you heard is not correct

> *"I heard that Claude is generating images."*

**Claude does not generate images.** It has never had that capability, and there is no Anthropic
image-generation model or API.

What Claude **can** do, and does well, is exactly the other half of this job:

| Capability | Claude |
|---|---|
| Write the blog post | ✅ Excellent |
| **Research live trends** via a built-in web-search tool | ✅ Yes — server-side, no extra service |
| Read an image and describe it | ✅ Yes (vision = image *input*) |
| Output strict JSON matching your `journal_posts` schema | ✅ Yes (structured outputs) |
| **Create an image** | ❌ **No** |

So the pipeline needs **two providers**: Claude for the words, and a separate image model for the
picture. That is normal — nobody does both from one vendor well.

## 2. Second — a correction about your own setup

You said you'd generate images elsewhere and hand them over. You may not need to:

- **`GEMINI_API_KEY` is already in your `.env.local`** — but a grep shows **nothing in the
  codebase uses it.** It appears to be a leftover from the Virtual Try-On planning.
- **The Virtual Try-On does not use Gemini.** It calls **FASHN** (`FASHN_BASE` in
  `app/api/virtual-try-on/route.ts`). So that key is currently dead weight.

If that key is on a live Google AI billing account, **you already have image generation available**
and the pipeline can produce its own images with no new signup.

---

## 3. Recommended stack

| Job | Service | Why |
|---|---|---|
| Trend research | **Claude's built-in web search** | Server-side tool, no extra API, no scraper to maintain |
| Writing | **Claude Opus 5** (`claude-opus-5`) | Best long-form quality; structured outputs guarantee valid JSON |
| Image | **Imagen 4 Fast** (Google) | **$0.02/image** — cheapest credible option, and your key may already work |
| Scheduling | **pg_cron → protected route** | The exact pattern already running your PostEx sync reliably |
| Storage | Supabase `journal_posts` + `public/blog/` | Unchanged |

### Image options and real prices

| Model | Cost / image | 60 images/month |
|---|---|---|
| **Imagen 4 Fast** ⭐ | **$0.02** | **$1.20** |
| Imagen 4 Standard | $0.04 | $2.40 |
| Imagen 4 Ultra | $0.06 | $3.60 |
| Nano Banana 2 (Gemini 3.1 Flash Image) | $0.067 | $4.00 |
| Nano Banana Pro | $0.13 | $7.80 |

Google's Batch API gives a flat 50% discount on Nano Banana for non-urgent work — and nothing here
is urgent, so that's worth using if you prefer the Gemini models.

### Total running cost

| Item | Per post | 2/day (60/mo) |
|---|---|---|
| Claude Opus 5 (~5K in / ~5K out) | ~$0.15 | ~$9.00 |
| Web search for trends | ~$0.01 | ~$0.60 |
| Imagen 4 Fast image | $0.02 | $1.20 |
| **Total** | **~$0.18** | **≈ $11 / month** |

Cheap enough that cost is not the deciding factor. **Quality and SEO risk are.**

---

## 4. 🔴 The conflict you need to resolve

Yesterday you gave me a standing instruction: **protect the SEO above everything, ask before
touching it.** Today you're asking for a system that publishes 2 unreviewed AI-written posts a day,
forever, with no human in the loop.

**Those two goals are in direct conflict**, and I'd be doing you a disservice to build the second
without saying so.

- 2/day = **60 posts/month**. You currently have **37 journal URLs** total. That is a **160%
  content increase every month**, indefinitely.
- Google's spam policies explicitly name **scaled content abuse** — mass-produced content created
  primarily to manipulate rankings. The test is not "was AI used" (AI content is fine); it is
  whether content is **produced at scale without human oversight or added value**. A fully
  autonomous 2-a-day pipeline is close to the textbook description.
- **Nothing catches a bad post.** A hallucinated fabric fact, a wrong price, a competitor's brand
  name, a broken internal link — it publishes, gets indexed, and sits on your domain.

### The fix costs you ~60 seconds a day

**Draft-and-approve instead of auto-publish:**

```
cron → research trend → write post → generate image → save as status:'draft'
     → email/WhatsApp you a preview link
     → you tap Approve (or Reject)
     → status flips to 'published', appears in sitemap
```

You get **all** the automation — no writing, no image work, no formatting, no scheduling — and keep
the one thing that protects the asset you told me matters most: **a human said yes.**

If after a month the drafts are consistently good, flipping to auto-publish is a **one-line settings
change**. Build it draft-first; earn the right to automate the last step.

### My recommendation

| Setting | Recommended | You asked for |
|---|---|---|
| Frequency | **1/day** (30/mo) | 2/day (60/mo) |
| Publishing | **Draft + one-tap approve** | Fully automatic |
| Auto-publish later | Yes, once quality is proven | — |

**It is your business and your call.** If you want 2/day fully automatic after reading this, I'll
build exactly that — I just won't let it ship without you knowing the risk.

---

## 5. Architecture

Everything mirrors the PostEx cron pattern already proven in production.

```
supabase pg_cron (daily 09:00 PKT)
   │
   ▼
POST /api/cron/blog-generate     ← CRON_SECRET auth, fails closed (copy of postex-sync)
   │
   ├─ 1. Pick next topic from docs/blogging/topical-map.md queue
   ├─ 2. Claude Opus 5 + web_search → research current trend angle
   ├─ 3. Claude Opus 5 + structured outputs → post JSON
   │       { title, slug, meta_description, keywords, excerpt,
   │         category_tag, content: [intro, section×N, faq] }
   ├─ 4. Validate: word count ≥1200, title ≤60, meta 140–160,
   │       ≥3 internal links, ≥1 FAQ block, slug unique
   ├─ 5. Imagen 4 → hero image from the post's own content
   ├─ 6. Save WebP 1920×1080 → public/blog/{slug}.webp
   ├─ 7. INSERT journal_posts (status: 'draft')
   └─ 8. Email you the preview link
```

**New files only** — nothing existing is rewritten:

```
app/api/cron/blog-generate/route.ts     ← the worker
lib/blog/generate.ts                    ← Claude call + schema
lib/blog/image.ts                       ← Imagen call + WebP conversion
lib/blog/validate.ts                    ← quality gate
lib/blog/topics.ts                      ← topic queue from topical-map.md
app/admin/journal/                      ← draft review + approve UI
```

**Kill switch:** `BLOG_AUTOMATION_ENABLED` unset ⇒ the route no-ops. Same env-gate pattern as
`lib/courier/postex/config.ts`.

### Quality gate — the part that matters

A post is **rejected and retried** (not published, not saved) if it fails any of:

| Check | Threshold | Why |
|---|---|---|
| Word count | ≥ 1,200 | Your existing avg is 874 — the thin posts don't rank |
| Title length | ≤ 60 chars | 20 of your 31 currently truncate in search results |
| Meta description | 140–160 chars | 24 of 31 currently truncate |
| Internal links | ≥ 3 to real, live URLs | **All 31 existing posts have zero** |
| FAQ block | ≥ 1 with ≥ 3 Q&As | Feeds the `FAQPage` schema |
| Slug | Unique vs DB | Prevents collisions |
| Product links | Must resolve to in-stock products | Never link to a dead page |

This gate is what makes automation safe. Without it you are just generating volume.

---

## 6. 🔴 Prerequisite — fix the FAQ schema first

From yesterday's audit (`BLOG-SEO-AUDIT-2026-08-01.md` §3): `app/journal/[slug]/page.tsx` imports
`FAQSchema` on line 16 and **never renders it**. Every post has FAQ content that search and AI
engines cannot see as structured Q&A.

**Do not build this pipeline before that ~5-line fix.** Otherwise every one of the 30–60 posts a
month it produces inherits the same invisible-FAQ gap, and you multiply the problem instead of
fixing it.

---

## 7. What I need from you

### Decisions

| # | Question | My recommendation |
|---|---|---|
| 1 | Draft-and-approve, or fully automatic? | **Draft-and-approve** |
| 2 | 1/day or 2/day? | **1/day** |
| 3 | Image provider | **Imagen 4 Fast** ($0.02) — cheapest, likely reuses your existing key |
| 4 | Approval channel | Email, or WhatsApp link |
| 5 | Fix FAQ schema first? | **Yes** — it's the prerequisite |

### Credentials

| Item | Status |
|---|---|
| `ANTHROPIC_API_KEY` | ❌ **Needed** — from `console.anthropic.com` |
| `GEMINI_API_KEY` | ⚠️ Present but unused — **confirm it's on a live billing account with Imagen access** |
| `CRON_SECRET` | ✅ Already set (PostEx uses it) |
| Supabase service role | ✅ Already set |

### About images

**You do not need to generate images by hand.** The pipeline creates each hero image from the
post's own content, saves it as `public/blog/{slug}.webp` at 1920×1080, and the filename always
matches the slug — so a mismatch is impossible.

If you'd rather supply images yourself, the automation can pause at that step and wait — but that
reintroduces the manual work you're trying to remove.

---

## 8. Honest risks

| Risk | Mitigation |
|---|---|
| **Scaled-content penalty** | Draft-and-approve; 1/day; hard quality gate |
| Factual errors on your own products | Post JSON is validated against live DB products |
| Duplicate/overlapping topics | Topic queue + slug uniqueness + semantic check vs published titles |
| Generic AI writing voice | Few-shot the prompt with your best existing posts (the 1,900-word ones) |
| Image doesn't match brand | Fixed style prompt + your palette; review in draft mode |
| Runs away / spends money | Per-run cap, `BLOG_AUTOMATION_ENABLED` kill switch, cost logged per post |
| Silent failure | Log every run; surface "last successful run" in admin |

---

**Nothing implemented.** Answer the five decisions and send the Anthropic API key, and I'll build
it — starting with the FAQ schema fix.

**Sources for pricing:**
[Claude API pricing](https://platform.claude.com/docs/en/pricing.md) ·
[IntuitionLabs — AI image pricing 2026](https://intuitionlabs.ai/articles/ai-image-generation-pricing-google-openai) ·
[Gemini image generation pricing](https://www.aifreeapi.com/en/posts/gemini-image-generation-api-pricing)
</content>
