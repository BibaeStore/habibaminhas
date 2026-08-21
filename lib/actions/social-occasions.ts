"use server";

/**
 * Server actions for the occasion planner.
 *
 * Every action is a deliberate owner decision — regenerate, cancel, approve. The agent
 * itself needs none of these; it runs from the cron. This module exists so the owner can
 * intervene in the window between artwork being made and the post going out.
 */
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";
import { generateFor, planAhead, PLAN_HORIZON_DAYS } from "@/lib/social/occasion/agent";
import { addDays, localDateKey } from "@/lib/social/occasion/calendar";
import type { OccasionPostRow } from "@/lib/social/occasion/types";

/** See the note in agent.ts — generated Database types do not cover these tables yet. */
function admin(): SupabaseClient {
  return createAdminClient() as unknown as SupabaseClient;
}

export type CalendarEntry = OccasionPostRow & {
  product_title: string | null;
};

/**
 * Everything planned from today to the end of the horizon, soonest first.
 *
 * Cancelled and skipped rows are included on purpose: the owner needs to see that a post
 * was cancelled, otherwise a missing Friday looks like the agent failed.
 */
export async function listOccasionCalendar(days = PLAN_HORIZON_DAYS): Promise<CalendarEntry[]> {
  const sb = admin();
  const today = localDateKey(new Date());

  const { data, error } = await sb
    .from("social_occasion_posts")
    .select("*")
    .gte("occasion_date", today)
    .lte("occasion_date", addDays(today, days))
    .order("occasion_date", { ascending: true });
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as OccasionPostRow[];
  const ids = [...new Set(rows.map((r) => r.product_id).filter(Boolean))] as string[];

  const titles = new Map<string, string>();
  if (ids.length) {
    const { data: products } = await sb.from("products").select("id, title").in("id", ids);
    for (const p of products ?? []) titles.set(p.id as string, p.title as string);
  }

  return rows.map((r) => ({
    ...r,
    product_title: r.product_id ? titles.get(r.product_id) ?? null : null,
  }));
}

/** Recently published occasion posts, for the history strip. */
export async function listRecentOccasionPosts(limit = 10): Promise<CalendarEntry[]> {
  const sb = admin();
  const { data } = await sb
    .from("social_occasion_posts")
    .select("*")
    .in("status", ["published", "failed"])
    .order("occasion_date", { ascending: false })
    .limit(limit);
  return ((data ?? []) as unknown as OccasionPostRow[]).map((r) => ({ ...r, product_title: null }));
}

/** Fills the calendar on demand. The cron does this anyway; the button is for impatience. */
export async function runOccasionPlanner(): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await planAhead();
    revalidatePath("/admin/social/occasions");
    return {
      ok: true,
      detail: `${res.planned} planned, ${res.resolved} date${res.resolved === 1 ? "" : "s"} resolved`,
    };
  } catch (err) {
    return { ok: false, detail: (err as Error).message };
  }
}

/** Renders artwork for a post that has none yet. */
export async function generateOccasionArtwork(id: string): Promise<{ ok: boolean; detail?: string }> {
  const res = await generateFor(id);
  revalidatePath("/admin/social/occasions");
  return res;
}

/**
 * Throws away the current artwork and makes another.
 *
 * The counter is bumped first so the new image lands on a new storage key. Reusing the key
 * meant the CDN kept serving the picture the owner had just rejected.
 */
export async function regenerateOccasionArtwork(id: string): Promise<{ ok: boolean; detail?: string }> {
  const sb = admin();
  const { data: row } = await sb
    .from("social_occasion_posts").select("regenerate_count, status").eq("id", id).single();
  if (!row) return { ok: false, detail: "not found" };
  if (row.status === "published") return { ok: false, detail: "already published" };

  await sb.from("social_occasion_posts").update({
    regenerate_count: (row.regenerate_count as number) + 1,
    status: "planned",
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  const res = await generateFor(id);
  revalidatePath("/admin/social/occasions");
  return res;
}

/**
 * Stops a post publishing, permanently.
 *
 * The planner re-runs constantly, so this must survive it: the row stays in place as
 * `cancelled` and the unique (occasion_slug, occasion_date) constraint makes the next plan
 * conflict rather than insert a fresh one. Deleting instead would resurrect it minutes later.
 */
export async function cancelOccasionPost(id: string): Promise<{ ok: boolean; detail?: string }> {
  const sb = admin();
  const { error } = await sb.from("social_occasion_posts").update({
    status: "cancelled",
    updated_at: new Date().toISOString(),
  }).eq("id", id).neq("status", "published");
  revalidatePath("/admin/social/occasions");
  return error ? { ok: false, detail: error.message } : { ok: true };
}

/** Puts a cancelled post back in the queue. */
export async function restoreOccasionPost(id: string): Promise<{ ok: boolean; detail?: string }> {
  const sb = admin();
  const { data: row } = await sb
    .from("social_occasion_posts").select("image_url").eq("id", id).single();
  const { error } = await sb.from("social_occasion_posts").update({
    status: row?.image_url ? "ready" : "planned",
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("status", "cancelled");
  revalidatePath("/admin/social/occasions");
  return error ? { ok: false, detail: error.message } : { ok: true };
}

/**
 * Records an explicit approval.
 *
 * Nothing waits for this — the owner chose "silence = publish" — so it is a note to self
 * that the post has been looked at, and it is what the calendar uses to show a tick.
 */
export async function approveOccasionPost(id: string): Promise<{ ok: boolean; detail?: string }> {
  const sb = admin();
  const { error } = await sb.from("social_occasion_posts").update({
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  revalidatePath("/admin/social/occasions");
  return error ? { ok: false, detail: error.message } : { ok: true };
}

/** Turns a whole occasion on or off for good — e.g. drop Father's Day entirely. */
export async function setOccasionEnabled(
  slug: string,
  enabled: boolean,
): Promise<{ ok: boolean; detail?: string }> {
  const sb = admin();
  const { error } = await sb.from("social_occasions").update({
    enabled, updated_at: new Date().toISOString(),
  }).eq("slug", slug);
  revalidatePath("/admin/social/occasions");
  return error ? { ok: false, detail: error.message } : { ok: true };
}

/** The allow-list, for the settings strip. */
export async function listOccasions() {
  const sb = admin();
  const { data } = await sb
    .from("social_occasions")
    .select("slug, name, category, recurrence, enabled, priority")
    .order("category", { ascending: true })
    .order("priority", { ascending: true });
  return data ?? [];
}
