-- Faster category filtering for product listing/filter endpoints.
-- 1) Recursive branch resolver as DB function
-- 2) Supporting indexes for junction lookups

CREATE OR REPLACE FUNCTION public.get_category_branch_ids(p_slug TEXT)
RETURNS TABLE(id BIGINT)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH RECURSIVE branch AS (
    SELECT c.id
    FROM public.categories c
    WHERE c.slug = p_slug
      AND c.is_active = true

    UNION ALL

    SELECT c2.id
    FROM public.categories c2
    INNER JOIN branch b ON c2.parent_id = b.id
    WHERE c2.is_active = true
  )
  SELECT DISTINCT branch.id::BIGINT AS id
  FROM branch;
$$;

REVOKE ALL ON FUNCTION public.get_category_branch_ids(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_category_branch_ids(TEXT) TO anon, authenticated, service_role;

CREATE INDEX IF NOT EXISTS idx_categories_parent_active
  ON public.categories(parent_id, is_active);

CREATE INDEX IF NOT EXISTS idx_product_categories_category_product
  ON public.product_categories(category_id, product_id);

CREATE INDEX IF NOT EXISTS idx_product_collections_collection_product
  ON public.product_collections(collection_id, product_id);
