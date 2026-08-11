"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { Tables, TablesUpdate } from "@/lib/supabase/types";
import { getSocialSettings, getMetaCredentials } from "@/lib/social/config";
import { selectNextProducts, type RotationStatus } from "@/lib/social/select";
import {
  publishLogEntry,
  runScheduledPost,
  deletePostFromPlatforms,
  repostWithFreshCaption,
  restoreArchivedPost,
} from "@/lib/social/publish";
import { getPublishingQuota } from "@/lib/social/adapters/instagram";
import { MAX_ENABLED_COLLABORATORS } from "@/lib/social/limits";
import { buildProductReel } from "@/lib/social/reel/build";
import { canEncodeHere } from "@/lib/social/reel/encode";

/**
 * Server actions for /admin/social.
 *
 * Everything here runs through the service-role client. The social_* tables have RLS
 * enabled with no policies, so they are unreachable from the browser — the only way in is
 * through these actions, which run on the server behind the admin login.
 */

export type SocialLogRow = Tables<"social_post_log">;
export type SocialSettingsRow = Tables<"social_settings">;
export type SocialPlatformRow = Tables<"social_platforms">;
export type SocialCollaboratorRow = Tables<"social_collaborators">;

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

export async function fetchPostHistory(limit = 200): Promise<SocialLogRow[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("social_post_log")
    .select("*")
    .in("status", ["posted", "failed", "skipped", "archived"])
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

// ─── Platforms ────────────────────────────────────────────────────────────────

export async function fetchPlatforms(): Promise<SocialPlatformRow[]> {
  const sb = createAdminClient();
  const { data, error } = await sb.from("social_platforms").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Enables or disables posting to a platform.
 *
 * Refuses to enable one we cannot publish to — `supported` reflects whether an adapter
 * exists, and a platform toggled on without one would fail silently every run.
 */
export async function setPlatformEnabled(key: string, enabled: boolean): Promise<void> {
  const sb = createAdminClient();

  if (enabled) {
    const { data } = await sb
      .from("social_platforms")
      .select("supported, name")
      .eq("key", key)
      .maybeSingle();
    if (!data?.supported) {
      throw new Error(`${data?.name ?? key} has no adapter yet, so it cannot be enabled.`);
    }
  }

  const { error } = await sb
    .from("social_platforms")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

// ─── Collaborators ────────────────────────────────────────────────────────────

export async function fetchCollaborators(): Promise<SocialCollaboratorRow[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("social_collaborators")
    .select("*")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addCollaborator(input: {
  username: string;
  displayName?: string;
  notes?: string;
  platform?: string;
}): Promise<void> {
  // Accept a pasted profile URL or an @handle and reduce it to the bare username, which
  // is what Meta's `collaborators` parameter expects.
  const username = input.username
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .trim();

  if (!username) throw new Error("Username is required.");
  if (!/^[A-Za-z0-9._]{1,30}$/.test(username)) {
    throw new Error("That does not look like a valid Instagram username.");
  }

  const sb = createAdminClient();
  const { error } = await sb.from("social_collaborators").insert({
    platform: input.platform ?? "instagram",
    username,
    display_name: input.displayName?.trim() || null,
    notes: input.notes?.trim() || null,
    // New entries start disabled so adding someone never silently changes the next post.
    enabled: false,
  });
  if (error) {
    throw new Error(
      error.code === "23505" ? `${username} is already in the list.` : error.message,
    );
  }
  revalidatePath("/admin/social");
}

export async function updateCollaborator(
  id: string,
  patch: { displayName?: string; notes?: string },
): Promise<void> {
  const sb = createAdminClient();
  const { error } = await sb
    .from("social_collaborators")
    .update({
      display_name: patch.displayName?.trim() || null,
      notes: patch.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

/** Toggles whether a collaborator is attached to new posts, enforcing Meta's cap of 3. */
export async function setCollaboratorEnabled(id: string, enabled: boolean): Promise<void> {
  const sb = createAdminClient();

  if (enabled) {
    const { count } = await sb
      .from("social_collaborators")
      .select("id", { count: "exact", head: true })
      .eq("enabled", true);
    if ((count ?? 0) >= MAX_ENABLED_COLLABORATORS) {
      throw new Error(
        `Instagram allows ${MAX_ENABLED_COLLABORATORS} collaborators per post. Turn one off first.`,
      );
    }
  }

  const { error } = await sb
    .from("social_collaborators")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

export async function deleteCollaborator(id: string): Promise<void> {
  const sb = createAdminClient();
  const { error } = await sb.from("social_collaborators").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

// ─── Categories ───────────────────────────────────────────────────────────────

/**
 * Categories that can actually be posted from, with live product counts.
 *
 * Only `main` categories are offered: products store the main slug in `category` and use
 * `subcategory` as an array of tags, so filtering the rotation by a sub-slug would match
 * nothing.
 */
export async function fetchPostableCategories(): Promise<
  Array<{ slug: string; name: string; liveProducts: number }>
> {
  const sb = createAdminClient();

  const [{ data: cats }, { data: products }] = await Promise.all([
    sb.from("categories").select("slug, name").eq("type", "main").eq("status", "active").order("sort_order"),
    sb.from("products").select("category").eq("status", "active").gt("stock", 0),
  ]);

  const counts = new Map<string, number>();
  for (const p of products ?? []) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }

  return (cats ?? []).map((c) => ({
    slug: c.slug,
    name: c.name,
    liveProducts: counts.get(c.slug) ?? 0,
  }));
}

// ─── Queue ordering ───────────────────────────────────────────────────────────

/**
 * Persists a drag-and-drop reorder of the "Up next" list.
 *
 * Positions are rewritten wholesale rather than patched, so the stored order always
 * matches exactly what the owner sees. Pins are cleared automatically once a product
 * posts, so this nudges the queue rather than permanently reranking the catalogue.
 */
export async function saveQueueOrder(productIds: string[]): Promise<void> {
  const sb = createAdminClient();
  await sb.from("social_queue_order").delete().neq("product_id", "00000000-0000-0000-0000-000000000000");

  if (productIds.length === 0) {
    revalidatePath("/admin/social");
    return;
  }

  const { error } = await sb.from("social_queue_order").insert(
    productIds.map((product_id, i) => ({ product_id, position: i })),
  );
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

/** Drops all manual pins and returns to pure automatic rotation. */
export async function clearQueueOrder(): Promise<void> {
  const sb = createAdminClient();
  await sb.from("social_queue_order").delete().neq("product_id", "00000000-0000-0000-0000-000000000000");
  revalidatePath("/admin/social");
}

// ─── Post removal and repost ──────────────────────────────────────────────────

export async function deletePost(groupId: string, platforms: string[]): Promise<unknown> {
  const result = await deletePostFromPlatforms(groupId, platforms);
  revalidatePath("/admin/social");
  return result;
}

export async function repostPost(groupId: string): Promise<unknown> {
  const result = await repostWithFreshCaption(groupId);
  revalidatePath("/admin/social");
  return result;
}

export async function restorePost(groupId: string): Promise<void> {
  await restoreArchivedPost(groupId);
  revalidatePath("/admin/social");
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

// ─── Reels ────────────────────────────────────────────────────────────────────

/**
 * Reels are a separate track from photo posts, by design.
 *
 * They keep their own queue, their own rotation and their own review step. A garment shown
 * as a carousel and again as a reel is reinforcement rather than repetition, and with only
 * ~25 eligible products a shared queue would roughly halve photo coverage.
 *
 * Every reel is reviewed before it publishes, regardless of `social_settings.approval_required`
 * — that setting governs photo posts only. A bad photo caption is embarrassing; a bad reel
 * is twelve seconds of it.
 */

export type SocialReelRow = Tables<"social_media_queue">;

export async function fetchReels(limit = 100): Promise<SocialReelRow[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("social_media_queue")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Titles for the products a reel features, so the review card names them. */
export async function fetchReelProductTitles(
  ids: string[],
): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const sb = createAdminClient();
  const { data } = await sb.from("products").select("id, title").in("id", ids);
  const out: Record<string, string> = {};
  for (const row of data ?? []) out[row.id as string] = row.title as string;
  return out;
}

/**
 * Which products are next in the **reel** rotation.
 *
 * Format A needs at least 3 images to be worth watching, which only some of the catalogue
 * has — those are excluded here rather than failing later in the builder.
 */
export async function fetchReelUpNext(limit = 8): Promise<
  Array<{ id: string; slug: string; title: string; images: string[] }>
> {
  const sb = createAdminClient();
  const settings = await getSocialSettings();

  let query = sb
    .from("products")
    .select("id, slug, title, images")
    .eq("status", "active");
  if (settings?.categories?.length) query = query.in("category", settings.categories);
  if (settings?.require_in_stock) query = query.gt("stock", 0);

  const { data: rows } = await query;
  const eligible = (rows ?? []).filter((p) => ((p.images as string[])?.length ?? 0) >= 3);

  const { data: used } = await sb
    .from("social_media_queue")
    .select("product_ids, created_at")
    .neq("status", "archived");

  const lastUsed = new Map<string, number>();
  for (const row of used ?? []) {
    for (const id of (row.product_ids as string[]) ?? []) {
      const at = Date.parse(row.created_at as string);
      if (!lastUsed.has(id) || at > lastUsed.get(id)!) lastUsed.set(id, at);
    }
  }

  return eligible
    .sort((a, b) => (lastUsed.get(a.id as string) ?? 0) - (lastUsed.get(b.id as string) ?? 0))
    .slice(0, limit)
    .map((p) => ({
      id: p.id as string,
      slug: p.slug as string,
      title: p.title as string,
      images: (p.images as string[]) ?? [],
    }));
}

/** Marks a reel ready to publish. Publishing itself lands in Phase 3. */
export async function approveReel(id: string): Promise<void> {
  const sb = createAdminClient();
  const { error } = await sb
    .from("social_media_queue")
    .update({ status: "approved", approved_at: new Date().toISOString(), rebuild_requested: false })
    .eq("id", id)
    .eq("status", "draft");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

/** Archives rather than deletes — a rejected reel stays recoverable, like removed posts. */
export async function discardReel(id: string): Promise<void> {
  const sb = createAdminClient();
  const { error } = await sb
    .from("social_media_queue")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

export async function restoreReel(id: string): Promise<void> {
  const sb = createAdminClient();
  const { error } = await sb
    .from("social_media_queue")
    .update({ status: "draft", archived_at: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

/**
 * Asks for a different cut of the same reel.
 *
 * This raises a flag rather than re-encoding. ffmpeg runs locally — Vercel's free plan
 * caps a function at 60s and the binary is ~80MB — so the server genuinely cannot rebuild
 * on demand. The flag is picked up by `scripts/build-reel.ts --pending`, which keeps the
 * button honest instead of pretending to do work that never happens.
 */
export async function requestReelRebuild(id: string, note?: string): Promise<void> {
  const sb = createAdminClient();
  const { error } = await sb
    .from("social_media_queue")
    .update({ rebuild_requested: true, rebuild_note: note?.trim() || null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

export async function updateReelCaption(id: string, caption: string): Promise<void> {
  const sb = createAdminClient();
  const { error } = await sb.from("social_media_queue").update({ caption }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

/**
 * Stores a video the owner shot themselves.
 *
 * Uploading needs no ffmpeg, so unlike generation this genuinely can run on the server. It
 * joins the same review queue as a generated reel — only its origin differs.
 */
export async function uploadOwnReel(form: FormData): Promise<{ ok: boolean; detail?: string }> {
  const file = form.get("file");
  const caption = String(form.get("caption") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) return { ok: false, detail: "No file received" };

  const allowed = ["video/mp4", "video/quicktime"];
  if (!allowed.includes(file.type)) {
    return { ok: false, detail: `Unsupported type ${file.type}. Instagram needs MP4 or MOV.` };
  }
  // Bucket ceiling is 100MB; refuse here so the failure names the reason.
  if (file.size > 100 * 1024 * 1024) {
    return { ok: false, detail: `File is ${(file.size / 1024 / 1024).toFixed(0)}MB — the limit is 100MB.` };
  }

  const sb = createAdminClient();
  const ext = file.type === "video/quicktime" ? "mov" : "mp4";
  const key = `reels/upload-${Date.now().toString(36)}.${ext}`;

  const { error: uploadError } = await sb.storage
    .from("social-media")
    .upload(key, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (uploadError) return { ok: false, detail: uploadError.message };

  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const { error } = await sb.from("social_media_queue").insert({
    kind: "upload",
    product_ids: [],
    video_url: `${base}/storage/v1/object/public/social-media/${key}`,
    caption: caption || null,
    status: "draft",
    platform: "instagram",
  });
  if (error) return { ok: false, detail: error.message };

  revalidatePath("/admin/social");
  return { ok: true };
}

/**
 * Can this deployment build a reel, or must it be done on the owner's machine?
 *
 * Encoding needs ffmpeg and more than 60 seconds, neither of which a Vercel function on
 * the free plan has. Running locally — which is how the admin is used today — both are
 * available, so the button works. The UI asks this rather than assuming, so it can offer
 * the button where it works and explain itself where it does not.
 */
export async function canGenerateReels(): Promise<boolean> {
  return canEncodeHere();
}

/**
 * Builds a reel from the admin.
 *
 * Same code path as the CLI. Encoding a 12-second reel takes tens of seconds, so this is a
 * genuinely long-running action — the UI shows progress rather than appearing frozen.
 */
export async function generateReel(slug?: string): Promise<{ ok: boolean; detail: string }> {
  try {
    const result = await buildProductReel({ slug });
    revalidatePath("/admin/social");
    return {
      ok: true,
      detail: `${result.productTitle} — ${result.durationSeconds}s, ${result.sizeMb} MB. Ready for review.`,
    };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

/**
 * Rebuilds the reel the owner asked to re-cut, archiving the rejected version first so the
 * queue never shows two drafts of one product competing for approval.
 */
export async function rebuildReel(id: string): Promise<{ ok: boolean; detail: string }> {
  const sb = createAdminClient();
  const { data: row } = await sb
    .from("social_media_queue")
    .select("id, product_ids")
    .eq("id", id)
    .maybeSingle();

  const productId = ((row?.product_ids as string[]) ?? [])[0];
  if (!productId) return { ok: false, detail: "This reel has no product to rebuild from." };

  const { data: product } = await sb.from("products").select("slug").eq("id", productId).maybeSingle();
  if (!product?.slug) return { ok: false, detail: "The product no longer exists." };

  try {
    const result = await buildProductReel({ slug: product.slug as string });
    await sb
      .from("social_media_queue")
      .update({ status: "archived", archived_at: new Date().toISOString(), rebuild_requested: false })
      .eq("id", id);
    revalidatePath("/admin/social");
    return { ok: true, detail: `New cut ready — ${result.durationSeconds}s. The old one moved to Discarded.` };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

/** Manual order for the reel queue, saved on drop. Separate from the photo queue. */
export async function saveReelQueueOrder(productIds: string[]): Promise<void> {
  const sb = createAdminClient();
  await sb.from("social_reel_queue_order").delete().neq("product_id", "00000000-0000-0000-0000-000000000000");
  if (productIds.length === 0) return;
  const { error } = await sb.from("social_reel_queue_order").insert(
    productIds.map((product_id, position) => ({ product_id, position })),
  );
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social");
}

export async function clearReelQueueOrder(): Promise<void> {
  const sb = createAdminClient();
  await sb.from("social_reel_queue_order").delete().neq("product_id", "00000000-0000-0000-0000-000000000000");
  revalidatePath("/admin/social");
}

/**
 * Where the reel rotation stands — its own counter, not the photo one.
 *
 * The header's "Cycle 1 · 4 of 25" counts photo posts only. Reels run on a separate track,
 * so mixing them into one number would misreport both.
 */
export async function fetchReelRotation(): Promise<{
  made: number;
  eligible: number;
  awaitingReview: number;
  published: number;
}> {
  const sb = createAdminClient();
  const settings = await getSocialSettings();

  let query = sb.from("products").select("id, images").eq("status", "active");
  if (settings?.categories?.length) query = query.in("category", settings.categories);
  if (settings?.require_in_stock) query = query.gt("stock", 0);
  const { data: rows } = await query;
  const eligible = (rows ?? []).filter((p) => ((p.images as string[])?.length ?? 0) >= 3);

  const { data: reels } = await sb
    .from("social_media_queue")
    .select("product_ids, status")
    .neq("status", "archived");

  const covered = new Set<string>();
  for (const r of reels ?? []) for (const id of (r.product_ids as string[]) ?? []) covered.add(id);

  return {
    made: eligible.filter((p) => covered.has(p.id as string)).length,
    eligible: eligible.length,
    awaitingReview: (reels ?? []).filter((r) => r.status === "draft").length,
    published: (reels ?? []).filter((r) => r.status === "posted").length,
  };
}
