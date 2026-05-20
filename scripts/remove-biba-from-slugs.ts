/**
 * Script: Remove "biba" from all product slugs
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
};

function cleanSlug(slug: string): string {
  // Remove "biba" and clean up any double hyphens
  return slug
    .replace(/-biba-/g, "-")
    .replace(/^biba-/g, "")
    .replace(/-biba$/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

async function removeBibaFromSlugs() {
  console.log("🚀 Removing 'biba' from all product slugs\n");

  // Fetch all products
  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, slug, category")
    .order("created_at", { ascending: true });

  if (error || !products) {
    console.error("❌ Error fetching products:", error);
    process.exit(1);
  }

  console.log(`✅ Found ${products.length} products\n`);

  // Generate new slugs
  const updates: { id: string; oldSlug: string; newSlug: string; category: string }[] = [];
  let skipped = 0;

  for (const product of products) {
    const newSlug = cleanSlug(product.slug);

    if (product.slug === newSlug) {
      skipped++;
      continue;
    }

    updates.push({
      id: product.id,
      oldSlug: product.slug,
      newSlug: newSlug,
      category: product.category,
    });

    console.log(`  ${product.title}`);
    console.log(`    OLD: ${product.slug}`);
    console.log(`    NEW: ${newSlug}`);
    console.log("");
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Total products: ${products.length}`);
  console.log(`  Need update: ${updates.length}`);
  console.log(`  Already clean: ${skipped}\n`);

  if (updates.length === 0) {
    console.log("✅ All slugs are already clean!");
    return;
  }

  // Create backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `slugs-before-biba-removal-${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));
  console.log(`💾 Backup saved: ${backupFile}\n`);

  // Generate new redirects
  const newRedirects = updates.map((u) => ({
    source: `/product/${u.category}/${u.oldSlug}/`,
    destination: `/product/${u.category}/${u.newSlug}/`,
    permanent: true,
  }));

  const redirectFile = path.join(backupDir, `biba-removal-redirects-${timestamp}.json`);
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

  // Output redirects to add to product-redirects.ts
  console.log("📋 Add these redirects to lib/product-redirects.ts:\n");
  console.log("export const bibaRemovalRedirects = [");
  newRedirects.forEach((r, i) => {
    console.log(`  { source: "${r.source}", destination: "${r.destination}", permanent: true }${i < newRedirects.length - 1 ? "," : ""}`);
  });
  console.log("];\n");
}

removeBibaFromSlugs().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
