import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Insert the review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting review:', insertError);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    // Optional: We could update the overall product rating/review count here if we were caching it on the products table,
    // but typically it can be computed or updated via an RPC/Trigger for better consistency.

    return NextResponse.json(review, { status: 201 });

  } catch (err) {
    console.error('Reviews API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
