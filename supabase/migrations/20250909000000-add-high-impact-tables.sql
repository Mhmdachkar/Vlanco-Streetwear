-- High-Impact Tables Addition for VLANCO Streetwear
-- This migration adds essential tables for inventory, discounts, preferences, and collections
-- Created: 2025-09-09
-- Version: 2.0.0 - High-Impact Enhancement

-- ============================================================================
-- STEP 1: INVENTORY MANAGEMENT SYSTEM
-- ============================================================================

-- Track stock movements and inventory changes
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'return', 'reservation', 'release')),
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason TEXT,
    reference_id UUID, -- order_id, return_id, reservation_id, etc.
    reference_type TEXT, -- 'order', 'return', 'manual', etc.
    user_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Hold inventory during checkout process to prevent overselling
CREATE TABLE IF NOT EXISTS public.stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'fulfilled', 'cancelled')),
    order_id UUID REFERENCES public.orders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: DISCOUNT AND PROMOTION SYSTEM
-- ============================================================================

-- Discount codes and promotional campaigns
CREATE TABLE IF NOT EXISTS public.discount_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y')),
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2),
    maximum_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    user_usage_limit INTEGER DEFAULT 1, -- per user limit
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    applicable_products UUID[], -- specific products
    applicable_categories UUID[], -- specific categories
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track discount code usage
CREATE TABLE IF NOT EXISTS public.discount_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_code_id UUID NOT NULL REFERENCES public.discount_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discount_code_id, order_id)
);

-- ============================================================================
-- STEP 3: USER PREFERENCES AND PERSONALIZATION
-- ============================================================================

-- User preferences for personalized shopping experience
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_sizes JSONB DEFAULT '{}', -- {"tshirt": "L", "mask": "M", "accessories": "one-size"}
    preferred_colors TEXT[] DEFAULT '{}', -- ["black", "white", "red"]
    preferred_brands UUID[] DEFAULT '{}', -- brand IDs
    style_preferences TEXT[] DEFAULT '{}', -- ["streetwear", "minimalist", "grunge"]
    price_range JSONB DEFAULT '{"min": 0, "max": 1000}',
    notification_preferences JSONB DEFAULT '{
        "email_promotions": true,
        "sms_notifications": false,
        "push_notifications": true,
        "new_arrivals": true,
        "back_in_stock": true,
        "price_drops": true,
        "order_updates": true
    }',
    privacy_settings JSONB DEFAULT '{
        "profile_public": false,
        "show_purchase_history": false,
        "allow_recommendations": true,
        "data_collection": true
    }',
    language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'USD',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- STEP 4: PRODUCT COLLECTIONS AND ORGANIZATION
-- ============================================================================

-- Product collections for better organization and marketing
CREATE TABLE IF NOT EXISTS public.product_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    banner_url TEXT,
    collection_type TEXT DEFAULT 'manual' CHECK (collection_type IN ('manual', 'automatic', 'seasonal', 'featured')),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    automatic_rules JSONB, -- for automatic collections
    seo_title TEXT,
    seo_description TEXT,
    meta_tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Many-to-many relationship between collections and products
CREATE TABLE IF NOT EXISTS public.collection_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES public.product_collections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, product_id)
);

-- ============================================================================
-- STEP 5: SHIPPING AND TAX SYSTEM
-- ============================================================================

-- Dynamic shipping rates
CREATE TABLE IF NOT EXISTS public.shipping_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    country TEXT NOT NULL,
    state_province TEXT,
    city TEXT,
    postal_code_pattern TEXT, -- regex pattern for postal codes
    shipping_method TEXT NOT NULL, -- 'standard', 'express', 'overnight'
    base_rate DECIMAL(10,2) NOT NULL,
    per_item_rate DECIMAL(10,2) DEFAULT 0,
    weight_based_rate DECIMAL(10,2) DEFAULT 0, -- per kg/lb
    free_shipping_threshold DECIMAL(10,2),
    min_delivery_days INTEGER DEFAULT 1,
    max_delivery_days INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax rates for different locations
CREATE TABLE IF NOT EXISTS public.tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    state_province TEXT,
    city TEXT,
    postal_code_pattern TEXT,
    tax_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.0825 for 8.25%
    tax_type TEXT DEFAULT 'sales' CHECK (tax_type IN ('sales', 'vat', 'gst', 'hst')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: CREATE SECURITY POLICIES
-- ============================================================================

-- Inventory transactions policies (admin only for writes, users can see their own)
CREATE POLICY "inventory_transactions_select_policy" ON public.inventory_transactions
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (preferences->>'role' = 'admin' OR preferences->>'role' = 'staff'))
    );

-- Stock reservations policies (users can manage their own)
CREATE POLICY "stock_reservations_select_policy" ON public.stock_reservations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "stock_reservations_insert_policy" ON public.stock_reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stock_reservations_update_policy" ON public.stock_reservations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "stock_reservations_delete_policy" ON public.stock_reservations
    FOR DELETE USING (auth.uid() = user_id);

-- Discount codes policies (public read for active codes)
CREATE POLICY "discount_codes_select_policy" ON public.discount_codes
    FOR SELECT USING (is_active = true AND (valid_from IS NULL OR valid_from <= NOW()) AND (valid_until IS NULL OR valid_until >= NOW()));

-- Discount usage policies (users can see their own usage)
CREATE POLICY "discount_usage_select_policy" ON public.discount_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "discount_usage_insert_policy" ON public.discount_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User preferences policies (users can manage their own)
CREATE POLICY "user_preferences_select_policy" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_policy" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_policy" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_delete_policy" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Product collections policies (public read for active collections)
CREATE POLICY "product_collections_select_policy" ON public.product_collections
    FOR SELECT USING (is_active = true);

-- Collection products policies (public read)
CREATE POLICY "collection_products_select_policy" ON public.collection_products
    FOR SELECT USING (true);

-- Shipping rates policies (public read for active rates)
CREATE POLICY "shipping_rates_select_policy" ON public.shipping_rates
    FOR SELECT USING (is_active = true);

-- Tax rates policies (public read for active rates)
CREATE POLICY "tax_rates_select_policy" ON public.tax_rates
    FOR SELECT USING (is_active = true);

-- ============================================================================
-- STEP 8: CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Inventory transactions indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON public.inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_variant_id ON public.inventory_transactions(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON public.inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON public.inventory_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference ON public.inventory_transactions(reference_id, reference_type);

-- Stock reservations indexes
CREATE INDEX IF NOT EXISTS idx_stock_reservations_user_id ON public.stock_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_product_id ON public.stock_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_expires_at ON public.stock_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_status ON public.stock_reservations(status);

-- Discount codes indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON public.discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid_dates ON public.discount_codes(valid_from, valid_until);

-- Discount usage indexes
CREATE INDEX IF NOT EXISTS idx_discount_usage_code_id ON public.discount_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_user_id ON public.discount_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_order_id ON public.discount_usage(order_id);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Product collections indexes
CREATE INDEX IF NOT EXISTS idx_product_collections_slug ON public.product_collections(slug);
CREATE INDEX IF NOT EXISTS idx_product_collections_active ON public.product_collections(is_active);
CREATE INDEX IF NOT EXISTS idx_product_collections_featured ON public.product_collections(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_collections_type ON public.product_collections(collection_type);

-- Collection products indexes
CREATE INDEX IF NOT EXISTS idx_collection_products_collection_id ON public.collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product_id ON public.collection_products(product_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_sort_order ON public.collection_products(sort_order);

-- Shipping rates indexes
CREATE INDEX IF NOT EXISTS idx_shipping_rates_country ON public.shipping_rates(country);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_active ON public.shipping_rates(is_active);

-- Tax rates indexes
CREATE INDEX IF NOT EXISTS idx_tax_rates_country ON public.tax_rates(country);
CREATE INDEX IF NOT EXISTS idx_tax_rates_active ON public.tax_rates(is_active);

-- ============================================================================
-- STEP 9: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically expire stock reservations
CREATE OR REPLACE FUNCTION expire_stock_reservations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update expired reservations
    UPDATE public.stock_reservations 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' AND expires_at < NOW();
    
    -- Log the expiration
    INSERT INTO public.inventory_transactions (
        product_id, variant_id, transaction_type, quantity_change, 
        previous_stock, new_stock, reason, reference_type
    )
    SELECT 
        sr.product_id, sr.variant_id, 'release', sr.quantity,
        COALESCE(pv.stock_quantity, p.stock_quantity) - sr.quantity,
        COALESCE(pv.stock_quantity, p.stock_quantity),
        'Stock reservation expired',
        'reservation_expiry'
    FROM public.stock_reservations sr
    LEFT JOIN public.product_variants pv ON sr.variant_id = pv.id
    LEFT JOIN public.products p ON sr.product_id = p.id
    WHERE sr.status = 'expired' AND sr.updated_at = NOW();
END;
$$;

-- Function to check discount code validity
CREATE OR REPLACE FUNCTION is_discount_code_valid(
    discount_code TEXT,
    user_id UUID DEFAULT NULL,
    order_total DECIMAL DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    discount_record public.discount_codes;
    user_usage_count INTEGER;
    result JSONB;
BEGIN
    -- Get discount code
    SELECT * INTO discount_record 
    FROM public.discount_codes 
    WHERE code = discount_code AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN '{"valid": false, "error": "Invalid discount code"}'::jsonb;
    END IF;
    
    -- Check date validity
    IF discount_record.valid_from IS NOT NULL AND discount_record.valid_from > NOW() THEN
        RETURN '{"valid": false, "error": "Discount code not yet active"}'::jsonb;
    END IF;
    
    IF discount_record.valid_until IS NOT NULL AND discount_record.valid_until < NOW() THEN
        RETURN '{"valid": false, "error": "Discount code has expired"}'::jsonb;
    END IF;
    
    -- Check usage limits
    IF discount_record.usage_limit IS NOT NULL AND discount_record.usage_count >= discount_record.usage_limit THEN
        RETURN '{"valid": false, "error": "Discount code usage limit exceeded"}'::jsonb;
    END IF;
    
    -- Check per-user usage limit
    IF user_id IS NOT NULL AND discount_record.user_usage_limit IS NOT NULL THEN
        SELECT COUNT(*) INTO user_usage_count
        FROM public.discount_usage
        WHERE discount_code_id = discount_record.id AND user_id = is_discount_code_valid.user_id;
        
        IF user_usage_count >= discount_record.user_usage_limit THEN
            RETURN '{"valid": false, "error": "You have already used this discount code"}'::jsonb;
        END IF;
    END IF;
    
    -- Check minimum order amount
    IF discount_record.minimum_order_amount IS NOT NULL AND order_total < discount_record.minimum_order_amount THEN
        RETURN format('{"valid": false, "error": "Minimum order amount of $%s required"}', discount_record.minimum_order_amount)::jsonb;
    END IF;
    
    -- Calculate discount amount
    result = jsonb_build_object(
        'valid', true,
        'discount_id', discount_record.id,
        'discount_type', discount_record.discount_type,
        'discount_value', discount_record.discount_value,
        'maximum_discount_amount', discount_record.maximum_discount_amount
    );
    
    RETURN result;
END;
$$;

-- ============================================================================
-- STEP 10: CREATE SAMPLE DATA
-- ============================================================================

-- Insert sample discount codes
INSERT INTO public.discount_codes (code, name, description, discount_type, discount_value, minimum_order_amount, usage_limit, valid_until, is_active) VALUES
('WELCOME10', 'Welcome Discount', '10% off for new customers', 'percentage', 10.00, 50.00, 100, NOW() + INTERVAL '30 days', true),
('FREESHIP', 'Free Shipping', 'Free shipping on all orders', 'free_shipping', 0.00, 75.00, NULL, NOW() + INTERVAL '60 days', true),
('SAVE20', 'Save $20', '$20 off orders over $100', 'fixed_amount', 20.00, 100.00, 50, NOW() + INTERVAL '14 days', true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample product collections
INSERT INTO public.product_collections (name, slug, description, collection_type, is_featured, is_active, sort_order) VALUES
('New Arrivals', 'new-arrivals', 'Latest products just added to our store', 'automatic', true, true, 1),
('Best Sellers', 'best-sellers', 'Our most popular items', 'automatic', true, true, 2),
('Summer Collection', 'summer-2025', 'Hot styles for the summer season', 'seasonal', true, true, 3),
('Streetwear Essentials', 'streetwear-essentials', 'Must-have streetwear pieces', 'manual', false, true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample shipping rates
INSERT INTO public.shipping_rates (name, description, country, shipping_method, base_rate, free_shipping_threshold, min_delivery_days, max_delivery_days, is_active) VALUES
('US Standard Shipping', 'Standard shipping within United States', 'US', 'standard', 5.99, 75.00, 3, 7, true),
('US Express Shipping', 'Express shipping within United States', 'US', 'express', 12.99, 150.00, 1, 3, true),
('International Standard', 'Standard international shipping', '*', 'standard', 15.99, 200.00, 7, 21, true)
ON CONFLICT DO NOTHING;

-- Insert sample tax rates
INSERT INTO public.tax_rates (name, country, state_province, tax_rate, tax_type, is_active) VALUES
('California Sales Tax', 'US', 'CA', 0.0825, 'sales', true),
('New York Sales Tax', 'US', 'NY', 0.08, 'sales', true),
('Texas Sales Tax', 'US', 'TX', 0.0625, 'sales', true),
('Canada GST', 'CA', NULL, 0.05, 'gst', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 11: GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_reservations TO authenticated;
GRANT SELECT ON public.discount_codes TO authenticated;
GRANT SELECT, INSERT ON public.discount_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT SELECT ON public.product_collections TO authenticated;
GRANT SELECT ON public.collection_products TO authenticated;
GRANT SELECT ON public.shipping_rates TO authenticated;
GRANT SELECT ON public.tax_rates TO authenticated;

-- Grant permissions for anonymous users (limited)
GRANT SELECT ON public.discount_codes TO anon;
GRANT SELECT ON public.product_collections TO anon;
GRANT SELECT ON public.collection_products TO anon;
GRANT SELECT ON public.shipping_rates TO anon;
GRANT SELECT ON public.tax_rates TO anon;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- This migration adds:
-- ✅ Inventory management system (inventory_transactions, stock_reservations)
-- ✅ Discount and promotion system (discount_codes, discount_usage)
-- ✅ User preferences and personalization (user_preferences)
-- ✅ Product collections and organization (product_collections, collection_products)
-- ✅ Shipping and tax system (shipping_rates, tax_rates)
-- ✅ Row Level Security enabled on all new tables
-- ✅ Comprehensive security policies
-- ✅ Performance indexes for all new tables
-- ✅ Helper functions for automation
-- ✅ Sample data for immediate testing
-- ✅ Proper permissions for authenticated and anon users

-- Your VLANCO Streetwear database now has advanced e-commerce capabilities! 🚀
