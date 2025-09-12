-- Debug cart persistence issues
-- Run this step by step in Supabase SQL editor

-- Step 1: Check if cart_items table exists and is accessible
SELECT COUNT(*) as total_cart_items FROM cart_items;

-- Step 2: Check RLS policies on cart_items
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'cart_items';

-- Step 3: Check if we can insert a test cart item
-- Replace 'YOUR_USER_ID' with your actual user ID from the console logs
-- You can see it in the console: "User: 8930d46e-0490-460c-8b73-6b39ada3a609"

-- First, let's see what users exist:
SELECT id, email FROM auth.users LIMIT 3;

-- Test insert (replace the user_id with your actual user ID):
-- INSERT INTO cart_items (
--   user_id,
--   product_id,
--   variant_id,
--   quantity,
--   price_at_time
-- ) VALUES (
--   '8930d46e-0490-460c-8b73-6b39ada3a609',
--   'test_product',
--   'test_variant',
--   1,
--   25.00
-- );

-- Step 4: Check if the insert worked:
-- SELECT * FROM cart_items WHERE user_id = '8930d46e-0490-460c-8b73-6b39ada3a609';

-- Step 5: Check if products table has the expected structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Step 6: Check if there are any products in the database
SELECT COUNT(*) as total_products FROM products;

-- Step 7: Check if product_variants table has data
SELECT COUNT(*) as total_variants FROM product_variants;

-- Step 8: Try to select from cart_items with joins (like the app does)
-- SELECT 
--   ci.*,
--   p.name as product_name,
--   pv.color,
--   pv.size
-- FROM cart_items ci
-- LEFT JOIN products p ON ci.product_id = p.id
-- LEFT JOIN product_variants pv ON ci.variant_id = pv.id
-- WHERE ci.user_id = '8930d46e-0490-460c-8b73-6b39ada3a609'
-- LIMIT 5;
