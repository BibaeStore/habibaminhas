-- Step back from a 3-minute tick to 5, without losing the guarantee.
--
-- 3 minutes met the spacing requirement but sat below a hard safety line: the posting route
-- declares maxDuration = 300s, so a tick shorter than five minutes can fire while the previous
-- invocation is still uploading. The duplicate guard only becomes effective once the first
-- log row is written, which happens after Instagram publishing completes (~50s in live data).
-- At */3 that leaves a real window for a double post; at */5 or slower the platform's own
-- 300s ceiling makes overlap impossible.
--
-- Five minutes was previously rejected because the old algorithm gave only an 86% chance of a
-- repeat-free month at N=61. That was an algorithm limit, not an arithmetic one, and it has
-- been fixed: cycles are now chained under a displacement bound, so the minimum gap is 37 days
-- and no rolling 30-day stretch contains a repeated time. Measured over 10 years:
--
--   18:00-23:00 @5m   N=61   minGap=37   30-day stretches with a repeat: 0   reel clashes: 0
--
-- So the safer tick and the requirement are no longer in tension.

alter table public.social_settings
  alter column slot_window_step_minutes set default 5;

alter table public.social_plans
  alter column photo_window_step_minutes set default 5;

update public.social_settings
   set slot_window_start = '18:00',
       slot_window_end   = '23:00',
       slot_window_step_minutes = 5,
       updated_at = now()
 where id = 1;

update public.social_plans
   set photo_window_start = '18:00',
       photo_window_end   = '23:00',
       photo_window_step_minutes = 5,
       updated_at = now()
 where is_active;

-- The tick and the step must always move together: the scheduler only asks whether a slot is
-- due when the job wakes it, so a 5-minute grid needs a 5-minute tick or every draw rounds up.
select cron.alter_job(
  job_id   := (select jobid from cron.job where jobname = 'social-post-slots'),
  schedule := '*/5 * * * *'
);
