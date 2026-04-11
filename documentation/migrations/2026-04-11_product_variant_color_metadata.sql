BEGIN;

ALTER TABLE public.product_variants_internal
  ADD COLUMN IF NOT EXISTS color_hex text,
  ADD COLUMN IF NOT EXISTS color_family text,
  ADD COLUMN IF NOT EXISTS color_source text DEFAULT 'preset';

ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS color_hex text,
  ADD COLUMN IF NOT EXISTS color_family text,
  ADD COLUMN IF NOT EXISTS color_source text DEFAULT 'preset';

COMMENT ON COLUMN public.product_variants_internal.color_hex IS
  'Seller-confirmed variant swatch color in #RRGGBB format.';

COMMENT ON COLUMN public.product_variants_internal.color_family IS
  'Normalized color family for filtering, e.g. White, Blue, Red, Beige.';

COMMENT ON COLUMN public.product_variants_internal.color_source IS
  'How the color was selected: preset, manual, or image_sampled.';

COMMENT ON COLUMN public.product_variants.color_hex IS
  'Seller-confirmed variant swatch color in #RRGGBB format.';

COMMENT ON COLUMN public.product_variants.color_family IS
  'Normalized color family for filtering, e.g. White, Blue, Red, Beige.';

COMMENT ON COLUMN public.product_variants.color_source IS
  'How the color was selected: preset, manual, or image_sampled.';

COMMIT;
