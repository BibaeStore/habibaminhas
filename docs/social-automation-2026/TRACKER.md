# TRACKER — Social Automation

**Last updated:** 2026-08-09
**Status:** 📋 Plan complete. **Nothing implemented.** Blocked on owner setup.

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
| S-0 | **Start Meta App Review** | Owner | ⬜ | **Do first — 2–4 week wait gates go-live** |
| S-1 | Business Portfolio ID | Owner | ⬜ | Already exists (Business Suite in use for ads) |
| S-2 | Facebook Page ID | Owner | ⬜ | Page exists: `habibaminhas.official` |
| S-3 | Instagram → Professional, linked to Page | Owner | ⬜ | ⚠️ The link is the usual failure point |
| S-4 | Create Meta Developer App | Owner | ⬜ | Type: Business |
| S-5 | Create System User + assign assets + token | Owner | ⬜ | Not a personal token — see 01 |
| S-6 | Hand over 5 env values | Owner | ⬜ | See 01 § Step 7 |
| S-7 | Answer the 6 decisions | Owner | ⬜ | See 01 § Step 8 |

---

## Phase 1 — Static product posts (buildable during App Review)

| # | Task | Status | Depends on |
|---|---|---|---|
| B-1 | `social_*` tables + migration | ⬜ | S-7 |
| B-2 | Rotation selection query + tests | ⬜ | B-1 |
| B-3 | WebP → JPEG derivative pipeline | ⬜ | — |
| B-4 | Caption + hashtag generator | ⬜ | S-7 (language decision) |
| B-5 | Instagram adapter (carousel) | ⬜ | S-4 (dev-mode testing) |
| B-6 | Facebook adapter | ⬜ | S-4 |
| B-7 | `/api/cron/social-post` route | ⬜ | B-2, B-5, B-6 |
| B-8 | pg_cron schedule (every 15 min) | ⬜ | B-7 |
| B-9 | `/admin/social` — Schedule tab | ⬜ | B-1 |
| B-10 | `/admin/social` — Static posts tab | ⬜ | B-1 |
| B-11 | Approval / review queue | ⬜ | B-9 |
| B-12 | UTM tagging + GA4 verification | ⬜ | B-4 |
| B-13 | **Go live** | 🚫 | **App Review approval** |

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
| Instagram API limit | 100 posts / 24h |
| Instagram carousel max | 10 images |

Re-run the query in `README.md` § finding 2 to refresh these.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| App Review rejected | Medium | Blocks everything | Submit with a clear screencast; resubmission is allowed |
| Token stops working | Low with System User | Silent stop | System User token + failure logging + alerting |
| Repeats feel stale | Medium | Engagement drops | Only 20 products. Add products or slow cadence |
| Instagram rejects images | **Was high** | Total failure | **Found and designed for — JPEG derivatives** |
| Traffic arrives, checkout still broken | **High** | Wasted spend | `docs/checkout-cro-2026/` — 7 open, 3 blocking |
| Automated posting reads as spam | Low–Medium | Reach throttled | Per-product hashtags, varied hooks, human review queue at first |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-09 | Folder created. Meta APIs researched against official docs, database queried, plan written. Nothing implemented |
