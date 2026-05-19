# Website Audit Report - Habiba Minhas
**Date:** May 19, 2026  
**Domain:** https://habibaminhas.com  
**Auditor:** Claude Code

---

## Executive Summary

Your website has **50 pages** total, but Google Search Console is showing errors because:

### 🚨 CRITICAL ISSUES (Must Fix Immediately)

1. **Missing sitemap.xml** - Google has no map of your site
2. **Missing robots.txt** - Crawlers don't know how to access your site
3. **Potential URL inconsistencies** due to `trailingSlash: true` configuration

---

## 1. MISSING: Sitemap Configuration

### Problem
**NO sitemap.xml exists** - This is why Google Search Console is showing errors!

Next.js can generate sitemaps automatically, but you haven't created one yet.

### What Google Needs
A sitemap at: `https://habibaminhas.com/sitemap.xml`

### Pages That Should Be In Sitemap

**Static Pages (35 total):**
- `/` (Homepage)
- `/about/`
- `/contact/`
- `/track/`
- `/new/`
- `/offers/`
- `/ladies/`
- `/kids/`
- `/baby/`
- `/accessories/`
- `/journal/`
- `/search/`
- `/wishlist/`
- `/cart/`
- `/checkout/shipping/`
- `/checkout/payment/`
- `/account/` (+ subpages: login, signup, orders, addresses, payments, settings)
- `/admin/` (+ subpages: should be EXCLUDED from sitemap)

**Dynamic Pages (Need database queries):**
- `/product/[slug]/` - All active products
- `/journal/[slug]/` - All journal posts (5 posts found)
- `/help/[slug]/` - All help pages (4 pages: faq, returns, shipping, payments)
- `/legal/[slug]/` - All legal pages (2 pages: privacy, terms)
- `/content/[slug]/` - All content pages (3 pages: fabric-glossary, size-guide, denim-fit-guide)
- `/ladies/[...slug]/` - Category pages (catch-all)
- `/kids/[...slug]/` - Category pages (catch-all)
- `/baby/[...slug]/` - Category pages (catch-all)
- `/accessories/[...slug]/` - Category pages (catch-all)

---

## 2. MISSING: robots.txt

### Problem
**NO robots.txt file exists** - Crawlers don't know what they can/cannot access!

### What's Needed
A `robots.txt` file at: `https://habibaminhas.com/robots.txt`

### What Should Be In It
```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /account/
Disallow: /cart/
Disallow: /checkout/
Disallow: /wishlist/
Disallow: /order/

Sitemap: https://habibaminhas.com/sitemap.xml
```

**Why these disallows:**
- `/admin/` - Admin panel (should never be indexed)
- `/api/` - API routes (not pages)
- `/account/` - User-specific pages (shouldn't be public)
- `/cart/` - Shopping cart (session-based)
- `/checkout/` - Checkout flow (private)
- `/wishlist/` - User-specific
- `/order/` - Order tracking (private/sensitive)

---

## 3. URL Structure Analysis

### Current Configuration
```typescript
// next.config.ts
trailingSlash: true
```

This means **ALL URLs must end with a slash** (`/`). 

### Potential 404 Issues

If Google is crawling URLs **without** trailing slashes, they'll get 404 errors:

**Examples:**
- ❌ `https://habibaminhas.com/about` (404)
- ✅ `https://habibaminhas.com/about/` (200)

- ❌ `https://habibaminhas.com/ladies` (404)
- ✅ `https://habibaminhas.com/ladies/` (200)

### Why This Happens
- Old links from social media, Google cache, or other sites
- Internal links that forgot the trailing slash
- Redirect chains that aren't handling trailing slashes

---

## 4. Redirect Configuration Analysis

### Current Redirects (from next.config.ts)

**Permanent Redirects (301):**
```
/women → /ladies/
/women/:slug* → /ladies/
/men → /ladies/
/men/:slug* → /ladies/
/fragrances → /accessories/
/fragrances/:slug* → /accessories/
```

**Temporary Redirects (302):**
```
/stores → /contact/
/edit → /new/
/ladies/suits → /ladies/
/kids/girls → /kids/
/baby/bedding → /baby/
/baby/nests → /baby/
/accessories/hair → /accessories/
/shop → /ladies/
```

### ⚠️ Issues Found

1. **Old URLs may be causing 404s**
   - If external sites link to `/women`, `/men`, or `/fragrances`, those redirect properly
   - But if they link WITHOUT trailing slash, might fail

2. **Footer Links Issue**
   - Footer has: `/ladies/suits`, `/kids/girls`, `/baby/bedding`, etc.
   - These redirect to parent pages
   - Better to link directly to `/ladies/`, `/kids/`, `/baby/` in the footer

---

## 5. Dynamic Route Analysis

### Pages Using `generateStaticParams()`

These pages generate static URLs at build time:

1. **`/product/[slug]/`** 
   - Queries database for all active products
   - ⚠️ If products are added after build, they won't exist until rebuild

2. **`/journal/[slug]/`**
   - 5 hardcoded posts: dupatta-five-ways, linen-notes, layering-oud, summer-wardrobe-edit, behind-the-sukoon

3. **`/help/[slug]/`**
   - 4 hardcoded pages: faq, returns, shipping, payments

4. **`/legal/[slug]/`**
   - 2 hardcoded pages: privacy, terms

5. **`/content/[slug]/`**
   - 3 hardcoded pages: fabric-glossary, size-guide, denim-fit-guide

### ⚠️ Potential 404 Sources

**Products:**
- If someone links to a product that was:
  - Deleted from database
  - Changed slug
  - Set to inactive status
  - Added after build (and site hasn't been rebuilt)

**Solution:** Implement ISR (Incremental Static Regeneration) or use dynamic rendering

---

## 6. All Internal Links Found

Based on code analysis, here are all internal links in your components:

```
/
/about
/account
/account/addresses
/account/forgot-password
/account/login
/account/orders
/account/settings
/account/signup
/admin/customers
/admin/notifications
/admin/orders
/admin/products
/admin/settings
/cart
/checkout/shipping
/checkout/payment
/contact
/content/size-guide
/help/faq
/help/returns
/help/shipping
/help/payments
/journal
/ladies
/kids
/baby
/accessories
/new
/legal/privacy
/legal/terms
/track
/wishlist
/search
/offers
```

**✅ All these routes exist!** No broken internal links found.

---

## 7. External Resources Referenced

### Payment Logos
```
/logos/payments/visa.webp
/logos/payments/mastercard.webp
/logos/payments/jazzcash.webp
/logos/payments/easypaisa.webp
/logos/payments/cod.webp
```

### Images
Multiple references to:
- `/HeroSection/*.webp`
- `/trending/*.webp`
- `/editorial/*.webp`
- `/categories/*.webp`
- `/products/*.webp`
- `/profiles/*.webp`

---

## 8. Why Google Search Console Shows Errors

### Most Likely Causes:

1. **No Sitemap Submitted**
   - Google can't find your pages
   - Crawler relies on discovering links
   - Without sitemap, discovery is slow/incomplete

2. **No robots.txt**
   - Google doesn't know crawl rules
   - Might be trying to crawl `/api/`, `/admin/`, etc.
   - Gets 404s on non-existent admin pages

3. **Trailing Slash Inconsistency**
   - External links might link without `/`
   - If Google cached old URLs
   - Manual URL typing without `/`

4. **Old URLs in Google Index**
   - Previous versions of site had different URLs
   - Google still has those in index
   - They're now 404ing

5. **Product URLs Changed**
   - If product slugs changed
   - Old Google cache still has old slugs
   - Those old product URLs now 404

---

## 9. Recommendations (Priority Order)

### Priority 1: CRITICAL (Do Immediately)

1. **Create sitemap.ts**
   - Create `app/sitemap.ts`
   - Include all static and dynamic pages
   - Submit to Google Search Console

2. **Create robots.txt**
   - Create `app/robots.txt`
   - Specify allowed/disallowed paths
   - Link to sitemap

3. **Submit Sitemap to Google Search Console**
   - Go to Search Console
   - Submit `https://habibaminhas.com/sitemap.xml`
   - Request re-crawl

### Priority 2: HIGH (Do This Week)

4. **Fix Trailing Slash Issues**
   - Add middleware to redirect non-trailing-slash to trailing-slash
   - Or set `trailingSlash: false` and update all links

5. **Update Footer Links**
   - Change `/ladies/suits` → `/ladies/`
   - Remove redundant subcategory links

6. **Implement 301 Redirects for Old Product URLs**
   - If products changed slugs, add redirects
   - Log 404s to find missing pages

### Priority 3: MEDIUM (Do This Month)

7. **Enable ISR for Products**
   - Add `revalidate` to product pages
   - Or use `dynamic = 'force-dynamic'`

8. **Add Canonical URLs**
   - Already done in most pages ✅
   - Verify all pages have them

9. **Monitor 404s**
   - Set up logging for 404 errors
   - Identify patterns
   - Create redirects for common 404s

### Priority 4: LOW (Nice to Have)

10. **Add structured data (JSON-LD)**
    - Product schema for product pages
    - Organization schema for homepage
    - Breadcrumb schema

11. **Add alternate language tags** (if supporting multiple languages)

---

## 10. Files That Need to Be Created

### File 1: `app/sitemap.ts`
**Purpose:** Generate dynamic sitemap for Google

### File 2: `app/robots.txt` or `public/robots.txt`
**Purpose:** Tell crawlers what to access

### File 3: (Optional) `middleware.ts`
**Purpose:** Handle trailing slash redirects

---

## 11. Current Metadata Status

### ✅ Good Configurations Found:

- `metadataBase` set correctly: `https://habibaminhas.com`
- robots meta configured (index: true, follow: true)
- Open Graph tags present
- Twitter card configured
- Bing verification tag present
- Most pages have canonical URLs

---

## Summary of Issues

| Issue | Severity | Impact | Status |
|-------|----------|--------|--------|
| No sitemap.xml | 🔴 CRITICAL | Google can't discover pages | ❌ NOT IMPLEMENTED |
| No robots.txt | 🔴 CRITICAL | Crawlers confused | ❌ NOT IMPLEMENTED |
| Trailing slash inconsistency | 🟠 HIGH | 404 errors | ⚠️ NEEDS MIDDLEWARE |
| Old product URLs | 🟡 MEDIUM | Some 404s | ⚠️ NEEDS MONITORING |
| Footer subcategory links | 🟢 LOW | Unnecessary redirects | ⚠️ COSMETIC |

---

## Next Steps

**I'm ready to fix all these issues for you. Would you like me to:**

1. ✅ Create `app/sitemap.ts` with all your pages
2. ✅ Create `app/robots.txt` with proper rules
3. ✅ Add middleware for trailing slash handling
4. ✅ Update footer links to remove unnecessary redirects
5. ✅ Add 404 page with helpful navigation

**Once these are implemented, your Google Search Console errors should resolve within 1-2 weeks as Google re-crawls your site.**

---

**End of Audit Report**
