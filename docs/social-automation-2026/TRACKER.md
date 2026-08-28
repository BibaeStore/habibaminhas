# TRACKER — Social Automation

**Last updated:** 2026-08-28 (tenth update — static stream built, all three streams live;
occasion posters redesigned; a broken-deploy chain found and fixed)

**Status:** ✅ **Phases 1, 1b and 2 (reels) built.** Planner built. `social-post-slots` is
`active = true` and has published **10 consecutive days without a miss** (18–27 Aug).

> ⚠️ **`approval_required` is `false`, not `true`.** It was changed on 2026-08-18. Photos
> **auto-publish** — they do not queue for review. Earlier updates in this file say the
> opposite and are wrong; this line is the current one.

## Session 2026-08-28d — the static stream, and three failed deploys

### 🔴 Three deploys had been failing and I had not noticed

The owner reported `/admin/login` not loading. The page was fine — **the last three deploys
to production had failed**, so the live site was serving code from 05:52.

```
./node_modules/@resvg/resvg-js/js-binding.js
non-ecmascript placeable asset
asset is not placeable in ESM chunks, so it doesn't have a module id
```

`@resvg/resvg-js` loads a native `.node` binary and Turbopack cannot put one in an ESM chunk.
Fix: `serverExternalPackages: ["@resvg/resvg-js"]`. sharp is externalised by Next
automatically; resvg is not on that list.

**Why local builds kept passing — the part worth remembering.** The failure is invisible on an
*incremental* build: with a `.next` holding a route graph from before the import existed, the
affected routes are not re-traced. `rm -rf .next` reproduced it first try. **A deploy is always
a clean build, so "npm run build passed" was never evidence a deploy would.** Check
`gh run list` after every push.

### The static stream (the third and last)

| Stream | Cadence | Days | Window |
|---|---|---|---|
| Reel | 4/week | Tue Thu Fri Sat | 17:30–20:00 |
| **Static** | **2/week** | **Mon Wed** | **18:00–20:00** |
| Carousel | daily | every day | 20:15–23:00 |

Statics run on the days reels do not, in the window the carousel does not. Nothing in code
enforces that — it is a schedule decision, which is why it is editable in Settings.

**Built by parametrising, not duplicating.** `runScheduledPost({ stream })`,
`selectNextProducts(settings, limit, stream)`, `resolveStaticSlots()`. Every existing caller
defaults to `"carousel"`, so nothing that already worked changed behaviour.

| File | What |
|---|---|
| `supabase/migrations/20260828_social_static_stream.sql` | `social_post_log.stream`, `social_static_order`, static schedule columns, cap 2 → 4 |
| `lib/social/select.ts` | Rotation + history scoped per stream |
| `lib/social/publish.ts` | Stream-parametrised; static gets `images[0]` only |
| `lib/social/config.ts` | `resolveStaticSlots()` |
| `app/api/cron/social-post/route.ts` | Drains statics after carousels, own try/catch |
| `components/admin/social/shared-modals.tsx` | Static + reel window editors |

### 🔴 Two bugs the design would have shipped

1. **`slotAlreadyRan` would have skipped every static post.** In window mode it asked "has ANY
   clock-time slot published today?" — correct for one stream, silently fatal for two. A
   carousel at 21:40 would make Monday's static look already-done. Hence
   `social_post_log.stream` and a per-stream guard.

2. **`max_posts_per_day = 2` would have blocked whichever ran second.** A Monday now carries a
   carousel *and* a static — exactly 2 — and the check is `today >= cap`. Raised to 4.

**Verified:** 10-day projection shows all three streams on their own days and times with no
overlap; the two rotations return different first products (Emerald Grace vs Pearl Veil), so
they genuinely walk the catalogue independently; all 58 existing log rows backfilled to
`carousel`, so a static-scoped lookup finds nothing and cannot be blocked.

---

## Session 2026-08-28c — occasion posters redesigned

The owner deleted that morning's Jumma post: it was indistinguishable from the previous
week's. They were right — and the cause was structural, not bad luck.

### Why every Jumma looked the same

`social_occasions.theme` is **one fixed string per occasion**, and `subtitle` is another. So
every Jumma Mubarak asked the image model for "serene ivory and antique gold, fine arabesque
border, faint mosque dome" and printed the same sentence beneath it. Same input, same poster,
forever. No amount of image-model randomness fixes an identical prompt.

### What changed

| Before | Now |
|---|---|
| Product photo in a mihrab arch | **No product.** A greeting greets; it does not sell |
| Logo 340px, below the arch, footer-sized | **Logo 460px, leading the frame** — on an occasion post the brand *is* the subject |
| Fixed `theme` string | Art direction **written fresh each time**, shown the last 10 motifs and told to go elsewhere |
| Fixed `subtitle` sentence | A **dua** (Islamic), advice (Mother's/Father's Day) or a considered line (international days) |
| Fixed 10:00 every time | Drawn from a **10:00–13:00** window, 15-min grid, derived from the date |

New file `lib/social/occasion/art-direction.ts`. Reuses `social_generation_log` under
`stream = 'occasion'` — the question is identical to the caption one, so it should not have a
second memory.

**Category-aware messages.** An Islamic day wants a dua; Mother's Day wants warmth about
mothers, not scripture; an international day wants a thought that respects what the day is
for. Spelled out per category rather than left to the model to infer from a name. The dua
brief explicitly bars sectarian material and Quranic verse references — a misattributed ayah
on a brand account is far worse than a plain, well-known supplication.

**The rule that did not change:** the image model still never renders text. Every word is
drawn afterwards by sharp from strings we control.

### Published live 2026-08-28 10:49 PKT

Motif "lantern lattice pearls". Dua: *"O Allah, send blessings upon Muhammad and grant us ease
in the days ahead."* with the transliteration beneath.

- Instagram — https://www.instagram.com/p/DckpjzeDsTH/
- Facebook — https://www.facebook.com/122129051318776991/posts/122133007550776991

The 4 Sep post was already `ready` with old-design artwork; reset to `planned` so it
regenerates. Future Fridays: 4 Sep 10:00 · 11 Sep 10:15 · 18 Sep 11:00 · 25 Sep 12:30.

---

## Session 2026-08-28b — the reel factory (phase 4)

### 🔴 The finding that changed the plan

`ffmpeg-static` is a **devDependency** and `canEncodeHere()` is literally
`return !process.env.VERCEL`. **The posting cron has never been able to encode a reel.** It
can only publish reels somebody already built by hand on their own machine.

That is the actual reason six approved reels sat in the queue from 12 August, and the reason
4 reels/week was unreachable — nothing was making them. The plan said "GPT writes the script,
your existing encoder builds it automatically". The second half was wrong.

### The fix: encode where ffmpeg lives

| Piece | Where it runs |
|---|---|
| Deciding when to post, talking to Meta | Vercel cron, as before |
| **Encoding reels** | **GitHub Actions runner** — has ffmpeg, 30-min clock, free minutes |
| Approving a reel | Still a human, in `/admin/social` → Reels |

**Built** — branch `feat/social-reel-factory` (on top of `feat/social-ai-captions`):

| File | What |
|---|---|
| `scripts/fill-reel-queue.ts` | **New.** Tops the queue up to a target. Idempotent — counts what is waiting and builds only the shortfall, so a double run cannot flood it. One failure does not end the run |
| `.github/workflows/reels.yml` | **New.** Mon + Thu 02:00 UTC (07:00 PKT) + manual trigger. `concurrency` group so two runs cannot race for the same next-in-rotation product |
| `lib/social/ai-caption.ts` | Generalised over streams; `writeReelCaption` with its own hook/angle/topic memory |
| `lib/social/reel/build.ts` | Reel captions from the model; **price off the end card**, following `caption_include_price` |

**Verified against real data, not mocked:** built one reel end to end — Pearl Veil, 11s,
3.69MB, queue 6 → 7, landed as `draft`, video and thumbnail in Storage,
`price_in_caption = false` where the same product's live caption that morning carried
"Rs. 5,500".

### ⚠️ Needs the owner before it runs

Three GitHub repository secrets: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
and optionally `OPENAI_API_KEY` (without it the reel still builds, the caption just falls
back). Until they exist the workflow fails on the first run.

**What this does NOT do:** publish or approve. Reels are reviewed regardless of
`approval_required` — deliberate, and unchanged. The bottleneck removed is the encoding,
not the judgement.

---

## Session 2026-08-28 — scheduler merged, AI captions built (phase 2)

**Merged to main:** `feat/social-random-slot-window`. Photos now draw one time a day from
18:00–23:00 on a 5-minute grid; `social-post-slots` ticks `*/5`. Today's first randomised
slot was 18:25 PKT.

**Built** — branch `feat/social-ai-captions`:

| File | What |
|---|---|
| `lib/social/ai-caption.ts` | **New.** Carousel captions written by `gpt-5.6-terra`. Returns null on any failure so the assembled caption still publishes |
| `lib/social/caption.ts` | `buildCaption` takes optional AI copy; price behind a flag |
| `lib/social/publish.ts` | One model call per post, shared across platforms |
| `lib/actions/social.ts` | `previewAiCaption()` — writes one, shows it, publishes nothing |
| `supabase/migrations/20260828_social_generation_log.sql` | The anti-repetition memory + two settings flags |

**Live switches, both OFF by default:** `ai_captions_enabled`, `caption_include_price`.
Nothing changes until the owner turns them on.

### Three things the live test caught that review would not have

1. **The model broke a standing owner instruction on its first run.** It wrote "available in
   Small, Medium, and Large" and "Stitched in small runs in Karachi" — both forbidden since
   2026-08-09 (no sizes, no piece counts, no place of manufacture). Sizes are now withheld
   from the prompt entirely, and `INVENTORY_PATTERNS` rejects them at publish time.
   **Instruction alone is not a control.**
2. **The first guard was too blunt.** Bare `(small|medium|large)` would have rejected
   "large floral motifs" and "medium-weight cotton". Narrowed to actual disclosure shapes —
   size lists, "available in Medium", "made in Karachi".
3. **Six consecutive captions all ended on washing instructions.** Care is the safest answer
   in every product's FAQ list. `faq_topic` is now stored and fed back, and topics rotate:
   fit, technique, styling, dupatta, fabric feel.

**Measured after the fixes:** 6 products, 6/6 accepted, 6 distinct angles, 6 distinct FAQ
topics, no price/size/origin leaks.

**Cost:** ~$0.90/month at 31 carousels. Captions were never the expensive part.

---

## Session 2026-08-27 — audit, and the randomised posting window

**Audited first, against the live database rather than these docs.**

| Working | Evidence |
|---|---|
| Daily photo post | 10 consecutive days, 18–27 Aug, every one at 19:00–19:01 PKT |
| Instagram | 21 posts, 0 failures |
| Facebook | 21 posts, 0 failures |
| Occasion agent | published 25 Aug 10:00 PKT |
| Reels | 1 scheduled drain, 24 Aug 20:00 PKT |

| Not working | Severity |
|---|---|
| **Pinterest fails daily** — 6 consecutive failures 22–27 Aug, "Apps with Trial access may not create Pins in production". Still blocked on Standard access | 🔴 |
| **6 approved reels backlogged**, oldest approved 12 Aug. Drains 1 per slot, 2 slots a week | 🟡 |
| Active plan "August Plan" expires **31 Aug**. Nothing breaks — `active_to` is not enforced by the scheduler, the compiled settings simply persist — but the planner will show an expired plan governing live posting | 🟡 |
| `META_SYSTEM_USER_TOKEN` still not rotated (pasted into a transcript 9 Aug) | 🟡 |

**Built** — branch `feat/social-random-slot-window`:

| File | What |
|---|---|
| `lib/social/slot-window.ts` | **New.** Pure module. Derives one posting time per calendar date from a window. No clock, no DB, no state |
| `lib/social/config.ts` | `resolvePhotoSlots()` — today's times, window or fixed |
| `lib/social/publish.ts` | Uses the resolver; `slotAlreadyRan` made window-aware |
| `lib/social/plan.ts` | Window carried through `compilePlan`, capacity arithmetic, and the calendar preview |
| `lib/actions/social-plans.ts` | Window survives duplicate + compile |
| `components/admin/social/ui.tsx` | `SlotWindowEditor`, shared by all three schedule screens |
| `supabase/migrations/20260827_social_random_slot_window.sql` | Additive columns + the first window seed |
| `supabase/migrations/20260827_social_window_three_minute_step.sql` | 18:00–23:00, first attempt at a 3-min step |
| `supabase/migrations/20260828_social_window_five_minute_step.sql` | **Current.** Settles on 5 min + `*/5`, which is overlap-safe |

**Live config now:** `slot_window_start = 18:00`, `slot_window_end = 23:00`, step **5 min**,
`social-post-slots` on **`*/5`** — 61 possible times, every one used before any repeats,
**minimum 37 days** between repeats. Measured over 10 years: **0 of 3,621 rolling 30-day
stretches contains a repeated time**, which is the owner's actual requirement, plus zero
photo/reel clashes. Reels are untouched (Mon/Fri 20:00).

**Why 5 and not 3.** Both meet the spacing requirement, but the route declares
`maxDuration = 300` and the duplicate guard only bites once the first `social_post_log` row is
written — which is *after* Instagram publishing finishes, ~50s into a run. A tick under 300s
can fire mid-upload and post twice; at `*/5` the platform's own ceiling makes overlap
impossible. 5 min had been rejected earlier at 86% repeat-free months, but that was an
algorithm limit (see below), not arithmetic.

**The research question, answered:** a fixed daily time is *not* something Meta penalises.
Publishing via the Content Publishing API is sanctioned, the documented ceiling is 100 API
posts/24h, and Mosseri has stated scheduled posts are not down-ranked. The reason to vary
the time is coverage and measurement, not ban risk. Detail in `03-CONTENT-AND-SCHEDULE.md`.

**The cron tick was the real constraint, and it moved.** The first pass kept `*/15`, which
caps an evening window at 21 times — fewer than the 30 a month needs, so unique-times-per-month
was unreachable no matter how wide the window. Widening does not help; only a finer step does,
and the step is meaningless unless the job wakes up that often. `social-post-slots` is now
`*/5` and the step is 5 minutes, which is what makes the 100% figure above true.

**The spacing algorithm was rebuilt twice, and both rewrites came from measurement.**

1. *Independent per-cycle shuffles + a seam repair.* Capped the minimum gap at `floor(N/3)+1`,
   so a repeat-free month needed N ≥ 90 and therefore a 3-minute tick.
2. *Reel clashes resolved by trading two days after the cycle was built.* Looked correct;
   measured, it dropped the minimum gap from 37 days to **6**, because a trade moves a time to
   a position the spacing rule never sanctioned.

Now: cycles are **chained under a displacement bound** (a time may drift later freely but never
jump more than `N - G` places earlier), and reel-safe times are chosen **as each position is
filled**, inside the chain. Both guarantees then hold by construction at N=61.

⚠️ **The step and the cron schedule must always be changed together.** `slot_window_step_minutes`
is displayed read-only in the admin for this reason. A finer step alone just rounds every draw
up to the next tick.

## 🔴 Open right now — read first

| # | Issue | Severity |
|---|---|---|
| 1 | **Production code is out of sync with the live database.** The `social_platforms` column rename is applied to production, but the code that reads it is on an unmerged branch. **Reel publishing from the live admin is broken** until `feat/social-restructure` is deployed | 🔴 High |
| 2 | Nothing from 2026-08-12 is committed or pushed. Branch `feat/social-restructure` | 🟡 |
| 3 | `META_SYSTEM_USER_TOKEN` was pasted into a chat transcript on 2026-08-09 — **still not rotated** | 🟡 |
| 4 | New Meta app contact email is `bibaestore@gmial.com` (typo), and ToS / data-deletion URLs still point at `facebook.com` | 🟡 |

### Current live configuration — verified 2026-08-12

| Setting | Value |
|---|---|
| Active plan | **"August Plan"**, 12 → 31 Aug |
| Photos | 7/week · every day · 19:00 |
| Reels | 2/week · Mon & Fri · 20:00 |
| `social_settings.enabled` | `true` |
| `approval_required` | `true` — **photos queue for review, they do not auto-publish** |
| `max_posts_per_day` | 2 |
| pg_cron `social-post-slots` | **`active = true`** (enabled 2026-08-12; had never run before) |
| Platforms — photos | Instagram ✅ Facebook ✅ |
| Platforms — reels | Instagram ✅ Facebook ✅ |

---

## Session 2026-08-13 — Pinterest connect flow

**Built** (uncommitted, same branch):

| File | What |
|---|---|
| `lib/social/adapters/pinterest.ts` | OAuth token exchange + **lazy** refresh, account, boards, image pins, 4-step video pins |
| `app/api/social/pinterest/callback/route.ts` | OAuth callback with `state` verification |
| `lib/actions/social-pinterest.ts` | Connect / disconnect / list boards / choose board / create board / test |
| Platforms modal | Connect button, connected account, board picker, expiry warning |
| Migration `pinterest_platform_capabilities` | `supports_photo` + `supports_video` = true; both `*_enabled` left **false** |

**Three decisions worth recording:**

1. **Refresh is lazy, not scheduled.** Checked before every call, refreshing if under a day
   remains. A cron job is one more thing that can stop unnoticed — and this project has
   already had a pg_cron job sit inactive for days without anyone spotting it.
2. **The board lives on the connection**, in `social_accounts.meta`, not per post.
   Pinterest has no concept of a pin without a board.
3. **`setPlatformEnabled` refuses to switch Pinterest on** without both a token and a board,
   server-side. Otherwise it fails on every scheduled run instead of once, clearly, now.

**Not done:** publishing is **not wired**. `publish.ts` still carries a hardcoded
`p === "instagram" || p === "facebook"` filter — the same pattern already removed from the
reel publisher — so a pin would never be attempted even with the platform enabled.

**Owner setup outstanding:** business account, app registration, both redirect URIs
(production *and* `localhost:3000`, so it can be connected without deploying), scopes, and
`PINTEREST_APP_ID` / `PINTEREST_APP_SECRET`.

---

## Session 2026-08-12 — admin rebuilt, planner, scheduler on

### What shipped (all on `feat/social-restructure`, **not committed**)

**The admin was reorganised, because it had become two applications sharing a URL.** A photo
post's life ran across three tabs (Schedule → Review queue → Posts) while a reel's whole
life sat inside one tab with private sub-tabs. The same question had two different answers
depending on which content type you asked about.

Now **three pages**, with everything shared behind header buttons:

```
/admin/social          Posts     [Upcoming | Review | Published]
/admin/social/reels    Reels     [Upcoming | Upload | Review | Published]
/admin/social/planner  Planner
                       header → Platforms · Collaborators · Posting rules (modals)
                       header → active plan badge, opens that plan's week
```

- `/admin/social/settings` was **deleted** — it became modals. On a page, the schedule sat
  under two long scrolling lists where nothing suggested it existed.
- Sub-tabs replaced stacked sections: reaching "Published" no longer means scrolling past
  everything upcoming and everything awaiting review.
- Published items are **tables with a detail popup** rather than editable cards. An
  Instagram caption cannot be edited in place anyway, so every historical post carried a
  textarea that did nothing.
- The week **calendar** is now the primary "Upcoming" view — past days show what actually
  published, future days show what the plan lays out.

### Schema changes (applied to production directly via MCP)

| Migration | What |
|---|---|
| `social_platforms_per_content_type` | Dropped `enabled` + `supported`. Added `supports_photo`, `supports_video` (capability) and `photo_enabled`, `video_enabled` (choice) |
| `social_settings_post_days` | Added `post_days`, `reel_days`, `reel_times` |

> 🔴 **Both are applied to the production database while the code that reads them is
> unmerged.** See "Open right now" at the top. The photo path survives on a fallback to
> `settings.platforms`; **reel publishing from the live admin does not.**

### Bugs found and fixed

1. **Platform targeting was one flag for two content types.** A single `enabled` column
   governed photos *and* reels, so switching on a video-only platform such as TikTok would
   also have aimed static posts at it. The reel publisher papered over this with a
   hardcoded `key in ('instagram','facebook')` filter — and its dispatch was
   `platform === "instagram" ? … : publishFacebookReel(…)`, so **any** future platform
   would have silently posted to the Facebook Page. Dispatch is now an explicit `switch`
   with an unknown-platform branch.
2. **`ReferenceError: PlanRow is not defined` — the planner was completely broken.** A type
   *re-export* (`export type { PlanRow }`) inside a `"use server"` file; Next's server-action
   transform emits it as a runtime re-export of something that only exists at compile time.
   **`tsc`, `eslint` and `next build` all passed** — it only failed when the server ran.
   *Lesson: build-clean is not run-clean for server actions.*
3. **`spawn \ROOT\node_modules\ffmpeg-static\ffmpeg.exe ENOENT` — the Generate button never
   worked.** `ffmpeg-static` computes its path as `path.join(__dirname, …)`, and Next's
   bundler rewrites `__dirname` to `/ROOT`. The CLI script always worked because tsx does
   not bundle. `resolveFfmpeg()` now treats the exported path as a hint and falls back to
   `process.cwd()/node_modules/...`, erroring with both paths named.
4. **Upload captions were identical for every upload on the same day.** `buildUploadCaption`
   seeded from *the current date*. It now takes an explicit variant over **432**
   combinations, and the caller picks the least recently used by checking existing captions.
5. **Feedback rendered off-screen.** Action results appeared at the top of a long page, so a
   button pressed near the bottom looked dead whether it worked or failed — this is what
   hid bug 3 for hours. Replaced with a fixed toast plus inline progress.
6. **No concept of a week anywhere.** `slot_times` said what time of day but nothing said
   which days, so every time fired every day and no weekly target could be held to.
   `findDueSlot` now gates on `post_days`, and Posting rules has a day picker.
7. **`publishApprovedReels` was dead code.** It existed but nothing called it, so an
   approved reel sat in `approved` forever. Now wired into the cron as `runScheduledReels`,
   on its own days/times, in its own `try/catch` so a reel failure cannot stop the photo post.

### Scheduler switched on

`social-post-slots` moved from `active = false` to **`active = true`**. Its
`cron.job_run_details` was **completely empty** — it had never run once since being created.
`approval_required` was deliberately left `true`, so the first days produce review items
rather than live posts.

### Not done

- **R-6 audio** — untouched.
- **Month view** — only a week calendar exists.
- **Post types** (educational / awareness / promotional) — the owner asked for these in the
  planner; deferred by agreement until the planner itself settled. Needs an artwork
  decision: auto-rendered cards vs owner-supplied.
- Nothing committed.

---

### 🔄 Meta app migrated — 2026-08-11

The original app `1599028448679664` stopped issuing usable tokens. The owner created
**"Bibae Social Automation App" `4259780697609294`** and `.env.local` was repointed at it.
Page and Instagram IDs are unchanged — they are *business* assets, not app assets.

Getting the token right took three attempts, and the reason is worth recording because it
is not obvious from any error message:

> **A token's scopes are frozen at the moment it is generated.** Adding a product to the
> app afterwards does not upgrade an existing token. And a permission the app has no
> product for is never even *offered* in the generation dialog. So the order is strictly:
> add product → assign asset → **generate a new token** → paste.

| Attempt | Scopes | Result |
|---|---|---|
| 1 | 3 — `pages_show_list`, `business_management`, `public_profile` | Container creation failed, code 10 |
| 2 | 7 — added the Instagram set | ✅ Instagram worked; Facebook still blocked |
| 3 | **21** — added `pages_manage_posts`, `instagram_manage_contents` + more | ✅ **Both platforms working** |

Verified by `scripts/social-preflight.ts` reaching `FINISHED`, and by checking the **minted
Page token** directly — it inherits the System User's scopes, so that, not the System User
token alone, is the real test for Facebook.

**Useful diagnostic:** call `debug_token` with an **app** access token
(`{app-id}|{app-secret}`). Asked with the token itself it returns a thin response with no
scope list, which makes a permissions problem look like something else entirely.

> ⚠️ Still outstanding on the new app: contact email is `bibaestore@gmial.com` (typo for
> `gmail.com`, which is why it will not verify), and **Terms of Service** and **User data
> deletion** both still point at `facebook.com`.

### 🔴 Meta negative-caches a failed media URL — 2026-08-11

**The most expensive finding so far. Read this before debugging any `2207052`.**

Emerald Grace published to Facebook but failed on Instagram with
`9004 / 2207052 — "Only photo or video can be accepted as media type."` That message is
actively misleading: it is not a format complaint, it means *"I could not download that
URL"*.

The derivatives were flawless — verified byte-wise as JPEG, 1080×1350, ratio exactly
0.8000, sRGB, progressive, ~145 KB, and `curl` returned HTTP 200 `image/jpeg`. Retrying
still failed, minutes later, every time.

The proof:

| Request | Result |
|---|---|
| bare URL | **400** — `2207052` |
| **identical file** + `?v=<timestamp>` | **200** — container created |

**Once Meta fails to fetch a URL, it caches that failure against the exact URL.** A single
transient CDN-propagation miss poisons that URL permanently. No amount of waiting or
retrying recovers it, because every retry replays the same poisoned URL — which is why the
existing `2207052` retry logic could never have worked.

**Fix:** `uncachedUrl()` in `adapters/types.ts` appends a unique `?v=` to every image URL,
generated *inside* the retried function so each attempt is a genuinely new resource.
Applied to Instagram containers and Facebook photos. Supabase Storage ignores unknown query
parameters and serves the same object.

This also explains the earlier history: the very first post succeeded only because its
derivatives had been generated by a dry run twenty minutes earlier and were fully
propagated. `waitUntilFetchable` in `images.ts` HEADs each derivative, but that proves
*our* edge has the object — Meta fetches from its own infrastructure and can hit an edge
that does not.

### 🐛 Two more silent bugs found and fixed — 2026-08-11

Both had the same signature: a feature that looked built, reported no error, and had
**never once worked**.

1. **Collaborators never fired.** `approval_required = true` means every post goes out via
   the review queue, but `publishApproved` and `publishLogEntry` called `publishOne`
   without passing `collaborators`. The field was optional on `PublishInput`, so TypeScript
   never complained, and Meta returns no error for a missing `collaborators` parameter.
   Confirmed against the live API: all three published posts had **no** collaborator
   attached. Fixed at both call sites, and the field is now **required** — passing `[]`
   means "none", so forgetting it is a compile error rather than a silent no-op. The
   toggle behaviour is unchanged and still fully dynamic.
2. **Drag-and-drop order never persisted.** Dropping a row only mutated local React state;
   saving required a separate "Save order" button below the list. `social_queue_order` was
   empty, so publishing fell back to automatic rotation — the order the owner arranged was
   ignored. The drag now **saves on drop**, and the list re-syncs in place with no page
   reload. Verified: pinning the 3rd product moves it to position 1 in the real selection.

`selectNextProducts` was correct throughout — it honours pins properly. It was simply
never given any.

### ✅ App published to Live mode — 2026-08-10

`app_status: live_mode`, `is_live: true`.

**Why this mattered.** Posts published while the app was in Development mode were visible
only to *role users* — the owner saw them, nobody else did. Meta's App Modes doc:

> "Any data generated while an app is in Development mode, such as test posts, can only be
> seen by role users. However, that data will be visible to non-role users once the app is
> switched to Live mode."

Confirmed after publishing: a logged-out fetch of the Facebook post now returns the caption
text, where before it rendered "This content isn't available right now".

**The Live-mode caveat was unfounded.** Meta's App Review tutorial hints that Live mode
restricts an app to App-Review-approved permissions, which would have broken Standard
Access. It does not. Preflight re-run immediately after publishing reached `FINISHED` on a
real carousel container. **Standard Access keeps working in Live mode for a System User.**

Settings required to publish (all now set): app icon 1024×1024, privacy policy URL,
category `BUSINESS`. Business verification was already passing.

> ⚠️ Two placeholders still point at `facebook.com` and should be corrected:
> **Terms of Service URL** → `https://habibaminhas.com/legal/terms/` and
> **User data deletion** → `https://habibaminhas.com/contact/`.
> Contact email `ummstyle989@gmail.com` is also still unverified.

### ❌ App Review — not needed, submission abandoned 2026-08-10

A draft submission requested `pages_show_list`, `business_management` and `public_profile`.
**None of those publish anything** — publishing uses `instagram_content_publish` and
`pages_manage_posts`, neither of which was in the submission, and both of which already
work on Standard Access.

It also could not have passed. Meta requires the screencast to "capture the entire login
flow, from logged-out to logged-in", and this app has **no login flow by design** — it
authenticates with a System User token, server-to-server. Meta's own guidance is that apps
with no login may only request `instagram_basic` and `instagram_manage_comments`.

Do not revive this unless publishing actually starts failing with a concrete permissions
error — which would make a far stronger submission than a speculative one.

### 🚀 First post — 2026-08-09

Product: **Apricot Weave – 2-Piece Cross-Stitch Embroidered Suit with Printed Trousers**

| Platform | Post ID | Permalink |
|---|---|---|
| Instagram | `18090519251398160` | https://www.instagram.com/p/Db0zSoBFZ9o/ (HTTP 200) |
| Facebook | `1065982543267666_122128733630776991` | https://www.facebook.com/1065982543267666_122128733630776991 |

3-image carousel, 638-char IG caption, 11 hashtags. IG publishing quota moved 0 → 1,
confirming the publish was counted. Rotation advanced to **cycle 1 · 1 of 20**, and the
posted product correctly dropped out of the queue (Midnight Gold is now next).

**Both previously-open questions are now closed:**
1. ✅ Standard Access genuinely carries `instagram_content_publish` — **App Review was
   never needed**, as researched.
2. ✅ A System User token *is* accepted despite the Page's 2FA requirement — the
   undocumented combination works.

> 🔴 **Major correction, 2026-08-09:** **App Review is NOT required for this project.**
> Meta's App Review page for the Instagram API states it explicitly: *"My app is only for a
> business I own or manage" + Facebook Login → Standard Access → App Review **Not required***.
> Business Verification also drops away (it is tied to Advanced Access only).
> **This removes the 2–4 week blocker that the original plan treated as the critical path.**
> Unproven until a real post lands — Meta warns Standard Access has "limited scope" — but if
> it fails we lose days, not weeks, because everything else will already be built.

Single source of truth for what is live, approved, or still only an idea. Update whenever
something moves.

| Symbol | Meaning |
|---|---|
| ✅ | Live |
| 🟡 | Built, not firing |
| 🔵 | Approved, not started |
| ⬜ | Proposed — no approval yet |
| 🚫 | Blocked |

---

## Phase 0 — Owner setup (blocks everything)

| # | Task | Owner | Status | Notes |
|---|---|---|---|---|
| ~~S-0~~ | ~~Start Meta App Review~~ | — | ❌ **removed** | Not required — see correction at top |
| S-1 | Business Portfolio ID | Owner | ✅ | `1066837099848877` |
| S-2 | Facebook Page ID | Owner | ✅ | `1065982543267666` |
| S-3 | Instagram → Professional, linked to Page | Owner | ✅ | Professional (Clothing/Brand), linked. IG Business Account ID `1781144735931039` |
| S-3b | Page Publishing Authorization (PPA) | Owner | ✅ | **Not required.** Not offered in this Page's Authorizations list; only restricted-ad-category items present. Meta applies PPA selectively — you cannot complete a flow it has not opened. Watch item only |
| S-3c | 2FA on managing Facebook account | Owner | ✅ | Enabled via SMS. ⚠️ See open question below re: System User tokens |
| S-4 | Create Meta Developer App | Owner | ✅ | `Habiba Minhas Social Automatio` — App ID `1599028448679664` |
| S-4b | **Grant the app to DevTools MCP on the consent screen** | Owner | ✅ | Granted `read` + `manage`, role admin |
| S-5 | Add products: Instagram (Facebook Login) + Facebook Login for Business | Owner | ✅ | Implied — token carries the IG + Pages scopes |
| S-6 | Create System User + assign assets + token | Owner | ✅ | `HabibaMinhas Automation`, ID `122095813617439509`. Page assigned with full tasks. **Non-expiring token accepted** |
| S-7 | Hand over remaining env values | Owner | 🟡 | Token + App ID received. `META_APP_SECRET` still outstanding (needed for token refresh + `appsecret_proof`) |
| S-8 | Answer the 6 decisions | Owner | ✅ | Answered 2026-08-09 — see below |

### Confirmed IDs — all verified live against the Graph API, 2026-08-09

```bash
META_APP_ID=1599028448679664
META_FB_PAGE_ID=1065982543267666
META_BUSINESS_PORTFOLIO_ID=1066837099848877
META_IG_BUSINESS_ACCOUNT_ID=17841447359531039   # derived from the Page — see warning
# META_SYSTEM_USER_TOKEN — held, non-expiring, SYSTEM_USER type
# META_APP_SECRET       — still outstanding
```

> ⚠️ **The Instagram ID supplied by hand was wrong.** Given as `1781144735931039`; the real
> value derived from the Page is **`17841447359531039`** (two transcription errors — a missing
> `4` and a missing `5`). **Always derive it** via
> `GET /{page-id}?fields=instagram_business_account` rather than transcribing it. The wrong ID
> fails with `GraphMethodException` code 100 subcode 33, which reads like a permissions problem
> and would have cost real debugging time.

Secrets (`META_APP_SECRET`, `META_SYSTEM_USER_TOKEN`) go to `.env.local` + Vercel env only,
never into the repository — same handling as `SUPABASE_SERVICE_ROLE_KEY`.
**The current token was pasted into a chat transcript on 2026-08-09 — rotate before go-live.**

### ✅ Live verification results (2026-08-09)

| Check | Result |
|---|---|
| Token type | `SYSTEM_USER` — correct, not a personal token |
| Token validity | `is_valid: true` |
| **Token expiry** | **`expires_at: 0` — never expires.** Non-expiring tokens were *not* refused for this business |
| Scopes present | `instagram_content_publish`, `pages_manage_posts`, `instagram_basic`, `pages_read_engagement`, `pages_show_list`, `business_management` + 14 more |
| Page | `Habiba Minhas` — assigned to the System User |
| Page tasks | `CREATE_CONTENT`, `MANAGE`, `MODERATE` (+ ADVERTISE, ANALYZE, MESSAGING) — the exact trio publishing requires |
| Instagram | `@habibaminhas.official` — 225 followers, 46 posts |
| `content_publishing_limit` | **Returned live data** — `quota_total: 100`, `quota_usage: 0` |
| Compliance | `compliant` — zero violations, zero required actions |
| App status | `dev_mode`, `is_live: false`, no privacy-policy URL, contact email unverified |

### 🎯 Standard Access thesis — CONFIRMED empirically

`devtools_app_review → privileges` shows nearly every permission as `REJECTED` /
`access_level: "none"`, which looks alarming. **It is a red herring.** That table reports
**Advanced Access / App Review** state only, and this app has never submitted a review, so
"rejected" is simply the unset default (all `rejection_reasons` are empty `{}`).

The live token tells the real story: it **carries `instagram_content_publish` and
`pages_manage_posts`**, and a call to `content_publishing_limit` — an endpoint gated behind
`instagram_content_publish` — **returned real data**. Standard Access is working.
**App Review is confirmed unnecessary.** Only a real published post remains to prove it end
to end (B-15).

### Decisions (S-8), answered 2026-08-09

| # | Decision | Answer |
|---|---|---|
| 1 | Posting cadence | **1 per day** |
| 2 | Products per post | **1** |
| 3 | Caption language | **English + one Urdu / Roman-Urdu line** |
| 4 | Post out-of-stock products | **No** — `require_in_stock = true` |
| 5 | Other categories now | **No** — `categories = {ladies-suits}` |
| 6 | Caption approval | **Review queue for 2 weeks**, then automatic (`approval_required = true` initially) |

These map directly onto `social_settings` defaults, so B-1 is unblocked.

### The login path is forced, not chosen

Meta: *"your app can either use Facebook Login or Instagram Login **but not both**."* Because we
also publish to the Facebook Page, we must take **Instagram API with Facebook Login**
(`graph.facebook.com`; scopes `instagram_basic`, `instagram_content_publish`,
`pages_read_engagement`, `pages_manage_posts`). All required scopes are on Meta's supported
System User scope list — confirmed.

### Open questions to prove empirically (not blockers, but do not assume)

1. **Standard Access is genuinely sufficient.** Meta warns "some features might not work
   properly" on Standard Access without saying which. Prove with a real post.
2. **A System User token satisfies the Page's 2FA requirement.** Meta says the *Facebook User*
   must have performed 2FA; a System User has no login and cannot. Undocumented combination.

---

## Phase 1 — Static product posts (buildable during App Review)

| # | Task | Status | File |
|---|---|---|---|
| B-1 | `social_*` tables + migration | ✅ | migration `social_automation_schema` |
| B-2 | Rotation selection query | ✅ | `lib/social/select.ts` |
| B-3 | WebP → JPEG derivative pipeline | ✅ | `lib/social/images.ts` |
| B-4 | Caption + hashtag generator | ✅ | `lib/social/caption.ts` |
| B-5 | Instagram adapter (carousel + single) | ✅ | `lib/social/adapters/instagram.ts` |
| B-6 | Facebook adapter | ✅ | `lib/social/adapters/facebook.ts` |
| B-7 | `/api/cron/social-post` route | ✅ | `app/api/cron/social-post/route.ts` |
| B-8 | pg_cron schedule (every 15 min) | 🟡 | job `social-post-slots` — **created INACTIVE** |
| B-9 | `/admin/social` — Schedule tab | ✅ | `app/admin/social/page.tsx` |
| B-10 | `/admin/social` — Posts history | ✅ | same |
| B-11 | Approval / review queue | ✅ | same |
| B-12 | UTM tagging | ✅ | `lib/social/config.ts` → `productUrl()` |
| B-16 | Dry-run harness | ✅ | `scripts/social-dry-run.ts` |

### Verification run 2026-08-09

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx eslint` (all new files) | ✅ 0 errors, 0 warnings |
| `npm run build` | ✅ compiled; `○ /admin/social`, `ƒ /api/cron/social-post` |
| Dry run — rotation | ✅ cycle 1, 0 of 20 posted, correct ordering |
| Dry run — captions | ✅ IG 639/2200 chars · FB 765/2200 · 11 hashtags each |
| Dry run — images | ✅ **1080×1350, ratio exactly 0.8000, JPEG, 183–204 KB** |
| Supabase security advisors | ✅ only intentional INFO (`rls_enabled_no_policy`); zero new WARNs |
| Production sitemap | ✅ 158 URLs, unchanged |
| Production metadata + JSON-LD | ✅ intact |
| Storefront files touched | ✅ **none** |

### Deployment checklist (owner)

1. Add the 6 `META_*` env vars to Vercel (Production + Preview).
2. Deploy the branch.
3. `/admin/social` → **Post now** — writes a pending row, publishes nothing yet.
4. Review queue → **Approve & publish** → this is B-15, the first real post.
5. If it lands: activate the cron —
   `SELECT cron.alter_job((SELECT jobid FROM cron.job WHERE jobname='social-post-slots'), active := true);`
6. Then flip `social_settings.enabled = true` (or the **Enable automation** button).
7. Rotate `META_SYSTEM_USER_TOKEN` — it was pasted into a chat transcript on 2026-08-09.
| B-14 | **Token refresh + expiry monitoring** | ⬜ | S-7 · 🆕 see below |
| B-15 | **First real test post** | ⬜ | proves both open questions above |
| B-13 | **Go live** | ⬜ | B-15 — **no longer blocked on App Review** |

### B-14 — token refresh: **downgraded to a safety net** (2026-08-09)

**The issued token is non-expiring** (`expires_at: 0`, confirmed via `debug_token`), so this
business was *not* forced onto 60-day tokens. B-14 drops from mandatory to defensive: keep the
expiry check and alerting, skip the scheduled refresh job until it is ever needed. Tokens can
still be invalidated for non-time reasons, so the monitoring stays.

The original concern, retained for context — Meta's wording on
`set_token_expires_in_60_days`:

> "Recommended. Expiring tokens are a security best practice. **Some businesses must use
> expiring tokens. If this requirement applies to your business, omitting this parameter or
> setting it to false results in an error.** All integrations should adopt expiring tokens to
> align with evolving platform security standards."

So a non-expiring token may simply be refused. Build refresh from day one:
`GET /oauth/access_token?grant_type=fb_exchange_token&client_id=…&client_secret=…&set_token_expires_in_60_days=true`,
plus an expiry check that alerts before it lapses. A System User is still the right choice —
it survives password changes and session revocations, which a personal token does not.

### API constraints confirmed from Meta's error-code table

These are hard limits the adapter must enforce *before* calling the API:

| Error | Constraint |
|---|---|
| `36003 / 2207009` | Aspect ratio must be **4:5 → 1.91:1**. ⚠️ Planned 1080×1350 **is exactly 4:5** — the tallest permitted. Generate exact dimensions so the ratio is precisely 0.8 |
| `36000 / 2207004` | Image must be **< 8 MiB** |
| `36004 / 2207010` | Caption **≤ 2,200 chars**, **≤ 30 hashtags**, **≤ 20 @tags** |
| `2207028` | Carousel needs **2–10 items** — a 1-image product must post as a single image, so the adapter needs both paths |
| `9004 / 2207052` | Media URI must be publicly fetchable at publish time |
| `2207008` | Transient — retry 1–2× within 30s–2min, then rebuild the container |
| `9 / 2207042` | Daily publishing cap reached |
| `25 / 2207050` | IG account restricted/checkpointed — needs manual sign-in to clear |

**`social_post_log.error` must store the full error object** — `code`, `error_subcode` and
`fbtrace_id`, not just the message. The subcode is what separates "retry in 30 seconds" from
"stop for the day" from a future PPA block (which has **no dedicated error code** and would
surface as a generic `code: 200` OAuthException).

---

## Phase 1b — Owner-requested extras (shipped 2026-08-10)

Built in commit `6926c2d`. [04](./04-COLLABORATORS-MUSIC-CONTROL.md) documents the research
behind these.

| # | Task | Status | Notes |
|---|---|---|---|
| C-1 | Collaborators tab + `social_collaborators` | ✅ | Cap of 3 enforced in app code. **Publish path fixed 2026-08-11** |
| C-2 | Platform registry + `social_platforms` | ✅ | 9 platforms seeded; only Instagram + Facebook `supported` |
| C-3 | Post control — delete / archive / restore | ✅ | Per-platform checkboxes; archives rather than destroys |
| C-4 | Repost with fresh caption | ✅ | The only way to correct a live Instagram caption |
| C-5 | Drag-and-drop queue order | ✅ | **Save-on-drop fixed 2026-08-11** |
| C-6 | Schedule polish — time pickers, category checkboxes | ✅ | |

---

## Phase 2 — Planner, Reels, video and audio

📄 **Full plan: [05-PLANNER-REELS-AUDIO.md](./05-PLANNER-REELS-AUDIO.md)** — raised by the
owner 2026-08-11, who asked why the social tab has no planner for scheduled posts, reel
counts, videos and audio.

Short version: *scheduling and post counts already exist* (as slots per day). Reels, video
and audio genuinely did not, and **audio is blocked behind video** — Instagram only allows
audio on Reels, and a static image has no audio track to attach one to.

> ⚠️ **Numbering warning.** Doc 05 tracks this work as **R-0…R-7**. The git commits call
> the same work **"Phase 1–4"**, which is a *different scale* — commit "Phase 1" is R-2.
> Trust the R-numbers below; the commit titles are misleading.

| # | Task | Status | Where |
|---|---|---|---|
| R-0 | Trending-audio probe | ✅ **Done — negative result** | `1fa96d3` · doc 05 §1 |
| R-1 | `social_media_queue` + `social_plans` + `social-media` bucket | ✅ | `1fa96d3` |
| R-2 | Reel builder, Format A (one product) | ✅ | `74e8c00` ("Phase 1") |
| R-3 | Reels review desk | ✅ | `c9229d5`, `36cbf87` ("Phase 2") |
| R-4 | Publish reels to Instagram **and** Facebook | ✅ | `d4fc328`, `cd37522`, `35bfbc4` ("Phase 3") |
| R-5 | Format B (collection reel) | ✅ | `fa41bad` ("Phase 4") |
| **R-6** | **Audio library + mixing** | ⬜ **Not started** | `social_audio_tracks` does not exist |
| R-7 | Planner + plan-driven scheduling | ✅ | uncommitted, branch `feat/social-restructure` |

**R-6 is the only part of doc 05 still unbuilt.** It needs a one-time licensed music
library seeded into the `social-media` bucket — see doc 05 §2 for why trending audio is not
available to any API.

---

## Phase 3 — More platforms

Each is one adapter file plus one `social_accounts` row. Sequenced by how well each
tolerates automation.

> **What makes a platform hard is the auth model, not the API.** Meta is uniquely easy: a
> System User token never expires and needs no login flow. TikTok, Pinterest, YouTube and
> Threads all require user OAuth plus a refresh that must run forever. **That machinery is
> built once and reused** — whichever of them comes first pays for the rest.

| Platform | Automation friendliness | Status | Note |
|---|---|---|---|
| **TikTok** | Medium — API exists, but **audit gates all public reach** | 🔵 **Researched 2026-08-12 — [06-TIKTOK.md](./06-TIKTOK.md)** | **Video only** by owner decision. App `7673180229468211201` created 2026-08-12, still Draft. Needs OAuth + 24h token refresh |
| **Pinterest** | **Good — the easiest left** | 🟡 **Connect flow + adapter BUILT 2026-08-13.** Blocked on owner setup; publishing not yet wired | **Trial mode is limited to the app owner's own account — which is all we need**, so no review, exactly as Standard Access made Meta App Review unnecessary. Best audience fit remaining, and pins carry a link to the product page so it sends *traffic* rather than only reach. Access token 30d, refresh 60d **refreshable indefinitely**. No domain verification needed for pin media |
| **YouTube Shorts** | Medium — Google OAuth, upload is a sensitive scope | ⬜ | **Our 9:16 MP4 reels upload as-is with no re-encoding.** Quota ~6 uploads/day, far above need |
| **Threads** | Medium — **not as easy as being Meta suggests** | ⬜ | Separate app review (2–6 weeks), separate scopes, Tech Provider Verification. Text-first, so a weak fit for garments. 250 posts/24h |
| LinkedIn | Good — official API | ⬜ | Weakest audience fit for this brand |
| X / Twitter | Medium — API is paid at useful tiers | ⬜ | Check current pricing before committing |
| Reddit | **Poor fit** | ⬜ | Automated promotion gets accounts banned. Manual only |
| Quora | **Poor fit** | ⬜ | Same. Answer real questions by hand |
| WhatsApp | **Not a posting platform** | 🚫 | Cloud API messages opted-in contacts. No Channels API. See `docs/automation-2026/03-WHATSAPP.md` |

---

## Key numbers, as at 2026-08-09

| Metric | Value |
|---|---|
| Eligible products (ladies, active, in stock) | **20** |
| …with 2+ images | 19 |
| …with 3+ images | 14 |
| Ladies active but out of stock (excluded) | 5 |
| All active in-stock products (if categories widen) | 61 |
| Runway at 1 post/day | 20 days |
| Runway at 2 posts/day | 10 days |
| Instagram API limit | **100** posts / 24h — confirmed live |
| Instagram carousel max | 10 images |

> ✅ **Resolved empirically.** Meta's docs contradict themselves (the Content Publishing guide
> says 100 in one section and 50 in another; the `media_publish` reference says 50). The live
> `GET /{ig-id}/content_publishing_limit` endpoint returns **`quota_total: 100`** for this
> account, which is authoritative. Irrelevant at 1 post/day either way.

Re-run the query in `README.md` § finding 2 to refresh these.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| ~~App Review rejected~~ | — | — | **Retired — App Review not required** |
| Standard Access turns out to be insufficient | Low–Medium | Delays go-live by days | Fall back to App Review; everything else is already built by then |
| System User token blocked by the Page's 2FA requirement | Unknown | Blocks IG publishing | Undocumented combination. Prove at B-15 before building on it |
| Token expires and is not refreshed | **Medium** (was Low) | Silent stop | B-14 refresh + expiry alerting. Non-expiring tokens may be refused outright |
| Repeats feel stale | Medium | Engagement drops | Only 20 products. Add products or slow cadence |
| Instagram rejects images | **Was high** | Total failure | **Found and designed for — JPEG derivatives** |
| Traffic arrives, checkout still broken | **High** | Wasted spend | `docs/checkout-cro-2026/` — 7 open, 3 blocking |
| Automated posting reads as spam | Low–Medium | Reach throttled | Per-product hashtags, varied hooks, human review queue at first |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-09 | Folder created. Meta APIs researched against official docs, database queried, plan written. Nothing implemented |
| 2026-08-09 | Researched via Meta DevTools MCP. **App Review found to be not required** (biggest blocker retired). Business Verification also retired. PPA confirmed not applicable. Page/Portfolio/IG IDs confirmed. All 6 decisions answered. Added B-14 (token refresh) and B-15 (test post). Corrected rate limit 100 → 50. Captured API error-code constraints. Still nothing implemented |
| 2026-08-09 | Phase 1 implemented and the **first real post published** to both platforms |
| 2026-08-10 | App switched to Live mode. App Review submission abandoned. Phase 1b shipped: collaborators, platform registry, post control, drag-drop queue |
| 2026-08-12 | **Reels R-2 → R-5 shipped** (product reel, review desk, publish to both platforms, collection reel). **Admin rebuilt** into three pages with shared settings as header modals and sub-tabs per page. **Planner built** (R-7) — named plans, targets, validation, week calendar, compile-down to the scheduler. Two migrations applied: per-content-type platform flags, and day-of-week scheduling. **Seven bugs fixed**, including a completely broken planner (`PlanRow` runtime ReferenceError that passed every build check) and a Generate button that had never worked (`__dirname` → `/ROOT` in the bundled ffmpeg path). **pg_cron `social-post-slots` switched on for the first time** — it had never run. **TikTok researched** → [06](./06-TIKTOK.md). ⚠️ Left uncommitted, and the applied migrations put production out of sync with deployed code |
| 2026-08-11 | **Meta app migrated** to `4259780697609294` after the old one stopped issuing tokens; took three token attempts to reach 21 scopes. Ivory Noir published on the new token — both platforms. **Three bugs found and fixed**: collaborators never passed on the queue publish path, drag-and-drop order never persisted, and the daily ceiling counted platform rows instead of posts (so "2" meant one post/day and silently blocked "Post now"). **Meta's negative-caching of failed media URLs identified and worked around.** Phase 2 re-scoped as planner + Reels + audio ([05](./05-PLANNER-REELS-AUDIO.md)) |
