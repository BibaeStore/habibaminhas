-- Automated blog generation — scheduled from Supabase pg_cron.
--
-- Deliberately NOT Vercel Cron: the project is on Vercel's free plan, and this same
-- pg_net + pg_cron pattern already runs the PostEx status sync reliably.
--
-- ONE POST PER DAY, generated in two jobs 10 minutes apart:
--   phase=write  -> research + write + validate, saved as status='draft'
--   phase=image  -> illustrate the draft and flip it to 'published'
-- Splitting them keeps each HTTP request well inside a serverless function timeout,
-- and means a failed image never forces the expensive writing step to be redone.
--
-- Drafts are invisible to visitors and to Google: every read path on the site filters
-- status='published' (journal listing, post page, related articles, sitemap).
--
-- Schedule is UTC. Pakistan is UTC+5, so:
--   03:30 UTC = 08:30 PKT   write the day's post
--   03:40 UTC = 08:40 PKT   illustrate and publish it
--
-- ⚠️ RUN THIS ONLY AFTER the app is deployed with /api/cron/blog-generate/ live and
--    ANTHROPIC_API_KEY, OPENAI_API_KEY and CRON_SECRET are set in Vercel. Scheduling
--    against a route that does not exist yet just logs failures twice a day.
--
-- ⚠️ The trailing slash before the query string is REQUIRED (next.config.ts sets
--    trailingSlash: true). Without it the request 308-redirects and pg_net does not
--    follow redirects.
--
-- Replace <CRON_SECRET> with the value from Vercel before running.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Re-runnable: drop any previous schedule of the same names first.
select cron.unschedule('blog-write-morning')   where exists (select 1 from cron.job where jobname = 'blog-write-morning');
select cron.unschedule('blog-image-morning')   where exists (select 1 from cron.job where jobname = 'blog-image-morning');

-- ── The daily post ──────────────────────────────────────────────────────
select cron.schedule('blog-write-morning', '30 3 * * *', $$
  select net.http_post(
    url     := 'https://habibaminhas.com/api/cron/blog-generate/?phase=write',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<CRON_SECRET>'),
    body    := '{}'::jsonb,
    timeout_milliseconds := 300000
  );
$$);

select cron.schedule('blog-image-morning', '40 3 * * *', $$
  select net.http_post(
    url     := 'https://habibaminhas.com/api/cron/blog-generate/?phase=image',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<CRON_SECRET>'),
    body    := '{}'::jsonb,
    timeout_milliseconds := 300000
  );
$$);

-- ── Useful checks ─────────────────────────────────────────────────────────
-- List the schedules:
--   select jobname, schedule, active from cron.job where jobname like 'blog-%';
--
-- Recent run outcomes:
--   select j.jobname, r.status, r.return_message, r.start_time
--     from cron.job_run_details r join cron.job j on j.jobid = r.jobid
--    where j.jobname like 'blog-%' order by r.start_time desc limit 10;
--
-- Pause without deleting (e.g. to stop publishing for a week):
--   update cron.job set active = false where jobname like 'blog-%';
--
-- Any drafts stuck without an image (phase 2 failed):
--   select slug, created_at from journal_posts
--    where status = 'draft' and hero_image like 'PENDING::%';

