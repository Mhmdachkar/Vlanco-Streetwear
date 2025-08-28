-- Fix RLS Security Issues - Enable Row Level Security for all tables
-- This migration ensures all sensitive data is properly protected

-- Enable RLS for all tables that should have it
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create support tickets" ON public.support_tickets;

-- Create comprehensive RLS policies for security

-- USERS TABLE - Users can only access their own profile
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_policy" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_policy" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_delete_policy" ON public.users
    FOR DELETE USING (auth.uid() = id);

-- PRODUCTS TABLE - Public read access for active products only
CREATE POLICY "products_select_policy" ON public.products
    FOR SELECT USING (status = 'active');

-- PRODUCT VARIANTS TABLE - Public read access for active variants
CREATE POLICY "product_variants_select_policy" ON public.product_variants
    FOR SELECT USING (is_active = true);

-- PRODUCT IMAGES TABLE - Public read access
CREATE POLICY "product_images_select_policy" ON public.product_images
    FOR SELECT USING (true);

-- CART ITEMS TABLE - Users can only access their own cart
CREATE POLICY "cart_items_select_policy" ON public.cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_items_insert_policy" ON public.cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items_update_policy" ON public.cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_items_delete_policy" ON public.cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- WISHLISTS TABLE - Users can only access their own wishlist
CREATE POLICY "wishlists_select_policy" ON public.wishlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlists_insert_policy" ON public.wishlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlists_delete_policy" ON public.wishlists
    FOR DELETE USING (auth.uid() = user_id);

-- ORDERS TABLE - Users can only access their own orders
CREATE POLICY "orders_select_policy" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_policy" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_policy" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

-- ORDER ITEMS TABLE - Users can only access items from their own orders
CREATE POLICY "order_items_select_policy" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- REVIEWS TABLE - Public read access, users can only manage their own
CREATE POLICY "reviews_select_policy" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "reviews_insert_policy" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_policy" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reviews_delete_policy" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- ADDRESSES TABLE - Users can only access their own addresses
CREATE POLICY "addresses_select_policy" ON public.addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "addresses_insert_policy" ON public.addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_policy" ON public.addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "addresses_delete_policy" ON public.addresses
    FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS TABLE - Users can only access their own notifications
CREATE POLICY "notifications_select_policy" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_policy" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_policy" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- SUPPORT TICKETS TABLE - Users can only access their own tickets
CREATE POLICY "support_tickets_select_policy" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "support_tickets_insert_policy" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "support_tickets_update_policy" ON public.support_tickets
    FOR UPDATE USING (auth.uid() = user_id);

-- SUPPORT MESSAGES TABLE - Users can only access messages from their own tickets
CREATE POLICY "support_messages_select_policy" ON public.support_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE support_tickets.id = support_messages.ticket_id 
            AND support_tickets.user_id = auth.uid()
        )
    );

CREATE POLICY "support_messages_insert_policy" ON public.support_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE support_tickets.id = support_messages.ticket_id 
            AND support_tickets.user_id = auth.uid()
        )
    );

-- USER ACTIVITIES TABLE - Users can only access their own activities
CREATE POLICY "user_activities_select_policy" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_activities_insert_policy" ON public.user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SEARCH HISTORY TABLE - Users can only access their own search history
CREATE POLICY "search_history_select_policy" ON public.search_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "search_history_insert_policy" ON public.search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "search_history_delete_policy" ON public.search_history
    FOR DELETE USING (auth.uid() = user_id);

-- RECENTLY VIEWED TABLE - Users can only access their own recently viewed
CREATE POLICY "recently_viewed_select_policy" ON public.recently_viewed
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "recently_viewed_insert_policy" ON public.recently_viewed
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recently_viewed_delete_policy" ON public.recently_viewed
    FOR DELETE USING (auth.uid() = user_id);

-- INVENTORY TRANSACTIONS TABLE - Read-only for authenticated users (for transparency)
CREATE POLICY "inventory_transactions_select_policy" ON public.inventory_transactions
    FOR SELECT USING (auth.role() = 'authenticated');

-- RETURNS TABLE - Users can only access their own returns
CREATE POLICY "returns_select_policy" ON public.returns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "returns_insert_policy" ON public.returns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "returns_update_policy" ON public.returns
    FOR UPDATE USING (auth.uid() = user_id);

-- RETURN ITEMS TABLE - Users can only access items from their own returns
CREATE POLICY "return_items_select_policy" ON public.return_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.returns 
            WHERE returns.id = return_items.return_id 
            AND returns.user_id = auth.uid()
        )
    );

-- PUSH TOKENS TABLE - Users can only access their own tokens
CREATE POLICY "push_tokens_select_policy" ON public.push_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "push_tokens_insert_policy" ON public.push_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_tokens_update_policy" ON public.push_tokens
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "push_tokens_delete_policy" ON public.push_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic user_id assignment
CREATE TRIGGER set_user_id_cart_items
  BEFORE INSERT ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_user_id_wishlists
  BEFORE INSERT ON public.wishlists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_user_id_orders
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_user_id_reviews
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_user_id_addresses
  BEFORE INSERT ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_user_id_notifications
  BEFORE INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_user_id_support_tickets
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_user_id_user_activities
  BEFORE INSERT ON public.user_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_user_id_search_history
  BEFORE INSERT ON public.search_history
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_user_id_recently_viewed
  BEFORE INSERT ON public.recently_viewed
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_user_id_returns
  BEFORE INSERT ON public.returns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_user_id_push_tokens
  BEFORE INSERT ON public.push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wishlists TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.support_messages TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_activities TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.search_history TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.recently_viewed TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.returns TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.push_tokens TO authenticated;

-- Grant necessary permissions to anon users (for public data only)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.brands TO anon;
GRANT SELECT ON public.collections TO anon;
GRANT SELECT ON public.reviews TO anon;

-- Create function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current user ID
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
