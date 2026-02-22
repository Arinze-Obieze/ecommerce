-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    rating NUMERIC DEFAULT 4.5,
    followers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add store_id to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);

-- Seed a default store for existing products (optional but good for consistency)
DO $$
DECLARE
    default_store_id UUID;
BEGIN
    -- Check if SHEIN exists, if not create it
    INSERT INTO stores (name, slug, description, rating, followers)
    VALUES ('SHEIN', 'shein', 'Global fashion retailer', 4.8, 15000)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO default_store_id;

    -- Update existing products to have this store if they don't have one
    UPDATE products 
    SET store_id = default_store_id 
    WHERE store_id IS NULL;
END $$;
