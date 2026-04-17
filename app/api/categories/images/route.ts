import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const revalidate = 300; // cache 5 min

export async function GET() {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("categories")
    .select("slug, image")
    .eq("status", "active")
    .not("image", "is", null);

  if (error) return NextResponse.json({}, { status: 500 });

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.slug && row.image) map[row.slug] = row.image;
  }

  return NextResponse.json(map, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
  });
}
