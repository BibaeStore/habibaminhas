# TikTok — research and requirements

**Created:** 2026-08-12
**Status:** 🔵 Researched, nothing built. Blocked on owner setup + TikTok audit.
**Scope decision (owner, 2026-08-12):** **Video only.** Static photo posts will stay off for
TikTok even though the API supports them.

Researched against TikTok's official developer documentation on 2026-08-12. Every claim
below is sourced at the bottom; the secondary sources agree with the official docs on all
the load-bearing points.

---

## 0. The short version

TikTok is **harder than Meta was**, for two reasons that have nothing to do with writing an
adapter:

1. **There is no System User.** Meta let us authenticate server-to-server with a
   non-expiring System User token and *no login flow at all*. TikTok is user-OAuth only:
   access tokens last **24 hours**, and something must refresh them forever.
2. **Nothing is public until TikTok audits the app.** Unaudited clients can post, but every
   post is forced to `SELF_ONLY` — visible to the account owner and nobody else. Not to
   followers, not on the For You page.

So the honest sequencing is: build it, prove it end to end with self-only posts, then
submit for audit. **The automation delivers no public reach until the audit passes**, and
TikTok offers no expedited review.

This is the opposite of what happened with Meta, where App Review turned out to be
unnecessary. Do not assume the same luck twice.

---

## 1. What the owner must do

Nothing here can be done by me — each step needs the TikTok account holder.

| # | Step | Notes |
|---|---|---|
| T-1 | Register at [developers.tiktok.com](https://developers.tiktok.com) | Uses the TikTok login |
| T-2 | Create an app | Name, icon, category |
| T-3 | Add the **Content Posting API** product | This is what exposes the publish endpoints |
| T-4 | Request scopes: `video.publish`, `video.upload`, `user.info.basic` | `video.publish` is the direct-post one and needs approval |
| T-5 | Set **Privacy Policy URL** → `https://habibaminhas.com/legal/privacy/` | Required for every app |
| T-6 | Set **Terms of Service URL** → `https://habibaminhas.com/legal/terms/` | Required |
| T-7 | Add **Redirect URI** → `https://habibaminhas.com/api/social/tiktok/callback` | Must match byte-for-byte at auth time |
| T-8 | Hand me **client key** + **client secret** | `.env.local` + Vercel only, never the repo |
| T-9 | Authorise the app once, through a page I build | Produces the refresh token everything else depends on |
| T-10 | Submit for **audit** | Needs a demo video of the full flow. No paid fast track |

> ⚠️ **Learn from the Meta migration.** A token's scopes are frozen when it is generated.
> Add the product and request every scope *before* generating anything, or it has to be
> redone. This cost three attempts on the Meta app.

---

## 2. Authentication — the part that is genuinely new

```
owner clicks "Connect TikTok"  (one time, in /admin/social)
        │
        ▼
 TikTok consent screen  ──►  redirect back with ?code=…
        │
        ▼
 exchange code + client_key + client_secret  →  POST /v2/oauth/token/
        │
        ▼
 access_token   (24 hours)
 refresh_token  (365 days, refreshable without asking the owner again)
        │
        ▼
 stored in social_accounts.credentials (jsonb)
        │
        ▼
 pg_cron refreshes every ~12h, well inside the 24h window
```

**Token facts, from the official docs:**

| | Value |
|---|---|
| `access_token` lifetime | **86,400s — 24 hours** |
| `refresh_token` lifetime | **31,536,000s — 365 days**, from last use |
| Refresh needs the owner? | **No** — `grant_type=refresh_token` is server-to-server |
| Refresh token dies if | 365 days of inactivity, or the owner revokes access |
| Rate limit | **6 requests per minute** per access token |

**Storage: no new table needed.** `social_accounts` already carries
`platform`, `external_id`, `enabled` and a `credentials jsonb` column, which is exactly the
shape this wants. One row, `platform = 'tiktok'`.

**A refresh job is not optional here.** Meta's token never expires, so B-14 was downgraded
to a safety net. TikTok's dies in 24 hours. If the refresh job stops for a day, posting
stops; if it stops for a year, the owner has to re-authorise by hand. This is the single
most likely thing to break silently, so the refresh needs alerting, not just a cron entry.

---

## 3. The audit gate — read before estimating anything

**Unaudited API clients:**

- every post is forced to **`SELF_ONLY`** visibility
- at most **5 users may post in any 24-hour window**
- all posting accounts must be **set to private** at the time of posting

So the full pipeline can be built and demonstrated before audit — the posts simply are not
public. That is useful for proving the integration works, and useless as marketing.

To lift it, the client goes through TikTok's audit for Terms of Service compliance.
Applications go to `developers.tiktok.com/application/content-posting-api`. **There is no
expedited track and no way to pay for one.**

---

## 4. UX rules TikTok enforces at review

These are requirements on **our admin UI**, not on the API call, and reviewers check them.
They are the reason a TikTok reel cannot reuse the existing review card unchanged.

| Requirement | What it means for the Reels review screen |
|---|---|
| **Call Query Creator Info first** | A `/v2/post/publish/creator_info/query/` call before showing the form |
| **Show the creator's username and avatar** | Drawn from that call, displayed on the card |
| **Creator picks a privacy level** | Public / Friends / Private selector — cannot be hardcoded |
| **Creator sets duet, stitch and comment** | Three toggles, and they must reflect what the account actually allows |
| Privacy policy URL | Already have one |
| Demo video or screenshots | Recorded from the finished admin screen |

Query Creator Info also returns which interactions the account permits, so the toggles must
be *disabled* where the account disallows them rather than shown as available.

---

## 5. Getting the video file across

Two options, and the choice matters more than it looks.

### PULL_FROM_URL — TikTok downloads it

- The URL must be on a **domain or URL prefix we have proven we own**, verified in the
  developer portal by DNS record or meta tag.
- **This rules out Supabase Storage.** Reels currently live at
  `<project>.supabase.co/storage/v1/object/public/social-media/…`, and we cannot verify
  ownership of `supabase.co`. Using this route would mean serving reels from
  `habibaminhas.com` instead.
- Must be `https`, must **not redirect** — a 3xx is treated as invalid, which also rules
  out a simple redirect-to-Supabase route.
- URL must stay reachable for up to **one hour** after the download starts.

### FILE_UPLOAD — we send the bytes ✅ recommended

- Init the upload, get an `upload_url`, PUT the video to it.
- Chunks must be 5–64MB, max 1,000 chunks — **but a video under 5MB must be sent whole**.
- **Our reels are 3.0–3.8MB**, so every one is a single-shot upload. No chunking logic, no
  domain verification, nothing to own.

**Recommendation: FILE_UPLOAD.** It sidesteps domain verification entirely and the
chunking rules never engage at our file sizes. Revisit PULL_FROM_URL only if reels grow
past 5MB *and* we want to stop proxying bytes through the server.

### Format limits, against what we already produce

| Limit | TikTok allows | Our reels |
|---|---|---|
| Container | MP4, WebM, MOV | **MP4** ✅ |
| Duration | up to 10 minutes | **11s** ✅ |
| Frame rate | 23–60 FPS | **30** ✅ |
| Resolution | 360–4096 px | **1080×1920** ✅ |
| File size | up to 4GB | **~3MB** ✅ |

Everything the reel builder already outputs is within spec. No encoding changes needed.

---

## 6. Photo posts — supported, but deliberately off

TikTok *does* have a photo post endpoint. The owner has decided **static posts stay off for
TikTok** and only reels go there.

This is already expressible in the schema without any special-casing: the `tiktok` row in
`social_platforms` gets `supports_video = true` and `supports_photo = false`. The photo
pipeline then cannot target it even by accident — which is exactly the modelling the
per-content-type split was added for on 2026-08-12.

---

## 7. What I would build, in order

| # | Step | Blocked by | Breaks anything? |
|---|---|---|---|
| **K-1** | OAuth connect flow: `/api/social/tiktok/callback` + a Connect button | T-1…T-8 | No — new routes |
| **K-2** | Token storage in `social_accounts` + refresh job on pg_cron (~12h) | K-1 | No — additive |
| **K-3** | `lib/social/adapters/tiktok.ts` — creator info, init, upload, poll | K-2 | No — new adapter |
| **K-4** | Review card additions: creator info, privacy, duet/stitch/comment | K-3 | Reels UI only |
| **K-5** | Registry: `supports_video = true` for `tiktok` | K-3, K-4 | No — one row |
| **K-6** | Prove end to end with a `SELF_ONLY` post | K-5 | No |
| **K-7** | Record demo video, submit for audit | K-6 | No |
| **K-8** | Re-test public posting once audited | T-10 | No |

**K-1 and K-2 are the real work.** The adapter itself is ordinary; the login flow and
never-ending token refresh are new infrastructure this project has deliberately never
needed until now.

---

## 8. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Audit rejected or slow** | Medium | No public reach at all | Build to the UX rules exactly; treat audit as the critical path, not an afterthought |
| **Refresh job stops** | Medium | Silent stop within 24h | Alert on refresh failure — do not rely on noticing missing posts |
| Refresh token lapses (365d) | Low | Manual re-auth | The 12h refresh keeps it alive by using it |
| Owner revokes app access | Low | Immediate stop | Surface connection state in the admin |
| 6 req/min rate limit | Very low | — | 2 reels/week is nowhere near it |
| Automated posting reads as spam | Low–Medium | Reach throttled | Same varied-caption approach as Meta |

---

## 9. Open questions to settle before building

1. **Which TikTok account?** The brand needs one; is there an existing `@habibaminhas`
   handle, and is it Business or Personal?
2. **Captions.** Reuse the Instagram caption, or write TikTok-specific ones? TikTok
   caption limits and hashtag culture differ from Instagram's.
3. **Does the owner want the privacy selector exposed per reel**, or defaulted to Public
   with the control present only because TikTok requires it?

---

## Sources

Official:
- [Content Posting API — Get Started](https://developers.tiktok.com/doc/content-posting-api-get-started)
- [Media Transfer Guide](https://developers.tiktok.com/doc/content-posting-api-media-transfer-guide)
- [Manage User Access Tokens (OAuth v2)](https://developers.tiktok.com/doc/login-kit-manage-user-access-tokens/)
- [Content Sharing Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines)
- [Direct Post reference](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post)

Secondary (used only to corroborate; all agreed with the official docs):
- [Phyllo — TikTok API integration guide 2026](https://www.getphyllo.com/post/tiktok-api-integration-guide-2026-setup-endpoints-common-pitfalls)
- [Netrows — Content Posting API requirements 2026](https://www.netrows.com/blog/tiktok-content-posting-api-guide-2026)
