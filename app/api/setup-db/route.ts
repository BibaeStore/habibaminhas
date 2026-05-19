import { NextResponse } from 'next/server';

export async function GET() {
  const sql = `
-- Add payment_proof_url column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- Add comment
COMMENT ON COLUMN orders.payment_proof_url IS 'URL of uploaded payment receipt';
  `.trim();

  return NextResponse.json({
    message: 'Run this SQL in your Supabase dashboard',
    instructions: [
      '1. Go to https://supabase.com/dashboard/project/ftrwdknlckzcwbibdicu/editor',
      '2. Click "SQL Editor" in the left sidebar',
      '3. Click "New Query"',
      '4. Copy and paste the SQL below',
      '5. Click "Run" or press Ctrl+Enter'
    ],
    sql
  }, {
    headers: { 'Content-Type': 'application/json' }
  });
}
