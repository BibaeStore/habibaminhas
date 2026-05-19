import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Test endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Upload endpoint is working' });
}

export async function POST(request: NextRequest) {
  console.log('📤 Upload API called');
  try {
    console.log('📋 Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('receipt') as File;

    console.log('📁 File received:', { name: file?.name, size: file?.size, type: file?.type });

    if (!file) {
      console.log('❌ No file in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('🔧 Creating admin client...');
    const sb = createAdminClient();

    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔑 Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Check if bucket exists
    const { data: buckets, error: bucketError } = await sb.storage.listBuckets();
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return NextResponse.json({ error: 'Storage access error: ' + bucketError.message }, { status: 500 });
    }
    console.log('📦 Available buckets:', buckets?.map(b => b.name));

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = file.name.split('.').pop();
    const filename = `receipt-${timestamp}-${random}.${ext}`;
    const filepath = `payment-receipts/${filename}`;

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase
    const { data, error } = await sb.storage
      .from('orders')
      .upload(filepath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = sb.storage
      .from('orders')
      .getPublicUrl(filepath);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
