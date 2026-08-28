"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Images, Image, Clapperboard, CalendarRange, Share2, Users, SlidersHorizontal,
  Power, Check, AlertTriangle, CalendarCheck, CalendarHeart,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminButton } from "@/components/admin/ui/button";
import { PageHeader } from "@/components/admin/ui/page-header";
import { fetchSocialSummary, type SocialSummary } from "@/lib/actions/social-summary";
import { fetchActivePlan } from "@/lib/actions/social-plans";
import { saveSocialSettings } from "@/lib/actions/social";
import { expandPlan, describePlan } from "@/lib/social/plan";
import { PAGE_PADDING, Pill, Modal, EmptyState, Toast } from "./ui";
import { PlatformsModal, CollaboratorsModal, SettingsModal } from "./shared-modals";
import { WeekCalendar, mondayOf, shiftWeek } from "./week-calendar";
import { useAct } from "./use-act";

/**
 * The frame every social page sits inside.
 *
 * One page per content stream, then Occasions and Planner. "Posts" was renamed to "Carousel"
 * and Static given its own page on 2026-08-28: the static stream was publishing correctly but
 * there was nowhere to see it, and nothing in the UI distinguished a carousel from a static.
 * Ordered the way the evening runs — reels first, then statics, then the carousel — with the
 * planning tools last.
 *
 * The things that
 * govern *both* content types (platforms, collaborators, posting rules) are header buttons
 * opening modals rather than a fourth page: they belong to neither side, they are touched
 * rarely, and as a page they buried the schedule underneath two long scrolling lists where
 * nothing suggested it existed.
 *
 * The active plan sits in the header too, on every page, because "which plan is running?"
 * is a question you have while looking at posts and reels — not one worth navigating away
 * to answer.
 */

const NAV = [
  { href: "/admin/social",           icon: Images,        label: "Carousel",  badge: "photos" },
  { href: "/admin/social/static",    icon: Image,         label: "Static",    badge: "static" },
  { href: "/admin/social/reels",     icon: Clapperboard,  label: "Reels",     badge: "reels"  },
  { href: "/admin/social/occasions", icon: CalendarHeart, label: "Occasions", badge: null     },
  { href: "/admin/social/planner",   icon: CalendarRange, label: "Planner",   badge: null     },
] as const;

type SharedModal = "platforms" | "collaborators" | "settings" | "plan" | null;

export function SocialChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { act, pending, notice, setNotice } = useAct();
  const [modal, setModal] = useState<SharedModal>(null);

  const { data: summary } = useQuery({
    queryKey: ["social-summary"],
    queryFn: fetchSocialSummary,
  });
  const { data: activePlan } = useQuery({
    queryKey: ["social-active-plan"],
    queryFn: fetchActivePlan,
  });

  function toggleAutomation() {
    if (!summary) return;
    act(async () => {
      await saveSocialSettings({ enabled: !summary.enabled });
      await queryClient.invalidateQueries();
    }, summary.enabled ? "Automation paused" : "Automation enabled");
  }

  return (
    <AdminShell>
      <div className={PAGE_PADDING}>
        <PageHeader
          title="Social automation"
          subtitle="Product posts and reels to Facebook and Instagram"
          actions={
            <AdminButton
              variant={summary?.enabled ? "danger" : "primary"}
              leadingIcon={<Power size={16} />}
              loading={pending}
              disabled={!summary}
              onClick={toggleAutomation}
            >
              {summary?.enabled ? "Pause automation" : "Enable automation"}
            </AdminButton>
          }
        />

        {/* ── Shared controls ─────────────────────────────────────────────── */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <PlanBadge plan={activePlan ?? null} onOpen={() => setModal("plan")} />
          <span className="mx-1 hidden h-5 w-px bg-[var(--admin-border)] sm:block" />
          <HeaderButton icon={<Share2 size={15} />} label="Platforms"
            onClick={() => setModal("platforms")} />
          <HeaderButton icon={<Users size={15} />} label="Collaborators"
            onClick={() => setModal("collaborators")} />
          <HeaderButton icon={<SlidersHorizontal size={15} />} label="Posting rules"
            onClick={() => setModal("settings")} />
        </div>

        <WeekStrip summary={summary} />

        {/* ── Three pages ─────────────────────────────────────────────────── */}
        <nav className="mb-5 flex flex-wrap gap-1 border-b border-[var(--admin-border)]">
          {NAV.map((item) => {
            // Posts is the index route, so it would otherwise match every child path.
            const active =
              item.href === "/admin/social"
                ? pathname === "/admin/social"
                : pathname.startsWith(item.href);
            const badge =
              item.badge === "photos" ? summary?.needsYou.photos ?? 0
              : item.badge === "reels" ? summary?.needsYou.reels ?? 0
              : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 px-5 py-3 text-[15px] font-medium transition ${
                  active
                    ? "border-b-2 border-[var(--admin-accent)] text-[var(--admin-text)]"
                    : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                }`}
              >
                <item.icon size={17} />
                {item.label}
                {badge > 0 && (
                  <span
                    title={`${badge} waiting for you`}
                    className="inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white"
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <Toast message={notice} onClose={() => setNotice(null)} />

        {children}
      </div>

      {modal === "platforms" && (
        <PlatformsModal onClose={() => setModal(null)} pending={pending} onAct={act} />
      )}
      {modal === "collaborators" && (
        <CollaboratorsModal onClose={() => setModal(null)} pending={pending} onAct={act} />
      )}
      {modal === "settings" && (
        <SettingsModal onClose={() => setModal(null)} pending={pending} onAct={act} />
      )}
      {modal === "plan" && (
        <PlanModal plan={activePlan ?? null} onClose={() => setModal(null)} />
      )}
    </AdminShell>
  );
}

function HeaderButton({
  icon, label, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-[var(--admin-bg)] px-3 py-1.5 text-[13px] font-medium text-[var(--admin-text)] transition hover:border-slate-400 hover:bg-slate-50"
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * Which plan is running, visible from every page.
 *
 * Deliberately styled as the one prominent, coloured control in the row: the plan governs
 * everything else on screen, and "no plan active" is a state worth noticing rather than
 * inferring from an empty calendar.
 */
function PlanBadge({
  plan, onOpen,
}: {
  plan: { name: string } | null;
  onOpen: () => void;
}) {
  if (!plan) {
    return (
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-1.5 rounded-lg border-2 border-amber-400 bg-amber-50 px-3 py-1.5 text-[13px] font-semibold text-amber-900 transition hover:bg-amber-100"
      >
        <AlertTriangle size={15} />
        No plan active
      </button>
    );
  }
  return (
    <button
      onClick={onOpen}
      title="See this week's plan"
      className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[var(--admin-accent)] bg-[var(--admin-accent)]/10 px-3 py-1.5 text-[13px] font-semibold text-[var(--admin-text)] transition hover:bg-[var(--admin-accent)]/20"
    >
      <CalendarCheck size={15} className="text-[var(--admin-accent)]" />
      Plan: {plan.name}
    </button>
  );
}

/** The active plan's week, without leaving the page you are on. */
function PlanModal({
  plan, onClose,
}: {
  plan: Parameters<typeof describePlan>[0] | null;
  onClose: () => void;
}) {
  const [weekStart, setWeekStart] = useState(() => mondayOf());

  if (!plan) {
    return (
      <Modal title="No plan is active" onClose={onClose}>
        <EmptyState
          message="Nothing is governing the schedule right now."
          hint="Create one on the Planner page and activate it — posting continues on the last saved times until you do."
        />
      </Modal>
    );
  }

  const weekEnd = shiftWeek(weekStart, 1);
  const items = expandPlan(plan, weekStart, weekEnd).map((s) => ({
    date: s.date,
    time: s.time,
    kind: s.kind,
  }));

  return (
    <Modal title={plan.name} onClose={onClose} wide>
      <p className="mb-4 text-[13px] text-[var(--admin-text-muted)]">{describePlan(plan)}</p>
      <WeekCalendar
        items={items}
        weekStart={weekStart}
        onShift={(w) => setWeekStart(w === "today" ? mondayOf() : shiftWeek(weekStart, w))}
        emptyHint="Nothing scheduled this week"
      />
      {plan.notes && (
        <p className="mt-4 rounded-lg border border-[var(--admin-border)] bg-slate-50 p-3 text-[13px] text-[var(--admin-text)]">
          {plan.notes}
        </p>
      )}
    </Modal>
  );
}

/** This week, in one line, on every page. */
function WeekStrip({ summary }: { summary: SocialSummary | undefined }) {
  if (!summary) {
    return (
      <div className="my-5 h-[76px] animate-pulse rounded-xl border border-[var(--admin-border)] bg-slate-100" />
    );
  }

  const waiting = summary.needsYou.photos + summary.needsYou.reels;
  const { failed } = summary.needsYou;

  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <AdminCard padded>
        <p className="text-[13px] text-[var(--admin-text-muted)]">Automation</p>
        <div className="mt-1">
          {summary.enabled
            ? <Pill tone="ok"><Check size={12} strokeWidth={3} /> Running</Pill>
            : <Pill tone="muted">Paused</Pill>}
        </div>
      </AdminCard>

      <ProgressCard label="Photos this week" done={summary.photos.published}
        target={summary.photos.target} />
      <ProgressCard label="Reels this week" done={summary.reels.published}
        target={summary.reels.target} />

      <AdminCard padded>
        <p className="text-[13px] text-[var(--admin-text-muted)]">Waiting for you</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {waiting === 0 && failed === 0 ? (
            <Pill tone="ok"><Check size={12} strokeWidth={3} /> Nothing — all clear</Pill>
          ) : (
            <>
              {waiting > 0 && (
                <Pill tone="warn"><AlertTriangle size={12} /> {waiting} to review</Pill>
              )}
              {failed > 0 && (
                <Pill tone="bad"><AlertTriangle size={12} /> {failed} failed</Pill>
              )}
            </>
          )}
        </div>
      </AdminCard>
    </div>
  );
}

function ProgressCard({
  label, done, target,
}: {
  label: string;
  done: number;
  target: number | null;
}) {
  const onTrack = target === null || done >= target;
  const pct = target && target > 0 ? Math.min(100, (done / target) * 100) : 0;

  return (
    <AdminCard padded>
      <p className="text-[13px] text-[var(--admin-text-muted)]">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-[var(--admin-text)]">
        {target === null ? (
          <>{done} <span className="font-normal text-[var(--admin-text-muted)]">published</span></>
        ) : (
          <>{done} <span className="font-normal text-[var(--admin-text-muted)]">of {target}</span></>
        )}
      </p>
      {target !== null && (
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"
          role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={target}
          aria-label={label}
        >
          <div
            className={`h-full rounded-full transition-all ${onTrack ? "bg-emerald-500" : "bg-amber-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </AdminCard>
  );
}
