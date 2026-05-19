"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";
import { emitLowStockNotifications } from "@/lib/actions/inventory";
import { LOW_STOCK_THRESHOLD } from "@/lib/inventory-constants";

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
}) {
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

export async function getProductBySlug(slug: string) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getProductsBySlugs(slugs: string[]) {
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
  revalidatePath("/shop");
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
  revalidatePath("/shop");
  return { data, error: null };
}

export async function deleteProduct(id: string) {
  const sb = createAdminClient();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
