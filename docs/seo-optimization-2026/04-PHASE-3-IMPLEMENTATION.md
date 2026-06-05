# PHASE 3: GEO & Entity Optimization

**Priority**: MEDIUM  
**Total Tasks**: 12  
**Estimated Time**: 1 week  
**Status**: ⏳ Not Started  
**Dependencies**: Phase 1 & 2 must be complete

---

## 🎯 PHASE 3 GOALS

1. ✅ Build entity authority for Habiba Minhas (author/founder)
2. ✅ Add comprehensive FAQ sections to all key pages
3. ✅ Strengthen E-E-A-T signals across the site
4. ✅ Optimize for AI citations (GEO)
5. ✅ Link social profiles for entity recognition

---

## 📋 TASK CHECKLIST

### Entity Building (6 tasks):
- [ ] 3.1 - Add author bio to all blog posts
- [ ] 3.2 - Create "About the Author" page
- [ ] 3.3 - Verify social profile links in Person schema
- [ ] 3.4 - Add "Meet the Founder" section to homepage
- [ ] 3.5 - Create structured author credentials
- [ ] 3.6 - Submit to Google Knowledge Graph

### FAQ Implementation (6 tasks):
- [ ] 3.7 - Add FAQ section to homepage
- [ ] 3.8 - Add FAQ section to about page
- [ ] 3.9 - Verify FAQ sections on all 51 products (from Phase 2)
- [ ] 3.10 - Add FAQ section to all category pages
- [ ] 3.11 - Add FAQ section to contact page
- [ ] 3.12 - Add FAQ schema to all FAQ sections

---

## 📝 DETAILED TASK INSTRUCTIONS

---

### ✅ TASK 3.1: Add Author Bio to All Blog Posts

**Goal**: Add visible author bio section at end of every blog post

**Why**: E-E-A-T signals - shows WHO wrote the content and WHY they're qualified

#### Author Bio Content:

```markdown
## About the Author

**Habiba Minhas** is the founder and creative director of Habiba Minhas, Pakistan's leading handcrafted fashion brand based in Karachi. With a passion for preserving traditional Pakistani craftsmanship while embracing modern design, she has built a brand serving over 5,000 customers nationwide.

Specializing in premium ladies suits, kids festive wear, and baby products, Habiba works directly with artisan embroiderers and skilled tailors to create pieces that honor Pakistani heritage. Her expertise spans fabric selection, traditional embroidery techniques, and contemporary fashion trends.

When not designing new collections, Habiba shares styling tips, fabric care advice, and behind-the-scenes insights from the Karachi studio through the Habiba Minhas Journal.

**Connect with Habiba:**  
Instagram: @habibaminhas.official | Facebook: Habiba Minhas | Pinterest: @habibaminhas_official
```

#### Implementation:

**File**: `app/journal/[slug]/page.tsx`

**Add after article content** (around line 495, before "Related Articles" section):

```tsx
{/* Author Bio Section */}
<div className="mt-16 border-t border-b border-border-soft py-8">
  <h2 className="text-[11px] uppercase tracking-[0.3em] text-gold-dark mb-6">
    About the Author
  </h2>
  <div className="flex flex-col sm:flex-row gap-6">
    <div className="flex-shrink-0">
      <div className="w-24 h-24 rounded-full bg-cream border border-border-soft overflow-hidden">
        {/* TODO: Add actual author photo */}
        <Image
          src="/about/habiba-minhas.jpg"
          alt="Habiba Minhas"
          width={96}
          height={96}
          className="object-cover"
        />
      </div>
    </div>
    <div className="flex-1">
      <h3 className="font-display text-2xl italic mb-3">Habiba Minhas</h3>
      <p className="text-[14px] leading-relaxed text-ink-soft mb-3">
        Founder and creative director of Habiba Minhas, Pakistan's leading handcrafted fashion brand based in Karachi. With a passion for preserving traditional Pakistani craftsmanship while embracing modern design, she has built a brand serving over 5,000 customers nationwide.
      </p>
      <p className="text-[14px] leading-relaxed text-ink-soft mb-4">
        Specializing in premium ladies suits, kids festive wear, and baby products, Habiba works directly with artisan embroiderers and skilled tailors to create pieces that honor Pakistani heritage.
      </p>
      <div className="flex items-center gap-3 text-[12px]">
        <span className="text-ink-soft">Connect:</span>
        <a href="https://www.instagram.com/habibaminhas.official/" target="_blank" rel="noopener" className="text-gold-dark hover:text-ink">Instagram</a>
        <span className="text-muted">·</span>
        <a href="https://www.facebook.com/profile.php?id=61573309750795" target="_blank" rel="noopener" className="text-gold-dark hover:text-ink">Facebook</a>
        <span className="text-muted">·</span>
        <a href="https://www.pinterest.com/habibaminhas_official/" target="_blank" rel="noopener" className="text-gold-dark hover:text-ink">Pinterest</a>
      </div>
    </div>
  </div>
</div>
```

**Verification**:
- Visit any blog post
- Author bio appears at bottom
- Links work correctly
- Responsive on mobile

---

### ✅ TASK 3.2: Create "About the Author" Page

**Goal**: Dedicated page about Habiba Minhas (founder)

**File**: Create `app/about/author/page.tsx`

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "link";
import { SectionHeading } from "@/components/common/section-heading";

export const metadata: Metadata = {
  title: "About Habiba Minhas — Founder & Creative Director",
  description: "Meet Habiba Minhas, founder of Pakistan's leading handcrafted fashion brand. Specializing in premium ladies suits, kids festive wear, and baby products made in Karachi.",
  alternates: {
    canonical: "/about/author/",
  },
  keywords: "Habiba Minhas, Pakistani fashion designer, Karachi fashion, handcrafted clothing Pakistan",
};

export default function AuthorPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <Image
              src="/about/habiba-minhas-founder.jpg"
              alt="Habiba Minhas - Founder"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-top"
            />
          </div>
        </div>

        <div className="lg:col-span-7">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
            The Founder
          </span>
          <h1 className="mt-3 font-display text-5xl italic leading-tight sm:text-6xl">
            Habiba Minhas
          </h1>
          <p className="mt-2 text-[14px] uppercase tracking-[0.24em] text-muted">
            Founder & Creative Director
          </p>

          <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            <p>
              Habiba Minhas is the founder and creative director of Habiba Minhas, 
              Pakistan's leading brand for handcrafted ladies suits, kids festive wear, 
              and premium baby products. Based in Karachi, she has built a brand that 
              serves over 5,000 customers across Pakistan.
            </p>
            
            <p>
              With a deep passion for preserving traditional Pakistani craftsmanship 
              while embracing contemporary design, Habiba works directly with artisan 
              embroiderers, skilled tailors, and fabric specialists to create pieces 
              that honor heritage while meeting modern expectations.
            </p>

            <h2 className="mt-8 font-display text-3xl italic">Expertise & Experience</h2>
            
            <p>
              Habiba specializes in:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Premium Pakistani fashion design and curation</li>
              <li>Traditional embroidery techniques and artisan craftsmanship</li>
              <li>Silk fabric selection and quality assessment</li>
              <li>Kids formalwear design for Pakistani celebrations</li>
              <li>Baby nursery product design and safety standards</li>
              <li>Fashion styling for Pakistani weddings and formal events</li>
            </ul>

            <h2 className="mt-8 font-display text-3xl italic">The Vision</h2>
            
            <p>
              Starting with a simple belief that premium quality fashion and baby 
              products should be accessible to every family in Pakistan, Habiba 
              founded the brand in 2026. What began as a vision has grown into a 
              destination trusted by thousands.
            </p>

            <p>
              Every product at Habiba Minhas is either handcrafted in Pakistan or 
              personally curated by Habiba to meet exacting quality standards. From 
              3-piece silk suits with gold brocade to luxurious baby bedding sets, 
              each piece reflects her commitment to quality and authenticity.
            </p>

            <h2 className="mt-8 font-display text-3xl italic">Recognition</h2>
            
            <p>
              Habiba Minhas (the brand) has served over 5,000 happy customers 
              nationwide and is recognized as one of Pakistan's trusted sources for 
              handcrafted fashion and baby products.
            </p>

            <div className="mt-12 border-t border-border-soft pt-8">
              <h3 className="font-display text-2xl italic mb-4">Connect</h3>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.instagram.com/habibaminhas.official/" target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-ink px-4 py-2 text-[12px] uppercase tracking-[0.22em] hover:bg-ink hover:text-ivory transition-colors">
                  Instagram
                </a>
                <a href="https://www.facebook.com/profile.php?id=61573309750795" target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-ink px-4 py-2 text-[12px] uppercase tracking-[0.22em] hover:bg-ink hover:text-ivory transition-colors">
                  Facebook
                </a>
                <a href="https://www.pinterest.com/habibaminhas_official/" target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-ink px-4 py-2 text-[12px] uppercase tracking-[0.22em] hover:bg-ink hover:text-ivory transition-colors">
                  Pinterest
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Link href="/journal" className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.24em] text-ink-soft hover:text-ink">
          ← Read the Journal
        </Link>
      </div>
    </div>
  );
}
```

**TODO**: Need to add actual founder photo at `/public/about/habiba-minhas-founder.jpg`

---

### ✅ TASK 3.3: Verify Social Profile Links

**Goal**: Ensure all social links in Person schema are correct and active

**File**: `components/seo/person-schema.tsx`

**Verify these URLs** (test each one):
- Instagram: https://www.instagram.com/habibaminhas.official/
- Facebook: https://www.facebook.com/profile.php?id=61573309750795
- YouTube: https://www.youtube.com/@HabibaMinhas989
- TikTok: https://www.tiktok.com/@habibaminhas._official
- X/Twitter: https://x.com/HabibaMinhas_
- Pinterest: https://www.pinterest.com/habibaminhas_official/
- Quora: https://www.quora.com/profile/Habiba-Minhas-6
- Reddit: https://www.reddit.com/user/HabibaMinhas_989/

**If any are incorrect**: Update in person-schema.tsx

---

### ✅ TASK 3.4: Add "Meet the Founder" Section to Homepage

**Goal**: Add founder section to homepage for E-E-A-T

**File**: `app/page.tsx`

**Add before TestimonialRow** (around line 105):

```tsx
<section className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8">
  <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
    <div className="lg:col-span-5">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src="/about/habiba-minhas-founder.jpg"
          alt="Habiba Minhas - Founder"
          fill
          sizes="(max-width: 1024px) 100vw, 42vw"
          className="object-cover object-center"
        />
      </div>
    </div>
    <div className="flex flex-col justify-center lg:col-span-7">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
        Meet the Founder
      </span>
      <h2 className="mt-3 font-display text-4xl italic leading-tight sm:text-5xl">
        Crafted with passion, delivered with care.
      </h2>
      <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
        Founded by Habiba Minhas, our brand brings together traditional Pakistani 
        craftsmanship and contemporary design. Every piece is thoughtfully created 
        in our Karachi studio, working directly with skilled artisans who have 
        perfected their craft over generations.
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        From premium silk suits with gold brocade to luxurious baby bedding sets, 
        we're committed to quality, authenticity, and the timeless elegance of 
        handcrafted fashion.
      </p>
      <Link
        href="/about/author"
        className="mt-8 inline-flex h-12 w-fit items-center border border-ink px-8 text-[11px] uppercase tracking-[0.26em] hover:bg-ink hover:text-ivory transition-colors"
      >
        Read More About Habiba
      </Link>
    </div>
  </div>
</section>
```

---

### ✅ TASK 3.5: Create Structured Author Credentials

Already done in Person schema and author pages! ✅

---

### ✅ TASK 3.6: Submit to Google Knowledge Graph

**Goal**: Help Google recognize "Habiba Minhas" as entity

**Method**:
1. Ensure Person schema is live on all pages ✅ (Done in Phase 1)
2. Ensure all social profiles link back to website
3. Create/update Wikipedia entry (if eligible)
4. Get mentioned on authoritative Pakistani fashion sites
5. Build consistent author attribution across web

**This is passive** - happens over time (weeks/months) as Google discovers the entity

---

### ✅ TASK 3.7: Add FAQ Section to Homepage

**Goal**: Answer common questions visitors have

**File**: `app/page.tsx`

**Add before footer** (after JournalTeaser around line 106):

```tsx
<section className="bg-cream py-20">
  <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8">
    <div className="mx-auto max-w-4xl">
      <h2 className="text-center font-display text-4xl italic sm:text-5xl">
        Frequently Asked Questions
      </h2>
      <div className="mt-12 space-y-8">
        <div>
          <h3 className="font-display text-2xl italic text-ink">
            Do you deliver nationwide in Pakistan?
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            Yes! We deliver to all cities across Pakistan with flat Rs. 250 shipping. 
            Most orders arrive within 3-5 business days. Karachi orders often arrive within 2 days.
          </p>
        </div>

        <div>
          <h3 className="font-display text-2xl italic text-ink">
            Are your products handcrafted or machine-made?
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            All our ladies suits and kids formalwear feature handcrafted embroidery and 
            artisan finishes. We work directly with skilled embroiderers in Karachi who 
            have perfected traditional techniques. Baby products are professionally 
            manufactured with premium materials.
          </p>
        </div>

        <div>
          <h3 className="font-display text-2xl italic text-ink">
            What is your return policy?
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            We offer a 14-day return and exchange policy. Items must be unworn with 
            original tags attached. We want you to love your purchase!
          </p>
        </div>

        <div>
          <h3 className="font-display text-2xl italic text-ink">
            How do I contact customer support?
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            Reach us on WhatsApp at +92 312 0295812, email info@habibaminhas.com, or 
            use our contact form. We respond within 24 hours, Monday through Friday.
          </p>
        </div>

        <div>
          <h3 className="font-display text-2xl italic text-ink">
            Do you offer international shipping?
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            Currently we focus on serving customers within Pakistan. For international 
            orders, please contact us directly and we'll do our best to accommodate.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

{/* FAQ Schema */}
<FAQSchema
  faqs={[
    {
      question: "Do you deliver nationwide in Pakistan?",
      answer: "Yes! We deliver to all cities across Pakistan with flat Rs. 250 shipping. Most orders arrive within 3-5 business days."
    },
    {
      question: "Are your products handcrafted or machine-made?",
      answer: "All our ladies suits and kids formalwear feature handcrafted embroidery and artisan finishes. We work directly with skilled embroiderers in Karachi."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 14-day return and exchange policy. Items must be unworn with original tags attached."
    },
    {
      question: "How do I contact customer support?",
      answer: "Reach us on WhatsApp at +92 312 0295812, email info@habibaminhas.com, or use our contact form. We respond within 24 hours."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently we focus on serving customers within Pakistan. For international orders, please contact us directly."
    }
  ]}
/>
```

---

### ✅ TASK 3.8-3.12: Add FAQ Sections to Other Pages

**Same method for**:
- 3.8: About page
- 3.9: Verify products (done in Phase 2)
- 3.10: Category pages (shop, ladies, kids, baby, accessories)
- 3.11: Contact page
- 3.12: Ensure all have FAQ schema

Each page gets 3-5 relevant questions with direct answers + FAQ schema markup.

---

## 🎯 PHASE 3 COMPLETION CRITERIA

- [ ] Author bio on all 25 blog posts
- [ ] "About the Author" page created at /about/author
- [ ] Social profile links verified
- [ ] "Meet the Founder" section on homepage
- [ ] FAQ sections on homepage, about, contact, categories
- [ ] FAQ schema on all pages with FAQs
- [ ] All verified with Google Rich Results Test

---

## ⏭️ NEXT PHASE

Once Phase 3 complete → Open `05-PHASE-4-IMPLEMENTATION.md` for internal linking strategy!
