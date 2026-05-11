"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export async function uploadCategoryImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return { url: null, error: "No file provided" };

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 60);
  const path = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;

  const sb = createAdminClient();
  const { error } = await sb.storage
    .from("assets")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { url: null, error: error.message };

  const { data: { publicUrl } } = sb.storage.from("assets").getPublicUrl(path);
  return { url: publicUrl, error: null };
}

export async function getFeaturedCategories() {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("categories")
    .select("id, name, slug, image, color, sort_order")
    .eq("type", "main")
    .eq("status", "active")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

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

export type NavChildDb = { label: string; href: string };
export type NavColumnDb = { heading: string; items: NavChildDb[] };
export type NavMenuDb = {
  label: string;
  href: string;
  columns: NavColumnDb[];
  feature?: {
    title: string;
    subtitle: string;
    href: string;
    image: string | null;
  };
};

/** Derive a nav menu structure from active categories. Top-level (parent_id=null,
 *  type='main') rows become menus; their children become a single column. */
export async function getNavMenu(): Promise<NavMenuDb[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("categories")
    .select("id, name, slug, parent_id, image, seo_desc, sort_order, status, type")
    .eq("status", "active")
    .order("sort_order", { ascending: true });
  if (error) return [];
  const rows = data ?? [];
  const topLevel = rows.filter((r) => !r.parent_id && r.type === "main");

  return topLevel.map((parent) => {
    const children = rows.filter((r) => r.parent_id === parent.id);
    const href = `/${parent.slug}`;
    const columnItems: NavChildDb[] = [
      { label: `All ${parent.name}`, href },
      ...children.map((c) => ({
        label: c.name,
        href: `/${parent.slug}/${c.slug}`,
      })),
    ];
    return {
      label: parent.name,
      href,
      columns: [{ heading: parent.name, items: columnItems }],
      feature: parent.image
        ? {
            title: parent.name,
            subtitle: parent.seo_desc ?? "",
            href,
            image: parent.image,
          }
        : undefined,
    };
  });
}
