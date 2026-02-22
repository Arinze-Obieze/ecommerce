-- Admin platform foundations: RBAC, store-user assignments, audit logs, analytics events

-- 1) Admin users (RBAC)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'ops_admin', 'support_admin', 'analyst')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_users_role_active ON public.admin_users(role, is_active);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read their own membership" ON public.admin_users;
CREATE POLICY "Admins can read their own membership"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = user_id);

-- 2) Store user assignments
CREATE TABLE IF NOT EXISTS public.store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')) DEFAULT 'staff',
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (store_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_store_users_user_status ON public.store_users(user_id, status);
CREATE INDEX IF NOT EXISTS idx_store_users_store_status ON public.store_users(store_id, status);

-- One active owner per store
CREATE UNIQUE INDEX IF NOT EXISTS ux_store_users_active_owner
  ON public.store_users(store_id)
  WHERE role = 'owner' AND status = 'active';

ALTER TABLE public.store_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own store assignments" ON public.store_users;
CREATE POLICY "Users can read their own store assignments"
  ON public.store_users FOR SELECT
  USING (auth.uid() = user_id);

-- 3) Store governance fields
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS kyc_status TEXT NOT NULL DEFAULT 'not_required' CHECK (kyc_status IN ('not_required', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS payout_ready BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_stores_status ON public.stores(status);
CREATE INDEX IF NOT EXISTS idx_stores_created_at ON public.stores(created_at DESC);

-- 4) Admin audit logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_admin_user_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON public.admin_audit_logs(target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_actor ON public.admin_audit_logs(actor_user_id, created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- No public/authenticated policies: reads/writes should flow via privileged backend service role.

-- 5) Analytics event stream
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID,
  anon_id TEXT,
  path TEXT,
  referrer TEXT,
  device_type TEXT,
  country TEXT,
  state TEXT,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time ON public.analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_time ON public.analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_props ON public.analytics_events USING GIN(properties);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- No public/authenticated policies: ingestion/reads should flow through vetted APIs.

-- 6) Admin views for dashboard reads
CREATE OR REPLACE VIEW public.admin_daily_orders AS
SELECT
  DATE_TRUNC('day', o.created_at)::date AS day,
  COUNT(*) AS orders_count,
  COUNT(*) FILTER (WHERE o.status = 'completed') AS completed_orders,
  COUNT(*) FILTER (WHERE o.status = 'cancelled') AS cancelled_orders,
  COALESCE(SUM(o.total_amount) FILTER (WHERE o.status = 'completed'), 0) AS gmv_paid,
  COALESCE(SUM(o.total_amount), 0) AS gmv_total,
  COALESCE(
    ROUND(
      SUM(o.total_amount) FILTER (WHERE o.status = 'completed')
      / NULLIF(COUNT(*) FILTER (WHERE o.status = 'completed'), 0),
      2
    ),
    0
  ) AS aov_paid
FROM public.orders o
GROUP BY DATE_TRUNC('day', o.created_at)::date
ORDER BY day DESC;

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
