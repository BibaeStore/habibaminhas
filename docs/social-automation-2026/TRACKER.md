# TRACKER — Social Automation

**Last updated:** 2026-08-09 (fourth update — FIRST POST IS LIVE)
**Status:** ✅ **Phase 1 built and proven end to end. The first real post published on
2026-08-09.** Automation itself is still paused (`social_settings.enabled = false`, cron
job inactive) — the first post was published manually through the review queue.

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

## Phase 2 — Reels / video

| # | Task | Status | Depends on |
|---|---|---|---|
| V-1 | `social_media_queue` table | ⬜ | Phase 1 live |
| V-2 | `social-media` Storage bucket | ⬜ | — |
| V-3 | Upload form in `/admin/social` | ⬜ | V-1, V-2 |
| V-4 | Reel publishing + status polling | ⬜ | V-1 |
| V-5 | Independent video cadence | ⬜ | V-1 |

---

## Phase 3 — More platforms

Each is one adapter file plus one `social_accounts` row. Sequenced by how well each
tolerates automation.

| Platform | Automation friendliness | Status | Note |
|---|---|---|---|
| Pinterest | Good — official API, and the audience matches | ⬜ | Best next after Meta |
| LinkedIn | Good — official API | ⬜ | Weakest audience fit for this brand |
| TikTok | Medium — Content Posting API exists, stricter review | ⬜ | Video-first, pairs with Phase 2 |
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
