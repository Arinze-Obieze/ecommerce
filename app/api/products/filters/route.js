import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Base query
    let query = supabase.from('products').select('sizes, colors, price, discount_price')

    // If category is filtered, we might want to narrow down available filters? 
    // Usually "available filters" shows EVERYTHING unless faceted search is desired.
    // For simplicity, let's fetch global aggregations or simple faceted if efficient.
    // Given Supabase limitations on easy aggregations without RPC, we'll fetch basic stats.
    
    // Fetch all active products
    const { data: products, error } = await query.eq('is_active', true)

    if (error) throw error

    // Aggregate in JS
    const sizes = new Set()
    const colors = new Set()
    let minPrice = Infinity
    let maxPrice = -Infinity

    products?.forEach(product => {
      // Sizes
      if (Array.isArray(product.sizes)) {
        product.sizes.forEach(s => sizes.add(s))
      }
      // Colors
      if (Array.isArray(product.colors)) {
        product.colors.forEach(c => colors.add(c))
      }
      // Prices (consider discount price if you want "effective" price range, but usually catalog price is standard)
      const price = product.price
      if (typeof price === 'number') {
        minPrice = Math.min(minPrice, price)
        maxPrice = Math.max(maxPrice, price)
      }
    })

    // Prepare response
    const payload = {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      brands: [], // Add brands if you have a brands column later
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice === -Infinity ? 1000 : maxPrice // default fallback
      }
    }

    return Response.json({
      success: true,
      data: payload
    })

  } catch (error) {
    console.error('Filters API Error:', error)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
