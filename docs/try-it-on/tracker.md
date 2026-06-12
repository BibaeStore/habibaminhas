# Progress Tracker — Virtual Try-On Feature
**Last Updated:** 11 June 2026
**Overall Status:** 🔁 Phases 1 & 7 SUPERSEDED. **Phase 8 (fashn.ai + Google Login + Free-Tries) is the active plan.**

> **Active direction:** See [`fashn-plan.md`](./fashn-plan.md) — the authoritative plan.
> Gemini-direct (Phase 1) and Puter.js (Phase 7) are kept below for history only.
> fashn.ai is the chosen provider (only approach that produced correct results in real testing).

---

## Status Legend
- ⬜ Not started
- 🔄 In progress
- ✅ Done
- ❌ Blocked / Issue
- 🔁 Replaced / Superseded

---

## Phase 0 — Setup (Owner: You)

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 0.1 | Get Gemini API Key from aistudio.google.com | You | ✅ | Done |
| 0.2 | Add `GEMINI_API_KEY=...` to `.env.local` | You | ✅ | Done — key is present |
| 0.3 | Run `npm install @google/generative-ai` | You | ✅ | Done |
| 0.4 | Confirm API key is correct | You | ✅ | AQ. format confirmed valid |

**Phase 0 — 100% Complete.**

---

## Phase 1 — Backend API Route (Gemini Direct)

| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.1 | Create `app/api/virtual-try-on/route.ts` | New file | ✅ | Built and functional |
| 1.2 | File type validation (JPG/PNG/WebP only) | route.ts | ✅ | |
| 1.3 | File size validation (max 10MB) | route.ts | ✅ | |
| 1.4 | Read user image into server memory | route.ts | ✅ | Never touches disk |
| 1.5 | Fetch product image server-side | route.ts | ✅ | |
| 1.6 | Initialize Gemini client | route.ts | ✅ | REST API (no SDK) |
| 1.7 | Call Gemini with both images + prompt | route.ts | ✅ | `gemini-2.5-flash-image` |
| 1.8 | Extract generated image from response | route.ts | ✅ | |
| 1.9 | Return base64 to frontend | route.ts | ✅ | |
| 1.10 | Error handling for all failure cases | route.ts | ✅ | |
| 1.11 | Set `maxDuration = 60` for slow Gemini calls | route.ts | ✅ | |

**Phase 1 — 100% Built. Currently on STANDBY (not the active path).**  
This route is preserved and can be reactivated in minutes if Google Cloud billing is resolved.

---

## Phase 2 — Modal Component (UI)

| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 2.1 | Create `components/product/try-on-modal.tsx` | New file | ✅ | |
| 2.2 | Modal overlay (backdrop + close on Escape) | Modal | ✅ | Bottom-sheet on mobile, centered on desktop |
| 2.3 | Upload state — drag-and-drop zone | Modal | ✅ | |
| 2.4 | Upload state — click to browse | Modal | ✅ | Keyboard accessible |
| 2.5 | Privacy notice — always visible in modal header | Modal | ✅ | Updated for Puter.js accuracy |
| 2.6 | Privacy reminder — shown during loading state | Modal | ✅ | |
| 2.7 | Privacy reminder — shown below result image | Modal | ✅ | |
| 2.8 | Photo quality tips (lighting, pose, full body) | Modal | ✅ | |
| 2.9 | Category-specific guidance text (ladies / kids) | Modal | ✅ | Config object lookup |
| 2.10 | Category-specific upload label | Modal | ✅ | |
| 2.11 | Category-specific CTA text | Modal | ✅ | |
| 2.12 | Frontend file size + type check before upload | Modal | ✅ | |
| 2.13 | Loading state — spinner + 8 rotating messages + progress bar | Modal | ✅ | |
| 2.14 | Result state — left/right split view (stacks on mobile) | Modal | ✅ | |
| 2.15 | Result protection — right-click disabled | Modal | ✅ | |
| 2.16 | Result protection — transparent overlay | Modal | ✅ | |
| 2.17 | Result protection — pointer-events none on img | Modal | ✅ | |
| 2.18 | "Try Another Photo" button | Modal | ✅ | Full reset with state cleanup |
| 2.19 | "Shop This Look" button (closes modal) | Modal | ✅ | |
| 2.20 | Error state with user-friendly message | Modal | ✅ | |
| 2.21 | Mobile-responsive layout | Modal | ✅ | |

---

## Phase 3 — Connect to Product Page

| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 3.1 | Add lazy import for TryOnModal | add-to-cart-section.tsx | ✅ | `dynamic` + `ssr: false` |
| 3.2 | Add `isTryOnOpen` state | add-to-cart-section.tsx | ✅ | |
| 3.3 | `category` already a prop — no change needed | add-to-cart-section.tsx | ✅ | |
| 3.4 | Add "✦ Virtual Try Room" button — desktop, below WhatsApp | add-to-cart-section.tsx | ✅ | |
| 3.5 | Add "✦ Virtual Try Room" button — mobile scrollable area | add-to-cart-section.tsx | ✅ | `lg:hidden`, not in sticky bar |
| 3.6 | Add tiny privacy text below both buttons | add-to-cart-section.tsx | ✅ | Lock icon + text |
| 3.7 | Render modal conditionally | add-to-cart-section.tsx | ✅ | `isTryOnOpen && showTryOn` |
| 3.8 | Pass productImage + productTitle + category to modal | add-to-cart-section.tsx | ✅ | |
| 3.9 | `image` already passed from product page — confirmed wired | product page | ✅ | `mainImage` already correct |

---

## Phase 4 — Testing (Original Gemini path — BLOCKED by billing)

These tests could not be run because Google Cloud billing could not be added.  
They will apply again if billing is sorted and Phase 1 route is reactivated.  
**Phase 7 (below) covers the new Puter.js testing checklist.**

| # | Test | Status | Notes |
|---|------|--------|-------|
| 4.1 | Upload clear front-facing photo | ⬜ | Blocked — billing issue |
| 4.2 | Upload dark/blurry photo | ⬜ | Blocked — billing issue |
| 4.3–4.14 | All other tests | ⬜ | Blocked — billing issue |

---

## Phase 5 — Polish (Original plan)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Add rate limiting (5 req/min per IP) | 🔁 | Not needed — Puter.js handles quota at user level |
| 5.2 | Add analytics event: `try_on_opened` | ⬜ | Deferred to after testing |
| 5.3 | Add analytics event: `try_on_generated` | ⬜ | Deferred |
| 5.4 | Add analytics event: `try_on_shop_clicked` | ⬜ | Deferred |
| 5.5 | Verify watermark appears on all results | ⬜ | Part of Phase 7 testing |
| 5.6 | Add disclaimer text below result | ✅ | Already in result state |

---

## Phase 6 — Go Live

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Deploy to production | ⬜ | After Phase 7 testing passes |
| 6.2 | Add `GEMINI_API_KEY` to production env | ⬜ | Not needed for Puter.js path — only needed if reverting to Gemini direct |
| 6.3 | Test on live website | ⬜ | After deploy |
| 6.4 | Announce on Instagram | ⬜ | After live |
| 6.5 | Make a reel showing the feature | ⬜ | After live |
| 6.6 | Write blog post | ⬜ | After live |

---

## Phase 7 — Puter.js Migration ✅ COMPLETE

**What changed:** The AI call moved from a server-side API route (Gemini REST) to a  
client-side Puter.js call. The entire modal UI is unchanged. Zero impact on product page speed.

### Migration Tasks

| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 7.1 | Research Puter.js capabilities and fit | — | ✅ | Full research completed |
| 7.2 | Confirm `input_images[]` supports 2 images in Gemini provider | — | ✅ | Confirmed via docs |
| 7.3 | Confirm anonymous-first usage is supported | — | ✅ | Documented by Puter |
| 7.4 | Add `Window.puter` TypeScript type declaration | try-on-modal.tsx | ✅ | `declare global` at module top |
| 7.5 | Add `loadPuter()` — dynamic script loader (singleton) | try-on-modal.tsx | ✅ | Loads `js.puter.com/v2/` on demand |
| 7.6 | Add `fileToBase64()` — customer photo → base64 | try-on-modal.tsx | ✅ | FileReader API |
| 7.7 | Add `urlToBase64()` — product image URL → base64 | try-on-modal.tsx | ✅ | fetch + FileReader, CORS safe |
| 7.8 | Add `buildTryOnPrompt()` — category-aware prompt | try-on-modal.tsx | ✅ | Moved from route.ts |
| 7.9 | Add `isAuthError()` — detect quota/login errors | try-on-modal.tsx | ✅ | Checks 10 error keywords |
| 7.10 | Add `friendlyError()` — human-readable error messages | try-on-modal.tsx | ✅ | |
| 7.11 | Add `"needsLogin"` to ModalState type | try-on-modal.tsx | ✅ | 5th modal state |
| 7.12 | Rewrite `handleGenerate()` — anonymous-first flow | try-on-modal.tsx | ✅ | Tries anon → detects auth error → shows login |
| 7.13 | Add `runGeneration()` — shared generation logic | try-on-modal.tsx | ✅ | Used by both handleGenerate + handleLoginAndRetry |
| 7.14 | Add `handleLoginAndRetry()` — login popup + retry | try-on-modal.tsx | ✅ | Opens Puter login, retries after |
| 7.15 | Add `needsLogin` UI state with Google login button | try-on-modal.tsx | ✅ | Branded, explains why, user-friendly |
| 7.16 | Update privacy text to be accurate for Puter.js | try-on-modal.tsx | ✅ | "processed securely through our AI provider" |
| 7.17 | Mark `route.ts` as STANDBY with reactivation instructions | route.ts | ✅ | Comment block at top of file |
| 7.18 | Update all documentation (this tracker + technical plan + README) | docs/ | ✅ | |

### Phase 7 Testing Checklist

| # | Test | Expected Result | Status |
|---|------|----------------|--------|
| 7T.1 | Open product page, click "Virtual Try Room" | Modal opens cleanly | ⬜ |
| 7T.2 | Upload a photo, click "See Yourself in This Look" | Puter.js loads (script injected), generation starts | ⬜ |
| 7T.3 | Anonymous generation attempt (no login) | Image generated without any login popup | ⬜ |
| 7T.4 | Result displays correctly | Left: user photo, Right: AI try-on | ⬜ |
| 7T.5 | Right-click result image | Context menu does NOT appear | ⬜ |
| 7T.6 | Watermark visible on result | "habibaminhas.com" bottom-right | ⬜ |
| 7T.7 | "Try Another Photo" resets cleanly | Back to upload state, file cleared | ⬜ |
| 7T.8 | "Shop This Look" closes modal | Modal dismissed, product page visible | ⬜ |
| 7T.9 | Simulate quota exceeded | "Sign in free to continue" screen appears | ⬜ |
| 7T.10 | Click "Continue with Google" | Puter login popup opens | ⬜ |
| 7T.11 | Complete login | Generation retries automatically | ⬜ |
| 7T.12 | Click "Try Again Later" | Modal closes | ⬜ |
| 7T.13 | Upload file >10MB | Error shown, no API call made | ⬜ |
| 7T.14 | Upload non-image file | Rejected with clear error | ⬜ |
| 7T.15 | Press Escape key | Modal closes | ⬜ |
| 7T.16 | Test on mobile (Android Chrome) | Upload works, modal responsive | ⬜ |
| 7T.17 | Test on iPhone Safari | Upload works | ⬜ |
| 7T.18 | Check page load speed | No regression — Puter.js only loads on button click | ⬜ |
| 7T.19 | Check no CORS error for product image | `urlToBase64()` fetches from old Supabase bucket cleanly | ⬜ |

---

## Phase 8 — fashn.ai + Google Login + Free-Tries System 📋 PLANNED (NOT STARTED)

**Full plan:** [`fashn-plan.md`](./fashn-plan.md)
**Goal:** Production-ready try-on on fashn.ai, gated by Google login, with per-user + global daily limits. No payments this phase.

### 8A — fashn.ai Core

| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 8A.1 | Sign up at fashn.ai, get API key | You | ⬜ | |
| 8A.2 | Buy small credit top-up (~$7.50 / 100 tries, Stripe) | You | ⬜ | Accepts Visa/Mastercard |
| 8A.3 | Add `FASHN_API_KEY` to `.env.local` | You | ⬜ | The ONLY new env var |
| 8A.4 | API route rewritten for fashn.ai (`tryon-v1.6`, quality mode) | route.ts | ✅ | Draft in place — needs key to test |
| 8A.5 | Modal calls server route (not Puter.js) | try-on-modal.tsx | ✅ | Already switched |
| 8A.6 | Verify quality with real product photos | — | ⬜ | After key added |

### 8B — Database & Usage Tracking

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8B.1 | Create `try_on_usage` table (migration) | ⬜ | user_id, user_email, product_slug, category, created_at |
| 8B.2 | Keep RLS ON; access only via service-role in API | ⬜ | Never touched from browser |
| 8B.3 | Count helper: per-user rolling 24h | ⬜ | `< 3` |
| 8B.4 | Count helper: global calendar day | ⬜ | `< 20` |

### 8C — Google Authentication (OAuth — free, no billing)

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 8C.1 | Create OAuth Client ID in Google Cloud Console | You | ⬜ | Free; no payment card needed — **see [google-login-setup.md](./google-login-setup.md)** |
| 8C.2 | Enable Google provider in Supabase + paste creds | You | ⬜ | Creds live in Supabase, not `.env` |
| 8C.3 | Add `app/auth/callback/route.ts` | — | ⬜ | Standard Supabase SSR callback |
| 8C.4 | `signInWithOAuth({ provider: "google" })` wiring | — | ⬜ | |

### 8D — Limit Enforcement (server-side)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8D.1 | Verify Supabase session in API route → get user id/email | ⬜ | Reject if not logged in |
| 8D.2 | Global check ≤ 20/day → else `globalBusy` | ⬜ | Hard cost cap |
| 8D.3 | Per-user check ≤ 3/24h → else `limitReached` | ⬜ | Rolling window |
| 8D.4 | Insert usage row only on successful generation | ⬜ | Failed tries don't count |
| 8D.5 | Tunable constants (3 / 20 / 24h) at top of route | ⬜ | Easy to adjust |

### 8E — Modal States

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8E.1 | `needsLogin` state + Google button | ⬜ | First screen if logged out |
| 8E.2 | "X of 3 free tries left today" counter | ⬜ | Shown on upload screen |
| 8E.3 | `limitReached` state (come back tomorrow / WhatsApp) | ⬜ | |
| 8E.4 | `globalBusy` state | ⬜ | |
| 8E.5 | Map server error codes → correct states | ⬜ | 401→needsLogin, 429 user→limitReached, 429 global→globalBusy |

### 8F — Cart Integration

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8F.1 | On Try On click: `addItem(product)` + `openDrawer()` + open modal on top | ⬜ | CONFIRMED: drawer slides in behind modal |
| 8F.2 | Drawer stays open after modal closes (shows item in bag) | ⬜ | The conversion nudge |
| 8F.3 | Every click re-adds product (intentional) | ✅ | Owner confirmed 11 Jun 2026 |

### 8G — Testing & Docs

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8G.1 | Logged-out → sees Google login | ⬜ | |
| 8G.2 | Login → returns to product page logged in | ⬜ | |
| 8G.3 | First try-on works, counter shows 2 left | ⬜ | |
| 8G.4 | 4th try in 24h → `limitReached` | ⬜ | |
| 8G.5 | 21st site-wide try → `globalBusy` | ⬜ | |
| 8G.6 | Counters reset correctly after window | ⬜ | |
| 8G.7 | Cart add + drawer behavior correct | ⬜ | |
| 8G.8 | Mobile + desktop pass | ⬜ | |
| 8G.9 | Update all docs final | ⬜ | |

---

## Decisions Log

| Date | Decision | Reason |
|------|---------|--------|
| June 2026 | Use Gemini AI for image generation | Free tier, no storage, privacy-safe |
| June 2026 | No image storage at any point | Customer privacy + lower server cost |
| June 2026 | Lazy load modal | Zero impact on product page speed |
| June 2026 | Disable right-click but accept screenshots happen | Technically impossible to block OS screenshots |
| June 2026 | Add "Shop This Look" not "Add to Cart" | Size selection required before adding to cart |
| June 2026 | Button name: "Virtual Try Room" not "Try it On" | More distinct, memorable, premium-sounding |
| June 2026 | Button placed below WhatsApp button | Logical flow: Add to Bag → Save → Share → Try Room |
| June 2026 | Privacy notice in 3 places | Pakistani users need repeated trust signals |
| June 2026 | Category-aware guidance in modal | Prevents wrong photo uploads = better AI results |
| June 2026 | IP rate limiting deferred | Not needed at current traffic level |
| June 2026 | **Switch to Puter.js** | Google Cloud billing could not be added (card rejection). Puter.js is a zero-cost developer-side alternative where each user uses their own AI quota |
| June 2026 | Anonymous-first approach in Puter.js | Best UX — most users will never see a login prompt. Login only appears if anonymous quota is exhausted |
| June 2026 | Keep `route.ts` on standby | Full Gemini implementation preserved. If billing is sorted, can switch back in minutes |
| June 2026 | Use Puter.js Gemini provider | Same model (`gemini-2.5-flash-image`), same prompt — consistent output quality |
| 11 Jun 2026 | **Abandon Puter.js + general image models** | Gemini & GPT Image 2 are *generators*, not *try-on* models — they changed the face and the outfit. Wrong tool category |
| 11 Jun 2026 | Tested IDM-VTON (HuggingFace free GPU) | Real try-on but free quota ~10/day, dupatta drifted, face sometimes changed. Usable but limited |
| 11 Jun 2026 | **Choose fashn.ai (`tryon-v1.6`)** | Owner tested it manually → correct result, face preserved, outfit faithful. Stripe billing works for Pakistan |
| 11 Jun 2026 | **Require Google login before try-on** | Identifies each user → enables per-account free-try limits + saves user data. OAuth is free, unrelated to Google Cloud billing |
| 11 Jun 2026 | Per-user 3/24h + global 20/day limits | Cost safety: global cap guarantees max ~$1.50/day spend. Enforced server-side, can't be bypassed |
| 11 Jun 2026 | **No payment gateway this phase** | Bank/gateway not ready. Free tries only now; credits model deferred to Phase 9 |
| 11 Jun 2026 | Auto-add product to cart on Try On click | Conversion nudge owner saw on other sites; drawer slides in on "Shop This Look" to avoid double-overlay |

---

## Blockers and Issues

| Date | Issue | Resolution | Status |
|------|-------|-----------|--------|
| June 2026 | API key format verified — AQ. is valid newer Google format | Confirmed via screenshot from AI Studio | ✅ Resolved |
| June 2026 | Google Cloud billing could not be added — NayaPay and other Pakistani cards rejected | Switched to Puter.js (zero developer billing) | ✅ Resolved via Puter.js |

---

## Completion Summary

| Phase | Tasks | Done | % |
|-------|-------|------|---|
| Phase 0 — Setup | 4 | 4 | 100% ✅ |
| Phase 1 — Backend (Gemini Direct, on standby) | 11 | 11 | 100% ✅ |
| Phase 2 — Modal UI | 21 | 21 | 100% ✅ |
| Phase 3 — Product Page Connect | 9 | 9 | 100% ✅ |
| Phase 4 — Testing (Gemini path, blocked) | 14 | 0 | 0% ❌ |
| Phase 5 — Polish | 6 | 2 | 33% 🔄 |
| Phase 6 — Go Live | 6 | 0 | 0% |
| Phase 7 — Puter.js Migration | 18 | 18 | 100% ✅ |
| Phase 7 — Puter.js Testing | 19 | 0 | 0% ← **NEXT STEP** |
| **Total (excl. blocked Phase 4)** | **94** | **65** | **69%** |

---

## What's Next

**Immediate:** Run Phase 7 Testing checklist. Start the dev server and test the full flow:
```
npm run dev
```
Go to any ladies-suits or kids-formal product page → click Virtual Try Room → upload a photo → observe result.

**If Puter.js generates successfully anonymously:** Feature is ready for Phase 6 (Go Live).

**If anonymous quota is immediately exhausted:** Test the login flow (7T.9–7T.12).

**If Gemini provider via Puter.js doesn't support two `input_images`:** Switch model to `gpt-image-2` with `provider: "openai"` in `runGeneration()` — one line change in `try-on-modal.tsx`.

**Future (when billing is sorted):** Reactivate `route.ts`, restore `fetch("/api/virtual-try-on/")` in modal — faster, more reliable, no login needed for anyone.
