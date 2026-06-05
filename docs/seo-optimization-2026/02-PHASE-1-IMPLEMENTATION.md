# PHASE 1: Critical Schema & Metadata Implementation

**Priority**: CRITICAL  
**Total Tasks**: 15  
**Estimated Time**: 1 week  
**Status**: ⏳ Not Started

---

## 🎯 PHASE 1 GOALS

1. ✅ Implement Person schema for Habiba Minhas (founder/author entity)
2. ✅ Add AggregateRating schema to all products
3. ✅ Create FAQ schema component
4. ✅ Add LocalBusiness schema to contact page
5. ✅ Create CollectionPage schema for categories
6. ✅ Generate custom SEO metadata for all 51 products
7. ✅ Add metadata to contact page

---

## 📋 TASK CHECKLIST

### Schema Implementation:
- [ ] Task 1.1 - Create Person Schema Component
- [ ] Task 1.2 - Add Person Schema to Layout
- [ ] Task 1.3 - Create AggregateRating Schema Component
- [ ] Task 1.4 - Add AggregateRating to Product Pages
- [ ] Task 1.5 - Create FAQ Schema Component
- [ ] Task 1.6 - Create LocalBusiness Schema Component
- [ ] Task 1.7 - Add LocalBusiness to Contact Page
- [ ] Task 1.8 - Create CollectionPage Schema Component

### Metadata Updates:
- [ ] Task 1.9 - Add Metadata to Contact Page
- [ ] Task 1.10 - Generate SEO Titles for All Products
- [ ] Task 1.11 - Generate SEO Descriptions for All Products
- [ ] Task 1.12 - Update Article Schema (Person not Organization)
- [ ] Task 1.13 - Verify All Metadata in Search Console

### Verification:
- [ ] Task 1.14 - Test All Schema with Rich Results Test
- [ ] Task 1.15 - Check for Broken Links

---

## 📝 DETAILED TASK INSTRUCTIONS

---

### ✅ TASK 1.1: Create Person Schema Component

**Goal**: Create a reusable Person schema component for Habiba Minhas (founder/author)

**Priority**: CRITICAL - This establishes entity recognition

#### Step 1: Create the file
**Location**: `components/seo/person-schema.tsx`

**Code**:
```typescript
export function PersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Habiba Minhas",
    "url": "https://habibaminhas.com/about/",
    "image": "https://habibaminhas.com/about/habiba-minhas.jpg", // TODO: Add actual photo
    "jobTitle": "Founder & Creative Director",
    "description": "Founder of Habiba Minhas, Pakistan's leading handcrafted fashion brand. Specializing in premium ladies suits, kids festive wear, and baby products made in Karachi.",
    "worksFor": {
      "@type": "Organization",
      "name": "Habiba Minhas",
      "url": "https://habibaminhas.com"
    },
    "sameAs": [
      "https://www.instagram.com/habibaminhas.official/",
      "https://www.facebook.com/profile.php?id=61573309750795",
      "https://www.youtube.com/@HabibaMinhas989",
      "https://www.tiktok.com/@habibaminhas._official",
      "https://x.com/HabibaMinhas_",
      "https://www.pinterest.com/habibaminhas_official/",
      "https://www.quora.com/profile/Habiba-Minhas-6",
      "https://www.reddit.com/user/HabibaMinhas_989/"
    ],
    "knowsAbout": [
      "Pakistani Fashion",
      "Handcrafted Clothing",
      "Silk Suits",
      "Traditional Wear",
      "Kids Festive Wear",
      "Baby Products",
      "Fashion Design"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Karachi",
      "addressCountry": "PK"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

#### Step 2: Verify the component
- Check TypeScript compilation: `npm run build` (should have no errors)
- File should be exactly at: `components/seo/person-schema.tsx`

#### Step 3: Update TRACKER.md
```markdown
### [Date] - Phase 1 - Task 1.1: Create Person Schema Component

**Changed**:
- File: `components/seo/person-schema.tsx` (NEW)
- Lines: 1-58
- Action: Created Person schema component for Habiba Minhas

**Reason**: Establish Habiba Minhas as recognized entity (Issue #1-1)

**Verification**:
- Component created successfully
- TypeScript compiles without errors

**Status**: ✅ Complete
**Next**: Task 1.2 - Add Person Schema to Layout
```

---

### ✅ TASK 1.2: Add Person Schema to Layout

**Goal**: Include Person schema on every page via root layout

#### Step 1: Import the component
**File**: `app/layout.tsx`  
**Line**: Add after line 8 (after WebSiteSchema import)

```typescript
import { PersonSchema } from "@/components/seo/person-schema";
```

#### Step 2: Add component to JSX
**File**: `app/layout.tsx`  
**Location**: After `<WebSiteSchema />` (line 105)

```typescript
<OrganizationSchema />
<WebSiteSchema />
<PersonSchema />
```

#### Step 3: Verify
- Run dev server: `npm run dev`
- Open homepage in browser
- View page source (Ctrl+U)
- Search for `"@type": "Person"` - should appear
- Verify "Habiba Minhas" appears in schema

#### Step 4: Test with Google
- Go to: https://search.google.com/test/rich-results
- Enter URL: https://habibaminhas.com
- Should detect "Person" schema
- No errors should appear

#### Step 5: Update TRACKER.md
```markdown
### [Date] - Phase 1 - Task 1.2: Add Person Schema to Layout

**Changed**:
- File: `app/layout.tsx`
- Lines: 9 (import), 107 (component)
- Action: Added PersonSchema to global layout

**Reason**: Make Person entity available on all pages

**Verification**:
- Person schema appears in page source
- Google Rich Results Test passes
- No TypeScript errors

**Status**: ✅ Complete
**Next**: Task 1.3 - Create AggregateRating Schema
```

---

### ✅ TASK 1.3: Create AggregateRating Schema Component

**Goal**: Create component to show review stars in search results

**Why**: You show "4.8 · 214 reviews" on products but no schema markup!

#### Step 1: Create the file
**Location**: `components/seo/aggregate-rating-schema.tsx`

**Code**:
```typescript
interface AggregateRatingSchemaProps {
  ratingValue: number;
  reviewCount: number;
  productName: string;
  productUrl: string;
}

export function AggregateRatingSchema({
  ratingValue,
  reviewCount,
  productName,
  productUrl,
}: AggregateRatingSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "ratingValue": ratingValue.toString(),
    "reviewCount": reviewCount.toString(),
    "bestRating": "5",
    "worstRating": "1",
    "itemReviewed": {
      "@type": "Product",
      "name": productName,
      "url": productUrl
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

#### Step 2: Verify compilation
- Run: `npm run build`
- No TypeScript errors

#### Step 3: Update TRACKER.md

---

### ✅ TASK 1.4: Add AggregateRating to Product Pages

**Goal**: Add review schema to all 51 product pages

#### Step 1: Import component
**File**: `app/product/[category]/[slug]/page.tsx`  
**Line**: Add around line 20 (after other imports)

```typescript
import { AggregateRatingSchema } from "@/components/seo/aggregate-rating-schema";
```

#### Step 2: Add component before closing </div>
**File**: Same file  
**Location**: After `<BreadcrumbSchema>` component (around line 263)

```typescript
{/* Schema Markup for SEO */}
<ProductSchema product={product} />
<BreadcrumbSchema
  items={[
    { name: "Home", url: "/" },
    { name: catLink?.label || "Shop", url: catLink?.href || "/ladies" },
    { name: product.title, url: `/product/${category}/${slug}/` }
  ]}
/>
<AggregateRatingSchema
  ratingValue={4.8}
  reviewCount={214}
  productName={product.title}
  productUrl={`https://habibaminhas.com/product/${category}/${slug}/`}
/>
```

#### Step 3: Verify on one product
- Visit: http://localhost:3000/product/ladies-suits/ld-sku-rwe-3pc-ss25-014
- View source
- Search for `"@type": "AggregateRating"`
- Should see ratingValue: "4.8", reviewCount: "214"

#### Step 4: Test with Google Rich Results
- Test URL with Google tool
- Should show review stars in preview

#### Step 5: Update TRACKER.md

---

### ✅ TASK 1.5: Create FAQ Schema Component

**Goal**: Create reusable FAQ schema for all pages

#### Step 1: Create the file
**Location**: `components/seo/faq-schema.tsx`

**Note**: Check if this already exists! (Line 15 imports FAQSchema in blog post page)

**If it exists**: Skip to Task 1.6  
**If not**: Create this file:

```typescript
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

#### Step 2: Verify
- Component created at correct location
- TypeScript compiles

---

### ✅ TASK 1.6: Create LocalBusiness Schema Component

**Goal**: Create schema for contact page (local SEO)

#### Step 1: Create the file
**Location**: `components/seo/local-business-schema.tsx`

**Code**:
```typescript
export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Habiba Minhas",
    "image": "https://habibaminhas.com/logo/logo.png",
    "url": "https://habibaminhas.com",
    "telephone": "+92-312-0295812",
    "email": "info@habibaminhas.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Karachi",
      "addressLocality": "Karachi",
      "postalCode": "75533",
      "addressCountry": "PK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "24.8607",
      "longitude": "67.0011"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "priceRange": "Rs. 2,000 - Rs. 20,000",
    "paymentAccepted": "Cash, Bank Transfer",
    "currenciesAccepted": "PKR"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

---

### ✅ TASK 1.7: Add LocalBusiness to Contact Page

**Goal**: Add LocalBusiness schema to contact page

**Problem**: Contact page is client component ("use client"), can't add schema directly

#### Solution: Add to layout or make a wrapper

**Option A** (Recommended): Add to contact page via fragment

**File**: `app/contact/page.tsx`  
**Line 1**: Check if it says `"use client"` - Yes it does

**Step 1**: Import at top (after other imports around line 6)
```typescript
import { LocalBusinessSchema } from "@/components/seo/local-business-schema";
```

**Step 2**: Add before return statement (line 37, before the opening div)

Since it's a client component, we need to add it differently:

Actually, **better solution**: Create a separate metadata file

**Create**: `app/contact/metadata.ts`
```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Habiba Minhas | Get in Touch with Our Karachi Studio",
  description: "Contact Habiba Minhas for order queries, return requests, or styling advice. WhatsApp: +92 312 0295812 | Email: info@habibaminhas.com | Karachi, Pakistan",
  alternates: {
    canonical: "/contact/",
  },
  keywords: "contact Habiba Minhas, customer support Pakistan, WhatsApp order support, Karachi fashion store contact",
};
```

**Then create**: `app/contact/layout.tsx`
```typescript
import { LocalBusinessSchema } from "@/components/seo/local-business-schema";

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LocalBusinessSchema />
      {children}
    </>
  );
}
```

#### Verify:
- Visit /contact
- View source
- Should see LocalBusiness schema

---

### ✅ TASK 1.8: Create CollectionPage Schema

**Goal**: Add schema for category pages (shop, ladies, kids, baby, accessories)

#### Step 1: Create component
**Location**: `components/seo/collection-page-schema.tsx`

```typescript
interface CollectionPageSchemaProps {
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
}

export function CollectionPageSchema({
  name,
  description,
  url,
  numberOfItems,
}: CollectionPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": `https://habibaminhas.com${url}`,
    "numberOfItems": numberOfItems,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Habiba Minhas",
      "url": "https://habibaminhas.com"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

#### Step 2: Add to shop page
**File**: `app/shop/page.tsx`  
**Import**: Add `CollectionPageSchema` import  
**Add**: Before return, add schema component with props

---

### ✅ TASK 1.9: Add Metadata to Contact Page

**Already done in Task 1.7!** ✅

---

### ✅ TASK 1.10 & 1.11: Generate SEO Titles & Descriptions for All Products

**Goal**: Add custom seo_title and seo_description for all 51 products

**Method**: Database update via Supabase

#### Step 1: Create SQL script

**Ladies Suits** (12 products) - Example for first product:
```sql
UPDATE products 
SET 
  seo_title = 'Bronze Mocha Silk Suit — 3-Piece Stitched with Sequin Artistry | Habiba Minhas',
  seo_description = 'Elegant bronze mocha 3-piece stitched silk suit with sequin artistry. Perfect for Pakistani weddings & formal events. Made in Karachi. Rs. 250 delivery.'
WHERE slug = 'ld-sku-bz-slk-m-016';
```

**Note**: This requires writing 51 custom SEO titles and descriptions

**Recommendation**: Create a separate task list for this in TRACKER.md with all 51 products

---

### ✅ TASK 1.12: Update Article Schema (Person not Organization)

**Goal**: Change blog author from Organization to Person

**File**: `components/seo/article-schema.tsx`  
**Lines**: 36-39

**Change FROM**:
```typescript
"author": {
  "@type": "Organization",
  "name": author,
  "url": baseUrl
},
```

**Change TO**:
```typescript
"author": {
  "@type": "Person",
  "name": author,
  "url": `${baseUrl}/about/`
},
```

#### Verify:
- Visit any blog post
- View source
- Author should be "@type": "Person"

---

### ✅ TASK 1.13: Verify All Metadata in Search Console

**Goal**: Ensure no errors in Google Search Console

#### Steps:
1. Go to: https://search.google.com/search-console
2. Check "Coverage" report
3. Look for schema errors
4. Fix any issues found

---

### ✅ TASK 1.14: Test All Schema with Rich Results Test

**Goal**: Validate all schema types

#### For each page type:
1. Homepage: https://search.google.com/test/rich-results?url=https://habibaminhas.com
2. Product: Test sample product URL
3. Blog: Test sample blog URL
4. Contact: Test contact page
5. Shop: Test shop page

#### Success criteria:
- No errors
- All schema types detected
- Preview looks correct

---

### ✅ TASK 1.15: Check for Broken Links

**Goal**: Ensure no internal links broken

#### Method:
- Use browser dev tools or link checker
- Check all new pages added
- Verify all schema URLs are correct
- Test on mobile and desktop

---

## 🎯 PHASE 1 COMPLETION CRITERIA

### Before marking Phase 1 complete:

- [ ] All 8 schema components created
- [ ] Person schema on all pages
- [ ] AggregateRating on all products
- [ ] LocalBusiness on contact page
- [ ] CollectionPage on category pages
- [ ] All 51 products have seo_title and seo_description
- [ ] Contact page has metadata
- [ ] Article schema uses Person not Organization
- [ ] Google Rich Results Test passes for all page types
- [ ] No broken links introduced
- [ ] TRACKER.md fully updated with all changes

---

## 📊 VERIFICATION CHECKLIST

After completing all tasks, verify:

### Schema Validation:
- [ ] Homepage: Organization ✅, Website ✅, Person ✅
- [ ] Product pages: Product ✅, AggregateRating ✅, Breadcrumb ✅
- [ ] Blog posts: Article ✅, Person (author) ✅, Breadcrumb ✅
- [ ] Contact: LocalBusiness ✅
- [ ] Categories: CollectionPage ✅, Breadcrumb ✅

### Google Rich Results Test:
- [ ] All page types tested
- [ ] No errors reported
- [ ] Preview shows correct information

### Metadata:
- [ ] All 51 products have custom titles
- [ ] All 51 products have custom descriptions
- [ ] Contact page has metadata

---

## ⏭️ NEXT PHASE

**Once Phase 1 is complete**:
- Mark all tasks ✅ in TRACKER.md
- Update completion percentage
- Open `03-PHASE-2-IMPLEMENTATION.md`
- Begin product content optimization

**Estimated time saved**: Phase 1 creates the foundation that makes Phase 2-4 much more effective!

---

**Remember**: Test after EACH task, not at the end. Update TRACKER.md frequently!
