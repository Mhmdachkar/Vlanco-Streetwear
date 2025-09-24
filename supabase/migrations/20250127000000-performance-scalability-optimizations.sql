-- Performance and Scalability Optimizations for VLANCO Streetwear
-- This migration adds database optimizations for high-traffic scenarios
-- Created: 2025-01-27
-- Version: 4.0.0 - Performance & Scalability Enhancements

-- ============================================================================
-- STEP 1: CREATE PERFORMANCE MONITORING TABLES
-- ============================================================================

-- Performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate limiting tracking table
CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_request TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_blocked BOOLEAN DEFAULT false,
    block_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Circuit breaker state table
CREATE TABLE IF NOT EXISTS public.circuit_breaker_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT UNIQUE NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('closed', 'open', 'half-open')),
    failure_count INTEGER DEFAULT 0,
    last_failure_time TIMESTAMP WITH TIME ZONE,
    last_success_time TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System health monitoring table
CREATE TABLE IF NOT EXISTS public.system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    response_time_ms INTEGER,
    error_rate DECIMAL(5,2),
    last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: ADD PERFORMANCE INDEXES TO EXISTING TABLES
-- ============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON public.users(updated_at);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON public.products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON public.products(updated_at);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON public.products USING gin(description gin_trgm_ops);

-- Cart items indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_created_at ON public.cart_items(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_items_updated_at ON public.cart_items(updated_at);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON public.orders(updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON public.orders(total_amount);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Wishlist items indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_created_at ON public.wishlist_items(created_at);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);

-- ============================================================================
-- STEP 3: CREATE PERFORMANCE FUNCTIONS
-- ============================================================================

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete rate limit records older than 1 hour
    DELETE FROM public.rate_limit_tracking 
    WHERE created_at < NOW() - INTERVAL '1 hour';
    
    -- Delete expired blocks
    UPDATE public.rate_limit_tracking 
    SET is_blocked = false, block_expires_at = NULL
    WHERE is_blocked = true 
    AND block_expires_at < NOW();
END;
$$;

-- Function to update circuit breaker state
CREATE OR REPLACE FUNCTION public.update_circuit_breaker(
    p_service_name TEXT,
    p_success BOOLEAN,
    p_failure_threshold INTEGER DEFAULT 5,
    p_timeout_seconds INTEGER DEFAULT 30
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_state TEXT;
    current_failures INTEGER;
    last_failure_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current state
    SELECT state, failure_count, last_failure_time
    INTO current_state, current_failures, last_failure_time
    FROM public.circuit_breaker_state
    WHERE service_name = p_service_name;
    
    -- If no record exists, create one
    IF current_state IS NULL THEN
        INSERT INTO public.circuit_breaker_state (service_name, state, failure_count)
        VALUES (p_service_name, 'closed', 0);
        current_state := 'closed';
        current_failures := 0;
    END IF;
    
    -- Update based on success/failure
    IF p_success THEN
        -- Reset failures and close circuit if open
        UPDATE public.circuit_breaker_state
        SET state = 'closed',
            failure_count = 0,
            last_success_time = NOW(),
            updated_at = NOW()
        WHERE service_name = p_service_name;
        
        RETURN 'closed';
    ELSE
        -- Increment failure count
        UPDATE public.circuit_breaker_state
        SET failure_count = failure_count + 1,
            last_failure_time = NOW(),
            updated_at = NOW()
        WHERE service_name = p_service_name;
        
        -- Check if we should open the circuit
        IF current_failures + 1 >= p_failure_threshold THEN
            UPDATE public.circuit_breaker_state
            SET state = 'open',
                opened_at = NOW(),
                updated_at = NOW()
            WHERE service_name = p_service_name;
            
            RETURN 'open';
        END IF;
        
        RETURN 'closed';
    END IF;
END;
$$;

-- Function to check if circuit breaker allows requests
CREATE OR REPLACE FUNCTION public.is_circuit_breaker_open(
    p_service_name TEXT,
    p_timeout_seconds INTEGER DEFAULT 30
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_state TEXT;
    opened_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT state, opened_at
    INTO current_state, opened_at
    FROM public.circuit_breaker_state
    WHERE service_name = p_service_name;
    
    -- If no record or closed, allow requests
    IF current_state IS NULL OR current_state = 'closed' THEN
        RETURN false;
    END IF;
    
    -- If open, check if timeout has passed
    IF current_state = 'open' AND opened_at < NOW() - INTERVAL '1 second' * p_timeout_seconds THEN
        -- Move to half-open state
        UPDATE public.circuit_breaker_state
        SET state = 'half-open',
            updated_at = NOW()
        WHERE service_name = p_service_name;
        
        RETURN false;
    END IF;
    
    -- If still open or half-open, block requests
    RETURN current_state IN ('open', 'half-open');
END;
$$;

-- Function to record performance metrics
CREATE OR REPLACE FUNCTION public.record_performance_metric(
    p_metric_name TEXT,
    p_metric_value DECIMAL(10,4),
    p_metric_unit TEXT DEFAULT 'ms',
    p_metadata JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.performance_metrics (metric_name, metric_value, metric_unit, metadata)
    VALUES (p_metric_name, p_metric_value, p_metric_unit, p_metadata);
END;
$$;

-- Function to get system health status
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS TABLE (
    service_name TEXT,
    status TEXT,
    response_time_ms INTEGER,
    error_rate DECIMAL(5,2),
    last_check TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sh.service_name,
        sh.status,
        sh.response_time_ms,
        sh.error_rate,
        sh.last_check
    FROM public.system_health sh
    ORDER BY sh.last_check DESC;
END;
$$;

-- ============================================================================
-- STEP 4: CREATE AUTOMATED CLEANUP TRIGGERS
-- ============================================================================

-- Function to automatically clean up old data
CREATE OR REPLACE FUNCTION public.auto_cleanup_performance_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Clean up old performance metrics (keep last 7 days)
    DELETE FROM public.performance_metrics 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Clean up old rate limit records (keep last 24 hours)
    DELETE FROM public.rate_limit_tracking 
    WHERE created_at < NOW() - INTERVAL '24 hours';
    
    -- Clean up old system health records (keep last 3 days)
    DELETE FROM public.system_health 
    WHERE created_at < NOW() - INTERVAL '3 days';
    
    -- Clean up old analytics events (keep last 30 days)
    DELETE FROM public.analytics_events 
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$;

-- ============================================================================
-- STEP 5: CREATE ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_breaker_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- Performance metrics policies (admin only)
CREATE POLICY "Only admins can view performance metrics" ON public.performance_metrics
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can insert performance metrics" ON public.performance_metrics
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Rate limiting policies (service only)
CREATE POLICY "Service can manage rate limits" ON public.rate_limit_tracking
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'service'));

-- Circuit breaker policies (service only)
CREATE POLICY "Service can manage circuit breakers" ON public.circuit_breaker_state
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'service'));

-- System health policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view system health" ON public.system_health
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service can update system health" ON public.system_health
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'service'));

-- ============================================================================
-- STEP 6: CREATE SCHEDULED JOBS (using pg_cron if available)
-- ============================================================================

-- Note: These will only work if pg_cron extension is enabled
-- Uncomment if pg_cron is available in your Supabase instance

-- Schedule cleanup job to run every hour
-- SELECT cron.schedule('cleanup-performance-data', '0 * * * *', 'SELECT public.auto_cleanup_performance_data();');

-- Schedule rate limit cleanup to run every 15 minutes
-- SELECT cron.schedule('cleanup-rate-limits', '*/15 * * * *', 'SELECT public.cleanup_rate_limits();');

-- ============================================================================
-- STEP 7: CREATE PERFORMANCE VIEWS
-- ============================================================================

-- View for real-time performance metrics
CREATE OR REPLACE VIEW public.performance_dashboard AS
SELECT 
    metric_name,
    AVG(metric_value) as avg_value,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    COUNT(*) as sample_count,
    DATE_TRUNC('minute', timestamp) as time_bucket
FROM public.performance_metrics
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY metric_name, DATE_TRUNC('minute', timestamp)
ORDER BY time_bucket DESC;

-- View for active rate limits
CREATE OR REPLACE VIEW public.active_rate_limits AS
SELECT 
    ip_address,
    endpoint,
    request_count,
    window_start,
    last_request,
    is_blocked,
    block_expires_at
FROM public.rate_limit_tracking
WHERE window_start > NOW() - INTERVAL '1 hour'
ORDER BY request_count DESC;

-- View for circuit breaker status
CREATE OR REPLACE VIEW public.circuit_breaker_status AS
SELECT 
    service_name,
    state,
    failure_count,
    last_failure_time,
    last_success_time,
    opened_at,
    CASE 
        WHEN state = 'open' AND opened_at < NOW() - INTERVAL '30 seconds' THEN 'ready_for_half_open'
        WHEN state = 'half-open' THEN 'testing'
        ELSE 'normal'
    END as status_description
FROM public.circuit_breaker_state
ORDER BY service_name;

-- ============================================================================
-- STEP 8: GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions for service role
GRANT ALL ON public.performance_metrics TO service_role;
GRANT ALL ON public.rate_limit_tracking TO service_role;
GRANT ALL ON public.circuit_breaker_state TO service_role;
GRANT ALL ON public.system_health TO service_role;

-- Grant read permissions for authenticated users
GRANT SELECT ON public.performance_dashboard TO authenticated;
GRANT SELECT ON public.active_rate_limits TO authenticated;
GRANT SELECT ON public.circuit_breaker_status TO authenticated;
GRANT SELECT ON public.system_health TO authenticated;

-- Grant execute permissions for functions
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limits() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_circuit_breaker(TEXT, BOOLEAN, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_circuit_breaker_open(TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_performance_metric(TEXT, DECIMAL(10,4), TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_system_health() TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_cleanup_performance_data() TO service_role;

-- ============================================================================
-- STEP 9: INSERT INITIAL DATA
-- ============================================================================

-- Insert initial circuit breaker states for key services
INSERT INTO public.circuit_breaker_state (service_name, state, failure_count)
VALUES 
    ('stripe-api', 'closed', 0),
    ('email-service', 'closed', 0),
    ('analytics-service', 'closed', 0),
    ('inventory-service', 'closed', 0)
ON CONFLICT (service_name) DO NOTHING;

-- Insert initial system health records
INSERT INTO public.system_health (service_name, status, response_time_ms, error_rate)
VALUES 
    ('database', 'healthy', 50, 0.0),
    ('api', 'healthy', 200, 0.0),
    ('stripe', 'healthy', 500, 0.0),
    ('email', 'healthy', 1000, 0.0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Performance and Scalability Optimizations Migration Completed Successfully!';
    RAISE NOTICE 'Added: Performance monitoring tables, indexes, functions, and automated cleanup';
    RAISE NOTICE 'Created: Circuit breaker system, rate limiting, and health monitoring';
    RAISE NOTICE 'Optimized: Database performance with strategic indexes';
END $$;
