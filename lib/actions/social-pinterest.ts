"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import {
  pinterestAuthUrl, getPinterestApp, fetchBoards, createBoard, fetchAccount,
  isPinterestSandbox,
  type PinterestBoard,
} from "@/lib/social/adapters/pinterest";

/**
 * Connecting Pinterest, and choosing where pins land.
 *
 * Kept apart from `social.ts` because this is the first platform with a *connection* rather
 * than a static credential: it can be linked, unlinked, expire, and needs a board chosen
 * before it can publish anything at all.
 */

export type PinterestStatus = {
  configured: boolean;
  connected: boolean;
  username: string | null;
  profileImage: string | null;
  boardId: string | null;
  boardName: string | null;
  /** ISO instant the access token lapses, for showing a warning before it does. */
  expiresAt: string | null;
  /**
   * Days until that happens, computed here rather than in the component.
   *
   * `Date.now()` during render is impure and the React Compiler rejects it — and the server
   * already knows the answer, so there is nothing to gain from asking the browser.
   */
  daysUntilExpiry: number | null;
  error: string | null;
  /**
   * Talking to the sandbox instead of the real Pinterest.
   *
   * Surfaced so the admin can say so loudly. A sandbox pin succeeds and returns a normal
   * permalink, so without this the screen is indistinguishable from real publishing while
   * nothing it creates is visible to anyone.
   */
  sandbox: boolean;
};

export async function fetchPinterestStatus(): Promise<PinterestStatus> {
  const configured = getPinterestApp() !== null;
  const sb = createAdminClient();

  const { data } = await sb
    .from("social_accounts")
    .select("external_id, credentials, meta")
    .eq("platform", "pinterest")
    .maybeSingle();

  const creds = (data?.credentials ?? {}) as { access_token?: string; expires_at?: string };
  const meta = (data?.meta ?? {}) as {
    username?: string;
    profile_image?: string;
    board_id?: string;
    board_name?: string;
  };

  const expiresAtMs = creds.expires_at ? Date.parse(creds.expires_at) : NaN;

  return {
    configured,
    connected: Boolean(creds.access_token),
    username: meta.username ?? data?.external_id ?? null,
    profileImage: meta.profile_image ?? null,
    boardId: meta.board_id ?? null,
    boardName: meta.board_name ?? null,
    expiresAt: creds.expires_at ?? null,
    daysUntilExpiry: Number.isFinite(expiresAtMs)
      ? Math.round((expiresAtMs - Date.now()) / 86_400_000)
      : null,
    error: configured
      ? null
      : "PINTEREST_APP_ID and PINTEREST_APP_SECRET are not set in the environment.",
    sandbox: isPinterestSandbox(),
  };
}

/**
 * Start the connect flow.
 *
 * The `state` is generated here and stored, so the callback can prove the response belongs
 * to a flow this admin actually started. The row is created now rather than on success, so
 * there is somewhere to keep it.
 */
export async function startPinterestConnect(): Promise<{ ok: boolean; url?: string; detail?: string }> {
  if (!getPinterestApp()) {
    return {
      ok: false,
      detail: "Set PINTEREST_APP_ID and PINTEREST_APP_SECRET in .env.local first.",
    };
  }

  const sb = createAdminClient();
  const state = randomUUID();

  const { data: existing } = await sb
    .from("social_accounts")
    .select("id, meta")
    .eq("platform", "pinterest")
    .maybeSingle();

  if (existing) {
    await sb
      .from("social_accounts")
      .update({
        meta: { ...((existing.meta as Record<string, unknown>) ?? {}), oauth_state: state } as never,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    const { error } = await sb.from("social_accounts").insert({
      platform: "pinterest",
      account_label: "Pinterest",
      external_id: "pending",
      enabled: false,
      credentials: {} as never,
      meta: { oauth_state: state } as never,
    });
    if (error) return { ok: false, detail: error.message };
  }

  return { ok: true, url: pinterestAuthUrl(state) };
}

/** Forget the connection. The tokens are dropped; the board choice goes with them. */
export async function disconnectPinterest(): Promise<void> {
  const sb = createAdminClient();
  await sb
    .from("social_accounts")
    .update({
      credentials: {} as never,
      meta: {} as never,
      enabled: false,
      external_id: "pending",
      account_label: "Pinterest",
      updated_at: new Date().toISOString(),
    })
    .eq("platform", "pinterest");

  // Switching it off for both content types too — a disconnected platform that is still
  // "enabled" would fail on every run with an error about a missing connection.
  await sb
    .from("social_platforms")
    .update({ photo_enabled: false, video_enabled: false, updated_at: new Date().toISOString() })
    .eq("key", "pinterest");

  revalidatePath("/admin/social");
}

export async function listPinterestBoards(): Promise<
  { ok: boolean; boards?: PinterestBoard[]; detail?: string }
> {
  try {
    return { ok: true, boards: await fetchBoards() };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

/** Choose the board every pin goes to. Required — Pinterest has no default. */
export async function setPinterestBoard(
  boardId: string,
  boardName: string,
): Promise<{ ok: boolean; detail?: string }> {
  const sb = createAdminClient();
  const { data: account } = await sb
    .from("social_accounts")
    .select("id, meta")
    .eq("platform", "pinterest")
    .maybeSingle();

  if (!account) return { ok: false, detail: "Pinterest is not connected." };

  const { error } = await sb
    .from("social_accounts")
    .update({
      meta: {
        ...((account.meta as Record<string, unknown>) ?? {}),
        board_id: boardId,
        board_name: boardName,
      } as never,
      updated_at: new Date().toISOString(),
    })
    .eq("id", account.id);

  if (error) return { ok: false, detail: error.message };
  revalidatePath("/admin/social");
  return { ok: true };
}

export async function createPinterestBoard(
  name: string,
): Promise<{ ok: boolean; detail?: string }> {
  try {
    const board = await createBoard(name, "Pakistani stitched suits by Habiba Minhas.");
    return await setPinterestBoard(board.id, board.name);
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

/** Prove the connection actually works, rather than trusting a stored token. */
export async function testPinterestConnection(): Promise<{ ok: boolean; detail: string }> {
  try {
    const account = await fetchAccount();
    const boards = await fetchBoards();
    return {
      ok: true,
      detail: `Connected as @${account.username} · ${boards.length} board${boards.length === 1 ? "" : "s"} visible.`,
    };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}
