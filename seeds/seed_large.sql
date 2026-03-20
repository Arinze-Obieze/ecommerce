-- =============================================================================
-- REALISTIC LARGE-SCALE SEED DATA  
-- =============================================================================
-- Products: 60 handcrafted real products with full detail
-- Stores: 10 brands
-- Images: picsum.photos (reliable CDN, consistent per seed)
-- Run AFTER database_schema_compiled.sql has been applied
-- =============================================================================

-- STORES
INSERT INTO public.stores (id, name, slug, description, logo_url, is_active, is_verified) VALUES
  ('11111111-0000-0000-0000-000000000001','UrbanThreads','urban-threads','Contemporary streetwear for the modern man','https://picsum.photos/seed/st1/200/200',true,true),
  ('11111111-0000-0000-0000-000000000002','LuxeLane','luxe-lane','Premium fashion for ambitious women','https://picsum.photos/seed/st2/200/200',true,true),
  ('11111111-0000-0000-0000-000000000003','KiddoKingdom','kiddo-kingdom','Fun durable fashion for kids','https://picsum.photos/seed/st3/200/200',true,true),
  ('11111111-0000-0000-0000-000000000004','SoleStudio','sole-studio','Footwear for every occasion','https://picsum.photos/seed/st4/200/200',true,true),
  ('11111111-0000-0000-0000-000000000005','AccessorizeIt','accessorize-it','Bags, jewelry, watches and more','https://picsum.photos/seed/st5/200/200',true,true),
  ('11111111-0000-0000-0000-000000000006','NativeCraft','native-craft','Premium African prints and native wear','https://picsum.photos/seed/st6/200/200',true,true),
  ('11111111-0000-0000-0000-000000000007','DenimDen','denim-den','Jeans and casual wear for every body','https://picsum.photos/seed/st7/200/200',true,false),
  ('11111111-0000-0000-0000-000000000008','SneakerVault','sneaker-vault','Exclusive and limited sneaker drops','https://picsum.photos/seed/st8/200/200',true,true),
  ('11111111-0000-0000-0000-000000000009','ClassicGent','classic-gent','Formal and business attire for professionals','https://picsum.photos/seed/st9/200/200',true,true),
  ('11111111-0000-0000-0000-000000000010','TrendHive','trend-hive','Trending styles from around the globe','https://picsum.photos/seed/st10/200/200',true,false)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- PRODUCTS
-- NOTE: specifications jsonb holds image_url, material, weight, and care info
-- =============================================================================

INSERT INTO public.products (store_id,name,slug,description,price,discount_price,stock_quantity,rating,is_active,is_featured,sku,sizes,colors,specifications) VALUES

-- ============ MEN'S CLOTHING ============
('11111111-0000-0000-0000-000000000001',
 'Classic Pique Polo Shirt','classic-pique-polo-shirt',
 'A timeless slim-fit polo made from 100% breathable pique cotton. Features a two-button placket and ribbed collar. Perfect for casual Fridays or weekend outings.',
 8500, 6800, 120, 4.5, true, true, 'UT-POLO-001',
 ARRAY['S','M','L','XL','XXL'], ARRAY['Navy','White','Black','Forest Green'],
 '{"image_url":"https://loremflickr.com/600/600/polo,shirt,men?lock=101","material":"100% Pique Cotton","weight":"220gsm","care":"Machine wash cold, tumble dry low","fit":"Slim Fit","origin":"Bangladesh"}'::jsonb),

('11111111-0000-0000-0000-000000000001',
 'Slim Fit Oxford Button-Down Shirt','slim-fit-oxford-shirt',
 'Crisp Oxford weave shirt with a slim tailored fit. Button-down collar, chest pocket, and a curved hem for a modern finish. Great for work or a smart-casual evening.',
 12000, NULL, 85, 4.7, true, false, 'UT-OXFS-002',
 ARRAY['S','M','L','XL'], ARRAY['Light Blue','White','Pink','Sage'],
 '{"image_url":"https://loremflickr.com/600/600/oxford,shirt,button,men?lock=102","material":"100% Oxford Cotton","weight":"130gsm","care":"Machine wash, iron on medium","fit":"Slim Fit","origin":"India"}'::jsonb),

('11111111-0000-0000-0000-000000000009',
 'Tailored Chino Trousers','tailored-chino-trousers',
 'Stretch chino trousers with a mid-rise waist and tapered leg. Side and back pockets. The versatile trouser that bridges casual and smart.',
 15000, 12000, 60, 4.6, true, false, 'CG-CHIN-003',
 ARRAY['28','30','32','34','36','38'], ARRAY['Khaki','Navy','Olive','Charcoal'],
 '{"image_url":"https://loremflickr.com/600/600/chino,trousers,pants,men?lock=103","material":"98% Cotton, 2% Elastane","waist":"Mid Rise","fit":"Tapered","care":"Machine wash 30°C","leg":"Tapered"}'::jsonb),

('11111111-0000-0000-0000-000000000001',
 'Heavyweight Zip-Up Hoodie','heavyweight-zip-hoodie',
 'Cozy 380gsm fleece hoodie with a full-length YKK zip, kangaroo pocket, and ribbed cuffs. Built for cold evenings and lazy weekends.',
 18000, 15000, 45, 4.8, true, true, 'UT-HOOD-004',
 ARRAY['S','M','L','XL','XXL'], ARRAY['Black','Grey Marl','Burgundy','Army Green'],
 '{"image_url":"https://loremflickr.com/600/600/hoodie,zip,sweatshirt?lock=104","material":"80% Cotton, 20% Polyester","weight":"380gsm","care":"Machine wash cold","fit":"Regular","lining":"Brushed Fleece"}'::jsonb),

('11111111-0000-0000-0000-000000000009',
 'Formal Slim Blazer','formal-slim-blazer',
 'A single-breasted slim-fit blazer in Italian ponte fabric. Two-button front, notch lapel, and two side pockets. Designed for boardroom confidence.',
 45000, NULL, 30, 4.9, true, true, 'CG-BLAZ-005',
 ARRAY['36','38','40','42','44'], ARRAY['Charcoal','Navy','Black'],
 '{"image_url":"https://loremflickr.com/600/600/blazer,suit,jacket,men?lock=105","material":"Ponte Fabric","lining":"Full Silk Lining","care":"Dry clean only","fit":"Slim","lapel":"Notch Lapel"}'::jsonb),

('11111111-0000-0000-0000-000000000007',
 'Straight Leg Jeans','straight-leg-jeans',
 'Classic five-pocket straight-leg denim in medium wash. Made with premium ring-spun denim for superior comfort and longevity.',
 14000, NULL, 95, 4.4, true, false, 'DD-JEANS-006',
 ARRAY['28','30','32','34','36'], ARRAY['Medium Wash','Dark Wash','Black'],
 '{"image_url":"https://loremflickr.com/600/600/jeans,denim,men?lock=106","material":"99% Cotton, 1% Elastane","weight":"12oz Denim","care":"Wash inside out, cold","fit":"Straight","rise":"Mid Rise"}'::jsonb),

('11111111-0000-0000-0000-000000000001',
 'Graphic Oversized Tee','graphic-oversized-tee',
 'Boxy drop-shoulder tee featuring an original urban graphic print. Pre-shrunk 250gsm cotton for a substantial feel that holds its shape.',
 6500, 5000, 200, 4.3, true, false, 'UT-GTEE-007',
 ARRAY['S','M','L','XL'], ARRAY['White','Black','Off-White'],
 '{"image_url":"https://loremflickr.com/600/600/tshirt,graphic,streetwear?lock=107","material":"100% Cotton","weight":"250gsm","care":"Cold wash, do not bleach","fit":"Oversized","print":"Screen Print"}'::jsonb),

-- ============ MEN'S FOOTWEAR ============
('11111111-0000-0000-0000-000000000004',
 'Brogue Oxford Dress Shoe','brogue-oxford-dress-shoe',
 'Full-grain leather brogue Oxford with decorative perforations. Leather-lined interior, cushioned insole, and rubber-capped leather sole.',
 32000, 28000, 40, 4.8, true, true, 'SS-BROGUE-008',
 ARRAY['40','41','42','43','44','45'], ARRAY['Tan','Dark Brown','Black'],
 '{"image_url":"https://loremflickr.com/600/600/brogue,leather,shoes,men?lock=108","material":"Full-Grain Leather Upper","sole":"Leather with Rubber Cap","lining":"Genuine Leather","care":"Polish regularly","closure":"Lace-Up"}'::jsonb),

('11111111-0000-0000-0000-000000000008',
 'Air Cushion Lifestyle Sneaker','air-cushion-lifestyle-sneaker',
 'Low-profile lifestyle sneaker with a chunky air-cushion midsole. Suede and mesh upper, padded collar, and a grippy rubber outsole.',
 27000, NULL, 65, 4.7, true, true, 'SV-SNKR-009',
 ARRAY['38','39','40','41','42','43','44','45'], ARRAY['Triple White','Black/Red','Blue/Grey','All Black'],
 '{"image_url":"https://loremflickr.com/600/600/sneakers,trainers,shoes?lock=109","material":"Suede & Mesh Upper","midsole":"Air-Cushion EVA","outsole":"Rubber","closure":"Lace-Up","drop":"6mm"}'::jsonb),

('11111111-0000-0000-0000-000000000004',
 'Penny Loafer in Suede','penny-loafer-suede',
 'Slip-on suede penny loafer with a moccasin construction. Cushioned leather insole and a low stacked heel.',
 22000, 19000, 55, 4.5, true, false, 'SS-LOAF-010',
 ARRAY['39','40','41','42','43','44'], ARRAY['Camel','Chocolate Brown','Navy'],
 '{"image_url":"https://loremflickr.com/600/600/loafer,suede,shoes?lock=110","material":"Suede Upper","sole":"Rubber","lining":"Leather","care":"Suede brush only","closure":"Slip-On"}'::jsonb),

('11111111-0000-0000-0000-000000000004',
 'Side-Zip Chelsea Boot','side-zip-chelsea-boot',
 'Smooth leather Chelsea boot with elastic side gussets and an inside zip for easy wear. Stacked block heel and rubber grip sole.',
 35000, NULL, 35, 4.6, true, false, 'SS-CHELS-011',
 ARRAY['40','41','42','43','44','45'], ARRAY['Black','Chestnut Brown'],
 '{"image_url":"https://loremflickr.com/600/600/chelsea,boots,leather?lock=111","material":"Smooth Leather Upper","sole":"Rubber Block','heel":"Stacked Block 3cm","closure":"Side Zip + Elastic Gusset","care":"Leather conditioner monthly"}'::jsonb),

-- ============ WOMEN'S CLOTHING ============
('11111111-0000-0000-0000-000000000002',
 'Floral Wrap Midi Dress','floral-wrap-midi-dress',
 'Elegant wrap-style midi dress with a flattering V-neckline, tie waist, and flutter sleeves. Printed in an exclusive floral motif on silky viscose.',
 19500, 16000, 75, 4.8, true, true, 'LL-WMID-012',
 ARRAY['XS','S','M','L','XL'], ARRAY['Pink Floral','Blue Floral','Black Floral'],
 '{"image_url":"https://loremflickr.com/600/600/floral,midi,dress,women?lock=112","material":"100% Viscose","care":"Hand wash cold, hang dry","style":"Wrap Midi","neckline":"V-Neck","sleeve":"Flutter"}'::jsonb),

('11111111-0000-0000-0000-000000000002',
 'High-Rise Wide-Leg Trousers','high-rise-wide-leg-trousers',
 'Elevated wide-leg trousers cut in a fluid crepe fabric. High waist with a flat front, concealed zip, and pressed crease for a polished finish.',
 16000, NULL, 55, 4.6, true, false, 'LL-WLEG-013',
 ARRAY['XS','S','M','L','XL'], ARRAY['Ivory','Black','Camel','Cobalt Blue'],
 '{"image_url":"https://loremflickr.com/600/600/wide,leg,trousers,women,fashion?lock=113","material":"Polyester Crepe","care":"Dry clean preferred","style":"Wide-Leg","rise":"High Waist","closure":"Concealed Zip"}'::jsonb),

('11111111-0000-0000-0000-000000000010',
 'Satin Cowl Neck Top','satin-cowl-neck-top',
 'Luxurious satin-finish blouse with a draped cowl neckline and barely-there adjustable spaghetti straps. Effortlessly transitions from day to evening.',
 9500, 7500, 90, 4.4, true, false, 'TH-SCNT-014',
 ARRAY['XS','S','M','L'], ARRAY['Champagne','Black','Dusty Rose','Teal'],
 '{"image_url":"https://loremflickr.com/600/600/satin,blouse,cowl,women?lock=114","material":"Polyester Satin","care":"Hand wash only","style":"Cowl Neck","closure":"Spaghetti Straps","occasion":"Day to Evening"}'::jsonb),

('11111111-0000-0000-0000-000000000002',
 'Structured Pencil Skirt','structured-pencil-skirt',
 'Knee-length pencil skirt in bonded scuba fabric. High waist, back split, and concealed side zip. The boardroom essential.',
 12500, NULL, 65, 4.5, true, false, 'LL-WSKRT-015',
 ARRAY['XS','S','M','L','XL'], ARRAY['Black','Navy','Burgundy'],
 '{"image_url":"https://loremflickr.com/600/600/pencil,skirt,formal,women?lock=115","material":"Bonded Scuba","care":"Machine wash 30°C","style":"Pencil","length":"Knee Length","closure":"Side Zip"}'::jsonb),

('11111111-0000-0000-0000-000000000002',
 'Ribbed Knit Co-ord Set','ribbed-knit-coord-set',
 'Two-piece ribbed knit set featuring a crop top and matching high-waist trousers. Stretchy and form-fitting for a sleek monochrome look.',
 22000, 18500, 40, 4.7, true, true, 'LL-COORD-016',
 ARRAY['XS','S','M','L'], ARRAY['Beige','Black','Chocolate','Sage'],
 '{"image_url":"https://loremflickr.com/600/600/knit,coord,set,fashion?lock=116","material":"82% Viscose, 18% Polyester","care":"Hand wash cold","style":"Co-ord Set","top":"Crop","bottom":"High-Waist Trouser"}'::jsonb),

('11111111-0000-0000-0000-000000000010',
 'Oversized Denim Jacket','oversized-denim-jacket',
 'Relaxed-fit denim trucker jacket with snap-button front, chest pockets, and adjustable side tabs. A perennial wardrobe staple.',
 17000, NULL, 80, 4.5, true, false, 'TH-DNJK-017',
 ARRAY['XS','S','M','L','XL'], ARRAY['Light Wash','Dark Wash','Black'],
 '{"image_url":"https://loremflickr.com/600/600/denim,jacket,trucker?lock=117","material":"100% Cotton Denim","weight":"10oz","care":"Machine wash cold","fit":"Oversized","closure":"Snap Button"}'::jsonb),

-- ============ WOMEN'S FOOTWEAR ============
('11111111-0000-0000-0000-000000000004',
 'Block Heel Mule','block-heel-mule',
 'Open-toe mule with a squared block heel for all-day comfort. Suede upper, padded insole, and non-slip rubber sole.',
 14500, 12000, 60, 4.5, true, false, 'SS-WMULE-018',
 ARRAY['36','37','38','39','40','41'], ARRAY['Nude','Black','Cobalt Blue','Red'],
 '{"image_url":"https://loremflickr.com/600/600/mule,block,heel,shoes?lock=118","material":"Suede Upper","heel_height":"6cm","sole":"Rubber","style":"Mule","toe":"Open Square Toe"}'::jsonb),

('11111111-0000-0000-0000-000000000004',
 'Barely-There Strappy Heels','barely-there-strappy-heels',
 'Delicate triple-strap stiletto sandal with an adjustable ankle strap. Minimalist and versatile — the perfect evening shoe.',
 18000, NULL, 45, 4.6, true, true, 'SS-WSTIL-019',
 ARRAY['36','37','38','39','40'], ARRAY['Gold','Silver','Nude','Black'],
 '{"image_url":"https://loremflickr.com/600/600/stiletto,strappy,heels,shoes?lock=119","material":"PU Leather","heel_height":"10cm","heel_type":"Stiletto","closure":"Ankle Buckle","occasion":"Evening/Formal"}'::jsonb),

('11111111-0000-0000-0000-000000000004',
 'Flatform Espadrille Sandal','flatform-espadrille-sandal',
 'Summer-ready espadrille with a jute-wrapped flatform and canvas upper. Ankle tie closure and cushioned footbed.',
 11000, 9000, 70, 4.3, true, false, 'SS-WESP-020',
 ARRAY['36','37','38','39','40','41'], ARRAY['Natural/White','Navy/White','Tan'],
 '{"image_url":"https://loremflickr.com/600/600/espadrille,sandal,summer,shoes?lock=120","material":"Canvas Upper, Jute Sole","heel_height":"4cm Flatform","closure":"Ankle Tie","style":"Espadrille","season":"Spring/Summer"}'::jsonb),

-- ============ NATIVE WEAR ============
('11111111-0000-0000-0000-000000000006',
 'Men Ankara Print Kaftan','men-ankara-kaftan',
 'Flowing kaftan crafted in vibrant authentic Ankara wax-print fabric. Loose silhouette with a round neck and long sleeves — perfect for celebrations and occasions.',
 25000, NULL, 35, 4.9, true, true, 'NC-MKAF-021',
 ARRAY['M','L','XL','XXL','XXXL'], ARRAY['Blue/Gold Print','Red/Black Print','Green/Gold Print'],
 '{"image_url":"https://loremflickr.com/600/600/kaftan,ankara,african,fashion?lock=121","material":"100% Ankara Wax Cotton","care":"Dry clean recommended","style":"Kaftan","neckline":"Round Neck","occasion":"Occasionwear"}'::jsonb),

('11111111-0000-0000-0000-000000000006',
 'Senator 2-Piece Suit Set','senator-2-piece-suit',
 'Tailored Senator-style two-piece comprising a long-sleeved top and matching straight trousers. Embroidered neckline detailing in tonal thread.',
 35000, 30000, 25, 4.8, true, true, 'NC-SEN-022',
 ARRAY['M','L','XL','XXL'], ARRAY['Sky Blue','Off-White','Burgundy','Ash Grey'],
 '{"image_url":"https://loremflickr.com/600/600/african,senator,native,wear?lock=122","material":"Premium Linen Cotton Blend","care":"Dry clean only","style":"Senator","embroidery":"Tonal Thread","occasion":"Formal/Occasionwear"}'::jsonb),

('11111111-0000-0000-0000-000000000006',
 'Women Adire Tie-Dye Gown','women-adire-gown',
 'Stunning floor-length gown in handmade Nigerian Adire (tie-dye) fabric. Flared skirt, fitted bodice, and off-shoulder neckline. Each piece is uniquely patterned.',
 28000, NULL, 20, 5.0, true, true, 'NC-WADR-023',
 ARRAY['S','M','L','XL'], ARRAY['Indigo Blue','Mixed Blue','Earth Brown'],
 '{"image_url":"https://loremflickr.com/600/600/adire,tie,dye,dress,african?lock=123","material":"Handmade Adire Fabric","care":"Hand wash cold, dry in shade","style":"Flared Gown","neckline":"Off-Shoulder","note":"Each piece has unique pattern variations"}'::jsonb),

('11111111-0000-0000-0000-000000000006',
 'Agbada 3-Piece Set','agbada-3-piece-set',
 'Grand Agbada set featuring an outer robe, inner buba, and trousers. Embroidered with intricate designs on breathable Aso-Oke fabric.',
 65000, 58000, 15, 4.9, true, false, 'NC-AGBD-024',
 ARRAY['L','XL','XXL','XXXL'], ARRAY['All White','Royal Blue','Gold'],
 '{"image_url":"https://loremflickr.com/600/600/agbada,african,formal,robe?lock=124","material":"Aso-Oke Fabric","care":"Dry clean only","pieces":"3 — Outer Robe, Buba, Trousers","embroidery":"Intricate Gold/Tonal Thread","occasion":"Grand Ceremonies"}'::jsonb),

-- ============ KIDS ============
('11111111-0000-0000-0000-000000000003',
 'Boys Dinosaur Polo Set','boys-dinosaur-polo-set',
 'Playful polo shirt and shorts set with embroidered dinosaur motif. Made from soft jersey cotton, easy pull-on waistband, and age-appropriate fit.',
 7500, 6000, 100, 4.6, true, true, 'KK-BPSET-025',
 ARRAY['2-3Y','3-4Y','4-5Y','5-6Y','6-7Y','7-8Y'], ARRAY['Blue/White','Green/White','Grey/Orange'],
 '{"image_url":"https://loremflickr.com/600/600/kids,boy,polo,shirt?lock=125","material":"100% Cotton Jersey","care":"Machine wash 40°C","type":"2-Piece Set","motif":"Embroidered Dinosaur","waistband":"Elastic Pull-On"}'::jsonb),

('11111111-0000-0000-0000-000000000003',
 'Girls Floral Tutu Dress','girls-floral-tutu-dress',
 'Adorable tiered tutu dress with a floral printed bodice and tulle skirt layers. Invisible back zip and soft lining for comfort.',
 9000, NULL, 80, 4.7, true, true, 'KK-GTUTU-026',
 ARRAY['2-3Y','3-4Y','4-5Y','5-6Y','6-7Y'], ARRAY['Pink','Lilac','Mint Green'],
 '{"image_url":"https://loremflickr.com/600/600/girl,kids,tutu,dress?lock=126","material":"Polyester Bodice, Tulle Skirt","care":"Hand wash cold","style":"Tutu Dress","closure":"Invisible Zip","lining":"Soft Cotton"}'::jsonb),

('11111111-0000-0000-0000-000000000003',
 'Kids Canvas School Backpack','kids-canvas-school-backpack',
 'Lightweight 18L waterproof backpack with a padded laptop sleeve (10"), two side pockets, a front organiser, and reflective safety strip.',
 12000, 10000, 150, 4.5, true, false, 'KK-BKPK-027',
 ARRAY['One Size'], ARRAY['Blue','Red','Pink','Black'],
 '{"image_url":"https://loremflickr.com/600/600/school,backpack,kids,bag?lock=127","material":"600D Polyester","capacity":"18L","laptop_sleeve":"10 inch","reflective_strip":true,"water_resistant":true,"care":"Wipe clean"}'::jsonb),

('11111111-0000-0000-0000-000000000003',
 'Boys Velcro Running Shoe','boys-velcro-running-shoe',
 'Lightweight breathable kids running shoe with hook-and-loop velcro closure for easy self-dressing. Cushioned midsole and non-marking rubber sole.',
 8500, NULL, 90, 4.4, true, false, 'KK-BSHN-028',
 ARRAY['26','27','28','29','30','31','32','33'], ARRAY['Blue/White','Black/Red','Grey/Green'],
 '{"image_url":"https://loremflickr.com/600/600/kids,sneaker,velcro,shoe?lock=128","material":"Mesh Upper","midsole":"EVA Cushion","outsole":"Non-Marking Rubber","closure":"Velcro","feature":"Breathable Mesh"}'::jsonb),

-- ============ ACCESSORIES - BAGS ============
('11111111-0000-0000-0000-000000000005',
 'Structured Top-Handle Bag','structured-top-handle-bag',
 'Minimalist structured bag in pebbled faux leather. Twin top handles, detachable crossbody strap, gold-tone hardware, and a suede-lined interior with card slots.',
 24000, 20000, 50, 4.7, true, true, 'AI-TOPBG-029',
 ARRAY['One Size'], ARRAY['Black','Tan','Burgundy','Cream'],
 '{"image_url":"https://loremflickr.com/600/600/handbag,structured,leather,bag?lock=129","material":"Pebbled Faux Leather","lining":"Suede","hardware":"Gold-Tone","compartments":"1 Main + 1 Zip Pocket + 3 Card Slots","strap":"Detachable Crossbody Strap","dimensions":"28cm x 20cm x 12cm"}'::jsonb),

('11111111-0000-0000-0000-000000000005',
 'Woven Raffia Tote Bag','woven-raffia-tote-bag',
 'Handwoven natural raffia tote with leather trim handles and a cotton canvas lining. Magnetic snap closure and an interior zip pocket.',
 16500, NULL, 65, 4.5, true, false, 'AI-TOTE-030',
 ARRAY['One Size'], ARRAY['Natural','Black/Natural','Tan/Natural'],
 '{"image_url":"https://loremflickr.com/600/600/raffia,tote,woven,bag?lock=130","material":"Natural Raffia, Leather Handles","lining":"Cotton Canvas","closure":"Magnetic Snap","pockets":"1 Interior Zip","dimensions":"40cm x 35cm x 15cm","style":"Market Tote"}'::jsonb),

('11111111-0000-0000-0000-000000000005',
 'Mini Quilted Crossbody','mini-quilted-crossbody',
 'Compact quilted crossbody bag in soft lambskin-effect leather. Chain-and-leather strap, central zip compartment, and an exterior slip pocket.',
 19000, 15500, 45, 4.6, true, true, 'AI-XBDY-031',
 ARRAY['One Size'], ARRAY['Black','Blush Pink','Navy','Red'],
 '{"image_url":"https://loremflickr.com/600/600/crossbody,quilted,bag,women?lock=131","material":"Lambskin Effect Leather","chain":"Antique Gold-Tone Chain","dimensions":"20cm x 14cm x 6cm","strap_drop":"55cm adjustable","compartments":"1 Main Zip + 1 Exterior Slip"}'::jsonb),

('11111111-0000-0000-0000-000000000005',
 '40L Hard-Shell Trolley','hard-shell-trolley-40l',
 '40-litre lightweight ABS hard-shell spinner trolley. 4-wheel 360° spinner, TSA combination lock, telescopic handle, and a fully lined interior with compression straps.',
 78000, 65000, 25, 4.8, true, false, 'AI-TROLL-032',
 ARRAY['One Size'], ARRAY['Jet Black','Silver','Navy Blue','Rose Gold'],
 '{"image_url":"https://loremflickr.com/600/600/luggage,trolley,suitcase,travel?lock=132","material":"ABS Hard Shell","capacity":"40L","wheels":"4-Wheel 360° Spinner","lock":"TSA Combination Lock","handle":"Telescopic Aluminium","dimensions":"55cm x 38cm x 22cm (Cabin Approved)"}'::jsonb),

-- ============ ACCESSORIES - WATCHES ============
('11111111-0000-0000-0000-000000000005',
 'Minimalist Mesh Strap Watch','minimalist-mesh-strap-watch',
 'Clean-dial minimalist watch with a 38mm case, sapphire-coated crystal, and stainless steel mesh strap with a push-button deployment clasp. Japanese quartz movement.',
 42000, 36000, 30, 4.8, true, true, 'AI-WTCH-033',
 ARRAY['One Size'], ARRAY['Silver/White','Gold/Champagne','Rose Gold/White','Black/Black'],
 '{"image_url":"https://loremflickr.com/600/600/watch,wristwatch,minimalist?lock=133","movement":"Japanese Quartz","case_diameter":"38mm","crystal":"Sapphire-Coated","strap":"Stainless Steel Mesh","water_resistance":"30m","lug_width":"18mm"}'::jsonb),

-- ============ ACCESSORIES - JEWELRY ============
('11111111-0000-0000-0000-000000000005',
 'Chunky Gold Chain Necklace','chunky-gold-chain-necklace',
 '18K gold-plated curb-link chain necklace. Hypoallergenic, tarnish-resistant coating with a lobster clasp. Available in 45cm and 50cm lengths.',
 9500, NULL, 120, 4.6, true, false, 'AI-JWL-034',
 ARRAY['45cm','50cm'], ARRAY['18K Gold','Silver','Two-Tone'],
 '{"image_url":"https://loremflickr.com/600/600/gold,chain,necklace,jewelry?lock=134","material":"18K Gold Plated Brass","clasp":"Lobster Claw","hypoallergenic":true,"tarnish_resistant":true,"style":"Curb Link"}'::jsonb),

('11111111-0000-0000-0000-000000000005',
 'Pearl Drop Stud Earrings','pearl-drop-stud-earrings',
 'Elegant freshwater pearl drop earrings set in sterling silver posts. Each pearl is individually graded for lustre. Suitable for sensitive ears.',
 13000, 10500, 85, 4.9, true, false, 'AI-JWL-035',
 ARRAY['One Size'], ARRAY['White Pearl/Silver','White Pearl/Gold','Grey Pearl/Silver'],
 '{"image_url":"https://loremflickr.com/600/600/pearl,drop,earrings,jewelry?lock=135","material":"Freshwater Pearl, Sterling Silver Post","pearl_size":"8mm","hypoallergenic":true,"care":"Wipe with soft cloth","style":"Drop Stud"}'::jsonb),

-- ============ ACCESSORIES - SUNGLASSES ============
('11111111-0000-0000-0000-000000000005',
 'Oversized Square Sunglasses','oversized-square-sunglasses',
 'Retro-inspired oversized square-frame sunglasses with UV400 polarised lenses. Lightweight acetate frame and spring hinges for a comfortable fit.',
 11000, 9000, 75, 4.5, true, false, 'AI-SGL-036',
 ARRAY['One Size'], ARRAY['Black/Smoke','Tortoise/Brown','Clear/Pink'],
 '{"image_url":"https://loremflickr.com/600/600/sunglasses,shades,fashion?lock=136","material":"Acetate Frame","lens":"UV400 Polarised","protection":"UVA + UVB","hinge":"Spring Hinge","style":"Oversized Square"}'::jsonb),

-- ============ ACCESSORIES - CAPS & HATS ============
('11111111-0000-0000-0000-000000000005',
 'Classic 6-Panel Bucket Hat','six-panel-bucket-hat',
 'Structured bucket hat in durable canvas. UV protective fabric, interior sweatband, and a cotton twill inner lining. One-size-fits-most with a toggle adjuster.',
 5500, NULL, 200, 4.3, true, false, 'AI-HAT-037',
 ARRAY['S/M','L/XL'], ARRAY['Black','Olive','Beige','Navy','Pink'],
 '{"image_url":"https://loremflickr.com/600/600/bucket,hat,canvas,fashion?lock=137","material":"100% Canvas","uv_protection":"UPF 30+","inner":"Sweatband","adjuster":"Drawstring Toggle","style":"6-Panel Bucket"}'::jsonb),

-- ============ MORE MEN'S ============
('11111111-0000-0000-0000-000000000007',
 'Relaxed Linen Shirt','relaxed-linen-shirt',
 'Airy summer linen shirt with a camp collar, button-through front, and a relaxed box fit. Drop shoulder, chest pocket.',
 11500, NULL, 65, 4.6, true, false, 'DD-LINEN-038',
 ARRAY['S','M','L','XL','XXL'], ARRAY['White','Sage','Terracotta','Navy'],
 '{"image_url":"https://loremflickr.com/600/600/linen,shirt,summer,men?lock=138","material":"100% Linen","care":"Machine wash 30°C, iron damp","fit":"Relaxed Box Fit","collar":"Camp Collar","season":"Spring/Summer"}'::jsonb),

('11111111-0000-0000-0000-000000000009',
 'Merino Wool Crew Neck Jumper','merino-wool-crew-neck-jumper',
 'Superfine 18-micron merino wool crew neck jumper. Rib-knit cuffs and hem, seamless body for zero irritation. Machine washable merino.',
 29000, 25000, 50, 4.8, true, false, 'CG-MERI-039',
 ARRAY['S','M','L','XL'], ARRAY['Camel','Charcoal','Off-White','Rust'],
 '{"image_url":"https://loremflickr.com/600/600/merino,wool,sweater,knitwear?lock=139","material":"100% Merino Wool 18 Micron","gauge":"12GG","care":"Machine wash cold gentle","weight":"Lightweight","knit":"Fine Rib Trim"}'::jsonb),

-- ============ MORE WOMEN'S ============
('11111111-0000-0000-0000-000000000010',
 'Smocked Boho Maxi Dress','smocked-boho-maxi-dress',
 'Free-spirited maxi dress with an elasticated smocked bodice, tiered skirt, and adjustable thin straps. In a crinkle cotton blend for a relaxed bohemian feel.',
 15000, 12500, 85, 4.5, true, true, 'TH-BOHO-040',
 ARRAY['XS','S','M','L','XL'], ARRAY['Terracotta','Sage','White','Mustard'],
 '{"image_url":"https://loremflickr.com/600/600/boho,bohemian,maxi,dress?lock=140","material":"Crinkle Cotton Blend","care":"Machine wash cold","style":"Boho Maxi","bodice":"Elasticated Smocked","skirt":"Tiered"}'::jsonb),

('11111111-0000-0000-0000-000000000002',
 'Power Shoulder Blazer','power-shoulder-blazer',
 'Bold double-breasted blazer with exaggerated shoulders and a nipped waist. Satin lapels, gold button detail, and fully lined interior.',
 38000, NULL, 30, 4.7, true, true, 'LL-BLAZ-041',
 ARRAY['XS','S','M','L','XL'], ARRAY['Black','Ivory','Hot Pink','Camel'],
 '{"image_url":"https://loremflickr.com/600/600/blazer,power,shoulder,women?lock=141","material":"Polyester Suiting","lining":"Full Satin Lining","buttons":"Gold Tone","style":"Double-Breasted","shoulder":"Exaggerated Power Shoulder"}'::jsonb),

-- ============ SNEAKER VAULT EXTRAS ============
('11111111-0000-0000-0000-000000000008',
 'High-Top Canvas Sneaker','high-top-canvas-sneaker',
 'Classic vulcanised high-top in durable cotton canvas. Padded collar, cushioned insole, and a clean rubber cupsole. A cult classic reimagined.',
 15000, 13000, 80, 4.4, true, false, 'SV-HICH-042',
 ARRAY['38','39','40','41','42','43','44','45'], ARRAY['Black/White','White','Red/White','Navy/White'],
 '{"image_url":"https://loremflickr.com/600/600/high,top,canvas,sneaker,shoes?lock=142","material":"Cotton Canvas Upper","outsole":"Vulcanised Rubber","midsole":"Cupsole","style":"High-Top","closure":"Lace-Up"}'::jsonb),

('11111111-0000-0000-0000-000000000008',
 'Knit Slip-On Sneaker','knit-slip-on-sneaker',
 'Seamless flyknit upper shoe with a no-tie design. Sock-like stretch fit, cushioned memory foam insole, and a flexible split rubber outsole.',
 19500, 16000, 55, 4.5, true, false, 'SV-SLON-043',
 ARRAY['38','39','40','41','42','43','44'], ARRAY['Triple Black','Triple White','Smoke Grey','Olive'],
 '{"image_url":"https://loremflickr.com/600/600/slip,on,sneaker,knit?lock=143","material":"Flyknit Upper","insole":"Memory Foam","outsole":"Split Rubber","style":"Slip-On","feature":"Sock-Like Stretch Fit"}'::jsonb),

-- ============ TREND HIVE EXTRAS ============
('11111111-0000-0000-0000-000000000010',
 'Utility Cargo Trousers','utility-cargo-trousers',
 'Multi-pocket utility cargo trousers in ripstop cotton. Six pockets, adjustable hem, and a relaxed straight cut. Functional fashion at its best.',
 13500, NULL, 70, 4.4, true, false, 'TH-CARG-044',
 ARRAY['28','30','32','34','36'], ARRAY['Olive','Black','Stone','Khaki'],
 '{"image_url":"https://loremflickr.com/600/600/cargo,utility,trousers,pants?lock=144","material":"Ripstop Cotton","pockets":"6 Total (2 Cargo, 2 Front, 2 Back)","fit":"Relaxed Straight","closure":"Button + Drawstring Hem","care":"Machine wash cold"}'::jsonb),

('11111111-0000-0000-0000-000000000010',
 'Cropped Moto Leather Jacket','cropped-moto-leather-jacket',
 'Edgy cropped biker jacket in soft PU leather. Asymmetric zip, notch collar, zippered cuffs, and quilted shoulder panels.',
 32000, 27000, 35, 4.6, true, true, 'TH-MOTO-045',
 ARRAY['XS','S','M','L','XL'], ARRAY['Black','Tan'],
 '{"image_url":"https://loremflickr.com/600/600/moto,biker,leather,jacket?lock=145","material":"PU Leather","lining":"Polyester","closure":"Asymmetric Zip","style":"Cropped Biker","detailing":"Quilted Shoulder Panels","care":"Wipe clean with damp cloth"}'::jsonb),

-- ============ DENIMDEN EXTRAS ============
('11111111-0000-0000-0000-000000000007',
 'Skinny High-Rise Jeans','skinny-high-rise-jeans',
 'Second-skin skinny jeans in a 4-way stretch denim. High-rise waist, five-pocket styling, and a non-fraying hem in dark rinse.',
 13000, 10500, 100, 4.3, true, false, 'DD-SKIN-046',
 ARRAY['24','25','26','27','28','29','30'], ARRAY['Dark Wash','Black','Grey Wash'],
 '{"image_url":"https://loremflickr.com/600/600/skinny,jeans,high,waist,women?lock=146","material":"92% Cotton, 6% Polyester, 2% Elastane","stretch":"4-Way Stretch","rise":"High Waist","fit":"Skinny","care":"Machine wash inside out cold"}'::jsonb),

('11111111-0000-0000-0000-000000000007',
 'Mom Jean – Vintage Wash','mom-jean-vintage-wash',
 'High-rise relaxed mom jeans with a tapered leg and vintage acid wash. Authentic whiskering, badge patch at waistband, and classic five-pocket layout.',
 14500, NULL, 75, 4.5, true, false, 'DD-MOM-047',
 ARRAY['24','25','26','27','28','29','30','32'], ARRAY['Vintage Blue','Light Acid Wash'],
 '{"image_url":"https://loremflickr.com/600/600/mom,jeans,vintage,denim?lock=147","material":"100% Cotton Denim","wash":"Acid Vintage Wash","rise":"High Waist","fit":"Mom — Relaxed Tapered","care":"Machine wash cold, reshape while damp"}'::jsonb),

-- ============ KIDDOKINGDOM EXTRAS ============
('11111111-0000-0000-0000-000000000003',
 'Girls Sequin Party Dress','girls-sequin-party-dress',
 'Shimmery sequin overlay party dress with a tulle underskirt for added volume. Satin bodice, bow-back detail, and concealed back zip.',
 11500, 9500, 60, 4.8, true, true, 'KK-GSEQ-048',
 ARRAY['2-3Y','3-4Y','4-5Y','5-6Y','6-7Y','7-8Y'], ARRAY['Gold','Silver','Pink','Blue'],
 '{"image_url":"https://loremflickr.com/600/600/sequin,party,dress,girl,kids?lock=148","material":"Sequin Overlay, Tulle, Satin","care":"Hand wash cold","style":"Party Dress","skirt":"Tulle Underskirt","closure":"Back Zip"}'::jsonb),

('11111111-0000-0000-0000-000000000003',
 'Toddler Puffer Jacket','toddler-puffer-jacket',
 'Warm and lightweight puffer jacket for toddlers. 200-fill quilted body, elastic cuffs, a full-length zip with chin guard, and two zip pockets.',
 9000, 7500, 85, 4.7, true, false, 'KK-BPUF-049',
 ARRAY['12-18M','18-24M','2-3Y','3-4Y','4-5Y'], ARRAY['Red','Navy','Black','Hot Pink'],
 '{"image_url":"https://loremflickr.com/600/600/puffer,jacket,kids,toddler?lock=149","material":"Polyester Shell, 200-Fill Down","care":"Machine wash 30°C, tumble dry low","fill":"200-Fill Feather Down","pockets":"2 Zip Hand Pockets","chin_guard":true}'::jsonb),

-- ============ SOLE STUDIO EXTRAS ============
('11111111-0000-0000-0000-000000000004',
 'Comfort Flatform Sandal','comfort-flatform-sandal',
 'All-day comfort sandal with a 4cm cork-effect flatform, adjustable ankle strap, and a contoured footbed with arch support.',
 10500, NULL, 80, 4.4, true, false, 'SS-FLAT-050',
 ARRAY['36','37','38','39','40','41','42'], ARRAY['Tan','Black','White'],
 '{"image_url":"https://loremflickr.com/600/600/flatform,cork,sandal,women?lock=150","material":"Synthetic Upper","sole":"Cork-Effect EVA Flatform","footbed":"Contoured Arch Support","heel_height":"4cm","closure":"Adjustable Ankle Strap","season":"Spring/Summer"}'::jsonb)

ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- CATEGORY ASSIGNMENTS
-- Intelligently maps products to relevant categories using slug keywords
-- =============================================================================

-- Men's clothing
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'men-t-shirts-polos'
WHERE p.slug IN ('classic-pique-polo-shirt','graphic-oversized-tee')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'men-shirts-casual-formal'
WHERE p.slug IN ('slim-fit-oxford-shirt','relaxed-linen-shirt')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'men-trousers-chinos'
WHERE p.slug IN ('tailored-chino-trousers','utility-cargo-trousers')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'men-hoodies-jackets'
WHERE p.slug IN ('heavyweight-zip-hoodie','cropped-moto-leather-jacket')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'men-native-wear'
WHERE p.slug IN ('men-ankara-kaftan','senator-2-piece-suit','agbada-3-piece-set')
ON CONFLICT DO NOTHING;

-- Men's footwear
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'men-brogues-oxfords'
WHERE p.slug IN ('brogue-oxford-dress-shoe')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'men-sneakers'
WHERE p.slug IN ('air-cushion-lifestyle-sneaker','high-top-canvas-sneaker','knit-slip-on-sneaker')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'men-loafers'
WHERE p.slug IN ('penny-loafer-suede')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'men-boots'
WHERE p.slug IN ('side-zip-chelsea-boot')
ON CONFLICT DO NOTHING;

-- Women's clothing
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'women-dresses-gowns'
WHERE p.slug IN ('floral-wrap-midi-dress','smocked-boho-maxi-dress','women-adire-gown')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'women-tops-blouses'
WHERE p.slug IN ('satin-cowl-neck-top')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'women-skirts-trousers'
WHERE p.slug IN ('high-rise-wide-leg-trousers','structured-pencil-skirt','skinny-high-rise-jeans','mom-jean-vintage-wash')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'women-two-piece-sets'
WHERE p.slug IN ('ribbed-knit-coord-set')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'women-native-wear'
WHERE p.slug IN ('women-adire-gown','men-ankara-kaftan')
ON CONFLICT DO NOTHING;

-- Women's footwear
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'women-heels'
WHERE p.slug IN ('barely-there-strappy-heels','block-heel-mule')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'women-sandals'
WHERE p.slug IN ('flatform-espadrille-sandal','comfort-flatform-sandal')
ON CONFLICT DO NOTHING;

-- Kids
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'kids-boys-sets'
WHERE p.slug IN ('boys-dinosaur-polo-set')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'kids-girls-dresses'
WHERE p.slug IN ('girls-floral-tutu-dress','girls-sequin-party-dress')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'kids-boys-sneakers'
WHERE p.slug IN ('boys-velcro-running-shoe')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'kids-school-backpacks'
WHERE p.slug IN ('kids-canvas-school-backpack')
ON CONFLICT DO NOTHING;

-- Accessories
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'accessories-handbags'
WHERE p.slug IN ('structured-top-handle-bag')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'accessories-tote-bags'
WHERE p.slug IN ('woven-raffia-tote-bag')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'accessories-crossbody-bags'
WHERE p.slug IN ('mini-quilted-crossbody')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'accessories-travel-boxes'
WHERE p.slug IN ('hard-shell-trolley-40l')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'accessories-watches'
WHERE p.slug IN ('minimalist-mesh-strap-watch')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'accessories-jewelry'
WHERE p.slug IN ('chunky-gold-chain-necklace','pearl-drop-stud-earrings')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'accessories-sunglasses'
WHERE p.slug IN ('oversized-square-sunglasses')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'accessories-caps-hats'
WHERE p.slug IN ('six-panel-bucket-hat')
ON CONFLICT DO NOTHING;

-- Also assign misc items to parent categories
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'men-clothing'
WHERE p.slug IN ('formal-slim-blazer','merino-wool-crew-neck-jumper','straight-leg-jeans')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id FROM public.products p
JOIN public.categories c ON c.slug = 'women-clothing'
WHERE p.slug IN ('power-shoulder-blazer','oversized-denim-jacket')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- COLLECTIONS
-- =============================================================================

INSERT INTO public.product_collections (product_id, collection_id, display_order)
SELECT p.id, col.id, row_number() OVER (ORDER BY p.rating DESC)
FROM public.products p
CROSS JOIN (SELECT id FROM public.collections WHERE slug = 'best-sellers') col
WHERE p.rating >= 4.6
ON CONFLICT DO NOTHING;

INSERT INTO public.product_collections (product_id, collection_id, display_order)
SELECT p.id, col.id, row_number() OVER (ORDER BY p.created_at DESC)
FROM public.products p
CROSS JOIN (SELECT id FROM public.collections WHERE slug = 'new-arrivals') col
ON CONFLICT DO NOTHING;

INSERT INTO public.product_collections (product_id, collection_id, display_order)
SELECT p.id, col.id, row_number() OVER ()
FROM public.products p
CROSS JOIN (SELECT id FROM public.collections WHERE slug = 'on-sale' LIMIT 1) col
WHERE p.discount_price IS NOT NULL
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PRODUCT VARIANTS (explicit per product type)
-- =============================================================================
INSERT INTO public.product_variants (product_id, size, color, price_modifier, stock_quantity)
SELECT p.id, s.size, c.color, 
  CASE WHEN s.size IN ('XL','XXL','44','45') THEN 500 ELSE 0 END,
  floor(random()*40+5)::int
FROM public.products p
CROSS JOIN unnest(p.sizes) AS s(size)
CROSS JOIN unnest(p.colors) AS c(color)
ON CONFLICT DO NOTHING;

-- =============================================================================
NOTIFY pgrst, 'reload_schema';
