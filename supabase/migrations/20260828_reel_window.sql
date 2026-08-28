-- Reels get their own randomised window, and their own days.
--
-- Photos moved off a fixed 19:00 on 2026-08-27; reels stayed pinned at 20:00 every Monday and
-- Friday. The owner asked why, and the honest answer was that I had treated the reel schedule
-- as fixed background and built a collision guard around it without ever asking. A reel at
-- exactly 20:00 on the same two weekdays for months is a more visible pattern than the photo
-- one ever was.
--
-- Mirrors the photo window exactly -- same columns, same meaning, same code path -- so there
-- is one mechanism to understand rather than two that drift.
--
-- 18:00-20:00 rather than the photo window's 20:00-23:00, and that separation is deliberate:
-- disjoint windows make a photo/reel clash *structurally impossible* rather than something a
-- guard has to keep fixing. It also matches the reel research already recorded in
-- 03-CONTENT-AND-SCHEDULE.md -- an earlier reel gets a couple of hours to be indexed before
-- peak traffic.

alter table public.social_settings
  add column if not exists reel_window_start text,
  add column if not exists reel_window_end   text,
  add column if not exists reel_window_step_minutes int not null default 5;

alter table public.social_settings
  drop constraint if exists social_settings_reel_window_format;
alter table public.social_settings
  add constraint social_settings_reel_window_format check (
    (reel_window_start is null or reel_window_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
    and
    (reel_window_end   is null or reel_window_end   ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
  );

-- The planner compiles into social_settings, so without these the first plan save would wipe
-- the reel window exactly as it would have wiped the photo one.
alter table public.social_plans
  add column if not exists reel_window_start text,
  add column if not exists reel_window_end   text,
  add column if not exists reel_window_step_minutes int not null default 5;

alter table public.social_plans
  drop constraint if exists social_plans_reel_window_format;
alter table public.social_plans
  add constraint social_plans_reel_window_format check (
    (reel_window_start is null or reel_window_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
    and
    (reel_window_end   is null or reel_window_end   ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
  );
