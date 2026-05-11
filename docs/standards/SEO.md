# SEO Standards & Implementation Guide

**Last Updated:** May 11, 2026  
**Site:** habibaminhas.com  
**Framework:** Next.js 16.2.4 (App Router)

---

## 🎯 Overview

This document outlines the SEO standards implemented across the Habiba Minhas e-commerce website, including fixes for all identified issues from the SEO audit.

---

## ✅ Issues Fixed

### 1. Missing H1 Tags ✓

**Problem:** Multiple pages were missing H1 tags, which are critical for SEO and accessibility.

**Solution Implemented:**
- **Home Page (`/`)** - Added visually hidden H1 with `sr-only` class for SEO without affecting design
- **Journal Page (`/journal/`)** - Replaced `<h2>` in SectionHeading with proper `<h1>`
- **All other pages** - Verified H1 tags present:
  - Account pages ✓
  - Wishlist ✓
  - Cart ✓
  - Product pages ✓
  - Category pages (Ladies, Kids, Baby, Accessories) ✓
  - About page ✓
  - Contact page ✓
  - Help pages ✓
  - Legal pages ✓

**Files Modified:**
- `app/page.tsx` - Added hidden H1
- `app/journal/page.tsx` - Converted SectionHeading to use H1

---

### 2. Missing Canonical URLs ✓

**Problem:** Pages lacked canonical URL specification, leading to potential ranking unpredictability with duplicate content.

**Solution Implemented:**
- Configured `metadataBase` in root layout: `https://habibaminhas.com`
- Added `alternates.canonical` to all page metadata
- Trailing slashes enabled via `trailingSlash: true` in Next.js config

**Example Implementation:**
```typescript
export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
  alternates: {
    canonical: "/page-path/",
  },
};
```

**Files Modified:**
- `app/layout.tsx` - Added metadataBase
- `next.config.ts` - Enabled trailingSlash
- All page files with metadata exports

---

### 3. Missing Security Headers ✓

**Problem:** Missing HTTP security headers exposed the site to potential security vulnerabilities.

**Solution Implemented:**

Added comprehensive security headers in `next.config.ts`:

#### X-Frame-Options
```
X-Frame-Options: SAMEORIGIN
```
Prevents clickjacking attacks by disallowing site embedding in iframes.

#### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
Prevents MIME-type sniffing, forcing browsers to respect declared content types.

#### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
Controls referrer information leakage while maintaining analytics functionality.

#### Content-Security-Policy
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' widget.trustpilot.com *.supabase.co;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' *.supabase.co wss://*.supabase.co;
  frame-src 'self' widget.trustpilot.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
```

**File Modified:**
- `next.config.ts` - Added headers() async function

---

### 4. Duplicate Meta Descriptions ✓

**Problem:** Multiple pages had identical or missing meta descriptions.

**Solution Implemented:**

Created unique, descriptive meta descriptions for all pages:

| Page | Meta Description |
|------|------------------|
| Home | "Couture-inspired unstitched fabric, ready-to-wear silhouettes, modest wear, and fragrance — made in Pakistan, shipped worldwide." |
| Ladies | "Handcrafted 3-piece silk suits adorned with gold brocade, mirror-work, and artisan embroidery — made for the modern Pakistani woman." |
| Kids | "Festive co-ord sets, embroidered gowns, and silk suits for girls — handcrafted for Eid, weddings, and every celebration." |
| Baby | "Soft, padded nursery bedding sets, baby nests, swaddle wraps, and accessories — everything your little one needs, made with love in Pakistan." |
| Accessories | "3-piece handcrafted silk headband & floral clip sets — made by hand, finished with care, gifted with love." |
| About | "Habiba Minhas — Crafting elegance for the modern family since 2026. Premium handcrafted fashion and baby products made in Pakistan." |
| Journal | "Field notes, fabric notes, and the occasional recipe. We publish once a week — no algorithms, no sponsored posts." |
| Cart | "Review your shopping bag and proceed to checkout. Handcrafted fashion from Pakistan with flat Rs. 250 delivery." |
| Wishlist | "View and manage your saved items. Save your favorite pieces from Habiba Minhas for later." |
| Account | "View your order history, manage delivery addresses, and update your account settings at Habiba Minhas." |
| Contact | "Get in touch with Habiba Minhas. Order queries, return requests, or general inquiries — we respond within 24 hours." |

**Files Modified:**
- All page metadata exports updated with unique descriptions

---

### 5. Internal Redirects & Trailing Slash ✓

**Problem:** Internal links redirected to different URLs, adding latency and complexity.

**Solution Implemented:**
- Enabled `trailingSlash: true` in Next.js config for consistent URL structure
- Updated all redirect destinations to include trailing slashes
- No redirect loops - all internal links resolve directly to canonical URLs

**Example:**
```typescript
// Before: /ladies (redirects to /ladies/)
// After: /ladies/ (direct, no redirect)
```

**File Modified:**
- `next.config.ts` - Added trailingSlash, updated redirects

---

## 📋 Complete Page Inventory

### Pages with Full SEO Implementation

| Page | H1 | Canonical | Description | Status |
|------|----|-----------| ------------|--------|
| `/` | ✓ | ✓ | ✓ | ✓ |
| `/about/` | ✓ | ✓ | ✓ | ✓ |
| `/ladies/` | ✓ | ✓ | ✓ | ✓ |
| `/kids/` | ✓ | ✓ | ✓ | ✓ |
| `/baby/` | ✓ | ✓ | ✓ | ✓ |
| `/accessories/` | ✓ | ✓ | ✓ | ✓ |
| `/new/` | ✓ | ✓ | ✓ | ✓ |
| `/offers/` | ✓ | ✓ | ✓ | ✓ |
| `/account/` | ✓ | ✓ | ✓ | ✓ |
| `/wishlist/` | ✓ | ✓ | ✓ | ✓ |
| `/cart/` | ✓ | ✓ | ✓ | ✓ |
| `/contact/` | ✓ | ✓ | ✓ | ✓ |
| `/journal/` | ✓ | ✓ | ✓ | ✓ |
| `/journal/[slug]/` | ✓ | ✓ | ✓ | ✓ |
| `/product/[slug]/` | ✓ | ✓ | ✓ | ✓ |
| `/help/[slug]/` | ✓ | ✓ | ✓ | ✓ |
| `/legal/[slug]/` | ✓ | ✓ | ✓ | ✓ |

---

## 🏗️ Technical Implementation

### Next.js Configuration

**File:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  trailingSlash: true,
  
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Content-Security-Policy", value: "..." },
      ],
    }];
  },
  
  async redirects() {
    // All redirects include trailing slashes
    return [
      { source: "/women", destination: "/ladies/", permanent: true },
      // ... other redirects
    ];
  },
};
```

### Root Layout Metadata

**File:** `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  metadataBase: new URL("https://habibaminhas.com"),
  title: {
    default: "Habiba Minhas — Modern Heritage, Unstitched & Ready to Wear",
    template: "%s | Habiba Minhas",
  },
  description: "...",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://habibaminhas.com/",
    siteName: "Habiba Minhas",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

### Page Metadata Pattern

**For Static Pages:**
```typescript
export const metadata: Metadata = {
  title: "Page Title",
  description: "Unique, descriptive content",
  alternates: {
    canonical: "/page-path/",
  },
};
```

**For Dynamic Pages:**
```typescript
export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const data = await fetchData(slug);
  
  return {
    title: data.title,
    description: data.description,
    alternates: {
      canonical: `/path/${slug}/`,
    },
  };
}
```

**For Client Components:**
Create a separate layout file:

```typescript
// app/section/layout.tsx
export const metadata: Metadata = {
  title: "Title",
  description: "Description",
  alternates: { canonical: "/section/" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

---

## 📊 SEO Checklist

Use this checklist when creating new pages:

- [ ] **H1 Tag:** Page has exactly one descriptive H1
- [ ] **Meta Title:** Unique, under 60 characters, includes brand name
- [ ] **Meta Description:** Unique, 120-160 characters, includes key terms
- [ ] **Canonical URL:** Properly set with trailing slash
- [ ] **Open Graph:** Title, description, and image set
- [ ] **Alt Text:** All images have descriptive alt attributes
- [ ] **Internal Links:** Use descriptive anchor text
- [ ] **URL Structure:** Clean, descriptive, includes keywords
- [ ] **Mobile Responsive:** Tested on mobile devices
- [ ] **Page Speed:** Optimized images and lazy loading

---

## 🔍 Monitoring & Maintenance

### Monthly SEO Audit Checklist

1. **Google Search Console**
   - Check for crawl errors
   - Review search performance
   - Monitor Core Web Vitals

2. **Structured Data**
   - Verify product schema
   - Check organization schema
   - Test breadcrumb markup

3. **Content Review**
   - Ensure meta descriptions remain unique
   - Update old content
   - Check for broken links

4. **Technical Health**
   - Verify canonical URLs resolve correctly
   - Check redirect chains
   - Monitor security headers

### Tools Used

- **Screaming Frog SEO Spider** - Site crawl and analysis
- **Google Search Console** - Search performance monitoring
- **Google PageSpeed Insights** - Performance metrics
- **Lighthouse** - Overall site quality audit

---

## 📚 Best Practices

### Title Tags
- **Format:** `[Primary Keyword] | Habiba Minhas`
- **Length:** 50-60 characters
- **Unique:** Every page must have a unique title

### Meta Descriptions
- **Length:** 120-160 characters
- **Include:** Primary keyword, call-to-action, brand name
- **Unique:** Never duplicate across pages

### H1 Tags
- **One per page:** Exactly one H1, clearly describes page content
- **Length:** 20-70 characters
- **Include:** Primary keyword when natural

### URLs
- **Structure:** `/category/subcategory/product/`
- **Format:** lowercase, hyphens (not underscores)
- **Keywords:** Include relevant keywords
- **Trailing Slash:** Always include trailing slash for consistency

### Internal Linking
- **Descriptive anchors:** Use descriptive text, not "click here"
- **Relevant:** Link to related content
- **Natural:** Don't over-optimize

---

## 🚀 Performance Impact

### Before SEO Fixes
- Missing H1 tags: **89 pages**
- Missing canonical URLs: **89 pages**
- Missing security headers: **All pages**
- Duplicate meta descriptions: **47 pages**

### After SEO Fixes
- ✅ All pages have H1 tags
- ✅ All pages have canonical URLs
- ✅ All pages have security headers
- ✅ All pages have unique descriptions

### Expected Improvements
- **Better Rankings:** Improved on-page SEO signals
- **Higher CTR:** Unique, compelling meta descriptions
- **Enhanced Security:** Protection against common web vulnerabilities
- **Improved Crawlability:** Clean URL structure and canonicals

---

## 📝 Notes

### URL Trailing Slash Policy
- **Enabled:** `trailingSlash: true` in Next.js config
- **Why:** Consistency, SEO clarity, prevents duplicate content
- **Impact:** All URLs automatically get trailing slashes
- **Redirects:** No 301 redirects needed - Next.js handles internally

### Open Graph & Social Media
- All pages include Open Graph tags
- Twitter Card metadata included
- Fallback image: `/og-image.jpg` (1200x630px)

### Future Enhancements
- [ ] Implement structured data (JSON-LD)
- [ ] Add breadcrumb schema
- [ ] Create XML sitemap (dynamic)
- [ ] Implement AMP for blog posts
- [ ] Add hreflang tags for international versions

---

## 🔗 Related Documentation

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Document Owner:** Development Team  
**Review Frequency:** Quarterly  
**Last Audit:** May 11, 2026
