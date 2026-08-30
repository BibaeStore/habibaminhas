-- The newsletter form has been collecting nothing.
--
-- `components/layout/newsletter.tsx` set a local `sent` flag, cleared the input and showed
-- "Subscribed ✓". No request was made and no row was written, so every address anyone has ever
-- typed into the footer is gone. This gives it somewhere to land.
--
-- RLS is on with NO policies, deliberately: the only writer is the server action, which uses
-- the service-role client and bypasses RLS. That means an email list cannot be harvested
-- through the public anon key even if a policy is added carelessly elsewhere later.

create table if not exists public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  -- Where they signed up, so a future form elsewhere is distinguishable from the footer.
  source          text not null default 'footer',
  created_at      timestamptz not null default now(),
  -- Set rather than deleting the row, so a resubscribe does not look like a fresh signup and
  -- an unsubscribe cannot be undone by accident.
  unsubscribed_at timestamptz
);

alter table public.newsletter_subscribers enable row level security;

create index if not exists newsletter_subscribers_created_at
  on public.newsletter_subscribers (created_at desc);

comment on table public.newsletter_subscribers is
  'Footer newsletter signups. Written only by the subscribeToNewsletter server action via the service-role client; RLS is enabled with no policies so the anon key can never read it.';
