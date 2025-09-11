-- Manual User Profile Update Script
-- Replace the email with your actual email address

-- ============================================================================
-- STEP 1: UPDATE YOUR USER PROFILE MANUALLY
-- ============================================================================

-- Replace 'your-email@example.com' with your actual email
UPDATE public.users 
SET 
  first_name = 'Test',
  last_name = 'User',
  full_name = 'Test User',
  is_verified = true,
  updated_at = NOW()
WHERE email = 'your-email@example.com';  -- CHANGE THIS TO YOUR EMAIL

-- ============================================================================
-- STEP 2: VERIFY THE UPDATE
-- ============================================================================

-- Check if the update worked
SELECT 
  id,
  email,
  first_name,
  last_name,
  full_name,
  is_verified,
  created_at,
  updated_at
FROM public.users 
WHERE email = 'your-email@example.com';  -- CHANGE THIS TO YOUR EMAIL

-- ============================================================================
-- STEP 3: TEST CART FUNCTIONALITY FOR YOUR USER
-- ============================================================================

-- Get your user ID (replace the email)
DO $$
DECLARE
    your_user_id UUID;
BEGIN
    SELECT id INTO your_user_id 
    FROM public.users 
    WHERE email = 'your-email@example.com';  -- CHANGE THIS TO YOUR EMAIL
    
    IF your_user_id IS NOT NULL THEN
        RAISE NOTICE 'Your user ID is: %', your_user_id;
        
        -- Add a test item to your cart
        INSERT INTO public.cart_items (
            user_id,
            product_id,
            variant_id,
            quantity,
            price_at_time
        ) VALUES (
            your_user_id,
            'test-product-123',
            'test-variant-456',
            1,
            29.99
        ) ON CONFLICT (user_id, product_id, variant_id) 
        DO UPDATE SET 
            quantity = cart_items.quantity + 1,
            updated_at = NOW();
            
        RAISE NOTICE 'Test cart item added successfully';
        
        -- Add another item
        INSERT INTO public.cart_items (
            user_id,
            product_id,
            variant_id,
            quantity,
            price_at_time
        ) VALUES (
            your_user_id,
            'product_1',
            'variant_1_1',
            1,
            45.00
        ) ON CONFLICT (user_id, product_id, variant_id) 
        DO UPDATE SET 
            quantity = cart_items.quantity + 1,
            updated_at = NOW();
            
        RAISE NOTICE 'Second cart item added successfully';
    ELSE
        RAISE NOTICE 'User not found with that email';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: VERIFY YOUR CART ITEMS
-- ============================================================================

-- Check your cart items (replace the email)
SELECT 
  'Your Cart Items' as test_result,
  ci.id,
  ci.product_id,
  p.name as product_name,
  ci.variant_id,
  pv.color,
  pv.size,
  ci.quantity,
  ci.price_at_time,
  (ci.quantity * ci.price_at_time) as line_total,
  ci.added_at,
  ci.updated_at
FROM public.cart_items ci
JOIN public.users u ON ci.user_id = u.id
JOIN public.products p ON ci.product_id = p.id
LEFT JOIN public.product_variants pv ON ci.variant_id = pv.id
WHERE u.email = 'your-email@example.com'  -- CHANGE THIS TO YOUR EMAIL
ORDER BY ci.added_at DESC;

-- Calculate cart total
SELECT 
  'Cart Summary' as summary,
  u.email,
  COUNT(ci.id) as total_items,
  SUM(ci.quantity) as total_quantity,
  SUM(ci.quantity * ci.price_at_time) as cart_total
FROM public.cart_items ci
JOIN public.users u ON ci.user_id = u.id
WHERE u.email = 'your-email@example.com'  -- CHANGE THIS TO YOUR EMAIL
GROUP BY u.email;

-- ============================================================================
-- STEP 5: TEST WISHLIST FUNCTIONALITY
-- ============================================================================

-- Add a test item to wishlist (replace the email)
DO $$
DECLARE
    your_user_id UUID;
BEGIN
    SELECT id INTO your_user_id 
    FROM public.users 
    WHERE email = 'your-email@example.com';  -- CHANGE THIS TO YOUR EMAIL
    
    IF your_user_id IS NOT NULL THEN
        -- Add items to wishlist
        INSERT INTO public.wishlist_items (
            user_id,
            product_id,
            variant_id
        ) VALUES 
        (your_user_id, 'product_2', 'variant_2_1'),
        (your_user_id, 'mask_1', 'mask_1_variant_1')
        ON CONFLICT (user_id, product_id, variant_id) DO NOTHING;
        
        RAISE NOTICE 'Test wishlist items added successfully';
    END IF;
END $$;

-- Check your wishlist items
SELECT 
  'Your Wishlist Items' as test_result,
  wi.id,
  wi.product_id,
  p.name as product_name,
  wi.variant_id,
  pv.color,
  pv.size,
  p.base_price,
  wi.added_at
FROM public.wishlist_items wi
JOIN public.users u ON wi.user_id = u.id
JOIN public.products p ON wi.product_id = p.id
LEFT JOIN public.product_variants pv ON wi.variant_id = pv.id
WHERE u.email = 'your-email@example.com'  -- CHANGE THIS TO YOUR EMAIL
ORDER BY wi.added_at DESC;

-- ============================================================================
-- FINAL INSTRUCTIONS
-- ============================================================================

SELECT '🎯 INSTRUCTIONS FOR FIXING YOUR ACCOUNT:' as instructions;

SELECT '
1. Replace all instances of "your-email@example.com" in this script with your actual email
2. Run this script in Supabase SQL Editor
3. Check the results to see if your profile and cart data are properly set up
4. If cart items persist after running this script, your database is working correctly
5. Test in the frontend: refresh the page and see if cart items remain
6. If issues persist, check the browser console for JavaScript errors

Expected Results:
✅ Your user profile should have first_name, last_name, full_name populated
✅ is_verified should be true
✅ Cart items should persist across page refreshes
✅ Wishlist items should be saved to database
✅ All operations should be logged in analytics_events
' as detailed_instructions;

SELECT '✅ Manual testing script ready! Update the email addresses and run this script.' as final_status;
