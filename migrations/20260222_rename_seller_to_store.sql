-- Production rename migration: seller -> store
-- Safe to run on databases that may already be partially renamed.

DO $$
BEGIN
  -- 1) Core table rename
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sellers'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'stores'
  ) THEN
    ALTER TABLE public.sellers RENAME TO stores;
  END IF;
END $$;

DO $$
BEGIN
  -- 2) Join table rename
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'seller_users'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'store_users'
  ) THEN
    ALTER TABLE public.seller_users RENAME TO store_users;
  END IF;
END $$;

DO $$
BEGIN
  -- 3) Foreign-key column rename on products
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'seller_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'store_id'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN seller_id TO store_id;
  END IF;
END $$;

DO $$
BEGIN
  -- 4) Foreign-key column rename on store_users
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'store_users' AND column_name = 'seller_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'store_users' AND column_name = 'store_id'
  ) THEN
    ALTER TABLE public.store_users RENAME COLUMN seller_id TO store_id;
  END IF;
END $$;

-- 5) Index cleanup
ALTER INDEX IF EXISTS public.idx_products_seller_id RENAME TO idx_products_store_id;
ALTER INDEX IF EXISTS public.idx_seller_users_user_status RENAME TO idx_store_users_user_status;
ALTER INDEX IF EXISTS public.idx_seller_users_seller_status RENAME TO idx_store_users_store_status;
ALTER INDEX IF EXISTS public.ux_seller_users_active_owner RENAME TO ux_store_users_active_owner;
ALTER INDEX IF EXISTS public.idx_sellers_status RENAME TO idx_stores_status;
ALTER INDEX IF EXISTS public.idx_sellers_created_at RENAME TO idx_stores_created_at;

-- 6) RLS policy cleanup on store_users
DROP POLICY IF EXISTS "Users can read their own seller assignments" ON public.store_users;
DROP POLICY IF EXISTS "Users can read their own store assignments" ON public.store_users;
CREATE POLICY "Users can read their own store assignments"
  ON public.store_users FOR SELECT
  USING (auth.uid() = user_id);

-- 7) Dashboard view rename
DROP VIEW IF EXISTS public.admin_top_sellers_30d;
CREATE OR REPLACE VIEW public.admin_top_stores_30d AS
WITH completed_orders AS (
  SELECT id
  FROM public.orders
  WHERE status = 'completed'
    AND created_at >= NOW() - INTERVAL '30 days'
)
SELECT
  s.id AS store_id,
  s.name AS store_name,
  s.slug AS store_slug,
  COUNT(DISTINCT oi.order_id) AS orders_count,
  COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue
FROM public.order_items oi
JOIN completed_orders co ON co.id = oi.order_id
JOIN public.products p ON p.id = oi.product_id
JOIN public.stores s ON s.id = p.store_id
GROUP BY s.id, s.name, s.slug
ORDER BY revenue DESC;
