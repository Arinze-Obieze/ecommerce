// app/api/products/[id]/route.js
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function GET(request, { params }) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = params;

    // Fetch product with related categories
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(
          category_id,
          categories(
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    if (!product) {
      return Response.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    // Transform categories
    const categories = product.product_categories?.map(pc => ({
      id: pc.categories.id,
      name: pc.categories.name,
      slug: pc.categories.slug,
    })) || [];

    const transformedProduct = {
      ...product,
      categories,
    };

    // Remove nested product_categories for cleaner response
    delete transformedProduct.product_categories;

    return Response.json({
      success: true,
      data: transformedProduct,
    });
  } catch (error) {
    console.error('Product Detail API Error:', error);
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
