import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import redis from '@/utils/redis';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  // Await params for Next.js 15+
  const { id } = await params;
  const slug = id; // param is named 'id' but we use it as a slug logic
  
  if (!slug) {
    return NextResponse.json({ error: 'Slug/ID required' }, { status: 400 });
  }

  const cacheKey = `product:${slug}`;

  try {
    // 1. Try Cache
    if (redis) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        // @upstash/redis may automatically parse JSON
        if (typeof cachedData === 'object') {
             return NextResponse.json(cachedData);
        }
        return NextResponse.json(JSON.parse(cachedData));
      }
    }

    // 2. Fetch from DB
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Try fetching by slug first
    let { data: product, error } = await supabase
      .from('products')
      .select('*, product_categories(categories(*))')
      .eq('slug', slug)
      .single();

    // If not found by slug, maybe try ID? 
    // But since the frontend sends slug, we prioritize slug.
    if (error || !product) {
        // Optional: Could try to fetch by ID if slug fails, e.g. if slug looks like a UUID or ID
        // But for now let's stick to slug as primarily requested.
        console.error('Supabase Error (slug lookup):', error);
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Flatten logic matching frontend expectations
    const flattenedProduct = {
        ...product,
        category: product.product_categories?.[0]?.categories
    };

    // 3. Set Cache (TTL 5 mins)
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(flattenedProduct), { ex: 300 });
    }

    return NextResponse.json(flattenedProduct);

  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
