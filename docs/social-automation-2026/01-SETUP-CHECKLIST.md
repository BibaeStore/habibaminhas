# Setup Checklist — what the owner must do

**This is the blocking list.** Nothing can be built and tested until these exist. Most of it
is clicking through Meta's dashboards; the only slow part is App Review.

Work top to bottom. Steps 1–3 are probably already done.

---

## Step 0 — ~~Start App Review today~~ — **REMOVED, 2026-08-09**

**App Review is not required.** Because this app serves only a business the owner owns and
manages, it runs on **Standard Access**, which every Business app receives automatically for
all permissions available to its type. Business Verification is likewise not needed.

See `README.md` § finding 3 and `TRACKER.md` for the sourced correction. Step 6 below still
lists the permissions the System User token must carry — they are just requested directly
rather than through review.

**Consequence:** the critical path is now `create app → System User → token → build → test`.
Setup is roughly an hour of clicking, not a month of waiting.

---

## Step 1 — Meta Business Portfolio ✅ likely already done

Meta Business Suite is already in use for ads, so a Business Portfolio exists.

**What I need:** the **Business Portfolio ID**.
Find it at [business.facebook.com](https://business.facebook.com) → Settings → Business Info.

---

## Step 2 — Facebook Page ✅ likely already done

The site already links to `facebook.com/habibaminhas.official`.

**What I need:** the **Page ID** (not the vanity URL).
Page → Settings → About → scroll to Page ID. Or via API once a token exists.

**Requirement:** the account used must have `CREATE_CONTENT`, `MANAGE` and `MODERATE` tasks
on the Page. As the owner, that will already be true.

---

## Step 3 — Instagram Professional account, linked to the Page

The account is **`instagram.com/habibaminhas.official`** — confirmed 2026-08-09 via the Graph
API as the Instagram Business account linked to the Page (IG ID `17841447359531039`).

> An earlier draft of this doc said `habibaminhas.pk`. That was wrong, and the same wrong handle
> had reached `components/seo/organization-schema.tsx`. Fixed 2026-08-09 — see
> `docs/seo-optimization-2026/TRACKER.md`.

Two things must both be true, and the second is the one people miss:

1. The Instagram account is a **Professional** account — Business or Creator, not Personal.
   Instagram app → Settings → Account type and tools → Switch to professional account.
2. It is **connected to the Facebook Page** from Step 2.
   Meta Business Suite → Settings → Accounts → Instagram accounts → Connect.

⚠️ **Without the link, the content publishing API cannot see the Instagram account at all.**
This is the single most common reason these integrations fail on day one.

**What I need:** nothing directly — I derive the Instagram Business Account ID from the Page:

```
GET /v21.0/{page-id}?fields=instagram_business_account
```

---

## Step 4 — Create a Meta Developer App

At [developers.facebook.com/apps](https://developers.facebook.com/apps):

1. Create App → type **Business**
2. Link it to the Business Portfolio from Step 1
3. Add these products to the app:
   - **Instagram** → Instagram API setup with Facebook Login
   - **Facebook Login for Business**

**What I need:** **App ID** and **App Secret** (App → Settings → Basic).

> The App Secret is a credential. It goes in `.env.local` and Vercel environment variables,
> never in the repository. Same handling as `SUPABASE_SERVICE_ROLE_KEY` today.

---

## Step 5 — Create a System User and generate a token

This is the step that decides whether the automation still works in six months.

Business Settings → Users → **System Users** → Add:

1. Name it something like `habibaminhas-social-automation`
2. Role: **Admin**
3. **Assign assets** to the system user — this is mandatory and easy to skip:
   - the Facebook Page (Full control)
   - the Instagram account (Full control)
   - the App from Step 4
4. **Generate New Token** → select the App → select the scopes in Step 6 → generate

**What I need:** the **System User access token**.

### Why a System User rather than a normal login token

| | Personal long-lived token | System User token |
|---|---|---|
| Expires | ~60 days, refresh needed | **Never** |
| Survives a password change | ❌ dies | ✅ |
| Survives the owner losing a Page role | ❌ dies | ✅ |
| Tied to a person | Yes | No — belongs to the business |

An unattended daily job on a personal token stops silently the first time the owner changes
their Facebook password, usually weeks before anyone notices the posts stopped.

---

## Step 6 — Request these permissions in App Review

Submit for App Review with a screencast showing the intended use. Meta wants to see the
actual flow, so the review submission should be made **after** the pipeline works against a
test account in development mode.

**For Instagram publishing:**
| Permission | Why |
|---|---|
| `instagram_basic` | Read the connected IG account |
| `instagram_content_publish` | **Publish posts and Reels** |
| `pages_read_engagement` | Required alongside the above |

**For Facebook Page publishing:**
| Permission | Why |
|---|---|
| `pages_manage_posts` | **Create posts on the Page** |
| `pages_read_engagement` | Read Page data |
| `publish_video` | Only if video/Reels to Facebook is wanted |

**If the Page role comes via Business Manager** (which it does here), Meta additionally
requires `ads_management` and `ads_read` on the Instagram side. Worth including in the same
submission rather than discovering it later and waiting another 2–4 weeks.

---

## Step 7 — Hand over the credentials

Once Steps 1–5 are done, five values are needed. Send them however is convenient and I will
put them in `.env.local` and the Vercel environment:

```bash
META_APP_ID=
META_APP_SECRET=
META_SYSTEM_USER_TOKEN=
META_FB_PAGE_ID=
META_BUSINESS_PORTFOLIO_ID=
```

The Instagram Business Account ID is derived automatically from the Page ID, so it is not
needed by hand.

---

## Step 8 — Decisions only the owner can make

These shape the build. Answers are needed before implementation, not before setup.

| # | Decision | Why it matters | My recommendation |
|---|---|---|---|
| 1 | Posting cadence | Only **20 eligible products** exist. 2/day exhausts them in 10 days | **1/day**, review after two weeks |
| 2 | 1 product per post, or 2 | 2-per-post halves the runway again | **1 per post** — carousels of one product tell a clearer story |
| 3 | Caption language | Urdu captions reportedly outperform English-only for Pakistani audiences | **English + a short Urdu line**, see [03](./03-CONTENT-AND-SCHEDULE.md) |
| 4 | Post out-of-stock products? | Currently excluded. 5 ladies products are active but sold out | **Keep excluding** — driving traffic to an unbuyable page wastes the click |
| 5 | Other categories later? | Kids, baby and accessories are excluded for now | Ladies only until the rotation proves itself |
| 6 | Who approves captions? | Fully automatic, or queued for review first | **Review queue for the first 2 weeks**, then automatic |

---

## What happens after handover

| Stage | Who | Rough time |
|---|---|---|
| Setup Steps 1–5 | Owner | ~1 hour |
| App Review submission | Both | ~1 day to prepare, then 2–4 weeks waiting |
| Database schema + admin UI | Me | while waiting |
| Meta adapter + JPEG pipeline | Me | while waiting |
| Testing in development mode | Me | while waiting |
| Go live | Both | once App Review approves |

**Nothing needs to sit idle during App Review** — everything except the final live publish
can be built and tested against a development-mode app.
