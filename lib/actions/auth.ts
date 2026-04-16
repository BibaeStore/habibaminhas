"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function adminLogin(email: string, password: string) {
  const sb = await createClient();

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // Verify the user is actually an admin
  const adminSb = createAdminClient();
  const { data: admin } = await adminSb
    .from("admin_users")
    .select("id, role")
    .eq("id", data.user.id)
    .single();

  if (!admin) {
    await sb.auth.signOut();
    return { error: "Access denied. This account is not an admin." };
  }

  return { success: true };
}

export async function adminLogout() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/admin/login");
}

export async function getAdminSession() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

/** One-time setup: register the first super-admin */
export async function createFirstAdmin(name: string, email: string, password: string) {
  const adminSb = createAdminClient();

  // Check if any admin exists already
  const { count } = await adminSb
    .from("admin_users")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    return { error: "Admin already exists. Use the login page." };
  }

  // Create auth user
  const { data, error } = await adminSb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error) return { error: error.message };

  // Add to admin_users table
  const { error: adminError } = await adminSb
    .from("admin_users")
    .insert({ id: data.user.id, name, email, role: "super_admin" });
  if (adminError) return { error: adminError.message };

  return { success: true };
}
