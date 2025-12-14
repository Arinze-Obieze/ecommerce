// app/api/categories/route.js
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    
    // Get all active categories with product counts
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        parent_id,
        image_url,
        display_order,
        is_active,
        product_categories(count)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    // Transform data to include product count
    const transformedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parent_id: cat.parent_id,
      image_url: cat.image_url,
      display_order: cat.display_order,
      productCount: cat.product_categories?.[0]?.count || 0,
    }));

    // Optionally build hierarchy
    const hierarchical = buildCategoryHierarchy(transformedCategories);

    return Response.json({
      success: true,
      data: transformedCategories,
      hierarchical,
      meta: {
        total: transformedCategories.length,
      },
    });
  } catch (error) {
    console.error('Categories API Error:', error);
    return Response.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}

// Helper: Build hierarchical category structure
function buildCategoryHierarchy(categories) {
  const categoryMap = new Map();
  const roots = [];

  // First pass: create map
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Second pass: build hierarchy
  categories.forEach(cat => {
    if (cat.parent_id) {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(categoryMap.get(cat.id));
      }
    } else {
      roots.push(categoryMap.get(cat.id));
    }
  });

  return roots;
}
