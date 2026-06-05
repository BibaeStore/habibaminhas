# Working Rules & Principles for SEO/AEO/GEO Optimization

**Purpose**: This document defines the rules, principles, and guidelines that MUST be followed during all implementation work.

---

## 🎯 CORE PRINCIPLES

### 1. ORGANIC TRAFFIC FOCUS
**Rule**: Every change must prioritize organic, sustainable traffic growth.

**This means**:
- ✅ Write for humans first, optimize for AI second
- ✅ Create genuine value, not keyword-stuffed content
- ✅ Build authority through quality, not manipulation
- ❌ NO black-hat SEO tactics
- ❌ NO AI-generated spam content
- ❌ NO link schemes or paid backlinks

---

### 2. CROSS-PLATFORM OPTIMIZATION
**Rule**: Optimize for ALL AI platforms equally, not just Google.

**Platforms to consider**:
1. Google AI Overviews / Gemini
2. ChatGPT (OpenAI)
3. Claude (Anthropic)
4. Perplexity
5. Microsoft Copilot
6. Traditional search engines (Google, Bing)

**This means**:
- ✅ Use universal schema markup (Schema.org standards)
- ✅ Create citation-worthy content (all platforms benefit)
- ✅ Allow all AI crawler bots (robots.txt)
- ✅ Structure content for easy extraction
- ❌ Don't optimize ONLY for Google (outdated strategy)

---

### 3. NEVER BREAK EXISTING FUNCTIONALITY
**Rule**: All changes must be additive, never destructive.

**Before making ANY change**:
1. ✅ Read the existing file completely
2. ✅ Understand what's already there
3. ✅ Test locally if possible
4. ✅ Have a rollback plan

**Forbidden actions**:
- ❌ Changing product slugs (breaks URLs)
- ❌ Removing existing schema markup
- ❌ Deleting working components
- ❌ Modifying robots.txt to block crawlers
- ❌ Breaking internal links
- ❌ Changing route structures

---

### 4. ENTITY-FIRST APPROACH
**Rule**: Establish entities before optimizing content.

**Priority order**:
1. **Person entity** (Habiba Minhas - founder/author)
2. **Organization entity** (Habiba Minhas company)
3. **Product entities** (each product)
4. **Topic entities** (fashion, Pakistani wear, etc.)

**This means**:
- ✅ Add Person schema before writing author content
- ✅ Consistent author attribution everywhere
- ✅ Link all social profiles (sameAs)
- ✅ Build Knowledge Graph presence
- ❌ Don't create orphan content (always attribute to entity)

---

### 5. AEO-FIRST CONTENT STRUCTURE
**Rule**: Every page must directly answer questions.

**Required elements**:
1. ✅ Direct answer in first paragraph
2. ✅ H2/H3 headings as questions
3. ✅ FAQ section on every page type
4. ✅ Conversational, natural language
5. ✅ "Perfect for" / "Ideal for" sections

**Question types to answer**:
- **What**: What is this product/service?
- **Who**: Who is this for?
- **Why**: Why choose this?
- **How**: How to use/style/care for it?
- **When**: When to wear/use it?
- **Where**: Where to buy/get support?

**Content format**:
```markdown
## What is [Product Name]?

[Direct, concise answer in 2-3 sentences]

[Detailed explanation with benefits]

## Who is this perfect for?

[List specific use cases and customer types]

## How to style/use [Product Name]?

[Step-by-step or practical tips]

## Frequently Asked Questions

### How do I care for this?
[Answer]

### What occasions is this suitable for?
[Answer]
```

---

### 6. SCHEMA MARKUP STANDARDS

#### Required Schema Types:
| Page Type | Required Schemas |
|-----------|-----------------|
| **Homepage** | Organization, WebSite, Person (founder) |
| **About** | Organization, Person (founder), Breadcrumb |
| **Product** | Product, AggregateRating, Breadcrumb, FAQ |
| **Blog Post** | Article, Person (author), Breadcrumb, FAQ |
| **Category** | CollectionPage, Breadcrumb |
| **Contact** | LocalBusiness, ContactPoint, Breadcrumb |

#### Schema Implementation Rules:
1. ✅ Use JSON-LD format (not Microdata or RDFa)
2. ✅ Place schema in `<script type="application/ld+json">`
3. ✅ One schema per component/file for maintainability
4. ✅ Always include `@context` and `@type`
5. ✅ Use absolute URLs for images and pages
6. ✅ Test with Google Rich Results Test after changes

#### Person Schema Template:
```typescript
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Habiba Minhas",
  "url": "https://habibaminhas.com/about/",
  "image": "https://habibaminhas.com/about/habiba-minhas.jpg",
  "jobTitle": "Founder & Designer",
  "worksFor": {
    "@type": "Organization",
    "name": "Habiba Minhas"
  },
  "sameAs": [
    "https://www.instagram.com/habibaminhas.official/",
    "https://www.facebook.com/profile.php?id=61573309750795",
    "https://www.linkedin.com/in/habiba-minhas" // Add when created
  ],
  "knowsAbout": [
    "Pakistani Fashion",
    "Handcrafted Clothing",
    "Silk Suits",
    "Traditional Wear"
  ]
}
```

#### FAQ Schema Template:
```typescript
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text here."
      }
    }
  ]
}
```

---

### 7. INTERNAL LINKING STRATEGY

#### Linking Principles:
1. ✅ **Contextual relevance**: Link where it adds value
2. ✅ **Natural anchor text**: Use descriptive phrases
3. ✅ **Bi-directional links**: Products ↔ Blogs
4. ✅ **Hub pages**: Create pillar content that links out
5. ❌ **No forced linking**: Don't add irrelevant links

#### Link Opportunities:
| From | To | When |
|------|----|----|
| Product pages | Blog posts | Care guides, styling tips |
| Blog posts | Products | When mentioning specific items |
| About page | Journal, Shop | Brand story continuation |
| Contact page | Help pages, Popular products | Support & discovery |
| Category pages | Related categories, Blog | Exploration |

#### Anchor Text Guidelines:
- ✅ **Good**: "How to care for silk suits at home"
- ✅ **Good**: "Complete guide to Pakistani wedding attire"
- ❌ **Bad**: "Click here"
- ❌ **Bad**: "Read more"
- ❌ **Bad**: Over-optimized keywords ("buy Pakistani suits online cheap")

---

### 8. CONTENT QUALITY STANDARDS

#### Product Descriptions:
**Minimum requirements**:
- Short description: 150-200 words (for listings)
- Full description: 500-800 words (for product pages)
- Must include: What it is, Who it's for, Features, Benefits, Care
- Must answer at least 3 questions in FAQ format

**Structure**:
```markdown
[Short intro paragraph - direct answer to "What is this?"]

[Main description - features, materials, design]

**Perfect For:**
- [Occasion 1]
- [Occasion 2]
- [User type 1]

[Detailed paragraphs about use, benefits, styling]

**Care Instructions:**
[How to care for this product]

**What's Included:**
[List of items in package]
```

#### Blog Post Standards:
- **Minimum length**: 1,200 words
- **Structure**: H1 (title) → H2 (sections) → H3 (subsections)
- **FAQ**: Every post must have FAQ section (3-5 questions minimum)
- **Internal links**: 3-5 contextual links to products or related posts
- **Author attribution**: Always attribute to "Habiba Minhas" or "Studio Team"
- **Meta description**: 150-160 characters, compelling, includes primary keyword

---

### 9. SEO METADATA STANDARDS

#### Title Tags:
- **Homepage**: "[Brand] — [Tagline] | [Primary Keywords]"
- **Category**: "[Category Name] | [Brand]"
- **Product**: "[Product Name] — [Key Benefit] | [Brand]"
- **Blog**: "[Article Title] | [Brand]"
- **Max length**: 60 characters (mobile display)

#### Meta Descriptions:
- **Length**: 150-160 characters
- **Must include**: Primary keyword, call-to-action
- **Format**: "[What it is] — [Key benefit]. [Social proof or feature]. [CTA]."
- **Example**: "Handcrafted Pakistani silk suits for weddings & formal events. Made in Karachi, serving 5,000+ customers. Shop now with Rs. 250 flat delivery."

#### Keywords:
- **Primary keyword**: Main search term (in title, first paragraph, H2)
- **Secondary keywords**: 2-3 related terms (naturally throughout)
- **Long-tail keywords**: Specific phrases (in FAQ answers)
- **Avoid keyword stuffing**: Write naturally, optimize strategically

---

### 10. E-E-A-T SIGNAL REQUIREMENTS

#### Experience Signals:
- ✅ First-hand photos (not stock images)
- ✅ "We" language in brand content
- ✅ Specific details (e.g., "Karachi studio", "5,000+ customers")
- ✅ Behind-the-scenes content (editorial blog posts)

#### Expertise Signals:
- ✅ Author bio with credentials
- ✅ Years in business (founded 2026)
- ✅ Detailed product knowledge
- ✅ Educational content (how-to guides)

#### Authoritativeness Signals:
- ✅ Company registration details
- ✅ Complete contact information
- ✅ Social proof (customer count, reviews)
- ✅ Industry-specific terminology

#### Trustworthiness Signals:
- ✅ Return policy clearly stated
- ✅ Transparent pricing (no hidden fees)
- ✅ Secure payment indicators
- ✅ Physical location (Karachi, Pakistan)
- ✅ Response time commitment (24 hours)

---

### 11. AI CRAWLER MANAGEMENT

#### robots.txt Rules:
**NEVER block these user agents**:
- Googlebot (Google Search)
- Bingbot (Bing Search)
- GPTBot (OpenAI training)
- OAI-SearchBot (ChatGPT search)
- ClaudeBot (Anthropic training)
- Claude-Web (Claude search)
- PerplexityBot (Perplexity search)
- Google-Extended (Gemini training)

**Current configuration** (DO NOT CHANGE):
```
User-agent: *
Allow: /

# Block only private areas
Disallow: /admin/
Disallow: /api/
Disallow: /account/
```

---

### 12. VERIFICATION & TESTING

#### Before Marking Phase Complete:
1. ✅ **Schema validation**: Test all new schema with Google Rich Results Test
2. ✅ **Link check**: Verify no broken internal links
3. ✅ **Mobile test**: Check responsive design
4. ✅ **Speed test**: Ensure no performance degradation
5. ✅ **Manual review**: Read content as a user would

#### Tools to Use:
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema Validator: https://validator.schema.org/
- Google Search Console: Check for errors
- Lighthouse: Performance & SEO audit
- Manual testing: Read on mobile & desktop

---

### 13. TRACKER UPDATE PROTOCOL

**After EVERY change**, update `TRACKER.md` with:
1. ✅ What you changed (file paths, line numbers)
2. ✅ Why you changed it (which issue it fixes)
3. ✅ How to verify it (testing steps)
4. ✅ What's next (remaining tasks)

**Format**:
```markdown
### [Date] - [Phase X] - [Task Name]

**Changed**:
- File: `app/product/[category]/[slug]/page.tsx`
- Lines: 256-265
- Added: AggregateRating schema component

**Reason**: Fix missing review schema (Issue #3-6)

**Verification**:
- Tested with Google Rich Results Test
- Reviews now show in preview

**Remaining**: 50 more products to update
```

---

### 14. PHASE COMPLETION CRITERIA

**A phase is complete when**:
1. ✅ All tasks in phase marked as done in TRACKER.md
2. ✅ All schema changes validated with tools
3. ✅ No broken links introduced
4. ✅ Content changes reviewed for quality
5. ✅ User testing completed (check on live site)
6. ✅ Habiba approves moving to next phase

**Never move to next phase without**:
- Completing all tasks in current phase
- Verifying no issues introduced
- Updating TRACKER.md completely

---

### 15. CONTENT TONE & VOICE

#### Brand Voice:
- **Tone**: Elegant, confident, knowledgeable, approachable
- **Style**: Conversational but refined
- **Pronouns**: "We" for brand, "You" for customer
- **Avoid**: Overly casual slang, overhyped marketing language

#### Examples:
✅ **Good**: "Handcrafted in our Karachi studio with care that shows."
✅ **Good**: "This silk suit is perfect for weddings and formal celebrations."
❌ **Bad**: "OMG this is literally the BEST suit ever!!!"
❌ **Bad**: "Buy now!!! Limited stock!!! Don't miss out!!!"

---

### 16. FILE NAMING & ORGANIZATION

#### Documentation Files:
- Use `UPPERCASE` for main docs: `README.md`, `TRACKER.md`
- Use `##-NAME.md` for numbered sequence: `02-PHASE-1-IMPLEMENTATION.md`
- Use `-` for word separation, not `_` or spaces

#### Component Files:
- Schema components: `[type]-schema.tsx` (e.g., `person-schema.tsx`)
- Place in: `components/seo/`
- One schema type per file for maintainability

---

## ⚠️ CRITICAL WARNINGS

### NEVER DO THESE:
1. ❌ Change product URLs or slugs
2. ❌ Remove working schema markup
3. ❌ Block AI crawler bots
4. ❌ Delete existing content without backup
5. ❌ Skip testing after schema changes
6. ❌ Work on multiple phases at once
7. ❌ Make changes without updating TRACKER.md
8. ❌ Use AI-generated filler content
9. ❌ Add fake reviews or testimonials
10. ❌ Stuff keywords unnaturally

### ALWAYS DO THESE:
1. ✅ Read existing files before editing
2. ✅ Test schema with validation tools
3. ✅ Update TRACKER.md after changes
4. ✅ Think: "Will AI cite this content?"
5. ✅ Write for humans first
6. ✅ Maintain consistent author attribution
7. ✅ Use absolute URLs in schema
8. ✅ Add FAQ sections everywhere
9. ✅ Link contextually and naturally
10. ✅ Verify on mobile and desktop

---

## 📞 WHEN IN DOUBT

**Ask yourself**:
1. Does this help users OR just search engines?
2. Would I want to read this content?
3. Will AI cite this as a source?
4. Am I breaking anything that works?
5. Is this sustainable long-term?

**If unsure**:
- Read relevant section of `00-PROJECT-OVERVIEW.md`
- Check similar implementations in codebase
- Ask Habiba before proceeding

---

**Remember**: Quality over quantity. Sustainable over quick wins. Users over algorithms.
