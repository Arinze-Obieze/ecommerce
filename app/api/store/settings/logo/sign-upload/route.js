import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/rateLimit';

const DEFAULT_BUCKET = process.env.SUPABASE_STORE_LOGO_BUCKET || process.env.SUPABASE_PRODUCT_MEDIA_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_MEDIA_BUCKET || 'product-media';
const MAX_LOGO_BYTES = Number.parseInt(process.env.STORE_MAX_LOGO_UPLOAD_BYTES || `${5 * 1024 * 1024}`, 10);

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function randomPart() {
  return Math.random().toString(36).slice(2, 10);
}

function fileExtension(filename, mimeType) {
  const normalized = String(filename || '').trim();
  const extFromName = normalized.includes('.') ? normalized.split('.').pop().toLowerCase() : '';
  if (extFromName) return extFromName;

  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  return map[mimeType] || 'bin';
}

function canEdit(role) {
  return role === STORE_ROLES.OWNER || role === STORE_ROLES.MANAGER;
}

export async function POST(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  if (!canEdit(ctx.membership.role)) {
    return NextResponse.json({ error: 'Only store owner/manager can upload a store logo' }, { status: 403 });
  }

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_settings_logo_sign_write',
    identifier: ctx.user.id,
    limit: 30,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const body = await request.json().catch(() => ({}));
  const filename = String(body?.filename || '').trim();
  const mimeType = String(body?.mime_type || body?.mimeType || '').trim().toLowerCase();
  const byteSize = Number.parseInt(body?.byte_size || body?.bytes || '0', 10) || 0;

  if (!filename || !mimeType || byteSize <= 0) {
    return NextResponse.json({ error: 'filename, mime_type, and byte_size are required' }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json({ error: 'Only JPG, PNG, and WebP logo uploads are allowed' }, { status: 400 });
  }

  if (byteSize > MAX_LOGO_BYTES) {
    return NextResponse.json({
      error: `Logo exceeds max upload size of ${Math.round(MAX_LOGO_BYTES / (1024 * 1024))}MB`,
    }, { status: 400 });
  }

  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const ext = fileExtension(filename, mimeType);
  const path = `${ctx.membership.store_id}/logos/${yyyy}/${mm}/${Date.now()}_${randomPart()}.${ext}`;

  const { data: signedData, error: signedError } = await ctx.adminClient.storage
    .from(DEFAULT_BUCKET)
    .createSignedUploadUrl(path);

  if (signedError || !signedData?.token) {
    return NextResponse.json({ error: signedError?.message || 'Failed to create signed upload URL' }, { status: 500 });
  }

  const { data: publicData } = ctx.adminClient.storage
    .from(DEFAULT_BUCKET)
    .getPublicUrl(path);

  return NextResponse.json({
    success: true,
    data: {
      bucket: DEFAULT_BUCKET,
      path,
      token: signedData.token,
      signed_url: signedData.signedUrl || null,
      public_url: publicData?.publicUrl || null,
      max_bytes: MAX_LOGO_BYTES,
    },
  });
}
