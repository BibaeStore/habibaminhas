import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const sb = createAdminClient();

    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    // Check existing buckets
    const { data: buckets, error: listError } = await sb.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    console.log('📦 Existing buckets:', buckets?.map(b => b.name));

    // Check if orders bucket exists
    const ordersBucket = buckets?.find(b => b.name === 'orders');

    if (ordersBucket) {
      console.log('✅ Orders bucket already exists');
      return NextResponse.json({
        success: true,
        message: 'Orders bucket already exists',
        buckets: buckets?.map(b => b.name)
      });
    }

    console.log('📦 Creating orders bucket...');

    const { data, error } = await sb.storage.createBucket('orders', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    if (error) {
      console.error('❌ Error creating bucket:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Orders bucket created successfully');

    return NextResponse.json({
      success: true,
      message: 'Orders bucket created successfully',
      bucket: data
    });

  } catch (error) {
    console.error('💥 Setup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500 }
    );
  }
}
