-- Cart Database Functions - Robust Cart Operations
-- This script creates bulletproof database functions for cart functionality

-- ============================================================================
-- STEP 1: CREATE ROBUST CART MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to safely add item to cart with all validations
CREATE OR REPLACE FUNCTION public.add_to_cart(
    p_user_id UUID,
    p_product_id TEXT,
    p_variant_id TEXT DEFAULT NULL,
    p_quantity INTEGER DEFAULT 1,
    p_price_override DECIMAL DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product RECORD;
    v_variant RECORD;
    v_final_price DECIMAL;
    v_existing_item RECORD;
    v_cart_item_id UUID;
    v_result JSONB;
BEGIN
    -- Validate user exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found in database',
            'error_code', 'USER_NOT_FOUND'
        );
    END IF;
    
    -- Validate product exists and is active
    SELECT * INTO v_product
    FROM public.products 
    WHERE id = p_product_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Product not found or inactive',
            'error_code', 'PRODUCT_NOT_FOUND'
        );
    END IF;
    
    -- Validate variant if provided
    IF p_variant_id IS NOT NULL THEN
        SELECT * INTO v_variant
        FROM public.product_variants 
        WHERE id = p_variant_id AND product_id = p_product_id AND is_active = true;
        
        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Product variant not found or inactive',
                'error_code', 'VARIANT_NOT_FOUND'
            );
        END IF;
        
        -- Check stock for variant
        IF v_variant.stock_quantity IS NOT NULL AND v_variant.stock_quantity < p_quantity THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Insufficient stock for variant',
                'error_code', 'INSUFFICIENT_STOCK',
                'available_stock', v_variant.stock_quantity
            );
        END IF;
        
        v_final_price := COALESCE(p_price_override, v_variant.price, v_product.base_price);
    ELSE
        -- Check stock for product
        IF v_product.stock_quantity IS NOT NULL AND v_product.stock_quantity < p_quantity THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Insufficient stock for product',
                'error_code', 'INSUFFICIENT_STOCK',
                'available_stock', v_product.stock_quantity
            );
        END IF;
        
        v_final_price := COALESCE(p_price_override, v_product.base_price);
    END IF;
    
    -- Validate price
    IF v_final_price IS NULL OR v_final_price <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid price',
            'error_code', 'INVALID_PRICE'
        );
    END IF;
    
    -- Check if item already exists in cart
    SELECT * INTO v_existing_item
    FROM public.cart_items
    WHERE user_id = p_user_id 
    AND product_id = p_product_id 
    AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL));
    
    IF FOUND THEN
        -- Update existing item
        UPDATE public.cart_items
        SET 
            quantity = quantity + p_quantity,
            price_at_time = v_final_price,
            updated_at = NOW()
        WHERE id = v_existing_item.id
        RETURNING id INTO v_cart_item_id;
        
        v_result := jsonb_build_object(
            'success', true,
            'action', 'updated',
            'cart_item_id', v_cart_item_id,
            'new_quantity', v_existing_item.quantity + p_quantity,
            'price_at_time', v_final_price
        );
    ELSE
        -- Insert new item
        INSERT INTO public.cart_items (
            user_id,
            product_id,
            variant_id,
            quantity,
            price_at_time,
            added_at,
            updated_at
        ) VALUES (
            p_user_id,
            p_product_id,
            p_variant_id,
            p_quantity,
            v_final_price,
            NOW(),
            NOW()
        ) RETURNING id INTO v_cart_item_id;
        
        v_result := jsonb_build_object(
            'success', true,
            'action', 'inserted',
            'cart_item_id', v_cart_item_id,
            'quantity', p_quantity,
            'price_at_time', v_final_price
        );
    END IF;
    
    -- Log the operation
    INSERT INTO public.analytics_events (
        user_id,
        event_type,
        event_data,
        created_at
    ) VALUES (
        p_user_id,
        'cart_item_added',
        jsonb_build_object(
            'product_id', p_product_id,
            'variant_id', p_variant_id,
            'quantity', p_quantity,
            'price_at_time', v_final_price,
            'action', v_result->>'action'
        ),
        NOW()
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM,
            'error_code', 'DATABASE_ERROR'
        );
END;
$$;

-- Function to get cart items with full product details
CREATE OR REPLACE FUNCTION public.get_cart_items(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', ci.id,
            'user_id', ci.user_id,
            'product_id', ci.product_id,
            'variant_id', ci.variant_id,
            'quantity', ci.quantity,
            'price_at_time', ci.price_at_time,
            'added_at', ci.added_at,
            'updated_at', ci.updated_at,
            'product', jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'description', p.description,
                'base_price', p.base_price,
                'compare_price', p.compare_price,
                'image_url', p.image_url,
                'images', p.images,
                'color_options', p.color_options,
                'size_options', p.size_options,
                'status', p.status,
                'is_featured', p.is_featured,
                'is_new', p.is_new,
                'rating_average', p.rating_average,
                'rating_count', p.rating_count,
                'stock_quantity', p.stock_quantity
            ),
            'variant', CASE 
                WHEN pv.id IS NOT NULL THEN
                    jsonb_build_object(
                        'id', pv.id,
                        'product_id', pv.product_id,
                        'color', pv.color,
                        'size', pv.size,
                        'price', pv.price,
                        'compare_price', pv.compare_price,
                        'stock_quantity', pv.stock_quantity,
                        'is_active', pv.is_active,
                        'sku', pv.sku
                    )
                ELSE NULL
            END
        ) ORDER BY ci.added_at DESC
    ) INTO v_result
    FROM public.cart_items ci
    JOIN public.products p ON ci.product_id = p.id
    LEFT JOIN public.product_variants pv ON ci.variant_id = pv.id
    WHERE ci.user_id = p_user_id;
    
    RETURN COALESCE(v_result, '[]'::jsonb);
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'error', 'Failed to fetch cart items: ' || SQLERRM
        );
END;
$$;

-- Function to update cart item quantity
CREATE OR REPLACE FUNCTION public.update_cart_item_quantity(
    p_cart_item_id UUID,
    p_user_id UUID,
    p_new_quantity INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Validate quantity
    IF p_new_quantity < 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Quantity cannot be negative'
        );
    END IF;
    
    -- If quantity is 0, remove the item
    IF p_new_quantity = 0 THEN
        DELETE FROM public.cart_items 
        WHERE id = p_cart_item_id AND user_id = p_user_id;
        
        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Cart item not found'
            );
        END IF;
        
        RETURN jsonb_build_object(
            'success', true,
            'action', 'removed'
        );
    END IF;
    
    -- Update quantity
    UPDATE public.cart_items
    SET 
        quantity = p_new_quantity,
        updated_at = NOW()
    WHERE id = p_cart_item_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cart item not found or access denied'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'action', 'updated',
        'new_quantity', p_new_quantity
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$;

-- Function to remove cart item
CREATE OR REPLACE FUNCTION public.remove_cart_item(
    p_cart_item_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_item RECORD;
BEGIN
    -- Get item details before deletion
    SELECT * INTO v_deleted_item
    FROM public.cart_items
    WHERE id = p_cart_item_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cart item not found'
        );
    END IF;
    
    -- Delete the item
    DELETE FROM public.cart_items 
    WHERE id = p_cart_item_id AND user_id = p_user_id;
    
    -- Log the operation
    INSERT INTO public.analytics_events (
        user_id,
        event_type,
        event_data,
        created_at
    ) VALUES (
        p_user_id,
        'cart_item_removed',
        jsonb_build_object(
            'product_id', v_deleted_item.product_id,
            'variant_id', v_deleted_item.variant_id,
            'quantity', v_deleted_item.quantity,
            'price_at_time', v_deleted_item.price_at_time
        ),
        NOW()
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'removed_item', jsonb_build_object(
            'product_id', v_deleted_item.product_id,
            'variant_id', v_deleted_item.variant_id,
            'quantity', v_deleted_item.quantity
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$;

-- Function to clear entire cart
CREATE OR REPLACE FUNCTION public.clear_cart(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Count items before deletion
    SELECT COUNT(*) INTO v_deleted_count
    FROM public.cart_items
    WHERE user_id = p_user_id;
    
    -- Delete all cart items for user
    DELETE FROM public.cart_items 
    WHERE user_id = p_user_id;
    
    -- Log the operation
    INSERT INTO public.analytics_events (
        user_id,
        event_type,
        event_data,
        created_at
    ) VALUES (
        p_user_id,
        'cart_cleared',
        jsonb_build_object(
            'items_removed', v_deleted_count
        ),
        NOW()
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'items_removed', v_deleted_count
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$;

-- ============================================================================
-- STEP 2: CREATE USER PROFILE MANAGEMENT
-- ============================================================================

-- Function to ensure user profile exists before cart operations
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_first_name TEXT DEFAULT NULL,
    p_last_name TEXT DEFAULT NULL,
    p_full_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_profile RECORD;
BEGIN
    -- Check if profile exists
    SELECT * INTO v_existing_profile
    FROM public.users
    WHERE id = p_user_id;
    
    IF FOUND THEN
        -- Update verification status if needed
        UPDATE public.users
        SET 
            is_verified = true,
            updated_at = NOW()
        WHERE id = p_user_id AND is_verified = false;
        
        RETURN jsonb_build_object(
            'success', true,
            'action', 'existing',
            'profile_exists', true
        );
    ELSE
        -- Create new profile
        INSERT INTO public.users (
            id,
            email,
            first_name,
            last_name,
            full_name,
            is_verified,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            p_email,
            p_first_name,
            p_last_name,
            COALESCE(
                p_full_name,
                CASE 
                    WHEN p_first_name IS NOT NULL AND p_last_name IS NOT NULL 
                    THEN CONCAT(p_first_name, ' ', p_last_name)
                    ELSE NULL
                END
            ),
            true,
            NOW(),
            NOW()
        );
        
        RETURN jsonb_build_object(
            'success', true,
            'action', 'created',
            'profile_exists', true
        );
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to ensure user profile: ' || SQLERRM
        );
END;
$$;

-- ============================================================================
-- STEP 3: CREATE CART DEBUGGING FUNCTIONS
-- ============================================================================

-- Function to get comprehensive cart debug info
CREATE OR REPLACE FUNCTION public.debug_cart_state(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_info RECORD;
    v_cart_items JSONB;
    v_recent_events JSONB;
    v_result JSONB;
BEGIN
    -- Get user info
    SELECT * INTO v_user_info
    FROM public.users
    WHERE id = p_user_id;
    
    -- Get cart items
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'product_id', product_id,
            'variant_id', variant_id,
            'quantity', quantity,
            'price_at_time', price_at_time,
            'added_at', added_at,
            'updated_at', updated_at
        )
    ) INTO v_cart_items
    FROM public.cart_items
    WHERE user_id = p_user_id;
    
    -- Get recent cart events
    SELECT jsonb_agg(
        jsonb_build_object(
            'event_type', event_type,
            'event_data', event_data,
            'created_at', created_at
        )
    ) INTO v_recent_events
    FROM public.analytics_events
    WHERE user_id = p_user_id 
    AND event_type LIKE 'cart%'
    ORDER BY created_at DESC
    LIMIT 10;
    
    v_result := jsonb_build_object(
        'user_info', jsonb_build_object(
            'id', v_user_info.id,
            'email', v_user_info.email,
            'first_name', v_user_info.first_name,
            'last_name', v_user_info.last_name,
            'full_name', v_user_info.full_name,
            'is_verified', v_user_info.is_verified,
            'created_at', v_user_info.created_at
        ),
        'cart_items', COALESCE(v_cart_items, '[]'::jsonb),
        'recent_events', COALESCE(v_recent_events, '[]'::jsonb),
        'cart_summary', jsonb_build_object(
            'total_items', COALESCE(jsonb_array_length(v_cart_items), 0),
            'total_quantity', (
                SELECT COALESCE(SUM(quantity), 0)
                FROM public.cart_items
                WHERE user_id = p_user_id
            ),
            'total_value', (
                SELECT COALESCE(SUM(quantity * price_at_time), 0)
                FROM public.cart_items
                WHERE user_id = p_user_id
            )
        )
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'error', 'Debug query failed: ' || SQLERRM
        );
END;
$$;

-- ============================================================================
-- STEP 4: GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION public.add_to_cart(UUID, TEXT, TEXT, INTEGER, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cart_items(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_cart_item_quantity(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_cart_item(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_cart(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.debug_cart_state(UUID) TO authenticated;

-- ============================================================================
-- STEP 5: TEST THE FUNCTIONS
-- ============================================================================

-- Test with a sample user (replace with your actual user ID)
/*
-- Test user profile creation
SELECT public.ensure_user_profile(
    'your-user-id-here'::UUID,
    'test@example.com',
    'Test',
    'User',
    'Test User'
);

-- Test adding to cart
SELECT public.add_to_cart(
    'your-user-id-here'::UUID,
    'test-product-123',
    'test-variant-456',
    1,
    29.99
);

-- Test getting cart items
SELECT public.get_cart_items('your-user-id-here'::UUID);

-- Test debug info
SELECT public.debug_cart_state('your-user-id-here'::UUID);
*/

SELECT '✅ Cart database functions created successfully!' as status;
SELECT 'Next: Update the useCart hook to use these functions' as next_step;
