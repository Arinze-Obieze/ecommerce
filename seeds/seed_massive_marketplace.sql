-- ============================================================================
-- MASSIVE MULTI-VENDOR MARKETPLACE SEED (IDEMPOTENT)
-- ============================================================================
-- Goals:
-- 1) Use existing categories (does not truncate categories)
-- 2) Products are published by stores (store_id always set)
-- 3) Large catalog with realistic media/specifications
-- 4) Includes images, videos, category links, collections, variants
-- 5) Safe to rerun
--
-- Recommended order:
--   a) Apply your schema migrations first
--   b) Run this file
--
-- Notes:
-- - This seed assumes pgcrypto is available (gen_random_uuid) in Supabase.
-- - It intentionally avoids destructive TRUNCATE/DROP operations.
-- ============================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- 0) Compatibility guards for common schema drift
-- --------------------------------------------------------------------------
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_urls text[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_urls text[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0.0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.product_categories ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;

-- --------------------------------------------------------------------------
-- 1) Seed stores (multi-vendor)
-- --------------------------------------------------------------------------
INSERT INTO public.stores (name, slug, description, logo_url)
VALUES
  ('Urban Loom', 'urban-loom', 'Streetwear and elevated casual essentials for everyday style.', 'https://picsum.photos/seed/store-urban-loom/300/300'),
  ('Velvet Orbit', 'velvet-orbit', 'Modern women''s fashion with polished silhouettes and soft tailoring.', 'https://picsum.photos/seed/store-velvet-orbit/300/300'),
  ('North Anchor', 'north-anchor', 'Outerwear, denim, and utility staples inspired by city movement.', 'https://picsum.photos/seed/store-north-anchor/300/300'),
  ('Sole Republic', 'sole-republic', 'Footwear-first label spanning sneakers, loafers, and dress shoes.', 'https://picsum.photos/seed/store-sole-republic/300/300'),
  ('Carry Culture', 'carry-culture', 'Bags, luggage, and daily carry accessories with clean design.', 'https://picsum.photos/seed/store-carry-culture/300/300'),
  ('Kidz Atelier', 'kidz-atelier', 'Durable, playful styles for boys and girls.', 'https://picsum.photos/seed/store-kidz-atelier/300/300'),
  ('Native Weave House', 'native-weave-house', 'Contemporary African-inspired nativewear and occasion sets.', 'https://picsum.photos/seed/store-native-weave-house/300/300'),
  ('Prime Basics Co', 'prime-basics-co', 'Affordable wardrobe fundamentals with dependable quality.', 'https://picsum.photos/seed/store-prime-basics/300/300'),
  ('Lumen Luxe', 'lumen-luxe', 'Refined premium edits for special events and formalwear.', 'https://picsum.photos/seed/store-lumen-luxe/300/300'),
  ('Trend Harbor', 'trend-harbor', 'Fast-moving seasonal drops across categories.', 'https://picsum.photos/seed/store-trend-harbor/300/300'),
  ('AeroFit Studio', 'aerofit-studio', 'Athleisure and performance-inspired apparel.', 'https://picsum.photos/seed/store-aerofit/300/300'),
  ('Monarch Threads', 'monarch-threads', 'Signature smart-casual apparel for men and women.', 'https://picsum.photos/seed/store-monarch/300/300'),
  ('Harbor Lane Outfitters', 'harbor-lane-outfitters', 'Laidback apparel and layered essentials for everyday wear.', 'https://picsum.photos/seed/store-harbor-lane/300/300'),
  ('Atlas Field Co', 'atlas-field-co', 'Practical utility staples, durable fabrics, and modern cuts.', 'https://picsum.photos/seed/store-atlas-field/300/300'),
  ('Bloom & Borough', 'bloom-and-borough', 'Feminine, occasion-ready looks with contemporary details.', 'https://picsum.photos/seed/store-bloom-borough/300/300'),
  ('Cobalt Craft', 'cobalt-craft', 'Smart accessories and polished finishing pieces for all seasons.', 'https://picsum.photos/seed/store-cobalt-craft/300/300'),
  ('Summit Step', 'summit-step', 'Comfort-led footwear for daily movement and city commutes.', 'https://picsum.photos/seed/store-summit-step/300/300'),
  ('Tiny Trails', 'tiny-trails', 'Kidswear built for play, school days, and family outings.', 'https://picsum.photos/seed/store-tiny-trails/300/300')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url;

-- --------------------------------------------------------------------------
-- 2) Seed collections (non-destructive)
-- --------------------------------------------------------------------------
INSERT INTO public.collections (name, slug, description, image_url, is_active, display_order)
VALUES
  ('Best Sellers', 'best-sellers', 'Most loved items based on rating and demand signals.', 'https://picsum.photos/seed/col-best-sellers/1200/500', true, 1),
  ('New Arrivals', 'new-arrivals', 'Freshly published products across stores.', 'https://picsum.photos/seed/col-new-arrivals/1200/500', true, 2),
  ('On Sale', 'on-sale', 'Products currently offered at a discount.', 'https://picsum.photos/seed/col-on-sale/1200/500', true, 3),
  ('Editor''s Picks', 'editors-picks', 'Curated picks selected for quality and style.', 'https://picsum.photos/seed/col-editors-picks/1200/500', true, 4),
  ('Everyday Essentials', 'everyday-essentials', 'Reliable staples for daily wear.', 'https://picsum.photos/seed/col-everyday/1200/500', true, 5),
  ('Premium Select', 'premium-select', 'Higher-ticket pieces and premium constructions.', 'https://picsum.photos/seed/col-premium/1200/500', true, 6),
  ('Weekend Casual', 'weekend-casual', 'Relaxed pieces for off-duty comfort.', 'https://picsum.photos/seed/col-weekend/1200/500', true, 7),
  ('Occasion Ready', 'occasion-ready', 'Dress-up looks for events and celebrations.', 'https://picsum.photos/seed/col-occasion/1200/500', true, 8),
  ('Back To School', 'back-to-school', 'Kids and school-friendly essentials.', 'https://picsum.photos/seed/col-school/1200/500', true, 9),
  ('Travel Ready', 'travel-ready', 'Luggage, carry solutions, and travel staples.', 'https://picsum.photos/seed/col-travel/1200/500', true, 10),
  ('Street Edit', 'street-edit', 'Trend-led urban and streetwear silhouettes.', 'https://picsum.photos/seed/col-street/1200/500', true, 11),
  ('Native Heritage', 'native-heritage', 'African-inspired and nativewear curation.', 'https://picsum.photos/seed/col-native/1200/500', true, 12)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- --------------------------------------------------------------------------
-- 3) Massive product catalog generation (uses existing categories only)
-- --------------------------------------------------------------------------
-- Product count target: 900
-- Distribution: evenly across stores and available leaf categories.

WITH stores_ranked AS (
  SELECT id, slug, name, row_number() OVER (ORDER BY slug) AS rn
  FROM public.stores
  WHERE slug IN (
    'urban-loom', 'velvet-orbit', 'north-anchor', 'sole-republic',
    'carry-culture', 'kidz-atelier', 'native-weave-house', 'prime-basics-co',
    'lumen-luxe', 'trend-harbor', 'aerofit-studio', 'monarch-threads'
  )
),
store_count AS (
  SELECT COUNT(*)::int AS cnt FROM stores_ranked
),
leaf_categories AS (
  SELECT c.id, c.slug, c.name, row_number() OVER (ORDER BY c.slug) AS rn
  FROM public.categories c
  WHERE c.is_active = true
    AND NOT EXISTS (
      SELECT 1
      FROM public.categories child
      WHERE child.parent_id = c.id
        AND child.is_active = true
    )
),
leaf_count AS (
  SELECT COUNT(*)::int AS cnt FROM leaf_categories
),
src AS (
  SELECT gs AS seq,
         ((gs - 1) % (SELECT cnt FROM store_count)) + 1 AS store_rn,
         ((gs - 1) % (SELECT cnt FROM leaf_count)) + 1 AS category_rn
  FROM generate_series(1, 900) gs
),
resolved AS (
  SELECT
    src.seq,
    s.id AS store_id,
    s.slug AS store_slug,
    s.name AS store_name,
    c.id AS category_id,
    c.slug AS category_slug,
    c.name AS category_name
  FROM src
  JOIN stores_ranked s ON s.rn = src.store_rn
  JOIN leaf_categories c ON c.rn = src.category_rn
),
prepared AS (
  SELECT
    r.*,
    (
      CASE (r.seq % 12)
        WHEN 0 THEN 'Premium'
        WHEN 1 THEN 'Classic'
        WHEN 2 THEN 'Modern'
        WHEN 3 THEN 'Essential'
        WHEN 4 THEN 'Signature'
        WHEN 5 THEN 'Refined'
        WHEN 6 THEN 'Urban'
        WHEN 7 THEN 'Tailored'
        WHEN 8 THEN 'Comfort'
        WHEN 9 THEN 'Performance'
        WHEN 10 THEN 'Elegant'
        ELSE 'Daily'
      END
    ) AS adjective,
    (
      CASE (r.seq % 14)
        WHEN 0 THEN 'Edition'
        WHEN 1 THEN 'Series'
        WHEN 2 THEN 'Fit'
        WHEN 3 THEN 'Collection'
        WHEN 4 THEN 'Line'
        WHEN 5 THEN 'Range'
        WHEN 6 THEN 'Set'
        WHEN 7 THEN 'Studio'
        WHEN 8 THEN 'Craft'
        WHEN 9 THEN 'Core'
        WHEN 10 THEN 'Select'
        WHEN 11 THEN 'Drop'
        WHEN 12 THEN 'Capsule'
        ELSE 'Form'
      END
    ) AS suffix
  FROM resolved r
),
final_rows AS (
  SELECT
    p.*,
    ('mv-' || p.store_slug || '-' || p.category_slug || '-' || lpad(p.seq::text, 4, '0')) AS slug,
    (
      p.adjective || ' ' || p.category_name || ' ' || p.suffix || ' ' || lpad(p.seq::text, 4, '0')
    ) AS product_name,
    (
      'Designed by ' || p.store_name || ' for the ' || p.category_name || ' segment. ' ||
      'This product balances durability, comfort, and premium finish. ' ||
      'Built for repeat use with quality-first construction, reliable stitching, and easy care instructions. '
    ) AS product_description,
    (
      CASE
        WHEN p.category_slug ILIKE '%footwear%' OR p.category_slug ILIKE '%shoe%' OR p.category_slug ILIKE '%sneaker%' OR p.category_slug ILIKE '%boots%'
          THEN ARRAY['38','39','40','41','42','43','44']::text[]
        WHEN p.category_slug ILIKE '%kids%'
          THEN ARRAY['2-3Y','3-4Y','4-5Y','5-6Y','6-7Y','7-8Y']::text[]
        WHEN p.category_slug ILIKE '%bag%' OR p.category_slug ILIKE '%luggage%' OR p.category_slug ILIKE '%watch%' OR p.category_slug ILIKE '%jewelry%' OR p.category_slug ILIKE '%sunglasses%' OR p.category_slug ILIKE '%caps%' OR p.category_slug ILIKE '%hats%'
          THEN ARRAY['One Size']::text[]
        ELSE ARRAY['XS','S','M','L','XL','XXL']::text[]
      END
    ) AS sizes,
    (
      CASE
        WHEN p.category_slug ILIKE '%kids%'
          THEN ARRAY['Sky Blue','Coral','Lime','Navy']::text[]
        WHEN p.category_slug ILIKE '%native%' OR p.category_slug ILIKE '%ankara%'
          THEN ARRAY['Indigo','Wine','Emerald','Gold Accent']::text[]
        WHEN p.category_slug ILIKE '%footwear%' OR p.category_slug ILIKE '%shoe%' OR p.category_slug ILIKE '%sneaker%' OR p.category_slug ILIKE '%boots%'
          THEN ARRAY['Black','White','Tan','Charcoal']::text[]
        ELSE ARRAY['Black','White','Navy','Olive','Beige']::text[]
      END
    ) AS colors,
    (
      CASE
        WHEN p.category_slug ILIKE '%accessories%' OR p.category_slug ILIKE '%bag%' OR p.category_slug ILIKE '%luggage%'
          THEN ((5000 + (p.seq % 20) * 1700)::numeric)
        WHEN p.category_slug ILIKE '%footwear%' OR p.category_slug ILIKE '%shoe%' OR p.category_slug ILIKE '%sneaker%' OR p.category_slug ILIKE '%boots%'
          THEN ((12000 + (p.seq % 25) * 2200)::numeric)
        WHEN p.category_slug ILIKE '%native%'
          THEN ((18000 + (p.seq % 25) * 3000)::numeric)
        ELSE ((7000 + (p.seq % 30) * 1900)::numeric)
      END
    ) AS base_price,
    (3.8 + ((p.seq % 12) * 0.1))::numeric(3,2) AS calc_rating,
    ((p.seq % 9) = 0) AS mark_featured,
    ((p.seq % 3) = 0) AS mark_discount,
    (12 + (p.seq % 150))::int AS qty,
    ('SKU-' || upper(substr(p.store_slug,1,4)) || '-' || lpad(p.seq::text, 5, '0')) AS sku
  FROM prepared p
)
INSERT INTO public.products (
  store_id,
  name,
  slug,
  description,
  price,
  discount_price,
  stock_quantity,
  rating,
  is_active,
  is_featured,
  sku,
  sizes,
  colors,
  specifications,
  image_urls,
  video_urls,
  created_at,
  updated_at
)
SELECT
  f.store_id,
  f.product_name,
  f.slug,
  f.product_description,
  f.base_price,
  CASE WHEN f.mark_discount THEN round(f.base_price * 0.85, 0) ELSE NULL END,
  f.qty,
  LEAST(f.calc_rating, 5.0),
  true,
  f.mark_featured,
  f.sku,
  f.sizes,
  f.colors,
  jsonb_build_object(
    'material',
      CASE (f.seq % 7)
        WHEN 0 THEN '100% Cotton'
        WHEN 1 THEN 'Cotton-Poly Blend'
        WHEN 2 THEN 'Premium Denim'
        WHEN 3 THEN 'Genuine Leather'
        WHEN 4 THEN 'Viscose Blend'
        WHEN 5 THEN 'Linen Blend'
        ELSE 'Technical Knit'
      END,
    'fit',
      CASE (f.seq % 5)
        WHEN 0 THEN 'Regular Fit'
        WHEN 1 THEN 'Slim Fit'
        WHEN 2 THEN 'Relaxed Fit'
        WHEN 3 THEN 'Tailored Fit'
        ELSE 'Comfort Fit'
      END,
    'origin', 'Designed for ZOVA Marketplace Vendors',
    'care', 'Machine wash cold, mild detergent, do not bleach, air dry where possible.',
    'warranty', '30-day workmanship guarantee',
    'category_slug', f.category_slug,
    'store_slug', f.store_slug,
    'highlights', jsonb_build_array(
      'Durable stitching',
      'Breathable comfort',
      'Colorfast finish',
      'Quality-tested materials'
    )
  ),
  ARRAY[
    'https://picsum.photos/seed/' || f.slug || '-1/900/1200',
    'https://picsum.photos/seed/' || f.slug || '-2/900/1200',
    'https://picsum.photos/seed/' || f.slug || '-3/900/1200',
    'https://picsum.photos/seed/' || f.slug || '-4/900/1200'
  ]::text[],
  CASE
    WHEN (f.seq % 4) = 0 THEN ARRAY[
      CASE (f.seq % 3)
        WHEN 0 THEN 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4'
        WHEN 1 THEN 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4'
        ELSE 'https://samplelib.com/lib/preview/mp4/sample-15s.mp4'
      END
    ]::text[]
    WHEN (f.seq % 9) = 0 THEN ARRAY[
      'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
      'https://samplelib.com/lib/preview/mp4/sample-10s.mp4'
    ]::text[]
    ELSE NULL
  END,
  now() - ((f.seq % 120)::text || ' days')::interval,
  now()
FROM final_rows f
ON CONFLICT (slug) DO UPDATE
SET
  store_id = EXCLUDED.store_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  stock_quantity = EXCLUDED.stock_quantity,
  rating = EXCLUDED.rating,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  sku = EXCLUDED.sku,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  specifications = EXCLUDED.specifications,
  image_urls = EXCLUDED.image_urls,
  video_urls = EXCLUDED.video_urls,
  updated_at = now();

-- --------------------------------------------------------------------------
-- 3b) Backfill orphan products (already-existing rows with NULL store_id)
-- --------------------------------------------------------------------------
-- Distribute across all available active stores (existing + newly seeded).
WITH candidate_stores AS (
  SELECT
    s.id,
    row_number() OVER (ORDER BY s.created_at NULLS LAST, s.slug, s.id) AS rn
  FROM public.stores s
  WHERE COALESCE(s.is_active, true) = true
),
candidate_count AS (
  SELECT COUNT(*)::int AS cnt FROM candidate_stores
),
orphans AS (
  SELECT
    p.id AS product_id,
    row_number() OVER (ORDER BY p.created_at NULLS LAST, p.id) AS rn
  FROM public.products p
  WHERE p.store_id IS NULL
),
resolved AS (
  SELECT
    o.product_id,
    s.id AS store_id
  FROM orphans o
  JOIN candidate_stores s
    ON s.rn = (((o.rn - 1) % (SELECT cnt FROM candidate_count)) + 1)
)
UPDATE public.products p
SET
  store_id = r.store_id,
  updated_at = now()
FROM resolved r
WHERE p.id = r.product_id
  AND p.store_id IS NULL;

-- --------------------------------------------------------------------------
-- 4) Map seeded products to existing categories (primary category)
-- --------------------------------------------------------------------------
WITH leaf_categories AS (
  SELECT c.id, c.slug, row_number() OVER (ORDER BY c.slug) AS rn
  FROM public.categories c
  WHERE c.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.categories ch
      WHERE ch.parent_id = c.id
        AND ch.is_active = true
    )
),
leaf_count AS (
  SELECT COUNT(*)::int AS cnt FROM leaf_categories
),
seeded AS (
  SELECT
    p.id AS product_id,
    p.slug,
    substring(p.slug FROM '([0-9]+)$')::int AS seq
  FROM public.products p
  WHERE p.slug LIKE 'mv-%'
),
resolved AS (
  SELECT
    s.product_id,
    c.id AS category_id
  FROM seeded s
  JOIN leaf_categories c
    ON c.rn = (((s.seq - 1) % (SELECT cnt FROM leaf_count)) + 1)
)
INSERT INTO public.product_categories (product_id, category_id, is_primary)
SELECT r.product_id, r.category_id, true
FROM resolved r
WHERE NOT EXISTS (
  SELECT 1
  FROM public.product_categories pc
  WHERE pc.product_id = r.product_id
    AND pc.category_id = r.category_id
);

-- --------------------------------------------------------------------------
-- 5) Collection assignments (large and meaningful)
-- --------------------------------------------------------------------------
-- Helper CTEs
WITH col AS (
  SELECT id, slug FROM public.collections
  WHERE slug IN (
    'best-sellers','new-arrivals','on-sale','editors-picks','everyday-essentials',
    'premium-select','weekend-casual','occasion-ready','back-to-school',
    'travel-ready','street-edit','native-heritage'
  )
),
seeded_products AS (
  SELECT id, slug, price, discount_price, rating, is_featured, created_at, specifications
  FROM public.products
  WHERE slug LIKE 'mv-%'
),
candidate_links AS (
  SELECT p.id AS product_id, c.id AS collection_id,
         row_number() OVER (PARTITION BY c.slug ORDER BY p.created_at DESC, p.id DESC) AS display_order
  FROM seeded_products p
  JOIN col c ON (
    (c.slug = 'new-arrivals') OR
    (c.slug = 'on-sale' AND p.discount_price IS NOT NULL) OR
    (c.slug = 'best-sellers' AND p.rating >= 4.6) OR
    (c.slug = 'editors-picks' AND (p.is_featured = true OR p.rating >= 4.7)) OR
    (c.slug = 'everyday-essentials' AND p.price BETWEEN 7000 AND 25000) OR
    (c.slug = 'premium-select' AND p.price >= 45000) OR
    (c.slug = 'weekend-casual' AND (p.slug ILIKE '%casual%' OR p.slug ILIKE '%comfort%' OR p.slug ILIKE '%urban%')) OR
    (c.slug = 'occasion-ready' AND p.price >= 30000 AND p.rating >= 4.3) OR
    (c.slug = 'back-to-school' AND (
      p.slug ILIKE '%kids-%' OR
      COALESCE(p.specifications->>'category_slug','') ILIKE '%kids%'
    )) OR
    (c.slug = 'travel-ready' AND (
      COALESCE(p.specifications->>'category_slug','') ILIKE '%luggage%' OR
      p.slug ILIKE '%travel%'
    )) OR
    (c.slug = 'street-edit' AND (
      p.slug ILIKE '%urban%' OR p.slug ILIKE '%street%'
    )) OR
    (c.slug = 'native-heritage' AND (
      COALESCE(p.specifications->>'category_slug','') ILIKE '%native%'
    ))
  )
)
INSERT INTO public.product_collections (product_id, collection_id, display_order, created_at)
SELECT cl.product_id, cl.collection_id, cl.display_order, now()
FROM candidate_links cl
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_collections pc
  WHERE pc.product_id = cl.product_id
    AND pc.collection_id = cl.collection_id
);

-- --------------------------------------------------------------------------
-- 6) Variant generation (bounded to avoid explosive cartesian growth)
-- --------------------------------------------------------------------------
WITH seeded_products AS (
  SELECT id, price, sizes, colors
  FROM public.products
  WHERE slug LIKE 'mv-%'
),
size_values AS (
  SELECT p.id AS product_id, s.size, s.ord
  FROM seeded_products p
  JOIN LATERAL unnest(COALESCE(p.sizes, ARRAY['One Size']::text[])) WITH ORDINALITY AS s(size, ord) ON true
  WHERE s.ord <= 3
),
color_values AS (
  SELECT p.id AS product_id, c.color, c.ord
  FROM seeded_products p
  JOIN LATERAL unnest(COALESCE(p.colors, ARRAY['Default']::text[])) WITH ORDINALITY AS c(color, ord) ON true
  WHERE c.ord <= 3
),
combos AS (
  SELECT
    s.product_id,
    s.size,
    c.color,
    row_number() OVER (PARTITION BY s.product_id ORDER BY s.ord, c.ord) AS idx
  FROM size_values s
  JOIN color_values c ON c.product_id = s.product_id
)
INSERT INTO public.product_variants (product_id, size, color, price_modifier, stock_quantity, created_at)
SELECT
  cb.product_id,
  cb.size,
  cb.color,
  CASE
    WHEN cb.size IN ('XL','XXL','44') THEN 1000
    WHEN cb.size IN ('43','45') THEN 800
    ELSE 0
  END,
  (5 + ((cb.product_id::bigint + cb.idx) % 40))::int,
  now()
FROM combos cb
WHERE NOT EXISTS (
  SELECT 1
  FROM public.product_variants pv
  WHERE pv.product_id = cb.product_id
    AND COALESCE(pv.size, '') = COALESCE(cb.size, '')
    AND COALESCE(pv.color, '') = COALESCE(cb.color, '')
);

-- --------------------------------------------------------------------------
-- 7) Optional review seed for realism (lightweight)
-- --------------------------------------------------------------------------
INSERT INTO public.reviews (product_id, user_id, rating, comment, created_at)
SELECT
  p.id,
  NULL,
  (4 + (p.id % 2))::int,
  CASE (p.id % 5)
    WHEN 0 THEN 'Great quality and fit. Exactly as described.'
    WHEN 1 THEN 'Solid value for money, would buy again.'
    WHEN 2 THEN 'Looks premium and feels durable.'
    WHEN 3 THEN 'Very comfortable and color matches photos.'
    ELSE 'Fast favorite. Quality is consistent.'
  END,
  now() - ((p.id % 60)::text || ' days')::interval
FROM public.products p
WHERE p.slug LIKE 'mv-%'
  AND (p.id % 7) = 0
  AND NOT EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.product_id = p.id
      AND r.comment IS NOT NULL
      AND r.comment LIKE 'Great quality and fit.%'
  );

COMMIT;

-- Refresh PostgREST cache for new/changed objects
NOTIFY pgrst, 'reload_schema';

-- ============================================================================
-- QUICK VALIDATION
-- ============================================================================
-- SELECT COUNT(*) AS stores_count FROM public.stores WHERE slug IN
-- ('urban-loom','velvet-orbit','north-anchor','sole-republic','carry-culture',
--  'kidz-atelier','native-weave-house','prime-basics-co','lumen-luxe',
--  'trend-harbor','aerofit-studio','monarch-threads');
--
-- SELECT COUNT(*) AS seeded_products FROM public.products WHERE slug LIKE 'mv-%';
--
-- SELECT COUNT(*) AS seeded_variants
-- FROM public.product_variants pv
-- JOIN public.products p ON p.id = pv.product_id
-- WHERE p.slug LIKE 'mv-%';
--
-- SELECT COUNT(*) AS seeded_product_categories
-- FROM public.product_categories pc
-- JOIN public.products p ON p.id = pc.product_id
-- WHERE p.slug LIKE 'mv-%';
--
-- SELECT COUNT(*) AS seeded_product_collections
-- FROM public.product_collections pc
-- JOIN public.products p ON p.id = pc.product_id
-- WHERE p.slug LIKE 'mv-%';
-- ============================================================================
