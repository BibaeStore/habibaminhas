# 🧪 LOCAL TESTING CHECKLIST — Phase 5 Verification

**Purpose**: Verify all Phase 5 changes work correctly before relying on production  
**Time Required**: 15-20 minutes  
**Date**: 2026-06-08

---

## 🚀 STEP 1: START LOCAL DEVELOPMENT SERVER

### **Command**:
```bash
npm run dev
```

### **Expected Output**:
```
▲ Next.js 16.2.4 (Turbopack)
- Local:        http://localhost:3000
- Environment: .env.local
✓ Ready in 1.2s
```

### **Verification**:
- ✅ Server starts without errors
- ✅ No TypeScript compilation errors
- ✅ Port 3000 opens successfully

**If errors**: Check the error message and fix before proceeding

---

## 📋 STEP 2: TEST SUBCATEGORY PAGES (Phase 5A)

### **Pages to Test** (8 total):

**Ladies Subcategories**:
1. http://localhost:3000/ladies/3-piece-suits/
2. http://localhost:3000/ladies/formal-wear/
3. http://localhost:3000/ladies/party-wear/
4. http://localhost:3000/ladies/stitched-suits/

**Kids Subcategories**:
5. http://localhost:3000/kids/3-4-years/
6. http://localhost:3000/kids/5-6-years/
7. http://localhost:3000/kids/7-8-years/
8. http://localhost:3000/kids/girls-formal/

---

### **What to Check on Each Page**:

#### ✅ **Visual Check**:
- [ ] Page loads without errors
- [ ] Hero image displays
- [ ] Category title shows correctly
- [ ] Description content appears (should be 300+ words, not just 1 sentence)
- [ ] Product grid displays below content
- [ ] Layout looks correct (no broken CSS)

#### ✅ **Content Check** (Scroll down and read):
- [ ] **Long description visible** (not just "Shop X from Habiba Minhas")
- [ ] Multiple paragraphs of content
- [ ] Mentions "Karachi", "handcrafted", "artisan" (E-E-A-T signals)
- [ ] Describes occasions (weddings, Eid, etc.)
- [ ] Includes care instructions or sizing info

#### ✅ **Expected Content Length**:
**BEFORE** (if database failed): 1 sentence (~60 words)  
**AFTER** (if database worked): Multiple paragraphs (~300+ words)

**Example - What you should see**:
```
"Our 3-piece suit collection represents the essence of traditional 
Pakistani formal wear — a complete ensemble consisting of a beautifully 
embroidered kameez (shirt), matching shalwar (trousers), and a flowing 
dupatta. Each suit is handcrafted in our Karachi studio, featuring 
premium silk fabrics, artisan embroidery, and gold brocade details..."

[... continues for 300+ words]
```

#### ✅ **Meta Tags Check** (Right-click → View Page Source):
- [ ] `<title>` contains full SEO title (e.g., "3-Piece Silk Suits Pakistan | Ladies Formal Wear | Habiba Minhas")
- [ ] `<meta name="description">` has 160-char description
- [ ] No "Shop X from Habiba Minhas" as the only description

---

## 📖 STEP 3: TEST CONTENT GUIDE PAGES (Phase 5B)

### **Pages to Test** (3 total):

1. http://localhost:3000/content/fabric-glossary/
2. http://localhost:3000/content/size-guide/
3. http://localhost:3000/content/denim-fit-guide/

---

### **What to Check**:

#### ✅ **Fabric Glossary**:
- [ ] Page loads correctly
- [ ] Title: "Pakistani Fabric Guide — Complete Glossary"
- [ ] **10 fabrics listed** (not just 5):
  1. Lawn
  2. Cambric
  3. Silk Georgette
  4. Silk (Charmeuse)
  5. Jacquard
  6. Khaddar
  7. Chiffon
  8. Voile
  9. Karandi
  10. Velvet
- [ ] Each fabric has detailed description (not just 2 sentences)
- [ ] GSM weights mentioned (e.g., "110-130 GSM")
- [ ] Care instructions included
- [ ] Mentions mills (Faisalabad, Lahore, Karachi)

#### ✅ **Size Guide**:
- [ ] Page loads correctly
- [ ] Title: "Pakistani Clothing Size Guide — Find Your Perfect Fit"
- [ ] **6 sections** (not just 3):
  1. Ladies Ready-to-Wear Suits
  2. How to Measure Yourself
  3. Kids Sizing by Age and Height
  4. Fit Troubleshooting
  5. Size Conversion Chart
  6. Alterations and Custom Sizing
- [ ] Includes bust/waist/hip measurements
- [ ] Has "XS, S, M, L, XL" size breakdown
- [ ] Step-by-step measurement instructions

#### ✅ **Denim Fit Guide**:
- [ ] Page loads correctly
- [ ] Title: "Denim Fit Guide — Find Your Perfect Jeans Without a Fitting Room"
- [ ] **6 sections** (not just 4):
  1. Straight Fit
  2. Slim Straight Fit
  3. Wide Leg Fit
  4. Relaxed Fit
  5. How to Choose Your Fit
  6. Sizing and Hem Length
- [ ] Includes leg opening measurements (e.g., "36-38cm")
- [ ] Body type recommendations present
- [ ] Footwear pairing suggestions

#### ✅ **Meta Tags** (View Page Source):
- [ ] Fabric Glossary: `<title>` = "Pakistani Fabric Guide | Complete Glossary | Habiba Minhas"
- [ ] Size Guide: `<title>` = "Pakistani Clothing Size Guide | Find Your Perfect Fit | Habiba Minhas"
- [ ] Denim Guide: `<title>` = "Denim Fit Guide | Find Your Perfect Jeans | Habiba Minhas"

---

## 🔍 STEP 4: TEST HELP PAGES WITH FAQ SCHEMA (Phase 5C)

### **Pages to Test** (4 total):

1. http://localhost:3000/help/faq/
2. http://localhost:3000/help/returns/
3. http://localhost:3000/help/shipping/
4. http://localhost:3000/help/payments/

---

### **What to Check**:

#### ✅ **Visual Check**:
- [ ] Page loads without errors
- [ ] FAQ accordion displays
- [ ] Clicking FAQ expands answer
- [ ] Plus icon rotates when expanded

#### ✅ **Schema Check** (View Page Source):
Search for `<script type="application/ld+json">` — you should find:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "When will my order ship?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In-stock orders leave the studio within 24 hours..."
      }
    }
    // ... more questions
  ]
}
```

#### ✅ **Schema Verification**:
- [ ] FAQ schema appears in page source
- [ ] "@type": "FAQPage" present
- [ ] "mainEntity" array has multiple questions
- [ ] Each question has "name" and "acceptedAnswer"
- [ ] Answer text is complete (not truncated)

#### ✅ **FAQ Count**:
- [ ] FAQ page: 5 questions
- [ ] Returns page: 6 questions
- [ ] Shipping page: 4 questions
- [ ] Payments page: 4 questions

---

## 🧪 STEP 5: VALIDATE SCHEMA MARKUP

### **Method 1: Google Rich Results Test**

1. Open any help page locally
2. Right-click → View Page Source
3. Copy the entire HTML
4. Go to: https://search.google.com/test/rich-results
5. Click "CODE" tab
6. Paste HTML
7. Click "Test Code"

**Expected Result**:
- ✅ "FAQPage" detected
- ✅ Green checkmarks
- ✅ No errors

---

### **Method 2: Schema.org Validator**

1. View page source
2. Copy ONLY the JSON-LD script (the `<script type="application/ld+json">` content)
3. Go to: https://validator.schema.org/
4. Paste JSON
5. Click "Validate"

**Expected Result**:
- ✅ "Schema validated successfully"
- ✅ No warnings or errors

---

## 🗄️ STEP 6: VERIFY DATABASE CONNECTION

### **Check Subcategory Content is Loading from Database**:

Open browser DevTools (F12) → Network tab → Reload page

**What to Check**:
- [ ] No database connection errors in console
- [ ] Content loads successfully
- [ ] No "undefined" or "null" appearing in descriptions

### **Alternative: Check Supabase Directly**

Open Supabase Dashboard:
1. Go to Table Editor → categories
2. Find row with slug = "3-piece-suits"
3. Check `description` column has content
4. Should see ~300 words of text starting with "Our 3-piece suit collection..."

**If description column is empty**: Database update failed, need to re-run SQL

---

## 🔥 STEP 7: CHECK FOR CONSOLE ERRORS

### **Open Browser Console** (F12 → Console tab):

**Visit each test page and check for**:
- [ ] **No red errors**
- [ ] **No TypeScript errors**
- [ ] **No 404s** for images/resources
- [ ] **No hydration errors**

**Acceptable warnings** (ignore these):
- ⚠️ "Fast Refresh" warnings
- ⚠️ Image optimization warnings in dev

**Unacceptable errors** (fix these):
- ❌ "TypeError: Cannot read property..."
- ❌ "ReferenceError: X is not defined"
- ❌ "Failed to fetch"
- ❌ Hydration mismatches

---

## 📱 STEP 8: MOBILE RESPONSIVENESS CHECK

### **Test on Mobile View**:

1. Open DevTools (F12)
2. Click device toggle icon (Ctrl+Shift+M)
3. Select "iPhone 14 Pro" or similar
4. Visit test pages

**What to Check**:
- [ ] Content is readable (not too small)
- [ ] No horizontal scrolling
- [ ] Images scale properly
- [ ] FAQs expand/collapse correctly on mobile
- [ ] Product grids stack vertically

---

## ⚡ STEP 9: PAGE LOAD SPEED CHECK

### **Check Load Times**:

1. Open DevTools → Network tab
2. Reload page (Ctrl+R)
3. Check bottom status bar

**Expected Local Performance**:
- [ ] Page loads in under 2 seconds
- [ ] No requests take more than 5 seconds
- [ ] Images load progressively

**If slow**:
- Check internet connection (for images from CDN)
- Restart dev server
- Clear browser cache

---

## 🎯 STEP 10: SPOT-CHECK PRODUCT PAGES

### **Test 2-3 Product Pages**:

**Examples**:
- http://localhost:3000/product/ladies-suits/ld-sku-blk-slk-001-m/
- http://localhost:3000/product/kids-formal/kd-sku-sbg-cs-fs25-047/

**What to Check**:
- [ ] "Styling & Care Guides" section appears (Phase 4)
- [ ] Links to blog posts present
- [ ] Product schema in page source
- [ ] FAQs display correctly

---

## 📊 SUMMARY CHECKLIST

### **Critical Items** (Must Pass):

- [ ] **All 8 subcategory pages load** with 300+ word descriptions
- [ ] **All 3 content guide pages** have expanded content (600-700 words)
- [ ] **All 4 help pages** have FAQ schema in page source
- [ ] **No console errors** on any page
- [ ] **Database connection works** (content loads from Supabase)
- [ ] **Schema validates** on Google Rich Results Test

### **Nice to Have** (Should Pass):

- [ ] Mobile responsive on all pages
- [ ] Meta tags correct on all pages
- [ ] Images load properly
- [ ] Page load times reasonable
- [ ] No TypeScript warnings

---

## 🚨 COMMON ISSUES & FIXES

### **Issue 1: Subcategory Pages Still Show Short Content**

**Symptoms**: Only seeing "Shop X from Habiba Minhas"

**Cause**: Database description not loading or empty

**Fix**:
1. Check Supabase connection (verify .env.local has correct credentials)
2. Verify database has description content (check Supabase Table Editor)
3. Re-run database updates if needed

---

### **Issue 2: Content Pages Don't Show Expanded Content**

**Symptoms**: Still seeing old short content

**Cause**: Code not updated properly

**Fix**:
1. Stop dev server (Ctrl+C)
2. Run `git pull` to ensure latest code
3. Run `npm install` (in case dependencies changed)
4. Restart server: `npm run dev`

---

### **Issue 3: FAQ Schema Not Appearing**

**Symptoms**: No `<script type="application/ld+json">` in page source

**Cause**: Component not imported or data not mapping

**Fix**:
1. Check browser cache isn't showing old version (Hard refresh: Ctrl+Shift+R)
2. Verify `FAQSchema` import in `app/help/[slug]/page.tsx`
3. Check console for errors

---

### **Issue 4: Database Connection Errors**

**Symptoms**: "Failed to fetch", "ECONNREFUSED" errors

**Cause**: Supabase credentials missing or incorrect

**Fix**:
1. Check `.env.local` file exists
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Test connection in Supabase dashboard

---

### **Issue 5: Build Errors**

**Symptoms**: `npm run dev` fails to start

**Fix**:
1. Stop server
2. Delete `.next` folder: `rm -rf .next` (Mac/Linux) or `rmdir /s .next` (Windows)
3. Run `npm run dev` again
4. If still fails, check error message for specific issue

---

## ✅ FINAL VERIFICATION

### **If ALL Critical Items Pass**:

🎉 **SUCCESS!** Everything is working correctly:
- All Phase 5 changes are implemented properly
- Database connection is working
- Schema markup is valid
- No critical errors

**Next Step**: You can confidently rely on the production deployment.

---

### **If Any Critical Item Fails**:

⚠️ **NEEDS ATTENTION**:
1. Note which specific item failed
2. Check the "Common Issues & Fixes" section above
3. Fix the issue
4. Re-test
5. If stuck, share the specific error message

---

## 📝 TESTING LOG TEMPLATE

Use this to track your testing:

```
DATE: _____________
TESTER: ___________

SUBCATEGORY PAGES (8):
[ ] ladies/3-piece-suits — PASS / FAIL (notes: __________)
[ ] ladies/formal-wear — PASS / FAIL
[ ] ladies/party-wear — PASS / FAIL
[ ] ladies/stitched-suits — PASS / FAIL
[ ] kids/3-4-years — PASS / FAIL
[ ] kids/5-6-years — PASS / FAIL
[ ] kids/7-8-years — PASS / FAIL
[ ] kids/girls-formal — PASS / FAIL

CONTENT PAGES (3):
[ ] fabric-glossary — PASS / FAIL (notes: __________)
[ ] size-guide — PASS / FAIL
[ ] denim-fit-guide — PASS / FAIL

HELP PAGES (4):
[ ] help/faq — Schema present? YES / NO
[ ] help/returns — Schema present? YES / NO
[ ] help/shipping — Schema present? YES / NO
[ ] help/payments — Schema present? YES / NO

TECHNICAL:
[ ] No console errors — PASS / FAIL
[ ] Database connected — PASS / FAIL
[ ] Schema validates — PASS / FAIL
[ ] Mobile responsive — PASS / FAIL

OVERALL: PASS / FAIL

NOTES:
_______________________________________
_______________________________________
```

---

## 🎯 TIME ESTIMATE

**Quick Test** (5 min):
- Check 2 subcategory pages
- Check 1 content page
- Check 1 help page schema
- Verify no console errors

**Thorough Test** (20 min):
- All 8 subcategory pages
- All 3 content pages
- All 4 help pages + schema validation
- Console checks
- Mobile responsive
- Performance check

**Choose based on your confidence level and time available.**

---

**Good luck with testing!** 🚀

Let me know which items pass or fail, and I can help troubleshoot any issues.
