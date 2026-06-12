# 🎯 SEO ROADMAP 2026 — Habiba Minhas
**Last Updated:** 2026-05-23  
**Overall Progress:** 15/45 tasks (33% complete)  
**Current Phase:** Critical Fixes & Foundation

---

## 📊 PROGRESS DASHBOARD

### ✅ Completed (15)
- [x] Schema markup (Organization, Product, Article, Breadcrumb)
- [x] Dynamic sitemap with blog auto-indexing
- [x] Meta tags (titles, descriptions, OG images)
- [x] Canonical URLs
- [x] Basic robots.txt
- [x] SSL/HTTPS
- [x] Mobile responsive design
- [x] Image optimization (WebP, alt tags)
- [x] Blog strategy document
- [x] Social media integration (8 platforms)
- [x] Google Analytics setup
- [x] Google Search Console setup
- [x] Internal linking (basic)
- [x] Trustpilot integration
- [x] Blog template structure

### 🚧 In Progress (0)
*(None currently)*

### ⏳ Not Started (30)
- [ ] Core Web Vitals optimization (INP, LCP, CLS)
- [ ] AI crawler robots.txt configuration
- [ ] FAQ schema implementation
- [ ] YouTube channel creation
- [ ] Product videos
- [ ] Review system
- [ ] And 24 more...

---

## 🔴 WEEK 1: CRITICAL FIXES (This Week - May 23-30, 2026)

### Task 1: Test Core Web Vitals
**Priority:** CRITICAL 🔴  
**Estimated Time:** 30 minutes  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Steps:**
1. Go to https://pagespeed.web.dev/
2. Test these URLs:
   - [ ] Homepage: https://habibaminhas.com/
   - [ ] Product page: https://habibaminhas.com/product/ladies-suits/ld-sku-rwe-3pc-ss25-014/
   - [ ] Blog post: https://habibaminhas.com/journal/best-eid-outfits-women-pakistan-2026/
3. Record scores:
   - LCP: _______ (Target: < 2.5s)
   - INP: _______ (Target: < 200ms)
   - CLS: _______ (Target: < 0.1)
4. Screenshot results and save to `docs/core-web-vitals-report.png`

**Success Criteria:** All 3 scores documented, issues identified

---

### Task 2: Update robots.txt for AI Crawlers
**Priority:** CRITICAL 🔴  
**Estimated Time:** 15 minutes  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Implementation:**
Replace current robots.txt with:

```txt
# Habiba Minhas - AI Crawler Configuration
# Last updated: 2026-05-23

# Allow live-retrieval bots (send traffic back)
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Crawl-delay: 10
Allow: /

# Block training scrapers (take content, give nothing)
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: FacebookBot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

User-agent: Bytespider
Disallow: /

# Allow Google's AI for search
User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

# Standard crawlers
User-agent: *
Crawl-delay: 1
Allow: /

Sitemap: https://habibaminhas.com/sitemap.xml
```

**Success Criteria:** robots.txt updated and live, test at https://habibaminhas.com/robots.txt

---

### Task 3: Set Up Google Search Console 2026 Features
**Priority:** CRITICAL 🔴  
**Estimated Time:** 30 minutes  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Steps:**
1. [ ] Login to Google Search Console
2. [ ] Enable Query Groups:
   - Go to Performance → "Query Groups" tab
   - Review AI-clustered topics
3. [ ] Enable Branded Queries Filter:
   - Performance → Filter → "Branded queries"
   - Compare branded vs non-branded traffic
4. [ ] Set Up Custom Annotations:
   - Performance → Click chart → "Add annotation"
   - Add note: "Schema markup implemented - May 23, 2026"
   - Add note: "Dynamic sitemap launched - May 23, 2026"

**Success Criteria:** All 3 features enabled and tested

---

### Task 4: Test Schema Markup
**Priority:** CRITICAL 🔴  
**Estimated Time:** 20 minutes  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Steps:**
1. [ ] Test Product Schema:
   - Go to https://search.google.com/test/rich-results
   - Test 3 product URLs
   - Screenshot results → save to `docs/schema-test-products.png`
   
2. [ ] Test Blog Schema:
   - Test 2 blog post URLs
   - Screenshot results → save to `docs/schema-test-blogs.png`
   
3. [ ] Check for Errors:
   - Go to Google Search Console → Enhancements
   - Check Products, Articles sections
   - Fix any warnings/errors

**Success Criteria:** No errors, all schemas validating correctly

---

## 🟠 WEEK 2-4: HIGH PRIORITY (May 30 - June 20, 2026)

### Task 5: Fix INP Issues (JavaScript Optimization)
**Priority:** HIGH 🟠  
**Estimated Time:** 4-6 hours (developer help may be needed)  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Common INP Issues to Check:**
- [ ] Heavy third-party scripts (analytics, chat widgets, social pixels)
- [ ] Unoptimized Next.js components
- [ ] Blocking JavaScript on mobile
- [ ] Large JavaScript bundles

**Steps:**
1. Review PageSpeed Insights recommendations
2. Identify scripts delaying interactions
3. Defer non-critical JavaScript
4. Use code splitting for large components
5. Re-test until INP < 200ms

**Success Criteria:** INP score < 200ms on all pages

---

### Task 6: Create YouTube Channel
**Priority:** HIGH 🟠  
**Estimated Time:** 2 hours  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Steps:**
1. [ ] Create channel: "Habiba Minhas Official"
2. [ ] Add channel art (banner, profile picture)
3. [ ] Write channel description:
   > "Habiba Minhas - Handcrafted Pakistani fashion from Karachi. Ladies formal suits, kids festive wear, fabric guides, and styling tips. Shop: habibaminhas.com"
4. [ ] Add links:
   - Website: https://habibaminhas.com
   - Instagram, Facebook, TikTok
5. [ ] Create playlists:
   - "Product Collection Tours"
   - "Styling Guides"
   - "Behind the Scenes"
   - "Customer Testimonials"

**Success Criteria:** Channel live with complete branding

---

### Task 7: Create First Product Video
**Priority:** HIGH 🟠  
**Estimated Time:** 3-4 hours (filming + editing)  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Video Ideas (Choose 1):**
- [ ] "Ladies Formal Suits Collection 2026 | Habiba Minhas"
- [ ] "How to Style a Dupatta - 5 Ways | Pakistani Fashion"
- [ ] "Behind the Scenes: How We Make Our Suits in Karachi"

**Video Requirements:**
- Length: 3-4 minutes
- Include:
  - [ ] Product links in description (first line)
  - [ ] Timestamps for sections
  - [ ] CTA at 0:00, 1:30, and end
  - [ ] Clear shots of products
  - [ ] Brand logo watermark

**Success Criteria:** First video uploaded, optimized, and linked from website

---

### Task 8: Add FAQ Schema to Existing 5 Blog Posts
**Priority:** HIGH 🟠  
**Estimated Time:** 3 hours  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Blog Posts to Update:**
1. [ ] Best Eid Outfits for Women in Pakistan 2026
2. [ ] Walima Guest Outfit Guide Pakistan
3. [ ] Barat Outfit Ideas for Guests Pakistan
4. [ ] What to Wear Mehndi Night Pakistan
5. [ ] How to Style Silk Suit Pakistani Wedding

**For Each Post:**
- Add 5-7 FAQ questions with answers
- Implement FAQSchema component
- Questions should match what people ask Google/ChatGPT
- Answers should be 50-100 words

**Example FAQ for Eid Outfits Post:**
```typescript
<FAQSchema 
  faqs={[
    {
      question: "What should I wear to Eid in Pakistan?",
      answer: "Traditional Eid outfits in Pakistan include embroidered lawn suits, silk dupattas, and formal shalwar kameez. Popular colors are gold, maroon, emerald green, and royal blue. Pair with statement jewelry and embroidered khussas."
    },
    {
      question: "What colors are trending for Eid 2026?",
      answer: "Eid 2026 trending colors include sage green, powder blue, coral pink, and classic ivory with gold embroidery. Jewel tones like emerald and sapphire are also popular for formal gatherings."
    },
    // Add 5-7 total questions
  ]}
/>
```

**Success Criteria:** All 5 blog posts updated with FAQ schema, tested in Rich Results Test

---

## 🟡 MONTH 2: IMPORTANT IMPROVEMENTS (June 2026)

### Task 9: Add Review System to Product Pages
**Priority:** MEDIUM 🟡  
**Estimated Time:** 8-10 hours (developer work)  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Features Needed:**
- [ ] Star rating (1-5 stars)
- [ ] Written review
- [ ] Photo upload option
- [ ] Review moderation (approve/reject)
- [ ] Email automation (request review 7 days after delivery)

**Schema Update:**
Update ProductSchema component to include:
```typescript
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.5",
  "reviewCount": "89"
}
```

**Success Criteria:** Review system live on all products, first 10 reviews collected

---

### Task 10: Improve Internal Linking Structure
**Priority:** MEDIUM 🟡  
**Estimated Time:** 4 hours  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Strategy:**
Every blog post should link to **3 products** + **2 related blogs**

**Example for "Best Eid Outfits" Blog:**
```markdown
Product Links:
1. "Try our [Emerald Embroidered 3-Piece Suit](/product/ladies-suits/emerald-3pc)"
2. "Pair with our [Gold Chiffon Dupatta](/product/accessories/gold-dupatta)"
3. "Complete the look with [Embroidered Khussas](/product/accessories/khussas)"

Blog Links:
1. "See also: [How to Style Silk Suits](/journal/how-to-style-silk-suit)"
2. "Read more: [Dupatta Styling Guide](/journal/dupatta-five-ways)"
```

**Tasks:**
- [ ] Audit all 5 existing blog posts
- [ ] Add 3 product links to each
- [ ] Add 2 blog links to each
- [ ] Add "Shop the Look" section to each blog

**Success Criteria:** All blog posts have strategic internal links

---

### Task 11: Create 4 High-Quality Blog Posts with FAQ Schema
**Priority:** MEDIUM 🟡  
**Estimated Time:** 12 hours (3 hours per post)  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Blog Post Ideas:**
1. [ ] "Complete Guide to Pakistani Wedding Outfits 2026"
2. [ ] "Lawn vs Silk vs Chiffon: Which Fabric for Summer?"
3. [ ] "7 Dupatta Styling Mistakes (And How to Fix Them)"
4. [ ] "How We Source Premium Fabrics in Karachi"

**Each Post Must Include:**
- [ ] 1,500-2,500 words
- [ ] Personal experience/photos
- [ ] 3 product links
- [ ] 2 internal blog links
- [ ] 5-7 FAQ questions with FAQ schema
- [ ] Hero image (custom, not stock)
- [ ] Meta description with focus keyword

**Success Criteria:** 4 new blog posts published, total = 9/100

---

### Task 12: Upload 4 More Product Videos
**Priority:** MEDIUM 🟡  
**Estimated Time:** 12 hours (filming + editing)  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Video Topics:**
1. [ ] Kids Festive Wear Collection Tour
2. [ ] Baby Bedding Essentials Guide
3. [ ] "What's New This Week" - Latest arrivals
4. [ ] Customer Styling Showcase (feature customer photos)

**Success Criteria:** 5 total videos on YouTube, embedded on relevant pages

---

## 💡 MONTH 3: OPTIMIZATION & REFINEMENT (July 2026)

### Task 13: Implement Aggregate Rating Schema
**Priority:** MEDIUM 🟡  
**Estimated Time:** 2 hours  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Requirements:**
- Review system must be live (Task 9)
- At least 50 reviews collected across products
- Update ProductSchema component with aggregate data

**Success Criteria:** Star ratings showing in Google search results

---

### Task 14: Optimize Product Pages for AEO/GEO
**Priority:** MEDIUM 🟡  
**Estimated Time:** 6 hours  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Add Quick Facts Section to Product Pages:**

```markdown
## Quick Facts
- **What is this?** 3-piece embroidered formal suit
- **Who is it for?** Women attending weddings, Eid, formal events
- **When to wear?** Wedding season, Eid celebrations, formal gatherings
- **How to style?** Pair with gold jewelry, embroidered khussas, clutch bag
- **Fabric:** Premium lawn with chiffon dupatta
- **Care:** Dry clean only
```

**Tasks:**
- [ ] Add Quick Facts to 10 best-selling products
- [ ] Add FAQ schema to product pages (3-5 questions each)
- [ ] Optimize for voice search ("Where can I buy...")

**Success Criteria:** Product pages getting cited in ChatGPT/Perplexity

---

### Task 15: Create Content Hubs (Pillar Pages)
**Priority:** MEDIUM 🟡  
**Estimated Time:** 8 hours  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Hub 1: Pakistani Wedding Fashion Guide**
- Main page: `/content/pakistani-wedding-fashion-guide/`
- Links to:
  - Blog: "Walima Guest Outfit Guide"
  - Blog: "Barat Outfit Ideas"
  - Blog: "Mehndi Night Outfits"
  - Category: /ladies/
  - Products: Featured formal suits

**Hub 2: Fabric & Care Guide**
- Main page: `/content/fabric-care-guide/`
- Links to:
  - Blog: "Lawn vs Silk vs Chiffon"
  - Blog: "Linen Notes"
  - Existing: /content/fabric-glossary/

**Success Criteria:** 2 pillar pages created with strong internal linking

---

### Task 16: Core Web Vitals Ongoing Monitoring
**Priority:** MEDIUM 🟡  
**Estimated Time:** 1 hour/month  
**Status:** [ ] Not Started  
**Completed Date:** ___________

**Monthly Checklist:**
- [ ] Run PageSpeed Insights on 5 random pages
- [ ] Check Google Search Console → Core Web Vitals report
- [ ] Address any new issues
- [ ] Document improvements

**Success Criteria:** All pages maintain "Good" status (green)

---

## 🔵 FUTURE ENHANCEMENTS (3-6 Months)

### Task 17: International SEO / Hreflang
**Priority:** LOW 🔵  
**Status:** [ ] Not Started  
**When:** If expanding to UAE, UK, US markets

**Requirements:**
- Region-specific pricing
- Hreflang tags for language/region
- Separate content for different markets

---

### Task 18: Voice Search Optimization
**Priority:** LOW 🔵  
**Status:** [ ] Not Started  
**When:** After critical tasks complete

**Strategy:**
- Conversational keywords
- Question-based content
- Local SEO ("near me" searches)

---

### Task 19: Progressive Web App (PWA)
**Priority:** LOW 🔵  
**Status:** [ ] Not Started  
**When:** 6-12 months

**Benefits:**
- Faster load times
- Offline functionality
- Push notifications
- Installable on mobile

---

### Task 20: llms.txt File
**Priority:** LOW 🔵  
**Status:** [ ] Not Started  
**When:** When standard becomes widely adopted (late 2026)

**File Location:** `/public/llms.txt`

---

## 📅 WEEKLY REVIEW CHECKLIST

**Every Monday:**
- [ ] Review completed tasks from last week
- [ ] Plan tasks for current week
- [ ] Update progress percentages
- [ ] Check Google Search Console for new insights
- [ ] Monitor Core Web Vitals
- [ ] Review YouTube analytics (if channel live)

---

## 📈 SUCCESS METRICS TO TRACK

### Traffic (Monthly)
- Organic search traffic: ___________
- Direct traffic: ___________
- YouTube referrals: ___________
- AI citations (ChatGPT/Perplexity): ___________

### Rankings
- Products with rich results in Google: ___________
- Blog posts in AI Overviews: ___________
- YouTube video rankings: ___________

### Conversions
- Overall conversion rate: ___________
- Conversion rate (pages with video): ___________
- Conversion rate (products with reviews): ___________
- Bounce rate: ___________

### Technical Health
- Core Web Vitals passing: ___/3 (LCP, INP, CLS)
- Schema errors: ___________
- Mobile usability issues: ___________
- Page speed score (mobile): ___________

---

## 🎯 MILESTONES

- [ ] **Milestone 1:** All critical fixes complete (Week 1) - Target: May 30, 2026
- [ ] **Milestone 2:** YouTube channel launched with 5 videos (Month 1) - Target: June 30, 2026
- [ ] **Milestone 3:** Review system live with 50+ reviews (Month 2) - Target: July 30, 2026
- [ ] **Milestone 4:** 20 high-quality blog posts published (Month 3) - Target: August 30, 2026
- [ ] **Milestone 5:** All Core Web Vitals passing (Month 3) - Target: August 30, 2026

---

## 📝 NOTES & OBSERVATIONS

### 2026-05-23 (Session 1)
- ✅ Schema markup implemented (Organization, Product, Article, Breadcrumb)
- ✅ Dynamic sitemap created with hourly revalidation
- ✅ Comprehensive SEO audit completed
- ✅ Roadmap created
- 📊 Current status: 15/45 tasks complete (33%)
- 🎯 Next session focus: Week 1 critical tasks (robots.txt, Core Web Vitals testing, GSC setup)

---

**END OF ROADMAP**

---

## 🔗 QUICK REFERENCE LINKS

**Testing Tools:**
- PageSpeed Insights: https://pagespeed.web.dev/
- Rich Results Test: https://search.google.com/test/rich-results
- Schema Validator: https://validator.schema.org/
- Google Search Console: https://search.google.com/search-console

**Your Site:**
- Website: https://habibaminhas.com
- Sitemap: https://habibaminhas.com/sitemap.xml
- Robots.txt: https://habibaminhas.com/robots.txt

**Research Sources:**
- All sources saved in initial audit document
- Refer to comprehensive research from 2026-05-23 session
