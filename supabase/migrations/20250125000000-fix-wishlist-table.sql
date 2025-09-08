-- Fix wishlist table structure to match application expectations
-- The app expects 'wishlist_items' table but migration created 'wishlists'

-- Drop existing wishlists table if it exists
DROP TABLE IF EXISTS public.wishlists CASCADE;

-- Create wishlist_items table with correct structure
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL, -- Changed to TEXT to match app expectations
    variant_id TEXT, -- Changed to TEXT to match app expectations
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, variant_id)
);

-- Enable RLS
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for wishlist_items
CREATE POLICY "wishlist_items_select_policy" ON public.wishlist_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlist_items_insert_policy" ON public.wishlist_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlist_items_update_policy" ON public.wishlist_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "wishlist_items_delete_policy" ON public.wishlist_items
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items(product_id);

-- Grant permissions
GRANT INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT SELECT ON public.wishlist_items TO authenticated;

-- Also create analytics_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.analytics_events (
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

-- Enable RLS for analytics
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy for analytics (users can only see their own events)
CREATE POLICY "analytics_events_select_policy" ON public.analytics_events
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "analytics_events_insert_policy" ON public.analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Grant permissions for analytics
GRANT INSERT, SELECT ON public.analytics_events TO authenticated;
GRANT INSERT, SELECT ON public.analytics_events TO anon;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "notifications_select_policy" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_policy" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_policy" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_policy" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Grant permissions for notifications
GRANT INSERT, UPDATE, DELETE, SELECT ON public.notifications TO authenticated;

-- Create recently_viewed table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.recently_viewed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Enable RLS for recently_viewed
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

-- Create policies for recently_viewed
CREATE POLICY "recently_viewed_select_policy" ON public.recently_viewed
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "recently_viewed_insert_policy" ON public.recently_viewed
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "recently_viewed_update_policy" ON public.recently_viewed
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "recently_viewed_delete_policy" ON public.recently_viewed
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for recently_viewed
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON public.recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_product_id ON public.recently_viewed(product_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON public.recently_viewed(viewed_at);

-- Grant permissions for recently_viewed
GRANT INSERT, UPDATE, DELETE, SELECT ON public.recently_viewed TO authenticated;
GRANT INSERT, SELECT ON public.recently_viewed TO anon;

-- Create search_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    search_term TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for search_history
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Create policies for search_history
CREATE POLICY "search_history_select_policy" ON public.search_history
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "search_history_insert_policy" ON public.search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "search_history_delete_policy" ON public.search_history
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for search_history
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_search_term ON public.search_history(search_term);
CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON public.search_history(searched_at);

-- Grant permissions for search_history
GRANT INSERT, DELETE, SELECT ON public.search_history TO authenticated;
GRANT INSERT, SELECT ON public.search_history TO anon;

-- Create review_votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- Enable RLS for review_votes
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for review_votes
CREATE POLICY "review_votes_select_policy" ON public.review_votes
    FOR SELECT USING (true); -- Anyone can see vote counts

CREATE POLICY "review_votes_insert_policy" ON public.review_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_votes_update_policy" ON public.review_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "review_votes_delete_policy" ON public.review_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for review_votes
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON public.review_votes(user_id);

-- Grant permissions for review_votes
GRANT INSERT, UPDATE, DELETE, SELECT ON public.review_votes TO authenticated;

-- Update reviews table to add missing columns
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Also ensure products table can accept TEXT IDs (for compatibility with frontend)
-- Add a trigger to handle both UUID and TEXT product_id formats
CREATE OR REPLACE FUNCTION handle_product_id_format()
RETURNS TRIGGER AS $$
BEGIN
    -- If product_id looks like a number, convert it to a proper format
    IF NEW.product_id ~ '^[0-9]+$' THEN
        NEW.product_id := 'product_' || NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
DROP TRIGGER IF EXISTS product_id_format_trigger ON public.cart_items;
CREATE TRIGGER product_id_format_trigger
    BEFORE INSERT OR UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION handle_product_id_format();

DROP TRIGGER IF EXISTS product_id_format_trigger_wishlist ON public.wishlist_items;
CREATE TRIGGER product_id_format_trigger_wishlist
    BEFORE INSERT OR UPDATE ON public.wishlist_items
    FOR EACH ROW EXECUTE FUNCTION handle_product_id_format();

-- Migration complete
SELECT 'Migration completed: Fixed wishlist table and added missing analytics tables' as status;
