"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_token";

function jwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET ?? "habiba-admin-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function adminLogin(email: string, password: string) {
  const sb = createAdminClient();

  const { data, error } = await sb.rpc("verify_admin_login", {
    p_email: email,
    p_password: password,
  });

  if (error) return { error: "Authentication failed. Please try again." };
  if (!data || data.length === 0) return { error: "Invalid email or password." };

  const admin = data[0] as { id: string; email: string; role: string; name: string };

  const token = await new SignJWT({ id: admin.id, email: admin.email, role: admin.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}

export async function getAdminSession() {
  const { jwtVerify } = await import("jose");
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    return payload as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

/** One-time setup: register the first super-admin */
export async function createFirstAdmin(name: string, email: string, password: string) {
  const sb = createAdminClient();

  const { count } = await sb
    .from("admin_users")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    return { error: "Admin already exists. Use the login page." };
  }

  const { error } = await sb.from("admin_users").insert({ name, email, role: "super_admin" });
  if (error) return { error: error.message };

  const { error: pwErr } = await sb.rpc("set_admin_password", {
    p_email: email,
    p_password: password,
  });
  if (pwErr) return { error: "Account created but password could not be set. Contact support." };

  return { success: true };
}
