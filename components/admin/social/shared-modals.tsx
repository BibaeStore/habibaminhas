"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check, Plus, Trash2, AlertTriangle, ExternalLink, Images, Clapperboard,
} from "lucide-react";
import { PlatformIcon, platformBrand } from "@/components/admin/platform-icons";
import { AdminButton } from "@/components/admin/ui/button";
import {
  fetchPlatforms, setPlatformEnabled, fetchCollaborators, addCollaborator,
  setCollaboratorEnabled, deleteCollaborator, fetchSocialSettings, saveSocialSettings,
  fetchPostableCategories,
  type SocialPlatformRow, type SocialCollaboratorRow, type SocialSettingsRow,
} from "@/lib/actions/social";
import {
  fetchPinterestStatus, startPinterestConnect, disconnectPinterest,
  listPinterestBoards, setPinterestBoard, createPinterestBoard,
} from "@/lib/actions/social-pinterest";
import { MAX_ENABLED_COLLABORATORS } from "@/lib/social/limits";
import {
  Field, Pill, Toggle, Modal, CategoryPicker, EmptyState, DayPicker, TimeList, inputCls,
} from "./ui";

/**
 * The three things posts and reels share.
 *
 * Platforms, collaborators and the posting rules govern *both* content types, so they
 * belong to neither page. They were previously a page of their own where the schedule sat
 * underneath two long scrolling lists — a setting nobody would ever find, because nothing
 * suggested anything existed below the collaborators.
 *
 * As modals from the header they are one click from anywhere, they cannot push the day's
 * work down the page, and the top level stays three pages rather than four.
 */

// ─── Platforms ────────────────────────────────────────────────────────────────

export function PlatformsModal({
  onClose, pending, onAct,
}: {
  onClose: () => void;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const { data: rows } = useQuery({ queryKey: ["social-platforms"], queryFn: fetchPlatforms });

  return (
    <Modal title="Where things publish" onClose={onClose} wide>
      <p className="mb-4 text-[13px] text-[var(--admin-text-muted)]">
        Photos and reels are switched on separately — they are genuinely different
        destinations. A dash means no adapter exists for that combination yet.
      </p>

      <PinterestConnection pending={pending} onAct={onAct} />

      {!rows ? (
        <EmptyState message="Loading…" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--admin-border)]">
                <th className="px-2 py-2 text-[13px] font-semibold text-[var(--admin-text-muted)]">
                  Platform
                </th>
                <th className="w-[120px] px-2 py-2 text-[13px] font-semibold text-[var(--admin-text-muted)]">
                  <span className="inline-flex items-center gap-1.5"><Images size={14} /> Photos</span>
                </th>
                <th className="w-[120px] px-2 py-2 text-[13px] font-semibold text-[var(--admin-text-muted)]">
                  <span className="inline-flex items-center gap-1.5"><Clapperboard size={14} /> Reels</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.key} className="border-b border-[var(--admin-border)] last:border-0">
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 ${
                          p.supports_photo || p.supports_video
                            ? "border-slate-300 bg-white"
                            : "border-slate-200 bg-slate-100"
                        }`}
                        style={
                          p.supports_photo || p.supports_video
                            ? { color: platformBrand(p.key) }
                            : undefined
                        }
                      >
                        <PlatformIcon
                          platform={p.key}
                          size={18}
                          className={p.supports_photo || p.supports_video ? "" : "text-slate-400 opacity-60"}
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-[var(--admin-text)]">{p.name}</p>
                        {p.handle && p.profile_url && (
                          <a
                            href={p.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[12px] text-[var(--admin-accent)]"
                          >
                            {p.handle} <ExternalLink size={10} />
                          </a>
                        )}
                        {!p.supports_photo && !p.supports_video && (
                          <span className="mt-0.5 inline-block"><Pill tone="muted">Not built yet</Pill></span>
                        )}
                      </div>
                    </div>
                  </td>
                  <MatrixCell platform={p} kind="photo" supports={p.supports_photo}
                    enabled={p.photo_enabled} pending={pending} onAct={onAct} />
                  <MatrixCell platform={p} kind="video" supports={p.supports_video}
                    enabled={p.video_enabled} pending={pending} onAct={onAct} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

function MatrixCell({
  platform, kind, supports, enabled, pending, onAct,
}: {
  platform: SocialPlatformRow;
  kind: "photo" | "video";
  supports: boolean;
  enabled: boolean;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const noun = kind === "video" ? "reels" : "photos";
  if (!supports) {
    return (
      <td className="px-2 py-2.5">
        <span
          className="text-[14px] text-slate-400"
          title={`${platform.name} cannot receive ${noun} yet — no adapter is written for it.`}
        >
          —
        </span>
      </td>
    );
  }
  return (
    <td className="px-2 py-2.5">
      <Toggle
        checked={enabled}
        disabled={pending}
        label={`Publish ${noun} to ${platform.name}`}
        onChange={(v) =>
          onAct(
            () => setPlatformEnabled(platform.key, kind, v),
            `${noun[0].toUpperCase()}${noun.slice(1)} ${v ? "on" : "off"} for ${platform.name}`,
          )
        }
      />
    </td>
  );
}

// ─── Pinterest connection ─────────────────────────────────────────────────────

/**
 * Pinterest is the first platform that must be *connected* rather than configured.
 *
 * Meta authenticates with a token in the environment and needs nothing on screen. Pinterest
 * is user OAuth, so there is a real connection with a real lifetime — and a board, because
 * Pinterest has no concept of posting without one. Both live here rather than in the matrix
 * row, since a toggle cannot express "signed in as @x, pinning to Y, expires in 27 days".
 */
function PinterestConnection({
  pending, onAct,
}: {
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const { data: status } = useQuery({
    queryKey: ["pinterest-status"],
    queryFn: fetchPinterestStatus,
  });
  const [picking, setPicking] = useState(false);
  const [newBoard, setNewBoard] = useState("");

  const { data: boards } = useQuery({
    queryKey: ["pinterest-boards"],
    queryFn: listPinterestBoards,
    enabled: picking && Boolean(status?.connected),
  });

  if (!status) return null;

  /*
   * Sandbox is loud on purpose. A sandbox pin succeeds and returns a real-looking permalink,
   * so nothing else on this screen would reveal that everything published is invisible to
   * the world. It exists only for recording the Standard-access demo video.
   */
  const sandboxBanner = status.sandbox ? (
    <div className="mb-4 rounded-xl border-2 border-rose-400 bg-rose-50 px-3 py-2.5">
      <p className="text-[13px] font-semibold text-rose-900">
        Pinterest is in SANDBOX mode — nothing published is real
      </p>
      <p className="mt-0.5 text-[12px] text-rose-800">
        Pins and boards created now exist only in Pinterest&rsquo;s sandbox and are visible to
        nobody. This is for recording the Standard-access demo video. Remove{" "}
        <code>PINTEREST_SANDBOX</code> from <code>.env.local</code> and restart the dev server
        to publish for real.
      </p>
    </div>
  ) : null;

  if (!status.configured) {
    return (
      <div className="mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2.5">
        <p className="text-[13px] font-semibold text-amber-900">Pinterest is not configured</p>
        <p className="mt-0.5 text-[12px] text-amber-800">
          Set <code>PINTEREST_APP_ID</code> and <code>PINTEREST_APP_SECRET</code> in
          <code> .env.local</code>, then restart the dev server.
        </p>
      </div>
    );
  }

  const daysLeft = status.daysUntilExpiry;

  return (
    <>
      {sandboxBanner}
      <div className="mb-4 rounded-xl border-2 border-slate-300 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white"
            style={{ color: platformBrand("pinterest") }}
          >
            <PlatformIcon platform="pinterest" size={18} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-[var(--admin-text)]">Pinterest</p>
            {status.connected ? (
              <p className="text-[12px] text-[var(--admin-text-muted)]">
                @{status.username}
                {status.boardName ? ` · pinning to “${status.boardName}”` : " · no board chosen"}
              </p>
            ) : (
              <p className="text-[12px] text-[var(--admin-text-muted)]">Not connected</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status.connected ? (
            <>
              <AdminButton
                size="sm" variant="outline" loading={pending}
                onClick={() => setPicking((v) => !v)}
              >
                {status.boardId ? "Change board" : "Choose board"}
              </AdminButton>
              <AdminButton
                size="sm" variant="ghost" loading={pending}
                onClick={() => onAct(() => disconnectPinterest(), "Pinterest disconnected")}
              >
                Disconnect
              </AdminButton>
            </>
          ) : (
            <AdminButton
              size="sm" loading={pending}
              onClick={() =>
                onAct(async () => {
                  const res = await startPinterestConnect();
                  if (!res.ok || !res.url) throw new Error(res.detail ?? "Could not start");
                  // Full navigation, not a new tab: Pinterest returns to the admin, and a
                  // popup would land the callback in a window the admin cannot see.
                  window.location.href = res.url;
                })
              }
            >
              Connect Pinterest
            </AdminButton>
          )}
        </div>
      </div>

      {status.connected && !status.boardId && (
        <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-700" />
          <p className="text-[12px] text-amber-800">
            Every pin must belong to a board, so nothing can publish until you choose one.
          </p>
        </div>
      )}

      {status.connected && daysLeft !== null && daysLeft < 5 && (
        <p className="mt-2 text-[12px] text-amber-800">
          The access token lapses in {daysLeft} day{daysLeft === 1 ? "" : "s"}. It refreshes
          itself automatically the next time anything publishes.
        </p>
      )}

      {picking && status.connected && (
        <div className="mt-3 border-t border-[var(--admin-border)] pt-3">
          {!boards ? (
            <p className="text-[13px] text-[var(--admin-text-muted)]">Loading boards…</p>
          ) : !boards.ok ? (
            <p className="text-[13px] text-red-800">{boards.detail}</p>
          ) : (
            <>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {(boards.boards ?? []).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() =>
                      onAct(async () => {
                        const res = await setPinterestBoard(b.id, b.name);
                        if (!res.ok) throw new Error(res.detail ?? "Could not save the board");
                        setPicking(false);
                      }, `Pinning to “${b.name}”`)
                    }
                    className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition hover:bg-slate-50 ${
                      b.id === status.boardId
                        ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/5"
                        : "border-[var(--admin-border)]"
                    }`}
                  >
                    <span className="text-[14px] text-[var(--admin-text)]">{b.name}</span>
                    <span className="text-[12px] text-[var(--admin-text-muted)]">
                      {b.pinCount} pins
                      {b.privacy !== "PUBLIC" && " · private"}
                    </span>
                  </button>
                ))}
                {(boards.boards ?? []).length === 0 && (
                  <p className="text-[13px] text-[var(--admin-text-muted)]">
                    No boards yet — create one below.
                  </p>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  className={`${inputCls} py-1.5 text-[13px]`}
                  placeholder="New board name, e.g. Stitched Suits"
                  value={newBoard}
                  onChange={(e) => setNewBoard(e.target.value)}
                />
                <AdminButton
                  size="sm" variant="outline" disabled={!newBoard.trim() || pending}
                  onClick={() =>
                    onAct(async () => {
                      const res = await createPinterestBoard(newBoard.trim());
                      if (!res.ok) throw new Error(res.detail ?? "Could not create the board");
                      setNewBoard("");
                      setPicking(false);
                    }, "Board created and selected")
                  }
                >
                  <Plus size={14} /> Create
                </AdminButton>
              </div>
            </>
          )}
        </div>
      )}
      </div>
    </>
  );
}

// ─── Collaborators ────────────────────────────────────────────────────────────

export function CollaboratorsModal({
  onClose, pending, onAct,
}: {
  onClose: () => void;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const { data: rows } = useQuery({
    queryKey: ["social-collaborators"],
    queryFn: fetchCollaborators,
  });
  const [adding, setAdding] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const enabledCount = (rows ?? []).filter((r) => r.enabled).length;

  if (adding) {
    return (
      <Modal
        title="Add collaborator"
        onClose={() => setAdding(false)}
        footer={
          <>
            <AdminButton variant="ghost" onClick={() => setAdding(false)}>Cancel</AdminButton>
            <AdminButton
              loading={pending}
              disabled={!username.trim()}
              onClick={() =>
                onAct(async () => {
                  await addCollaborator({ username, displayName });
                  setAdding(false);
                  setUsername("");
                  setDisplayName("");
                }, "Collaborator added — switch it on to start tagging")
              }
            >
              Add
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Instagram username" hint="A profile URL or @handle works too.">
            <input
              className={inputCls}
              placeholder="ummehabiba989"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="Label" hint="Only for your reference — never shown publicly.">
            <input
              className={inputCls}
              placeholder="Personal account"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Field>
          <p className="text-[13px] text-[var(--admin-text-muted)]">
            New collaborators start switched off, so adding one never changes the next post by
            surprise.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Instagram co-authors"
      onClose={onClose}
      wide
      footer={
        <AdminButton size="sm" leadingIcon={<Plus size={15} />} onClick={() => setAdding(true)}>
          Add collaborator
        </AdminButton>
      }
    >
      <p className="mb-3 text-[13px] leading-relaxed text-[var(--admin-text-muted)]">
        <strong>Instagram only</strong> — Facebook has no collaborator feature, so these never
        apply there. A tagged account receives an invite; once accepted the post appears on their
        profile too and both share one engagement count. Instagram allows{" "}
        <strong>{MAX_ENABLED_COLLABORATORS} per post</strong>. Applies to photo posts and reels
        alike.
      </p>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        <AlertTriangle size={15} className="shrink-0 text-amber-700" />
        <p className="text-[13px] text-amber-800">
          The account must have collaborator tagging enabled (Instagram → Settings → Tags and
          mentions), otherwise Meta drops the invite without an error.
        </p>
      </div>

      {!rows ? (
        <EmptyState message="Loading…" />
      ) : rows.length === 0 ? (
        <EmptyState message="No collaborators yet." hint="Add one to tag it as a co-author." />
      ) : (
        <div className="space-y-2">
          {rows.map((c: SocialCollaboratorRow) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-lg border border-[var(--admin-border)] px-3 py-2.5"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white"
                style={{ color: platformBrand(c.platform) }}
              >
                <PlatformIcon platform={c.platform} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`https://www.instagram.com/${c.username}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-semibold text-[var(--admin-text)] hover:underline"
                  >
                    @{c.username}
                  </a>
                  {c.enabled
                    ? <Pill tone="ok"><Check size={11} strokeWidth={3} /> On every post</Pill>
                    : <Pill tone="muted">Off</Pill>}
                </div>
                {c.display_name && (
                  <p className="text-[12px] text-[var(--admin-text-muted)]">{c.display_name}</p>
                )}
              </div>
              <Toggle
                checked={c.enabled}
                disabled={pending || (!c.enabled && enabledCount >= MAX_ENABLED_COLLABORATORS)}
                label={`Tag @${c.username} on new posts`}
                onChange={(v) =>
                  onAct(
                    () => setCollaboratorEnabled(c.id, v),
                    v ? `@${c.username} will be tagged` : `@${c.username} turned off`,
                  )
                }
              />
              <button
                onClick={() => onAct(() => deleteCollaborator(c.id), `@${c.username} removed`)}
                disabled={pending}
                aria-label={`Remove @${c.username}`}
                className="text-[var(--admin-text-muted)] transition hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ─── Posting rules ────────────────────────────────────────────────────────────

async function loadSettings() {
  const [settings, categories] = await Promise.all([
    fetchSocialSettings(),
    fetchPostableCategories(),
  ]);
  return { settings, categories };
}

/**
 * Posting times, days and the product rules.
 *
 * The **days** picker is the part that did not exist anywhere before. `slot_times` said
 * what time of day to post but nothing said which days, so every configured time fired
 * every single day — there was no way to express "four days a week" at all, which made any
 * weekly target impossible to hold to.
 */
export function SettingsModal({
  onClose, pending, onAct,
}: {
  onClose: () => void;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const { data } = useQuery({ queryKey: ["social-settings"], queryFn: loadSettings });
  const [draft, setDraft] = useState<SocialSettingsRow | null>(null);

  const current = draft ?? data?.settings ?? null;
  const set = <K extends keyof SocialSettingsRow>(key: K, value: SocialSettingsRow[K]) =>
    setDraft({ ...(current as SocialSettingsRow), [key]: value });

  if (!data || !current) {
    return (
      <Modal title="Posting rules" onClose={onClose} wide>
        <EmptyState message="Loading…" />
      </Modal>
    );
  }

  const perWeek = (current.post_days?.length ?? 0) * (current.slot_times?.length ?? 0);

  return (
    <Modal
      title="Posting rules"
      onClose={onClose}
      wide
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose}>Close</AdminButton>
          <AdminButton
            loading={pending}
            disabled={!draft}
            onClick={() =>
              onAct(async () => {
                await saveSocialSettings(draft as SocialSettingsRow);
                setDraft(null);
              }, "Settings saved")
            }
          >
            Save
          </AdminButton>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <h4 className="mb-1 text-[15px] font-semibold text-[var(--admin-text)]">
            When photos post
          </h4>
          <p className="mb-3 text-[13px] text-[var(--admin-text-muted)]">
            Every chosen time fires on every chosen day, in {current.timezone}. That is{" "}
            <strong>{perWeek} a week</strong>. An active plan sets these for you.
          </p>

          <Field label="Days">
            <DayPicker
              days={current.post_days ?? []}
              onChange={(d) => set("post_days", d)}
              disabled={pending}
            />
          </Field>

          <div className="mt-4">
            <Field label="Times">
              <TimeList
                times={current.slot_times}
                onChange={(t) => set("slot_times", t)}
                label="Posting time"
              />
            </Field>
          </div>
        </div>

        <div className="border-t border-[var(--admin-border)] pt-5">
          <h4 className="mb-3 text-[15px] font-semibold text-[var(--admin-text)]">
            When reels post
          </h4>
          <Field label="Days" hint="Reels run on their own cadence, separate from photos.">
            <DayPicker
              days={current.reel_days ?? []}
              onChange={(d) => set("reel_days", d)}
              disabled={pending}
            />
          </Field>
          <div className="mt-4">
            <Field label="Times">
              <TimeList
                times={current.reel_times ?? []}
                onChange={(t) => set("reel_times", t)}
                fallback="20:00"
                label="Reel time"
              />
            </Field>
          </div>
        </div>

        <div className="border-t border-[var(--admin-border)] pt-5">
          <h4 className="mb-3 text-[15px] font-semibold text-[var(--admin-text)]">
            Which products
          </h4>
          <Field label="Categories">
            <CategoryPicker
              categories={data.categories}
              selected={current.categories}
              onToggle={(slug) =>
                set(
                  "categories",
                  current.categories.includes(slug)
                    ? current.categories.filter((c) => c !== slug)
                    : [...current.categories, slug],
                )
              }
            />
          </Field>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Timezone">
              <input
                className={inputCls}
                value={current.timezone}
                onChange={(e) => set("timezone", e.target.value)}
              />
            </Field>
            <Field label="Daily ceiling" hint="Hard safety net.">
              <input
                type="number" min={1} max={20} className={inputCls}
                value={current.max_posts_per_day}
                onChange={(e) => set("max_posts_per_day", Number(e.target.value))}
              />
            </Field>
            <Field label="Minimum images">
              <input
                type="number" min={1} max={10} className={inputCls}
                value={current.min_images}
                onChange={(e) => set("min_images", Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 text-[14px] text-[var(--admin-text)]">
              <Toggle
                checked={current.require_in_stock}
                onChange={(v) => set("require_in_stock", v)}
                label="Only post in-stock products"
              />
              Only post products that are in stock
            </label>
            <label className="flex items-center gap-3 text-[14px] text-[var(--admin-text)]">
              <Toggle
                checked={current.approval_required}
                onChange={(v) => set("approval_required", v)}
                label="Hold photo posts for review"
              />
              Hold photo posts for review before publishing
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
