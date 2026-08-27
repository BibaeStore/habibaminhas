# Content & Schedule

What each post actually says, and when it goes out.

---

## Social copy is not website copy

The product descriptions written for the website are long, explanatory and built for search
engines and AI answer extraction. Pasting them into Instagram would fail — different medium,
different reader, different ranking system.

| | Website | Instagram / Facebook |
|---|---|---|
| Read for | Deciding whether to buy | Deciding whether to stop scrolling |
| Length | 2,000–3,000 characters | First **125 characters** is what most people see |
| Ranked by | Google crawler, AI retrieval | Platform search + recommendation algorithm |
| Links | Clickable everywhere | **Instagram: not clickable in captions** |
| Wins by | Completeness and reasoning | Hook, then specifics, then a clear next step |

The good news is that the source material is unusually strong. Every product already has a
`short_description` spec list, a long `description`, 9–10 written FAQs, and `seo_keywords`.
The captions are assembled from those rather than invented, so nothing has to be re-written
by hand and nothing gets hallucinated.

---

## Caption structure

Four blocks, generated per platform from database fields:

```
┌─ HOOK ─────────────────── first 125 chars, before "…more" ──┐
│ Deep emerald green, cotton, and quiet gold at the cuffs.    │
│ Size S, M and L — this one has a real size range.           │
├─ DETAIL ────────────────── from short_description ──────────┤
│ • 3-piece stitched cotton suit                              │
│ • Embroidered cuffs + chiffon dupatta                       │
│ • Rs. 4,900 · Small, Medium, Large                          │
│ • Made in our Karachi studio, small runs only               │
├─ CTA ──────────────── platform-specific, see below ─────────┤
│ Full details and sizing on the site — link in bio 🔗        │
├─ HASHTAGS ─────────────── 12–15, tiered ───────────────────┤
│ #PakistaniFashion #CottonSuit …                             │
└─────────────────────────────────────────────────────────────┘
```

### The hook is the whole game

The first line decides whether anything after it is read. Rules for generation:

- Lead with the **most distinctive concrete fact**, not a brand adjective. *"Deep emerald
  green, cotton, gold at the cuffs"* beats *"Elevate your wardrobe with timeless elegance."*
- Never open with the price. It reads as an advert before anyone has decided they want it.
- Where a product has a genuine differentiator, use it: hand embroidery, a real size range,
  a single piece only, a technique like chikankari or cross-stitch.
- These already exist in the product copy — the caption generator pulls from
  `short_description` rather than inventing claims.

### Language

Research consistently reports that Urdu or mixed captions outperform English-only for
Pakistani audiences. Recommended default:

- **English body** — it is what the existing product copy is written in, and it reaches the
  diaspora audience too
- **One Urdu or Roman-Urdu line** near the CTA, e.g. *"Sirf aik piece available — Medium."*
- Never machine-translate the whole caption. Half-correct Urdu reads worse than clean English

---

## Hashtags — tiered, not stuffed

15 hashtags across four tiers. Using 30 broad ones is the most common mistake and it buries
a small account in feeds it cannot compete in.

| Tier | Count | Purpose | Examples |
|---|---|---|---|
| **Broad** | 2–3 | Reach, low win probability | `#PakistaniFashion` `#PakistaniSuits` |
| **Niche** | 4–5 | Where a small account can actually rank | `#CottonSuitPakistan` `#StitchedSuits` `#ChikankariSuit` |
| **Local** | 3–4 | Buying intent, geography | `#KarachiFashion` `#OnlineShoppingPakistan` `#PakistanOnlineStore` |
| **Brand** | 2–3 | Owned, builds a searchable archive | `#HabibaMinhas` `#HMStudio` |
| **Occasion** | 1–2 | Seasonal, only when true | `#EidCollection` `#MehndiOutfit` |

Generated from `seo_keywords`, `category`, `subcategory` and colour — so they are specific
to each product rather than one recycled block. A recycled hashtag block across every post
is itself a spam signal.

### Social AEO — being the answer, not just the post

Platform search and AI assistants increasingly surface social content for questions like
*"where to buy stitched cotton suits in Karachi"*. What helps:

- **Write the answer in the caption**, not only in the image. Text in a picture is not
  indexed; caption text is.
- **Name the specifics** — fabric, technique, city, price, sizes. Retrieval works on
  concrete nouns.
- **Answer one real question per post**, drawn from the product's existing FAQs. *"Is lawn
  the same as cotton?"* is already written for product 033 and is exactly the kind of thing
  that gets surfaced.
- **Alt text** on Instagram images — supported on feed posts, indexed, and almost nobody
  uses it. The product `title` plus colour and fabric goes here automatically.

---

## The link problem, and how to handle it

**Instagram does not make links in captions clickable.** This is the single biggest
practical constraint, and it is worth being blunt about it because it changes the CTA.

| Platform | Link handling |
|---|---|
| **Facebook** | Direct product URL in the post text. Clickable. Straightforward. |
| **Instagram feed** | Not clickable. Needs the strategy below. |
| **Instagram Stories** | Link sticker — clickable, but Stories expire in 24h |

**Recommended approach — link-in-bio, kept in sync automatically:**

The bio link points at a page that always shows the most recently posted products, each
linking to its real product page. Since the pipeline already knows exactly what it posted
and when, that page can be generated from `social_post_log` with no manual upkeep.

Two options:

1. **Use the existing `/new/` page** — zero new work, already live, already lists featured
   products. The caption then says *"Link in bio → New Arrivals"*.
2. **A dedicated `/shop/latest-posts` page** — perfectly matches post order, but it is a new
   indexable page and therefore **an SEO-surface change requiring owner approval** per
   `AGENTS.md`.

**Recommendation: start with option 1.** It costs nothing, adds no pages, and can be
upgraded later if the click-through justifies it.

Every caption also names the product explicitly (*"Emerald Grace"*), so site search finds it
even if someone never taps the bio link.

### Measuring whether any of this works

Append UTM parameters to the URLs used on Facebook and on the bio link, so GA4 can attribute
sessions and the pipeline can be judged on traffic rather than vibes:

```
?utm_source=instagram&utm_medium=social&utm_campaign=auto_product&utm_content=<sku>
```

Because `utm_content` carries the SKU, it becomes possible to see **which products
actually drive clicks** — which then feeds back into what gets posted more often.

---

## Posting times

Researched rather than assumed. Sources at the bottom.

### Instagram — Pakistan audience

| Slot | Time (PKT) | Best for |
|---|---|---|
| Morning | 09:00–11:00 | Stories |
| **Evening (primary)** | **18:00–21:00** | **Feed posts and carousels** |
| Late evening | 22:00–00:00 | Secondary, ages 18–34 |
| Reels | 18:00–20:00 | Gives the algorithm ~2h to index before peak traffic |

Strongest days reported: **Thursday, Friday, Saturday.**

Feed posts should land **no later than 21:00** so engagement accumulates before midnight.

### Facebook — Pakistan audience

Lunchtime and afternoon into early evening. Early morning performs worst. Global data points
at Thursday around 09:00 local, but the Pakistan-specific pattern favours **13:00–16:00**.

### Current configuration — a window, not a time (from 2026-08-27)

```sql
slot_window_start        = '18:30'   -- inclusive
slot_window_end          = '21:30'   -- inclusive
slot_window_step_minutes = 15        -- must match the pg_cron tick
timezone                 = 'Asia/Karachi'
```

One post a day at a time **drawn from that window**, varying daily, rather than the same
clock time every day. `slot_times` is ignored while both bounds are set, and is still kept
up to date as the fallback if the window is ever cleared.

**Why, and why not for the reason people assume.** Posting at a fixed time is *not* an
automation signal Meta acts on. Publishing through the Content Publishing API is the
sanctioned path, its only documented ceiling is 100 API posts per rolling 24h, and Adam
Mosseri has said outright that scheduled posts are not down-ranked ("there was a bug where
it did affect unconnected reach, but that was many, many months ago and it has since been
fixed"). Meta's automation enforcement targets *engagement* automation — mass follow/like/
comment, unofficial APIs, password-sharing tools — none of which this pipeline does.

The real argument is measurement and coverage: 19:00 every day tests exactly one hour and
reaches only the audience awake for it. A varying time turns the schedule into free
time-of-day A/B data while staying inside the evening peak.

### How the time is chosen

`lib/social/slot-window.ts`. The time is **derived from the calendar date**, not rolled at
runtime — the cron ticks every 15 minutes, so a `Math.random()` inside the route would be
re-rolled 96 times a day and fire repeatedly. Same date in, same time out, with no stored
state to keep in sync.

Each cycle of N days is a seeded permutation of all N times in the grid, so:

| Property | 18:30–21:30 @ 15 min |
|---|---|
| Possible times (N) | **13** |
| Every time used before any repeats | yes, once per 13-day cycle |
| Minimum gap before a time recurs | **5 days** (`floor(N/3) + 1`) |
| Average gap | 13 days |

> ⚠️ **A full month with no repeat is not reachable.** 30 days cannot be covered by 13
> distinct times. This is the maximum spread the arithmetic allows. More requires a wider
> window or a finer step — and a finer step requires speeding up the pg_cron job, because
> the tick is the real resolution limit: a 19:37 draw would simply publish at the 19:45 tick.

**Reel collision guard.** Photos were pinned at 19:00 and reels at 20:00, so they could
never clash. A window makes a Monday/Friday clash possible, so a photo drawn within 45
minutes of a reel slot is moved to the next clear time in the same cycle.

**Where it is configured.** The window lives on both `social_settings` *and*
`social_plans.photo_window_start/end`. That is not duplication: activating or saving a plan
calls `writeScheduleFromPlan`, which overwrites `social_settings` wholesale — without the
plan carrying the window, the first save in the planner would silently revert posting to a
fixed time with nothing on screen to say so.

### If cadence goes to 2/day

Add a fixed `13:00` slot rather than a second window. Two windows on one day would need
their own mutual collision rule, and the afternoon slot is aimed at Facebook, where the
Pakistan pattern favours 13:00–16:00 and there is nothing to vary against.

### ⚠️ Ramadan changes everything

During Ramadan the daily rhythm inverts — normal daytime peaks collapse and the largest
engagement spike is **immediately after Iftar, roughly 18:30–20:30**.

Because slot times live in `social_settings`, this is a one-row `UPDATE` for the month, not
a code change. Worth a calendar reminder; it is the single biggest seasonal swing in this
market.

---

## Cadence, against a real catalogue size

There are **20 eligible products**. That is the constraint nothing else can argue with.

| Cadence | Full rotation | Verdict |
|---|---|---|
| 1/day | 20 days | **Recommended.** Roughly monthly repeats, feels curated |
| 2/day | 10 days | Repeats every 10 days. Audience will notice |
| 2 products per post, 1/day | 10 days | Same problem, and weaker posts |
| 3/week | ~7 weeks | Safest, but too quiet to build momentum |

**Start at 1/day.** Every new product added extends the runway automatically, and the
setting is one `UPDATE` away if it should change.

A useful signal: if the rotation reaches cycle 2 and engagement on repeats holds up, the
cadence can rise. If repeats visibly underperform, the answer is more products, not more
posts.

---

## Phase 2 — Reels and video

Same rotation discipline, separate queue and cadence, because video is produced by hand
rather than generated from the database.

**Flow:** upload in `/admin/social` → stored in a `social-media` Storage bucket → caption
and hashtags attached → scheduled → posted at the next video slot → logged.

Instagram Reels requirements, from Meta's documentation:

| Requirement | Value |
|---|---|
| Aspect ratio | 9:16 |
| Duration | 5–90 seconds |
| Codec | H.264 or HEVC |
| Account | Instagram Business |
| Hosting | Must be a publicly reachable URL at publish time |

Suggested default: **2 reels per week, Tuesday and Friday, 18:00–20:00 PKT** — the window
that gives the algorithm indexing time before peak traffic. Configurable in the same way as
static posts.

Publishing a Reel is asynchronous — the container must be polled via `status_code` until
processing finishes before `media_publish` will succeed. The adapter handles this; it is
noted here because it is a common source of "it worked in testing" failures.

---

## Sources

- [Instagram Content Publishing API](https://developers.facebook.com/docs/instagram-platform/content-publishing) — Meta official, for all format and limit claims
- [Best Times to Post on Instagram — Sprout Social](https://sproutsocial.com/insights/best-times-to-post-on-instagram/)
- [Best Posting Times in Pakistan — Sherazi Marketing Solutions](https://sherazimarketingsolutions.com/what-are-the-best-posting-times-in-pakistan-for-instagram-facebook-tiktok-and-youtube/)
- [Best Time to Post on Instagram in Pakistan — My Digital People](https://mydigitalpeople.com/best-time-to-post-on-instagram-in-pakistan/)
- [Best Times To Post on Facebook — Shopify](https://www.shopify.com/pk/blog/best-time-to-post-on-facebook)

> Posting-time figures are third-party aggregate studies, not measurements of this account.
> Treat them as a sensible starting point. After ~30 posts, Meta Business Suite Insights
> will show when *this* audience is actually active, and the slot times should be updated
> from that real data rather than from any published table.
