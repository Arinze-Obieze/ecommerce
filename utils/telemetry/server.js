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

// Plan B: strip PII fields from any metadata before it reaches the database.
// This is a structural safeguard — even if a call-site accidentally includes one
// of these fields, it will be redacted here rather than persisted.
const PII_FIELDS = new Set([
  'phone', 'phone_number', 'address', 'address_line1', 'address_line2',
  'street', 'postalCode', 'postal_code', 'deliveryAddress', 'delivery_address',
  'email', 'full_name', 'card_number', 'cvv', 'bank_account',
]);

function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return metadata;
  const clean = { ...metadata };
  for (const field of PII_FIELDS) {
    if (field in clean) clean[field] = '[REDACTED]';
  }
  for (const [key, value] of Object.entries(clean)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = sanitizeMetadata(value);
    }
  }
  return clean;
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
      metadata: sanitizeMetadata(metadata || {}),
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
