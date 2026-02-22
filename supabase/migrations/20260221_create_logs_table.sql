-- Create activity logs table for system auditing and error tracking
-- GDPR compliant: No plaintext PII, data retention policies enforced
-- Suitable for: Authentication events, payment processing, API errors, security events

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Request/Session Context
  request_id UUID NOT NULL DEFAULT gen_random_uuid(),
  session_id UUID,
  user_id UUID,
  
  -- Security & Audit Trail
  ip_address INET,
  user_agent TEXT,
  
  -- Log Classification
  level TEXT NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL')),
  service TEXT NOT NULL, -- e.g., 'auth-service', 'payment-service', 'api'
  action TEXT NOT NULL,  -- e.g., 'LOGIN_SUCCESS', 'PAYMENT_INITIATED', 'CHECKOUT_ERROR'
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'pending')), -- Operation status
  status_code INT,       -- HTTP status code if applicable
  
  -- Message Content
  message TEXT NOT NULL,
  error_code VARCHAR(100), -- Machine-readable error identifier
  error_stack TEXT,      -- Full stack trace for debugging (errors only)
  
  -- Performance Metrics
  duration_ms INT,       -- Execution time in milliseconds
  
  -- Flexible Metadata (JSON for context-specific data)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Environment Context
  environment TEXT NOT NULL, -- production, staging, development
  
  -- Foreign Keys (optional, for referential integrity)
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for efficient querying and log analysis
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_request_id ON activity_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_logs_level ON activity_logs(level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_action ON activity_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_service ON activity_logs(service, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_metadata ON activity_logs USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_logs_ip ON activity_logs(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_status ON activity_logs(status, created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_logs_user_action ON activity_logs(user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_error_time ON activity_logs(level, created_at DESC) WHERE level IN ('ERROR', 'CRITICAL');

-- Create a view for easy error analysis
CREATE OR REPLACE VIEW error_summary AS
SELECT 
  action,
  error_code,
  COUNT(*) as occurrence_count,
  MAX(created_at) as last_occurrence,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM activity_logs WHERE level IN ('ERROR', 'CRITICAL')), 2) as percentage
FROM activity_logs
WHERE level IN ('ERROR', 'CRITICAL')
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY action, error_code
ORDER BY occurrence_count DESC;

-- Create a view for authentication analytics
CREATE OR REPLACE VIEW auth_analytics AS
SELECT 
  DATE_TRUNC('hour', created_at) as time_bucket,
  action,
  status,
  COUNT(*) as count
FROM activity_logs
WHERE service = 'auth-service'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY time_bucket, action, status
ORDER BY time_bucket DESC, count DESC;

-- Create a view for payment tracking
CREATE OR REPLACE VIEW payment_analytics AS
SELECT 
  DATE_TRUNC('hour', created_at) as time_bucket,
  status,
  COUNT(*) as transaction_count,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(AVG((metadata->>'payment.amount')::numeric), 2) as avg_amount
FROM activity_logs
WHERE action LIKE 'PAYMENT_%'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY time_bucket, status
ORDER BY time_bucket DESC;

-- SQL function to delete old logs (run via cron)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
  v_deleted_count BIGINT;
BEGIN
  DELETE FROM activity_logs
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND level IN ('DEBUG', 'INFO'); -- Keep errors longer
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- SQL function to anonymize user logs (GDPR compliance - run when user deletes account)
CREATE OR REPLACE FUNCTION anonymize_user_logs(p_user_id UUID)
RETURNS TABLE(anonymized_count BIGINT) AS $$
DECLARE
  v_updated_count BIGINT;
BEGIN
  UPDATE activity_logs
  SET 
    user_id = NULL,
    metadata = metadata - 'email_domain' - 'user_email',
    ip_address = NULL,
    user_agent = NULL
  WHERE user_id = p_user_id
    AND created_at < NOW() - INTERVAL '7 days'; -- Keep recent logs for security
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Only allow service role to insert logs (not authenticated users)
CREATE POLICY logs_insert_service_role ON activity_logs
  FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS

-- Users can only view their own logs
CREATE POLICY logs_select_own ON activity_logs
  FOR SELECT
  USING (user_id = auth.uid());

COMMENT ON TABLE activity_logs IS 'Activity and error logs for auditing, debugging, and compliance. GDPR compliant - no plaintext PII stored.';
COMMENT ON COLUMN activity_logs.level IS 'Log severity: DEBUG, INFO, WARN, ERROR, CRITICAL';
COMMENT ON COLUMN activity_logs.action IS 'Specific action that triggered the log (e.g., LOGIN_SUCCESS, PAYMENT_FAILED)';
COMMENT ON COLUMN activity_logs.metadata IS 'Flexible JSON object for context-specific data. Examples: payment details, search params, validation errors';
COMMENT ON COLUMN activity_logs.request_id IS 'Unique ID to trace a single user request across multiple logs';
