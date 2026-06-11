# Blog Posting Tracker — Habiba Minhas
## Progress: 30/105 Blogs Posted ✅

**Last Updated:** 2026-06-12
**Session:** Batch 5 (Posts 21-25, Kids) + Batch 6 (Posts 26-30, NEW Virtual Try-On pillar) completed
**Next Action:** Post next 5 blogs (Posts 31-35)

> **Note on total count:** The plan was 100 posts. A new **Pillar 7 — Virtual Try-On / Fashion Tech** (Posts 26-30) was inserted after Post 25, so the existing Kids/Baby/Fabric/Culture/Brand posts were renumbered +5. **Total plan is now 105 posts.**

> **⚠️ ARCHITECTURE NOTE (READ BEFORE POSTING):** Blogs are **NOT** `.tsx` files. Each post is a **row in the Supabase `journal_posts` table**, rendered by the single dynamic route `app/journal/[slug]/page.tsx`. "Publishing" = INSERT a row. The `blog-template-structure.md` doc describes the OLD file-based approach and is obsolete for content structure — see "How Posts Are Stored" below.

---

## NEXT 5 BLOGS TO POST (Batch 7)
When user says "post next 5 blogs", these are next:

1. **Post 31** — `care-for-kids-embroidered-outfits-washing-storage`
2. **Post 32** — `best-gift-ideas-kids-pakistan-festive-wear-eid`
3. **Post 33** — `eid-twins-matching-siblings-outfits-pakistan`
4. **Post 34** — `pakistani-girls-festive-wear-toddler-to-teen`
5. **Post 35** — `quality-kids-festive-outfit-mothers-buying-checklist`

---

## HOW POSTS ARE STORED (current system)

- **Table:** `journal_posts` (Supabase). Insert a row to publish.
- **Key columns:** `slug`, `title`, `meta_description`, `keywords`, `category_tag`, `hero_image`, `excerpt`, `content` (jsonb), `author`, `status` (`'published'`), `published_at`.
- **`content` jsonb** is an array of blocks:
  - `{ "type": "intro", "content": "..." }`
  - `{ "type": "section", "heading": "...", "content": "...", "subsections": [{ "title": "...", "content": "..." }], "list": ["..."], "dos": ["..."], "donts": ["..."] }` (content/subsections/list/dos/donts all optional)
  - `{ "type": "faq", "questions": [{ "question": "...", "answer": "..." }] }`
- **Hero image:** path `/blog/[slug].webp` → file lives in `public/blog/`. Owner generates and drops the image in that folder.
- **Internal linking:** related articles auto-render from the same `category_tag`; the sidebar CTA is fixed to `/ladies`. Body text is rendered as plain text (no clickable in-body links), so reference collections by name in prose.

---

## POSTED BLOGS (30)

### Batch 1 — Posted 2026-05-22 (Pillar 1: Ladies)
| # | Title | Slug | Status | Date Posted |
|---|-------|------|--------|-------------|
| 1 | How to Style a 3-Piece Silk Suit for a Pakistani Wedding | `how-to-style-silk-suit-pakistani-wedding` | ✅ Posted | 2026-05-22 |
| 2 | What to Wear to a Pakistani Mehndi Night (Complete Outfit Guide 2026) | `what-to-wear-mehndi-night-pakistan` | ✅ Posted | 2026-05-22 |
| 3 | Barat Outfit Ideas for Pakistani Guests (Not the Bride) | `barat-outfit-ideas-guests-pakistan` | ✅ Posted | 2026-05-22 |
| 4 | Walima Guest Outfit Guide — Elegant Options for Pakistani Women | `walima-guest-outfit-guide-pakistan` | ✅ Posted | 2026-05-22 |
| 5 | Best Eid Outfits for Women in Pakistan (2026 Trend Guide) | `best-eid-outfits-women-pakistan-2026` | ✅ Posted | 2026-05-22 |

### Batch 2 — Posted 2026-05-26 (Pillar 1: Ladies)
| # | Title | Slug | Status | Date Posted |
|---|-------|------|--------|-------------|
| 6 | How to Dress for Eid Dawat — Styling Tips for Pakistani Women | `how-to-dress-eid-dawat-pakistan` | ✅ Posted | 2026-05-26 |
| 7 | Pakistani Formal Wear Guide: Party, Semi-Formal and Festive | `pakistani-formal-wear-guide-party-semi-formal-festive` | ✅ Posted | 2026-05-26 |
| 8 | Unstitched vs Ready-to-Wear Suits — Which Is Better for You? | `unstitched-vs-ready-to-wear-suits-pakistan` | ✅ Posted | 2026-05-26 |
| 9 | How to Pick the Right Size in Pakistani Ready-to-Wear (Sizing Guide) | `how-to-pick-size-pakistani-ready-to-wear` | ✅ Posted | 2026-05-26 |
| 10 | 5 Things to Check Before Buying an Unstitched Suit Online in Pakistan | `5-things-check-buying-unstitched-suit-online-pakistan` | ✅ Posted | 2026-05-26 |

### Batch 3 — Posted 2026-05-31 to 2026-06-04 (Pillar 1: Ladies)
| # | Title | Slug | Status | Date Posted |
|---|-------|------|--------|-------------|
| 11 | How to Care for Silk Suits at Home — Pakistani Climate Tips | `how-to-care-for-silk-suits-at-home-pakistan` | ✅ Posted | 2026-05-31 |
| 12 | Gold Brocade Fabric — What It Is and How to Style It | `gold-brocade-fabric-what-it-is-how-to-style` | ✅ Posted | 2026-06-01 |
| 13 | 7 Ways to Drape a Dupatta for Pakistani Weddings and Formal Events | `7-ways-drape-dupatta-weddings-formal-events` | ✅ Posted | 2026-06-02 |
| 14 | How to Match Accessories with a Formal Pakistani Suit | `how-to-match-accessories-formal-pakistani-suit` | ✅ Posted | 2026-06-03 |
| 15 | Hair Accessories for Pakistani Women — Complete Styling Guide | `hair-accessories-pakistani-women-styling-guide` | ✅ Posted | 2026-06-04 |

### Batch 4 — Posted 2026-06-04 (Pillar 1: Ladies)
| # | Title | Slug | Status | Date Posted |
|---|-------|------|--------|-------------|
| 16 | Pakistani Fashion Color Trends for 2026 | `pakistani-fashion-colour-trends-2026` | ✅ Posted | 2026-06-04 |
| 17 | Best Colors for Pakistani Skin Tones | `best-colours-for-pakistani-skin-tones` | ✅ Posted | 2026-06-04 |
| 18 | Capsule Wardrobe for Pakistani Women — 10 Pieces | `capsule-wardrobe-pakistani-women-10-pieces` | ✅ Posted | 2026-06-04 |
| 19 | How to Style White Suits for Pakistani Occasions | `how-to-style-white-suits-pakistani-occasions` | ✅ Posted | 2026-06-04 |
| 20 | Summer vs Winter Fabric Guide for Pakistani Women | `summer-vs-winter-fabric-guide-pakistani-women` | ✅ Posted | 2026-06-04 |

### Batch 5 — Posted 2026-06-06 to 2026-06-10 (Pillar 2: Kids)
| # | Title | Slug | Status | Date Posted |
|---|-------|------|--------|-------------|
| 21 | Best Eid Dresses for Girls in Pakistan (2026 Guide for Moms) | `best-eid-dresses-girls-pakistan-2026` | ✅ Posted | 2026-06-06 |
| 22 | Kids Festive Wear Guide — Pakistani Weddings | `kids-festive-wear-guide-pakistani-weddings` | ✅ Posted | 2026-06-07 |
| 23 | How to Pick the Right Festive Outfit Size for Your Child | `how-to-pick-right-festive-outfit-size-child-pakistan` | ✅ Posted | 2026-06-08 |
| 24 | Embroidered Kids Suits — Why Handcrafted Is Worth It for Eid | `embroidered-kids-suits-handcrafted-eid-pakistan` | ✅ Posted | 2026-06-09 |
| 25 | Co-ord Sets for Girls — The Easiest Way to Dress Kids | `co-ord-sets-girls-festive-events-pakistan` | ✅ Posted | 2026-06-10 |

### Batch 6 — Posted 2026-06-10 to 2026-06-12 (★ NEW Pillar 7: Virtual Try-On / Fashion Tech)
**Messaging:** Virtual Try Room is presented as **LIVE on select dresses**, **free**, **3 tries per day per user**, "continue with Google" (never say "login"), photo not stored. Mix of educational, topical-authority, and promo.
| # | Title | Slug | Status | Date Posted |
|---|-------|------|--------|-------------|
| 26 | What Is a Virtual Try-On? See Yourself in an Outfit Before You Buy | `what-is-virtual-try-on-see-yourself-outfit-before-buying-pakistan` | ✅ Posted | 2026-06-10 |
| 27 | How to Take the Perfect Photo for a Virtual Try-On | `how-to-take-perfect-photo-virtual-try-on-tips` | ✅ Posted | 2026-06-11 |
| 28 | Online Shopping Without the Guesswork — How AI Try-On Answers "Will It Suit Me?" | `ai-try-on-online-shopping-will-it-suit-me-pakistan` | ✅ Posted | 2026-06-11 |
| 29 | The Future of Online Fashion Shopping in Pakistan — AI, Try-On & What's Next | `future-online-fashion-shopping-pakistan-ai-try-on` | ✅ Posted | 2026-06-12 |
| 30 | Try Before You Buy — See Yourself in Habiba Minhas Dresses with Virtual Try Room | `try-before-you-buy-virtual-try-room-habiba-minhas` | ✅ Posted | 2026-06-12 |

---

## PENDING BLOGS (75)

### PILLAR 2: Kids Festive Wear (10 remaining)
| # | Title | Slug | Status |
|---|-------|------|--------|
| 31 | Care for Kids Outfits | `care-for-kids-embroidered-outfits-washing-storage` | ⏳ Pending |
| 32 | Gift Ideas for Kids | `best-gift-ideas-kids-pakistan-festive-wear-eid` | ⏳ Pending |
| 33 | Eid Twins Outfits | `eid-twins-matching-siblings-outfits-pakistan` | ⏳ Pending |
| 34 | Girls Festive Wear by Age | `pakistani-girls-festive-wear-toddler-to-teen` | ⏳ Pending |
| 35 | Quality Kids Outfit Checklist | `quality-kids-festive-outfit-mothers-buying-checklist` | ⏳ Pending |
| 36 | Silk Frock vs Embroidered Gown | `silk-frock-vs-embroidered-gown-girls-weddings-pakistan` | ⏳ Pending |
| 37 | Dress Kids for Dholki | `how-to-dress-kids-pakistani-dholki-night` | ⏳ Pending |
| 38 | Kids Wear Trends 2026 | `festive-kids-wear-trends-pakistan-2026` | ⏳ Pending |
| 39 | Family Matching Outfits | `family-matching-outfits-eid-pakistan` | ⏳ Pending |
| 40 | Eid Gift Hampers | `best-eid-gift-hampers-pakistani-families` | ⏳ Pending |

### PILLAR 3: Baby & Nursery (15 remaining)
| # | Title | Slug | Status |
|---|-------|------|--------|
| 41 | Newborn Checklist | `complete-newborn-checklist-pakistani-mothers` | ⏳ Pending |
| 42 | Baby Nursery Setup | `how-to-set-up-baby-nursery-pakistan` | ⏳ Pending |
| 43 | Baby Bedding Buying Guide | `best-baby-bedding-sets-pakistan-buying-guide` | ⏳ Pending |
| 44 | What Is Baby Nest Pod | `what-is-baby-nest-pod-benefits-newborns-pakistan` | ⏳ Pending |
| 45 | Nursing Pillow Guide | `nursing-pillow-guide-pakistani-mothers` | ⏳ Pending |
| 46 | How to Swaddle | `how-to-swaddle-newborn-baby-pakistani-moms` | ⏳ Pending |
| 47 | Safe Sleep Practices | `safe-sleep-practices-newborns-pakistan` | ⏳ Pending |
| 48 | Baby Shower Gift Ideas | `baby-shower-gift-ideas-pakistan-2026` | ⏳ Pending |
| 49 | What Is Godh Bharai | `what-is-godh-bharai-pakistani-baby-shower-traditions` | ⏳ Pending |
| 50 | Baby Products for Climate | `baby-products-safe-for-pakistani-climate` | ⏳ Pending |
| 51 | Handcrafted vs Mass-Produced | `handcrafted-vs-mass-produced-baby-products-pakistan` | ⏳ Pending |
| 52 | Crib Bedding Set Guide | `baby-crib-bedding-set-guide-complete-set` | ⏳ Pending |
| 53 | New Mother Care | `new-mother-care-pakistan-traditions-modern-tips` | ⏳ Pending |
| 54 | Wash Baby Bedding | `how-to-wash-care-baby-bedding-pakistan` | ⏳ Pending |
| 55 | Top 10 Things Before Baby | `top-10-things-to-buy-before-baby-arrives-pakistan` | ⏳ Pending |

### PILLAR 4: Fabric & Craft Education (15 remaining)
| # | Title | Slug | Status |
|---|-------|------|--------|
| 56 | Pakistani Fabric Guide | `pakistani-fabric-guide-lawn-khaddar-chiffon-silk` | ⏳ Pending |
| 57 | Jamawar Fabric | `what-is-jamawar-fabric-history-pakistan` | ⏳ Pending |
| 58 | Art of Pakistani Embroidery | `art-of-pakistani-embroidery-phulkari-zardozi-resham-gota` | ⏳ Pending |
| 59 | How Artisans Create Embroidery | `how-pakistani-artisans-create-handcrafted-embroidery` | ⏳ Pending |
| 60 | Silk vs Chiffon | `silk-vs-chiffon-which-better-pakistani-formal-wear` | ⏳ Pending |
| 61 | Lawn Fabric | `lawn-fabric-everything-you-need-to-know-pakistan` | ⏳ Pending |
| 62 | Identify Quality Fabric | `how-to-identify-quality-fabric-shopping-online-pakistan` | ⏳ Pending |
| 63 | Handloom Traditions | `pakistani-handloom-traditions-handwoven-fabric-comeback` | ⏳ Pending |
| 64 | Mirror Work | `mirror-work-pakistani-fashion-history-styling` | ⏳ Pending |
| 65 | Khaddar Fabric | `what-is-khaddar-fabric-winter-wear-guide-pakistan` | ⏳ Pending |
| 66 | Sustainable Fashion | `sustainable-fashion-pakistan-handcrafted-local-artisans` | ⏳ Pending |
| 67 | Gota vs Dabka | `gota-work-vs-dabka-work-pakistani-embellishment` | ⏳ Pending |
| 68 | Store Pakistani Suits | `how-to-store-pakistani-suits-properly-long-term` | ⏳ Pending |
| 69 | Ajrak Fabric | `ajrak-pakistan-ancient-printed-fabric-modern-revival` | ⏳ Pending |
| 70 | Why Silk for Formal | `why-pakistani-women-prefer-silk-formal-occasions` | ⏳ Pending |

### PILLAR 5: Culture & Gifting (15 remaining)
| # | Title | Slug | Status |
|---|-------|------|--------|
| 71 | Wedding Season Guide | `pakistani-wedding-season-guide-what-to-wear-every-ceremony` | ⏳ Pending |
| 72 | Nikah Ceremony Outfit | `how-to-dress-pakistani-nikah-ceremony-guest` | ⏳ Pending |
| 73 | Eid ul Adha vs Fitr | `eid-ul-adha-vs-eid-ul-fitr-outfits-pakistan` | ⏳ Pending |
| 74 | Ramadan Fashion | `ramadan-fashion-pakistan-iftar-parties-taraweeh` | ⏳ Pending |
| 75 | Dholki Night | `what-to-wear-pakistani-dholki-night` | ⏳ Pending |
| 76 | Gift Guide for Brides | `gift-guide-pakistani-brides-mehndi-bridal-shower` | ⏳ Pending |
| 77 | Eid Gifting Guide | `eid-gifting-pakistan-complete-guide-2026` | ⏳ Pending |
| 78 | Send Gifts from Abroad | `how-to-send-gifts-to-pakistan-from-abroad-diaspora` | ⏳ Pending |
| 79 | Clothes as Gifts Tradition | `pakistani-culture-giving-clothes-as-gifts-tradition` | ⏳ Pending |
| 80 | Wedding Trends 2026 | `pakistan-top-wedding-trends-2026` | ⏳ Pending |
| 81 | Destination Wedding Outfit | `how-to-plan-outfit-pakistani-destination-wedding` | ⏳ Pending |
| 82 | Modesty and Style | `modesty-and-style-pakistani-women-trend-tradition` | ⏳ Pending |
| 83 | New Year Party Outfit | `new-year-party-outfit-ideas-pakistani-women` | ⏳ Pending |
| 84 | Corporate Event Dress | `how-to-dress-pakistani-corporate-event-office-function` | ⏳ Pending |
| 85 | Bridal Trousseau Guide | `pakistani-bridal-trousseau-guide-what-every-bride-should-have` | ⏳ Pending |

### PILLAR 6: Brand & Studio (20 remaining)
| # | Title | Slug | Status |
|---|-------|------|--------|
| 86 | Why Handcrafted Techniques | `why-we-use-handcrafted-techniques-habiba-minhas` | ⏳ Pending |
| 87 | How We Source Fabric | `how-we-source-fabric-habiba-minhas-quality` | ⏳ Pending |
| 88 | Story Behind Our Name | `story-behind-habiba-minhas-heritage-pakistani-craft` | ⏳ Pending |
| 89 | Inside the Studio | `inside-habiba-minhas-studio-day-in-atelier` | ⏳ Pending |
| 90 | How We Design Collections | `how-we-design-new-collection-habiba-minhas-concept-to-product` | ⏳ Pending |
| 91 | 5,000 Customers Strong | `5000-customers-lessons-building-pakistani-fashion-brand` | ⏳ Pending |
| 92 | Why 14-Day Return Policy | `why-we-offer-14-day-return-policy-habiba-minhas` | ⏳ Pending |
| 93 | How We Package Orders | `how-we-package-orders-habiba-minhas-unboxing` | ⏳ Pending |
| 94 | Made in Pakistan | `made-in-pakistan-proud-of-every-stitch` | ⏳ Pending |
| 95 | Flat Rs. 250 Delivery | `flat-rs-250-delivery-how-we-keep-shipping-affordable-pakistan` | ⏳ Pending |
| 96 | Oud Perfume Guide | `oud-perfume-guide-pakistani-women-choose-wear` | ⏳ Pending |
| 97 | Build Signature Scent | `how-to-build-signature-scent-pakistani-occasions` | ⏳ Pending |
| 98 | Traveling in Style | `pakistani-women-travelling-in-style-carry-on-wedding-trip` | ⏳ Pending |
| 99 | Linen in Summer | `linen-in-pakistani-summer-why-it-belongs-every-wardrobe` | ⏳ Pending |
| 100 | Interior Aesthetics | `pakistani-interior-aesthetics-colours-we-dress-in` | ⏳ Pending |
| 101 | Luxury-Minimal Meaning | `what-does-luxury-minimal-mean-pakistani-fashion` | ⏳ Pending |
| 102 | Slow Fashion Movement | `slow-fashion-movement-pakistan-less-is-more` | ⏳ Pending |
| 103 | Pakistani Fashion Icons | `pakistani-fashion-icons-timeless-styles-they-inspire` | ⏳ Pending |
| 104 | Fashion Going Global | `how-pakistani-fashion-going-global-diaspora-effect` | ⏳ Pending |
| 105 | Future of Fashion | `future-of-pakistani-fashion-trends-craft-what-comes-next` | ⏳ Pending |

---

## IMAGES NEEDED (owner to generate → drop in `public/blog/`)

These 10 hero images are referenced by the posts just published. Filenames must match exactly (`.webp`, ideally ~16:9):

**Batch 5 (Kids):**
- `best-eid-dresses-girls-pakistan-2026.webp`
- `kids-festive-wear-guide-pakistani-weddings.webp`
- `how-to-pick-right-festive-outfit-size-child-pakistan.webp`
- `embroidered-kids-suits-handcrafted-eid-pakistan.webp`
- `co-ord-sets-girls-festive-events-pakistan.webp`

**Batch 6 (Virtual Try-On):**
- `what-is-virtual-try-on-see-yourself-outfit-before-buying-pakistan.webp`
- `how-to-take-perfect-photo-virtual-try-on-tips.webp`
- `ai-try-on-online-shopping-will-it-suit-me-pakistan.webp`
- `future-online-fashion-shopping-pakistan-ai-try-on.webp`
- `try-before-you-buy-virtual-try-room-habiba-minhas.webp`

> Until an image is added, the post falls back to a default editorial image, so posts are not broken — just add the matching `.webp` when ready.

---

## HOW TO USE THIS TRACKER

**For Claude Code:**
1. When user says "post next 5 blogs", check "NEXT 5 BLOGS TO POST"
2. Read "How Posts Are Stored" above — insert rows into `journal_posts` (do NOT create `.tsx` files)
3. Follow the `content` jsonb block schema; mirror an existing recent post for shape
4. Move posted blogs from PENDING to POSTED with date, set `hero_image` to `/blog/[slug].webp`
5. Update "NEXT 5 BLOGS TO POST" and the progress counter at top
6. Tell the owner the exact image filenames to generate

**For User:**
- This tracker is the source of truth for blog progress
- "Next 5" are pre-queued for easy execution
- Generate the listed hero images and drop them in `public/blog/`
