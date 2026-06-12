# Virtual Try-On Feature — Master Document
**Project:** Habiba Minhas — AI-Powered Virtual Try-On
**Status:** 📋 Phase 8 Planning — fashn.ai + Google Login + Free-Tries (see [`fashn-plan.md`](./fashn-plan.md))
**Started:** June 2026
**Owner:** Habiba Minhas (umm-e-habiba)
**AI Provider:** **fashn.ai** (`tryon-v1.6`) — chosen after testing Gemini, Puter.js, and IDM-VTON

> ⚠️ **Active plan = [`fashn-plan.md`](./fashn-plan.md).** The Puter.js/Gemini notes below this line are historical.
> Only new secret required: `FASHN_API_KEY`. Google login uses free OAuth (no Google Cloud billing).

---

## What Is This?

A feature where any customer visiting your product page clicks one button — **"Try it On"** — uploads their photo, and within seconds sees themselves wearing your dress. No account needed. No photo stored. No download button. Just a powerful moment of "oh, that's how I'd look."

This is not a gimmick. This is a conversion tool disguised as a feature.

---

## Quick Navigation

| Document | Purpose |
|----------|---------|
| **[fashn.ai Plan](./fashn-plan.md)** | **★ ACTIVE PLAN** — fashn.ai + Google login + free-tries, full architecture & steps |
| **[Google Login Setup](./google-login-setup.md)** | **★ DO THIS** — step-by-step dashboard guide for owner to enable Google Sign-In |
| [Business Analysis](./business-analysis.md) | Will this work? Sales impact, SEO, pros/cons, risks |
| [Technical Plan](./technical-plan.md) | Historical — Gemini/Puter.js build details |
| [Tracker](./tracker.md) | Live progress checklist — Phase 8 is the active section |

---

## The Vision in One Paragraph

Right now, when a customer lands on your product page, they see a beautiful dress on a model. They think: *"But will it look good on ME?"* That doubt is the single biggest reason they don't buy. This feature eliminates that doubt. They upload their photo, they see themselves in your dress, and that emotional "yes, I look good" moment is what triggers the purchase. No other clothing brand in Pakistan is doing this right now. That is your window.

---

## Feature Summary

- **Button Location:** On every product detail page, inside the action section
- **Button Text:** `✦ Try it On` (on desktop and mobile)
- **What Happens:** A modal opens, they upload a photo, Gemini AI generates the try-on
- **Result View:** Left = their original photo | Right = them in your dress
- **Buttons in Result:** "Try Another Photo" + "Shop This Look" (scrolls to Add to Bag)
- **Privacy:** Photo processed in memory, never saved, never stored, immediately discarded
- **Protection:** Right-click disabled, no download button, watermark added
- **Cost to You:** Free (Gemini free tier = 1,500 try-ons per day)
