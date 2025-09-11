-- Comprehensive Database Fix for VLANCO Streetwear
-- This migration fixes ALL database issues and creates a consistent, working structure
-- Created: 2025-09-10
-- Version: 3.0.0 - Complete Database Overhaul

-- ============================================================================
-- STEP 1: CLEAN UP AND DROP CONFLICTING TABLES
-- ============================================================================

-- Drop all existing tables to start fresh (order matters due to foreign keys)
DROP TABLE IF EXISTS public.collection_products CASCADE;
DROP TABLE IF EXISTS public.product_collections CASCADE;
DROP TABLE IF EXISTS public.discount_usage CASCADE;
DROP TABLE IF EXISTS public.discount_codes CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.tax_rates CASCADE;
DROP TABLE IF EXISTS public.shipping_rates CASCADE;
DROP TABLE IF EXISTS public.stock_reservations CASCADE;
DROP TABLE IF EXISTS public.inventory_transactions CASCADE;
DROP TABLE IF EXISTS public.review_votes CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.recently_viewed CASCADE;
DROP TABLE IF EXISTS public.search_history CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.website_analytics CASCADE;
DROP TABLE IF EXISTS public.page_views CASCADE;
DROP TABLE IF EXISTS public.product_interactions CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop any remaining functions and triggers
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_product_id_format() CASCADE;
DROP FUNCTION IF EXISTS public.expire_stock_reservations() CASCADE;
DROP FUNCTION IF EXISTS public.is_discount_code_valid(TEXT, UUID, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS public.reserve_stock(UUID, UUID, INTEGER, VARCHAR, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.convert_reservation_to_purchase(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.track_user_activity(TEXT, VARCHAR, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.get_real_time_analytics() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_reservations() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_online_status() CASCADE;
DROP FUNCTION IF EXISTS public.auto_cleanup_reservations() CASCADE;
DROP FUNCTION IF EXISTS public.is_authenticated() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_id() CASCADE;

-- ============================================================================
-- STEP 2: ENABLE EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- STEP 3: CREATE CORE TABLES WITH CONSISTENT STRUCTURE
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
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
CREATE TABLE public.categories (
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
CREATE TABLE public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table - MAIN INVENTORY TABLE
CREATE TABLE public.products (
    id TEXT PRIMARY KEY, -- Using TEXT to support both UUID and custom IDs
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
    stock_quantity INTEGER DEFAULT 0, -- Total stock across all variants
    low_stock_threshold INTEGER DEFAULT 10,
    track_quantity BOOLEAN DEFAULT true,
    allow_backorder BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants table
CREATE TABLE public.product_variants (
    id TEXT PRIMARY KEY, -- Using TEXT for consistency
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    color TEXT,
    size TEXT,
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    weight DECIMAL(8,2),
    dimensions JSONB,
    barcode TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product images table
CREATE TABLE public.product_images (
    id TEXT PRIMARY KEY, -- Changed to TEXT for consistency
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id TEXT REFERENCES public.product_variants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    image_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table - SIMPLIFIED STRUCTURE
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id TEXT REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_at_time DECIMAL(10,2) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, variant_id)
);

-- Wishlist items table - CONSISTENT WITH FRONTEND EXPECTATIONS
CREATE TABLE public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id TEXT REFERENCES public.product_variants(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, variant_id)
);

-- Orders table
CREATE TABLE public.orders (
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
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id TEXT REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_name TEXT NOT NULL,
    variant_name TEXT,
    product_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, -- Changed to TEXT for consistency
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
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
CREATE TABLE public.review_votes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    review_id TEXT NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- Addresses table
CREATE TABLE public.addresses (
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
-- STEP 4: CREATE ANALYTICS AND TRACKING TABLES
-- ============================================================================

-- Analytics events table
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE public.user_sessions (
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
CREATE TABLE public.recently_viewed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Search history table
CREATE TABLE public.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: CREATE INVENTORY MANAGEMENT TABLES
-- ============================================================================

-- Inventory transactions table for tracking stock movements
CREATE TABLE public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id TEXT REFERENCES public.product_variants(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'return', 'reservation', 'release')),
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason TEXT,
    reference_id UUID,
    reference_type TEXT,
    user_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Stock reservations for checkout process
CREATE TABLE public.stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id TEXT REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'fulfilled', 'cancelled')),
    order_id UUID REFERENCES public.orders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
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
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: CREATE SECURITY POLICIES
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

-- Categories policies (public read)
CREATE POLICY "categories_select_policy" ON public.categories
    FOR SELECT USING (is_active = true);

-- Brands policies (public read)
CREATE POLICY "brands_select_policy" ON public.brands
    FOR SELECT USING (true);

-- Products policies (public read for active products)
CREATE POLICY "products_select_policy" ON public.products
    FOR SELECT USING (status = 'active');

-- Product variants policies (public read for active variants)
CREATE POLICY "product_variants_select_policy" ON public.product_variants
    FOR SELECT USING (is_active = true);

-- Product images policies (public read)
CREATE POLICY "product_images_select_policy" ON public.product_images
    FOR SELECT USING (true);

-- Cart items policies (users own cart only)
CREATE POLICY "cart_items_select_policy" ON public.cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_items_insert_policy" ON public.cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items_update_policy" ON public.cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_items_delete_policy" ON public.cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Wishlist items policies (users own wishlist only)
CREATE POLICY "wishlist_items_select_policy" ON public.wishlist_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlist_items_insert_policy" ON public.wishlist_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlist_items_delete_policy" ON public.wishlist_items
    FOR DELETE USING (auth.uid() = user_id);

-- Orders policies (users own orders only)
CREATE POLICY "orders_select_policy" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_policy" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_policy" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "order_items_select_policy" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Reviews policies (public read, users manage own)
CREATE POLICY "reviews_select_policy" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "reviews_insert_policy" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_policy" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reviews_delete_policy" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Review votes policies
CREATE POLICY "review_votes_select_policy" ON public.review_votes
    FOR SELECT USING (true);

CREATE POLICY "review_votes_insert_policy" ON public.review_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_votes_update_policy" ON public.review_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "review_votes_delete_policy" ON public.review_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Addresses policies
CREATE POLICY "addresses_select_policy" ON public.addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "addresses_insert_policy" ON public.addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_policy" ON public.addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "addresses_delete_policy" ON public.addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Analytics events policies
CREATE POLICY "analytics_events_select_policy" ON public.analytics_events
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "analytics_events_insert_policy" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

-- User sessions policies
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

-- Recently viewed policies
CREATE POLICY "recently_viewed_select_policy" ON public.recently_viewed
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "recently_viewed_insert_policy" ON public.recently_viewed
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recently_viewed_delete_policy" ON public.recently_viewed
    FOR DELETE USING (auth.uid() = user_id);

-- Search history policies
CREATE POLICY "search_history_select_policy" ON public.search_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "search_history_insert_policy" ON public.search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "search_history_delete_policy" ON public.search_history
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "notifications_select_policy" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_policy" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_policy" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Inventory transactions policies
CREATE POLICY "inventory_transactions_select_policy" ON public.inventory_transactions
    FOR SELECT USING (
        user_id = auth.uid() OR 
        auth.role() = 'service_role'
    );

-- Stock reservations policies
CREATE POLICY "stock_reservations_select_policy" ON public.stock_reservations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "stock_reservations_insert_policy" ON public.stock_reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stock_reservations_update_policy" ON public.stock_reservations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "stock_reservations_delete_policy" ON public.stock_reservations
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 8: CREATE INDEXES FOR PERFORMANCE
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
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON public.products(stock_quantity);

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

-- Inventory transactions indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON public.inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_variant_id ON public.inventory_transactions(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON public.inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON public.inventory_transactions(created_at);

-- Stock reservations indexes
CREATE INDEX IF NOT EXISTS idx_stock_reservations_user_id ON public.stock_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_product_id ON public.stock_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_expires_at ON public.stock_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_status ON public.stock_reservations(status);

-- ============================================================================
-- STEP 9: CREATE HELPER FUNCTIONS
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

CREATE TRIGGER update_stock_reservations_updated_at 
    BEFORE UPDATE ON public.stock_reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically update product stock when variants change
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the product's total stock based on all active variants
    UPDATE public.products 
    SET stock_quantity = (
        SELECT COALESCE(SUM(stock_quantity), 0) 
        FROM public.product_variants 
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
        AND is_active = true
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update product stock when variants change
CREATE TRIGGER update_product_stock_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_product_stock();

-- Function to track inventory transactions
CREATE OR REPLACE FUNCTION public.track_inventory_change()
RETURNS TRIGGER AS $$
DECLARE
    change_amount INTEGER;
    transaction_type_value TEXT;
BEGIN
    -- Determine change amount and type
    IF TG_OP = 'INSERT' THEN
        change_amount := NEW.stock_quantity;
        transaction_type_value := 'adjustment';
    ELSIF TG_OP = 'UPDATE' THEN
        change_amount := NEW.stock_quantity - OLD.stock_quantity;
        transaction_type_value := 'adjustment';
    ELSIF TG_OP = 'DELETE' THEN
        change_amount := -OLD.stock_quantity;
        transaction_type_value := 'adjustment';
    END IF;
    
    -- Only track if there's actually a change
    IF change_amount != 0 THEN
        INSERT INTO public.inventory_transactions (
            product_id,
            variant_id,
            transaction_type,
            quantity_change,
            previous_stock,
            new_stock,
            reason,
            reference_type
        ) VALUES (
            COALESCE(NEW.product_id, OLD.product_id),
            COALESCE(NEW.id, OLD.id),
            transaction_type_value,
            change_amount,
            COALESCE(OLD.stock_quantity, 0),
            COALESCE(NEW.stock_quantity, 0),
            'Automatic stock tracking',
            'variant_update'
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory tracking on variants
CREATE TRIGGER track_variant_inventory_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION public.track_inventory_change();

-- ============================================================================
-- STEP 10: GRANT PERMISSIONS
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
GRANT SELECT ON public.inventory_transactions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.stock_reservations TO authenticated;

-- Grant permissions to anon users (for public data only)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.brands TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT ON public.reviews TO anon;

-- ============================================================================
-- STEP 11: INSERT SAMPLE DATA
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

-- Insert sample T-shirt products
INSERT INTO public.products (id, name, description, base_price, compare_price, status, is_featured, is_new, is_bestseller, category_id, brand_id, image_url, images, color_options, size_options, rating_average, rating_count, stock_quantity) VALUES
('product_1', 'Essential Urban Tee', 'Premium streetwear t-shirt with urban aesthetic', 45.00, 60.00, 'active', true, true, false, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '/src/assets/product-1.jpg', ARRAY['/src/assets/product-1.jpg'], ARRAY['Black', 'White', 'Gray'], ARRAY['S', 'M', 'L', 'XL'], 4.5, 120, 100),
('product_2', 'Streetwear Classic', 'Classic streetwear design with premium materials', 55.00, 75.00, 'active', true, false, true, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '/src/assets/product-2.jpg', ARRAY['/src/assets/product-2.jpg'], ARRAY['Black', 'Navy', 'Charcoal'], ARRAY['S', 'M', 'L', 'XL'], 4.3, 95, 80),
('product_3', 'Limited Edition Drop', 'Exclusive limited edition streetwear piece', 85.00, 120.00, 'active', true, true, true, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '/src/assets/product-3.jpg', ARRAY['/src/assets/product-3.jpg'], ARRAY['Black', 'Red'], ARRAY['M', 'L', 'XL'], 4.7, 65, 25),
('product_4', 'Minimalist Design', 'Clean minimalist streetwear aesthetic', 42.00, 55.00, 'active', false, false, false, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '/src/assets/product-4.jpg', ARRAY['/src/assets/product-4.jpg'], ARRAY['White', 'Light Gray'], ARRAY['S', 'M', 'L'], 4.2, 78, 60),
-- Test product for AuthCartTest component
('test-product-123', 'Test VLANCO T-Shirt', 'Test product for authentication and cart testing', 29.99, null, 'active', false, false, false, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '/src/assets/product-1.jpg', ARRAY['/src/assets/product-1.jpg'], ARRAY['Black'], ARRAY['M'], 4.0, 10, 50)
ON CONFLICT (id) DO NOTHING;

-- Insert mask products
INSERT INTO public.products (id, name, description, base_price, compare_price, status, is_featured, is_new, is_bestseller, category_id, brand_id, image_url, images, color_options, size_options, rating_average, rating_count, stock_quantity, metadata) VALUES
('mask_1', 'Winter Thermal Balaclava', 'Winter Thermal 3D Cartoon Balaclava – Funny Character Full Face Mask for Motorcycle, Ski & Cosplay', 2.36, null, 'active', true, true, true, '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', '/src/assets/mask_photos/mask_photos_2/mask1.png', ARRAY['/src/assets/mask_photos/mask_photos_2/mask1.png', '/src/assets/mask_photos/mask_photos_2/mask2.png'], ARRAY['Black', 'Gray', 'Navy Blue', 'Red', 'Green'], ARRAY['56-58cm', '58-60cm', '60-62cm'], 4.3, 156, 200, '{"material": "93% Polyester + 7% Spandex", "protection": "Thermal & Wind Protection"}'::jsonb),
('mask_2', 'Handmade Crochet Ski Mask', 'S9151 Handmade Crochet Ski Mask – Distress Balaclava Winter Warm Helmet Cover', 6.85, null, 'active', true, true, false, '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', '/src/assets/mask_photos/mask_photos_3/mask1.png', ARRAY['/src/assets/mask_photos/mask_photos_3/mask1.png', '/src/assets/mask_photos/mask_photos_3/mask2.png'], ARRAY['Custom Colors'], ARRAY['Adult Size'], 4.4, 210, 100, '{"material": "100% Acrylic", "protection": "Full Face & Neck Coverage"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert sample product variants
INSERT INTO public.product_variants (id, product_id, color, size, price, stock_quantity, is_active, sku) VALUES
-- T-Shirt variants
('variant_1_1', 'product_1', 'Black', 'M', 45.00, 50, true, 'URBAN-TEE-BLK-M'),
('variant_1_2', 'product_1', 'White', 'L', 45.00, 30, true, 'URBAN-TEE-WHT-L'),
('variant_2_1', 'product_2', 'Black', 'S', 55.00, 25, true, 'STREET-CLS-BLK-S'),
('variant_2_2', 'product_2', 'Navy', 'M', 55.00, 40, true, 'STREET-CLS-NAV-M'),
('variant_3_1', 'product_3', 'Black', 'L', 85.00, 15, true, 'LIMITED-BLK-L'),
('variant_3_2', 'product_3', 'Red', 'M', 85.00, 10, true, 'LIMITED-RED-M'),
-- Test product variant
('test-variant-456', 'test-product-123', 'Black', 'M', 29.99, 50, true, 'TEST-BLK-M'),
-- Mask variants
('mask_1_variant_1', 'mask_1', 'Black', '56-58cm', 2.36, 50, true, 'THERMAL-BLK-56'),
('mask_1_variant_2', 'mask_1', 'Gray', '58-60cm', 2.36, 40, true, 'THERMAL-GRY-58'),
('mask_2_variant_1', 'mask_2', 'Custom Colors', 'Adult Size', 6.85, 100, true, 'CROCHET-CUSTOM-ADULT')
ON CONFLICT (id) DO NOTHING;

-- Insert sample product images
INSERT INTO public.product_images (id, product_id, variant_id, image_url, alt_text, is_primary, sort_order) VALUES
-- T-Shirt images
('img_1', 'product_1', null, '/src/assets/product-1.jpg', 'Essential Urban Tee', true, 1),
('img_2', 'product_2', null, '/src/assets/product-2.jpg', 'Streetwear Classic', true, 1),
('img_3', 'product_3', null, '/src/assets/product-3.jpg', 'Limited Edition Drop', true, 1),
('img_4', 'product_4', null, '/src/assets/product-4.jpg', 'Minimalist Design', true, 1),
('img_test', 'test-product-123', null, '/src/assets/product-1.jpg', 'Test VLANCO T-Shirt', true, 1),
-- Mask images
('img_mask_1', 'mask_1', null, '/src/assets/mask_photos/mask_photos_2/mask1.png', 'Winter Thermal Balaclava', true, 1),
('img_mask_1_2', 'mask_1', null, '/src/assets/mask_photos/mask_photos_2/mask2.png', 'Winter Thermal Balaclava Side View', false, 2),
('img_mask_2', 'mask_2', null, '/src/assets/mask_photos/mask_photos_3/mask1.png', 'Handmade Crochet Ski Mask', true, 1),
('img_mask_2_2', 'mask_2', null, '/src/assets/mask_photos/mask_photos_3/mask2.png', 'Handmade Crochet Ski Mask Detail', false, 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 12: VERIFICATION QUERIES
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
-- ✅ Complete database structure overhaul with consistent naming
-- ✅ Proper foreign key relationships using TEXT IDs for flexibility
-- ✅ Comprehensive inventory management with stock tracking
-- ✅ Cart and wishlist tables that match frontend expectations
-- ✅ Row Level Security enabled on all tables
-- ✅ Comprehensive security policies
-- ✅ Performance indexes for all tables
-- ✅ Automatic stock management via triggers
-- ✅ Inventory transaction tracking
-- ✅ Sample data including test products for AuthCartTest
-- ✅ Analytics and tracking capabilities
-- ✅ Proper permissions for authenticated and anonymous users

-- Your VLANCO Streetwear database is now fully functional! 🚀
