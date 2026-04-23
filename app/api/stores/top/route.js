import { publicJson, errorJson, toPositiveInt } from '@/utils/platform/api-response';
import { createPublicClient } from '@/utils/supabase/public';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const supabase = createPublicClient();
    const { searchParams } = new URL(request.url);
    const limit = toPositiveInt(searchParams.get('limit'), 8, { min: 1, max: 24 });

    const { data: stores, error } = await supabase
      .from('stores')
      .select('id, name, slug, logo_url, rating, followers, kyc_status, description')
      .eq('status', 'active')
      .order('rating', { ascending: false, nullsFirst: false })
      .order('followers', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return publicJson({ success: true, data: stores || [] }, { policy: 'publicShort' });
  } catch (error) {
    console.error('Fetch Top Stores Error:', error);
    return errorJson('Failed to fetch top stores');
  }
}
