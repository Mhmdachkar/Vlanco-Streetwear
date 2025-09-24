// Performance monitoring and alerting configuration
// This file should be deployed alongside your application

export const MONITORING_CONFIG = {
  // Performance thresholds
  PERFORMANCE_THRESHOLDS: {
    PAGE_LOAD_TIME: 3000, // 3 seconds
    API_RESPONSE_TIME: 2000, // 2 seconds
    MEMORY_USAGE_PERCENTAGE: 80, // 80%
    ERROR_RATE_PERCENTAGE: 5, // 5%
    SLOW_REQUEST_PERCENTAGE: 10 // 10%
  },

  // Alerting configuration
  ALERTING: {
    ENABLED: true,
    WEBHOOK_URL: process.env.ALERT_WEBHOOK_URL,
    EMAIL_RECIPIENTS: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
    SLACK_WEBHOOK: process.env.SLACK_WEBHOOK_URL,
    
    // Alert thresholds
    CRITICAL_ERROR_RATE: 10, // 10% error rate triggers critical alert
    HIGH_MEMORY_USAGE: 90, // 90% memory usage triggers alert
    SLOW_RESPONSE_TIME: 5000, // 5 seconds triggers alert
  },

  // Monitoring intervals
  INTERVALS: {
    METRICS_COLLECTION: 30000, // 30 seconds
    HEALTH_CHECK: 60000, // 1 minute
    ALERT_CHECK: 120000, // 2 minutes
    CLEANUP: 300000 // 5 minutes
  },

  // Rate limiting for monitoring
  RATE_LIMITS: {
    MAX_REQUESTS_PER_MINUTE: 1000,
    MAX_REQUESTS_PER_HOUR: 10000,
    MAX_CONCURRENT_USERS: 5000,
    MAX_CHECKOUT_ATTEMPTS_PER_MINUTE: 10
  }
};

// Health check endpoint data
export const HEALTH_CHECK_CONFIG = {
  ENDPOINTS: [
    {
      name: 'main-app',
      url: '/',
      timeout: 5000,
      expectedStatus: 200
    },
    {
      name: 'api-health',
      url: '/api/health',
      timeout: 3000,
      expectedStatus: 200
    },
    {
      name: 'database',
      url: '/api/db-health',
      timeout: 5000,
      expectedStatus: 200
    },
    {
      name: 'stripe',
      url: '/api/stripe-health',
      timeout: 10000,
      expectedStatus: 200
    }
  ],

  // Health check intervals
  CHECK_INTERVAL: 30000, // 30 seconds
  
  // Failure thresholds
  FAILURE_THRESHOLD: 3, // 3 consecutive failures
  RECOVERY_THRESHOLD: 2 // 2 consecutive successes to recover
};

// Database optimization settings
export const DATABASE_CONFIG = {
  // Connection pooling
  CONNECTION_POOL: {
    MIN_CONNECTIONS: 5,
    MAX_CONNECTIONS: 20,
    IDLE_TIMEOUT: 30000, // 30 seconds
    CONNECTION_TIMEOUT: 10000 // 10 seconds
  },

  // Query optimization
  QUERY_OPTIMIZATION: {
    MAX_QUERY_TIME: 5000, // 5 seconds
    SLOW_QUERY_THRESHOLD: 1000, // 1 second
    MAX_RESULT_SIZE: 1000,
    CACHE_QUERY_RESULTS: true,
    QUERY_CACHE_TTL: 300000 // 5 minutes
  },

  // Indexing recommendations
  RECOMMENDED_INDEXES: [
    'users(email)',
    'products(category, price)',
    'orders(user_id, created_at)',
    'cart_items(user_id, product_id)',
    'wishlist_items(user_id, product_id)'
  ]
};

// CDN and caching configuration
export const CDN_CONFIG = {
  // Static asset caching
  STATIC_ASSETS: {
    CSS: { maxAge: 31536000, immutable: true }, // 1 year
    JS: { maxAge: 31536000, immutable: true }, // 1 year
    IMAGES: { maxAge: 2592000 }, // 30 days
    FONTS: { maxAge: 31536000, immutable: true } // 1 year
  },

  // API response caching
  API_CACHING: {
    PRODUCT_LIST: { maxAge: 300 }, // 5 minutes
    PRODUCT_DETAIL: { maxAge: 600 }, // 10 minutes
    USER_PROFILE: { maxAge: 60 }, // 1 minute
    CART_DATA: { maxAge: 30 } // 30 seconds
  },

  // Cache invalidation
  CACHE_INVALIDATION: {
    ON_PRODUCT_UPDATE: true,
    ON_USER_UPDATE: true,
    ON_ORDER_CREATE: true,
    MANUAL_INVALIDATION_ENABLED: true
  }
};

// Load balancing and scaling configuration
export const SCALING_CONFIG = {
  // Auto-scaling triggers
  AUTO_SCALE_TRIGGERS: {
    CPU_THRESHOLD: 70, // 70% CPU usage
    MEMORY_THRESHOLD: 80, // 80% memory usage
    REQUEST_RATE_THRESHOLD: 1000, // 1000 requests per minute
    RESPONSE_TIME_THRESHOLD: 2000 // 2 seconds average response time
  },

  // Scaling limits
  SCALING_LIMITS: {
    MIN_INSTANCES: 2,
    MAX_INSTANCES: 20,
    SCALE_UP_COOLDOWN: 300000, // 5 minutes
    SCALE_DOWN_COOLDOWN: 600000 // 10 minutes
  },

  // Load balancing strategy
  LOAD_BALANCING: {
    STRATEGY: 'round_robin', // or 'least_connections', 'ip_hash'
    HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
    FAILURE_THRESHOLD: 3,
    RECOVERY_THRESHOLD: 2
  }
};

// Security configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITING: {
    ENABLED: true,
    WINDOW_SIZE: 60000, // 1 minute
    MAX_REQUESTS_PER_WINDOW: 100,
    MAX_REQUESTS_PER_IP: 50,
    BLOCK_DURATION: 300000 // 5 minutes
  },

  // DDoS protection
  DDOS_PROTECTION: {
    ENABLED: true,
    REQUEST_THRESHOLD: 1000, // 1000 requests per minute
    BURST_THRESHOLD: 100, // 100 requests in 10 seconds
    BLOCK_DURATION: 600000 // 10 minutes
  },

  // Input validation
  INPUT_VALIDATION: {
    MAX_REQUEST_SIZE: 1048576, // 1MB
    MAX_STRING_LENGTH: 10000,
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_FILE_SIZE: 5242880 // 5MB
  }
};

// Monitoring dashboard configuration
export const DASHBOARD_CONFIG = {
  // Key metrics to display
  KEY_METRICS: [
    'active_users',
    'requests_per_minute',
    'average_response_time',
    'error_rate',
    'memory_usage',
    'cpu_usage',
    'database_connections',
    'cache_hit_rate'
  ],

  // Alert channels
  ALERT_CHANNELS: [
    'email',
    'slack',
    'webhook',
    'sms' // if configured
  ],

  // Dashboard refresh interval
  REFRESH_INTERVAL: 30000, // 30 seconds

  // Historical data retention
  DATA_RETENTION: {
    REAL_TIME: 3600000, // 1 hour
    HOURLY: 2592000000, // 30 days
    DAILY: 31536000000 // 1 year
  }
};

// Export all configurations
export default {
  MONITORING_CONFIG,
  HEALTH_CHECK_CONFIG,
  DATABASE_CONFIG,
  CDN_CONFIG,
  SCALING_CONFIG,
  SECURITY_CONFIG,
  DASHBOARD_CONFIG
};
