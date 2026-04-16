"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export async function getProducts(filters?: {
  category?: string;
  subcategory?: string;
  subtype?: string;
  status?: string;
  featured?: boolean;
}) {
  const sb = createAdminClient();
  let q = sb.from("products").select("*").order("created_at", { ascending: false });

  if (filters?.category)    q = q.eq("category",    filters.category);
  if (filters?.subcategory) q = q.eq("subcategory", filters.subcategory);
  if (filters?.subtype)     q = q.eq("subtype",     filters.subtype);
  if (filters?.status)      q = q.eq("status",      filters.status);
  if (filters?.featured)    q = q.eq("featured",    true);

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

export async function createProduct(payload: TablesInsert<"products">) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("products")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return data;
}

export async function updateProduct(id: string, payload: TablesUpdate<"products">) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return data;
}

export async function deleteProduct(id: string) {
  const sb = createAdminClient();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
