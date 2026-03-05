import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

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

    return NextResponse.json({ success: true, data: stores });
  } catch (error) {
    console.error('Fetch Top Stores Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top stores' },
      { status: 500 }
    );
  }
}
