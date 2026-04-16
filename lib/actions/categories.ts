"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export async function getCategories() {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createCategory(payload: TablesInsert<"categories">) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("categories")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  return data;
}

export async function updateCategory(id: string, payload: TablesUpdate<"categories">) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  return data;
}

export async function deleteCategory(id: string) {
  const sb = createAdminClient();
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
}
