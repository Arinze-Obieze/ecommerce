import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { enforceRateLimit, getRequestIp, rateLimitHeaders, rateLimitPayload } from '@/utils/rateLimit';
import { writeActivityLog } from '@/utils/serverTelemetry';

const EVENT_NAME_REGEX = /^[a-z0-9_]{2,64}$/i;

function sanitizeProperties(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  const clone = { ...input };

  // Basic safety to keep payload reasonably small and non-sensitive by default.
  delete clone.password;
  delete clone.token;
  delete clone.secret;
  delete clone.authorization;

  const json = JSON.stringify(clone);
  if (json.length > 8000) {
    return { truncated: true };
  }

  return clone;
}

export async function POST(request) {
  const startedAt = Date.now();
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const ip = getRequestIp(request);
  const body = await request.json().catch(() => null);
  const identifier = user?.id || body?.session_id || body?.anon_id || ip;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'analytics_events_ingest',
    identifier,
    limit: 600,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    await writeActivityLog({
      request,
      level: 'WARN',
      service: 'analytics-service',
      action: 'ANALYTICS_EVENT_RATE_LIMITED',
      status: 'failure',
      statusCode: 429,
      message: 'Analytics event ingestion rate limit exceeded',
      userId: user?.id || null,
      metadata: { identifierType: user?.id ? 'user' : body?.session_id ? 'session' : body?.anon_id ? 'anonymous' : 'ip' },
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json(
      rateLimitPayload('Analytics tracking is temporarily throttled because too many events were sent in a short time. Please wait a moment and try again.', rateLimit),
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const eventName = String(body?.event_name || '').trim();

  if (!EVENT_NAME_REGEX.test(eventName)) {
    await writeActivityLog({
      request,
      level: 'WARN',
      service: 'analytics-service',
      action: 'ANALYTICS_EVENT_INVALID',
      status: 'failure',
      statusCode: 400,
      message: 'Invalid analytics event_name',
      userId: user?.id || null,
      metadata: { eventName },
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: 'Invalid event_name' }, { status: 400 });
  }

  const payload = {
    event_name: eventName,
    user_id: user?.id || null,
    session_id: body?.session_id || null,
    anon_id: body?.anon_id || null,
    path: body?.path ? String(body.path).slice(0, 500) : null,
    referrer: body?.referrer ? String(body.referrer).slice(0, 1000) : null,
    device_type: body?.device_type ? String(body.device_type).slice(0, 100) : null,
    country: body?.country ? String(body.country).slice(0, 100) : null,
    state: body?.state ? String(body.state).slice(0, 100) : null,
    properties: sanitizeProperties(body?.properties),
  };

  const adminClient = await createAdminClient();
  const { error } = await adminClient.from('analytics_events').insert(payload);

  if (error) {
    await writeActivityLog({
      request,
      level: 'ERROR',
      service: 'analytics-service',
      action: 'ANALYTICS_EVENT_INSERT_FAILED',
      status: 'failure',
      statusCode: 500,
      message: error.message,
      userId: user?.id || null,
      metadata: { eventName },
      errorCode: error.code || null,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeActivityLog({
    request,
    level: 'INFO',
    service: 'analytics-service',
    action: 'ANALYTICS_EVENT_INGESTED',
    status: 'success',
    statusCode: 200,
    message: 'Analytics event ingested',
    userId: user?.id || null,
    metadata: { eventName },
    durationMs: Date.now() - startedAt,
  });

  return NextResponse.json({ success: true });
}
