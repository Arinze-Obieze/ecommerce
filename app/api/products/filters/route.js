import { errorJson, publicJson } from '@/utils/platform/api-response'
import { createPublicClient } from '@/utils/supabase/public'

export const dynamic = 'force-dynamic';

async function resolveCategoryBranchIds(supabase, categorySlug) {
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_category_branch_ids', {
    p_slug: categorySlug,
  });

  if (!rpcError && Array.isArray(rpcData)) {
    return rpcData
      .map((row) => Number(row.id))
      .filter((id) => Number.isInteger(id));
  }

  const { data: catData } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!catData) {
    return [];
  }

  const { data: allCats } = await supabase
    .from('categories')
    .select('id, parent_id')
    .eq('is_active', true);

  const getDescendants = (parentId) => {
    const children = (allCats || []).filter((c) => c.parent_id === parentId);
    let descendants = [...children];
    children.forEach((child) => {
      descendants = [...descendants, ...getDescendants(child.id)];
    });
    return descendants;
  };

  const descendants = getDescendants(catData.id);
  return [catData.id, ...descendants.map((c) => c.id)];
}

export async function GET(request) {
  try {
    const supabase = createPublicClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const collection = searchParams.get('collection')

    let productIds = null;

    // Filter by Category
    if (category && category !== 'all') {
      const categoryIds = await resolveCategoryBranchIds(supabase, category);
      if (categoryIds.length === 0) {
        // Invalid category -> no products
        productIds = [];
      } else {
        const { data: pCats } = await supabase
          .from('product_categories')
          .select('product_id')
          .in('category_id', categoryIds);

        productIds = pCats?.map((x) => x.product_id) || [];
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
      .eq('is_active', true)
      .gt('stock_quantity', 0);

    if (productIds !== null) {
      if (productIds.length === 0) {
        // Return empty stats immediately
         return publicJson({
            success: true,
            data: {
              sizes: [],
              sizeCounts: {},
              colors: [],
              colorCounts: {},
              brands: [],
              priceRange: { min: 0, max: 1000 },
            }
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
    const sizeCounts = {}
    const colorCounts = {}
    let minPrice = Infinity
    let maxPrice = -Infinity

    products?.forEach(product => {
      // Sizes
      if (Array.isArray(product.sizes)) {
        product.sizes.forEach(s => {
          sizes.add(s)
          sizeCounts[s] = (sizeCounts[s] || 0) + 1
        })
      }
      // Colors
      if (Array.isArray(product.colors)) {
        product.colors.forEach(c => {
          colors.add(c)
          colorCounts[c] = (colorCounts[c] || 0) + 1
        })
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
      sizeCounts,
      colors: Array.from(colors).sort(),
      colorCounts,
      brands: [], 
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice === -Infinity ? 1000 : maxPrice 
      }
    }

    return publicJson({
      success: true,
      data: payload
    })

  } catch (error) {
    console.error('Filters API Error:', error)
    return errorJson('Failed to fetch product filters')
  }
}
