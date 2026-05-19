"use server";

import { createAdminClient } from "@/lib/supabase/server";

export async function uploadPaymentReceipt(formData: FormData): Promise<string> {
  const sb = createAdminClient();

  const file = formData.get('receipt') as File;
  if (!file) throw new Error('No file provided');

  console.log('Server: Uploading receipt...', {
    name: file.name,
    size: file.size,
    type: file.type
  });

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const ext = file.name.split('.').pop();
  const filename = `receipt-${timestamp}-${random}.${ext}`;
  const filepath = `payment-receipts/${filename}`;

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to storage
  const { data, error } = await sb.storage
    .from('orders')
    .upload(filepath, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Server upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  console.log('Server upload successful:', data);

  // Get public URL
  const { data: { publicUrl } } = sb.storage
    .from('orders')
    .getPublicUrl(filepath);

  console.log('Public URL:', publicUrl);

  return publicUrl;
}
