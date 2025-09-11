-- Test User Profile and Cart Functionality
-- Run this after applying the fix-user-profile-and-cart.sql script

-- ============================================================================
-- STEP 1: TEST USER PROFILE FUNCTIONALITY
-- ============================================================================

SELECT 'Testing User Profile Functionality...' as test_step;

-- Check existing user profiles
SELECT 
  'Current Users' as test_name,
  id,
  email,
  first_name,
  last_name,
  full_name,
  is_verified,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- ============================================================================
-- STEP 2: TEST CART FUNCTIONALITY
-- ============================================================================

SELECT 'Testing Cart Functionality...' as test_step;

-- Check if we have any cart items
SELECT 
  'Current Cart Items' as test_name,
  COUNT(*) as total_items,
  COUNT(DISTINCT user_id) as users_with_items
FROM public.cart_items;

-- Show cart items with product details
SELECT 
  'Cart Items with Product Details' as test_name,
  ci.id as cart_item_id,
  ci.user_id,
  u.email as user_email,
  ci.product_id,
  p.name as product_name,
  ci.variant_id,
  pv.color,
  pv.size,
  ci.quantity,
  ci.price_at_time,
  ci.added_at,
  ci.updated_at
FROM public.cart_items ci
LEFT JOIN public.users u ON ci.user_id = u.id
LEFT JOIN public.products p ON ci.product_id = p.id
LEFT JOIN public.product_variants pv ON ci.variant_id = pv.id
ORDER BY ci.added_at DESC;

-- ============================================================================
-- STEP 3: TEST MANUAL CART ITEM INSERTION (REPLACE USER_ID)
-- ============================================================================

-- First, let's get a user ID to test with
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM public.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with user ID: %', test_user_id;
        
        -- Try to insert a test cart item
        INSERT INTO public.cart_items (
            user_id,
            product_id,
            variant_id,
            quantity,
            price_at_time
        ) VALUES (
            test_user_id,
            'test-product-123',
            'test-variant-456',
            2,
            29.99
        ) ON CONFLICT (user_id, product_id, variant_id) 
        DO UPDATE SET 
            quantity = EXCLUDED.quantity,
            price_at_time = EXCLUDED.price_at_time,
            updated_at = NOW();
            
        RAISE NOTICE 'Test cart item inserted/updated successfully';
    ELSE
        RAISE NOTICE 'No users found in database';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: VERIFY CART PERSISTENCE
-- ============================================================================

SELECT 'Verifying Cart Persistence...' as test_step;

-- Check if the test item was inserted
SELECT 
  'Test Cart Item Verification' as test_name,
  ci.*,
  p.name as product_name,
  pv.color,
  pv.size
FROM public.cart_items ci
LEFT JOIN public.products p ON ci.product_id = p.id
LEFT JOIN public.product_variants pv ON ci.variant_id = pv.id
WHERE ci.product_id = 'test-product-123';

-- ============================================================================
-- STEP 5: TEST CART OPERATIONS LOGGING
-- ============================================================================

SELECT 'Checking Cart Operations Logging...' as test_step;

-- Check recent cart-related analytics events
SELECT 
  'Recent Cart Events' as test_name,
  ae.event_type,
  ae.event_data,
  ae.created_at,
  u.email as user_email
FROM public.analytics_events ae
LEFT JOIN public.users u ON ae.user_id = u.id
WHERE ae.event_type LIKE 'cart%'
ORDER BY ae.created_at DESC
LIMIT 10;

-- ============================================================================
-- STEP 6: TEST PRODUCT AVAILABILITY
-- ============================================================================

SELECT 'Checking Product Availability...' as test_step;

-- Verify test products exist
SELECT 
  'Available Test Products' as test_name,
  p.id,
  p.name,
  p.base_price,
  p.stock_quantity,
  p.status,
  COUNT(pv.id) as variant_count
FROM public.products p
LEFT JOIN public.product_variants pv ON p.id = pv.product_id AND pv.is_active = true
WHERE p.id IN ('test-product-123', 'product_1', 'product_2', 'mask_1', 'mask_2')
GROUP BY p.id, p.name, p.base_price, p.stock_quantity, p.status
ORDER BY p.id;

-- Check product variants
SELECT 
  'Available Product Variants' as test_name,
  pv.id,
  pv.product_id,
  p.name as product_name,
  pv.color,
  pv.size,
  pv.price,
  pv.stock_quantity,
  pv.is_active
FROM public.product_variants pv
JOIN public.products p ON pv.product_id = p.id
WHERE p.id IN ('test-product-123', 'product_1', 'product_2', 'mask_1', 'mask_2')
ORDER BY pv.product_id, pv.color, pv.size;

-- ============================================================================
-- STEP 7: TEST TRIGGERS AND FUNCTIONS
-- ============================================================================

SELECT 'Testing Database Triggers and Functions...' as test_step;

-- Check if triggers are properly installed
SELECT 
  'Active Triggers' as test_name,
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('users', 'cart_items', 'product_variants')
ORDER BY event_object_table, trigger_name;

-- Check if functions exist
SELECT 
  'Available Functions' as test_name,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'validate_cart_item', 'log_cart_operation', 'update_product_stock')
ORDER BY routine_name;

-- ============================================================================
-- STEP 8: PERFORMANCE AND CONSTRAINT TESTS
-- ============================================================================

SELECT 'Testing Constraints and Performance...' as test_step;

-- Test unique constraints on cart_items
SELECT 
  'Cart Items Unique Constraint Test' as test_name,
  user_id,
  product_id,
  variant_id,
  COUNT(*) as duplicate_count
FROM public.cart_items
GROUP BY user_id, product_id, variant_id
HAVING COUNT(*) > 1;

-- Check foreign key relationships
SELECT 
  'Foreign Key Validation' as test_name,
  'cart_items -> users' as relationship,
  COUNT(*) as orphaned_records
FROM public.cart_items ci
LEFT JOIN public.users u ON ci.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
  'Foreign Key Validation' as test_name,
  'cart_items -> products' as relationship,
  COUNT(*) as orphaned_records
FROM public.cart_items ci
LEFT JOIN public.products p ON ci.product_id = p.id
WHERE p.id IS NULL;

-- ============================================================================
-- STEP 9: CLEANUP TEST DATA (OPTIONAL)
-- ============================================================================

-- Uncomment the following to clean up test data
/*
DELETE FROM public.cart_items 
WHERE product_id = 'test-product-123' 
AND variant_id = 'test-variant-456';

SELECT 'Test data cleaned up' as cleanup_status;
*/

-- ============================================================================
-- STEP 10: SUMMARY AND RECOMMENDATIONS
-- ============================================================================

SELECT 'TEST SUMMARY' as final_status;

-- Count totals
SELECT 
  'Database Summary' as summary_type,
  (SELECT COUNT(*) FROM public.users) as total_users,
  (SELECT COUNT(*) FROM public.products) as total_products,
  (SELECT COUNT(*) FROM public.product_variants) as total_variants,
  (SELECT COUNT(*) FROM public.cart_items) as total_cart_items,
  (SELECT COUNT(*) FROM public.wishlist_items) as total_wishlist_items;

SELECT '✅ User Profile and Cart Functionality Tests Complete!' as final_message;

-- ============================================================================
-- TROUBLESHOOTING GUIDE
-- ============================================================================

/*
If you're still experiencing issues:

1. USER PROFILE ISSUES:
   - Check if the trigger is working: Look for 'Active Triggers' results above
   - Verify user metadata: Check the auth.users table in Supabase dashboard
   - Manual profile creation: Use the ensureUserProfile function in useAuth hook

2. CART PERSISTENCE ISSUES:
   - Check browser console for JavaScript errors
   - Verify network requests in browser DevTools
   - Check if cart items are being inserted: Look at 'Current Cart Items' results
   - Verify user authentication: Make sure user.id is not null

3. FRONTEND ISSUES:
   - Clear localStorage: localStorage.clear()
   - Check useCart hook is properly wrapped with CartProvider
   - Verify Supabase client is configured correctly
   - Check if fetchCartItems is being called on user login

4. DATABASE ISSUES:
   - Verify RLS policies allow INSERT/UPDATE on cart_items
   - Check if user has proper permissions
   - Verify foreign key constraints are satisfied
   - Check Supabase logs for detailed error messages

5. NEXT STEPS:
   - Test with your actual user account
   - Add items to cart and refresh page
   - Check if cart persists across browser sessions
   - Verify cart items appear in Supabase dashboard
*/
