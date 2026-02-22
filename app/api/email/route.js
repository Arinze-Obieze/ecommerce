import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/utils/adminAuth';
import { enforceRateLimit } from '@/utils/rateLimit';
import { sendZeptoMail } from '@/utils/email';

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
    return NextResponse.json({ error: 'Too many email requests' }, { status: 429 });
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
