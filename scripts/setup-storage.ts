import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function setupStorage() {
  console.log('🔗 Connected to:', supabaseUrl);

  // Check existing buckets
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('❌ Error listing buckets:', listError);
    process.exit(1);
  }

  console.log('📦 Existing buckets:', buckets?.map(b => b.name));

  // Check if orders bucket exists
  const ordersBucket = buckets?.find(b => b.name === 'orders');

  if (ordersBucket) {
    console.log('✅ Orders bucket already exists');
  } else {
    console.log('📦 Creating orders bucket...');

    const { data, error } = await supabase.storage.createBucket('orders', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    if (error) {
      console.error('❌ Error creating bucket:', error);
      process.exit(1);
    }

    console.log('✅ Orders bucket created successfully');
  }

  console.log('\n✅ Bucket setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to your Supabase dashboard:');
  console.log('   https://supabase.com/dashboard/project/ftrwdknlckzcwbibdicu/storage/buckets/orders');
  console.log('\n2. The bucket should now be created with:');
  console.log('   - Public access enabled');
  console.log('   - 5MB file size limit');
  console.log('   - Image uploads allowed');
  console.log('\nStorage policies are automatically managed by Supabase for public buckets.');
}

setupStorage().catch(console.error);
