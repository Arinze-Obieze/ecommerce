-- 1. Add auto_activated flag so the UI can distinguish cron activation from seller activation
ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS auto_activated BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Schedule pg_cron job (requires pg_cron extension enabled in Supabase dashboard)
--    Runs every 5 minutes. Sets is_active + auto_activated on approved promotions
--    whose start time has arrived but were never manually activated by the seller.
SELECT cron.schedule(
  'auto-activate-promotions',   -- job name (unique)
  '*/5 * * * *',                -- every 5 minutes
  $$
    UPDATE promotions
    SET
      is_active      = TRUE,
      auto_activated = TRUE
    WHERE
      approved_by_zova = TRUE
      AND is_active    = FALSE
      AND starts_at   <= NOW()
      AND (ends_at IS NULL OR ends_at > NOW());
  $$
);
