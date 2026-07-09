-- PostEx scheduled status poll (Phase 4)
--
-- PostEx has NO webhook: order status is pull-only. So Supabase's scheduler
-- calls our protected route every 15 minutes and we refresh every in-flight
-- consignment (status + COD settlement).
--
-- ⚠️ RUN THIS ONLY AFTER the app is deployed with /api/cron/postex-sync/ live,
--    and after CRON_SECRET is set in Vercel. Scheduling it against a URL that
--    does not exist yet just logs 404s every 15 minutes.
--
-- ⚠️ The trailing slash in the URL is REQUIRED (next.config.ts sets
--    trailingSlash: true). Without it the request 308-redirects and pg_net
--    does not follow redirects.
--
-- Replace <CRON_SECRET> with the value from .env.local / Vercel before running.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove any previous schedule of the same name (makes this re-runnable).
select cron.unschedule('postex-status-sync')
where exists (select 1 from cron.job where jobname = 'postex-status-sync');

select cron.schedule(
  'postex-status-sync',
  '*/15 * * * *',            -- every 15 minutes
  $$
  select net.http_post(
    url     := 'https://habibaminhas.com/api/cron/postex-sync/',
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'x-cron-secret', '<CRON_SECRET>'
               ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);

-- Useful checks:
--   select * from cron.job;                                  -- is it scheduled?
--   select * from cron.job_run_details order by start_time desc limit 10;  -- did it run?
--   select * from net._http_response order by created desc limit 10;       -- what did it return?
