-- Additional Performance Functions for VLANCO Streetwear
-- This migration adds monitoring and maintenance functions
-- Created: 2025-01-27
-- Version: 4.0.1 - Additional Performance Functions

-- ============================================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- ============================================================================

-- Drop existing functions if they exist (to avoid return type conflicts)
DROP FUNCTION IF EXISTS public.monitor_database_performance();
DROP FUNCTION IF EXISTS public.monitor_api_performance();
DROP FUNCTION IF EXISTS public.optimize_database();
DROP FUNCTION IF EXISTS public.check_performance_alerts();

-- Function to monitor database performance
CREATE OR REPLACE FUNCTION public.monitor_database_performance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    active_connections INTEGER;
    max_connections INTEGER;
    connection_usage DECIMAL(5,2);
BEGIN
    -- Get connection statistics
    SELECT 
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
        (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections')
    INTO active_connections, max_connections;
    
    connection_usage := (active_connections::DECIMAL / max_connections::DECIMAL) * 100;
    
    -- Record performance metric
    PERFORM public.record_performance_metric(
        'database_connections',
        connection_usage,
        'percent',
        jsonb_build_object(
            'active_connections', active_connections,
            'max_connections', max_connections
        )
    );
    
    -- Record slow query count (if pg_stat_statements is available)
    BEGIN
        PERFORM public.record_performance_metric(
            'slow_queries',
            (SELECT count(*) FROM pg_stat_statements WHERE mean_exec_time > 1000),
            'count',
            '{}'::jsonb
        );
    EXCEPTION
        WHEN undefined_table THEN
            -- pg_stat_statements not available, skip
            NULL;
    END;
END;
$$;

-- Function to monitor API performance
CREATE OR REPLACE FUNCTION public.monitor_api_performance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    avg_response_time DECIMAL(10,2);
    error_count INTEGER;
    total_requests INTEGER;
    error_rate DECIMAL(5,2);
BEGIN
    -- Calculate average response time from analytics events
    SELECT 
        AVG(CASE WHEN metadata->>'response_time' IS NOT NULL 
            THEN (metadata->>'response_time')::DECIMAL 
            ELSE NULL END),
        COUNT(CASE WHEN event_type = 'api_error' THEN 1 END),
        COUNT(*)
    INTO avg_response_time, error_count, total_requests
    FROM public.analytics_events
    WHERE timestamp > NOW() - INTERVAL '5 minutes';
    
    -- Calculate error rate
    IF total_requests > 0 THEN
        error_rate := (error_count::DECIMAL / total_requests::DECIMAL) * 100;
    ELSE
        error_rate := 0;
    END IF;
    
    -- Record metrics
    IF avg_response_time IS NOT NULL THEN
        PERFORM public.record_performance_metric(
            'api_response_time',
            avg_response_time,
            'ms',
            jsonb_build_object(
                'error_count', error_count,
                'total_requests', total_requests,
                'error_rate', error_rate
            )
        );
    END IF;
    
    -- Update system health
    INSERT INTO public.system_health (service_name, status, response_time_ms, error_rate)
    VALUES ('api', 
            CASE 
                WHEN error_rate > 5 THEN 'unhealthy'
                WHEN avg_response_time > 2000 THEN 'degraded'
                ELSE 'healthy'
            END,
            COALESCE(avg_response_time::INTEGER, 0),
            error_rate)
    ON CONFLICT (service_name) DO UPDATE SET
        status = EXCLUDED.status,
        response_time_ms = EXCLUDED.response_time_ms,
        error_rate = EXCLUDED.error_rate,
        last_check = NOW();
END;
$$;

-- Drop existing function if it exists (to avoid return type conflicts)
DROP FUNCTION IF EXISTS public.get_performance_summary();

-- Function to get system performance summary
CREATE OR REPLACE FUNCTION public.get_performance_summary()
RETURNS TABLE (
    metric_name TEXT,
    current_value DECIMAL(10,4),
    avg_value DECIMAL(10,4),
    max_value DECIMAL(10,4),
    min_value DECIMAL(10,4),
    sample_count BIGINT,
    last_updated TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.metric_name,
        pm.metric_value as current_value,
        AVG(pm.metric_value) OVER (PARTITION BY pm.metric_name) as avg_value,
        MAX(pm.metric_value) OVER (PARTITION BY pm.metric_name) as max_value,
        MIN(pm.metric_value) OVER (PARTITION BY pm.metric_name) as min_value,
        COUNT(*) OVER (PARTITION BY pm.metric_name) as sample_count,
        MAX(pm.timestamp) OVER (PARTITION BY pm.metric_name) as last_updated
    FROM public.performance_metrics pm
    WHERE pm.timestamp > NOW() - INTERVAL '1 hour'
    ORDER BY pm.metric_name, pm.timestamp DESC;
END;
$$;

-- ============================================================================
-- MAINTENANCE FUNCTIONS
-- ============================================================================

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
    
    -- Clean up old analytics events (keep last 30 days)
    DELETE FROM public.analytics_events 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Log cleanup activity
    INSERT INTO public.performance_metrics (metric_name, metric_value, metric_unit, metadata)
    VALUES ('cleanup_completed', 1, 'count', jsonb_build_object('timestamp', NOW()));
END;
$$;

-- Function to optimize database
CREATE OR REPLACE FUNCTION public.optimize_database()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update table statistics
    ANALYZE public.users;
    ANALYZE public.products;
    ANALYZE public.orders;
    ANALYZE public.cart_items;
    ANALYZE public.wishlist_items;
    ANALYZE public.reviews;
    ANALYZE public.analytics_events;
    
    -- Refresh materialized views if they exist
    BEGIN
        REFRESH MATERIALIZED VIEW public.performance_summary;
    EXCEPTION
        WHEN undefined_table THEN
            -- Materialized view doesn't exist yet, skip
            NULL;
    END;
    
    -- Log optimization activity
    INSERT INTO public.performance_metrics (metric_name, metric_value, metric_unit, metadata)
    VALUES ('database_optimized', 1, 'count', jsonb_build_object('timestamp', NOW()));
END;
$$;

-- ============================================================================
-- ALERTING FUNCTIONS
-- ============================================================================

-- Function to check for performance alerts
CREATE OR REPLACE FUNCTION public.check_performance_alerts()
RETURNS TABLE (
    alert_type TEXT,
    alert_message TEXT,
    severity TEXT,
    metric_value DECIMAL(10,4),
    threshold DECIMAL(10,4),
    service_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    -- High error rate alert
    SELECT 
        'high_error_rate'::TEXT,
        'API error rate is above threshold'::TEXT,
        'critical'::TEXT,
        sh.error_rate,
        5.0::DECIMAL(10,4),
        sh.service_name
    FROM public.system_health sh
    WHERE sh.service_name = 'api' 
    AND sh.error_rate > 5.0
    AND sh.last_check > NOW() - INTERVAL '5 minutes'
    
    UNION ALL
    
    -- Slow response time alert
    SELECT 
        'slow_response_time'::TEXT,
        'API response time is above threshold'::TEXT,
        'warning'::TEXT,
        sh.response_time_ms::DECIMAL(10,4),
        2000.0::DECIMAL(10,4),
        sh.service_name
    FROM public.system_health sh
    WHERE sh.service_name = 'api' 
    AND sh.response_time_ms > 2000
    AND sh.last_check > NOW() - INTERVAL '5 minutes'
    
    UNION ALL
    
    -- High memory usage alert
    SELECT 
        'high_memory_usage'::TEXT,
        'Database memory usage is high'::TEXT,
        'warning'::TEXT,
        pm.metric_value,
        80.0::DECIMAL(10,4),
        'database'::TEXT
    FROM public.performance_metrics pm
    WHERE pm.metric_name = 'database_connections'
    AND pm.metric_value > 80.0
    AND pm.timestamp > NOW() - INTERVAL '5 minutes'
    
    UNION ALL
    
    -- Circuit breaker open alert
    SELECT 
        'circuit_breaker_open'::TEXT,
        'Circuit breaker is open for service'::TEXT,
        'critical'::TEXT,
        cbs.failure_count::DECIMAL(10,4),
        5.0::DECIMAL(10,4),
        cbs.service_name
    FROM public.circuit_breaker_state cbs
    WHERE cbs.state = 'open'
    AND cbs.opened_at > NOW() - INTERVAL '1 hour';
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions for functions
GRANT EXECUTE ON FUNCTION public.monitor_database_performance() TO service_role;
GRANT EXECUTE ON FUNCTION public.monitor_api_performance() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_performance_summary() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_performance_data() TO service_role;
GRANT EXECUTE ON FUNCTION public.optimize_database() TO service_role;
GRANT EXECUTE ON FUNCTION public.check_performance_alerts() TO service_role;

-- Grant read permissions for authenticated users
GRANT EXECUTE ON FUNCTION public.get_performance_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_performance_alerts() TO authenticated;

-- ============================================================================
-- CREATE MATERIALIZED VIEW FOR PERFORMANCE DASHBOARD
-- ============================================================================

-- Create materialized view for dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS public.performance_summary AS
SELECT 
    DATE_TRUNC('minute', timestamp) as time_bucket,
    metric_name,
    AVG(metric_value) as avg_value,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    COUNT(*) as sample_count
FROM public.performance_metrics
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('minute', timestamp), metric_name
ORDER BY time_bucket DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_performance_summary_time_metric 
ON public.performance_summary (time_bucket, metric_name);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION public.refresh_performance_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.performance_summary;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_performance_summary() TO service_role;
GRANT SELECT ON public.performance_summary TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Additional Performance Functions Migration Completed Successfully!';
    RAISE NOTICE 'Added: Monitoring functions, maintenance routines, and alerting system';
    RAISE NOTICE 'Created: Performance summary materialized view and optimization functions';
END $$;
