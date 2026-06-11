import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const PAGE_SIZE = 15;

// GET — returns VTR settings + today's usage count + paginated recent entries
export async function GET(req: NextRequest) {
  const admin = createAdminClient();

  const page = Math.max(1, parseInt(new URL(req.url).searchParams.get("page") ?? "1"));
  const from = (page - 1) * PAGE_SIZE;
  const to   = from + PAGE_SIZE - 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [settingsRes, countRes, recentRes, totalRes] = await Promise.all([
    admin.from("settings").select("virtual_try_on_settings").eq("id", 1).single(),

    (admin as ReturnType<typeof createAdminClient>)
      .from("try_on_usage" as never)
      .select("id", { count: "exact", head: true })
      .gte("created_at", today.toISOString()),

    (admin as ReturnType<typeof createAdminClient>)
      .from("try_on_usage" as never)
      .select("id, user_email, product_slug, category, created_at")
      .order("created_at", { ascending: false })
      .range(from, to),

    (admin as ReturnType<typeof createAdminClient>)
      .from("try_on_usage" as never)
      .select("id", { count: "exact", head: true }),
  ]);

  if (settingsRes.error) {
    return NextResponse.json({ error: settingsRes.error.message }, { status: 500 });
  }

  const vtr = (settingsRes.data?.virtual_try_on_settings as Record<string, unknown>) ?? {};
  const total      = totalRes.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return NextResponse.json({
    config: {
      enabled:            typeof vtr.enabled === "boolean" ? vtr.enabled : true,
      per_user_limit:     typeof vtr.per_user_limit === "number" ? vtr.per_user_limit : 3,
      global_daily_limit: typeof vtr.global_daily_limit === "number" ? vtr.global_daily_limit : 20,
    },
    today:      countRes.count ?? 0,
    recent:     (recentRes.data ?? []) as {
      id: string; user_email: string; product_slug: string; category: string; created_at: string;
    }[],
    page,
    totalPages,
    total,
  });
}

// POST — saves updated VTR settings
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("settings")
    .update({ virtual_try_on_settings: body })
    .eq("id", 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
