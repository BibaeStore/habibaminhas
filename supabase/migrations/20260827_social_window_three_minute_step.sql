-- Widen the posting window to the full evening peak and drop the step to 3 minutes.
--
-- Why
-- ---
-- The owner's requirement is a unique posting time on every day of a month. That is
-- arithmetic, not preference: 30 days needs at least 30 distinct clock times, and the step
-- is what decides how many a window contains.
--
--   18:30-21:30 @ 15 min ->  13 times   0% of 30-day stretches repeat-free
--   18:00-23:00 @ 15 min ->  21 times   0%
--   18:00-23:00 @  5 min ->  61 times  86%
--   18:00-23:00 @  3 min -> 101 times  100%   <- this migration
--
-- Widening the window alone never fixes it. A 5-hour window at 15-minute spacing holds 21
-- times, and 21 values cannot cover 30 days.
--
-- The cron tick is the real resolution limit: the route only decides whether a slot is due
-- when pg_cron wakes it, so a 19:37 draw published at the 19:45 tick. The step and the tick
-- therefore have to move together, which is why they are in one migration.
--
-- Cost: 480 wake-ups a day instead of 96. Each is an early exit -- read settings, check the
-- slot, answer "no_slot_due" -- so roughly 3 small queries, comfortably inside both the
-- Supabase and Vercel free tiers.

-- ---------------------------------------------------------------------------
-- The step belongs to the plan, not to a constant in the code.
--
-- Without this the planner previewed a window using a hardcoded default while the scheduler
-- used the value in social_settings, so the calendar could confidently show times that would
-- never fire. Storing it alongside the window makes a plan self-describing and lets
-- compilePlan carry it across, exactly as it already does for days and times.
--
-- Default 3, matching the cron tick set below: a plan created later must not silently
-- coarsen the live schedule back to 15-minute resolution.
-- ---------------------------------------------------------------------------
alter table public.social_plans
  add column if not exists photo_window_step_minutes int not null default 3;

alter table public.social_plans
  drop constraint if exists social_plans_photo_window_step;
alter table public.social_plans
  add constraint social_plans_photo_window_step check (
    photo_window_step_minutes between 1 and 240
  );

alter table public.social_settings
  alter column slot_window_step_minutes set default 3;

-- ---------------------------------------------------------------------------
-- The live values.
-- ---------------------------------------------------------------------------
update public.social_settings
   set slot_window_start = '18:00',
       slot_window_end   = '23:00',
       slot_window_step_minutes = 3,
       updated_at = now()
 where id = 1;

update public.social_plans
   set photo_window_start = '18:00',
       photo_window_end   = '23:00',
       photo_window_step_minutes = 3,
       updated_at = now()
 where is_active;

-- ---------------------------------------------------------------------------
-- The tick.
--
-- alter_job rather than unschedule + schedule: it changes the cadence while leaving the
-- command untouched, so the CRON_SECRET stays in the database and never has to be written
-- into a migration file that lives in git.
--
-- Only the photo scheduler moves. social-occasion-agent stays at */15 -- occasion greetings
-- publish at a fixed 10:00 and gain nothing from a finer tick.
-- ---------------------------------------------------------------------------
select cron.alter_job(
  job_id   := (select jobid from cron.job where jobname = 'social-post-slots'),
  schedule := '*/3 * * * *'
);
