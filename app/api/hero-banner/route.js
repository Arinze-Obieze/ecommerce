import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();

  try {
    // Fetch active banners
    const { data: bannerData, error: bannerError } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (bannerError) {
      console.error('Error fetching banners:', bannerError);
      return NextResponse.json({ error: bannerError.message }, { status: 500 });
    }

    // Count active & verified sellers
    const { count: sellerCount, error: countError } = await supabase
      .from('sellers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('verification_status', 'verified');

    if (countError) {
      console.error('Error fetching seller count:', countError);
    }

    // Average store_rating for active & verified sellers (exclude 0 ratings)
    const { data: ratingData, error: ratingError } = await supabase
      .from('sellers')
      .select('store_rating')
      .eq('status', 'active')
      .eq('verification_status', 'verified')
      .gt('store_rating', 0);

    if (ratingError) {
      console.error('Error fetching seller ratings:', ratingError);
    }

    let averageRating = 0;
    if (ratingData && ratingData.length > 0) {
      const sum = ratingData.reduce((acc, s) => acc + Number(s.store_rating), 0);
      averageRating = parseFloat((sum / ratingData.length).toFixed(1));
    }

    return NextResponse.json({
      banner: bannerData,
      sellerStats: {
        count: sellerCount || 0,
        averageRating,
      },
    });
  } catch (error) {
    console.error('Server error fetching hero banner data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}