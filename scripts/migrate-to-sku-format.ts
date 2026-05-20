/**
 * Script: Migrate all slugs to SKU-based format
 * New format: {CATEGORY_CODE}-SKU-{SKU_VALUE}
 * Example: LD-SKU-A001, KD-SKU-BPC-GF-SS25-021
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type Product = {
  id: string;
  title: string;
  slug: string;
  category: string;
  sku: string | null;
};

const CATEGORY_CODES: Record<string, string> = {
  "ladies-suits": "LD",
  "kids-formal": "KD",
  "baby-products": "BB",
  "accessories": "AC",
};

function generateSkuSlug(category: string, sku: string | null, id: string): string {
  const categoryCode = CATEGORY_CODES[category] || category.substring(0, 2).toUpperCase();

  if (sku && sku.trim()) {
    // Clean and uppercase the SKU, remove BIBA- prefix if present
    let cleanSku = sku.trim().toUpperCase().replace(/\s+/g, "-");
    cleanSku = cleanSku.replace(/^BIBA-/, ""); // Remove BIBA- prefix
    return `${categoryCode}-SKU-${cleanSku}`;
  } else {
    // Use last 6 chars of ID as fallback
    const idSuffix = id.substring(id.length - 6).toUpperCase();
    return `${categoryCode}-SKU-${idSuffix}`;
  }
}

async function migrateToSkuFormat() {
  console.log("🚀 Migrating to SKU-based slug format\n");

  // Fetch all products
  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, slug, category, sku")
    .order("created_at", { ascending: true });

  if (error || !products) {
    console.error("❌ Error fetching products:", error);
    process.exit(1);
  }

  console.log(`✅ Found ${products.length} products\n`);

  // Generate new slugs
  const updates: { id: string; oldSlug: string; newSlug: string; category: string; title: string }[] = [];
  let skipped = 0;
  let noSkuCount = 0;

  for (const product of products) {
    const newSlug = generateSkuSlug(product.category, product.sku, product.id);

    if (!product.sku) {
      noSkuCount++;
    }

    if (product.slug === newSlug.toLowerCase()) {
      skipped++;
      continue;
    }

    updates.push({
      id: product.id,
      oldSlug: product.slug,
      newSlug: newSlug.toLowerCase(), // Store in lowercase for URL consistency
      category: product.category,
      title: product.title,
    });

    console.log(`  ${product.title}`);
    console.log(`    SKU: ${product.sku || "(none - using ID)"}`);
    console.log(`    OLD: ${product.slug}`);
    console.log(`    NEW: ${newSlug.toLowerCase()}`);
    console.log("");
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Total products: ${products.length}`);
  console.log(`  Products with SKU: ${products.length - noSkuCount}`);
  console.log(`  Products without SKU: ${noSkuCount}`);
  console.log(`  Need update: ${updates.length}`);
  console.log(`  Already correct: ${skipped}\n`);

  if (updates.length === 0) {
    console.log("✅ All slugs are already in SKU format!");
    return;
  }

  // Create backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `slugs-before-sku-format-${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));
  console.log(`💾 Backup saved: ${backupFile}\n`);

  // Generate new redirects
  const newRedirects = updates.map((u) => ({
    source: `/product/${u.category}/${u.oldSlug}/`,
    destination: `/product/${u.category}/${u.newSlug}/`,
    permanent: true,
  }));

  const redirectFile = path.join(backupDir, `sku-format-redirects-${timestamp}.json`);
  fs.writeFileSync(redirectFile, JSON.stringify(newRedirects, null, 2));
  console.log(`💾 New redirects saved: ${redirectFile}\n`);

  // Update database
  console.log("🚀 UPDATING DATABASE\n");

  let successCount = 0;
  let errorCount = 0;

  for (const update of updates) {
    const { error } = await supabase
      .from("products")
      .update({ slug: update.newSlug })
      .eq("id", update.id);

    if (error) {
      console.error(`  ❌ Error updating ${update.id}:`, error.message);
      errorCount++;
    } else {
      console.log(`  ✅ Updated: ${update.oldSlug} → ${update.newSlug}`);
      successCount++;
    }
  }

  console.log("\n✅ Migration Complete!");
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors: ${errorCount}\n`);

  // Output redirect code
  console.log("📋 Add these redirects to lib/product-redirects.ts:\n");
  console.log("export const skuFormatRedirects = [");
  newRedirects.slice(0, 5).forEach((r, i) => {
    console.log(`  { source: "${r.source}", destination: "${r.destination}", permanent: true },`);
  });
  if (newRedirects.length > 5) {
    console.log(`  // ... ${newRedirects.length - 5} more redirects`);
  }
  console.log("];\n");
}

migrateToSkuFormat().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
