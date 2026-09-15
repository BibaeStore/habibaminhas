-- Per-product free delivery.
--
-- Additive and non-destructive: a NOT NULL boolean with a false default, so every existing
-- row keeps today's behaviour (delivery charged at the standard rate) without a backfill.
--
-- Delivery is billed once per ORDER, not per item, so this column alone does not decide what
-- a customer pays. The rule chosen by the owner on 2026-09-16 is ALL-or-nothing: shipping is
-- waived only when every line in the bag is marked free_delivery. Any single normal item puts
-- the standard charge back. That is the one variant that cannot be gamed by adding a cheap
-- qualifying item to an otherwise full-price order. The rule itself lives in lib/shipping.ts.
alter table public.products
  add column if not exists free_delivery boolean not null default false;

comment on column public.products.free_delivery is
  'Ships free. Delivery is per-order, so the charge is only waived when EVERY item in the cart has this set - see lib/shipping.ts.';

-- Partial index: the storefront only ever asks "which products ship free", never the inverse,
-- and with the column defaulting to false this stays small.
create index if not exists products_free_delivery_idx
  on public.products (free_delivery)
  where free_delivery;
