-- F007: Prevent duplicate payment references so concurrent Paystack webhook retries
-- cannot both complete the same order and trigger double escrow funding.
-- A partial unique index is used because NULL references are valid for pending orders.
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_reference_unique_idx
  ON public.orders (payment_reference)
  WHERE payment_reference IS NOT NULL;
