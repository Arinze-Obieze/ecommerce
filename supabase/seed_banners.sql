-- Clear existing banners (optional, depending on preference)
TRUNCATE TABLE banners;

-- Insert 3 Banner Options
-- Note: Only ONE should be active (is_active = true) at a time for the current implementation to pick it up deterministically.
-- The API route picks the FIRST active one.

-- Option 1: Default Branding (Using your local asset)
INSERT INTO banners (title, subtitle, cta_text, cta_link, background_image, foreground_image, is_active)
VALUES (
  'Discover Your Style',
  'Shop the latest fashion, and essentials from trusted African sellers.',
  'Shop Now',
  '/shop',
  '/bg_big.jpeg', -- Local file
  NULL,
  true
);

-- Option 2: Fresh Season Drops (Fashion Focus)
INSERT INTO banners (title, subtitle, cta_text, cta_link, background_image, foreground_image, is_active)
VALUES (
  'Fresh Drops for the Season',
  'Explore our latest collection of premium outfits designed for you.',
  'View New Arrivals',
  '/shop?sortBy=newest',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
  NULL,
  true
);

-- Option 3: Community & Trust (Sellers Focus)
INSERT INTO banners (title, subtitle, cta_text, cta_link, background_image, foreground_image, is_active)
VALUES (
  'Empower Local Sellers',
  'Every purchase supports an entrepreneur in your community.',
  'Start Shopping',
  '/shop',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
  NULL,
  true
);
