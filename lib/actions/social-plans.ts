"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";
import { getSocialSettings, startOfLocalWeekUtc } from "@/lib/social/config";
import { selectNextProducts } from "@/lib/social/select";
import {
  compilePlan, validatePlan,
  type PlanRow, type PlanIssue, type PlanContext,
} from "@/lib/social/plan";

/**
 * Plans — the schedule expressed as targets.
 *
 * Kept in its own module rather than added to the already-long `social.ts`, and for a
 * sharper reason than file length: activating a plan *writes the live scheduler settings*.
 * That is the one operation here with real consequences, and it should be somewhere it can
 * be read in full rather than buried among forty other actions.
 */

/*
 * Types are NOT re-exported from here, deliberately.
 *
 * `export type { PlanRow }` inside a "use server" module is valid TypeScript and passes
 * both tsc and next build — but the server-action transform emits a *runtime* re-export
 * for it, and the type does not exist at runtime. The result was
 * `ReferenceError: PlanRow is not defined` on every request to the planner, with nothing
 * failing at compile time to warn about it.
 *
 * Import plan types from `@/lib/social/plan` instead, which is a plain module.
 */

export async function fetchPlans(): Promise<PlanRow[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("social_plans")
    .select("*")
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchActivePlan(): Promise<PlanRow | null> {
  const sb = createAdminClient();
  const { data } = await sb.from("social_plans").select("*").eq("is_active", true).maybeSingle();
  return data ?? null;
}

/**
 * What the planner needs to judge whether a plan is achievable.
 *
 * Counts come from the same rotation query the scheduler uses, so a warning about the
 * catalogue reflects what would genuinely be posted rather than a raw product count.
 */
export async function fetchPlanContext(): Promise<PlanContext> {
  const settings = await getSocialSettings();
  const sb = createAdminClient();

  /*
   * One pass over the eligible set answers both questions. `selectNextProducts` already
   * applies the category, stock and minimum-image filters the scheduler uses, so counting
   * from it means a warning reflects what would genuinely post rather than a raw catalogue
   * total — and the 3+ image count for reels comes from the same list rather than a second
   * query that could disagree with it.
   */
  const [selection, plans] = await Promise.all([
    settings
      ? selectNextProducts(settings, 500)
      : Promise.resolve({ status: null, products: [] as Array<{ images: string[] }> }),
    sb.from("social_plans").select("id, name, active_from, active_to"),
  ]);

  return {
    eligibleProducts: selection.status?.eligibleTotal ?? selection.products.length,
    eligibleReelProducts: selection.products.filter((p) => (p.images ?? []).length >= 3).length,
    dailyCeiling: settings?.max_posts_per_day ?? 2,
    otherPlans: plans.data ?? [],
  };
}

/** Validate without saving, so the UI can warn as the plan is typed. */
export async function checkPlan(plan: PlanRow): Promise<PlanIssue[]> {
  return validatePlan(plan, await fetchPlanContext());
}

export async function createPlan(input?: Partial<TablesInsert<"social_plans">>): Promise<PlanRow> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("social_plans")
    .insert({
      name: input?.name ?? "New plan",
      // Never created active. Activation writes the live scheduler settings, and that must
      // be a deliberate act rather than a side effect of pressing "New plan".
      is_active: false,
      ...input,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social/planner");
  return data;
}

export async function updatePlan(
  id: string,
  patch: TablesUpdate<"social_plans">,
): Promise<PlanRow> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("social_plans")
    .update({ ...patch, is_active: undefined, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Editing the plan that is currently running must move the live schedule with it,
  // otherwise the planner shows one thing and the scheduler does another.
  if (data.is_active) await writeScheduleFromPlan(data);

  revalidatePath("/admin/social/planner");
  revalidatePath("/admin/social");
  return data;
}

/**
 * Copy a plan.
 *
 * Worth more than it sounds: next month's plan is almost always last month's with two
 * numbers changed, and retyping days and times invites a transcription slip that only
 * shows up as a missing post a fortnight later.
 */
export async function duplicatePlan(id: string): Promise<PlanRow> {
  const sb = createAdminClient();
  const { data: source, error } = await sb
    .from("social_plans")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);

  // Fields listed explicitly rather than spread-minus-omissions: a new column added later
  // should have to be considered here, not silently copied into every duplicate.
  return createPlan({
    name: `${source.name} (copy)`,
    active_from: source.active_from,
    active_to: source.active_to,
    photos_per_week: source.photos_per_week,
    photo_days: source.photo_days,
    photo_times: source.photo_times,
    photo_window_start: source.photo_window_start,
    photo_window_end: source.photo_window_end,
    reels_per_week: source.reels_per_week,
    reel_days: source.reel_days,
    reel_times: source.reel_times,
    notes: source.notes,
  });
}

export async function deletePlan(id: string): Promise<void> {
  const sb = createAdminClient();
  const { data: plan } = await sb
    .from("social_plans")
    .select("is_active, name")
    .eq("id", id)
    .maybeSingle();

  // Deleting the running plan would leave posting governed by whatever settings it last
  // compiled, with nothing on screen explaining why. Activate another first.
  if (plan?.is_active) {
    throw new Error(
      `“${plan.name}” is the active plan. Activate a different one before deleting it.`,
    );
  }

  const { error } = await sb.from("social_plans").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social/planner");
}

/**
 * Make a plan the one that runs.
 *
 * Two steps that must happen in this order. A partial unique index enforces one active
 * plan in the database, so the previous one is stood down *before* the new one is raised —
 * doing it the other way round trips the constraint rather than swapping cleanly.
 *
 * Then the plan is compiled into `social_settings`, which is what actually changes
 * behaviour: the scheduler is not rewritten or made plan-aware, it simply reads the slots
 * and days the plan just wrote. If the plan is later deleted those settings remain, so
 * posting continues rather than stopping unexpectedly.
 */
export async function activatePlan(id: string): Promise<PlanRow> {
  const sb = createAdminClient();

  const { error: standDown } = await sb
    .from("social_plans")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("is_active", true)
    .neq("id", id);
  if (standDown) throw new Error(standDown.message);

  const { data, error } = await sb
    .from("social_plans")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  await writeScheduleFromPlan(data);

  revalidatePath("/admin/social/planner");
  revalidatePath("/admin/social");
  return data;
}

/**
 * Stop a plan governing the schedule, without deleting it.
 *
 * The compiled slots deliberately stay in place. Deactivating is "stop planning", not
 * "stop posting" — silently halting the account because a plan was switched off would be a
 * surprising amount of consequence for one toggle.
 */
export async function deactivatePlan(id: string): Promise<void> {
  const sb = createAdminClient();
  const { error } = await sb
    .from("social_plans")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social/planner");
  revalidatePath("/admin/social");
}

/** Compile a plan into the live scheduler settings. */
async function writeScheduleFromPlan(plan: PlanRow): Promise<void> {
  const sb = createAdminClient();
  const compiled = compilePlan(plan);
  const { error } = await sb
    .from("social_settings")
    .update({ ...compiled, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw new Error(error.message);
}

// ─── Grids and progress ───────────────────────────────────────────────────────

export type PlanProgress = {
  weekStart: string;
  photos: { done: number; target: number };
  reels: { done: number; target: number };
  /** Plain-language summary, e.g. "2 behind for this week". */
  summary: string;
};

/**
 * Target versus actual for the current week.
 *
 * This is the number that turns the planner from a settings screen into something worth
 * opening — a plan nobody measures is a preference, not a plan.
 */
export async function fetchPlanProgress(): Promise<PlanProgress | null> {
  const plan = await fetchActivePlan();
  if (!plan) return null;

  const sb = createAdminClient();
  const settings = await getSocialSettings();
  const weekStart = startOfLocalWeekUtc(settings?.timezone ?? "Asia/Karachi").toISOString();

  const [photoRows, reelCount] = await Promise.all([
    sb.from("social_post_log")
      .select("group_id, id")
      .eq("status", "posted")
      .gte("posted_at", weekStart),
    sb.from("social_media_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "posted")
      .gte("posted_at", weekStart),
  ]);

  // One post writes one row per platform, so collapse to distinct posts.
  const photos = new Set((photoRows.data ?? []).map((r) => r.group_id ?? r.id)).size;
  const reels = reelCount.count ?? 0;

  const behind =
    Math.max(0, plan.photos_per_week - photos) + Math.max(0, plan.reels_per_week - reels);
  const summary =
    behind === 0
      ? "On track for this week."
      : `${behind} behind for this week — add a slot or lower the target.`;

  return {
    weekStart,
    photos: { done: photos, target: plan.photos_per_week },
    reels: { done: reels, target: plan.reels_per_week },
    summary,
  };
}
