-- Security hardening sweep for Supabase linter findings.
-- Goals:
-- 1) enable RLS on exposed tables in public schema,
-- 2) preserve intended public storefront reads,
-- 3) preserve intended seller/browser promotion flows,
-- 4) lock sensitive operational tables behind user/store ownership,
-- 5) remove SECURITY DEFINER risk from public views.

-- ---------------------------------------------------------------------------
-- Helper functions used by RLS policies.
-- These run as SECURITY DEFINER so policy checks do not depend on the caller
-- being able to query membership/order tables directly.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users admin_user
    WHERE admin_user.user_id = auth.uid()
      AND COALESCE(admin_user.is_active, true) = true
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_has_store_role(target_store_id uuid, allowed_roles text[] DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.store_users membership
    WHERE membership.user_id = auth.uid()
      AND membership.store_id = target_store_id
      AND membership.status = 'active'
      AND (
        allowed_roles IS NULL
        OR membership.role = ANY(allowed_roles)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_owns_order(target_order_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders order_row
    WHERE order_row.id::text = target_order_id
      AND order_row.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_can_read_product(target_product_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items order_item
    INNER JOIN public.orders order_row
      ON order_row.id = order_item.order_id
    WHERE order_item.product_id = target_product_id
      AND order_row.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_can_read_variant(target_variant_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items order_item
    INNER JOIN public.orders order_row
      ON order_row.id = order_item.order_id
    INNER JOIN public.product_variants variant_row
      ON variant_row.id::text = target_variant_id
    WHERE order_item.variant_id::text = target_variant_id
      AND order_row.user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_has_store_role(uuid, text[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_owns_order(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_can_read_product(bigint) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_can_read_variant(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS on every table surfaced by the linter.
-- Tables that are internal-only intentionally receive no public policy.
-- ---------------------------------------------------------------------------

ALTER TABLE public.order_shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_payout_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_mood_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_visibility_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_verification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_creation_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_fulfillment_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_payout_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_payout_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_cancellation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Public storefront/catalog access.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS stores_public_read ON public.stores;
CREATE POLICY stores_public_read
ON public.stores
FOR SELECT
TO anon, authenticated
USING (status = 'active');

DROP POLICY IF EXISTS stores_member_read ON public.stores;
CREATE POLICY stores_member_read
ON public.stores
FOR SELECT
TO authenticated
USING (
  public.current_user_is_admin()
  OR user_id = auth.uid()
  OR public.current_user_has_store_role(id)
);

DROP POLICY IF EXISTS products_public_read ON public.products;
CREATE POLICY products_public_read
ON public.products
FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND moderation_status = 'approved'
);

DROP POLICY IF EXISTS products_store_member_read ON public.products;
CREATE POLICY products_store_member_read
ON public.products
FOR SELECT
TO authenticated
USING (
  public.current_user_is_admin()
  OR public.current_user_has_store_role(store_id)
);

DROP POLICY IF EXISTS products_order_owner_read ON public.products;
CREATE POLICY products_order_owner_read
ON public.products
FOR SELECT
TO authenticated
USING (public.current_user_can_read_product(id));

DROP POLICY IF EXISTS product_variants_public_read ON public.product_variants;
CREATE POLICY product_variants_public_read
ON public.product_variants
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.products product_row
    WHERE product_row.id = product_variants.product_id
      AND product_row.is_active = true
      AND product_row.moderation_status = 'approved'
  )
);

DROP POLICY IF EXISTS product_variants_store_member_read ON public.product_variants;
CREATE POLICY product_variants_store_member_read
ON public.product_variants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.products product_row
    WHERE product_row.id = product_variants.product_id
      AND (
        public.current_user_is_admin()
        OR public.current_user_has_store_role(product_row.store_id)
      )
  )
);

DROP POLICY IF EXISTS product_variants_order_owner_read ON public.product_variants;
CREATE POLICY product_variants_order_owner_read
ON public.product_variants
FOR SELECT
TO authenticated
USING (public.current_user_can_read_variant(id::text));

DROP POLICY IF EXISTS mood_definitions_public_read ON public.mood_definitions;
CREATE POLICY mood_definitions_public_read
ON public.mood_definitions
FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS product_mood_tags_public_read ON public.product_mood_tags;
CREATE POLICY product_mood_tags_public_read
ON public.product_mood_tags
FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1
    FROM public.products product_row
    WHERE product_row.id = product_mood_tags.product_id
      AND product_row.is_active = true
      AND product_row.moderation_status = 'approved'
  )
);

DROP POLICY IF EXISTS promotion_types_public_read ON public.promotion_types;
CREATE POLICY promotion_types_public_read
ON public.promotion_types
FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS promotions_public_read ON public.promotions;
CREATE POLICY promotions_public_read
ON public.promotions
FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND starts_at <= now()
  AND (ends_at IS NULL OR ends_at >= now())
  AND (owner_type = 'zova' OR approved_by_zova = true)
);

DROP POLICY IF EXISTS promotion_targets_public_read ON public.promotion_targets;
CREATE POLICY promotion_targets_public_read
ON public.promotion_targets
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.promotions promotion_row
    WHERE promotion_row.id = promotion_targets.promotion_id
      AND promotion_row.is_active = true
      AND promotion_row.starts_at <= now()
      AND (promotion_row.ends_at IS NULL OR promotion_row.ends_at >= now())
      AND (promotion_row.owner_type = 'zova' OR promotion_row.approved_by_zova = true)
  )
);

-- ---------------------------------------------------------------------------
-- Seller/browser flows that intentionally use the anon/authenticated client.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS promotions_store_member_read ON public.promotions;
CREATE POLICY promotions_store_member_read
ON public.promotions
FOR SELECT
TO authenticated
USING (
  public.current_user_is_admin()
  OR public.current_user_has_store_role(store_id, ARRAY['owner', 'manager'])
);

DROP POLICY IF EXISTS promotions_store_member_insert ON public.promotions;
CREATE POLICY promotions_store_member_insert
ON public.promotions
FOR INSERT
TO authenticated
WITH CHECK (
  owner_type = 'seller'
  AND created_by = auth.uid()
  AND public.current_user_has_store_role(store_id, ARRAY['owner', 'manager'])
);

DROP POLICY IF EXISTS promotions_store_member_update ON public.promotions;
CREATE POLICY promotions_store_member_update
ON public.promotions
FOR UPDATE
TO authenticated
USING (
  public.current_user_is_admin()
  OR public.current_user_has_store_role(store_id, ARRAY['owner', 'manager'])
)
WITH CHECK (
  public.current_user_is_admin()
  OR public.current_user_has_store_role(store_id, ARRAY['owner', 'manager'])
);

DROP POLICY IF EXISTS promotions_store_member_delete ON public.promotions;
CREATE POLICY promotions_store_member_delete
ON public.promotions
FOR DELETE
TO authenticated
USING (
  public.current_user_is_admin()
  OR public.current_user_has_store_role(store_id, ARRAY['owner', 'manager'])
);

DROP POLICY IF EXISTS promotion_targets_store_member_read ON public.promotion_targets;
CREATE POLICY promotion_targets_store_member_read
ON public.promotion_targets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.promotions promotion_row
    WHERE promotion_row.id = promotion_targets.promotion_id
      AND (
        public.current_user_is_admin()
        OR public.current_user_has_store_role(promotion_row.store_id, ARRAY['owner', 'manager'])
      )
  )
);

DROP POLICY IF EXISTS promotion_targets_store_member_insert ON public.promotion_targets;
CREATE POLICY promotion_targets_store_member_insert
ON public.promotion_targets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.promotions promotion_row
    WHERE promotion_row.id = promotion_targets.promotion_id
      AND (
        public.current_user_is_admin()
        OR public.current_user_has_store_role(promotion_row.store_id, ARRAY['owner', 'manager'])
      )
  )
);

DROP POLICY IF EXISTS promotion_targets_store_member_update ON public.promotion_targets;
CREATE POLICY promotion_targets_store_member_update
ON public.promotion_targets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.promotions promotion_row
    WHERE promotion_row.id = promotion_targets.promotion_id
      AND (
        public.current_user_is_admin()
        OR public.current_user_has_store_role(promotion_row.store_id, ARRAY['owner', 'manager'])
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.promotions promotion_row
    WHERE promotion_row.id = promotion_targets.promotion_id
      AND (
        public.current_user_is_admin()
        OR public.current_user_has_store_role(promotion_row.store_id, ARRAY['owner', 'manager'])
      )
  )
);

DROP POLICY IF EXISTS promotion_targets_store_member_delete ON public.promotion_targets;
CREATE POLICY promotion_targets_store_member_delete
ON public.promotion_targets
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.promotions promotion_row
    WHERE promotion_row.id = promotion_targets.promotion_id
      AND (
        public.current_user_is_admin()
        OR public.current_user_has_store_role(promotion_row.store_id, ARRAY['owner', 'manager'])
      )
  )
);

DROP POLICY IF EXISTS product_creation_drafts_owner_crud ON public.product_creation_drafts;
CREATE POLICY product_creation_drafts_owner_crud
ON public.product_creation_drafts
FOR ALL
TO authenticated
USING (
  user_id = auth.uid()
  AND public.current_user_has_store_role(store_id, ARRAY['owner', 'manager', 'staff'])
)
WITH CHECK (
  user_id = auth.uid()
  AND public.current_user_has_store_role(store_id, ARRAY['owner', 'manager', 'staff'])
);

DROP POLICY IF EXISTS store_team_invitations_member_read ON public.store_team_invitations;
CREATE POLICY store_team_invitations_member_read
ON public.store_team_invitations
FOR SELECT
TO authenticated
USING (
  public.current_user_is_admin()
  OR public.current_user_has_store_role(store_id)
  OR invited_user_id = auth.uid()
);

DROP POLICY IF EXISTS store_team_invitations_manager_write ON public.store_team_invitations;
CREATE POLICY store_team_invitations_manager_write
ON public.store_team_invitations
FOR ALL
TO authenticated
USING (
  public.current_user_is_admin()
  OR public.current_user_has_store_role(store_id, ARRAY['owner', 'manager'])
)
WITH CHECK (
  public.current_user_is_admin()
  OR public.current_user_has_store_role(store_id, ARRAY['owner', 'manager'])
);

-- ---------------------------------------------------------------------------
-- Authenticated user private data.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS user_notifications_owner_read ON public.user_notifications;
CREATE POLICY user_notifications_owner_read
ON public.user_notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_notifications_owner_update ON public.user_notifications;
CREATE POLICY user_notifications_owner_update
ON public.user_notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS order_shipping_addresses_order_owner_read ON public.order_shipping_addresses;
CREATE POLICY order_shipping_addresses_order_owner_read
ON public.order_shipping_addresses
FOR SELECT
TO authenticated
USING (public.current_user_owns_order(order_id::text));

DROP POLICY IF EXISTS order_cancellation_requests_owner_read ON public.order_cancellation_requests;
CREATE POLICY order_cancellation_requests_owner_read
ON public.order_cancellation_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS order_cancellation_requests_owner_write ON public.order_cancellation_requests;
CREATE POLICY order_cancellation_requests_owner_write
ON public.order_cancellation_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS order_cancellation_requests_owner_update ON public.order_cancellation_requests;
CREATE POLICY order_cancellation_requests_owner_update
ON public.order_cancellation_requests
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS order_return_requests_owner_read ON public.order_return_requests;
CREATE POLICY order_return_requests_owner_read
ON public.order_return_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS order_return_requests_owner_write ON public.order_return_requests;
CREATE POLICY order_return_requests_owner_write
ON public.order_return_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS order_return_requests_owner_update ON public.order_return_requests;
CREATE POLICY order_return_requests_owner_update
ON public.order_return_requests
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Sensitive store/private operational data.
-- These are server-route driven today, but store members may need read access
-- through authenticated clients in future. No public access is allowed.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS store_payout_accounts_store_member_read ON public.store_payout_accounts;
CREATE POLICY store_payout_accounts_store_member_read
ON public.store_payout_accounts
FOR SELECT
TO authenticated
USING (
  public.current_user_is_admin()
  OR public.current_user_has_store_role(store_id)
);

DROP POLICY IF EXISTS store_payouts_store_member_read ON public.store_payouts;
CREATE POLICY store_payouts_store_member_read
ON public.store_payouts
FOR SELECT
TO authenticated
USING (
  public.current_user_is_admin()
  OR public.current_user_has_store_role(store_id)
);

DROP POLICY IF EXISTS escrow_transactions_store_member_read ON public.escrow_transactions;
CREATE POLICY escrow_transactions_store_member_read
ON public.escrow_transactions
FOR SELECT
TO authenticated
USING (
  public.current_user_is_admin()
  OR public.current_user_has_store_role(store_id)
);

-- ---------------------------------------------------------------------------
-- Event ingestion: allow product event inserts, but keep the table unreadable
-- to public clients. cart_events remain server-only.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS product_events_ingest_insert ON public.product_events;
CREATE POLICY product_events_ingest_insert
ON public.product_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND (user_id IS NULL OR user_id = auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.products product_row
    WHERE product_row.id = product_events.product_id
      AND product_row.is_active = true
      AND product_row.moderation_status = 'approved'
  )
);

-- ---------------------------------------------------------------------------
-- Remove privileged public-view behavior by forcing security invoker semantics.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  view_name text;
BEGIN
  FOREACH view_name IN ARRAY ARRAY[
    'admin_daily_orders',
    'product_review_stats',
    'error_summary',
    'payment_analytics',
    'auth_analytics'
  ]
  LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_views
      WHERE schemaname = 'public'
        AND viewname = view_name
    ) THEN
      EXECUTE format(
        'ALTER VIEW public.%I SET (security_invoker = true)',
        view_name
      );
    END IF;
  END LOOP;
END $$;
