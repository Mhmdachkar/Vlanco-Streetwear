-- Performance and Scalability Optimizations for VLANCO Streetwear
-- This migration adds monitoring, rate limiting, and performance optimizations
-- Created: 2025-01-27
-- Version: 4.0.0 - Performance & Scalability Enhancements

-- ============================================================================
-- PERFORMANCE MONITORING TABLES
-- ============================================================================

-- Performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit TEXT DEFAULT 'ms',
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Circuit breaker state table
CREATE TABLE IF NOT EXISTS public.circuit_breaker_state (
    service_name TEXT PRIMARY KEY,
    state TEXT DEFAULT 'closed' CHECK (state IN ('closed', 'open', 'half-open')),
    failure_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    last_failure_time TIMESTAMP WITH TIME ZONE,
    last_success_time TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System health monitoring table
CREATE TABLE IF NOT EXISTS public.system_health (
    service_name TEXT PRIMARY KEY,
    status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    response_time_ms INTEGER DEFAULT 0,
    error_rate DECIMAL(5,2) DEFAULT 0,
    last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES (CONDITIONAL)
-- ============================================================================

-- Add indexes to existing tables for common query patterns
-- Note: Only create indexes if the referenced columns exist
DO $$
BEGIN
    -- Products table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') THEN
        CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_featured') THEN
        CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (is_featured);
    END IF;
    
    -- Product variants table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'product_id') THEN
        CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants (product_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'sku') THEN
        CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants (sku);
    END IF;
    
    -- Orders table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
    END IF;
    
    -- Order items table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'order_id') THEN
        CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'product_id') THEN
        CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);
    END IF;
    
    -- Cart items table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items (user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'product_id') THEN
        CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items (product_id);
    END IF;
    
    -- Wishlist items table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishlist_items' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items (user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishlist_items' AND column_name = 'product_id') THEN
        CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items (product_id);
    END IF;
    
    -- Reviews table indexes (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'product_id') THEN
            CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'user_id') THEN
            CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews (user_id);
        END IF;
    END IF;
    
    -- Users table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
        CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
        CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);
    END IF;
    
    -- Analytics events table indexes (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_events') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_events' AND column_name = 'timestamp') THEN
            CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events (timestamp DESC);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_events' AND column_name = 'event_type') THEN
            CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events (event_type);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_events' AND column_name = 'user_id') THEN
            CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events (user_id);
        END IF;
    END IF;
END $$;

-- ============================================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- ============================================================================

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_ip_address INET,
    p_endpoint TEXT,
    p_max_requests INTEGER DEFAULT 100,
    p_window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate window start time
    window_start := NOW() - INTERVAL '1 minute' * p_window_minutes;
    
    -- Get current request count for this IP and endpoint
    SELECT COALESCE(SUM(request_count), 0)
    INTO current_count
    FROM public.rate_limit_tracking
    WHERE ip_address = p_ip_address
    AND endpoint = p_endpoint
    AND window_start >= window_start;
    
    -- Check if limit exceeded
    IF current_count >= p_max_requests THEN
        -- Record blocked request
        INSERT INTO public.rate_limit_tracking (ip_address, endpoint, request_count, is_blocked, block_expires_at)
        VALUES (p_ip_address, p_endpoint, 1, true, NOW() + INTERVAL '5 minutes')
        ON CONFLICT DO NOTHING;
        
        RETURN false;
    END IF;
    
    -- Record successful request
    INSERT INTO public.rate_limit_tracking (ip_address, endpoint, request_count)
    VALUES (p_ip_address, p_endpoint, 1)
    ON CONFLICT (ip_address, endpoint, window_start) 
    DO UPDATE SET 
        request_count = rate_limit_tracking.request_count + 1,
        last_request = NOW();
    
    RETURN true;
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

-- Function to update circuit breaker state
CREATE OR REPLACE FUNCTION public.update_circuit_breaker(
    p_service_name TEXT,
    p_is_success BOOLEAN,
    p_failure_threshold INTEGER DEFAULT 5
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_is_success THEN
        -- Reset circuit breaker on success
        INSERT INTO public.circuit_breaker_state (service_name, state, success_count, last_success_time, updated_at)
        VALUES (p_service_name, 'closed', 1, NOW(), NOW())
        ON CONFLICT (service_name) DO UPDATE SET
            state = 'closed',
            failure_count = 0,
            success_count = circuit_breaker_state.success_count + 1,
            last_success_time = NOW(),
            updated_at = NOW();
    ELSE
        -- Increment failure count
        INSERT INTO public.circuit_breaker_state (service_name, state, failure_count, last_failure_time, updated_at)
        VALUES (p_service_name, 'closed', 1, NOW(), NOW())
        ON CONFLICT (service_name) DO UPDATE SET
            failure_count = circuit_breaker_state.failure_count + 1,
            last_failure_time = NOW(),
            updated_at = NOW();
        
        -- Open circuit breaker if threshold exceeded
        UPDATE public.circuit_breaker_state
        SET state = 'open',
            opened_at = NOW(),
            updated_at = NOW()
        WHERE service_name = p_service_name
        AND failure_count >= p_failure_threshold;
    END IF;
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

-- Function to get performance summary
CREATE OR REPLACE FUNCTION public.get_performance_summary()
RETURNS TABLE (
    metric_name TEXT,
    avg_value DECIMAL(10,4),
    max_value DECIMAL(10,4),
    min_value DECIMAL(10,4),
    sample_count BIGINT,
    last_reading TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.metric_name,
        AVG(pm.metric_value) as avg_value,
        MAX(pm.metric_value) as max_value,
        MIN(pm.metric_value) as min_value,
        COUNT(*) as sample_count,
        MAX(pm.timestamp) as last_reading
    FROM public.performance_metrics pm
    WHERE pm.timestamp > NOW() - INTERVAL '1 hour'
    GROUP BY pm.metric_name
    ORDER BY last_reading DESC;
END;
$$;

-- Function to clean up old performance data
CREATE OR REPLACE FUNCTION public.cleanup_old_performance_data()
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
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_breaker_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- Policies for performance_metrics
CREATE POLICY "Enable read access for authenticated users" ON public.performance_metrics
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for service role" ON public.performance_metrics
FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policies for rate_limit_tracking
CREATE POLICY "Enable read access for service role" ON public.rate_limit_tracking
FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Enable insert for service role" ON public.rate_limit_tracking
FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policies for circuit_breaker_state
CREATE POLICY "Enable read access for authenticated users" ON public.circuit_breaker_state
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for service role" ON public.circuit_breaker_state
FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for service role" ON public.circuit_breaker_state
FOR UPDATE USING (auth.role() = 'service_role');

-- Policies for system_health
CREATE POLICY "Enable read access for authenticated users" ON public.system_health
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for service role" ON public.system_health
FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for service role" ON public.system_health
FOR UPDATE USING (auth.role() = 'service_role');

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions for functions
GRANT EXECUTE ON FUNCTION public.check_rate_limit(INET, TEXT, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_circuit_breaker_open(TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_performance_metric(TEXT, DECIMAL, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_circuit_breaker(TEXT, BOOLEAN, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_system_health() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_performance_summary() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_performance_data() TO service_role;

-- Grant read permissions for authenticated users
GRANT EXECUTE ON FUNCTION public.get_system_health() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_performance_summary() TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Performance and Scalability Migration Completed Successfully!';
    RAISE NOTICE 'Added: Performance monitoring, rate limiting, circuit breakers, and system health tracking';
    RAISE NOTICE 'Created: Strategic indexes for faster queries and better performance';
    RAISE NOTICE 'Enabled: Row Level Security policies for data protection';
END $$;
