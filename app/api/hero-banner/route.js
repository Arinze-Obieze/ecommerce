import { errorJson, publicJson } from '@/utils/platform/api-response';
import { createPublicClient } from '@/utils/supabase/public';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createPublicClient();

  try {
    // Fetch active banners
    const { data: bannerData, error: bannerError } = await supabase
      .from('banners')
      .select('id, title, subtitle, cta_text, cta_link, background_image, is_active, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (bannerError) {
      console.error('Error fetching banners:', bannerError);
      return errorJson('Failed to fetch hero banner');
    }

    // Count active & verified sellers
    const { count: sellerCount, error: countError } = await supabase
      .from('sellers')
      .select('id', { count: 'exact', head: true })
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

    return publicJson({
      banner: bannerData,
      sellerStats: {
        count: sellerCount || 0,
        averageRating,
      },
    }, { policy: 'publicShort' });
  } catch (error) {
    console.error('Server error fetching hero banner data:', error);
    return errorJson('Internal Server Error');
  }
}
