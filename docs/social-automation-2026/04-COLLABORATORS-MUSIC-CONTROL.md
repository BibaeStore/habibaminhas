# Plan — Collaborators, Music, and Post Control

**Created:** 2026-08-10
**Status:** 📋 Plan only. **Nothing implemented.** Awaiting owner decisions.
**Researched against:** Meta official docs via DevTools MCP, 2026-08-10.

Three capabilities the owner asked about. Each is researched against Meta's current
documentation and scored against what our token can already do today.

---

## Summary — what is and is not possible

| Ask | Verdict | Effort | Blocked by |
|---|---|---|---|
| **Tag collaborators** (personal IG account) | ✅ **Fully possible** | Small | Owner's IG username + a settings toggle |
| **Delete an Instagram post** | ✅ **Possible** — permission already held | Small | Nothing |
| **Edit a Facebook caption** | ✅ **Already proven working** | Done | — |
| **Edit an Instagram caption** | ❌ **Impossible via API** | — | Meta does not expose it |
| **Trending music on posts** | ⚠️ **Only on Reels** | **Large** | Requires building video support |
| **Collaborators on Facebook** | ❌ **Not in the Pages API** | — | Meta does not expose it |

---

## 1. Collaborators — ✅ recommended, do this first

### What Meta supports

`POST /{ig-user-id}/media` accepts a `collaborators` parameter:

> **`collaborators`** — "For Feed image, Reels and Carousels only. A list of up to 3
> instagram usernames as collaborators on an ig media. **Not supported for Stories.**"

Our posts are Feed carousels, so this fits exactly. Reading back the status:

```
GET /{ig-media-id}/collaborators
→ { "data": [ { "id": "...", "username": "...", "invite_status": "Pending" } ] }
```

`invite_status` is `Pending` or `Accepted`.

### How it actually behaves

It is an **invitation**, not an instant co-post. The flow:

1. We publish with `collaborators=["habibaminhas"]` (the personal account's username)
2. Instagram sends that account a collaboration invite
3. The owner accepts it in the Instagram app (Notifications → the invite)
4. The post then appears on **both** profiles and shares one engagement count

That is the same mechanic as tapping "Invite collaborator" in the app — we are just doing
it at publish time instead of afterwards.

### ⚠️ Two things that will silently break it

1. **The collaborator account must have collaborator tagging enabled.** Meta:
   *"Only IG users who have enabled collaborator tagging will be returned in the response."*
   → Instagram app → Settings → **Tags and mentions** → allow collaborator invites.
   If this is off, the invite is silently dropped — no error.

2. **A discrepancy in Meta's own docs.** The create parameter says **up to 3**
   collaborators; the `/collaborators` edge reference says **up to 5** accounts. We will
   design for **3** and treat anything above that as unsupported.

### What we would build

- `social_settings.instagram_collaborators text[]` — a configurable list, default empty
- Instagram adapter passes it on both the single-image and carousel-parent containers
- `/admin/social` → Schedule tab: a "Collaborators" field with the caveat above as hint text
- Post-publish, read `/collaborators` back and store `invite_status` so the Posts tab can
  show *"awaiting acceptance"* rather than looking like nothing happened

**Permissions:** `instagram_basic` + `pages_read_engagement` — **both already held.**

### ❌ Facebook has no equivalent

The owner asked for "the same way as Facebook". The Pages API has no collaborator or
co-author parameter on `/{page-id}/photos` or `/{page-id}/feed`. Facebook's collaboration
features are app-side only. **Nothing to build; this is a platform limitation.**

---

## 2. Post control — edit and delete

### The current, verified position

| Action | Platform | Status |
|---|---|---|
| Edit caption | Facebook | ✅ **Proven working** — we edited the first post on 2026-08-09 |
| Delete post | Facebook | ✅ `DELETE /{post-id}`, documented, `pages_manage_posts` held |
| Edit caption | Instagram | ❌ **Impossible.** `POST /{ig-media-id}` accepts **only** `comment_enabled` |
| Delete post | Instagram | ✅ **Possible** — see below |

### 🆕 Instagram delete IS available — correcting an earlier statement

I previously told the owner that a bad Instagram post could only be removed by hand.
**That was wrong.** Meta shipped a delete endpoint on 2025-12-03:

```
DELETE /{ig-media-id}
```

- Requires `instagram_basic` + **`instagram_manage_contents`**
- **`instagram_manage_contents` is already in our System User token's scopes** — verified
  via `debug_token`. Nothing to request.
- Facebook Login only — which is the path we use ✅
- Supports non-ad posts, Stories, Reels and **entire carousel albums**
- To remove a carousel you must delete the **parent container id**; deleting an individual
  slide is not supported

### What this unlocks

Because Instagram captions cannot be edited, the only way to correct a live Instagram post
is **delete and repost**. We now have both halves of that, so it can be one admin button:

> **Fix this post** → delete on Instagram → rebuild the caption from current product data →
> republish → update the same `social_post_log` row with the new id and permalink

That directly solves the problem the owner hit with the first post's caption, which is
currently still live with the old size/stock text.

### What we would build

- `deleteSocialPost(logId)` — platform-aware, deletes on Meta and marks the row `deleted`
- `repostSocialPost(logId)` — delete, regenerate, republish, keep one row and one group
- `/admin/social` → Posts tab: **Delete** and **Repost with fresh caption** on each row
- **Both behind a confirmation dialog.** Deleting a live post is irreversible and loses all
  likes, comments and saves permanently. This must never be a single misclick.

---

## 3. Music — ⚠️ possible, but only on Reels

### The good news

The **Instagram Audio API** launched on 2026-06-01 and does exactly what the owner
described:

```
GET /ig_audio?audio_type=music&user_id={ig-user-id}
```

> "If a search query is omitted, **trending** original sounds or music are returned by
> default."

Returns `audio_id`, `title`, `display_artist`, `duration_in_ms`, cover art, and a preview
URL. Attaching it at publish time:

```
POST /{ig-user-id}/media
  media_type=REELS
  video_url=...
  audio_configuration={"audio_id":"...","audio_volume":100,"video_volume":60}
```

**Permissions:** `instagram_basic` + `instagram_content_publish` — **both already held.**
Facebook Login only — which is our path ✅

### 🔴 The blocker

**Audio can only be attached to Reels.** Every parameter in the flow above is video-only:
`media_type=REELS`, `video_url`, `video_volume`. Our posts are static image carousels, and
a still image has no audio track to attach anything to. This is not an API gap we can work
around — it is what the format is.

**So "add trending music to our posts" really means "start publishing Reels."** That is
Phase 2 of the original plan, and it is a substantially bigger piece of work than the other
two items here.

### Two further caveats worth knowing before committing

1. **The API's music library is a subset of the app's.** Meta: *"This API returns audio
   that has been authorized for third party use. Note that the available selection **may
   vary from what appears in the native app**."* A song trending in Pakistan on Instagram
   may simply not be available to us. Posting a Reel from the app would still give access
   to the full catalogue.

2. **Pakistan-specific trending is unverified.** The endpoint takes `user_id`, which
   suggests results are personalised to the account, but the docs never state that trending
   is geo-targeted. **This must be tested against the real account before any promises are
   made** — a one-call check, listed below.

### What the full path would require

| Step | Work |
|---|---|
| Video source | Owner uploads Reels manually — nothing generates video from product photos today |
| `social_media_queue` table | Already designed in `02-ARCHITECTURE.md`, not built |
| `social-media` Storage bucket | Public, for the video files |
| Upload form in `/admin/social` | New tab |
| Reel publishing + status polling | Reels process asynchronously; must poll to `FINISHED` |
| Audio picker | Fetch trending, let the owner choose, or auto-pick the top track |
| Independent cadence | Reels on their own schedule, e.g. 2/week |

**This is Phase 2, and it is weeks of work, not hours.**

---

## Recommended sequence

**Do now — small, high value, nothing blocking:**

1. **Collaborators.** One parameter, one settings field. Directly doubles the reach of every
   post by putting it on the personal account too.
2. **Delete + repost.** Fixes the stuck Instagram caption permanently and gives real
   control over anything posted in error.

**Decide later:**

3. **Music/Reels.** Worth doing, but it is Phase 2 in disguise. Recommend proving the
   trending-audio call works for Pakistan *first* (one API call, ten minutes) before
   committing to the video pipeline.

---

## What the owner needs to supply

| # | Needed | For |
|---|---|---|
| 1 | The **Instagram username** to tag as collaborator (not the ID — the API takes usernames) | Collaborators |
| 2 | Confirm **collaborator tagging is enabled** on that account (Settings → Tags and mentions) | Collaborators |
| 3 | Decide: collaborators on **every** post, or only some? | Collaborators |
| 4 | Approval to **delete and repost** the first Instagram post to fix its caption | Post control |

---

## Open questions to verify before building

1. Does `GET /ig_audio?audio_type=music` return **Pakistani** trending tracks for this
   account? One call answers it. Do this before any Reels commitment.
2. Is the collaborator cap **3** (create parameter) or **5** (edge reference)? Design for 3.
3. Does a collaborator invite sent by a System User token behave the same as one sent from
   the app? Undocumented — test with one real post.

---

## Sources

- [IG User Media reference](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/) — the `collaborators` parameter
- [IG Media Collaborators](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-media/collaborators/) — invite_status, limits
- [Instagram Audio API](https://developers.facebook.com/docs/instagram-platform/content-publishing/audio-api/) — trending music, Reels only
- [IG Media reference](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/) — DELETE, and the `comment_enabled`-only update
- [Instagram Platform Changelog](https://developers.facebook.com/docs/instagram-platform/changelog) — Audio API 2026-06-01, Delete Media 2025-12-03
