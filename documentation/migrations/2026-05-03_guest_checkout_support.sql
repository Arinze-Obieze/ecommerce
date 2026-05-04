alter table public.order_shipping_addresses
  alter column user_id drop not null;

alter table public.order_shipping_addresses
  add column if not exists contact_email text not null default '';

create index if not exists idx_order_shipping_addresses_contact_email
  on public.order_shipping_addresses (lower(contact_email));
