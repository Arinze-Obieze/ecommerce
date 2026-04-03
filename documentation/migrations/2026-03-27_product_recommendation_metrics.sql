BEGIN;

CREATE TABLE IF NOT EXISTS public.product_recommendation_metrics (
  product_id bigint PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  impressions_30d bigint NOT NULL DEFAULT 0,
  views_30d bigint NOT NULL DEFAULT 0,
  carts_30d bigint NOT NULL DEFAULT 0,
  wishlists_30d bigint NOT NULL DEFAULT 0,
  purchases_30d bigint NOT NULL DEFAULT 0,
  refreshed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_recommendation_metrics_refreshed_at_idx
  ON public.product_recommendation_metrics (refreshed_at DESC);

CREATE OR REPLACE FUNCTION public.refresh_product_recommendation_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  window_start timestamptz := now() - interval '30 days';
BEGIN
  INSERT INTO public.product_recommendation_metrics (
    product_id,
    impressions_30d,
    views_30d,
    carts_30d,
    wishlists_30d,
    purchases_30d,
    refreshed_at
  )
  SELECT
    product_id,
    COUNT(*) FILTER (WHERE event_name = 'product_impression')::bigint AS impressions_30d,
    COUNT(*) FILTER (WHERE event_name IN ('product_card_click', 'view_item'))::bigint AS views_30d,
    COUNT(*) FILTER (WHERE event_name = 'add_to_cart')::bigint AS carts_30d,
    COUNT(*) FILTER (WHERE event_name = 'add_to_wishlist')::bigint AS wishlists_30d,
    COUNT(*) FILTER (WHERE event_name = 'purchase')::bigint AS purchases_30d,
    now() AS refreshed_at
  FROM (
    SELECT
      NULLIF((properties->>'product_id'), '')::bigint AS product_id,
      event_name
    FROM public.analytics_events
    WHERE created_at >= window_start
      AND event_name IN ('product_impression', 'product_card_click', 'view_item', 'add_to_cart', 'add_to_wishlist', 'purchase')
  ) events
  WHERE product_id IS NOT NULL
  GROUP BY product_id
  ON CONFLICT (product_id) DO UPDATE SET
    impressions_30d = EXCLUDED.impressions_30d,
    views_30d = EXCLUDED.views_30d,
    carts_30d = EXCLUDED.carts_30d,
    wishlists_30d = EXCLUDED.wishlists_30d,
    purchases_30d = EXCLUDED.purchases_30d,
    refreshed_at = EXCLUDED.refreshed_at;
END;
$$;

COMMENT ON TABLE public.product_recommendation_metrics IS
  'Pre-aggregated 30-day recommendation metrics used by the smart ranking engine.';

COMMENT ON FUNCTION public.refresh_product_recommendation_metrics() IS
  'Rebuilds 30-day product recommendation aggregates from analytics events.';

COMMIT;

-- Scheduling note:
-- Run SELECT public.refresh_product_recommendation_metrics(); on a fixed cadence
-- (for example every 15 minutes or hourly) using pg_cron, Supabase scheduled jobs,
-- or your platform scheduler.
