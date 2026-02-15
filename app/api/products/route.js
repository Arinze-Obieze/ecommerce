// app/api/products/route.js
import { createClient } from '@/utils/supabase/server'

// Constants
const DEFAULT_LIMIT = 24  // Good for grids (6x4, 4x6, 8x3)
const MAX_LIMIT = 100     // Prevent abuse
const MAX_PAGE_SIZE = 10  // Max page buttons to show

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const url = new URL(request.url)
    
    // Parse and validate
    let page = parseInt(searchParams.get('page') || '1')
    let limit = parseInt(searchParams.get('limit') || DEFAULT_LIMIT)
    
    // Ensure valid values
    page = Math.max(1, page)
    limit = Math.min(Math.max(1, limit), MAX_LIMIT)
    
    const offset = (page - 1) * limit
    
    // Get filter parameters
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const search = searchParams.get('search')
    const sizesParam = searchParams.get('sizes')
    const colorsParam = searchParams.get('colors')
    const featured = searchParams.get('featured')
    const hasDiscount = searchParams.get('hasDiscount')
    const idsParam = searchParams.get('ids')
    
    const sizes = sizesParam ? sizesParam.split(',').filter(Boolean) : []
    const colors = colorsParam ? colorsParam.split(',').filter(Boolean) : []
    
    // Build query
    let query = supabase
      .from('products')
      .select(`*`, { 
        count: 'exact' 
      })
      .eq('is_active', true)
      .gt('stock_quantity', 0) // Hide out of stock items per user request
    
    // Apply category filter via junction table
    if (category && category !== 'all') {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()
      
      if (categoryData) {
        // Recursive fetch for descendant categories to support branch filtering
        // Supabase recursive queries (CTE) require rpc or raw sql, but we can do a simpler
        // approach if depth is limited (3 levels) or just fetch all categories once.
        
        // Better yet: Get all categories flat, find descendants in JS, then filter products.
        // OR: use the 'product_categories' junction.
        
        // Simple optimization: Get the category and all its children.
        const { data: allCats } = await supabase
            .from('categories')
            .select('id, parent_id')
            .eq('is_active', true);
            
        // Helper to find all descendants
        const getDescendants = (parentId) => {
            let children = allCats.filter(c => c.parent_id === parentId);
            let descendants = [...children];
            children.forEach(child => {
                descendants = [...descendants, ...getDescendants(child.id)];
            });
            return descendants;
        };

        const descendants = getDescendants(categoryData.id);
        const categoryIds = [categoryData.id, ...descendants.map(c => c.id)];

        const { data: productIds } = await supabase
          .from('product_categories')
          .select('product_id')
          .in('category_id', categoryIds)
        
        const ids = productIds?.map(p => p.product_id) || []
        if (ids.length > 0) {
          query = query.in('id', ids)
        } else {
          query = query.eq('id', -1)
        }
      }
    }

    // Apply collection filter
    const collection = searchParams.get('collection')
    if (collection) {
      const { data: collectionData } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', collection)
        .single()
      
      if (collectionData) {
        const { data: productIds } = await supabase
          .from('product_collections')
          .select('product_id')
          .eq('collection_id', collectionData.id)
        
        const ids = productIds?.map(p => p.product_id) || []
        if (ids.length > 0) {
          query = query.in('id', ids)
        } else {
          query = query.eq('id', -1)
        }
      }
    }
    
    // Apply price range filters
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }
    
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }
    
    // Apply size filter
    if (sizes.length > 0) {
      // For array contains, we need to check if any of the filter sizes exist in product sizes
      for (const size of sizes) {
        query = query.contains('sizes', [size])
      }
    }
    
    // Apply color filter
    if (colors.length > 0) {
      for (const color of colors) {
        query = query.contains('colors', [color])
      }
    }
    
    // Apply text search
    if (search && search.trim()) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    // Apply featured filter
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    // Apply discount filter
    if (hasDiscount === 'true') {
      query = query.not('discount_price', 'is', null)
    }

    // Apply IDs filter
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean)
      if (ids.length > 0) {
        query = query.in('id', ids)
      }
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      case 'name':
        query = query.order('name', { ascending: true })
        break
      default: // 'newest' or 'featured'
        query = query.order('created_at', { ascending: false })
    }
    
    // Add secondary sort for consistency
    query = query.order('id', { ascending: true })
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    // Transform data to include category names
    const transformedData = (data || []).map(product => ({
      ...product,
      categories: product.product_categories?.map(pc => ({
        id: pc.categories.id,
        name: pc.categories.name,
        slug: pc.categories.slug,
      })) || [],
    }));

    // Remove nested product_categories
    transformedData.forEach(p => delete p.product_categories);
    
    // Calculate pagination info
    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / limit)
    
    // Ensure page is within bounds
    if (page > totalPages && totalPages > 0) {
      page = totalPages
    }
    
    // Generate page numbers for UI
    const pageNumbers = generatePageNumbers(page, totalPages, MAX_PAGE_SIZE)
    
    // Generate links for API response
    const baseUrl = `${url.origin}${url.pathname}`
    const links = generatePageLinks(baseUrl, searchParams, page, totalPages, limit)
    
    return Response.json({
      success: true,
      data: transformedData,
      meta: {
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          startItem: totalItems > 0 ? offset + 1 : 0,
          endItem: Math.min(offset + limit, totalItems),
          pageNumbers
        },
        filters: {
          category,
          collection,
          minPrice,
          maxPrice,
          sortBy,
          search,
          sizes,
          colors
        },
        links
      }
    })
    
  } catch (error) {
    console.error('Products API Error:', error)
    return Response.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 })
  }
}

// Helper: Generate page numbers array like [1, 2, 3, 4, 5]
function generatePageNumbers(currentPage, totalPages, maxPages = 10) {
  if (totalPages <= 1) return [1]
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2))
  let endPage = Math.min(totalPages, startPage + maxPages - 1)
  
  // Adjust if we're near the end
  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1)
  }
  
  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  )
}

// Helper: Generate HATEOAS-style links
function generatePageLinks(baseUrl, searchParams, currentPage, totalPages, limit) {
  const params = new URLSearchParams(searchParams)
  params.set('limit', limit.toString())
  
  const links = {
    first: null,
    last: null,
    prev: null,
    next: null,
    self: null
  }
  
  // Self link
  params.set('page', currentPage.toString())
  links.self = `${baseUrl}?${params.toString()}`
  
  // First page
  params.set('page', '1')
  links.first = `${baseUrl}?${params.toString()}`
  
  // Last page
  params.set('page', totalPages.toString())
  links.last = `${baseUrl}?${params.toString()}`
  
  // Previous page
  if (currentPage > 1) {
    params.set('page', (currentPage - 1).toString())
    links.prev = `${baseUrl}?${params.toString()}`
  }
  
  // Next page
  if (currentPage < totalPages) {
    params.set('page', (currentPage + 1).toString())
    links.next = `${baseUrl}?${params.toString()}`
  }
  
  return links
}