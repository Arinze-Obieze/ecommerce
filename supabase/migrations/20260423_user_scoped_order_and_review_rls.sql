-- User-scoped RLS coverage for buyer account/order/review flows.
-- This complements the broader security hardening sweep by protecting
-- tables that authenticated browser/server-session clients now use
-- directly instead of routing everything through the service role key.

begin;

alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;
alter table if exists public.reviews enable row level security;
alter table if exists public.user_addresses enable row level security;
alter table if exists public.order_shipping_addresses enable row level security;

drop policy if exists orders_owner_read on public.orders;
create policy orders_owner_read
on public.orders
for select
to authenticated
using (
  user_id = auth.uid()
);

drop policy if exists order_items_owner_read on public.order_items;
create policy order_items_owner_read
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders order_row
    where order_row.id = order_items.order_id
      and order_row.user_id = auth.uid()
  )
);

drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read
on public.reviews
for select
to anon, authenticated
using (
  status = 'approved'
  and deleted_at is null
);

drop policy if exists reviews_owner_read on public.reviews;
create policy reviews_owner_read
on public.reviews
for select
to authenticated
using (
  user_id = auth.uid()
);

drop policy if exists reviews_owner_insert on public.reviews;
create policy reviews_owner_insert
on public.reviews
for insert
to authenticated
with check (
  user_id = auth.uid()
);

drop policy if exists reviews_owner_update on public.reviews;
create policy reviews_owner_update
on public.reviews
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);

drop policy if exists user_addresses_owner_crud on public.user_addresses;
create policy user_addresses_owner_crud
on public.user_addresses
for all
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);

drop policy if exists order_shipping_addresses_owner_insert on public.order_shipping_addresses;
create policy order_shipping_addresses_owner_insert
on public.order_shipping_addresses
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.current_user_owns_order(order_id::text)
);

drop policy if exists order_shipping_addresses_owner_update on public.order_shipping_addresses;
create policy order_shipping_addresses_owner_update
on public.order_shipping_addresses
for update
to authenticated
using (
  user_id = auth.uid()
  and public.current_user_owns_order(order_id::text)
)
with check (
  user_id = auth.uid()
  and public.current_user_owns_order(order_id::text)
);

commit;
