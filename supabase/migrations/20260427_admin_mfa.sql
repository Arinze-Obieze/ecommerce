-- Plan D: Add MFA enrollment tracking columns to admin_users.
-- mfa_enrolled is the authoritative flag checked server-side on every admin request.
-- mfa_enrolled_at provides an audit timestamp.
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS mfa_enrolled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mfa_enrolled_at timestamptz NULL;
