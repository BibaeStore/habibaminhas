import { NextResponse } from "next/server";
import { getNavMenu } from "@/lib/actions/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const menu = await getNavMenu();
    return NextResponse.json(menu, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
