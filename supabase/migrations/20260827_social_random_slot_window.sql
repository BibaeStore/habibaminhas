-- Randomised photo posting time, drawn from an evening window.
--
-- Why this exists
-- ---------------
-- Photos have gone out at exactly 19:00 every day since 18 Aug. That is not a Meta risk --
-- publishing through the official Graph API is the sanctioned path, Mosseri has stated
-- outright that scheduled posts are not down-ranked, and Meta's only documented ceiling is
-- 100 API-published posts per 24h. The reason to vary the time is different: a single fixed
-- slot only ever tests one hour of the day and only ever reaches the slice of the audience
-- awake for it.
--
-- Additive and reversible. Every column is nullable or defaulted, nothing is dropped, and
-- when `slot_window_start` / `slot_window_end` are NULL the scheduler behaves exactly as it
-- does today, reading the fixed `slot_times` list. The window is opt-in per row.
--
-- Nothing here touches the storefront: no pages, no metadata, no structured data, no
-- products table. `/admin/**` and `/api/**` only.

-- ---------------------------------------------------------------------------
-- social_settings — what the scheduler actually reads every 15 minutes.
-- ---------------------------------------------------------------------------
alter table public.social_settings
  -- Inclusive bounds of the window a daily time is drawn from, "HH:MM" in `timezone`.
  -- Both NULL  -> fixed `slot_times`, i.e. today's behaviour, unchanged.
  -- Both set   -> `slot_times` is ignored and one time per day is derived from the window.
  add column if not exists slot_window_start text,
  add column if not exists slot_window_end   text,
  -- Resolution of the draw. The pg_cron job ticks every 15 minutes, so a finer step than
  -- that cannot be honoured: a 19:37 draw would simply publish at the 19:45 tick. Kept as a
  -- column rather than a constant so raising the cron frequency later is a data change.
  add column if not exists slot_window_step_minutes int not null default 15;

-- "HH:MM" or nothing. A malformed bound would otherwise silently disable the window at
-- runtime with no indication of why, which is the failure mode this whole file exists to
-- avoid elsewhere.
alter table public.social_settings
  drop constraint if exists social_settings_slot_window_format;
alter table public.social_settings
  add constraint social_settings_slot_window_format check (
    (slot_window_start is null or slot_window_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
    and
    (slot_window_end   is null or slot_window_end   ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
  );

-- A step that does not divide the cron tick produces a grid the scheduler cannot hit.
alter table public.social_settings
  drop constraint if exists social_settings_slot_window_step;
alter table public.social_settings
  add constraint social_settings_slot_window_step check (
    slot_window_step_minutes between 1 and 240
  );

-- ---------------------------------------------------------------------------
-- social_plans — the planner, which COMPILES into social_settings.
--
-- This half is the point of the change, not an extra. `activatePlan` and `updatePlan` call
-- `writeScheduleFromPlan`, which overwrites `social_settings.slot_times` wholesale. Without
-- a window on the plan, the first time the owner touched the planner the window would be
-- silently wiped and posting would snap back to a fixed time with no error shown.
-- ---------------------------------------------------------------------------
alter table public.social_plans
  add column if not exists photo_window_start text,
  add column if not exists photo_window_end   text;

alter table public.social_plans
  drop constraint if exists social_plans_photo_window_format;
alter table public.social_plans
  add constraint social_plans_photo_window_format check (
    (photo_window_start is null or photo_window_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
    and
    (photo_window_end   is null or photo_window_end   ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
  );

-- ---------------------------------------------------------------------------
-- Seed the owner-approved window: 18:30-21:30 PKT, 15-minute grid.
--
-- Guarded on NULL so re-running this migration can never stamp over a window the owner has
-- since changed by hand.
-- ---------------------------------------------------------------------------
update public.social_settings
   set slot_window_start = '18:30',
       slot_window_end   = '21:30',
       slot_window_step_minutes = 15,
       updated_at = now()
 where id = 1
   and slot_window_start is null
   and slot_window_end is null;

-- The active plan has to agree, or the next save in the planner reverts the settings above.
update public.social_plans
   set photo_window_start = '18:30',
       photo_window_end   = '21:30',
       updated_at = now()
 where is_active
   and photo_window_start is null
   and photo_window_end is null;
