-- Fix User Profile and Cart Issues
-- This script fixes user profile creation and cart persistence

-- ============================================================================
-- STEP 1: CREATE FUNCTION TO HANDLE NEW USER SIGNUP
-- ============================================================================

-- Function to automatically create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    full_name,
    avatar_url,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NULL),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CASE 
        WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL 
         AND NEW.raw_user_meta_data->>'last_name' IS NOT NULL
        THEN CONCAT(NEW.raw_user_meta_data->>'first_name', ' ', NEW.raw_user_meta_data->>'last_name')
        ELSE NULL
      END
    ),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    is_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, public.users.is_verified),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 2: UPDATE EXISTING USER PROFILES
-- ============================================================================

-- Update existing users to populate missing profile data
UPDATE public.users 
SET 
  is_verified = true,
  updated_at = NOW()
WHERE is_verified IS NULL OR is_verified = false;

-- Update full_name for existing users if missing
UPDATE public.users 
SET 
  full_name = CASE 
    WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
    THEN CONCAT(first_name, ' ', last_name)
    ELSE email
  END,
  updated_at = NOW()
WHERE full_name IS NULL;

-- ============================================================================
-- STEP 3: CREATE FUNCTION TO ENSURE CART PERSISTENCE
-- ============================================================================

-- Function to validate cart items before insert/update
CREATE OR REPLACE FUNCTION public.validate_cart_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure price_at_time is set
  IF NEW.price_at_time IS NULL OR NEW.price_at_time = 0 THEN
    -- Get price from product or variant
    SELECT COALESCE(pv.price, p.base_price, 0)
    INTO NEW.price_at_time
    FROM public.products p
    LEFT JOIN public.product_variants pv ON pv.id = NEW.variant_id
    WHERE p.id = NEW.product_id;
    
    -- If still null, set a default
    IF NEW.price_at_time IS NULL THEN
      NEW.price_at_time := 0;
    END IF;
  END IF;
  
  -- Ensure quantity is at least 1
  IF NEW.quantity IS NULL OR NEW.quantity < 1 THEN
    NEW.quantity := 1;
  END IF;
  
  -- Set timestamps
  IF TG_OP = 'INSERT' THEN
    NEW.added_at := COALESCE(NEW.added_at, NOW());
    NEW.updated_at := NOW();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cart item validation
DROP TRIGGER IF EXISTS validate_cart_item_trigger ON public.cart_items;
CREATE TRIGGER validate_cart_item_trigger
  BEFORE INSERT OR UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.validate_cart_item();

-- ============================================================================
-- STEP 4: CREATE FUNCTION TO LOG CART OPERATIONS (DEBUG)
-- ============================================================================

-- Function to log cart operations for debugging
CREATE OR REPLACE FUNCTION public.log_cart_operation()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a log entry for debugging cart operations
  INSERT INTO public.analytics_events (
    user_id,
    event_type,
    event_data,
    created_at
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'cart_item_added'
      WHEN TG_OP = 'UPDATE' THEN 'cart_item_updated'
      WHEN TG_OP = 'DELETE' THEN 'cart_item_removed'
    END,
    jsonb_build_object(
      'operation', TG_OP,
      'product_id', COALESCE(NEW.product_id, OLD.product_id),
      'variant_id', COALESCE(NEW.variant_id, OLD.variant_id),
      'quantity', COALESCE(NEW.quantity, OLD.quantity),
      'price_at_time', COALESCE(NEW.price_at_time, OLD.price_at_time)
    ),
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cart operation logging
DROP TRIGGER IF EXISTS log_cart_operation_trigger ON public.cart_items;
CREATE TRIGGER log_cart_operation_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.log_cart_operation();

-- ============================================================================
-- STEP 5: VERIFY AND TEST SETUP
-- ============================================================================

-- Check if user profiles are properly set up
SELECT 
  id,
  email,
  first_name,
  last_name,
  full_name,
  is_verified,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- Check if cart items table is ready
SELECT 
  COUNT(*) as total_cart_items,
  COUNT(DISTINCT user_id) as unique_users_with_cart_items
FROM public.cart_items;

-- Test cart item insertion (replace with your actual user ID)
-- Uncomment and replace 'your-user-id-here' with your actual user ID to test
/*
INSERT INTO public.cart_items (
  user_id,
  product_id,
  variant_id,
  quantity,
  price_at_time
) VALUES (
  'your-user-id-here',
  'test-product-123',
  'test-variant-456',
  1,
  29.99
) ON CONFLICT (user_id, product_id, variant_id) 
DO UPDATE SET 
  quantity = EXCLUDED.quantity + cart_items.quantity,
  updated_at = NOW();
*/

-- ============================================================================
-- STEP 6: GRANT ADDITIONAL PERMISSIONS
-- ============================================================================

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_cart_item() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_cart_operation() TO authenticated;

-- Ensure proper permissions on auth schema (if needed)
-- Note: This might require superuser privileges
-- GRANT USAGE ON SCHEMA auth TO authenticated;

SELECT '✅ User profile and cart fixes applied successfully!' as status;

-- ============================================================================
-- TROUBLESHOOTING QUERIES
-- ============================================================================

-- If you're still having issues, run these queries to debug:

-- 1. Check if your user exists in the users table
-- SELECT * FROM public.users WHERE email = 'your-email@example.com';

-- 2. Check if cart items are being inserted
-- SELECT * FROM public.cart_items WHERE user_id = 'your-user-id';

-- 3. Check recent analytics events for cart operations
-- SELECT * FROM public.analytics_events 
-- WHERE event_type LIKE 'cart%' 
-- ORDER BY created_at DESC 
-- LIMIT 10;

-- 4. Check if triggers are working
-- SELECT trigger_name, event_manipulation, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- AND event_object_table IN ('users', 'cart_items');
