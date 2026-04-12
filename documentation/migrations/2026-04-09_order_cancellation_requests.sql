-- Buyer-facing cancellation requests for post-checkout order handling.

begin;

create table if not exists public.order_cancellation_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  user_id uuid not null,
  status text not null default 'pending',
  reason text not null,
  resolution_note text null,
  reviewed_by uuid null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_order_cancellation_requests_user_created
  on public.order_cancellation_requests (user_id, created_at desc);

create index if not exists idx_order_cancellation_requests_status_created
  on public.order_cancellation_requests (status, created_at desc);

create or replace function public.touch_order_cancellation_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_order_cancellation_requests_updated_at
on public.order_cancellation_requests;

create trigger trg_touch_order_cancellation_requests_updated_at
before update on public.order_cancellation_requests
for each row
execute function public.touch_order_cancellation_requests_updated_at();

commit;
