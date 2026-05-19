import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map old subcategory values to new slugs
const SUBCATEGORY_MIGRATION_MAP: Record<string, string> = {
  'nests': 'baby-nest',
  'bedding': 'baby-bedding-set',
  'swaddles': 'baby-swaddle',
  'carrier': 'baby-bags',
  'baby-cot-sets': 'baby-cot-sets', // Keep as is
  'suits': 'stitched-suits', // For ladies products
};

async function migrateProductSubcategories() {
  console.log('🔄 Migrating product subcategories...\n');

  try {
    // Get all products with subcategories
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, category, subcategory')
      .not('subcategory', 'is', null);

    if (error) {
      console.error('❌ Error fetching products:', error.message);
      return;
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No products with subcategories found.');
      return;
    }

    console.log(`📦 Found ${products.length} product(s) with subcategories\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const oldSubcategories = product.subcategory || [];
      const newSubcategories = oldSubcategories.map((sub: string) => {
        return SUBCATEGORY_MIGRATION_MAP[sub] || sub;
      });

      // Check if any changes needed
      const hasChanges = JSON.stringify(oldSubcategories) !== JSON.stringify(newSubcategories);

      if (hasChanges) {
        console.log(`🔧 ${product.title}`);
        console.log(`   Old: [${oldSubcategories.join(', ')}]`);
        console.log(`   New: [${newSubcategories.join(', ')}]`);

        const { error: updateError } = await supabase
          .from('products')
          .update({ subcategory: newSubcategories })
          .eq('id', product.id);

        if (updateError) {
          console.log(`   ❌ Failed: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated`);
          updatedCount++;
        }
        console.log('');
      } else {
        skippedCount++;
      }
    }

    console.log('─────────────────────────────────────');
    console.log(`📊 Summary:`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped (no changes): ${skippedCount}`);
    console.log('─────────────────────────────────────\n');

    if (updatedCount > 0) {
      console.log('✅ Migration complete!');
      console.log('📝 Next steps:');
      console.log('   1. Refresh your browser');
      console.log('   2. Click on subcategory links');
      console.log('   3. Products should now appear!\n');
    } else {
      console.log('ℹ️  No products needed migration.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

migrateProductSubcategories();
