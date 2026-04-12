BEGIN;

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'stores_low_stock_threshold_nonnegative'
  ) THEN
    ALTER TABLE public.stores
      ADD CONSTRAINT stores_low_stock_threshold_nonnegative
      CHECK (low_stock_threshold >= 0);
  END IF;
END $$;

COMMENT ON COLUMN public.stores.low_stock_threshold IS
  'Store-level stock quantity at or below which a product is considered low stock.';

COMMIT;
