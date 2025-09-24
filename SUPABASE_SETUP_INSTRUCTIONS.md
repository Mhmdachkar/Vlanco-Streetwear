# Supabase Performance & Scalability Setup Instructions

## 📋 Manual Setup Steps

### 1. Apply Database Migrations

Run these SQL commands in your Supabase Studio SQL Editor:

```sql
-- First, apply the main performance migration
-- Copy and paste the contents of: supabase/migrations/20250127000000-performance-scalability-optimizations.sql

-- Then apply additional functions
-- Copy and paste the contents of: supabase/migrations/20250127000001-additional-performance-functions.sql
```

### 2. Add Environment Variables

Go to **Supabase Dashboard → Settings → Environment Variables** and add:

```
# Performance Monitoring
PERFORMANCE_THRESHOLD_PAGE_LOAD=3000
PERFORMANCE_THRESHOLD_API_RESPONSE=2000
PERFORMANCE_THRESHOLD_MEMORY_USAGE=80
PERFORMANCE_THRESHOLD_ERROR_RATE=5

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS_PER_MINUTE=1000
RATE_LIMIT_MAX_REQUESTS_PER_HOUR=10000
RATE_LIMIT_MAX_CONCURRENT_USERS=5000

# Circuit Breaker
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=30000

# Database Performance
DB_POOL_SIZE=25
DB_MAX_CONNECTIONS=100
DB_CONNECTION_TIMEOUT=10000
```

### 3. Update Supabase Config

Your `supabase/config.toml` should already be updated with:

```toml
[db.pooler]
max_client_conn = 200
default_pool_size = 25
max_db_connections = 100

[api]
max_rows = 2000
```

### 4. Test Performance Monitoring

Run these queries in Supabase Studio SQL Editor:

```sql
-- Test system health
SELECT * FROM public.get_system_health();

-- Test performance summary
SELECT * FROM public.get_performance_summary();

-- Test alerts
SELECT * FROM public.check_performance_alerts();

-- Test circuit breaker status
SELECT * FROM public.circuit_breaker_status;
```

### 5. Set Up Monitoring Dashboard

Use the queries from `monitoring_dashboard.sql` to create a monitoring dashboard in Supabase Studio.

### 6. Configure Alerting (Optional)

#### Slack Integration:
1. Create a Slack webhook URL
2. Add to environment variables: `SLACK_WEBHOOK_URL=your_webhook_url`
3. Set up automated alerts using the `check_performance_alerts()` function

#### Email Integration:
1. Add email recipients: `ALERT_EMAIL_RECIPIENTS=admin@vlanco.com,support@vlanco.com`
2. Configure email service in your Supabase project

### 7. Enable Automated Cleanup

Run this SQL to set up automated cleanup (if pg_cron is available):

```sql
-- Schedule cleanup job to run every hour
SELECT cron.schedule('cleanup-performance-data', '0 * * * *', 'SELECT public.cleanup_old_performance_data();');

-- Schedule optimization job to run daily
SELECT cron.schedule('optimize-database', '0 2 * * *', 'SELECT public.optimize_database();');

-- Schedule performance monitoring every 5 minutes
SELECT cron.schedule('monitor-performance', '*/5 * * * *', 'SELECT public.monitor_database_performance(); SELECT public.monitor_api_performance();');
```

### 8. Verify Setup

Run this verification query:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'performance_metrics',
    'rate_limit_tracking', 
    'circuit_breaker_state',
    'system_health',
    'performance_summary'
);

-- Check if all functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'monitor_database_performance',
    'monitor_api_performance',
    'get_performance_summary',
    'cleanup_old_performance_data',
    'optimize_database',
    'check_performance_alerts'
);
```

## 🚀 Performance Features Enabled

✅ **Database Connection Pooling**: 25 connections, max 200 clients  
✅ **Performance Metrics Tracking**: Real-time monitoring  
✅ **Circuit Breaker System**: Automatic failure detection  
✅ **Rate Limiting Protection**: IP-based throttling  
✅ **Automated Cleanup**: Prevents database bloat  
✅ **Health Monitoring**: Real-time system status  
✅ **Performance Alerting**: Automated notifications  
✅ **Query Optimization**: Strategic indexes for speed  

## 📊 Monitoring Dashboard

Access your monitoring dashboard using the queries in `monitoring_dashboard.sql`:

1. **System Health Overview**: Current status of all services
2. **Performance Metrics**: Response times, error rates, memory usage
3. **Circuit Breaker Status**: Service availability and failure counts
4. **Active Rate Limits**: Current IP-based restrictions
5. **Performance Alerts**: Active warnings and critical issues
6. **Database Performance**: Connection usage and query performance

## 🔧 Maintenance Tasks

### Daily Tasks:
- Check performance alerts
- Review system health status
- Monitor error rates

### Weekly Tasks:
- Review performance trends
- Optimize slow queries
- Clean up old data

### Monthly Tasks:
- Analyze performance patterns
- Update monitoring thresholds
- Review capacity planning

## 🆘 Troubleshooting

### Common Issues:

1. **Migration Fails**: Check if tables already exist, drop conflicting objects first
2. **Functions Not Working**: Ensure proper permissions are granted
3. **Performance Issues**: Check connection pool settings and indexes
4. **Alerts Not Working**: Verify environment variables are set correctly

### Support:
- Check Supabase logs for detailed error messages
- Use the monitoring dashboard to identify issues
- Review the performance metrics for trends

## ✅ Success Indicators

Your setup is successful when:

- ✅ All migration queries run without errors
- ✅ Performance monitoring tables are created
- ✅ Functions return data when called
- ✅ Circuit breakers are in 'closed' state
- ✅ System health shows 'healthy' status
- ✅ Monitoring dashboard displays real-time data

## 🎯 Next Steps

1. **Test the system** with high traffic scenarios
2. **Set up external monitoring** tools (optional)
3. **Configure alerting** for critical issues
4. **Train your team** on the monitoring dashboard
5. **Schedule regular maintenance** tasks

Your Supabase instance is now enterprise-ready for high-traffic scenarios! 🚀
