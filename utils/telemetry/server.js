import { createClient } from '@supabase/supabase-js';
import { getRequestIp } from '@/utils/platform/rate-limit';

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !serviceKey) {
    return null;
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function getUserAgent(request) {
  return request?.headers?.get?.('user-agent') || null;
}

export async function writeActivityLog({
  request,
  level = 'INFO',
  service = 'api',
  action,
  status = 'success',
  statusCode = null,
  message,
  userId = null,
  metadata = {},
  durationMs = null,
  errorCode = null,
  errorStack = null,
}) {
  try {
    const client = getServiceClient();
    if (!client || !action) return;

    await client.from('activity_logs').insert({
      level,
      service,
      action,
      status,
      status_code: statusCode,
      message: message || action,
      user_id: userId,
      ip_address: request ? getRequestIp(request) : null,
      user_agent: request ? getUserAgent(request) : null,
      duration_ms: Number.isFinite(durationMs) ? Math.round(durationMs) : null,
      error_code: errorCode,
      error_stack: errorStack,
      metadata: metadata || {},
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('writeActivityLog failed:', error);
  }
}

export async function writeAnalyticsEvent({
  eventName,
  userId = null,
  sessionId = null,
  anonId = null,
  path = null,
  referrer = null,
  deviceType = null,
  country = null,
  state = null,
  properties = {},
}) {
  try {
    if (!eventName) return;
    const client = getServiceClient();
    if (!client) return;

    await client.from('analytics_events').insert({
      event_name: eventName,
      user_id: userId,
      session_id: sessionId,
      anon_id: anonId,
      path,
      referrer,
      device_type: deviceType,
      country,
      state,
      properties,
    });
  } catch (error) {
    console.error('writeAnalyticsEvent failed:', error);
  }
}
