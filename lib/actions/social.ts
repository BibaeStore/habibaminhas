"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { Tables, TablesUpdate } from "@/lib/supabase/types";
import { getSocialSettings, getMetaCredentials } from "@/lib/social/config";
import { selectNextProducts, type RotationStatus } from "@/lib/social/select";
import { publishLogEntry, runScheduledPost } from "@/lib/social/publish";
import { getPublishingQuota } from "@/lib/social/adapters/instagram";

/**
 * Server actions for /admin/social.
 *
 * Everything here runs through the service-role client. The social_* tables have RLS
 * enabled with no policies, so they are unreachable from the browser — the only way in is
 * through these actions, which run on the server behind the admin login.
 */

export type SocialLogRow = Tables<"social_post_log">;
export type SocialSettingsRow = Tables<"social_settings">;

export async function fetchSocialSettings(): Promise<SocialSettingsRow> {
  const sb = createAdminClient();
  const { data, error } = await sb.from("social_settings").select("*").eq("id", 1).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveSocialSettings(
  payload: TablesUpdate<"social_settings">,
): Promise<SocialSettingsRow> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("social_settings")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
  return data;
}

/** Rotation position — "cycle 2 · 7 of 20 posted". */
export async function fetchRotationStatus(): Promise<RotationStatus | null> {
  const settings = await getSocialSettings();
  if (!settings) return null;
  const { status } = await selectNextProducts(settings, 1);
  return status;
}

/** The next products the rotation would pick, for the "up next" preview. */
export async function fetchUpNext(limit = 5): Promise<
  Array<{ id: string; slug: string; title: string; images: string[] }>
> {
  const settings = await getSocialSettings();
  if (!settings) return [];
  const { products } = await selectNextProducts(settings, limit);
  return products.map((p) => ({ id: p.id, slug: p.slug, title: p.title, images: p.images }));
}

export async function fetchPostHistory(limit = 50): Promise<SocialLogRow[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("social_post_log")
    .select("*")
    .in("status", ["posted", "failed", "skipped"])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchReviewQueue(): Promise<SocialLogRow[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("social_post_log")
    .select("*")
    .in("status", ["pending", "approved"])
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Edit a queued caption before it goes out. */
export async function updateQueuedCaption(id: string, caption: string): Promise<void> {
  const sb = createAdminClient();
  const { error } = await sb.from("social_post_log").update({ caption }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

/** Approve and publish immediately, rather than waiting for the next cron tick. */
export async function approveAndPublish(id: string): Promise<unknown> {
  const sb = createAdminClient();
  const { error } = await sb.from("social_post_log").update({ status: "approved" }).eq("id", id);
  if (error) throw new Error(error.message);

  const result = await publishLogEntry(id);
  revalidatePath("/admin/social");
  return result;
}

/**
 * Skip a queued post.
 *
 * Marked 'skipped' rather than deleted so the product is not immediately re-selected, and
 * so the history shows a deliberate decision rather than a gap.
 */
export async function skipQueuedPost(id: string): Promise<void> {
  const sb = createAdminClient();
  const { error } = await sb.from("social_post_log").update({ status: "skipped" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

/** Retry a failed post using the caption and images already generated for it. */
export async function retryFailedPost(id: string): Promise<unknown> {
  const result = await publishLogEntry(id);
  revalidatePath("/admin/social");
  return result;
}

/**
 * "Post now" — runs a cycle immediately, ignoring the slot and the kill switch.
 *
 * The daily ceiling still applies, so this cannot be used to accidentally burn through
 * the catalogue.
 */
export async function triggerPostNow(productId?: string): Promise<unknown> {
  const result = await runScheduledPost({ force: true, productId });
  revalidatePath("/admin/social");
  return result;
}

/** Connection health for the dashboard banner. */
export async function fetchConnectionStatus(): Promise<{
  configured: boolean;
  missing: string[];
  quota?: { used: number; total: number | null };
  error?: string;
}> {
  const required = [
    "META_APP_ID",
    "META_SYSTEM_USER_TOKEN",
    "META_FB_PAGE_ID",
    "META_IG_BUSINESS_ACCOUNT_ID",
  ];
  const missing = required.filter((k) => !process.env[k]?.trim());
  if (missing.length > 0) return { configured: false, missing };

  const creds = getMetaCredentials();
  if (!creds) return { configured: false, missing };

  try {
    const quota = await getPublishingQuota(creds);
    return { configured: true, missing: [], quota };
  } catch (e) {
    // Configured but the token is not working — surface it rather than showing a green tick.
    return { configured: true, missing: [], error: (e as Error).message };
  }
}
