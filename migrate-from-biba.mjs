// Migration: BibaeStore → HabibaMinhas
// Imports products & categories from the BibaeStore Supabase project

import { readFileSync } from "fs";

const DEST_URL = "https://ftrwdknlckzcwbibdicu.supabase.co";
const DEST_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cndka25sY2t6Y3diaWJkaWN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM0OTkwMSwiZXhwIjoyMDkxOTI1OTAxfQ.8k2UZ316SVphnU905dLmLLP402lkfZDlIqHQj3XYvzE";

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${DEST_KEY}`,
  "apikey": DEST_KEY,
  "Prefer": "resolution=merge-duplicates,return=representation",
};

// ─── Load source data ─────────────────────────────────────────────────────────
const bibaProducts   = JSON.parse(readFileSync("D:/web/habibaminhas/biba_products.json",   "utf8"));
const bibaCategories = JSON.parse(readFileSync("D:/web/habibaminhas/biba_categories.json", "utf8"));

console.log(`\n📦 Source: ${bibaProducts.length} products, ${bibaCategories.length} categories from BibaeStore`);

// ─── Build category lookup: id → slug ────────────────────────────────────────
const catById = {};
for (const c of bibaCategories) catById[c.id] = c;

// Map BibaeStore slugs → HabibaMinhas category text
function mapCategory(categoryId) {
  const cat = catById[categoryId];
  if (!cat) return "accessories";
  const slug = cat.slug?.toLowerCase() ?? "";
  const parentSlug = cat.parent_id ? (catById[cat.parent_id]?.slug?.toLowerCase() ?? "") : "";

  if (slug === "ladies" || parentSlug === "ladies" || slug === "stitched" || slug === "unstitched") return "ladies-suits";
  if (slug === "girls"  || parentSlug === "kids"    || slug === "kids")    return "kids-formal";
  if (slug === "baby-products" || parentSlug === "baby-products" ||
      ["baby-cot-sets","baby-nest","baby-swaddle","baby-pillow","baby-bag"].includes(slug)) return "baby-products";
  if (slug === "accessories" || parentSlug === "accessories") return "accessories";
  return "ladies-suits"; // fallback
}

function mapSubcategory(categoryId) {
  const cat = catById[categoryId];
  if (!cat) return null;
  const slug = cat.slug?.toLowerCase() ?? "";
  const map = {
    "stitched":       "suits",
    "unstitched":     "suits",
    "girls":          "girls",
    "boys":           "boys",
    "baby-cot-sets":  "bedding",
    "baby-nest":      "nests",
    "baby-swaddle":   "swaddles",
    "baby-pillow":    "nests",
    "baby-bag":       "carrier",
  };
  return map[slug] ?? null;
}

// ─── Step 1: Import Categories ────────────────────────────────────────────────
console.log("\n🗂  Importing categories...");

// Only import active categories that map to our schema
const activeCats = bibaCategories.filter(c => c.status === "active");
let catImported = 0, catSkipped = 0;

for (const c of activeCats) {
  const isMain = !c.parent_id;
  const parentCat = c.parent_id ? catById[c.parent_id] : null;

  // Find parent UUID in destination if needed
  let destParentId = null;
  if (parentCat) {
    const res = await fetch(`${DEST_URL}/rest/v1/categories?slug=eq.${encodeURIComponent(parentCat.slug)}&select=id`, { headers });
    const rows = await res.json();
    if (rows.length > 0) destParentId = rows[0].id;
  }

  const payload = {
    name:       c.name,
    slug:       c.slug + (isMain ? "" : "-biba"), // avoid slug collisions with existing
    image:      c.image_url ?? null,
    type:       isMain ? "main" : "sub",
    parent_id:  destParentId,
    status:     c.status === "active" ? "active" : "inactive",
    sort_order: c.sort_order ?? 0,
    seo_title:  c.meta_title ?? null,
    seo_desc:   c.meta_description ?? null,
    color:      null,
  };

  const res = await fetch(`${DEST_URL}/rest/v1/categories`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (res.ok) { catImported++; }
  else {
    const err = await res.json();
    if (err.code === "23505") { catSkipped++; } // duplicate
    else console.warn(`  ⚠ Category "${c.name}": ${err.message}`);
  }
}
console.log(`  ✅ ${catImported} imported, ${catSkipped} already existed`);

// ─── Step 2: Import Products ──────────────────────────────────────────────────
console.log("\n📦 Importing products...");

let prodImported = 0, prodSkipped = 0, prodFailed = 0;

for (const p of bibaProducts) {
  // Build a unique slug — use sku or sanitize name
  const baseSlug = (p.slug || p.sku || p.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);

  const slug = `biba-${baseSlug}`;

  const payload = {
    slug,
    title:            p.name,
    short_description: p.short_description || null,
    description:      p.description || null,
    price:            Math.round(p.price ?? 0),
    compare_at:       p.sale_price ? Math.round(p.price) : null,
    // If sale_price exists, that becomes the actual price
    ...(p.sale_price ? { price: Math.round(p.sale_price), compare_at: Math.round(p.price) } : {}),
    category:         mapCategory(p.category_id),
    subcategory:      mapSubcategory(p.category_id),
    subtype:          null,
    sku:              p.sku ? `BIBA-${p.sku}` : null,
    status:           p.status === "active" ? "active" : "draft",
    featured:         p.is_featured ?? false,
    stock:            p.stock ?? 0,
    images:           Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
    palette:          ["#f2e0d8", "#c97a86", "#5a2030"],
    size_guide:       !!p.size_guide,
    seo_title:        p.meta_title || null,
    seo_description:  p.meta_description || null,
    seo_keywords:     p.keywords || null,
  };

  const res = await fetch(`${DEST_URL}/rest/v1/products`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    prodImported++;
  } else {
    const err = await res.json();
    if (err.code === "23505") { prodSkipped++; }
    else { prodFailed++; console.warn(`  ⚠ "${p.name}": ${err.message}`); }
  }
}

console.log(`  ✅ ${prodImported} imported, ${prodSkipped} already existed, ${prodFailed} failed`);

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log("\n🎉 Migration complete!");
console.log(`   Categories: ${catImported} new`);
console.log(`   Products:   ${prodImported} new`);
console.log(`   Check your admin panel: http://localhost:3000/admin/products\n`);
