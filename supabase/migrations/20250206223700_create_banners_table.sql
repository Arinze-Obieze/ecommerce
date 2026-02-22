-- Create the banners table
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_link TEXT,
  background_image TEXT,
  foreground_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false
);

-- Insert initial data
INSERT INTO banners (title, subtitle, cta_text, cta_link, background_image, foreground_image, is_active)
VALUES (
  'Discover Your Style',
  'Shop the latest fashion, and essentials from trusted African stores',
  'Shop Now',
  '/shop',
  NULL, -- Or provide a default URL if available
  NULL,
  true
);

-- Basic RLS Policies
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active banners
CREATE POLICY "Allow public read access" ON banners
  FOR SELECT USING (true);

-- Allow authenticated users (admins) to insert/update/delete
-- Assuming authenticated role is sufficient for now, or refine based on your roles
CREATE POLICY "Allow authenticated insert" ON banners
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON banners
  FOR UPDATE USING (auth.role() = 'authenticated');
