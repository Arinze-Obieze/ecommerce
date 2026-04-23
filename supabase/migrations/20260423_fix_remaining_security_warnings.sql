-- Follow-up hardening for remaining Supabase linter warnings.
-- This migration removes overly broad policies that effectively bypass RLS,
-- narrows public access to the specific seller read path the app needs,
-- stops exposing internal ranking/listing infrastructure over the API,
-- and pins function search paths to avoid mutable resolution.

-- ---------------------------------------------------------------------------
-- Internal/private tables: keep RLS enabled and remove broad allow-all rules.
-- These tables are now accessed through validated server routes using the
-- service-role admin client instead of browser-scoped RLS exceptions.
-- ---------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_job_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_variants_internal ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products_internal ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seller_images_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS logs_insert_service_role ON public.activity_logs;

DROP POLICY IF EXISTS anon_all ON public.product_images;
DROP POLICY IF EXISTS authenticated_all ON public.product_images;

DROP POLICY IF EXISTS allow_insert_job_runs ON public.product_job_runs;

DROP POLICY IF EXISTS anon_all ON public.product_variants_internal;
DROP POLICY IF EXISTS authenticated_all ON public.product_variants_internal;

DROP POLICY IF EXISTS anon_all ON public.products_internal;
DROP POLICY IF EXISTS authenticated_all ON public.products_internal;

DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.seller_images_metadata;

DROP POLICY IF EXISTS "Allow anon insert" ON public.sellers;
DROP POLICY IF EXISTS "Allow anon update" ON public.sellers;
DROP POLICY IF EXISTS sellers_public_read ON public.sellers;

CREATE POLICY sellers_public_read
ON public.sellers
FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  AND verification_status = 'verified'
);

-- ---------------------------------------------------------------------------
-- Materialized view exposure: keep internal ranking data off the public API.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_matviews
    WHERE schemaname = 'public'
      AND matviewname = 'mv_ranked_products'
  ) THEN
    EXECUTE 'REVOKE ALL ON TABLE public.mv_ranked_products FROM anon, authenticated';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Public storage buckets do not need broad list permissions for public URLs.
-- Removing these policies keeps object URLs working while preventing bucket
-- enumeration via storage.objects.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow anon reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Public read product-media" ON storage.objects;
DROP POLICY IF EXISTS "Enable full access for all users" ON storage.objects;

-- ---------------------------------------------------------------------------
-- Pin search_path on public functions flagged by the linter.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  function_name text;
  function_signature text;
BEGIN
  FOREACH function_name IN ARRAY ARRAY[
    'cleanup_old_logs',
    'auto_add_store_owner',
    'sync_store_owner_to_stores',
    'update_sellers_updated_at',
    'anonymize_user_logs',
    'update_updated_at_column',
    'trg_fn_promotion_changed',
    'sync_product_category_and_collection',
    'sync_seller_store_id',
    'refresh_ranked_products',
    'sync_internal_variant_to_public',
    'update_promotions_updated_at',
    'touch_order_shipping_addresses_updated_at',
    'sync_product_discount_price',
    'touch_marketplace_ops_updated_at',
    'touch_order_cancellation_requests_updated_at',
    'sync_internal_product_to_public',
    'slugify',
    'sync_product_images_to_public',
    'compute_best_discount_price',
    'insert_user_profile',
    'trg_fn_promotion_targets_changed'
  ]
  LOOP
    FOR function_signature IN
      SELECT pg_get_function_identity_arguments(proc.oid)
      FROM pg_proc proc
      INNER JOIN pg_namespace namespace
        ON namespace.oid = proc.pronamespace
      WHERE namespace.nspname = 'public'
        AND proc.proname = function_name
    LOOP
      EXECUTE format(
        'ALTER FUNCTION public.%I(%s) SET search_path = public, auth, extensions',
        function_name,
        function_signature
      );
    END LOOP;
  END LOOP;
END $$;
