import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/rateLimit';

function sanitizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeOptionalUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed).toString();
  } catch {
    return null;
  }
}

function canEdit(role) {
  return role === STORE_ROLES.OWNER || role === STORE_ROLES.MANAGER;
}

function normalizeLowStockThreshold(value) {
  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  return Math.min(numeric, 100000);
}

function toSettingsRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || '',
    slug: row.slug || '',
    description: row.description || '',
    logo_url: row.logo_url || '',
    status: row.status || '',
    kyc_status: row.kyc_status || '',
    payout_ready: Boolean(row.payout_ready),
    low_stock_threshold: normalizeLowStockThreshold(row.low_stock_threshold) ?? 5,
    created_at: row.created_at || null,
    approved_at: row.approved_at || null,
  };
}

export async function GET(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_settings_read',
    identifier: ctx.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { data, error } = await ctx.adminClient
    .from('stores')
    .select('id, name, slug, description, logo_url, status, kyc_status, payout_ready, low_stock_threshold, created_at, approved_at')
    .eq('id', ctx.membership.store_id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: toSettingsRow(data),
    meta: {
      role: ctx.membership.role,
      can_edit: canEdit(ctx.membership.role),
    },
  });
}

export async function PATCH(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  if (!canEdit(ctx.membership.role)) {
    return NextResponse.json({ error: 'Only store owner/manager can update settings' }, { status: 403 });
  }

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_settings_write',
    identifier: ctx.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const body = await request.json().catch(() => ({}));
  const updates = {};

  if (body?.name !== undefined) {
    const name = String(body.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Store name cannot be empty' }, { status: 400 });
    }
    if (name.length > 120) {
      return NextResponse.json({ error: 'Store name is too long' }, { status: 400 });
    }
    updates.name = name;
  }

  if (body?.slug !== undefined) {
    const slug = sanitizeSlug(body.slug);
    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }
    updates.slug = slug;
  }

  if (body?.description !== undefined) {
    const description = String(body.description || '').trim();
    updates.description = description ? description.slice(0, 1000) : null;
  }

  if (body?.logo_url !== undefined) {
    const logoUrl = normalizeOptionalUrl(body.logo_url);
    if (String(body.logo_url || '').trim() && !logoUrl) {
      return NextResponse.json({ error: 'Invalid logo URL' }, { status: 400 });
    }
    updates.logo_url = logoUrl;
  }

  if (body?.low_stock_threshold !== undefined) {
    const threshold = normalizeLowStockThreshold(body.low_stock_threshold);
    if (threshold === null) {
      return NextResponse.json({ error: 'Low stock threshold must be zero or higher' }, { status: 400 });
    }
    updates.low_stock_threshold = threshold;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  const { data, error } = await ctx.adminClient
    .from('stores')
    .update(updates)
    .eq('id', ctx.membership.store_id)
    .select('id, name, slug, description, logo_url, status, kyc_status, payout_ready, low_stock_threshold, created_at, approved_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That store slug is already in use' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: toSettingsRow(data) });
}
