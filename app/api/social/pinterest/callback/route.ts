import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { exchangeCode, fetchAccount, adminBaseUrl } from "@/lib/social/adapters/pinterest";

/**
 * Where Pinterest sends the owner back after they approve the app.
 *
 * This is the one piece of this project that involves a human login. Meta needed none — a
 * System User token authenticates server-to-server forever — so nothing like this existed
 * until now. Pinterest, TikTok and every other non-Meta platform need it, which is why the
 * flow is written to be borrowed rather than Pinterest-specific in spirit.
 *
 * The route always redirects back into the admin with a readable message rather than
 * rendering anything. A blank page after an OAuth round trip tells the owner nothing about
 * whether it worked.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function back(message: string, ok: boolean): NextResponse {
  // Back to the admin on *this* server, not the public site — otherwise a flow started on
  // localhost finishes by throwing the owner at production.
  const url = new URL(`${adminBaseUrl()}/admin/social/`);
  url.searchParams.set(ok ? "connected" : "connect_error", message);
  return NextResponse.redirect(url);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const denied = url.searchParams.get("error");

  if (denied) return back(`Pinterest authorisation was declined (${denied}).`, false);
  if (!code) return back("Pinterest did not return an authorisation code.", false);

  const sb = createAdminClient();

  /*
   * `state` is checked against the value stored when the flow started. Without it, anyone
   * could hand the admin a crafted callback URL and attach *their* Pinterest account to
   * this store — the pins would then publish somewhere nobody here controls.
   */
  const { data: pending } = await sb
    .from("social_accounts")
    .select("id, meta")
    .eq("platform", "pinterest")
    .maybeSingle();

  const expectedState = (pending?.meta as { oauth_state?: string } | null)?.oauth_state;
  if (!expectedState || !state || state !== expectedState) {
    return back("That Pinterest sign-in did not match this session. Start again.", false);
  }

  try {
    const credentials = await exchangeCode(code);

    // Save the tokens before asking who they belong to — the profile lookup needs them.
    await sb
      .from("social_accounts")
      .update({ credentials: credentials as never, updated_at: new Date().toISOString() })
      .eq("id", pending!.id);

    const account = await fetchAccount();

    await sb
      .from("social_accounts")
      .update({
        external_id: account.username,
        account_label: `@${account.username}`,
        enabled: true,
        // Clear the one-time state, keep any board already chosen.
        meta: {
          ...((pending?.meta as Record<string, unknown>) ?? {}),
          oauth_state: null,
          username: account.username,
          profile_image: account.profileImage ?? null,
        } as never,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pending!.id);

    return back(`Pinterest connected as @${account.username}. Now choose a board.`, true);
  } catch (e) {
    return back((e as Error).message, false);
  }
}
