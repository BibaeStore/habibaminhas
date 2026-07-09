-- PostEx COD courier integration — additive, nullable columns only.
-- Existing columns are untouched; the manual courier/tracking_number flow keeps working.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS postex_tracking_number text,
  ADD COLUMN IF NOT EXISTS postex_status          text,
  ADD COLUMN IF NOT EXISTS postex_status_history  jsonb,
  ADD COLUMN IF NOT EXISTS postex_cod_amount      integer,
  ADD COLUMN IF NOT EXISTS postex_cod_settled     boolean,
  ADD COLUMN IF NOT EXISTS postex_settlement_date text,
  ADD COLUMN IF NOT EXISTS postex_cpr             text,
  ADD COLUMN IF NOT EXISTS postex_booked_at       timestamptz,
  ADD COLUMN IF NOT EXISTS postex_synced_at       timestamptz;

-- Fast lookup by PostEx tracking number (used by status sync poll).
CREATE INDEX IF NOT EXISTS idx_orders_postex_tracking_number
  ON public.orders (postex_tracking_number);
