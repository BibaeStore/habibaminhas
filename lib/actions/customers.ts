"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesUpdate } from "@/lib/supabase/types";

export async function getCustomers() {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCustomer(id: string, payload: TablesUpdate<"customers">) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("customers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/customers");
  return data;
}

export async function deleteCustomer(id: string) {
  const sb = createAdminClient();
  const { error } = await sb.from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/customers");
}

export async function getCustomerStats() {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("customers")
    .select("tier, total_spent, created_at");
  if (error) throw new Error(error.message);

  const thisMonth = new Date();
  thisMonth.setDate(1);

  type Row = { tier: string; total_spent: number; created_at: string };
  return {
    total: data.length,
    vip: data.filter((c: Row) => c.tier === "VIP").length,
    newThisMonth: data.filter((c: Row) => new Date(c.created_at) >= thisMonth).length,
    avgLifetimeValue:
      data.length > 0
        ? Math.round(data.reduce((s: number, c: Row) => s + c.total_spent, 0) / data.length)
        : 0,
  };
}
