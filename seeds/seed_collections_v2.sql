-- Clean up existing data
TRUNCATE TABLE product_collections CASCADE;
TRUNCATE TABLE collections CASCADE;
TRUNCATE TABLE product_categories CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE products CASCADE;

-- Insert Collections
INSERT INTO collections (id, name, slug, description, display_order) VALUES
(1, 'Best Sellers', 'best-sellers', 'Our most popular items derived from sales data.', 1),
(2, 'New Arrivals', 'new-arrivals', 'Fresh styles just landed for the season.', 2),
(3, 'Summer Edit', 'summer-edit', 'Lightweight essentials for warm days.', 3);

-- Insert Categories
INSERT INTO categories (id, name, slug, display_order) VALUES
(1, 'Clothing', 'clothing', 1),
(2, 'Accessories', 'accessories', 2),
(3, 'Footwear', 'footwear', 3);

-- Insert Products (High Quality Placeholders)
-- Using aspect ratio 3:4 images (e.g., 600x800)
-- Insert Products (High Quality Placeholders)
-- Using aspect ratio 3:4 images (e.g., 600x800)
INSERT INTO products (id, name, slug, description, price, discount_price, stock_quantity, image_urls, is_active, is_featured, rating) VALUES
(1, 'Classic Linen Shirt', 'classic-linen-shirt', 'Breathable linen shirt perfect for summer.', 45000, 38000, 50, ARRAY[
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600&h=800',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=600&h=800',
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&q=80&w=600&h=800'
], true, true, 4.8),
(2, 'Tailored Chino Trousers', 'tailored-chino-trousers', 'Slim fit chinos available in multiple colors.', 35000, NULL, 40, ARRAY['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=600&h=800'], true, false, 4.6),
(3, 'Canvas Low-Top Sneakers', 'canvas-low-top-sneakers', 'Minimalist white sneakers for everyday wear.', 55000, NULL, 30, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600&h=800'], true, true, 4.9),
(4, 'Oversized Cotton Tee', 'oversized-cotton-tee', 'Heavyweight cotton t-shirt with a relaxed fit.', 18000, 15000, 100, ARRAY['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600&h=800'], true, false, 4.5),
(5, 'Denim Jacket', 'denim-jacket', 'Classic vintage wash denim jacket.', 65000, NULL, 20, ARRAY['https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&q=80&w=600&h=800'], true, true, 4.7),
(6, 'Leather Crossbody Bag', 'leather-crossbody-bag', 'Genuine leather bag with adjustable strap.', 85000, 75000, 15, ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600&h=800'], true, false, 4.9),
(7, 'Aviator Sunglasses', 'aviator-sunglasses', 'Classic metal frame aviators with UV protection.', 25000, NULL, 50, ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600&h=800'], true, false, 4.4),
(8, 'Knitted Beanie', 'knitted-beanie', 'Soft wool blend beanie in earth tones.', 12000, NULL, 80, ARRAY['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=600&h=800'], true, false, 4.6),
(9, 'Striped Polo Shirt', 'striped-polo-shirt', 'Classic piqué polo with timeless stripes.', 28000, 22000, 45, ARRAY['https://images.unsplash.com/photo-1626557981101-aae6f84aa6ff?auto=format&fit=crop&q=80&w=600&h=800'], true, false, 4.3),
(10, 'Suede Chelsea Boots', 'suede-chelsea-boots', 'Premium suede boots with elastic side panels.', 95000, NULL, 12, ARRAY['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=600&h=800'], true, true, 4.8);

-- Map Products to Collections
-- Best Sellers: Products 1, 3, 5, 6, 10
INSERT INTO product_collections (product_id, collection_id) VALUES
(1, 1), (3, 1), (5, 1), (6, 1), (10, 1);

-- New Arrivals: Products 2, 4, 7, 8, 9
INSERT INTO product_collections (product_id, collection_id) VALUES
(2, 2), (4, 2), (7, 2), (8, 2), (9, 2), (1, 2); -- Added shirt to new arrivals too

-- Map Products to Categories
INSERT INTO product_categories (product_id, category_id, is_primary) VALUES
(1, 1, true), (2, 1, true), (3, 3, true), (4, 1, true), (5, 1, true),
(6, 2, true), (7, 2, true), (8, 2, true), (9, 1, true), (10, 3, true);

-- Fix sequence sync just in case
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('collections_id_seq', (SELECT MAX(id) FROM collections));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
