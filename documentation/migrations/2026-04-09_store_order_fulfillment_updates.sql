-- Store-facing fulfillment action history for seller order operations.
-- Keeps a durable timeline of status changes, tracking references, and
-- internal notes without overloading the base orders row.

begin;

create table if not exists public.order_fulfillment_updates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid not null references public.orders(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  status text not null,
  tracking_reference text null,
  note text null,
  created_by uuid null
);

create index if not exists idx_order_fulfillment_updates_order_created
  on public.order_fulfillment_updates (order_id, created_at desc);

create index if not exists idx_order_fulfillment_updates_store_created
  on public.order_fulfillment_updates (store_id, created_at desc);

commit;
