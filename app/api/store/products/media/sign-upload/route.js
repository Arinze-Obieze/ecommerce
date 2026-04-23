import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/store/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';

const DEFAULT_BUCKET = process.env.SUPABASE_PRODUCT_MEDIA_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_MEDIA_BUCKET || 'product-media';
const MAX_IMAGE_BYTES = Number.parseInt(process.env.STORE_MAX_IMAGE_UPLOAD_BYTES || `${8 * 1024 * 1024}`, 10);
const MAX_VIDEO_BYTES = Number.parseInt(process.env.STORE_MAX_VIDEO_UPLOAD_BYTES || `${80 * 1024 * 1024}`, 10);

function randomPart() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

function fileExtension(filename, mimeType) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
  };
  return map[mimeType] || 'bin';
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

export async function POST(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_products_media_sign_write',
    identifier: ctx.user.id,
    limit: 90,
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
    return NextResponse.json({ error: 'Only image and video uploads are allowed' }, { status: 400 });
  }

  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');
  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (byteSize > maxBytes) {
    return NextResponse.json({
      error: `${isImage ? 'Image' : 'Video'} exceeds max upload size of ${Math.round(maxBytes / (1024 * 1024))}MB`,
    }, { status: 400 });
  }

  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const ext = fileExtension(null, mimeType);
  const path = `${ctx.membership.store_id}/${yyyy}/${mm}/${Date.now()}_${randomPart()}.${ext}`;

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
      media_type: isImage ? 'image' : 'video',
      max_bytes: maxBytes,
    },
  });
}
