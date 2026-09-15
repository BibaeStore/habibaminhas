"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";
import { emitLowStockNotifications } from "@/lib/actions/inventory";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { LOW_STOCK_THRESHOLD } from "@/lib/inventory-constants";
import {
  MIN_DISCOUNT_PERCENT,
  MAX_DISCOUNT_PERCENT,
  originalPriceOf,
  priceAfterDiscount,
} from "@/lib/discount";

export async function uploadProductImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return { url: null, error: "No file provided" };

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 60);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;

  const sb = createAdminClient();
  const { error } = await sb.storage
    .from("products")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { url: null, error: error.message };

  const { data: { publicUrl } } = sb.storage.from("products").getPublicUrl(path);
  return { url: publicUrl, error: null };
}

export async function getProducts(filters?: {
  category?: string;
  subcategory?: string;
  subtype?: string;
  status?: string;
  featured?: boolean;
  onSale?: boolean;
  search?: string;
}): Promise<Tables<"products">[]> {
  const sb = createAdminClient();
  let q = sb.from("products").select("*").order("created_at", { ascending: false });

  if (filters?.category)    q = q.eq("category",    filters.category);
  if (filters?.subcategory) q = q.contains("subcategory", [filters.subcategory]);
  if (filters?.subtype)     q = q.eq("subtype",     filters.subtype);
  if (filters?.status)      q = q.eq("status",      filters.status);
  if (filters?.featured)    q = q.eq("featured",    true);
  if (filters?.onSale)      q = q.not("compare_at", "is", null);
  if (filters?.search)      q = q.ilike("title",    `%${filters.search}%`);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}

export async function getProductBySlug(slug: string): Promise<Tables<"products">> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getProductsBySlugs(slugs: string[]): Promise<Tables<"products">[]> {
  if (slugs.length === 0) return [];
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("products")
    .select("*")
    .in("slug", slugs)
    .eq("status", "active");
  if (error) throw new Error(error.message);
  return data;
}

export async function createProduct(payload: TablesInsert<"products">) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("products")
    .insert(payload)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  revalidatePath("/admin/products");
  revalidateStorefront(data);
  return { data, error: null };
}

export async function updateProduct(id: string, payload: TablesUpdate<"products">) {
  const sb = createAdminClient();

  let previousStock: number | null = null;
  if (typeof payload.stock === "number") {
    const { data: prev } = await sb
      .from("products")
      .select("stock")
      .eq("id", id)
      .single();
    previousStock = prev?.stock ?? null;
  }

  const { data, error } = await sb
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) return { data: null, error: error.message };

  if (
    data &&
    typeof payload.stock === "number" &&
    data.stock <= LOW_STOCK_THRESHOLD &&
    (previousStock === null || previousStock > LOW_STOCK_THRESHOLD)
  ) {
    await emitLowStockNotifications([
      { id: data.id, title: data.title, stock: data.stock },
    ]);
  }

  revalidatePath("/admin/products");
  revalidateStorefront(data);
  return { data, error: null };
}

export async function deleteProduct(id: string) {
  const sb = createAdminClient();
  const { data: deleted } = await sb.from("products").select("category, slug").eq("id", id).single();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidateStorefront(deleted);
}

/**
 * Put a set of hand-picked products on sale at one percentage.
 *
 * Deliberately takes an explicit list of ids rather than a filter: a discount is a
 * commercial decision made per product in the dashboard, and an action that could be
 * handed "everything matching X" is one mis-click away from repricing the catalogue.
 *
 * Re-running this on rows that are already discounted is safe and idempotent — each row's
 * ORIGINAL price is recovered via `originalPriceOf` first, so moving a campaign from 20%
 * to 30% yields 30% off the original, not 30% off the already-cut price.
 */
export async function bulkSetDiscount(
  ids: string[],
  percent: number,
): Promise<{ updated: number; error: string | null }> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { updated: 0, error: "Select at least one product." };
  }
  if (!Number.isFinite(percent) || !Number.isInteger(percent)) {
    return { updated: 0, error: "Discount must be a whole number." };
  }
  if (percent < MIN_DISCOUNT_PERCENT || percent > MAX_DISCOUNT_PERCENT) {
    return {
      updated: 0,
      error: `Discount must be between ${MIN_DISCOUNT_PERCENT}% and ${MAX_DISCOUNT_PERCENT}%.`,
    };
  }

  const sb = createAdminClient();
  const { data: rows, error: readError } = await sb
    .from("products")
    .select("id, price, compare_at, category, slug")
    .in("id", ids);

  if (readError) return { updated: 0, error: readError.message };
  if (!rows || rows.length === 0) return { updated: 0, error: "No matching products found." };

  let updated = 0;
  const touched: { category: string | null; slug: string | null }[] = [];

  for (const row of rows) {
    const original = originalPriceOf(row);
    const next = priceAfterDiscount(original, percent);

    // A percentage too small to move an integer price leaves `next === original`, which
    // would write a compare_at equal to price — the exact inverted-looking row that
    // `isDiscounted` has to defend against downstream. Skip rather than store it.
    if (next >= original) continue;

    const { error } = await sb
      .from("products")
      .update({ price: next, compare_at: original })
      .eq("id", row.id);
    if (error) return { updated, error: error.message };

    updated += 1;
    touched.push({ category: row.category, slug: row.slug });
  }

  revalidatePath("/admin/products");
  for (const product of touched) revalidateStorefront(product);
  return { updated, error: null };
}

/**
 * End a sale on a set of products, restoring each one's original price.
 *
 * The inverse of `bulkSetDiscount`, and exact: because `compare_at` stores the untouched
 * original rather than a derived figure, ending a campaign returns the catalogue to the
 * precise prices it had beforehand — no rounding residue accumulating across campaigns.
 *
 * Rows that are not on sale are skipped, so this is safe to run over a mixed selection.
 */
export async function bulkClearDiscount(
  ids: string[],
): Promise<{ updated: number; error: string | null }> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { updated: 0, error: "Select at least one product." };
  }

  const sb = createAdminClient();
  const { data: rows, error: readError } = await sb
    .from("products")
    .select("id, price, compare_at, category, slug")
    .in("id", ids);

  if (readError) return { updated: 0, error: readError.message };
  if (!rows || rows.length === 0) return { updated: 0, error: "No matching products found." };

  let updated = 0;
  const touched: { category: string | null; slug: string | null }[] = [];

  for (const row of rows) {
    // Clears an inverted/equal compare_at too (isDiscounted is false for those), which is
    // the only route back for a row broken by the old Edit form.
    if (row.compare_at == null) continue;

    const { error } = await sb
      .from("products")
      .update({ price: originalPriceOf(row), compare_at: null })
      .eq("id", row.id);
    if (error) return { updated, error: error.message };

    updated += 1;
    touched.push({ category: row.category, slug: row.slug });
  }

  revalidatePath("/admin/products");
  for (const product of touched) revalidateStorefront(product);
  return { updated, error: null };
}
