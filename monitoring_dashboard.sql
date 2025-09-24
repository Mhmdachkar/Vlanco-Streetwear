-- Performance Monitoring Dashboard Queries
-- Use these in Supabase Studio SQL Editor for monitoring

-- 1. Current System Health Overview
SELECT 
    service_name,
    status,
    response_time_ms,
    error_rate,
    last_check,
    CASE 
        WHEN last_check < NOW() - INTERVAL '5 minutes' THEN 'stale'
        ELSE 'current'
    END as data_freshness
FROM public.system_health
ORDER BY last_check DESC;

-- 2. Recent Performance Metrics
SELECT 
    metric_name,
    AVG(metric_value) as avg_value,
    MAX(metric_value) as max_value,
    MIN(metric_value) as min_value,
    COUNT(*) as sample_count,
    MAX(timestamp) as latest_reading
FROM public.performance_metrics
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY metric_name
ORDER BY latest_reading DESC;

-- 3. Circuit Breaker Status
SELECT 
    service_name,
    state,
    failure_count,
    last_failure_time,
    last_success_time,
    CASE 
        WHEN state = 'open' AND opened_at < NOW() - INTERVAL '30 seconds' THEN 'ready_for_half_open'
        WHEN state = 'half-open' THEN 'testing'
        ELSE 'normal'
    END as status_description
FROM public.circuit_breaker_state
ORDER BY service_name;

-- 4. Active Rate Limits
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

-- 5. Performance Alerts
SELECT * FROM public.check_performance_alerts();

-- 6. Database Performance Summary
SELECT * FROM public.performance_summary
WHERE time_bucket > NOW() - INTERVAL '1 hour'
ORDER BY time_bucket DESC, metric_name;

-- 7. Top Slow Queries (if pg_stat_statements is enabled)
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE mean_time > 1000
ORDER BY mean_time DESC
LIMIT 10;

-- 8. Database Connection Usage
SELECT 
    state,
    COUNT(*) as connection_count,
    ROUND(COUNT(*) * 100.0 / (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections'), 2) as percentage
FROM pg_stat_activity 
GROUP BY state
ORDER BY connection_count DESC;

-- 9. Recent Errors by Type
SELECT 
    event_type,
    COUNT(*) as error_count,
    MAX(timestamp) as last_error
FROM public.analytics_events
WHERE event_type LIKE '%error%'
AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY event_type
ORDER BY error_count DESC;

-- 10. System Load Summary
SELECT 
    'Database Connections' as metric,
    COUNT(*) as current_value,
    (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections') as max_value,
    ROUND(COUNT(*) * 100.0 / (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections'), 2) as percentage
FROM pg_stat_activity
UNION ALL
SELECT 
    'Active Queries' as metric,
    COUNT(*) as current_value,
    NULL as max_value,
    NULL as percentage
FROM pg_stat_activity 
WHERE state = 'active'
UNION ALL
SELECT 
    'Idle Connections' as metric,
    COUNT(*) as current_value,
    NULL as max_value,
    NULL as percentage
FROM pg_stat_activity 
WHERE state = 'idle';
