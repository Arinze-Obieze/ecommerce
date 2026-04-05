-- =====================================================================
-- LIVE DATABASE SCHEMA SNAPSHOT (Generated from Supabase PostgREST)
-- =====================================================================
-- Source: https://czzfftcojsuowgdzrjgm.supabase.co/rest/v1/
-- Generated at: 2026-03-20T01:37:50.902Z
-- Notes:
-- 1) This is documentation SQL for AI agents and engineers (not a runnable migration).
-- 2) Metadata is based on PostgREST schema cache exposure.
-- 3) Indexes/check constraints/policies may be partially invisible from this endpoint.

-- ---------------------------------------------------------------------
-- OBJECT INVENTORY
-- ---------------------------------------------------------------------
-- activity_logs  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- admin_audit_logs  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- admin_daily_orders  [READ_ONLY_VIEW_OR_TABLE]  ops: GET
-- admin_users  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- analytics_events  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- auth_analytics  [READ_ONLY_VIEW_OR_TABLE]  ops: GET
-- banners  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- cart  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- categories  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- collections  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- error_summary  [READ_ONLY_VIEW_OR_TABLE]  ops: GET
-- order_items  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- orders  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- payment_analytics  [READ_ONLY_VIEW_OR_TABLE]  ops: GET
-- product_categories  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- product_collections  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- product_images  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- product_variants  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- product_variants_internal  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- products  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- products_internal  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- products_summary  [READ_ONLY_VIEW_OR_TABLE]  ops: GET
-- reviews  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- seller_images_metadata  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- store_users  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- stores  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- user_addresses  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- users  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST
-- variants_with_product  [READ_ONLY_VIEW_OR_TABLE]  ops: GET
-- wishlist_items  [TABLE_OR_UPDATABLE_VIEW]  ops: DELETE, GET, PATCH, POST

-- ---------------------------------------------------------------------
-- OBJECT DEFINITIONS
-- ---------------------------------------------------------------------
-- ===== activity_logs =====
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  created_at string(timestamp without time zone)NOT NULL DEFAULT now(),
  request_id string(uuid)NOT NULL DEFAULT gen_random_uuid(),
  -- Unique ID to trace a single user request across multiple logs
  session_id string(uuid)NULL,
  user_id string(uuid)NULL,
  ip_address string(inet)NULL,
  user_agent string(text)NULL,
  level string(text)NOT NULL,
  -- Log severity: DEBUG, INFO, WARN, ERROR, CRITICAL
  service string(text)NOT NULL,
  action string(text)NOT NULL,
  -- Specific action that triggered the log (e.g., LOGIN_SUCCESS, PAYMENT_FAILED)
  status string(text)NOT NULL,
  status_code integer(integer)NULL,
  message string(text)NOT NULL,
  error_code string(character varying)NULL,
  error_stack string(text)NULL,
  duration_ms integer(integer)NULL,
  metadata unknown(jsonb)NULL,
  -- Flexible JSON object for context-specific data. Examples: payment details, search params, validation errors
  environment string(text)NOT NULL
);

-- ===== admin_audit_logs =====
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  created_at string(timestamp with time zone)NOT NULL DEFAULT now(),
  actor_user_id string(uuid)NULL,
  actor_admin_user_id string(uuid)NULL REFERENCES public.admin_users(id),
  -- Note: This is a Foreign Key to `admin_users.id`.<fk table='admin_users' column='id'/>
  action string(text)NOT NULL,
  target_type string(text)NOT NULL,
  target_id string(text)NOT NULL,
  before_data unknown(jsonb)NULL,
  after_data unknown(jsonb)NULL,
  metadata unknown(jsonb)NOT NULL
);

-- ===== admin_daily_orders =====
CREATE TABLE IF NOT EXISTS public.admin_daily_orders (
  day string(date)NULL,
  orders_count integer(bigint)NULL,
  completed_orders integer(bigint)NULL,
  cancelled_orders integer(bigint)NULL,
  gmv_paid number(numeric)NULL,
  gmv_total number(numeric)NULL,
  aov_paid number(numeric)NULL
);

-- ===== admin_users =====
CREATE TABLE IF NOT EXISTS public.admin_users (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  user_id string(uuid)NOT NULL,
  role string(text)NOT NULL,
  is_active boolean(boolean)NOT NULL DEFAULT true,
  created_at string(timestamp with time zone)NOT NULL DEFAULT now(),
  updated_at string(timestamp with time zone)NOT NULL DEFAULT now(),
  created_by string(uuid)NULL,
  last_login_at string(timestamp with time zone)NULL
);

-- ===== analytics_events =====
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  created_at string(timestamp with time zone)NOT NULL DEFAULT now(),
  event_name string(text)NOT NULL,
  user_id string(uuid)NULL,
  session_id string(uuid)NULL,
  anon_id string(text)NULL,
  path string(text)NULL,
  referrer string(text)NULL,
  device_type string(text)NULL,
  country string(text)NULL,
  state string(text)NULL,
  properties unknown(jsonb)NOT NULL
);

-- ===== auth_analytics =====
CREATE TABLE IF NOT EXISTS public.auth_analytics (
  time_bucket string(timestamp without time zone)NULL,
  action string(text)NULL,
  status string(text)NULL,
  count integer(bigint)NULL
);

-- ===== banners =====
CREATE TABLE IF NOT EXISTS public.banners (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  title string(text)NOT NULL,
  subtitle string(text)NULL,
  cta_text string(text)NULL,
  cta_link string(text)NULL,
  background_image string(text)NULL,
  foreground_image string(text)NULL,
  created_at string(timestamp with time zone)NULL DEFAULT now(),
  is_active boolean(boolean)NULL DEFAULT false
);

-- ===== platform_content =====
CREATE TABLE IF NOT EXISTS public.platform_content (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  content_key string(text)NOT NULL,
  title string(text)NOT NULL,
  description string(text)NULL,
  data unknown(jsonb)NOT NULL DEFAULT '{}'::jsonb,
  created_at string(timestamp with time zone)NOT NULL DEFAULT now(),
  updated_at string(timestamp with time zone)NOT NULL DEFAULT now(),
  updated_by string(uuid)NULL
);

-- ===== cart =====
CREATE TABLE IF NOT EXISTS public.cart (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  user_id string(uuid)NULL,
  product_id integer(bigint)NULL REFERENCES public.products(id),
  -- Note: This is a Foreign Key to `products.id`.<fk table='products' column='id'/>
  variant_id string(uuid)NULL REFERENCES public.product_variants(id),
  -- Note: This is a Foreign Key to `product_variants.id`.<fk table='product_variants' column='id'/>
  quantity integer(integer)NULL DEFAULT 1,
  created_at string(timestamp with time zone)NULL DEFAULT now(),
  updated_at string(timestamp with time zone)NULL DEFAULT now()
);

-- ===== categories =====
CREATE TABLE IF NOT EXISTS public.categories (
  id integer(bigint)NOT NULL PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  created_at string(timestamp with time zone)NOT NULL DEFAULT now(),
  name string(text)NOT NULL,
  slug string(text)NOT NULL,
  description string(text)NULL,
  parent_id integer(bigint)NULL REFERENCES public.categories(id),
  -- Note: This is a Foreign Key to `categories.id`.<fk table='categories' column='id'/>
  image_url string(text)NULL,
  display_order integer(integer)NULL DEFAULT 0,
  is_active boolean(boolean)NULL DEFAULT true,
  meta_title string(text)NULL,
  meta_description string(text)NULL
);

-- ===== collections =====
CREATE TABLE IF NOT EXISTS public.collections (
  id integer(bigint)NOT NULL PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  created_at string(timestamp with time zone)NULL DEFAULT now(),
  name string(text)NOT NULL,
  slug string(text)NOT NULL,
  description string(text)NULL,
  image_url string(text)NULL,
  is_active boolean(boolean)NULL DEFAULT true,
  display_order integer(integer)NULL DEFAULT 0
);

-- ===== error_summary =====
CREATE TABLE IF NOT EXISTS public.error_summary (
  action string(text)NULL,
  error_code string(character varying)NULL,
  occurrence_count integer(bigint)NULL,
  last_occurrence string(timestamp without time zone)NULL,
  percentage number(numeric)NULL
);

-- ===== order_items =====
CREATE TABLE IF NOT EXISTS public.order_items (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  order_id string(uuid)NULL REFERENCES public.orders(id),
  -- Note: This is a Foreign Key to `orders.id`.<fk table='orders' column='id'/>
  product_id integer(bigint)NULL REFERENCES public.products(id),
  -- Note: This is a Foreign Key to `products.id`.<fk table='products' column='id'/>
  quantity integer(integer)NOT NULL DEFAULT 1,
  price number(numeric)NOT NULL DEFAULT 0,
  variant_id string(uuid)NULL
);

-- ===== orders =====
CREATE TABLE IF NOT EXISTS public.orders (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  user_id string(uuid)NULL,
  total_amount number(numeric)NOT NULL DEFAULT 0,
  status string(text)NOT NULL DEFAULT pending,
  created_at string(timestamp with time zone)NULL DEFAULT now(),
  updated_at string(timestamp with time zone)NULL DEFAULT now(),
  payment_reference string(text)NULL
);

-- ===== payment_analytics =====
CREATE TABLE IF NOT EXISTS public.payment_analytics (
  time_bucket string(timestamp without time zone)NULL,
  status string(text)NULL,
  transaction_count integer(bigint)NULL,
  unique_users integer(bigint)NULL,
  avg_amount number(numeric)NULL
);

-- ===== product_categories =====
CREATE TABLE IF NOT EXISTS public.product_categories (
  id integer(bigint)NOT NULL PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  product_id integer(bigint)NOT NULL REFERENCES public.products(id),
  -- Note: This is a Foreign Key to `products.id`.<fk table='products' column='id'/>
  category_id integer(bigint)NOT NULL REFERENCES public.categories(id),
  -- Note: This is a Foreign Key to `categories.id`.<fk table='categories' column='id'/>
  created_at string(timestamp with time zone)NOT NULL DEFAULT now(),
  is_primary boolean(boolean)NULL DEFAULT false
);

-- ===== product_collections =====
CREATE TABLE IF NOT EXISTS public.product_collections (
  id integer(bigint)NOT NULL PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  created_at string(timestamp with time zone)NULL DEFAULT now(),
  product_id integer(bigint)NULL REFERENCES public.products(id),
  -- Note: This is a Foreign Key to `products.id`.<fk table='products' column='id'/>
  collection_id integer(bigint)NULL REFERENCES public.collections(id),
  -- Note: This is a Foreign Key to `collections.id`.<fk table='collections' column='id'/>
  display_order integer(integer)NULL DEFAULT 0
);

-- ===== product_images =====
CREATE TABLE IF NOT EXISTS public.product_images (
  image_id string(text)NOT NULL PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  product_id string(text)NOT NULL REFERENCES public.products_internal(product_id),
  -- Note: This is a Foreign Key to `products_internal.product_id`.<fk table='products_internal' column='product_id'/>
  image_path string(text)NOT NULL,
  original_filename string(text)NULL,
  file_size integer(integer)NULL,
  mime_type string(text)NULL,
  file_hash string(text)NULL,
  image_type string(text)NULL,
  image_strategy string(text)NULL,
  variant_color string(text)NULL,
  image_order integer(integer)NULL DEFAULT 0,
  is_primary boolean(boolean)NULL DEFAULT false,
  supabase_image_id string(text)NULL,
  supabase_url string(text)NULL,
  supabase_storage_path string(text)NULL,
  supabase_upload_status string(text)NULL DEFAULT pending,
  supabase_uploaded_at string(timestamp with time zone)NULL,
  is_active boolean(boolean)NULL DEFAULT true,
  uploaded_at string(timestamp with time zone)NULL DEFAULT now(),
  uploaded_by string(text)NULL,
  local_db_synced boolean(boolean)NULL DEFAULT true
);

-- ===== product_variants =====
CREATE TABLE IF NOT EXISTS public.product_variants (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  product_id integer(bigint)NULL REFERENCES public.products(id),
  -- Note: This is a Foreign Key to `products.id`.<fk table='products' column='id'/>
  size string(text)NULL,
  color string(text)NULL,
  price_modifier number(numeric)NULL DEFAULT 0,
  stock_quantity integer(integer)NULL DEFAULT 0,
  created_at string(timestamp with time zone)NULL DEFAULT now()
);

-- ===== product_variants_internal =====
CREATE TABLE IF NOT EXISTS public.product_variants_internal (
  variant_id string(text)NOT NULL PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  product_id string(text)NOT NULL REFERENCES public.products_internal(product_id),
  -- Note: This is a Foreign Key to `products_internal.product_id`.<fk table='products_internal' column='product_id'/>
  color string(text)NULL,
  size string(text)NULL,
  quantity integer(integer)NULL DEFAULT 0,
  price number(numeric)NULL,
  sku string(text)NULL,
  barcode string(text)NULL,
  notes string(text)NULL,
  weight number(numeric)NULL,
  dimensions string(text)NULL,
  status string(text)NULL DEFAULT active,
  created_at string(timestamp with time zone)NULL DEFAULT now(),
  updated_at string(timestamp with time zone)NULL DEFAULT now(),
  supabase_synced integer(integer)NULL DEFAULT 1,
  supabase_synced_at string(timestamp with time zone)NULL,
  local_db_synced boolean(boolean)NULL DEFAULT true
);

-- ===== products =====
CREATE TABLE IF NOT EXISTS public.products (
  id integer(bigint)NOT NULL PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  store_id string(uuid)NULL REFERENCES public.stores(id),
  -- Note: This is a Foreign Key to `stores.id`.<fk table='stores' column='id'/>
  name string(text)NOT NULL,
  slug string(text)NOT NULL,
  description string(text)NULL,
  price number(numeric)NOT NULL,
  discount_price number(numeric)NULL,
  bulk_discount_tiers unknown(jsonb)NULL,
  stock_quantity integer(integer)NULL DEFAULT 0,
  rating number(numeric)NULL DEFAULT 0,
  is_active boolean(boolean)NULL DEFAULT true,
  is_featured boolean(boolean)NULL DEFAULT false,
  sku string(text)NULL,
  specifications unknown(jsonb)NULL,
  sizes array(text[])NULL,
  colors array(text[])NULL,
  created_at string(timestamp with time zone)NULL DEFAULT now(),
  updated_at string(timestamp with time zone)NULL DEFAULT now(),
  image_urls array(text[])NULL,
  video_urls array(text[])NULL
);

-- ===== products_internal =====
CREATE TABLE IF NOT EXISTS public.products_internal (
  product_id string(text)NOT NULL PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  seller_id string(text)NOT NULL,
  product_name string(text)NOT NULL,
  description string(text)NULL,
  category string(text)NULL,
  subcategory string(text)NULL,
  price number(numeric)NULL,
  quantity integer(integer)NULL DEFAULT 0,
  status string(text)NULL DEFAULT active,
  approval_status string(text)NULL DEFAULT pending,
  created_at string(timestamp with time zone)NULL DEFAULT now(),
  updated_at string(timestamp with time zone)NULL DEFAULT now(),
  approved_by string(text)NULL,
  approved_at string(timestamp with time zone)NULL,
  brand string(text)NULL,
  material string(text)NULL,
  gender string(text)NULL,
  age_group string(text)NULL,
  base_sku string(text)NULL,
  notes string(text)NULL,
  temp_product_id string(text)NULL,
  image_strategy string(text)NULL,
  care_instructions string(text)NULL,
  rejection_reason string(text)NULL,
  created_by string(text)NULL,
  view_count integer(integer)NULL DEFAULT 0,
  order_count integer(integer)NULL DEFAULT 0,
  supabase_synced integer(integer)NULL DEFAULT 1,
  supabase_synced_at string(timestamp with time zone)NULL,
  sync_error string(text)NULL,
  sync_attempts integer(integer)NULL DEFAULT 0,
  local_db_synced boolean(boolean)NULL DEFAULT true,
  store_id string(text)NULL
);

-- ===== products_summary =====
CREATE TABLE IF NOT EXISTS public.products_summary (
  product_id string(text)NULL PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  seller_id string(text)NULL,
  product_name string(text)NULL,
  category string(text)NULL,
  subcategory string(text)NULL,
  base_sku string(text)NULL,
  price number(numeric)NULL,
  quantity integer(integer)NULL,
  status string(text)NULL,
  approval_status string(text)NULL,
  created_at string(timestamp with time zone)NULL,
  variant_count integer(bigint)NULL,
  image_count integer(bigint)NULL,
  uploaded_image_count integer(bigint)NULL
);

-- ===== reviews =====
CREATE TABLE IF NOT EXISTS public.reviews (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  product_id integer(bigint)NULL REFERENCES public.products(id),
  -- Note: This is a Foreign Key to `products.id`.<fk table='products' column='id'/>
  user_id string(uuid)NULL,
  rating integer(integer)NOT NULL,
  comment string(text)NULL,
  created_at string(timestamp with time zone)NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ===== seller_images_metadata =====
CREATE TABLE IF NOT EXISTS public.seller_images_metadata (
  image_id string(text)NOT NULL PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  seller_id string(text)NOT NULL,
  image_type string(text)NOT NULL,
  original_filename string(text)NOT NULL,
  file_size integer(bigint)NOT NULL,
  mime_type string(text)NULL,
  business_name string(text)NULL,
  upload_date string(timestamp without time zone)NULL,
  uploaded_by string(text)NULL,
  supabase_image_id string(text)NULL,
  supabase_url string(text)NULL,
  supabase_storage_path string(text)NULL,
  supabase_upload_method string(text)NULL,
  supabase_upload_status string(text)NULL DEFAULT pending,
  supabase_uploaded_at string(timestamp without time zone)NULL,
  local_encrypted_path string(text)NULL,
  is_active boolean(boolean)NULL DEFAULT true,
  created_at string(timestamp without time zone)NULL DEFAULT now(),
  updated_at string(timestamp without time zone)NULL DEFAULT now()
);

-- ===== store_users =====
CREATE TABLE IF NOT EXISTS public.store_users (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  store_id string(uuid)NOT NULL REFERENCES public.stores(id),
  -- Note: This is a Foreign Key to `stores.id`.<fk table='stores' column='id'/>
  user_id string(uuid)NOT NULL,
  role string(text)NOT NULL DEFAULT staff,
  status string(text)NOT NULL DEFAULT active,
  created_at string(timestamp with time zone)NOT NULL DEFAULT now(),
  created_by string(uuid)NULL
);

-- ===== stores =====
CREATE TABLE IF NOT EXISTS public.stores (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  name string(text)NOT NULL,
  slug string(text)NOT NULL,
  logo_url string(text)NULL,
  description string(text)NULL,
  rating number(numeric)NULL DEFAULT 4.5,
  followers integer(integer)NULL DEFAULT 0,
  created_at string(timestamp with time zone)NOT NULL DEFAULT timezone('utc'::text, now()),
  status string(text)NOT NULL DEFAULT pending,
  approved_at string(timestamp with time zone)NULL,
  approved_by string(uuid)NULL,
  kyc_status string(text)NOT NULL DEFAULT not_required,
  payout_ready boolean(boolean)NOT NULL DEFAULT false,
  user_id string(uuid)NULL,
  banner_url string(text)NULL,
  is_active boolean(boolean)NULL DEFAULT true,
  is_verified boolean(boolean)NULL DEFAULT false,
  updated_at string(timestamp with time zone)NULL DEFAULT now()
);

-- ===== user_addresses =====
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  user_id string(uuid)NOT NULL,
  label string(text)NOT NULL DEFAULT Address,
  address_line1 string(text)NOT NULL,
  address_line2 string(text)NULL,
  city string(text)NOT NULL,
  state string(text)NOT NULL,
  postal_code string(text)NULL,
  country string(text)NOT NULL DEFAULT Nigeria,
  phone string(text)NOT NULL,
  is_default boolean(boolean)NOT NULL DEFAULT false,
  created_at string(timestamp with time zone)NOT NULL DEFAULT now(),
  updated_at string(timestamp with time zone)NOT NULL DEFAULT now()
);

-- ===== users =====
CREATE TABLE IF NOT EXISTS public.users (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  created_at string(timestamp with time zone)NOT NULL DEFAULT now(),
  full_name string(text)NULL DEFAULT ,
  email string(text)NOT NULL DEFAULT ,
  phone string(text)NULL,
  state string(text)NULL,
  avatar string(text)NULL
);

-- ===== variants_with_product =====
CREATE TABLE IF NOT EXISTS public.variants_with_product (
  variant_id string(text)NULL PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  product_id string(text)NULL REFERENCES public.products_internal(product_id),
  -- Note: This is a Foreign Key to `products_internal.product_id`.<fk table='products_internal' column='product_id'/>
  product_name string(text)NULL,
  seller_id string(text)NULL,
  color string(text)NULL,
  size string(text)NULL,
  quantity integer(integer)NULL,
  price number(numeric)NULL,
  sku string(text)NULL,
  status string(text)NULL,
  category string(text)NULL,
  subcategory string(text)NULL
);

-- ===== wishlist_items =====
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id string(uuid)NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Note: This is a Primary Key.<pk/>
  user_id string(uuid)NOT NULL,
  product_id integer(bigint)NOT NULL REFERENCES public.products(id),
  -- Note: This is a Foreign Key to `products.id`.<fk table='products' column='id'/>
  created_at string(timestamp with time zone)NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- RELATIONSHIPS (FKs inferred from live metadata)
-- ---------------------------------------------------------------------
-- admin_audit_logs.actor_admin_user_id -> admin_users.id
-- cart.product_id -> products.id
-- cart.variant_id -> product_variants.id
-- categories.parent_id -> categories.id
-- order_items.order_id -> orders.id
-- order_items.product_id -> products.id
-- product_categories.category_id -> categories.id
-- product_categories.product_id -> products.id
-- product_collections.collection_id -> collections.id
-- product_collections.product_id -> products.id
-- product_images.product_id -> products_internal.product_id
-- product_variants.product_id -> products.id
-- product_variants_internal.product_id -> products_internal.product_id
-- products.store_id -> stores.id
-- reviews.product_id -> products.id
-- store_users.store_id -> stores.id
-- variants_with_product.product_id -> products_internal.product_id
-- wishlist_items.product_id -> products.id

-- ---------------------------------------------------------------------
-- EXPOSED RPC FUNCTIONS (from /rpc/* paths)
-- ---------------------------------------------------------------------
-- FUNCTION public.anonymize_user_logs(...)
-- FUNCTION public.checkout_transaction(...)
-- FUNCTION public.cleanup_old_logs(...)
-- FUNCTION public.get_category_branch_ids(...)
-- FUNCTION public.insert_user_profile(...)
-- FUNCTION public.release_order_stock(...)

-- ---------------------------------------------------------------------
-- QUICK VERIFICATION QUERIES (manual)
-- ---------------------------------------------------------------------
-- SELECT * FROM public.products LIMIT 1;
-- SELECT * FROM public.orders LIMIT 1;
-- SELECT * FROM public.order_items LIMIT 1;
-- SELECT * FROM public.product_variants LIMIT 1;
-- NOTIFY pgrst, 'reload_schema';
