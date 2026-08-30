"use server";

import { createAdminClient } from "@/lib/supabase/server";

/**
 * Newsletter signups.
 *
 * The footer form previously wrote nowhere — it set a local flag, cleared the box and said
 * "Subscribed ✓". Every address ever entered was discarded.
 *
 * Uses the service-role client because `newsletter_subscribers` has RLS on with no policies:
 * the list should not be readable through the public anon key under any circumstances.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletter(
  rawEmail: string,
  source = "footer",
): Promise<{ ok: boolean; error?: string }> {
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  try {
    const sb = createAdminClient();
    /*
     * Upsert, not insert. Someone signing up twice is not an error worth showing them — and
     * `onConflict: email` also revives a previous unsubscribe rather than failing on the
     * unique index, which is what a person clicking Subscribe again plainly intends.
     */
    const { error } = await sb
      .from("newsletter_subscribers")
      .upsert(
        { email, source, unsubscribed_at: null },
        { onConflict: "email", ignoreDuplicates: false },
      );

    if (error) return { ok: false, error: "Could not subscribe. Please try again." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not subscribe. Please try again." };
  }
}
