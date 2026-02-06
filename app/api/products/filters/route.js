import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const collection = searchParams.get('collection')

    // Base query
    let query = supabase.from('products').select(`
      price,
      sizes,
      colors,
      is_active,
      product_categories!inner (
        category_id,
        categories!inner ( slug )
      )
    `)

    // We need to build the query carefully. 
    // If filtering by category, we need to join product_categories.
    // If filtering by collection, we join product_collections.
    // Supabase JS complex joins can be tricky. 
    
    // Simpler approach: 
    // 1. Get Product IDs for Category/Collection first (if needed)
    // 2. Query products with those IDs.
    
    let productIds = null;

    // Filter by Category
    if (category && category !== 'all') {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      
      if (catData) {
        // Fetch descendants to include sub-categories
        const { data: allCats } = await supabase
            .from('categories')
            .select('id, parent_id')
            .eq('is_active', true);
            
        const getDescendants = (parentId) => {
            let children = allCats.filter(c => c.parent_id === parentId);
            let descendants = [...children];
            children.forEach(child => {
                descendants = [...descendants, ...getDescendants(child.id)];
            });
            return descendants;
        };

        const descendants = getDescendants(catData.id);
        const categoryIds = [catData.id, ...descendants.map(c => c.id)];

        const { data: pCats } = await supabase
          .from('product_categories')
          .select('product_id')
          .in('category_id', categoryIds);
        
        const ids = pCats?.map(x => x.product_id) || [];
        productIds = ids;
      } else {
        // Invalid category -> no products
        productIds = [];
      }
    }

    // Filter by Collection (intersection if both are present?)
    if (collection) {
      const { data: colData } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', collection)
        .single();
        
      if (colData) {
        const { data: pCols } = await supabase
          .from('product_collections')
          .select('product_id')
          .eq('collection_id', colData.id);
          
        const ids = pCols?.map(x => x.product_id) || [];
        
        if (productIds !== null) {
          // Intersection
          productIds = productIds.filter(id => ids.includes(id));
        } else {
          productIds = ids;
        }
      } else {
          // Invalid collection
          productIds = [];
      }
    }

    // Build Main Query
    let productsQuery = supabase
      .from('products')
      .select('sizes, colors, price, discount_price')
      .eq('is_active', true);

    if (productIds !== null) {
      if (productIds.length === 0) {
        // Return empty stats immediately
         return Response.json({
            success: true,
            data: { sizes: [], colors: [], brands: [], priceRange: { min: 0, max: 1000 } }
         });
      }
      productsQuery = productsQuery.in('id', productIds);
    }

    const { data: products, error } = await productsQuery;

    if (error) {
        console.error('Error fetching products for filters:', error);
        throw error;
    }

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
      // Prices
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
      brands: [], 
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice === -Infinity ? 1000 : maxPrice 
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
