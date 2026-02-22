-- Performance indexes for reservation cleanup and stock release flows.

CREATE INDEX IF NOT EXISTS idx_orders_pending_unpaid_created_at
  ON public.orders(status, payment_reference, created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON public.order_items(order_id);
