// app/api/admin/stores/sellers/route.js
// Returns sellers eligible for store creation:
// - store_id IS NULL (not linked yet, checked fresh from DB)
// - seller_id does not match any existing store name (store name = seller_id by our convention)
// - business_name does not match any existing store name (fallback)
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/utils/admin/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';

export async function GET(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_stores_read',
    identifier: admin.user.id,
    limit: 180,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();

  // Step 1: Get all existing store names (store name = seller_id by our creation convention)
  const { data: existingStores, error: storesError } = await admin.adminClient
    .from('stores')
    .select('name');

  if (storesError) {
    return NextResponse.json({ error: storesError.message }, { status: 500 });
  }

  // Build a Set of all existing store names (lowercased) for fast lookup
  const existingStoreNames = new Set(
    (existingStores || []).map((s) => s.name?.toLowerCase().trim()).filter(Boolean)
  );

  // Step 2: Get all sellers — always fetch fresh store_id so trigger updates are reflected
  let sellersQuery = admin.adminClient
    .from('sellers')
    .select(
      'id, seller_id, business_name, contact_person, business_type, seller_type, status, verification_status, tier, seller_tier_computed, commission_rate, store_rating, seller_score, is_featured, created_at, store_id'
    )
    .order('business_name', { ascending: true });

  if (search) {
    sellersQuery = sellersQuery.or(
      `business_name.ilike.%${search}%,seller_id.ilike.%${search}%,contact_person.ilike.%${search}%`
    );
  }

  const { data: sellers, error: sellersError } = await sellersQuery;

  if (sellersError) {
    return NextResponse.json({ error: sellersError.message }, { status: 500 });
  }

  // Step 3: Exclude sellers that already have a store via ANY of these signals:
  // a) store_id is set (trigger updated it after store insert)
  // b) seller_id matches an existing store name (our naming convention: store.name = seller.seller_id)
  // c) business_name matches an existing store name (fallback for legacy stores)
  const eligible = (sellers || []).filter((seller) => {
    if (seller.store_id) return false;
    const sellerIdKey = seller.seller_id?.toLowerCase().trim();
    if (sellerIdKey && existingStoreNames.has(sellerIdKey)) return false;
    const businessNameKey = seller.business_name?.toLowerCase().trim();
    if (businessNameKey && existingStoreNames.has(businessNameKey)) return false;
    return true;
  });

  return NextResponse.json({ success: true, data: eligible });
}