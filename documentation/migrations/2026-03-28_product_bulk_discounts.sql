ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS bulk_discount_tiers jsonb NULL;

COMMENT ON COLUMN public.products.bulk_discount_tiers IS
'Optional quantity discount tiers, e.g. [{"minimum_quantity":40,"discount_percent":20}].';
