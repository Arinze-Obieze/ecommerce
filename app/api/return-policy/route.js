import { createClient } from '@/utils/supabase/server';
import { DEFAULT_RETURN_POLICY, normalizeReturnPolicyRecord } from '@/utils/catalog/return-policy';
import { errorJson, publicJson } from '@/utils/platform/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('platform_content')
    .select('title, description, data, updated_at, updated_by')
    .eq('content_key', 'return_policy')
    .maybeSingle();

  if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
    return errorJson(error.message);
  }

  return publicJson({
    success: true,
    data: data ? normalizeReturnPolicyRecord(data) : DEFAULT_RETURN_POLICY,
  }, { policy: 'publicDetail' });
}
