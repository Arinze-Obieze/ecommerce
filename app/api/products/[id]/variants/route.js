import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { id } = await params;
    
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const numericId = Number(id);
        let productId = Number.isInteger(numericId) ? numericId : null;

        // Support slug-based product pages by resolving slug -> product_id first.
        if (!productId) {
            const { data: productBySlug, error: productError } = await supabase
                .from('products')
                .select('id')
                .eq('slug', id)
                .single();

            if (productError || !productBySlug) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }
            productId = productBySlug.id;
        }

        const { data: variants, error } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ variants });
    } catch (err) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
