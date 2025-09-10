-- Complete Database Setup for VLANCO Streetwear
-- This migration creates ALL required tables, policies, and sample data
-- Created: 2025-01-25
-- Version: 1.0.0 - Complete Setup

-- ============================================================================
-- STEP 1: ENABLE EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- STEP 2: CREATE CORE TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    username TEXT UNIQUE,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}',
    loyalty_points INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands table
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    sku TEXT UNIQUE,
    barcode TEXT,
    brand_id UUID REFERENCES public.brands(id),
    category_id UUID REFERENCES public.categories(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    is_limited_edition BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    weight DECIMAL(8,2),
    dimensions JSONB,
    material TEXT,
    care_instructions TEXT,
    tags TEXT[],
    color_options TEXT[],
    size_options TEXT[],
    images TEXT[],
    image_url TEXT,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    color TEXT,
    size TEXT,
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    weight DECIMAL(8,2),
    dimensions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product images table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    image_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time DECIMAL(10,2) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist items table (using wishlist_items for consistency)
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, variant_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    total_amount DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    shipping_address JSONB,
    billing_address JSONB,
    payment_method TEXT,
    payment_id TEXT,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_name TEXT NOT NULL,
    variant_name TEXT,
    product_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    images TEXT[],
    is_verified_purchase BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id, order_id)
);

-- Review votes table
CREATE TABLE IF NOT EXISTS public.review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- Addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing', 'both')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    phone TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: CREATE ANALYTICS AND TRACKING TABLES
-- ============================================================================

-- Analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_data JSONB,
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    is_online BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_page TEXT,
    user_agent TEXT,
    ip_address INET,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    session_duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recently viewed products table
CREATE TABLE IF NOT EXISTS public.recently_viewed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Search history table
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: CREATE SECURITY POLICIES
-- ============================================================================

-- Users table policies
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_policy" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_policy" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_delete_policy" ON public.users
    FOR DELETE USING (auth.uid() = id);

-- Categories table policies (public read access)
CREATE POLICY "categories_select_policy" ON public.categories
    FOR SELECT USING (is_active = true);

-- Brands table policies (public read access)
CREATE POLICY "brands_select_policy" ON public.brands
    FOR SELECT USING (true);

-- Products table policies (public read access)
CREATE POLICY "products_select_policy" ON public.products
    FOR SELECT USING (status = 'active');

-- Product variants table policies (public read access)
CREATE POLICY "product_variants_select_policy" ON public.product_variants
    FOR SELECT USING (is_active = true);

-- Product images table policies (public read access)
CREATE POLICY "product_images_select_policy" ON public.product_images
    FOR SELECT USING (true);

-- Cart items table policies
CREATE POLICY "cart_items_select_policy" ON public.cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_items_insert_policy" ON public.cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items_update_policy" ON public.cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_items_delete_policy" ON public.cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Wishlist items table policies
CREATE POLICY "wishlist_items_select_policy" ON public.wishlist_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlist_items_insert_policy" ON public.wishlist_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlist_items_delete_policy" ON public.wishlist_items
    FOR DELETE USING (auth.uid() = user_id);

-- Orders table policies
CREATE POLICY "orders_select_policy" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_policy" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_policy" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Order items table policies
CREATE POLICY "order_items_select_policy" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Reviews table policies
CREATE POLICY "reviews_select_policy" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "reviews_insert_policy" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_policy" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reviews_delete_policy" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Review votes table policies
CREATE POLICY "review_votes_select_policy" ON public.review_votes
    FOR SELECT USING (true);

CREATE POLICY "review_votes_insert_policy" ON public.review_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_votes_update_policy" ON public.review_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "review_votes_delete_policy" ON public.review_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Addresses table policies
CREATE POLICY "addresses_select_policy" ON public.addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "addresses_insert_policy" ON public.addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_policy" ON public.addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "addresses_delete_policy" ON public.addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Analytics events table policies
CREATE POLICY "analytics_events_select_policy" ON public.analytics_events
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "analytics_events_insert_policy" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

-- User sessions table policies
CREATE POLICY "user_sessions_select_policy" ON public.user_sessions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "user_sessions_insert_policy" ON public.user_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "user_sessions_update_policy" ON public.user_sessions
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

-- Recently viewed table policies
CREATE POLICY "recently_viewed_select_policy" ON public.recently_viewed
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "recently_viewed_insert_policy" ON public.recently_viewed
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recently_viewed_delete_policy" ON public.recently_viewed
    FOR DELETE USING (auth.uid() = user_id);

-- Search history table policies
CREATE POLICY "search_history_select_policy" ON public.search_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "search_history_insert_policy" ON public.search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "search_history_delete_policy" ON public.search_history
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications table policies
CREATE POLICY "notifications_select_policy" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_policy" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_policy" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- Brands table indexes
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON public.products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON public.products(is_bestseller);

-- Product variants table indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON public.product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

-- Product images table indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_variant_id ON public.product_images(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON public.product_images(is_primary);

-- Cart items table indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON public.cart_items(variant_id);

-- Wishlist items table indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items(product_id);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- Review votes table indexes
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON public.review_votes(user_id);

-- Addresses table indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_type ON public.addresses(type);

-- Analytics events table indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);

-- User sessions table indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_online ON public.user_sessions(is_online);

-- Recently viewed table indexes
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON public.recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_product_id ON public.recently_viewed(product_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON public.recently_viewed(viewed_at);

-- Search history table indexes
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON public.search_history(query);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- ============================================================================
-- STEP 7: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at 
    BEFORE UPDATE ON public.product_variants 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at 
    BEFORE UPDATE ON public.cart_items 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON public.reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at 
    BEFORE UPDATE ON public.addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- STEP 8: GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.review_votes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.analytics_events TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_sessions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.recently_viewed TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.search_history TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

-- Grant permissions to anon users (for public data only)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.brands TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT ON public.reviews TO anon;

-- ============================================================================
-- STEP 9: INSERT SAMPLE DATA
-- ============================================================================

-- Insert sample categories
INSERT INTO public.categories (id, name, slug, description, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'T-Shirts', 't-shirts', 'Premium streetwear t-shirts', true),
('550e8400-e29b-41d4-a716-446655440002', 'Masks', 'masks', 'Stylish face masks and balaclavas', true),
('550e8400-e29b-41d4-a716-446655440003', 'Accessories', 'accessories', 'Streetwear accessories', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample brands
INSERT INTO public.brands (id, name, slug, description, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'VLANCO', 'vlanco', 'Premium streetwear brand', true),
('550e8400-e29b-41d4-a716-446655440012', 'ZRCE', 'zrce', 'Winter accessories specialist', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (id, name, description, base_price, compare_price, status, is_featured, is_new, is_bestseller, category_id, brand_id, image_url, images, color_options, size_options, rating_average, rating_count, stock_quantity) VALUES
-- T-Shirts
('550e8400-e29b-41d4-a716-446655440101', 'Essential Urban Tee', 'Premium streetwear t-shirt with urban aesthetic', 45.00, 60.00, 'active', true, true, false, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '/src/assets/product-1.jpg', ARRAY['/src/assets/product-1.jpg'], ARRAY['Black', 'White', 'Gray'], ARRAY['S', 'M', 'L', 'XL'], 4.5, 120, 100),
('550e8400-e29b-41d4-a716-446655440102', 'Streetwear Classic', 'Classic streetwear design with premium materials', 55.00, 75.00, 'active', true, false, true, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '/src/assets/product-2.jpg', ARRAY['/src/assets/product-2.jpg'], ARRAY['Black', 'Navy', 'Charcoal'], ARRAY['S', 'M', 'L', 'XL'], 4.3, 95, 80),
('550e8400-e29b-41d4-a716-446655440103', 'Limited Edition Drop', 'Exclusive limited edition streetwear piece', 85.00, 120.00, 'active', true, true, true, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '/src/assets/product-3.jpg', ARRAY['/src/assets/product-3.jpg'], ARRAY['Black', 'Red'], ARRAY['M', 'L', 'XL'], 4.7, 65, 25),
('550e8400-e29b-41d4-a716-446655440104', 'Minimalist Design', 'Clean minimalist streetwear aesthetic', 42.00, 55.00, 'active', false, false, false, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '/src/assets/product-4.jpg', ARRAY['/src/assets/product-4.jpg'], ARRAY['White', 'Light Gray'], ARRAY['S', 'M', 'L'], 4.2, 78, 60),
-- Masks
('550e8400-e29b-41d4-a716-446655440201', 'Winter Thermal Balaclava', 'Winter Thermal 3D Cartoon Balaclava – Funny Character Full Face Mask for Motorcycle, Ski & Cosplay', 2.36, null, 'active', true, true, true, '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', '/src/assets/mask_photos/mask_photos_2/mask1.png', ARRAY['/src/assets/mask_photos/mask_photos_2/mask1.png', '/src/assets/mask_photos/mask_photos_2/mask2.png'], ARRAY['Black', 'Gray', 'Navy Blue', 'Red', 'Green'], ARRAY['56-58cm', '58-60cm', '60-62cm'], 4.3, 156, 200),
('550e8400-e29b-41d4-a716-446655440202', 'Handmade Crochet Ski Mask', 'S9151 Handmade Crochet Ski Mask – Distress Balaclava Winter Warm Helmet Cover', 6.85, null, 'active', true, true, false, '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', '/src/assets/mask_photos/mask_photos_3/mask1.png', ARRAY['/src/assets/mask_photos/mask_photos_3/mask1.png', '/src/assets/mask_photos/mask_photos_3/mask2.png'], ARRAY['Custom Colors'], ARRAY['Adult Size'], 4.4, 210, 100)
ON CONFLICT (id) DO NOTHING;

-- Insert sample product variants
INSERT INTO public.product_variants (id, product_id, color, size, price, stock_quantity, is_active, sku) VALUES
-- T-Shirt variants
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440101', 'Black', 'M', 45.00, 50, true, 'URBAN-TEE-BLK-M'),
('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440101', 'White', 'L', 45.00, 30, true, 'URBAN-TEE-WHT-L'),
('550e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440102', 'Black', 'S', 55.00, 25, true, 'STREET-CLS-BLK-S'),
('550e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440102', 'Navy', 'M', 55.00, 40, true, 'STREET-CLS-NAV-M'),
('550e8400-e29b-41d4-a716-446655440115', '550e8400-e29b-41d4-a716-446655440103', 'Black', 'L', 85.00, 15, true, 'LIMITED-BLK-L'),
('550e8400-e29b-41d4-a716-446655440116', '550e8400-e29b-41d4-a716-446655440103', 'Red', 'M', 85.00, 10, true, 'LIMITED-RED-M'),
-- Mask variants
('550e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440201', 'Black', '56-58cm', 2.36, 50, true, 'THERMAL-BLK-56'),
('550e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440201', 'Gray', '58-60cm', 2.36, 40, true, 'THERMAL-GRY-58'),
('550e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440202', 'Custom Colors', 'Adult Size', 6.85, 100, true, 'CROCHET-CUSTOM-ADULT')
ON CONFLICT (id) DO NOTHING;

-- Insert sample product images
INSERT INTO public.product_images (id, product_id, variant_id, image_url, alt_text, is_primary, sort_order) VALUES
-- T-Shirt images
('550e8400-e29b-41d4-a716-446655440121', '550e8400-e29b-41d4-a716-446655440101', null, '/src/assets/product-1.jpg', 'Essential Urban Tee', true, 1),
('550e8400-e29b-41d4-a716-446655440122', '550e8400-e29b-41d4-a716-446655440102', null, '/src/assets/product-2.jpg', 'Streetwear Classic', true, 1),
('550e8400-e29b-41d4-a716-446655440123', '550e8400-e29b-41d4-a716-446655440103', null, '/src/assets/product-3.jpg', 'Limited Edition Drop', true, 1),
('550e8400-e29b-41d4-a716-446655440124', '550e8400-e29b-41d4-a716-446655440104', null, '/src/assets/product-4.jpg', 'Minimalist Design', true, 1),
-- Mask images
('550e8400-e29b-41d4-a716-446655440221', '550e8400-e29b-41d4-a716-446655440201', null, '/src/assets/mask_photos/mask_photos_2/mask1.png', 'Winter Thermal Balaclava', true, 1),
('550e8400-e29b-41d4-a716-446655440222', '550e8400-e29b-41d4-a716-446655440201', null, '/src/assets/mask_photos/mask_photos_2/mask2.png', 'Winter Thermal Balaclava Side View', false, 2),
('550e8400-e29b-41d4-a716-446655440223', '550e8400-e29b-41d4-a716-446655440202', null, '/src/assets/mask_photos/mask_photos_3/mask1.png', 'Handmade Crochet Ski Mask', true, 1),
('550e8400-e29b-41d4-a716-446655440224', '550e8400-e29b-41d4-a716-446655440202', null, '/src/assets/mask_photos/mask_photos_3/mask2.png', 'Handmade Crochet Ski Mask Detail', false, 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 10: VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verify sample data was inserted
SELECT 'Products' as table_name, COUNT(*) as row_count FROM public.products
UNION ALL
SELECT 'Product Variants' as table_name, COUNT(*) as row_count FROM public.product_variants
UNION ALL
SELECT 'Product Images' as table_name, COUNT(*) as row_count FROM public.product_images
UNION ALL
SELECT 'Categories' as table_name, COUNT(*) as row_count FROM public.categories
UNION ALL
SELECT 'Brands' as table_name, COUNT(*) as row_count FROM public.brands;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- This migration provides:
-- ✅ All core tables (users, products, cart_items, wishlist_items, orders, reviews, addresses)
-- ✅ Analytics tables (analytics_events, user_sessions, recently_viewed, search_history, notifications)
-- ✅ Row Level Security enabled on all tables
-- ✅ Comprehensive security policies
-- ✅ Performance indexes for all tables
-- ✅ Helper functions and triggers
-- ✅ Proper permissions for authenticated and anon users
-- ✅ Sample data for testing
-- ✅ Consistent naming (wishlist_items instead of wishlists)
-- ✅ All tables required by the frontend application
-- ✅ No conflicts or duplications

-- Your VLANCO Streetwear database is now ready for production! 🚀
