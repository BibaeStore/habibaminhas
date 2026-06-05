import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

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
  for (const row of (data ?? []) as Pick<Tables<"categories">, "slug" | "image">[]) {
    if (row.slug && row.image) map[row.slug] = row.image;
  }

  return NextResponse.json(map, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
  });
}
