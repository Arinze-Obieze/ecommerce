import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DEFAULT_RETURN_POLICY, normalizeReturnPolicyRecord } from '@/utils/returnPolicy';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('platform_content')
    .select('title, description, data, updated_at, updated_by')
    .eq('content_key', 'return_policy')
    .maybeSingle();

  if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data ? normalizeReturnPolicyRecord(data) : DEFAULT_RETURN_POLICY,
  });
}
