-- The third content stream: a single-image post. 2 a week, Mon and Wed.
--
-- THE COLLISION THIS FIXES
-- ------------------------
-- `slotAlreadyRan` in window mode asks "has ANY clock-time slot published today?", because a
-- window produces exactly one slot per day and its name is *derived* -- so an exact-name match
-- would let an edited window publish twice. That is correct for one stream and silently fatal
-- for two: a carousel at 21:40 would make the static post look already-done and skip it, every
-- Monday and Wednesday, with no error anywhere. The log now records which stream a row came
-- from and the guard is scoped to it.

alter table public.social_post_log
  add column if not exists stream text not null default 'carousel';

update public.social_post_log set stream = 'carousel' where stream is null;

create index if not exists social_post_log_stream_created
  on public.social_post_log (stream, created_at desc);

-- Its own rotation tracker. A separate table rather than a `stream` column on
-- social_queue_order because the two rotations must sit at different points in the catalogue --
-- that is the whole reason the owner asked for separate trackers.
create table if not exists public.social_static_order (
  product_id uuid primary key references public.products(id) on delete cascade,
  position   int not null,
  updated_at timestamptz not null default now()
);

-- Schedule: same shape as photos and reels. 18:00-20:00 on Mon and Wed -- the two days with no
-- reel, in the window reels vacate on those days. So a static never competes with a reel, and
-- the carousel keeps 20:15-23:00 throughout.
alter table public.social_settings
  add column if not exists static_days int[] not null default '{1,3}',
  add column if not exists static_times text[] not null default '{18:30}',
  add column if not exists static_window_start text,
  add column if not exists static_window_end   text,
  add column if not exists static_window_step_minutes int not null default 5;

alter table public.social_settings
  drop constraint if exists social_settings_static_window_format;
alter table public.social_settings
  add constraint social_settings_static_window_format check (
    (static_window_start is null or static_window_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
    and
    (static_window_end   is null or static_window_end   ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
  );

alter table public.social_plans
  add column if not exists statics_per_week int not null default 2,
  add column if not exists static_days int[] not null default '{1,3}',
  add column if not exists static_times text[] not null default '{18:30}',
  add column if not exists static_window_start text,
  add column if not exists static_window_end   text,
  add column if not exists static_window_step_minutes int not null default 5;

alter table public.social_plans
  drop constraint if exists social_plans_static_window_format;
alter table public.social_plans
  add constraint social_plans_static_window_format check (
    (static_window_start is null or static_window_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
    and
    (static_window_end   is null or static_window_end   ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
  );

-- Live values, and the ceiling that has to move with them.
--
-- max_posts_per_day was 2. countToday counts one group per logical post, so a Monday now
-- carries a carousel AND a static -- exactly 2 -- and `today >= cap` would have blocked
-- whichever ran second. A Friday carries a carousel and a Jumma greeting, also 2. Raised to 4:
-- still a real safety net against a scheduler misfire, but no longer tripping on the schedule
-- it is meant to allow.
update public.social_settings set
  static_window_start = '18:00',
  static_window_end   = '20:00',
  static_window_step_minutes = 5,
  static_days = '{1,3}',
  max_posts_per_day = 4,
  updated_at = now()
where id = 1;

update public.social_plans set
  statics_per_week = 2,
  static_days = '{1,3}',
  static_window_start = '18:00',
  static_window_end   = '20:00',
  static_window_step_minutes = 5,
  updated_at = now()
where is_active;
