-- Conversions API send-markers on orders.
--
-- WHY THESE EXIST
-- ---------------
-- The PostEx status poll is a cron that re-runs every few minutes over every in-flight
-- consignment. Without a marker, an order sitting in "delivered" would emit a delivery event
-- to Meta on every single pass -- inflating the very number this phase exists to make
-- trustworthy. These columns make each server-side send happen exactly once.
--
-- They are timestamps rather than booleans because "when did Meta learn about this?" is the
-- question worth answering when a number looks wrong.

alter table public.orders
  add column if not exists meta_capi_purchase_at  timestamptz,
  add column if not exists meta_capi_delivered_at timestamptz;

comment on column public.orders.meta_capi_purchase_at is
  'When the server-side Purchase event was accepted by the Meta Conversions API. Deduplicated against the browser pixel event by a shared event_id of purchase-{order_number}.';

comment on column public.orders.meta_capi_delivered_at is
  'When the OrderDelivered event was accepted by the Meta Conversions API. Set once, on the transition into delivered.';
