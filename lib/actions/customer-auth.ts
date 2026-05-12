"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/** Sign in an existing customer with email + password. */
export async function customerSignIn(
  email: string,
  password: string,
): Promise<{ error?: string; success?: boolean }> {
  if (!email || !password) return { error: "Email and password are required." };
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { success: true };
}

/** Register a new customer. Supabase Auth will send a confirmation email if
 *  email confirmations are enabled in the project. */
export async function customerSignUp(
  name: string,
  email: string,
  password: string,
): Promise<{ error?: string; success?: boolean; needsConfirmation?: boolean }> {
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const sb = await createClient();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) return { error: error.message };

  // If a session was created immediately, the trigger has linked the customers
  // row already and the user is logged in.
  if (data.session) return { success: true };
  return { success: true, needsConfirmation: true };
}

export async function customerSignOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/account/login");
}

/** Returns the authenticated user (email + id) or null. */
export async function getCustomerSession(): Promise<
  { id: string; email: string; name?: string } | null
> {
  const sb = await createClient();
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: (data.user.user_metadata as { full_name?: string } | null)?.full_name,
  };
}

/** Send a password-reset email. */
export async function customerForgotPassword(email: string): Promise<{ error?: string; success?: boolean }> {
  if (!email) return { error: "Email is required." };
  const sb = await createClient();
  const { error } = await sb.auth.resetPasswordForEmail(email);
  if (error) return { error: error.message };
  return { success: true };
}

/** Update the logged-in customer's password. */
export async function customerUpdatePassword(
  newPassword: string,
): Promise<{ error?: string; success?: boolean }> {
  if (!newPassword || newPassword.length < 8)
    return { error: "Password must be at least 8 characters." };
  const sb = await createClient();
  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { success: true };
}

/** Update the logged-in customer's display name (stored in auth.user metadata). */
export async function customerUpdateName(
  name: string,
): Promise<{ error?: string; success?: boolean }> {
  if (!name.trim()) return { error: "Name is required." };
  const sb = await createClient();
  const { error } = await sb.auth.updateUser({ data: { full_name: name.trim() } });
  if (error) return { error: error.message };
  return { success: true };
}
