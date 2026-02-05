-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  product_id BIGINT REFERENCES products(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own wishlist items" 
ON wishlist_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist" 
ON wishlist_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist" 
ON wishlist_items FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_wishlist_user_product ON wishlist_items(user_id, product_id);
