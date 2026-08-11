# Plan — Planner, Reels, Video and Audio

**Created:** 2026-08-11
**Status:** 🔵 Approved by the owner 2026-08-11. R-0 complete; build not started.
**Supersedes:** the "Music" section of [04](./04-COLLABORATORS-MUSIC-CONTROL.md).

Phase 1 (photo posts) is live and proven. This document is the committed spec for the next
phase: **reels generated from product photographs, a planner the owner controls, and a
mandatory review step before anything publishes.**

---

## 0. Owner decisions — settled 2026-08-11

| # | Decision | Answer |
|---|---|---|
| 1 | Where video is encoded | **Local script on the owner's machine.** Try it first; hosted APIs only if it proves inadequate |
| 2 | Reel length | **10–12 seconds** |
| 3 | Text on screen | **Product name + price on an end card.** Also repeated in the caption |
| 4 | Audio | Unresolved — see §2. Owner asked for research before committing |
| 5 | Rotation | See §3 for the explanation the owner asked for. **Recommendation: parallel track** |
| 6 | Cadence | e.g. 4 photos + 2 reels/week, but **set through a planner UI**, not hardcoded |
| 7 | **Review before publish** | **Mandatory. No reel may publish without explicit owner approval.** |

---

## 1. R-0 result — the trending-audio probe ❌

**Run 2026-08-11. The Instagram Audio API returns nothing for this account.**

```
GET /ig_audio?audio_type=music&user_id=17841447359531039   → HTTP 200, 0 tracks
GET /ig_audio?audio_type=music&q=punjabi                   → HTTP 200, 0 tracks
GET /ig_audio?audio_type=music&q=bollywood                 → HTTP 200, 0 tracks
```

**HTTP 200 with an empty list, not an error.** The call is valid and authorised — the token
carries `instagram_content_publish` and `instagram_basic` — the library simply has nothing
to give this account.

That is consistent with Instagram's long-standing policy that **business accounts get a
restricted music library**. Commercial accounts are limited to a royalty-free selection in
most territories, precisely because using popular music to advertise a product is a
licensing question rather than a technical one. The API additionally only exposes audio
"authorised for third party use", which narrows it further.

**Conclusion: trending audio via the API is not available to us.** Do not build P-6 as
originally scoped. This was worth ten minutes to learn and would have been a wasted week to
discover after the video pipeline was built.

---

## 2. Audio — what is actually possible

The owner suggested downloading trending Hindi/Pakistani songs from the internet and using
the popular section of each track.

**That path cannot be taken, and the reason is commercial rather than technical.** Using a
commercial recording in content that advertises a product is copyright infringement unless
it is licensed for that use. Instagram runs automated rights matching, and the realistic
outcomes are: the audio is muted, the reel is removed, reach is restricted, or repeated
matches put the account at risk. For a business whose Instagram account and search ranking
*are* the asset, that is a poor trade for background music.

### The options that do work

| Option | Cost | Trending? | Notes |
|---|---|---|---|
| **A. Licensed royalty-free library** | Free–$15/mo | No | **Recommended.** Uppbeat, Pixabay Music, YouTube Audio Library free; Epidemic Sound / Artlist paid and carry South Asian material |
| **B. Silent reel** | Free | No | Works, but audio-less reels typically underperform |
| **C. Publish reels by hand from the app** | Free | **Yes** | The in-app library is wider than the API's. Costs the automation |
| **D. Commission / buy a track** | One-off | No | A single licensed brand track reused across reels also builds recognition |

**Recommended path:** build the pipeline **audio-optional**. The owner picks a handful of
licensed tracks, they live in the `social-media` bucket as a small library, and the builder
mixes one in. If a specific reel truly needs a trending sound, option C stays open — publish
that one by hand.

This keeps every reel safe to publish and leaves the door open if Meta ever opens the
library to business accounts.

---

## 3. "Rotation", explained

The owner asked what this means. It is the rule that stops the same product being posted
twice while others have never been shown.

- There are **25 eligible products**.
- The queue orders them so **a product that has never been posted always outranks one that
  has**. Among already-posted products, the least recently posted comes first.
- One full pass through all 25 is a **cycle**. The dashboard reads *"Cycle 1 · 4 of 25"* —
  first pass, four products used, twenty-one to go before anything repeats.
- Dragging a product in **Up next** pins it to the front. That pin is one-shot: it clears
  once the product posts, so the rest of the cycle resumes normally.

**The question for reels:** if Emerald Grace appears in a reel, does that count as its turn
— so it will not also appear as a photo post this cycle?

| Model | Effect |
|---|---|
| **Shared** | A reel consumes the product's turn. Each product appears once per cycle, in one format |
| **Parallel** ✅ | Reels keep their own cycle. A product can appear as a photo post *and* in a reel |

**Recommended: parallel.** A photo carousel and a reel are different formats, and a customer
seeing both is reinforcement rather than repetition. With only 25 products, letting reels
consume photo slots would roughly halve photo coverage.

---

## 4. The two reel formats

### Format A — Product reel
Three to four images of **one** garment. Slow zoom on each shot, crossfade between, ending
on a card with the product name, price and "link in bio".

> ⚠️ **Only 7 of 25 products have 4+ images; 17 have 3+.** So **3 images is the baseline**
> and a 4th is used when present. Any product with fewer than 3 is skipped for this format.

### Format B — Collection reel
One hero image from **each of four products**, faster cuts, opening title card
("New arrivals", "Cotton suits under Rs. 5,000").

**No minimum image count**, so it works for all 25 products, shows range, and is the more
reliable workhorse of the two.

---

## 5. How the builder works

```
product images (WebP, 1080×1350, in Supabase)
    │  sharp — already a working dependency
    ▼
1080×1920 frames, letterboxed on the product's stored `palette` colour
    │  ffmpeg zoompan — slow zoom in / out per shot
    │  ffmpeg xfade   — crossfade between shots
    │  end card       — name, price, CTA (rendered with sharp)
    │  optional licensed audio track, mixed and faded
    ▼
MP4 · H.264 · yuv420p · 1080×1920 · 30fps · AAC · 10–12s
    │  upload
    ▼
Supabase Storage `social-media`  →  row in `social_media_queue` (status: draft)
    ▼
/admin/social → Reels tab → owner previews → **Approve** → publish
```

**Why 9:16 letterboxing rather than cropping:** the photographs are 4:5. Cropping to 9:16
cuts the garment off, which defeats the purpose. The existing image pipeline already
letterboxes onto the palette colour with `fit: contain` — the same approach, reused.

**Why local:** Vercel's free plan caps function duration at 60s and the ffmpeg binary is
~80MB. This project already avoids Vercel cron for the same reason. `ffmpeg-static` is
installed as a devDependency so there is no manual setup on the owner's machine.

---

## 6. Review before publish — non-negotiable

The owner's explicit instruction: **no reel publishes without review.**

1. The builder writes the reel as `status = 'draft'`. **It never contacts Meta.**
2. The Reels tab shows the video with an inline player, its caption, the products used and
   the audio track.
3. The owner can **regenerate** (different shots, order or effects), **edit the caption**,
   **discard**, or **approve**.
4. Only **Approve** hands it to the publisher.
5. `approval_required` in `social_settings` governs photo posts. Reels are **always**
   reviewed regardless of that setting — this is deliberate: a bad photo caption is
   embarrassing, a bad reel is twelve seconds of it.

---

## 7. Planner tab

A new tab where the owner builds the schedule instead of thinking in raw time slots.

**Create · edit · view · delete named plans**, e.g. "August — Eid push".

A plan holds, per content type:

| Field | Example |
|---|---|
| Photo posts per week | 4 |
| Photo days + times | Mon, Wed, Fri, Sun · 19:00 |
| Reels per week | 2 |
| Reel days + times | Tue, Sat · 20:00 |
| Active period | 2026-08-15 → 2026-09-15 |

**The view** is a week grid — days across, cards showing which product and which format is
due, colour-coded photo vs reel, and drag a card to another day to move it. A month view
gives the wider picture.

**Only one plan is active at a time.** The scheduler reads the active plan; the rest are
saved templates. This is what makes "4 photos + 2 reels a week" a setting rather than a code
change, and it replaces the current raw `slot_times` model without deleting it — the plan
compiles *down* to slots, so nothing in the existing scheduler breaks.

---

## 8. Schema

```sql
social_media_queue        -- one row per generated reel
  id, kind ('product' | 'collection'), product_ids uuid[],
  video_url, thumbnail_url, duration_seconds, audio_track,
  caption, hashtags, status ('draft'|'approved'|'posted'|'failed'|'archived'),
  external_post_id, permalink, error, group_id,
  created_at, approved_at, posted_at

social_plans              -- named schedules
  id, name, is_active, active_from, active_to,
  photos_per_week, photo_days int[], photo_times text[],
  reels_per_week, reel_days int[], reel_times text[],
  created_at, updated_at
```

Reels deliberately get **their own table**, not extra nullable columns on
`social_post_log`: photo posts and reels have different lifecycles, and mixing them is how
the daily-ceiling and collaborator bugs happened in the first place.

---

## 9. Build order

| # | Step | Status | Breaks anything? |
|---|---|---|---|
| **R-0** | Trending-audio probe | ✅ **Done — negative result** | No |
| **R-1** | `social_media_queue` + `social_plans` tables, `social-media` bucket | ⬜ | No — additive only |
| **R-2** | Local reel builder, Format A | ⬜ | No — writes drafts, never publishes |
| **R-3** | Reels tab: preview, regenerate, approve, discard | ⬜ | No |
| **R-4** | `publishVideoPost` + async status polling | ⬜ | Additive to the adapter |
| **R-5** | Format B (collection reel) | ⬜ | Reuses R-2 |
| **R-6** | Audio library + mixing | ⬜ | Optional per reel |
| **R-7** | Planner tab + plan-driven scheduling | ⬜ | Compiles down to existing slots |

**R-2 is where quality is won or lost.** Auto-generated slideshows look cheap when pacing
and easing are wrong, and Meta demotes low-effort content. Expect to iterate on the look
with the owner reviewing output before any of it is automated.

---

## 10. Isolation rules

So that adding reels cannot break the photo pipeline that is now live and working:

1. **Separate table** — `social_media_queue`, never nullable columns bolted onto
   `social_post_log`.
2. **Separate cadence** — a misconfigured reel schedule must never be able to stop the
   daily photo post.
3. **Separate adapter method** — `publishVideoPost`, not a widened `publishImagePost`.
   `limits.supportsVideo` already exists on the Instagram adapter and is `true`.
4. **The platform registry gates it** — a platform with no video adapter reports the
   capability as unsupported instead of failing at publish time.
5. **Drafts never touch Meta.** The builder's only outputs are a file in Storage and a row.
6. **Nothing renders on the storefront**, so this stays outside the SEO surface in
   `AGENTS.md`. Re-check if that ever changes.

---

## Sources

- [Instagram Audio API](https://developers.facebook.com/docs/instagram-platform/content-publishing/audio-api/)
- [Content Publishing — Reels](https://developers.facebook.com/docs/instagram-platform/content-publishing)
