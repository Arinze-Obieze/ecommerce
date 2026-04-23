import { errorJson, publicJson } from '@/utils/platform/api-response';
import { createPublicClient } from '@/utils/supabase/public';
import { listPublicStores } from '@/features/storefront/stores/server/queries';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const supabase = createPublicClient();
    const { searchParams } = new URL(request.url);
    const stores = await listPublicStores(supabase, {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort: searchParams.get('sort'),
    });

    return publicJson({
      success: true,
      data: stores.data,
      meta: stores.meta,
    });
  } catch (error) {
    console.error('Fetch Stores Error:', error);
    return errorJson('Failed to fetch stores');
  }
}
