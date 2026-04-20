import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/utils/admin/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import { sendZeptoMail } from '@/utils/messaging/email';

export async function POST(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_send_email',
    identifier: admin.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many email requests', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const body = await request.json().catch(() => ({}));
  const result = await sendZeptoMail({
    to: body?.to,
    subject: body?.subject,
    html: body?.html,
    text: body?.text,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error || 'Failed to send email',
        ...(result.details ? { details: result.details } : {}),
      },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json({ success: true, data: result.data });
}
