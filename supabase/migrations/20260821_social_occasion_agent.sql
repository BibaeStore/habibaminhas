-- Occasion posting agent.
--
-- Additive and self-contained: two new tables, no change to social_settings,
-- social_media_queue, social_post_log or products. The existing 19:00 product rotation is
-- untouched and keeps running exactly as before. Published occasion posts are recorded in
-- social_post_log with slot = 'occasion', which is already how the 2026-08-21 Jumma post
-- was logged, so the admin history needs no new reader.

-- ---------------------------------------------------------------------------
-- social_occasions — the ALLOW-LIST.
--
-- The agent may only ever post for a row in this table. It is deliberately not a free
-- "search the web and post whatever today is" design: asked what 21 Aug 2026 was, web
-- search returned "International Day of Remembrance and Tribute to the Victims of
-- Terrorism". A clothing brand publishing a styled greeting against that is the failure
-- mode this table exists to make impossible.
-- ---------------------------------------------------------------------------
create table if not exists public.social_occasions (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  -- islamic | national | international | seasonal
  category     text not null,
  -- weekly  : every <weekday>
  -- fixed   : every year on <month>/<day>
  -- lunar   : date moves each year, resolved by web search a few days ahead
  recurrence   text not null,
  weekday      int,          -- 0=Sun … 5=Fri, for weekly and nth_weekday
  month        int,          -- 1-12, for fixed and nth_weekday
  day          int,          -- 1-31, for recurrence = fixed
  -- nth_weekday only: 2 = "second <weekday> of <month>". Mother's Day and Father's Day are
  -- defined this way and cannot be expressed as a fixed date.
  nth          int,
  -- Lunar only, keyed by year: {"2026":"2026-03-21"}. Written by the web-search resolver
  -- so a date the owner has already seen in the planner cannot silently move under them.
  resolved_dates jsonb not null default '{}'::jsonb,
  -- Headline rendered on the image, e.g. 'JUMMA MUBARAK'. Kept out of the model's hands
  -- so the greeting can never be misspelled on a brand asset.
  greeting     text not null,
  subtitle     text,
  -- Free-text art direction handed to the image step.
  theme        text,
  hashtags     text[] not null default '{}',
  enabled      boolean not null default true,
  -- Lower sorts first when two occasions land on the same date.
  priority     int not null default 100,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint social_occasions_category_check
    check (category = any (array['islamic','national','international','seasonal'])),
  constraint social_occasions_recurrence_check
    check (recurrence = any (array['weekly','fixed','lunar','nth_weekday'])),
  constraint social_occasions_weekly_needs_weekday
    check (recurrence <> 'weekly' or weekday between 0 and 6),
  constraint social_occasions_fixed_needs_date
    check (recurrence <> 'fixed' or (month between 1 and 12 and day between 1 and 31)),
  constraint social_occasions_nth_weekday_needs_parts
    check (
      recurrence <> 'nth_weekday'
      or (month between 1 and 12 and weekday between 0 and 6 and nth between 1 and 5)
    )
);

-- ---------------------------------------------------------------------------
-- social_occasion_posts — one row per planned post.
--
-- Planned ahead so the owner can see what is coming and intervene before it publishes.
-- `status` is the whole state machine:
--
--   planned  -> nothing generated yet, just a date the agent intends to fill
--   ready    -> image + caption exist and it WILL publish at scheduled_for
--   cancelled-> owner said no; the agent must never revive it
--   published/failed -> terminal
--
-- The owner chose "silence = publish", so `ready` publishes without an approval step.
-- `approved_at` records an explicit thumbs-up when given, but nothing waits for it.
-- ---------------------------------------------------------------------------
create table if not exists public.social_occasion_posts (
  id             uuid primary key default gen_random_uuid(),
  occasion_id    uuid references public.social_occasions(id) on delete set null,
  occasion_slug  text not null,
  occasion_name  text not null,
  occasion_date  date not null,
  -- 10:00 Asia/Karachi on occasion_date, stored UTC.
  scheduled_for  timestamptz not null,

  status         text not null default 'planned',

  -- The active ladies product whose photo the artwork is built from. Nullable so a plan
  -- can exist before a product is chosen, and set null rather than cascading if the
  -- product is ever deleted — the artwork is already rendered by then.
  product_id     uuid references public.products(id) on delete set null,

  image_url      text,
  image_prompt   text,
  caption_instagram text,
  caption_facebook  text,
  hashtags       text[] not null default '{}',

  regenerate_count int not null default 0,
  approved_at    timestamptz,
  published_at   timestamptz,
  platform_results jsonb,
  error          text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint social_occasion_posts_status_check
    check (status = any (array['planned','generating','ready','cancelled','publishing','published','failed','skipped'])),

  -- Idempotency. The cron runs every 15 minutes; without this it would re-plan the same
  -- occasion all day. This is the single guard that makes the agent safe to run often.
  constraint social_occasion_posts_unique_per_day unique (occasion_slug, occasion_date)
);

create index if not exists social_occasion_posts_due_idx
  on public.social_occasion_posts (status, scheduled_for);

create index if not exists social_occasion_posts_calendar_idx
  on public.social_occasion_posts (occasion_date desc);

-- Admin-only data. No anon/authenticated policies are added, so PostgREST exposes nothing;
-- every read and write goes through the service-role client in server actions, matching
-- how social_settings and social_post_log are already handled.
alter table public.social_occasions      enable row level security;
alter table public.social_occasion_posts enable row level security;
