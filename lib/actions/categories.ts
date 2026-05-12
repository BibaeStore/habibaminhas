"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";
import type { MegaMenu } from "@/lib/data";

const TONES = ["rose", "gold", "sage", "ink"] as const;

// ─── Nav menu ─────────────────────────────────────────────────────────────────

/** Builds the navbar MegaMenu[] directly from the DB categories.
 *  Called from app/layout.tsx (server component) — cached per request by React. */
export async function getNavMenu(): Promise<MegaMenu[]> {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("categories")
      .select("id, name, slug, parent_id, nav_href, image, seo_desc, sort_order, status, type")
      .eq("status", "active")
      .order("sort_order", { ascending: true });
    if (error || !data) return [];

    const topLevel = data.filter((r) => !r.parent_id && r.type === "main");

    return topLevel.map((parent, idx) => {
      const children = data.filter((r) => r.parent_id === parent.id);
      const parentHref = parent.nav_href || `/${parent.slug}`;

      const columnItems = [
        { label: `All ${parent.name}`, href: parentHref },
        ...children.map((c) => ({
          label: c.name,
          href: c.nav_href || parentHref,
        })),
      ];

      const menu: MegaMenu = {
        label: parent.name,
        href: parentHref,
        columns: [{ heading: parent.name, items: columnItems }],
      };

      if (parent.image) {
        menu.feature = {
          title: parent.name,
          subtitle: parent.seo_desc ?? "",
          href: parentHref,
          tone: TONES[idx % TONES.length],
          image: parent.image,
        };
      }

      return menu;
    });
  } catch {
    return [];
  }
}

// ─── Admin CRUD ──────────────────────────────────────────────────────────────

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
  revalidatePath("/", "layout");
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
  revalidatePath("/", "layout");
  return data;
}

export async function deleteCategory(id: string) {
  const sb = createAdminClient();
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}
