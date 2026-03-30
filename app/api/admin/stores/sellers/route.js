// app/api/admin/stores/sellers/route.js
// Returns sellers that are eligible for store creation:
// - Not already linked via store_id
// - business_name does not match any existing store name
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/utils/adminAuth';
import { enforceRateLimit } from '@/utils/rateLimit';

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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();

  // Step 1: Get all existing store names for cross-reference
  const { data: existingStores, error: storesError } = await admin.adminClient
    .from('stores')
    .select('name');

  if (storesError) {
    return NextResponse.json({ error: storesError.message }, { status: 500 });
  }

  const existingStoreNames = new Set(
    (existingStores || []).map((s) => s.name?.toLowerCase().trim()).filter(Boolean)
  );

  // Step 2: Get all sellers
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

  // Step 3: Filter out sellers already linked to a store
  const eligible = (sellers || []).filter((seller) => {
    const nameKey = seller.business_name?.toLowerCase().trim();
    return !seller.store_id && !existingStoreNames.has(nameKey);
  });

  return NextResponse.json({ success: true, data: eligible });
}