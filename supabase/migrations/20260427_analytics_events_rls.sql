-- F008: Enable RLS on analytics_events so no authenticated or anonymous Supabase
-- client can SELECT platform-wide behavioural data (viewed products, cart events, etc.).
-- No SELECT policies are added: the service-role admin client (used by all server routes)
-- bypasses RLS automatically and is unaffected by this change.
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
