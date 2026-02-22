-- Atomic stock release for cancelled/expired orders.
-- This updates product_variants and products in set-based statements to avoid read-then-write races.
CREATE OR REPLACE FUNCTION public.release_order_stock(
    p_order_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_released_items INTEGER := 0;
    v_variant_released INTEGER := 0;
    v_product_released INTEGER := 0;
BEGIN
    -- Release variant-backed stock.
    WITH variant_releases AS (
        SELECT variant_id, SUM(quantity)::INTEGER AS qty
        FROM public.order_items
        WHERE order_id = p_order_id
          AND variant_id IS NOT NULL
        GROUP BY variant_id
    ),
    updated_variants AS (
        UPDATE public.product_variants pv
        SET stock_quantity = pv.stock_quantity + vr.qty
        FROM variant_releases vr
        WHERE pv.id = vr.variant_id
        RETURNING vr.qty
    )
    SELECT COALESCE(SUM(qty), 0) INTO v_variant_released
    FROM updated_variants;

    -- Release product-backed stock (non-variant items).
    WITH product_releases AS (
        SELECT product_id, SUM(quantity)::INTEGER AS qty
        FROM public.order_items
        WHERE order_id = p_order_id
          AND variant_id IS NULL
          AND product_id IS NOT NULL
        GROUP BY product_id
    ),
    updated_products AS (
        UPDATE public.products p
        SET stock_quantity = p.stock_quantity + pr.qty
        FROM product_releases pr
        WHERE p.id = pr.product_id
        RETURNING pr.qty
    )
    SELECT COALESCE(SUM(qty), 0) INTO v_product_released
    FROM updated_products;

    v_released_items := v_variant_released + v_product_released;
    RETURN v_released_items;
END;
$$;

REVOKE ALL ON FUNCTION public.release_order_stock(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_order_stock(UUID) TO service_role;
