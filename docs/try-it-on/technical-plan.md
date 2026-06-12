# Technical Plan — Virtual Try-On
**For:** Habiba Minhas Website  
**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Supabase, Gemini AI

---

## Architecture Overview

```
Customer clicks "Try it On"
        ↓
TryOnModal opens (client-side React component)
        ↓
Customer uploads photo (stays in browser memory only)
        ↓
Click "Try it on with AI"
        ↓
Frontend sends: [customer photo + product image URL] → POST /api/virtual-try-on
        ↓
Server (Next.js API Route):
  - Reads customer photo from memory (never touches disk)
  - Fetches product image from Supabase CDN
  - Sends both to Gemini API with styling prompt
  - Receives generated image as base64 string
  - Returns base64 to frontend (never saves anything)
        ↓
Frontend displays result:
  Left: customer's original photo
  Right: AI-generated try-on image (protected from download)
        ↓
Customer clicks "Shop This Look" → modal closes, page scrolls to Add to Bag
```

**Zero storage at any point. Customer image lives in browser RAM for ~10 seconds total.**

---

## What You Need to Provide (Your Checklist)

### Before I Write Any Code

| # | What | How | Status |
|---|------|-----|--------|
| 1 | **Gemini API Key** | Go to [aistudio.google.com](https://aistudio.google.com) → Sign in with Google → Click "Get API Key" → Create API Key → Copy it | ⬜ Not done |
| 2 | **Add key to `.env.local`** | Open `.env.local` file, add this line: `GEMINI_API_KEY=paste_your_key_here` | ⬜ Not done |
| 3 | **Install the SDK** | Run this in terminal: `npm install @google/generative-ai` | ⬜ Not done |

That's it. Three steps. I handle everything else.

---

## Technology Stack Breakdown

### What Each Technology Does in This Feature

| Technology | Role | Who manages it |
|-----------|------|----------------|
| **React** | The modal UI, upload area, result display | Me (code) |
| **Next.js API Route** | The server that calls Gemini | Me (code) |
| **Gemini AI (Google)** | Actually generates the try-on image | Google's servers |
| **`@google/generative-ai`** | The SDK (library) to talk to Gemini | Me (code) |
| **Tailwind CSS** | Styling the modal to match your brand | Me (code) |
| **Browser FormData** | Sends image from browser to your server | Me (code) |
| **Browser memory** | Where customer's image lives temporarily | Automatic |
| **Your server** | Middleman between browser and Gemini | Next.js handles |

### Why We Have a Server in the Middle
The customer's browser cannot call Gemini directly because:
1. Your API key would be exposed (anyone could steal it and use your account)
2. The product image URL has CORS restrictions
So: browser → your server → Gemini → your server → browser. This is the correct and secure pattern.

---

## Files to Create and Edit

### New Files (2 files)

#### File 1: `app/api/virtual-try-on/route.ts`
**What it is:** A server-side API endpoint  
**What it does:**
- Receives customer photo + product image URL
- Validates: file must be JPG/PNG/WebP, max 10MB
- Fetches product image from URL
- Sends both images to Gemini with the prompt
- Returns generated image as base64
- Never writes anything to disk

**Key Gemini Model:** `gemini-2.0-flash-exp-image-generation`  
This is Google's experimental image generation model. It can take two images and generate a new one based on your instructions.

**The Prompt We Send to Gemini (category-aware — sent dynamically based on product category):**

For **ladies-suits:**
```
You are a fashion virtual try-on AI for Habiba Minhas, a premium Pakistani clothing brand.

Image 1 is a woman's photo (the customer). Image 2 is a ladies outfit/suit from our collection.

Generate a realistic image of this woman wearing the outfit from Image 2.
Rules:
- Keep the woman's face, skin tone, and body proportions exactly the same
- Replace only her clothing with the outfit from Image 2
- Maintain natural lighting and pose
- Make it look photorealistic
- Add a small watermark "habibaminhas.com" in the bottom-right corner in light text
```

For **kids-formal:**
```
You are a fashion virtual try-on AI for Habiba Minhas, a premium Pakistani clothing brand.

Image 1 is a child's photo (the customer's kid). Image 2 is a kids formal outfit from our collection.

Generate a realistic image of this child wearing the outfit from Image 2.
Rules:
- Keep the child's face, skin tone, and body proportions exactly the same
- Replace only the clothing with the outfit from Image 2
- Maintain natural lighting and pose
- Make it look photorealistic
- Add a small watermark "habibaminhas.com" in the bottom-right corner in light text
```

For **accessories / baby-products:**
```
(Same base prompt — accessories don't have a strong person requirement,
baby products use the same child-focused version as kids-formal)
```

**Why category-aware prompts matter:**
Sending the right context to Gemini gives better results. If we tell Gemini "this is a ladies outfit" but someone uploads their kid's photo, Gemini will still try — the result will just look odd. The UI warns the customer about this (see modal guidance below).

#### File 2: `components/product/try-on-modal.tsx`
**What it is:** A React client component  
**What it does:**
- Shows the modal overlay
- Upload area (click to browse OR drag-and-drop)
- Privacy notice (prominent, at the top of the modal)
- Category-specific photo guidance (ladies vs kids — see section below)
- Photo quality checklist shown before upload
- Loading state with branded message
- Result split-view
- Two buttons: "Try Another Photo" + "Shop This Look"
- Protection: right-click disabled, transparent overlay on result, no download option

---

### Existing Files to Edit (1 file)

#### File 3: `components/product/add-to-cart-section.tsx`
**What changes:**
- Import `TryOnModal` (lazy-loaded with React's `dynamic` import)
- Add state: `isTryOnOpen` (boolean)
- Add `category` prop so modal knows which guidance to show
- Add **"Virtual Try Room"** button — outlined style with sparkle icon, placed **below the WhatsApp button** (last in the action stack)
- On mobile: same button shown in page body, below WhatsApp
- Below the button: tiny privacy line — *"Your photo is never stored. Gone when you close."*
- When clicked: opens modal, passes product image + title + category

---

## Implementation Phases

### Phase 0 — Setup (You Do This)
- Get Gemini API key
- Add to `.env.local`
- Run `npm install @google/generative-ai`

**Estimated time for you:** 10 minutes

---

### Phase 1 — Backend API Route
**I will build:** `app/api/virtual-try-on/route.ts`

Steps inside this file:
1. Read multipart form data (user image file + product URL)
2. Validate file type and size
3. Convert user image to base64 in memory
4. Fetch product image server-side
5. Initialize Gemini client with API key
6. Call Gemini with both images + prompt
7. Extract generated image from response
8. Return base64 image + mime type to frontend
9. Error handling for all failure cases

**Test it:** Using a browser fetch call or Postman before connecting the UI

---

### Phase 2 — Modal Component
**I will build:** `components/product/try-on-modal.tsx`

Steps:
1. Modal shell (fixed overlay, centered card, close on Escape key)
2. Upload state: drag-and-drop zone + file input + privacy notice
3. Preview state: customer's uploaded photo shown, "Try it On" button
4. Loading state: spinner + "AI is styling you..." message
5. Result state: side-by-side comparison
6. Protection layer on result image
7. "Try Another Photo" button (resets state)
8. "Shop This Look" button (closes modal)
9. Error state with helpful message
10. Mobile-responsive layout

**Image upload tips shown in UI:**
- Use a clear, front-facing photo
- Good lighting works best
- Full body or upper body photos recommended

---

### Phase 3 — Connect to Product Page
**I will edit:** `components/product/add-to-cart-section.tsx`

Steps:
1. Add lazy import for TryOnModal (so it doesn't slow initial page load)
2. Add `productImage` prop to the component
3. Add `category` prop (already available — just pass it through)
4. Add `isTryOnOpen` state
5. Add **"Virtual Try Room"** button to desktop layout — below the WhatsApp button
6. Add **"Virtual Try Room"** button to mobile layout — below WhatsApp
7. Add tiny privacy text below button: *"Your photo is never stored. Gone when you close."*
8. Render `<TryOnModal>` conditionally when open
9. Pass: `productImage`, `productTitle`, `category`, `onClose` handler

---

### Phase 4 — Testing
Steps:
1. Test with a clear photo → should work well
2. Test with a dark/blurry photo → should show degraded but valid result
3. Test right-click on result → should not show save option
4. Test mobile upload → camera roll should open
5. Test "Try Another Photo" → should reset cleanly
6. Test "Shop This Look" → should close modal (and ideally focus Add to Bag)
7. Test on slow connection → loading state should handle gracefully
8. Test Gemini API error → error message should show, not crash the page

---

### Phase 5 — Polish and Edge Cases
1. Add rate limiting (max 5 requests per IP per minute) to prevent API abuse
2. Add file size check on frontend before upload (don't wait for server rejection)
3. Test on iPhone (Safari has file upload quirks)
4. Test on Samsung (Android Chrome)
5. Verify watermark appears in generated images
6. Add Google Analytics event tracking: `try_on_opened`, `try_on_generated`, `try_on_shop_clicked`

---

## Modal UI Design — Detailed

### Button on Product Page (Below WhatsApp Button)
```
  [  ✦ Virtual Try Room  ]   ← full-width outlined button, below WhatsApp

  🔒 Your photo is never stored. Gone the moment you close.  ← tiny text, 10px
```

---

### Modal — Upload State (Ladies Category Example)

```
┌──────────────────────────────────────────────┐
│  ✦ Virtual Try Room                     [X]  │
│  Midnight Silk 3-Piece Suit                  │
├──────────────────────────────────────────────┤
│                                              │
│  🔒 Privacy First                           │
│  Your photo is processed instantly and is   │
│  never saved to any server or database.     │
│  It disappears the moment you close this    │
│  window or close the browser tab.           │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  👗 This is a ladies outfit                 │
│  For the best result, please upload a       │
│  photo of yourself (a woman). Uploading     │
│  a different person's photo will give       │
│  unexpected results.                        │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  📸 Tips for the best result:               │
│  ✓ Use a clear, well-lit photo              │
│  ✓ Front-facing or slightly angled          │
│  ✓ Full body or upper body (not just face)  │
│  ✓ Plain background works best             │
│  ✗ Avoid dark, blurry, or far-away photos  │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │      ↑  Upload Your Photo           │   │
│  │   Drag & drop or click to browse    │   │
│  │   JPG, PNG, WebP · Max 10MB         │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  [  ✦ See Yourself in This Look  ]          │
│                                              │
└──────────────────────────────────────────────┘
```

### Modal — Upload State (Kids Category Example)

```
┌──────────────────────────────────────────────┐
│  ✦ Virtual Try Room                     [X]  │
│  Embroidered Kids Formal Suit                │
├──────────────────────────────────────────────┤
│  🔒 Privacy First  (same privacy text)      │
├──────────────────────────────────────────────┤
│                                              │
│  👦👧 This is a kids outfit                 │
│  For the best result, please upload a       │
│  photo of your child. Uploading an adult    │
│  photo will give the wrong result.          │
│                                              │
├──────────────────────────────────────────────┤
│  📸 Tips for the best result:  (same tips)  │
│  ┌──────────────────────────────────────┐   │
│  │      ↑  Upload Your Child's Photo   │   │
│  └──────────────────────────────────────┘   │
│  [  ✦ See Your Child in This Look  ]        │
└──────────────────────────────────────────────┘
```

### Modal — Loading State
```
┌──────────────────────────────────────────────┐
│  ✦ Virtual Try Room                     [X]  │
├──────────────────────────────────────────────┤
│                                              │
│                 ◌  (spinner)                │
│                                              │
│         Our AI is styling you...            │
│       This takes about 5–15 seconds        │
│                                              │
│  🔒 Your photo is being processed           │
│     securely and will not be saved.         │
│                                              │
└──────────────────────────────────────────────┘
```

### Modal — Result State
```
┌──────────────────────────────────────────────┐
│  ✦ Virtual Try Room                     [X]  │
├──────────────────────────────────────────────┤
│                                              │
│   Your Photo          Wearing This Look     │
│  ┌────────────┐      ┌────────────────┐    │
│  │            │      │                │    │
│  │  Original  │      │  AI Try-On     │    │
│  │  Photo     │      │  Result        │    │
│  │            │      │  [watermark    │    │
│  │            │      │  habibaminhas] │    │
│  └────────────┘      └────────────────┘    │
│                                              │
│  ⚠ AI-generated preview. Actual product    │
│    appearance may vary slightly.            │
│                                              │
│  🔒 This image is not saved anywhere.      │
│     It will disappear when you close this. │
│                                              │
│  [ Try Another Photo ]  [ Shop This Look ] │
└──────────────────────────────────────────────┘
```

---

## Category-Aware Modal Guidance — Full Details

The modal receives the `category` prop and shows different messages:

| Category | Icon | Header text | Upload label | CTA button text |
|----------|------|-------------|--------------|-----------------|
| `ladies-suits` | 👗 | "This is a ladies outfit" | "Upload Your Photo" | "See Yourself in This Look" |
| `kids-formal` | 👦👧 | "This is a kids outfit" | "Upload Your Child's Photo" | "See Your Child in This Look" |
| `baby-products` | 👶 | "This is a baby outfit" | "Upload Your Baby's Photo" | "See Your Baby in This Look" |
| `accessories` | ✨ | "This is an accessory" | "Upload Your Photo" | "See How It Looks on You" |

**Why this matters:** If a mother is shopping for kids clothes, she's uploading her child's photo — the UI should make that obvious, not confusing. Getting the wrong image uploaded is the #1 reason for bad AI results. Clear guidance = better results = happier customers.

---

## Privacy Notice — Shown in Three Places

### Place 1: Product Detail Page (Below the "Virtual Try Room" Button)
```
Small text, 10–11px, muted color:
"🔒 Your photo is never stored. Disappears when you close."
```

### Place 2: Modal Header (Every State — Upload, Loading, Result)
```
Subtle banner inside the modal, always visible:
"Your photo is processed instantly and never saved to our servers or database.
It is permanently gone the moment you close this window or browser tab."
```

### Place 3: Result State (Below the Generated Image)
```
Small reminder below the result:
"🔒 This image is not saved anywhere and will disappear when you close this."
```

**Why three places?** First-time users are cautious about uploading their photo online — especially in Pakistani culture where privacy matters deeply. Seeing the privacy message in multiple natural places builds trust without being annoying. It's not repeated loudly — it's always gently present.

---

## API Rate Limits and Costs

### Gemini Free Tier (Google AI Studio)
| Limit | Value |
|-------|-------|
| Requests per day | 1,500 |
| Requests per minute | 10 |
| Images per request | 2 (input) + 1 (output) |
| Cost | **Free** |

For a new brand, 1,500/day = 45,000/month try-ons. You won't hit this for a long time.

### When You Need to Pay
Only when you exceed 1,500 try-ons/day consistently. At that point, your brand is popular enough that the cost is trivial (Gemini paid plans are $0.002–0.005 per generation = Rs. 0.56–1.40 per try-on).

---

## What "Lazy Loading" Means and Why It Matters

**The problem without lazy loading:**
Every visitor who opens a product page downloads the entire try-on modal code — even if they never click the button. This adds weight to every product page load.

**With lazy loading:**
The modal code is only downloaded when someone actually clicks "Try it On." Product page speed is completely unchanged. This is important for your Core Web Vitals scores, which directly affect your Google ranking.

**How it works in code:**
```typescript
// Instead of:
import { TryOnModal } from "@/components/product/try-on-modal"

// We use:
const TryOnModal = dynamic(() => import("@/components/product/try-on-modal"), { ssr: false })
```
One line difference. Big performance impact.

---

## Privacy Architecture — For Your Peace of Mind

Here is the exact journey of a customer's photo:

```
1. Customer selects photo on their phone/PC
2. Photo loads into BROWSER MEMORY (RAM) — never touches your server yet
3. Customer clicks "Try it On with AI"
4. Browser sends photo directly to YOUR Next.js server (encrypted HTTPS)
5. Your server reads photo into SERVER MEMORY (RAM) — never written to disk
6. Your server immediately sends it to Gemini (encrypted)
7. Gemini generates result, returns it to your server
8. Your server sends result back to browser
9. Server memory is freed (garbage collected) — photo no longer exists anywhere
10. Browser shows the result image
11. When modal closes, browser memory is also freed
```

**Total time photo exists anywhere:** ~10–15 seconds  
**Times photo is written to disk:** 0  
**Times photo appears in your database:** 0  
**Times photo appears in Supabase storage:** 0  

The privacy notice in the modal is honest and accurate.

---

## Dependencies Added

| Package | Version | Purpose | Size Impact |
|---------|---------|---------|------------|
| `@google/generative-ai` | Latest | Gemini SDK | ~50KB (server only, not in browser bundle) |

**Browser bundle change:** None. This package runs on the server only.

---

## Potential Future Enhancements (Not Now)

These are ideas for later when the feature is proven and you have more traffic:

1. **Save your result to wishlist** — customer can save the try-on image alongside the product
2. **Share on WhatsApp** — one button to share result + product link
3. **Multiple outfits** — show "also try" products alongside the result
4. **Analytics dashboard** — see which products get the most try-ons (indicates interest)
5. **Quality feedback** — thumbs up/down on the result (improves prompt over time)

Do not build these now. Ship the basic version first, see how customers respond.

---

## Phase 7 — Puter.js Migration (June 2026)

### Why This Happened

Google Cloud billing could not be set up (Pakistani cards including NayaPay were rejected). The original Gemini-direct implementation (Phase 1 route) is fully built and functional — it simply cannot be tested or deployed without a billing account.

**Puter.js** was chosen as the solution. It is a JavaScript library that provides a "User Pays" model: the AI call is made by the customer's own Puter.com account quota, not the developer's billing account. Developer cost: Rs. 0 regardless of usage volume.

---

### New Architecture (Active)

```
Customer clicks "Virtual Try Room"
        ↓
Modal opens (same UI as before)
        ↓
Customer uploads photo
        ↓
Click "See Yourself in This Look"
        ↓
loadPuter() — injects js.puter.com/v2/ script (once, on demand)
        ↓
fileToBase64(customerPhoto) ← FileReader API, stays in browser
urlToBase64(productImageUrl) ← fetch from Supabase public bucket (CORS OK)
        ↓
puter.ai.txt2img({
  provider: "gemini",
  model: "gemini-2.5-flash-image",
  input_images: [customerBase64, productBase64],
  prompt: buildTryOnPrompt(category)
})
        ↓
Anonymous attempt first (no login required)
        ↓ succeeds?
Return HTMLImageElement → result.src → display in modal ← YES
        ↓ NO (auth/quota error detected)
Show "needsLogin" state
        ↓
Customer clicks "Continue with Google"
        ↓
puter.auth.signIn() → Puter.com popup (offers Google login)
        ↓
Retry puter.ai.txt2img() — now uses customer's own quota
        ↓
Result displayed
```

**Key difference from original:** Everything runs in the browser. No server involved.

---

### Files Changed in Phase 7

| File | Change | Why |
|------|--------|-----|
| `components/product/try-on-modal.tsx` | Full migration — Puter.js replaces server fetch | New AI provider |
| `app/api/virtual-try-on/route.ts` | Added STANDBY comment block | Preserved for future reactivation |
| `docs/try-it-on/tracker.md` | Phase 7 added, all tasks tracked | Documentation |
| `docs/try-it-on/technical-plan.md` | This section added | Documentation |
| `docs/try-it-on/README.md` | Status updated | Documentation |

---

### Functions Added to `try-on-modal.tsx`

| Function | Type | Purpose |
|----------|------|---------|
| `loadPuter()` | Module-level | Dynamically injects `js.puter.com/v2/` script on first use. Singleton — loads only once per page session. |
| `fileToBase64(file)` | Module-level | Converts customer's File object to raw base64 string via FileReader |
| `urlToBase64(url)` | Module-level | Fetches product image URL (Supabase public bucket) and converts to base64. CORS safe. |
| `buildTryOnPrompt(category)` | Module-level | Category-aware prompt builder. Moved here from `route.ts`. |
| `isAuthError(err)` | Module-level | Detects whether an error means "quota exceeded / needs login" vs a real failure |
| `friendlyError(err)` | Module-level | Converts technical errors to customer-readable messages |
| `runGeneration()` | Component-level | Shared generation logic — converts both images, calls Puter.js |
| `handleGenerate()` | Component-level | Anonymous-first flow: try without login, show needsLogin on quota error |
| `handleLoginAndRetry()` | Component-level | Opens Puter login popup, retries generation after successful sign-in |

---

### New Modal State: `needsLogin`

A 5th modal state was added alongside `upload`, `loading`, `result`, `error`.

**When it appears:** When `isAuthError()` returns true on the anonymous Puter.js attempt.

**What it shows:**
- Gold ✦ icon (brand color)
- "Sign in free to continue" heading
- Explanation: today's free AI allowance used up
- "Continue with Google — it's free" button → triggers `handleLoginAndRetry()`
- "Try Again Later" button → closes modal
- Note that the customer's photo is still loaded (no need to re-upload)

---

### Product Image URLs — Confirmed Format

```
https://goykebkdqjrgbofmusjv.supabase.co/storage/v1/object/public/products/[filename]
```

This is a **public** Supabase storage bucket (note `/public/` in the path). Public buckets have CORS headers enabled by default, which means `urlToBase64()` can fetch these URLs directly from the browser without any proxy or CORS errors.

---

### Puter.js Key Facts

| Fact | Detail |
|------|--------|
| Script URL | `https://js.puter.com/v2/` |
| Load method | Dynamic script injection (on first "Try it On" click only) |
| Page speed impact | Zero — not loaded until button is clicked |
| Developer cost | Rs. 0 always |
| Customer cost | Rs. 0 (free daily quota per Puter.com account) |
| AI model used | `gemini-2.5-flash-image` via Gemini provider |
| Login required | Only if anonymous quota exhausted |
| Login method | Puter.com account (can use "Continue with Google") |
| TypeScript | `declare global { interface Window { puter? } }` at module top |

---

### Reverting to Gemini Direct (When Billing Is Sorted)

If a working Visa/Mastercard is added to Google Cloud billing:

1. In `try-on-modal.tsx`, replace `handleGenerate()` with the original fetch-based version
2. Remove all Puter.js functions (loadPuter, fileToBase64, urlToBase64, etc.)
3. `app/api/virtual-try-on/route.ts` is already intact and ready — just remove the STANDBY comment
4. No other files need to change

**Estimated time to revert:** 30 minutes.
