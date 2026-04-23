import { errorJson, publicJson } from '@/utils/platform/api-response';
import { createPublicClient } from '@/utils/supabase/public';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    const { id } = await params;
    
    try {
        const supabase = createPublicClient();

        const numericId = Number(id);
        let productId = Number.isInteger(numericId) ? numericId : null;

        // Support slug-based product pages by resolving slug -> product_id first.
        if (!productId) {
            const { data: productBySlug, error: productError } = await supabase
                .from('products')
                .select('id')
                .eq('slug', id)
                .eq('is_active', true)
                .eq('moderation_status', 'approved')
                .single();

            if (productError || !productBySlug) {
                return errorJson('Product not found', 404);
            }
            productId = productBySlug.id;
        }

        if (productId) {
            const { data: product, error: productError } = await supabase
                .from('products')
                .select('id')
                .eq('id', productId)
                .eq('is_active', true)
                .eq('moderation_status', 'approved')
                .single();

            if (productError || !product) {
                return errorJson('Product not found', 404);
            }
        }

        const { data: variants, error } = await supabase
            .from('product_variants')
            .select('id, product_id, color, size, price_modifier, stock_quantity, color_hex, color_family, color_source, created_at')
            .eq('product_id', productId);

        if (error) {
            return errorJson('Failed to load product variants', 400);
        }

        return publicJson({ success: true, variants: variants || [] });
    } catch (err) {
        return errorJson('Server Error');
    }
}
