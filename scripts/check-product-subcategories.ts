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

async function checkProductSubcategories() {
  console.log('🔍 Checking product subcategories...\n');

  try {
    // Get baby products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, category, subcategory, status')
      .eq('category', 'baby-products')
      .eq('status', 'active')
      .order('title');

    if (error) {
      console.error('❌ Error fetching products:', error.message);
      return;
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No baby products found.');
      return;
    }

    console.log(`📦 Found ${products.length} baby product(s):\n`);

    let productsWithSubcategories = 0;
    let productsWithoutSubcategories = 0;

    for (const product of products) {
      const hasSubcategories = product.subcategory && product.subcategory.length > 0;

      if (hasSubcategories) {
        productsWithSubcategories++;
        console.log(`✅ ${product.title}`);
        console.log(`   Subcategories: ${product.subcategory.join(', ')}`);
      } else {
        productsWithoutSubcategories++;
        console.log(`❌ ${product.title}`);
        console.log(`   Subcategories: (none assigned)`);
      }
      console.log('');
    }

    console.log('─────────────────────────────────────');
    console.log(`📊 Summary:`);
    console.log(`   With subcategories: ${productsWithSubcategories}`);
    console.log(`   Without subcategories: ${productsWithoutSubcategories}`);
    console.log('─────────────────────────────────────\n');

    if (productsWithoutSubcategories > 0) {
      console.log('⚠️  Products without subcategories won\'t show on subcategory pages!\n');
      console.log('📝 To fix this:');
      console.log('   1. Go to Admin → Products');
      console.log('   2. Click "Edit" on each baby product');
      console.log('   3. Select appropriate subcategories (Baby Nest, Baby Pillow, etc.)');
      console.log('   4. Save the product\n');
    }

    // Get available subcategories
    const { data: categories } = await supabase
      .from('categories')
      .select('name, slug')
      .eq('status', 'active')
      .not('parent_id', 'is', null);

    if (categories && categories.length > 0) {
      console.log('📋 Available subcategories to assign:\n');
      for (const cat of categories) {
        console.log(`   • ${cat.name} (slug: ${cat.slug})`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkProductSubcategories();
