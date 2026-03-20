import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit } from '@/utils/rateLimit';

const DEFAULT_BUCKET = process.env.SUPABASE_PRODUCT_MEDIA_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_MEDIA_BUCKET || 'product-media';
const MAX_IMAGE_BYTES = Number.parseInt(process.env.STORE_MAX_IMAGE_UPLOAD_BYTES || `${8 * 1024 * 1024}`, 10);
const MAX_VIDEO_BYTES = Number.parseInt(process.env.STORE_MAX_VIDEO_UPLOAD_BYTES || `${80 * 1024 * 1024}`, 10);

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
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
  };
  return map[mimeType] || 'bin';
}

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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const filename = String(body?.filename || '').trim();
  const mimeType = String(body?.mime_type || body?.mimeType || '').trim().toLowerCase();
  const byteSize = Number.parseInt(body?.byte_size || body?.bytes || '0', 10) || 0;

  if (!filename || !mimeType || byteSize <= 0) {
    return NextResponse.json({ error: 'filename, mime_type, and byte_size are required' }, { status: 400 });
  }

  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: 'Only image and video uploads are allowed' }, { status: 400 });
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (byteSize > maxBytes) {
    return NextResponse.json({
      error: `${isImage ? 'Image' : 'Video'} exceeds max upload size of ${Math.round(maxBytes / (1024 * 1024))}MB`,
    }, { status: 400 });
  }

  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const ext = fileExtension(filename, mimeType);
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
