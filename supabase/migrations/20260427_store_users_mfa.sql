-- Plan D (extended): Add MFA enrollment tracking to store_users so that
-- store owners, managers, and staff can enrol TOTP in the same pattern as admins.
ALTER TABLE public.store_users
  ADD COLUMN IF NOT EXISTS mfa_enrolled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mfa_enrolled_at timestamptz NULL;
