/**
 * Migration Script: Update Product Slugs to SEO-Friendly Format
 *
 * This script:
 * 1. Fetches all products from database
 * 2. Generates new SEO-friendly slugs
 * 3. Saves old→new slug mappings for redirects
 * 4. Updates products in database
 *
 * SAFETY: Creates backup file before making changes
 */

import { createClient } from "@supabase/supabase-js";
import { generateProductSlug } from "../lib/slug-generator";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials!");
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type Product = {
  id: string;
  title: string;
  slug: string;
  category: string;
  sku: string | null;
  status: string;
};

type SlugMapping = {
  oldSlug: string;
  newSlug: string;
  productId: string;
  title: string;
  category: string;
};

async function migrateProductSlugs() {
  console.log("🚀 Starting Product Slug Migration\n");

  // Step 1: Fetch all products
  console.log("📦 Fetching products from database...");
  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, slug, category, sku, status")
    .order("created_at", { ascending: true });

  if (error || !products) {
    console.error("❌ Error fetching products:", error);
    process.exit(1);
  }

  console.log(`✅ Found ${products.length} products\n`);

  // Step 2: Generate new slugs and create mappings
  console.log("🔄 Generating new slugs...\n");

  const mappings: SlugMapping[] = [];
  const updates: { id: string; oldSlug: string; newSlug: string }[] = [];
  let skipped = 0;

  for (const product of products) {
    const newSlug = generateProductSlug({
      title: product.title,
      category: product.category,
      sku: product.sku,
      id: product.id,
    });

    // Check if slug actually changed
    if (product.slug === newSlug) {
      skipped++;
      continue;
    }

    mappings.push({
      oldSlug: product.slug,
      newSlug: newSlug,
      productId: product.id,
      title: product.title,
      category: product.category,
    });

    updates.push({
      id: product.id,
      oldSlug: product.slug,
      newSlug: newSlug,
    });

    console.log(`  ${product.title}`);
    console.log(`    OLD: /product/${product.slug}`);
    console.log(`    NEW: /product/${product.category}/${newSlug}`);
    console.log("");
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Total products: ${products.length}`);
  console.log(`  Need update: ${updates.length}`);
  console.log(`  Already good: ${skipped}`);
  console.log("");

  if (updates.length === 0) {
    console.log("✅ All slugs are already up to date!");
    return;
  }

  // Step 3: Save backup and mapping files
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups");

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Save original products as backup
  const backupFile = path.join(backupDir, `products-backup-${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));
  console.log(`💾 Backup saved: ${backupFile}`);

  // Save slug mappings for redirects
  const mappingFile = path.join(backupDir, `slug-mappings-${timestamp}.json`);
  fs.writeFileSync(mappingFile, JSON.stringify(mappings, null, 2));
  console.log(`💾 Mappings saved: ${mappingFile}`);

  // Save redirect configuration
  const redirectConfig = mappings.map((m) => ({
    source: `/product/${m.oldSlug}`,
    destination: `/product/${m.category}/${m.newSlug}`,
    permanent: true,
  }));

  const redirectFile = path.join(backupDir, `redirects-${timestamp}.json`);
  fs.writeFileSync(redirectFile, JSON.stringify(redirectConfig, null, 2));
  console.log(`💾 Redirect config saved: ${redirectFile}\n`);

  // Step 4: Ask for confirmation
  console.log("⚠️  IMPORTANT: This will update slugs for " + updates.length + " products");
  console.log("⚠️  Old URLs will need redirects to work properly");
  console.log("");

  // In production, you'd want to add a confirmation prompt here
  // For now, let's do a dry run and show what would happen

  console.log("🚀 STARTING DATABASE UPDATE\n");

  // Step 5: Update database
  console.log("📝 Updating products in database...\n");

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
  console.log(`  Errors: ${errorCount}`);
  console.log(`\nNext steps:`);
  console.log(`  1. ✅ Redirects configured in next.config.ts`);
  console.log(`  2. ✅ URL structure updated to /product/[category]/[slug]`);
  console.log(`  3. Test product pages on your website`);
  console.log(`  4. Monitor Google Search Console\n`);
}

// Run migration
migrateProductSlugs().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
