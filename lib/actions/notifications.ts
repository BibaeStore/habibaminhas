"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Notification = {
  id: string;
  type: "new_order" | "order_updated" | "contact_form" | "low_stock" | string;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, unknown>;
  created_at: string;
};

export async function getNotifications(limit = 50): Promise<Notification[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Notification[];
}

export async function getUnreadCount(): Promise<number> {
  const sb = createAdminClient();
  const { count, error } = await sb
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false);
  if (error) return 0;
  return count ?? 0;
}

export async function markNotificationRead(id: string) {
  const sb = createAdminClient();
  await sb.from("notifications").update({ read: true }).eq("id", id);
  revalidatePath("/admin/notifications");
}

export async function markAllNotificationsRead() {
  const sb = createAdminClient();
  await sb.from("notifications").update({ read: true }).eq("read", false);
  revalidatePath("/admin/notifications");
}

export async function deleteNotification(id: string) {
  const sb = createAdminClient();
  await sb.from("notifications").delete().eq("id", id);
  revalidatePath("/admin/notifications");
}

export async function submitContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const sb = createAdminClient();
  const { error } = await sb.from("contact_messages").insert(data);
  if (error) throw new Error(error.message);
}
