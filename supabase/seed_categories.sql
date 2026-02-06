-- Clear existing categories (cascades to product_categories)
TRUNCATE TABLE categories CASCADE;

-- Level 1: Root Categories
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
('Men', 'men', 'Fashion for Men', 1, true),
('Women', 'women', 'Fashion for Women', 2, true),
('Kids', 'kids', 'Fashion for Kids', 3, true),
('Accessories', 'accessories', 'Accessories & More', 4, true);

-- Level 2: Men's Subcategories
WITH parent AS (SELECT id FROM categories WHERE slug = 'men')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('Clothing', 'men-clothing', 1),
  ('Footwear', 'men-footwear', 2)
) AS data(name, slug, ord);

-- Level 2: Women's Subcategories
WITH parent AS (SELECT id FROM categories WHERE slug = 'women')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('Clothing', 'women-clothing', 1),
  ('Footwear', 'women-footwear', 2)
) AS data(name, slug, ord);

-- Level 2: Kids' Subcategories
WITH parent AS (SELECT id FROM categories WHERE slug = 'kids')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('Boys Fashion', 'kids-boys-fashion', 1),
  ('Girls Fashion', 'kids-girls-fashion', 2),
  ('School Shop', 'kids-school-shop', 3)
) AS data(name, slug, ord);

-- Level 2: Accessories Subcategories
WITH parent AS (SELECT id FROM categories WHERE slug = 'accessories')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('General', 'accessories-general', 1),
  ('Bags & Luggage', 'accessories-bags-luggage', 2)
) AS data(name, slug, ord);

-- Level 3: Men's Clothing Items
WITH parent AS (SELECT id FROM categories WHERE slug = 'men-clothing')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('T-Shirts & Polos', 'men-t-shirts-polos', 1),
  ('Shirts (Casual / Formal)', 'men-shirts-casual-formal', 2),
  ('Trousers & Chinos', 'men-trousers-chinos', 3),
  ('Native Wear (Kaftan, Senator)', 'men-native-wear', 4),
  ('Hoodies & Jackets', 'men-hoodies-jackets', 5)
) AS data(name, slug, ord);

-- Level 3: Men's Footwear Items
WITH parent AS (SELECT id FROM categories WHERE slug = 'men-footwear')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('Corporate Shoes', 'men-corporate-shoes', 1),
  ('Loafers', 'men-loafers', 2),
  ('Brogues & Oxfords', 'men-brogues-oxfords', 3),
  ('Sneakers', 'men-sneakers', 4),
  ('Sandals & Slippers', 'men-sandals-slippers', 5),
  ('Boots', 'men-boots', 6)
) AS data(name, slug, ord);

-- Level 3: Women's Clothing Items
WITH parent AS (SELECT id FROM categories WHERE slug = 'women-clothing')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('Dresses & Gowns', 'women-dresses-gowns', 1),
  ('Tops & Blouses', 'women-tops-blouses', 2),
  ('Skirts & Trousers', 'women-skirts-trousers', 3),
  ('Native Wear (Ankara, Lace)', 'women-native-wear', 4),
  ('Two-Piece Sets', 'women-two-piece-sets', 5)
) AS data(name, slug, ord);

-- Level 3: Women's Footwear Items
WITH parent AS (SELECT id FROM categories WHERE slug = 'women-footwear')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('Heels', 'women-heels', 1),
  ('Flats & Ballerinas', 'women-flats-ballerinas', 2),
  ('Sandals', 'women-sandals', 3),
  ('Sneakers', 'women-sneakers', 4),
  ('Wedges', 'women-wedges', 5)
) AS data(name, slug, ord);

-- Level 3: Kids Boys Items
WITH parent AS (SELECT id FROM categories WHERE slug = 'kids-boys-fashion')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('T-Shirts & Polos', 'kids-boys-t-shirts-polos', 1),
  ('Jeans & Trousers', 'kids-boys-jeans-trousers', 2),
  ('Sets', 'kids-boys-sets', 3),
  ('Sneakers', 'kids-boys-sneakers', 4),
  ('Sandals', 'kids-boys-sandals', 5)
) AS data(name, slug, ord);

-- Level 3: Kids Girls Items
WITH parent AS (SELECT id FROM categories WHERE slug = 'kids-girls-fashion')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('Dresses', 'kids-girls-dresses', 1),
  ('Tops & Skirts', 'kids-girls-tops-skirts', 2),
  ('Sets', 'kids-girls-sets', 3),
  ('Ballerinas', 'kids-girls-ballerinas', 4),
  ('Sandals', 'kids-girls-sandals', 5)
) AS data(name, slug, ord);

-- Level 3: Kids School Shop
WITH parent AS (SELECT id FROM categories WHERE slug = 'kids-school-shop')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('Backpacks', 'kids-school-backpacks', 1),
  ('Lunch Boxes', 'kids-school-lunch-boxes', 2),
  ('School Shoes', 'kids-school-shoes', 3),
  ('Uniforms', 'kids-school-uniforms', 4)
) AS data(name, slug, ord);

-- Level 3: Accessories General
WITH parent AS (SELECT id FROM categories WHERE slug = 'accessories-general')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('Sunglasses', 'accessories-sunglasses', 1),
  ('Scarves & Shawls', 'accessories-scarves-shawls', 2),
  ('Caps & Hats', 'accessories-caps-hats', 3),
  ('Watches', 'accessories-watches', 4),
  ('Jewelry', 'accessories-jewelry', 5)
) AS data(name, slug, ord);

-- Level 3: Accessories Bags
WITH parent AS (SELECT id FROM categories WHERE slug = 'accessories-bags-luggage')
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
SELECT name, slug, parent.id, ord, true
FROM parent, (VALUES 
  ('Handbags', 'accessories-handbags', 1),
  ('Tote Bags', 'accessories-tote-bags', 2),
  ('Crossbody Bags', 'accessories-crossbody-bags', 3),
  ('Laptop Bags', 'accessories-laptop-bags', 4),
  ('Travel Boxes', 'accessories-travel-boxes', 5),
  ('Duffel Bags', 'accessories-duffel-bags', 6)
) AS data(name, slug, ord);
