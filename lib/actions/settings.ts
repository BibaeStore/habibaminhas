"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesUpdate } from "@/lib/supabase/types";

export async function getSettings() {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateSettings(payload: TablesUpdate<"settings">) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("settings")
    .update(payload)
    .eq("id", 1)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
  return data;
}
