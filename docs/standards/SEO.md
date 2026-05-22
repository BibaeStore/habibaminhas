# SEO Standards & Implementation Guide

**Last Updated:** May 22, 2026  
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

## 🤖 Agent-Ready Features (2026-05-22 Audit)

**Last Audit Date:** May 22, 2026  
**Auditor:** Ismail SEO  
**Status:** Partially Implemented (Strategic Selection)

---

### Background

The May 2026 SEO audit requested implementation of "Agent-Ready" features — modern standards (2025-2026) that help AI agents (ChatGPT, Claude, Perplexity, etc.) discover and interact with website content. These are **NOT traditional security issues** but rather advanced discovery features.

---

### ✅ IMPLEMENTED Features

#### 1. Content Signals in robots.txt

**What it is:** Declares how AI agents can use our content (training, search, input).

**Implementation:**
```
Content-Signal: ai-train=no, search=yes, ai-input=yes
```

**Rationale:**
- `ai-train=no` - Protect our unique Pakistani fashion content from AI training
- `search=yes` - Allow AI to use our content in search results
- `ai-input=yes` - Allow AI to read and recommend our products to users

**File:** `app/robots.txt/route.ts`  
**Impact:** Zero breaking changes, better control over AI usage  
**Reference:** https://contentsignals.org/

---

#### 2. Link Response Headers (RFC 8288)

**What it is:** HTTP headers that point AI agents to useful resources.

**Implementation:**
```
Link: </sitemap.xml>; rel="sitemap"; type="application/xml",
      </journal/>; rel="collection"; title="Fashion & Lifestyle Blog",
      </ladies/>; rel="collection"; title="Ladies Collection",
      </kids/>; rel="collection"; title="Kids Festive Wear",
      </baby/>; rel="collection"; title="Baby & Nursery",
      </about/>; rel="about"; title="About Habiba Minhas"
```

**File:** `next.config.ts` lines 66-75  
**Impact:** Improved AI agent discovery of key pages  
**Reference:** https://www.rfc-editor.org/rfc/rfc8288

---

#### 3. Markdown for Agents (Detection)

**What it is:** Detects when AI agents request markdown instead of HTML.

**Implementation:**
- Middleware detects `Accept: text/markdown` header
- Sets `x-markdown-requested: true` flag
- **Note:** Detection only, conversion deferred for performance

**File:** `middleware.ts` lines 53-61  
**Impact:** Zero performance impact, future-ready for per-route conversion  
**Reference:** https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/

---

### ❌ NOT IMPLEMENTED (Strategic Decision)

The following 6 features were recommended but **NOT implemented** because they are **NOT applicable** for an e-commerce storefront:

#### 4. API Catalog (/.well-known/api-catalog)
- **What it is:** Discovery endpoint for public APIs
- **Why skipped:** We don't expose public APIs (Supabase is internal)
- **Decision:** Only relevant for API providers (Stripe, Twilio, Google Maps, etc.)

#### 5. OAuth/OIDC Discovery Metadata
- **What it is:** Authentication discovery for OAuth providers
- **Why skipped:** We use Supabase auth, not a public OAuth provider
- **Decision:** Only relevant if building a login provider like Google/Facebook

#### 6. OAuth Protected Resource Metadata
- **What it is:** Tells AI agents how to authenticate with protected APIs
- **Why skipped:** No public protected APIs to expose
- **Decision:** Same as #5

#### 7. MCP Server Card
- **What it is:** Model Context Protocol server discovery
- **Why skipped:** Experimental feature for developer tools, not e-commerce
- **Decision:** Not production-ready, not relevant for our use case

#### 8. Agent Skills Discovery Index
- **What it is:** Index of AI agent skills/tools the site provides
- **Why skipped:** Only relevant for sites exposing programmatic actions to AI
- **Decision:** E-commerce storefront doesn't need this

#### 9. WebMCP
- **What it is:** Browser API to expose site actions to AI agents
- **Why skipped:** Experimental Chrome-only feature, not production-stable
- **Decision:** Too early, not cross-browser compatible, not business-critical

---

### Security Headers (Already Implemented ✓)

The audit also mentioned three security headers, which were **ALREADY implemented** before the May 2026 audit:

| Header | Status | Value | Location |
|--------|--------|-------|----------|
| **X-Frame-Options** | ✅ Implemented | `SAMEORIGIN` | `next.config.ts` line 38 |
| **X-Content-Type-Options** | ✅ Implemented | `nosniff` | `next.config.ts` line 42 |
| **Referrer-Policy** | ✅ Implemented | `strict-origin-when-cross-origin` | `next.config.ts` line 46 |
| **Content-Security-Policy** | ✅ Implemented | Comprehensive CSP | `next.config.ts` lines 50-64 |

**Note:** See `docs/standards/security.md` for complete security header documentation.

---

### Audit Summary

**Total Features Recommended:** 9  
**Implemented:** 3 (Content Signals, Link headers, Markdown detection)  
**Already Had:** 4 (Security headers)  
**Strategically Skipped:** 6 (Not applicable for e-commerce)

**Performance Impact:** Zero - All implementations are headers/detection only  
**Breaking Changes:** None  
**SEO Benefit:** Improved AI agent discovery and content usage control

---

### Future Enhancements (Agent-Ready)

- [ ] **Markdown Conversion (Per-Route):** Enable HTML→markdown conversion for `/journal/` posts when AI agents request it
- [ ] **Structured Data Enhancement:** Add more detailed JSON-LD schema for products, blog posts, organization
- [ ] **Agent-Friendly Sitemaps:** Add priority/frequency hints for AI crawlers

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
**Last Audit:** May 22, 2026 (Agent-Ready Features)
