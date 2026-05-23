# Blog Template Structure — Habiba Minhas
## E-Commerce SEO-Optimized Blog Post Template

**Purpose:** This template ensures every blog post follows SEO best practices, maintains brand voice, and maximizes conversion potential.

**Use this template for ALL blog posts (100 posts total).**

---

## FILE STRUCTURE

```
app/journal/[slug]/page.tsx
```

**Example:**
```
app/journal/how-to-style-silk-suit-pakistani-wedding/page.tsx
```

---

## CODE TEMPLATE

```typescript
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

// SEO Focus Keyword: "[primary keyword]"
export const metadata: Metadata = {
  title: "[Primary Keyword] | [Secondary Keyword] | Habiba Minhas",
  description: "[150-155 characters with focus keyword in first 120 chars + CTA]",
  keywords: "[focus keyword], [secondary keyword 1], [secondary keyword 2], [long-tail variations]",
  alternates: {
    canonical: "/journal/[slug]/",
  },
  openGraph: {
    images: ["[/path/to/featured-image.webp]"],
  },
};

export default function BlogPost() {
  return (
    <article className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      {/* BREADCRUMBS */}
      <nav className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted">
        <Link href="/journal/" className="hover:text-gold-dark transition-colors">Journal</Link>
        <span>/</span>
        <span className="text-ink">[Category Tag]</span>
      </nav>

      {/* HERO IMAGE */}
      <div className="relative aspect-[21/9] w-full overflow-hidden">
        <Image
          src="[/path/to/hero-image.webp]"
          alt="[Keyword-rich alt text describing image]"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>

      {/* ARTICLE HEADER */}
      <header className="mx-auto mt-12 max-w-3xl">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold-dark">
          [Category Tag]
          <span className="h-px w-8 bg-gold/40" />
          <time dateTime="[YYYY-MM-DD]" className="text-ink-soft">[Month Day, Year]</time>
        </div>
        <h1 className="mt-4 font-display text-4xl italic leading-tight sm:text-5xl md:text-6xl">
          [H1 Title - Exact match to metadata title without brand name]
        </h1>
        <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
          [Introduction hook - 150-200 words. Include focus keyword in first 100 words. Set expectations for what reader will learn.]
        </p>
      </header>

      {/* MAIN CONTENT GRID */}
      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-12 lg:max-w-none lg:grid-cols-[1fr_300px]">
        
        {/* LEFT COLUMN - ARTICLE BODY */}
        <div className="prose prose-lg max-w-none">
          
          {/* INTRODUCTION PARAGRAPH */}
          <p>
            [Opening paragraph with focus keyword. Set context and promise value.]
          </p>

          {/* SECTION 1 */}
          <h2 id="[slug-for-toc]" className="mt-12 font-display text-3xl italic">
            [H2 Heading - Include Secondary Keyword]
          </h2>
          <p>
            [Content for section 1. 200-400 words. Use semantic keywords naturally.]
          </p>
          <p>
            [Additional paragraph with examples, tips, or explanations.]
          </p>

          {/* SECTION 2 */}
          <h2 id="[slug-for-toc]" className="mt-12 font-display text-3xl italic">
            [H2 Heading - Include Variation of Keyword]
          </h2>
          
          <h3 className="mt-6 text-xl font-semibold">[H3 Sub-heading]</h3>
          <p>
            [Sub-section content]
          </p>

          <h3 className="mt-6 text-xl font-semibold">[H3 Sub-heading]</h3>
          <p>
            [Sub-section content]
          </p>

          {/* SECTION 3 - LIST FORMAT */}
          <h2 id="[slug-for-toc]" className="mt-12 font-display text-3xl italic">
            [H2 Heading - Action-Oriented]
          </h2>
          <p>
            [Introduction to list]
          </p>

          <ol className="mt-4 space-y-4">
            <li><strong>[List Item 1]:</strong> [Description]</li>
            <li><strong>[List Item 2]:</strong> [Description]</li>
            <li><strong>[List Item 3]:</strong> [Description]</li>
          </ol>

          <p className="mt-6">
            [Internal link to related post]: <Link href="/journal/[related-post]/" className="text-gold-dark hover:underline">[Link Text]</Link>.
          </p>

          {/* SECTION 4 - PRACTICAL TIPS */}
          <h2 id="[slug-for-toc]" className="mt-12 font-display text-3xl italic">
            [H2 Heading - How-To or Guide]
          </h2>
          <p>
            [Actionable advice and tips]
          </p>

          <ul className="mt-2 space-y-2">
            <li><strong>[Tip 1 Title]:</strong> [Explanation]</li>
            <li><strong>[Tip 2 Title]:</strong> [Explanation]</li>
            <li><strong>[Tip 3 Title]:</strong> [Explanation]</li>
          </ul>

          {/* FAQ SECTION */}
          <h2 id="faq" className="mt-12 font-display text-3xl italic">
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold">[Question 1 - Include keyword variation]</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                [Answer 1 - 50-100 words. Direct, helpful, includes internal link if relevant]
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">[Question 2]</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                [Answer 2]
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">[Question 3]</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                [Answer 3]
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">[Question 4]</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                [Answer 4]
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">[Question 5 - Include CTA]</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                [Answer 5 with link to collection page]. <Link href="/[collection-page]/" className="text-gold-dark hover:underline">[CTA Link Text] →</Link>
              </p>
            </div>
          </div>

          {/* CLOSING PARAGRAPH */}
          <p className="mt-12 text-[15px] leading-relaxed text-ink-soft">
            [Summary paragraph. Reinforce main takeaway. Include soft CTA or inspirational close.]
          </p>
        </div>

        {/* RIGHT COLUMN - SIDEBAR (STICKY) */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-6">
            
            {/* TABLE OF CONTENTS */}
            <div className="border border-border-soft bg-cream p-6">
              <h3 className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">
                In This Article
              </h3>
              <nav className="mt-4 flex flex-col gap-2 text-[13px]">
                <a href="#[section-1-slug]" className="hover:text-gold-dark transition-colors">
                  [Section 1 Title]
                </a>
                <a href="#[section-2-slug]" className="hover:text-gold-dark transition-colors">
                  [Section 2 Title]
                </a>
                <a href="#[section-3-slug]" className="hover:text-gold-dark transition-colors">
                  [Section 3 Title]
                </a>
                <a href="#faq" className="hover:text-gold-dark transition-colors">
                  FAQs
                </a>
              </nav>
            </div>

            {/* CTA BLOCK */}
            <div className="border border-border-soft bg-ivory p-6">
              <h3 className="font-display text-xl italic">[CTA Heading]</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                [Short description related to blog topic]
              </p>
              <Link
                href="/[money-page]/"
                className="mt-4 inline-flex h-11 w-full items-center justify-center bg-ink text-[11px] uppercase tracking-[0.26em] text-ivory transition-colors hover:bg-gold-dark"
              >
                [CTA Button Text]
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* RELATED ARTICLES */}
      <section className="mx-auto mt-16 max-w-3xl border-t border-border-soft pt-12">
        <h2 className="text-[11px] uppercase tracking-[0.28em] text-gold-dark">
          Related Articles
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link href="/journal/[related-post-1]/" className="group">
            <h3 className="font-display text-xl italic group-hover:text-gold-dark transition-colors">
              [Related Post 1 Title]
            </h3>
            <p className="mt-1 text-[13px] text-ink-soft">
              [Related Post 1 Excerpt]
            </p>
          </Link>
          <Link href="/journal/[related-post-2]/" className="group">
            <h3 className="font-display text-xl italic group-hover:text-gold-dark transition-colors">
              [Related Post 2 Title]
            </h3>
            <p className="mt-1 text-[13px] text-ink-soft">
              [Related Post 2 Excerpt]
            </p>
          </Link>
        </div>
      </section>
    </article>
  );
}
```

---

## SEO REQUIREMENTS CHECKLIST

### ✅ **Metadata**
- [ ] Title: 50-60 characters, includes focus keyword + brand name
- [ ] Description: 150-155 characters, includes focus keyword in first 120 chars
- [ ] Keywords: 6-10 keywords (focus + secondary + long-tail variations)
- [ ] Canonical URL: `/journal/[slug]/`
- [ ] Open Graph image path for social sharing

### ✅ **Content Structure**
- [ ] H1: Exact match to page title (without brand name)
- [ ] Introduction: 150-200 words, focus keyword in first 100 words
- [ ] H2 sections: 3-5 sections with secondary keywords
- [ ] H3 subsections: Where needed for organization
- [ ] Word count: 800-1,500 words minimum (pillar posts 2,000+)

### ✅ **Keyword Optimization**
- [ ] Focus keyword in: URL, title, meta description, H1, first paragraph
- [ ] Secondary keywords in: H2 headings, body content
- [ ] Keyword density: 1-2% (natural, not stuffed)
- [ ] Semantic variations used throughout

### ✅ **Internal Linking**
- [ ] 1 money page link (collection page: /ladies, /kids, /baby, /accessories)
- [ ] 2-3 related blog post links
- [ ] 1 resource page link (Fabric Glossary, Size Guide, Help pages)
- [ ] All links have descriptive anchor text

### ✅ **Images**
- [ ] Hero image: 21:9 aspect ratio, WebP format
- [ ] Alt text: Descriptive with focus keyword
- [ ] Sizes attribute for responsive loading
- [ ] Priority loading on hero image

### ✅ **FAQ Section**
- [ ] 5-7 questions minimum
- [ ] Questions include keyword variations
- [ ] Answers are 50-100 words each
- [ ] Last FAQ includes CTA with link to collection

### ✅ **User Experience**
- [ ] Table of Contents with jump links (for posts >800 words)
- [ ] Sticky sidebar on desktop
- [ ] Short paragraphs (2-4 sentences max)
- [ ] Bullet points and lists for scannability
- [ ] Related articles section at bottom

### ✅ **Conversion Elements**
- [ ] CTA in sidebar linking to collection page
- [ ] CTA in FAQ section
- [ ] Related articles drive traffic to other posts
- [ ] Breadcrumbs for navigation

---

## CONTENT WRITING BEST PRACTICES

### **Tone & Voice**
- Knowledgeable but approachable
- Warm, editorial, not salesy
- Educational first, promotional second
- Use "we" for brand, "you" for reader

### **Pakistan-Specific Context**
- Always include "Pakistan" in title and throughout content
- Reference Pakistani cities: Karachi, Lahore, Islamabad
- Use Pakistani cultural context: Eid, mehndi, barat, walima, etc.
- Address Pakistani climate, traditions, and preferences
- Use PKT timezone, Rs. currency

### **E-Commerce SEO Tips**
- Answer the search intent directly
- Provide actionable, practical advice
- Include product recommendations naturally
- Build trust with expertise signals (E-E-A-T)
- Link to collections at natural conversion points

### **Paragraph Structure**
- Keep paragraphs short (2-4 sentences)
- One idea per paragraph
- Use transition words between paragraphs
- Mix paragraph lengths for rhythm

### **Lists & Formatting**
- Use numbered lists for sequential steps
- Use bullet lists for features, tips, or options
- Bold important points within lists
- Add context after lists to reinforce learning

---

## INTERNAL LINKING STRATEGY

### **Money Pages (High Priority)**
Must link to at least ONE:
- `/ladies/` — Ladies collection
- `/kids/` — Kids collection
- `/baby/` — Baby products
- `/accessories/` — Accessories
- `/new/` — New arrivals
- `/shop/` — Shop all

### **Related Blog Posts**
Link to 2-3 related posts in same topical cluster:
- Use contextual anchor text
- Link from body content, not just "related articles"
- Prefer existing posts first, then other new posts

### **Resource Pages**
Link to 1 resource page where relevant:
- Fabric Glossary (for fabric-related posts)
- Size Guide (for sizing/buying posts)
- Help/Returns (for trust-building posts)
- Help/Shipping (for delivery-related posts)

---

## FAQ SECTION GUIDELINES

### **Question Selection**
- Use Google "People Also Ask" for real search queries
- Include keyword variations in questions
- Mix informational + transactional questions
- Last question should have strong CTA

### **Answer Format**
- 50-100 words per answer
- Direct, helpful, no fluff
- Include internal links where relevant
- Last answer includes shop link

### **Example Questions:**
- "What is [topic]?" (Definitional)
- "How do I [action]?" (How-to)
- "Which is better: X or Y?" (Comparison)
- "Where can I buy [product] in Pakistan?" (Transactional + CTA)

---

## IMAGES & ALT TEXT

### **Hero Image**
- Aspect ratio: 21:9 (wide cinematic)
- Format: WebP for performance
- Alt text format: "[Main topic] - [context] - Habiba Minhas"
- Example: "3-piece silk suit styled for Pakistani wedding - Habiba Minhas"

### **In-Content Images (Future)**
- Add every 300-400 words
- Product shots from collections
- Alt text includes keywords + product description

---

## CATEGORY TAGS

Use one tag per post (matches topical cluster):

- **Style Notes** — Styling guides, outfit ideas
- **Fabric** — Fabric education, care guides
- **Fragrance** — Perfume, oud, scent guides
- **Travel** — Packing, travel styling
- **The Studio** — Behind-the-scenes, brand stories
- **Culture** — Pakistani traditions, occasions
- **Gifting** — Gift guides, ideas
- **Kids** — Kids fashion, parenting
- **Baby** — Baby products, nursery, new mothers

---

## WORD COUNT TARGETS

| Post Type | Word Count |
|-----------|------------|
| Standard blog post | 800-1,200 words |
| Pillar content (comprehensive guides) | 1,500-2,500 words |
| Brand/editorial posts | 600-1,000 words |

**Note:** Longer is better for SEO, but only if quality is maintained. Never add fluff to hit word count.

---

## SCHEMA MARKUP (Future Enhancement)

For future implementation, add JSON-LD schema:

```typescript
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Post Title]",
  "author": {
    "@type": "Organization",
    "name": "Habiba Minhas"
  },
  "datePublished": "[YYYY-MM-DD]",
  "image": "[Hero Image URL]",
  "publisher": {
    "@type": "Organization",
    "name": "Habiba Minhas",
    "logo": {
      "@type": "ImageObject",
      "url": "[Logo URL]"
    }
  }
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question 1]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer 1]"
      }
    }
  ]
}
</script>
```

---

## PUBLISHING CHECKLIST

Before marking a blog as "Posted":

- [ ] Metadata complete with focus keyword
- [ ] H1 matches page title
- [ ] Hero image with proper alt text
- [ ] Introduction includes focus keyword in first 100 words
- [ ] 3-5 H2 sections with content
- [ ] Table of Contents with jump links
- [ ] 5-7 FAQ questions with answers
- [ ] 1 money page link (collection)
- [ ] 2-3 related blog post links
- [ ] 1 resource page link
- [ ] CTA in sidebar
- [ ] Related articles section
- [ ] Word count 800+ words
- [ ] Proofread for typos
- [ ] Update blog-posting-tracker.md

---

## QUICK REFERENCE

**File Location:**
```
app/journal/[slug]/page.tsx
```

**Topical Map:**
```
docs/topical-map.md
```

**Tracker:**
```
docs/blog-posting-tracker.md
```

**This Template:**
```
docs/blog-template-structure.md
```

---

**Use this template for ALL 100 blog posts. Consistency = SEO success.**
