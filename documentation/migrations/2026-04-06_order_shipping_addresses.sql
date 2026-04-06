-- Snapshot the delivery address used at checkout so each order keeps its own
-- immutable fulfillment address, even if the customer later edits or deletes
-- addresses from their account.

create table if not exists public.order_shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  user_id uuid not null,
  source_address_id uuid null references public.user_addresses(id) on delete set null,
  label text not null default 'Address',
  address_line1 text not null,
  address_line2 text null,
  city text not null,
  state text not null,
  postal_code text null,
  country text not null default 'Nigeria',
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_order_shipping_addresses_user_id
  on public.order_shipping_addresses(user_id);

create index if not exists idx_order_shipping_addresses_source_address_id
  on public.order_shipping_addresses(source_address_id);

create or replace function public.touch_order_shipping_addresses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_order_shipping_addresses_updated_at
on public.order_shipping_addresses;

create trigger trg_touch_order_shipping_addresses_updated_at
before update on public.order_shipping_addresses
for each row
execute function public.touch_order_shipping_addresses_updated_at();
