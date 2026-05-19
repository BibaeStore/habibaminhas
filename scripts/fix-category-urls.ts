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

// Map category slugs to correct route paths
const CATEGORY_URL_MAP: Record<string, string> = {
  'baby-products': '/baby/',
  'ladies-suits': '/ladies/',
  'kids-formal': '/kids/',
  'accessories': '/accessories/',
};

async function fixCategoryUrls() {
  console.log('🔧 Fixing category URLs...\n');

  try {
    // Get all main categories
    const { data: categories, error: fetchError } = await supabase
      .from('categories')
      .select('id, name, slug, nav_href, type')
      .is('parent_id', null)
      .eq('type', 'main');

    if (fetchError) {
      console.error('❌ Error fetching categories:', fetchError.message);
      return;
    }

    if (!categories || categories.length === 0) {
      console.log('⚠️  No main categories found.');
      return;
    }

    console.log('📋 Found main categories:\n');
    for (const cat of categories) {
      const correctUrl = CATEGORY_URL_MAP[cat.slug];
      const currentUrl = cat.nav_href || `/${cat.slug}/`;

      console.log(`  • ${cat.name}`);
      console.log(`    Slug: ${cat.slug}`);
      console.log(`    Current nav_href: ${cat.nav_href || '(empty)'}`);
      console.log(`    Should be: ${correctUrl || `/${cat.slug}/`}`);

      if (correctUrl && currentUrl !== correctUrl) {
        // Update the nav_href
        const { error: updateError } = await supabase
          .from('categories')
          .update({ nav_href: correctUrl })
          .eq('id', cat.id);

        if (updateError) {
          console.log(`    ❌ Failed to update: ${updateError.message}`);
        } else {
          console.log(`    ✅ Updated to: ${correctUrl}`);
        }
      } else if (correctUrl) {
        console.log(`    ✓ Already correct`);
      }
      console.log('');
    }

    console.log('\n✅ Category URLs fixed!');
    console.log('\n📝 Next steps:');
    console.log('  1. Restart your dev server');
    console.log('  2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)');
    console.log('  3. Try clicking dropdown links again\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixCategoryUrls();
