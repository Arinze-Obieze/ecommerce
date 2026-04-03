BEGIN;

ALTER TABLE public.store_payout_accounts
  ADD COLUMN IF NOT EXISTS recipient_status text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS verification_error text NULL,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz NULL;

UPDATE public.store_payout_accounts
SET
  recipient_status = CASE
    WHEN recipient_code IS NOT NULL AND recipient_code <> '' THEN 'recipient_created'
    ELSE 'unverified'
  END,
  last_verified_at = COALESCE(last_verified_at, verified_at, updated_at)
WHERE recipient_status IS NULL
   OR recipient_status = ''
   OR last_verified_at IS NULL;

COMMIT;
