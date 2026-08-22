"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Clock, Plus, Trash2, Check, X, AlertTriangle, ExternalLink, Images, Clapperboard,
} from "lucide-react";
import { PlatformIcon, platformBrand } from "@/components/admin/platform-icons";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import {
  fetchSocialSettings, saveSocialSettings, fetchPlatforms, setPlatformEnabled,
  fetchCollaborators, addCollaborator, setCollaboratorEnabled, deleteCollaborator,
  fetchPostableCategories,
  type SocialSettingsRow, type SocialPlatformRow, type SocialCollaboratorRow,
} from "@/lib/actions/social";
import { MAX_ENABLED_COLLABORATORS } from "@/lib/social/limits";
import {
  Field, Pill, Toggle, Modal, CategoryPicker, SectionHeading, EmptyState, inputCls,
} from "@/components/admin/social/ui";
import { useAct } from "@/components/admin/social/use-act";

/**
 * Everything configured once and read by both content pages.
 *
 * Splitting the social admin into separate Photos and Reels pages creates one real risk:
 * that a setting governing both ends up defined twice and drifts. This page is the answer
 * — platforms, collaborators, posting times and product filters exist here and nowhere
 * else.
 */

async function load() {
  const [settings, platforms, collaborators, categories] = await Promise.all([
    fetchSocialSettings(),
    fetchPlatforms(),
    fetchCollaborators(),
    fetchPostableCategories(),
  ]);
  return { settings, platforms, collaborators, categories };
}

export default function SocialSettingsPage() {
  const { act, pending, notice, setNotice } = useAct();
  const { data, error } = useQuery({ queryKey: ["social-settings-page"], queryFn: load });

  if (error) {
    return (
      <AdminCard padded className="border-red-200 bg-red-50">
        <p className="text-[14px] text-red-800">{(error as Error).message}</p>
      </AdminCard>
    );
  }
  if (!data) return <EmptyState message="Loading…" />;

  return (
    <div className="space-y-8">
      {notice && (
        <AdminCard padded>
          <div className="flex items-start justify-between gap-3">
            <p className="text-[14px] text-[var(--admin-text)]">{notice}</p>
            <button onClick={() => setNotice(null)} aria-label="Dismiss"><X size={16} /></button>
          </div>
        </AdminCard>
      )}

      <section>
        <SectionHeading
          title="Where things publish"
          hint="Photos and reels are switched on separately — they are different destinations."
        />
        <PlatformMatrix rows={data.platforms} pending={pending} onAct={act} />
      </section>

      <section>
        <SectionHeading
          title="Instagram co-authors"
          hint="Instagram only. Facebook has no collaborator feature, so these never apply there."
        />
        <Collaborators rows={data.collaborators} pending={pending} onAct={act} />
      </section>

      <section>
        <SectionHeading title="Posting times and product rules" />
        <ScheduleSettings
          key={data.settings.updated_at}
          settings={data.settings}
          categories={data.categories}
          pending={pending}
          onAct={act}
        />
      </section>
    </div>
  );
}

// ─── Platform matrix ──────────────────────────────────────────────────────────

/**
 * One row per platform, one column per content type.
 *
 * Previously a single on/off switch per platform governed both photos and reels. That
 * cannot describe reality: TikTok takes video and not a static product post, so a shared
 * switch either sends photos somewhere they cannot go or blocks reels from somewhere they
 * can. The grid makes the distinction visible rather than something to remember.
 *
 * A cell is only interactive where an adapter exists. Where one does not, the cell says so
 * — an em dash and a tooltip — instead of offering a switch that would fail silently on
 * every run.
 */
function PlatformMatrix({
  rows, pending, onAct,
}: {
  rows: SocialPlatformRow[];
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  return (
    <AdminCard>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--admin-border)]">
              <th className="px-4 py-3 text-[13px] font-semibold text-[var(--admin-text-muted)]">
                Platform
              </th>
              <th className="w-[132px] px-4 py-3 text-[13px] font-semibold text-[var(--admin-text-muted)]">
                <span className="inline-flex items-center gap-1.5"><Images size={14} /> Photos</span>
              </th>
              <th className="w-[132px] px-4 py-3 text-[13px] font-semibold text-[var(--admin-text-muted)]">
                <span className="inline-flex items-center gap-1.5"><Clapperboard size={14} /> Reels</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const buildable = p.supports_photo || p.supports_video;
              return (
                <tr key={p.key} className="border-b border-[var(--admin-border)] last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 ${
                          buildable ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-100"
                        }`}
                        style={buildable ? { color: platformBrand(p.key) } : undefined}
                      >
                        <PlatformIcon
                          platform={p.key}
                          size={18}
                          className={buildable ? "" : "text-slate-400 opacity-60"}
                        />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-semibold text-[var(--admin-text)]">
                            {p.name}
                          </span>
                          {!buildable && <Pill tone="muted">Not built yet</Pill>}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[13px] text-[var(--admin-text-muted)]">
                          {p.description}
                        </p>
                        {p.handle && (
                          <p className="mt-1 text-[12px]">
                            {p.profile_url ? (
                              <a
                                href={p.profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[var(--admin-accent)]"
                              >
                                {p.handle} <ExternalLink size={11} />
                              </a>
                            ) : (
                              <span className="text-[var(--admin-text-muted)]">{p.handle}</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <MatrixCell
                    platform={p}
                    kind="photo"
                    supports={p.supports_photo}
                    enabled={p.photo_enabled}
                    pending={pending}
                    onAct={onAct}
                  />
                  <MatrixCell
                    platform={p}
                    kind="video"
                    supports={p.supports_video}
                    enabled={p.video_enabled}
                    pending={pending}
                    onAct={onAct}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminCard>
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
      <td className="px-4 py-3 align-middle">
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
    <td className="px-4 py-3 align-middle">
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

// ─── Collaborators ────────────────────────────────────────────────────────────

function Collaborators({
  rows, pending, onAct,
}: {
  rows: SocialCollaboratorRow[];
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const enabledCount = rows.filter((r) => r.enabled).length;

  return (
    <div className="space-y-3">
      <AdminCard padded>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--admin-text-muted)]">
            A tagged account receives an invite; once accepted the post appears on their profile
            too and both profiles share one engagement count. Instagram allows{" "}
            <strong>{MAX_ENABLED_COLLABORATORS} per post</strong> — keep as many accounts on file
            as you like and switch between them. Applies to both photo posts and reels.
          </p>
          <AdminButton size="sm" leadingIcon={<Plus size={15} />} onClick={() => setAdding(true)}>
            Add collaborator
          </AdminButton>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertTriangle size={15} className="shrink-0 text-amber-700" />
          <p className="text-[13px] text-amber-800">
            The account must have collaborator tagging enabled (Instagram → Settings → Tags and
            mentions), otherwise Meta drops the invite without an error.
          </p>
        </div>
      </AdminCard>

      {rows.length === 0 ? (
        <EmptyState message="No collaborators yet." hint="Add one to tag it as a co-author." />
      ) : (
        rows.map((c) => (
          <AdminCard key={c.id} padded>
            <div className="flex items-center gap-4">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white"
                style={{ color: platformBrand(c.platform) }}
              >
                <PlatformIcon platform={c.platform} size={18} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`https://www.instagram.com/${c.username}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] font-semibold text-[var(--admin-text)] hover:underline"
                  >
                    @{c.username}
                  </a>
                  {c.enabled
                    ? <Pill tone="ok"><Check size={11} strokeWidth={3} /> On every post</Pill>
                    : <Pill tone="muted">Off</Pill>}
                </div>
                {c.display_name && (
                  <p className="mt-0.5 text-[13px] text-[var(--admin-text-muted)]">{c.display_name}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-3">
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
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </AdminCard>
        ))
      )}

      {adding && (
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
      )}
    </div>
  );
}

// ─── Schedule + product rules ─────────────────────────────────────────────────

function ScheduleSettings({
  settings, categories, pending, onAct,
}: {
  settings: SocialSettingsRow;
  categories: Array<{ slug: string; name: string; liveProducts: number }>;
  pending: boolean;
  onAct: (fn: () => Promise<unknown>, message?: string) => void;
}) {
  const [draft, setDraft] = useState(settings);

  const set = <K extends keyof SocialSettingsRow>(key: K, value: SocialSettingsRow[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setSlot = (i: number, value: string) =>
    set("slot_times", draft.slot_times.map((s, idx) => (idx === i ? value : s)));

  const toggleCategory = (slug: string) =>
    set(
      "categories",
      draft.categories.includes(slug)
        ? draft.categories.filter((c) => c !== slug)
        : [...draft.categories, slug],
    );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AdminCard padded>
        <h3 className="mb-1 text-[16px] font-semibold text-[var(--admin-text)]">Posting times</h3>
        <p className="mb-4 text-[13px] text-[var(--admin-text-muted)]">
          One post per slot, in {draft.timezone}. Evening slots perform best for this audience.
        </p>

        <div className="space-y-2">
          {draft.slot_times.map((slot, i) => (
            <div key={i} className="flex items-center gap-2">
              <Clock size={16} className="shrink-0 text-[var(--admin-text-muted)]" />
              <input
                type="time"
                value={slot}
                onChange={(e) => setSlot(i, e.target.value)}
                className={`${inputCls} max-w-[160px]`}
                aria-label={`Posting time ${i + 1}`}
              />
              {draft.slot_times.length > 1 && (
                <button
                  onClick={() => set("slot_times", draft.slot_times.filter((_, idx) => idx !== i))}
                  aria-label={`Remove slot ${slot}`}
                  className="text-[var(--admin-text-muted)] transition hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => set("slot_times", [...draft.slot_times, "13:00"])}
          className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--admin-accent)]"
        >
          <Plus size={15} /> Add another slot
        </button>

        <div className="mt-5 grid gap-4 border-t border-[var(--admin-border)] pt-4 sm:grid-cols-2">
          <Field label="Timezone">
            <input
              className={inputCls}
              value={draft.timezone}
              onChange={(e) => set("timezone", e.target.value)}
            />
          </Field>
          <Field label="Hard daily ceiling" hint="Safety net — a scheduler misfire cannot exceed this.">
            <input
              type="number" min={1} max={20} className={inputCls}
              value={draft.max_posts_per_day}
              onChange={(e) => set("max_posts_per_day", Number(e.target.value))}
            />
          </Field>
        </div>
      </AdminCard>

      <AdminCard padded>
        <h3 className="mb-1 text-[16px] font-semibold text-[var(--admin-text)]">Which products</h3>
        <p className="mb-4 text-[13px] text-[var(--admin-text-muted)]">
          Live counts come straight from the catalogue. A category with no in-stock products
          contributes nothing.
        </p>

        <Field label="Categories">
          <CategoryPicker
            categories={categories}
            selected={draft.categories}
            onToggle={toggleCategory}
          />
        </Field>

        <div className="mt-5 grid gap-4 border-t border-[var(--admin-border)] pt-4 sm:grid-cols-2">
          <Field label="Products per post" hint="1 tells a clearer story than 2.">
            <input
              type="number" min={1} max={3} className={inputCls}
              value={draft.products_per_post}
              onChange={(e) => set("products_per_post", Number(e.target.value))}
            />
          </Field>
          <Field label="Minimum images" hint="Below 2, the post is a single image rather than a carousel.">
            <input
              type="number" min={1} max={10} className={inputCls}
              value={draft.min_images}
              onChange={(e) => set("min_images", Number(e.target.value))}
            />
          </Field>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 text-[14px] text-[var(--admin-text)]">
            <Toggle
              checked={draft.require_in_stock}
              onChange={(v) => set("require_in_stock", v)}
              label="Only post in-stock products"
            />
            Only post products that are in stock
          </label>
          {/*
            * Photo posts only. Reels are reviewed regardless of this setting, which is
            * deliberate: a bad photo caption is embarrassing, a bad reel is twelve seconds
            * of it.
            */}
          <label className="flex items-center gap-3 text-[14px] text-[var(--admin-text)]">
            <Toggle
              checked={draft.approval_required}
              onChange={(v) => set("approval_required", v)}
              label="Hold photo posts for review"
            />
            Hold photo posts for review before publishing
          </label>
        </div>

        <div className="mt-5">
          <AdminButton
            loading={pending}
            onClick={() => onAct(() => saveSocialSettings(draft), "Settings saved")}
          >
            Save settings
          </AdminButton>
        </div>
      </AdminCard>
    </div>
  );
}
