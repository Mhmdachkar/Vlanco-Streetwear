-- Complete Cart Flow Test Script
-- This script tests the entire cart functionality from database to Stripe

-- ============================================================================
-- STEP 1: SETUP TEST USER AND ENVIRONMENT
-- ============================================================================

-- Create or update test user (replace with your actual email)
DO $$
DECLARE
    test_user_id UUID;
    test_email TEXT := 'mohammadashkar11@gmail.com'; -- REPLACE WITH YOUR EMAIL
BEGIN
    -- Get or create test user
    SELECT id INTO test_user_id FROM auth.users WHERE email = test_email;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'User not found in auth.users. Please sign up first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Testing with user: % (ID: %)', test_email, test_user_id;
    
    -- Ensure user profile exists
    PERFORM public.ensure_user_profile(
        test_user_id,
        test_email,
        'Mohammad',
        'Ashkar',
        'Mohammad Ashkar'
    );
    
    RAISE NOTICE 'User profile ensured';
END $$;

-- ============================================================================
-- STEP 2: TEST CART FUNCTIONS
-- ============================================================================

SELECT 'Testing Cart Functions...' as test_step;

-- Test 1: Add item to cart
DO $$
DECLARE
    test_user_id UUID;
    add_result JSONB;
BEGIN
    SELECT id INTO test_user_id FROM public.users WHERE email = 'mohammadashkar11@gmail.com';
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'User not found in public.users table';
        RETURN;
    END IF;
    
    -- Test adding test product
    SELECT public.add_to_cart(
        test_user_id,
        'test-product-123',
        'test-variant-456',
        1,
        29.99
    ) INTO add_result;
    
    RAISE NOTICE 'Add to cart result: %', add_result;
    
    -- Test adding another item
    SELECT public.add_to_cart(
        test_user_id,
        'product_1',
        'variant_1_1',
        2,
        45.00
    ) INTO add_result;
    
    RAISE NOTICE 'Add second item result: %', add_result;
END $$;

-- Test 2: Get cart items
DO $$
DECLARE
    test_user_id UUID;
    cart_items JSONB;
BEGIN
    SELECT id INTO test_user_id FROM public.users WHERE email = 'mohammadashkar11@gmail.com';
    
    SELECT public.get_cart_items(test_user_id) INTO cart_items;
    
    RAISE NOTICE 'Cart items: %', cart_items;
END $$;

-- Test 3: Debug cart state
DO $$
DECLARE
    test_user_id UUID;
    debug_info JSONB;
BEGIN
    SELECT id INTO test_user_id FROM public.users WHERE email = 'mohammadashkar11@gmail.com';
    
    SELECT public.debug_cart_state(test_user_id) INTO debug_info;
    
    RAISE NOTICE 'Debug info: %', debug_info;
END $$;

-- ============================================================================
-- STEP 3: VERIFY DATABASE STATE
-- ============================================================================

SELECT 'Verifying Database State...' as test_step;

-- Check user profile
SELECT 
    'User Profile Check' as test_name,
    id,
    email,
    first_name,
    last_name,
    full_name,
    is_verified,
    created_at
FROM public.users 
WHERE email = 'mohammadashkar11@gmail.com';

-- Check cart items
SELECT 
    'Cart Items Check' as test_name,
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
LEFT JOIN public.products p ON ci.product_id = p.id
LEFT JOIN public.product_variants pv ON ci.variant_id = pv.id
WHERE u.email = 'mohammadashkar11@gmail.com'
ORDER BY ci.added_at DESC;

-- Check analytics events
SELECT 
    'Recent Cart Events' as test_name,
    ae.event_type,
    ae.event_data,
    ae.created_at
FROM public.analytics_events ae
JOIN public.users u ON ae.user_id = u.id
WHERE u.email = 'mohammadashkar11@gmail.com'
AND ae.event_type LIKE 'cart%'
ORDER BY ae.created_at DESC
LIMIT 10;

-- ============================================================================
-- STEP 4: TEST STRIPE INTEGRATION READINESS
-- ============================================================================

SELECT 'Testing Stripe Integration Readiness...' as test_step;

-- Verify products have proper data for Stripe
SELECT 
    'Stripe Product Data' as test_name,
    p.id,
    p.name,
    p.base_price,
    p.status,
    pv.id as variant_id,
    pv.price as variant_price,
    pv.stock_quantity,
    pv.is_active
FROM public.products p
LEFT JOIN public.product_variants pv ON p.id = pv.product_id
WHERE p.id IN ('test-product-123', 'product_1', 'product_2')
AND p.status = 'active'
ORDER BY p.id, pv.id;

-- Test cart payload for Stripe (simulate checkout)
SELECT 
    'Stripe Checkout Payload' as test_name,
    jsonb_agg(
        jsonb_build_object(
            'product_id', ci.product_id,
            'variant_id', ci.variant_id,
            'quantity', ci.quantity,
            'unit_price', ci.price_at_time,
            'line_total', ci.quantity * ci.price_at_time,
            'product_name', p.name,
            'variant_info', CONCAT(pv.color, ' - ', pv.size)
        )
    ) as checkout_payload
FROM public.cart_items ci
JOIN public.users u ON ci.user_id = u.id
LEFT JOIN public.products p ON ci.product_id = p.id
LEFT JOIN public.product_variants pv ON ci.variant_id = pv.id
WHERE u.email = 'mohammadashkar11@gmail.com';

-- ============================================================================
-- STEP 5: PERFORMANCE TESTS
-- ============================================================================

SELECT 'Testing Performance...' as test_step;

-- Test cart query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    ci.*,
    p.name, p.base_price, p.image_url,
    pv.color, pv.size, pv.price, pv.stock_quantity
FROM public.cart_items ci
JOIN public.products p ON ci.product_id = p.id
LEFT JOIN public.product_variants pv ON ci.variant_id = pv.id
JOIN public.users u ON ci.user_id = u.id
WHERE u.email = 'mohammadashkar11@gmail.com';

-- ============================================================================
-- STEP 6: STRESS TEST (ADD MULTIPLE ITEMS)
-- ============================================================================

SELECT 'Running Stress Test...' as test_step;

-- Add multiple items to test scrolling and performance
DO $$
DECLARE
    test_user_id UUID;
    add_result JSONB;
    i INTEGER;
BEGIN
    SELECT id INTO test_user_id FROM public.users WHERE email = 'mohammadashkar11@gmail.com';
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'User not found for stress test';
        RETURN;
    END IF;
    
    -- Add multiple different products to test scrolling
    FOR i IN 1..5 LOOP
        -- Add product_1 variants
        SELECT public.add_to_cart(
            test_user_id,
            'product_1',
            'variant_1_1',
            1,
            45.00
        ) INTO add_result;
        
        -- Add product_2 variants
        SELECT public.add_to_cart(
            test_user_id,
            'product_2',
            'variant_2_1',
            1,
            55.00
        ) INTO add_result;
        
        -- Add mask variants
        SELECT public.add_to_cart(
            test_user_id,
            'mask_1',
            'mask_1_variant_1',
            1,
            2.36
        ) INTO add_result;
    END LOOP;
    
    RAISE NOTICE 'Stress test completed - added multiple items for scrolling test';
END $$;

-- Check final cart state
SELECT 
    'Final Cart State' as test_name,
    COUNT(*) as total_cart_items,
    SUM(ci.quantity) as total_quantity,
    SUM(ci.quantity * ci.price_at_time) as total_value,
    COUNT(DISTINCT ci.product_id) as unique_products
FROM public.cart_items ci
JOIN public.users u ON ci.user_id = u.id
WHERE u.email = 'mohammadashkar11@gmail.com';

-- ============================================================================
-- STEP 7: FINAL VERIFICATION
-- ============================================================================

SELECT 'Final Verification...' as test_step;

-- Comprehensive cart verification
SELECT 
    'Cart Verification Summary' as summary,
    u.email,
    u.first_name,
    u.last_name,
    u.is_verified,
    COUNT(ci.id) as cart_items_count,
    SUM(ci.quantity) as total_quantity,
    ROUND(SUM(ci.quantity * ci.price_at_time)::numeric, 2) as total_value,
    MAX(ci.updated_at) as last_cart_update
FROM public.users u
LEFT JOIN public.cart_items ci ON u.id = ci.user_id
WHERE u.email = 'mohammadashkar11@gmail.com'
GROUP BY u.id, u.email, u.first_name, u.last_name, u.is_verified;

-- ============================================================================
-- STEP 8: CLEANUP (OPTIONAL)
-- ============================================================================

-- Uncomment to clean up test data
/*
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM public.users WHERE email = 'mohammadashkar11@gmail.com';
    
    -- Clear test cart
    PERFORM public.clear_cart(test_user_id);
    
    RAISE NOTICE 'Test cart cleared';
END $$;
*/

SELECT '🎉 COMPLETE CART FLOW TEST FINISHED!' as final_status;

SELECT '
NEXT STEPS:
1. If user profile shows complete data (first_name, last_name, etc.) ✅
2. If cart_items_count > 0 ✅  
3. If total_value > 0 ✅
4. Test in frontend: Add items and refresh page
5. Items should persist across refreshes
6. Cart should scroll properly with many items
7. Checkout should work with Stripe

If any step fails, check the specific error messages above.
' as instructions;
