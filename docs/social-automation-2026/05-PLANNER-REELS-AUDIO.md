# Plan — Planner, Reels, Video and Audio

**Created:** 2026-08-11
**Status:** 📋 Plan only. **Nothing implemented.** Raised by the owner 2026-08-11.
**Supersedes:** the "Music" section of [04](./04-COLLABORATORS-MUSIC-CONTROL.md), which
covered trending audio in isolation. This document places it in the wider planner picture.

The owner asked why the social tab has no planner covering **scheduled posts, number of
posts, number of reels, videos and audio**. This answers: what exists, what is genuinely
missing, why it is missing, and what it would take to add — in an order that does not
break what is already live.

---

## 1. What the Schedule tab already does

More than it appears. These are all built, working, and stored in `social_settings`:

| Control | Field | Notes |
|---|---|---|
| Posting times | `slot_times[]` | Real `<input type="time">` pickers, add/remove per slot |
| Timezone | `timezone` | `Asia/Karachi` |
| Hard daily ceiling | `max_posts_per_day` | Safety net — a scheduler misfire cannot exceed it |
| Which products | `categories[]` | Checkboxes built from the `categories` table with live in-stock counts |
| Products per post | `products_per_post` | |
| Minimum images | `min_images` | Below 2 the post is a single image, not a carousel |
| Only in-stock | `require_in_stock` | |
| Hold for review | `approval_required` | The review queue |
| Manual order | `social_queue_order` | Drag-and-drop "Up next", saves on drop |

**So "schedule post" and "number of posts" are not missing.** Cadence is expressed as
*slots per day* rather than a single "posts per day" number, which is the more precise
control — but it is a different mental model from what the owner expected, and that is a
fair UX criticism rather than a missing feature.

## 2. What is genuinely missing

| Ask | Exists? | Why not |
|---|---|---|
| **Reels / video posting** | ❌ | No video pipeline exists at all — see §3 |
| **Number of reels** (own cadence) | ❌ | Depends on Reels existing first |
| **Audio / trending music** | ❌ | **Audio can only attach to Reels.** A static image has no audio track. Blocked behind video |
| **Video upload + storage** | ❌ | `social_media_queue` table and `social-media` bucket are designed in [02](./02-ARCHITECTURE.md) but never built |
| **Planner / calendar view** | ❌ | Never specified. The nearest thing is "Up next", which is an ordered list with no dates |

## 3. Why Reels is the hard one — and the honest cost

Everything else on this list is small. Reels is not, and it is worth being precise about
why, because it is the item that keeps getting deferred.

1. **There is no video.** Nothing in this project generates video from product photos.
   `ffmpeg` is not a dependency and adding it to a Vercel deployment is its own project.
   The realistic near-term answer is **the owner uploads finished videos**.
2. **Storage must serve a direct public file URL.** Meta fetches the file server-side.
   Google Drive share links serve an HTML interstitial, not a file, so **Drive cannot be
   used**. Supabase Storage already does this correctly for images and is the right home.
3. **Reels publish asynchronously.** Unlike images, the container must be polled to
   `FINISHED` before `media_publish`, with a longer and more variable wait.
4. **The audio library is a subset.** Meta: *"This API returns audio that has been
   authorized for third party use… the available selection may vary from what appears in
   the native app."* A song trending in Pakistan may simply not be available to the API.
5. **Pakistan-specific trending is unverified.** `GET /ig_audio?audio_type=music` takes a
   `user_id`, but the docs never state that trending is geo-targeted. **One API call
   settles this and it should be made before any video work is committed to.**

## 4. Recommended order

Deliberately sequenced so each step ships something usable and nothing already live breaks.

| Step | Work | Size | Depends on |
|---|---|---|---|
| **P-1** | **Trending-audio probe.** One call to `/ig_audio` for this account; record whether Pakistani tracks come back | Ten minutes | Nothing |
| **P-2** | **Planner view.** A calendar/agenda showing which product lands on which date, derived from `slot_times` + rotation. Read-only first | Small–Medium | Nothing |
| **P-3** | **Cadence in plain language.** Show "1 post/day at 19:00" alongside the slot pickers, so the schedule reads the way the owner thinks about it | Small | Nothing |
| **P-4** | **Video queue.** `social_media_queue` table + `social-media` public bucket + an upload tab. Owner-supplied video only | Medium | P-1 result |
| **P-5** | **Reel publishing.** `media_type=REELS`, async status polling, its own error handling | Medium | P-4 |
| **P-6** | **Audio attachment.** Trending picker, `audio_configuration` on the container | Small | P-5, P-1 |
| **P-7** | **Independent reel cadence.** e.g. 2 reels/week alongside the daily image post | Small | P-5 |

**P-1 through P-3 are worth doing regardless** — they need no video pipeline, cannot break
publishing, and P-2 is most of what "planner" actually means day to day.

## 5. Isolation rules for this work

Non-negotiable, so that adding Reels cannot break the image pipeline that is now live:

1. **Reels get their own table** (`social_media_queue`), never extra nullable columns on
   `social_post_log`. Image posts and video posts have different lifecycles.
2. **Reels get their own cadence fields**, never reuse `slot_times`. A misconfigured reel
   schedule must not be able to stop the daily image post.
3. **The adapter interface already supports this** — `limits.supportsVideo` exists on the
   Instagram adapter and is `true`. Add a `publishVideoPost` method rather than widening
   `publishImagePost`.
4. **The platform registry gates it.** A platform without a video adapter must report the
   capability as unsupported rather than failing silently at publish time.
5. **Nothing here touches the storefront**, so it stays outside the SEO surface described
   in `AGENTS.md`. Confirm that again if any of it ever renders a public page.

## 6. Open questions for the owner

1. Will videos be **uploaded by hand**, or is auto-generating them from product photos a
   requirement? This changes P-4 from medium to large.
2. Reel cadence — how many per week, alongside the daily image post?
3. Should a reel **consume the rotation slot** for that product, or run as a parallel
   track so a product can appear as both an image post and a reel?
4. Planner: read-only view first, or drag-a-product-onto-a-date from the start?

---

## Sources

- [Instagram Audio API](https://developers.facebook.com/docs/instagram-platform/content-publishing/audio-api/) — trending music, Reels only
- [Content Publishing — Reels](https://developers.facebook.com/docs/instagram-platform/content-publishing) — async containers and status polling
