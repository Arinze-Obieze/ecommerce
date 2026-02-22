-- Add payment_reference column to orders table
ALTER TABLE public.orders 
ADD COLUMN payment_reference TEXT UNIQUE;

-- Update the orders table status constraint to include 'paid' if needed, or we'll use 'completed'
-- The current constraint is: CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))
-- We'll use 'completed' for paid orders instead of adding 'paid'
