import { errorJson, publicJson } from '@/utils/platform/api-response';
import { createPublicClient } from '@/utils/supabase/public';

export const dynamic = 'force-dynamic';

const STORE_PUBLIC_SELECT = [
  'id',
  'name',
  'slug',
  'description',
  'logo_url',
  'rating',
  'followers',
  'status',
  'kyc_status',
  'payout_ready',
  'created_at',
].join(', ');

export async function GET(request, { params }) {
  const { id } = await params; // id can be UUID or slug
  
  if (!id) {
    return errorJson('Store ID or Slug required', 400);
  }

  try {
    const supabase = createPublicClient();

    let query = supabase
      .from('stores')
      .select(STORE_PUBLIC_SELECT)
      .eq('status', 'active');
    
    // Simple check if it looks like a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: store, error } = await query.single();

    if (error || !store) {
      return errorJson('Store not found', 404);
    }

    return publicJson(store, { policy: 'publicDetail' });

  } catch (err) {
    console.error('Store API Error:', err);
    return errorJson('Internal Server Error');
  }
}
