# Occasion Agent

Automatic greeting posts — Jumma, Eid, national days, Women's Day — generated and published
without anyone touching the admin panel. Built 2026-08-21.

Separate from the product rotation on purpose. The two share nothing but `social_post_log`.

---

## 🔴 The safety rule this whole design exists for

Asked "what is 21 August 2026", web search answers **"International Day of Remembrance and
Tribute to the Victims of Terrorism"**.

An agent that searched the web and posted whatever it found would have published a styled
photograph of a white suit under that heading. So the agent **never decides what is worth
posting**. It may only post occasions listed in `social_occasions`, and `discover.ts` is
allowed exactly one question: *when is Eid this year*.

Two defences, deliberately duplicated:

1. **The allow-list.** `social_occasions` is the complete set. Nothing else is postable.
2. **The deny-list.** `DENY_PATTERNS` in `lib/social/occasion/discover.ts` blocks mourning,
   disease, disaster, conflict and politics by keyword. It lives in **code, not a table** —
   a safety rule that can be switched off through an admin toggle is not a safety rule.

---

## How it runs

pg_cron `social-occasion-agent`, every 15 minutes → `/api/cron/social-occasion` →
`runOccasionAgent()`, which is three independent phases:

| Phase | Horizon | What it does |
|---|---|---|
| **plan** | 35 days | Works out which occasions fall in the window and inserts `planned` rows |
| **generate** | 7 days | Renders artwork + captions for planned posts, max 5 per run |
| **publish** | due now | Publishes `ready` posts whose 10:00 slot has arrived |

Split into three because they fail differently. Planning is free and idempotent. Generation
costs money and takes ~40s an image. Publishing is irreversible. The gap between generation
and publishing is the window the owner has to look and reject.

**Calendar runs a month ahead, pictures a week ahead.** Rendering 30 days of images would
spend real money on posts that may be cancelled.

### Timing

- Occasion posts publish at **10:00 Asia/Karachi**.
- The product rotation is **untouched at 19:00**. Both run on an occasion day.
- `max_posts_per_day` in `social_settings` is **2**. An occasion day uses both slots. If a
  day ever carries two occasions *and* a product post, raise it to 3 or one is dropped.

### Approval

The owner chose **silence = publish**. A `ready` post goes out on its own. The admin page
offers *Regenerate*, *Don't post this*, and a *Looks good* tick that is recorded but that
nothing waits for.

---

## Files

| File | Role |
|---|---|
| `lib/social/occasion/calendar.ts` | Date maths. Pure — no DB, no API key, no network |
| `lib/social/occasion/discover.ts` | Web search for lunar dates + the deny-list |
| `lib/social/occasion/artwork.ts` | Backdrop generation and the 1080×1350 composition |
| `lib/social/occasion/caption.ts` | Caption writing and the banned-term filter |
| `lib/social/occasion/agent.ts` | plan / generate / publish |
| `lib/actions/social-occasions.ts` | Server actions for the admin page |
| `app/admin/social/occasions/page.tsx` | The Occasions tab |
| `app/api/cron/social-occasion/route.ts` | Cron entry point |
| `scripts/test-occasion-agent.ts` | `plan` · `calendar` · `generate <id>` · `publish` |

---

## Two rules the copy and artwork must keep

**The image model never renders text.** It is asked for a *textless* backdrop and every word
is drawn afterwards by sharp, from `social_occasions.greeting`. Image models still misspell,
and "JUMMA MUBRAK" on a brand account cannot be quietly fixed afterwards. Keeping type out
of the model's hands makes that impossible rather than unlikely.

**Captions are greetings, not adverts.** The owner was explicit: no sizes, no price, no
product detail, no delivery or COD. `BANNED` in `caption.ts` enforces it by dropping whole
sentences, and `isCaptionClean()` is checked **again at publish time** — a caption that
somehow acquired a price fails the post rather than publishing it. Prompting alone drifts;
asked forty times not to mention price, a model eventually mentions price.

---

## Recurrence kinds

| Kind | Example | Resolved by |
|---|---|---|
| `weekly` | Jumma, every Friday | arithmetic |
| `fixed` | 14 August, 8 March | arithmetic |
| `nth_weekday` | Mother's Day, 2nd Sunday of May | arithmetic |
| `lunar` | Eid, Ramadan, Milad un-Nabi | **web search**, cached per year |

Lunar dates are the only reason this feature touches the internet. They move ~11 days a year
and Pakistan often observes Eid a day later than Saudi Arabia, so the query says "in
Pakistan" explicitly. An unresolved lunar occasion **matches nothing and quietly does not
fire** — a missing Eid post is recoverable, an Eid post on the wrong day is not.

Verified 2026 resolutions: Ramadan 19 Feb · Eid ul-Fitr 21 Mar · Eid ul-Adha 27 May ·
Milad un-Nabi 25 Aug.

---

## Things that will bite

- **`cron.job` cannot be UPDATEd directly** on Supabase — permission denied. Use
  `cron.alter_job(jobid, active := ...)`.
- **Never plan a slot already in the past.** Switching the agent on at 14:00 originally
  planned "today", generated art and published a greeting hours late — on build day that
  would have been a *second* Jumma post on top of one published by hand. `planAhead` now
  skips any slot already passed.
- **Cancelling deletes nothing.** The row stays as `cancelled` so the unique
  `(occasion_slug, occasion_date)` constraint makes the next plan conflict instead of
  re-inserting it. Deleting would resurrect the post within 15 minutes.
- **Regeneration writes a new storage key** (`-v2`, `-v3`). Overwriting in place meant the
  CDN kept serving the picture that had just been rejected.
- **Instagram takes JPEG only.** A PNG fails at the container step with an unhelpful error.
- `lib/supabase/types.ts` does not know these tables. `admin()` casts to an untyped client
  in two places rather than regenerating types across the repo.

---

## Switching it on

1. Deploy `feat/social-occasion-agent`.
2. `select cron.alter_job((select jobid from cron.job where jobname='social-occasion-agent'), active := true);`
3. Watch `/admin/social/occasions`.

The job is currently **inactive** — the route does not exist in production until the branch
ships, and an active job would 404 every 15 minutes.

## Still open

- **Nothing tells the owner a post is coming.** They must open the tab. An email or WhatsApp
  the evening before artwork is ready would make "silence = publish" much safer.
- **No cost ceiling.** Roughly $0.04–0.19 an image, ~52 Jummas a year plus occasions. Worth
  a monthly cap once there is a month of real spend to look at.
- Occasion posts always use the product hero shot. A second photo, or a flat-lay, would vary
  the feed.
- **Father's Day is enabled** but is a weak fit for a women's clothing brand — the owner may
  want it switched off in *Which occasions*.
