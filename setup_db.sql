-- 1. Add columns to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications jsonb;

-- 2. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id bigint REFERENCES public.products(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Set up RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to reviews
CREATE POLICY "Public reviews are viewable by everyone." 
ON public.reviews FOR SELECT USING (true);

-- Allow authenticated users to insert reviews
CREATE POLICY "Users can insert their own reviews."
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Optional: Allow users to update/delete their own reviews
CREATE POLICY "Users can update their own reviews."
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews."
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS products_sku_idx ON public.products(sku);
