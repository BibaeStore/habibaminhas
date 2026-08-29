"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminCard } from "@/components/admin/ui/card";
import { fetchUpNext, fetchReels } from "@/lib/actions/social";
import { fetchPlans } from "@/lib/actions/social-plans";
import { listOccasionCalendar } from "@/lib/actions/social-occasions";
import { expandPlan } from "@/lib/social/plan";
import { WeekCalendar, mondayOf, shiftWeek, type CalendarItem } from "./week-calendar";

/**
 * The whole posting week, drawn the same way on every tab.
 *
 * It used to be built separately inside each page, and each one drew only its own stream —
 * so the Static tab showed carousels' seven-day cadence under a Static heading, and the
 * Reels tab showed neither of the others. The owner's point was that the calendar answers
 * one question, "what is going out and when", and that question does not change depending on
 * which tab you happen to be standing on. So there is now one component, and the colours do
 * the telling apart.
 *
 * Published posts are deliberately absent: they are the Published tab's job, and drawing
 * them here made a busy week unreadable.
 *
 * It runs on its own query key, and `useAct` invalidates every query after any action, so
 * re-ordering the queue or approving a reel redraws this immediately.
 */

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Monday and Wednesday", "Mon, Wed and Fri", "every day". */
function listDays(days: number[] | null | undefined): string {
  const sorted = [...new Set(days ?? [])].sort((a, b) => a - b);
  if (sorted.length === 0) return "no days";
  if (sorted.length === 7) return "every day";
  const names = sorted.map((d) => DAY_NAMES[d]);
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/** How many weeks ahead the calendar can be paged before it runs out of laid-out slots. */
const HORIZON_WEEKS = 8;

async function loadSchedule() {
  const [plans, carousel, statics, reels, occasions] = await Promise.all([
    fetchPlans(),
    fetchUpNext(40, "carousel"),
    fetchUpNext(40, "static"),
    fetchReels(100),
    listOccasionCalendar().catch(() => []),
  ]);
  return { plans, carousel, statics, reels, occasions };
}

export function ScheduleCalendar() {
  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const { data } = useQuery({ queryKey: ["social-schedule"], queryFn: loadSchedule });

  if (!data) {
    return (
      <AdminCard padded>
        <div className="h-[260px] animate-pulse rounded-lg bg-slate-100" />
      </AdminCard>
    );
  }

  const { plans, carousel, statics, reels, occasions } = data;
  /*
   * Every plan that covers any part of the horizon, not just the one active today.
   *
   * The August plan ends on the 31st and the September plan does not begin until the 1st, so
   * laying out only the active plan left next week blank — the owner clicked "next week" and
   * saw nothing, which reads as "nothing is scheduled" rather than "a different plan takes
   * over". expandPlan already clips each one to its own active_from/active_to, so laying out
   * all of them and concatenating gives an unbroken calendar across the handover.
   */
  const plan = plans.find((p) => p.is_active) ?? null;
  const today = new Date();
  const todayKey = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);

  const items: CalendarItem[] = [];

  {
    /*
     * Laid out across the whole horizon in one pass rather than per displayed week, so paging
     * forward cannot reshuffle which product lands on which day.
     */
    const approved = reels.filter((r) => r.status === "approved");
    const queues = { photo: carousel, static: statics };
    const used = { photo: 0, static: 0, reel: 0 };

    const horizonEnd = shiftWeek(mondayOf(), HORIZON_WEEKS);
    const laid = plans
      .flatMap((p) => expandPlan(p, todayKey, horizonEnd))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    for (const slot of laid) {
      if (slot.kind === "reel") {
        const reel = approved[used.reel++];
        items.push({
          date: slot.date,
          time: slot.time,
          kind: "reel",
          // Only something genuinely approved can be promised for a slot.
          label: reel ? (reel.kind === "upload" ? "Uploaded video" : "Approved reel") : "Nothing approved yet",
        });
      } else {
        const product = queues[slot.kind][used[slot.kind]++];
        items.push({
          date: slot.date,
          time: slot.time,
          kind: slot.kind,
          label: product?.title ?? null,
        });
      }
    }
  }

  // Occasion greetings come from their own agent, not the plan, so they are added separately.
  for (const o of occasions) {
    if (o.status === "cancelled" || o.status === "skipped") continue;
    const when = new Date(o.scheduled_for);
    items.push({
      date: o.occasion_date,
      time: new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", hour12: false,
      }).format(when),
      kind: "occasion",
      label: o.occasion_name,
    });
  }

  const dayIndex = today.getDay();
  const cadence: Array<{ noun: string; days: number[] | null }> = [
    { noun: "Carousels", days: plan?.photo_days ?? null },
    { noun: "Statics",   days: plan?.static_days ?? null },
    { noun: "Reels",     days: plan?.reel_days ?? null },
  ];

  return (
    <AdminCard padded>
      {!plan && (
        <div className="mb-4 rounded-lg border-2 border-amber-300 bg-amber-50 px-3 py-2.5">
          <p className="text-[13px] text-amber-900">
            No plan is active, so nothing is laid out. Create one on the Planner page —
            posting still runs on the saved times in the meantime.
          </p>
        </div>
      )}

      {plan && (
        <div className="mb-4 rounded-lg border border-[var(--admin-border)] bg-slate-50 px-3 py-2">
          <p className="text-[12.5px] leading-relaxed text-[var(--admin-text-muted)]">
            {cadence.map((c, i) => (
              <span key={c.noun}>
                {i > 0 && <span className="px-1.5 text-[var(--admin-border)]">·</span>}
                <span className="font-medium text-[var(--admin-text)]">{c.noun}</span>{" "}
                {listDays(c.days)}
                {c.days?.includes(dayIndex) ? "" : " (not today)"}
              </span>
            ))}
          </p>
        </div>
      )}

      <WeekCalendar
        items={items}
        weekStart={weekStart}
        onShift={(w) => setWeekStart(w === "today" ? mondayOf() : shiftWeek(weekStart, w))}
        emptyHint={plan ? "Nothing scheduled this week" : "No active plan"}
      />
    </AdminCard>
  );
}
