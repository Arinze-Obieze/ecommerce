-- Add slug column
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Update existing products with a temporary slug based on ID/Name if needed
-- (Since we are re-seeding, this might not be strictly necessary for new data, but good for existing)
UPDATE products SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;

-- Add unique constraint
ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
