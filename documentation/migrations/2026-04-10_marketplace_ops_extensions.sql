-- Marketplace operations extensions:
-- - returns and refund tracking
-- - durable notifications
-- - team invitation lifecycle
-- - review moderation, verified purchase, and seller replies
-- - payout reconciliation and exception tracking

begin;

create table if not exists public.order_return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  user_id uuid not null,
  store_id uuid null references public.stores(id) on delete set null,
  status text not null default 'pending',
  refund_status text not null default 'not_requested',
  reason text not null,
  requested_resolution text not null default 'refund',
  details text null,
  seller_note text null,
  buyer_note text null,
  admin_note text null,
  approved_at timestamptz null,
  approved_by uuid null,
  received_at timestamptz null,
  refund_amount numeric(12,2) null,
  refund_reference text null,
  refund_requested_at timestamptz null,
  refunded_at timestamptz null,
  refunded_by uuid null,
  reviewed_at timestamptz null,
  reviewed_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_order_return_requests_user_created
  on public.order_return_requests (user_id, created_at desc);

create index if not exists idx_order_return_requests_store_status
  on public.order_return_requests (store_id, status, created_at desc);

create index if not exists idx_order_return_requests_refund_status
  on public.order_return_requests (refund_status, created_at desc);

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  store_id uuid null references public.stores(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  action_url text null,
  entity_type text null,
  entity_id text null,
  status text not null default 'unread',
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_notifications_user_status_created
  on public.user_notifications (user_id, status, created_at desc);

create index if not exists idx_user_notifications_store_created
  on public.user_notifications (store_id, created_at desc);

create table if not exists public.store_team_invitations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  email text not null,
  role text not null default 'staff',
  status text not null default 'pending',
  invited_user_id uuid null,
  invited_by uuid null,
  accepted_by uuid null,
  setup_link text null,
  invite_message text null,
  sent_count integer not null default 1,
  sent_at timestamptz not null default now(),
  accepted_at timestamptz null,
  revoked_at timestamptz null,
  revoked_by uuid null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  audit_log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_store_team_invitations_store_status_created
  on public.store_team_invitations (store_id, status, created_at desc);

create unique index if not exists ux_store_team_invitations_store_email
  on public.store_team_invitations (store_id, email);

create index if not exists idx_store_team_invitations_email_status
  on public.store_team_invitations (lower(email), status);

alter table public.reviews
  add column if not exists status text not null default 'approved',
  add column if not exists is_verified_purchase boolean not null default false,
  add column if not exists purchase_order_id uuid null references public.orders(id) on delete set null,
  add column if not exists edited_at timestamptz null,
  add column if not exists deleted_at timestamptz null,
  add column if not exists moderation_note text null,
  add column if not exists moderated_at timestamptz null,
  add column if not exists moderated_by uuid null,
  add column if not exists seller_reply text null,
  add column if not exists seller_replied_at timestamptz null,
  add column if not exists seller_replied_by uuid null;

create unique index if not exists idx_reviews_product_user_unique_active
  on public.reviews (product_id, user_id)
  where deleted_at is null;

create index if not exists idx_reviews_product_status_created
  on public.reviews (product_id, status, created_at desc);

create index if not exists idx_reviews_user_created
  on public.reviews (user_id, created_at desc);

create table if not exists public.store_payout_reconciliations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  payout_id uuid null,
  escrow_transaction_id uuid null,
  status text not null default 'open',
  notes text not null,
  amount_expected numeric(12,2) null,
  amount_recorded numeric(12,2) null,
  resolved_at timestamptz null,
  resolved_by uuid null,
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_store_payout_reconciliations_store_status
  on public.store_payout_reconciliations (store_id, status, created_at desc);

create table if not exists public.store_payout_exceptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  payout_id uuid null,
  severity text not null default 'medium',
  status text not null default 'open',
  category text not null,
  summary text not null,
  details text null,
  assigned_to uuid null,
  resolved_at timestamptz null,
  resolved_by uuid null,
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_store_payout_exceptions_store_status
  on public.store_payout_exceptions (store_id, status, created_at desc);

create or replace function public.touch_marketplace_ops_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_order_return_requests_updated_at
on public.order_return_requests;

create trigger trg_touch_order_return_requests_updated_at
before update on public.order_return_requests
for each row
execute function public.touch_marketplace_ops_updated_at();

drop trigger if exists trg_touch_store_team_invitations_updated_at
on public.store_team_invitations;

create trigger trg_touch_store_team_invitations_updated_at
before update on public.store_team_invitations
for each row
execute function public.touch_marketplace_ops_updated_at();

drop trigger if exists trg_touch_store_payout_reconciliations_updated_at
on public.store_payout_reconciliations;

create trigger trg_touch_store_payout_reconciliations_updated_at
before update on public.store_payout_reconciliations
for each row
execute function public.touch_marketplace_ops_updated_at();

drop trigger if exists trg_touch_store_payout_exceptions_updated_at
on public.store_payout_exceptions;

create trigger trg_touch_store_payout_exceptions_updated_at
before update on public.store_payout_exceptions
for each row
execute function public.touch_marketplace_ops_updated_at();

commit;
