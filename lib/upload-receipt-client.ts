import { createClient } from "@/lib/supabase/client";

export async function uploadReceiptToStorage(file: File): Promise<string> {
  const supabase = createClient();

  console.log('Starting receipt upload...', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });

  // Check if we can access the bucket first
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

  if (bucketError) {
    console.error('Error listing buckets:', bucketError);
    throw new Error(`Cannot access storage: ${bucketError.message}`);
  }

  console.log('Available buckets:', buckets?.map(b => b.name));

  const ordersBucket = buckets?.find(b => b.name === 'orders');
  if (!ordersBucket) {
    console.error('Orders bucket not found in:', buckets?.map(b => b.name));
    throw new Error('Storage bucket "orders" not found. Please contact support.');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const ext = file.name.split('.').pop();
  const filename = `receipt-${timestamp}-${random}.${ext}`;
  const filepath = `payment-receipts/${filename}`;

  console.log('Uploading to:', filepath);

  // Upload directly to Supabase Storage from client
  const { data, error } = await supabase.storage
    .from('orders')
    .upload(filepath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  console.log('Upload successful:', data);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('orders')
    .getPublicUrl(filepath);

  console.log('Public URL:', publicUrl);

  return publicUrl;
}
