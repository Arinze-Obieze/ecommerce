-- Capture delivered_at on orders for review-window enforcement.
-- Reviews are allowed within REVIEW_WINDOW_DAYS (90) of first delivery.

begin;

alter table public.orders
  add column if not exists delivered_at timestamptz null;

-- Set delivered_at the first time fulfillment_status transitions to 'delivered'.
create or replace function public.set_order_delivered_at()
returns trigger
language plpgsql
as $$
begin
  if new.fulfillment_status = 'delivered'
     and (old.fulfillment_status is distinct from 'delivered')
     and new.delivered_at is null
  then
    new.delivered_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_order_delivered_at on public.orders;
create trigger trg_set_order_delivered_at
  before update on public.orders
  for each row
  execute function public.set_order_delivered_at();

-- Backfill existing delivered/delivered_confirmed orders.
-- Prefer the earliest 'delivered' record in order_fulfillment_updates;
-- fall back to buyer_confirmed_at for orders confirmed before this migration.
update public.orders o
set delivered_at = coalesce(
  (
    select u.created_at
    from   public.order_fulfillment_updates u
    where  u.order_id = o.id
      and  u.status   = 'delivered'
    order  by u.created_at asc
    limit  1
  ),
  o.buyer_confirmed_at
)
where o.fulfillment_status in ('delivered', 'delivered_confirmed')
  and o.delivered_at is null;

commit;
