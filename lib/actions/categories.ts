"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";
import type { MegaMenu } from "@/lib/data";

const TONES = ["rose", "gold", "sage", "ink"] as const;

// Map category slugs to route paths (handles legacy slug mismatches)
const CATEGORY_ROUTE_MAP: Record<string, string> = {
  "baby-products": "/baby/",
  "ladies-suits": "/ladies/",
  "kids-formal": "/kids/",
  "accessories": "/accessories/",
};

// ─── Nav menu ─────────────────────────────────────────────────────────────────

/** Builds the navbar MegaMenu[] directly from the DB categories.
 *  Supports 3 levels: main → sub (columns) → child (items in each column).
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

    // Level 1: top-level main categories
    const level1 = data.filter((r) => !r.parent_id && r.type === "main");

    return level1.map((parent, idx) => {
      const parentHref = parent.nav_href || CATEGORY_ROUTE_MAP[parent.slug] || `/${parent.slug}/`;

      // Level 2: direct children of this main category
      const level2 = data.filter((r) => r.parent_id === parent.id);

      let columns: MegaMenu["columns"];

      if (level2.length > 0) {
        // Check if any level-2 item has its own children (level 3)
        const level2WithChildren = level2.filter((l2) =>
          data.some((r) => r.parent_id === l2.id)
        );

        if (level2WithChildren.length > 0) {
          // 3-level layout: each level-2 becomes a column, its children are the items
          columns = level2.map((l2) => {
            const l2Href = l2.nav_href || `${parentHref}${l2.slug}/`;
            const children = data.filter((r) => r.parent_id === l2.id);
            return {
              heading: l2.name,
              items: [
                { label: `All ${l2.name}`, href: l2Href },
                ...children.map((c) => ({
                  label: c.name,
                  href: c.nav_href || `${l2Href}${c.slug}/`,
                })),
              ],
            };
          });
        } else {
          // 2-level: all subs go in one column
          columns = [{
            heading: parent.name,
            items: [
              { label: `All ${parent.name}`, href: parentHref },
              ...level2.map((c) => ({
                label: c.name,
                href: c.nav_href || `${parentHref}${c.slug}/`,
              })),
            ],
          }];
        }
      } else {
        // No subs — single column pointing to the parent
        columns = [{
          heading: parent.name,
          items: [{ label: `View all`, href: parentHref }],
        }];
      }

      const menu: MegaMenu = {
        label: parent.name,
        href: parentHref,
        columns,
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

export async function getMainCategories() {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("categories")
    .select("id, name, slug, sort_order")
    .is("parent_id", null)
    .eq("type", "main")
    .eq("status", "active")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getChildCategories(parentId: string) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("categories")
    .select("id, name, slug, sort_order")
    .eq("parent_id", parentId)
    .eq("status", "active")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCategoryBySlug(slug: string) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getCategoryById(id: string) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();
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
