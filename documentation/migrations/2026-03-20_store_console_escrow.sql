-- Store Console + Product Moderation + Escrow + Cart Demand
-- Date: 2026-03-20

BEGIN;

-- 1) Product moderation fields
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason text NULL,
  ADD COLUMN IF NOT EXISTS published_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_products_store_moderation_status
  ON public.products (store_id, moderation_status);

CREATE INDEX IF NOT EXISTS idx_products_is_active_moderation
  ON public.products (is_active, moderation_status);

-- Normalize existing products
UPDATE public.products
SET moderation_status = COALESCE(NULLIF(moderation_status, ''), 'approved')
WHERE moderation_status IS DISTINCT FROM COALESCE(NULLIF(moderation_status, ''), 'approved');

-- 2) Order escrow/fulfillment lifecycle fields
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS escrow_status text NOT NULL DEFAULT 'not_funded',
  ADD COLUMN IF NOT EXISTS buyer_confirmed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS escrow_funded_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS escrow_released_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS release_approved_by uuid NULL;

CREATE INDEX IF NOT EXISTS idx_orders_escrow_status
  ON public.orders (escrow_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status
  ON public.orders (fulfillment_status, created_at DESC);

-- 3) Escrow transactions
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  status text NOT NULL DEFAULT 'recorded',
  paystack_transfer_code text NULL,
  paystack_reference text NULL,
  approved_by uuid NULL,
  metadata jsonb NULL
);

CREATE INDEX IF NOT EXISTS idx_escrow_transactions_store_created
  ON public.escrow_transactions (store_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_escrow_transactions_order
  ON public.escrow_transactions (order_id);

CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status_type
  ON public.escrow_transactions (status, transaction_type);

-- 4) Store payout account details
CREATE TABLE IF NOT EXISTS public.store_payout_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  store_id uuid NOT NULL UNIQUE REFERENCES public.stores(id) ON DELETE CASCADE,
  account_name text NULL,
  account_number text NOT NULL,
  bank_code text NOT NULL,
  bank_name text NULL,
  recipient_code text NULL,
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  verified_at timestamptz NULL,
  created_by uuid NULL,
  updated_by uuid NULL
);

CREATE INDEX IF NOT EXISTS idx_store_payout_accounts_store
  ON public.store_payout_accounts (store_id);

-- 5) Payout releases / attempts
CREATE TABLE IF NOT EXISTS public.store_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  escrow_transaction_id uuid NULL REFERENCES public.escrow_transactions(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  paystack_reference text NOT NULL,
  paystack_transfer_code text NULL,
  approved_by uuid NULL,
  failure_reason text NULL,
  released_at timestamptz NULL,
  metadata jsonb NULL,
  UNIQUE(paystack_reference)
);

CREATE INDEX IF NOT EXISTS idx_store_payouts_store_status
  ON public.store_payouts (store_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_store_payouts_order
  ON public.store_payouts (order_id);

-- 6) Cart demand event snapshots (privacy-safe)
CREATE TABLE IF NOT EXISTS public.cart_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  user_id uuid NULL,
  session_id text NULL,
  product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id uuid NULL REFERENCES public.stores(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  metadata jsonb NULL
);

CREATE INDEX IF NOT EXISTS idx_cart_events_store_created
  ON public.cart_events (store_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cart_events_product_created
  ON public.cart_events (product_id, created_at DESC);

COMMIT;
