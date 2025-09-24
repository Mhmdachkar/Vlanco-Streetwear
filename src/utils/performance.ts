// Performance and scalability utilities for handling high concurrent traffic

// Connection pooling and request management
class RequestManager {
  private static instance: RequestManager;
  private activeRequests = new Map<string, number>();
  private requestQueue: Array<() => Promise<any>> = [];
  private maxConcurrentRequests = 10;
  private maxQueueSize = 100;

  static getInstance(): RequestManager {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager();
    }
    return RequestManager.instance;
  }

  async executeRequest<T>(
    requestId: string,
    requestFn: () => Promise<T>,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<T> {
    // Check if we're at capacity
    if (this.activeRequests.size >= this.maxConcurrentRequests) {
      if (this.requestQueue.length >= this.maxQueueSize) {
        throw new Error('Request queue is full. Please try again later.');
      }

      // Queue the request
      return new Promise((resolve, reject) => {
        const queuedRequest = async () => {
          try {
            const result = await this.executeRequest(requestId, requestFn, priority);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };

        if (priority === 'high') {
          this.requestQueue.unshift(queuedRequest);
        } else {
          this.requestQueue.push(queuedRequest);
        }

        // Process queue
        this.processQueue();
      });
    }

    // Track active request
    this.activeRequests.set(requestId, Date.now());

    try {
      const result = await requestFn();
      return result;
    } finally {
      this.activeRequests.delete(requestId);
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.requestQueue.length === 0 || this.activeRequests.size >= this.maxConcurrentRequests) {
      return;
    }

    const nextRequest = this.requestQueue.shift();
    if (nextRequest) {
      nextRequest();
    }
  }

  getMetrics() {
    return {
      activeRequests: this.activeRequests.size,
      queuedRequests: this.requestQueue.length,
      maxConcurrent: this.maxConcurrentRequests,
      maxQueue: this.maxQueueSize
    };
  }
}

// Circuit breaker for external API calls
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly threshold = 5;
  private readonly timeout = 30000; // 30 seconds

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Retry mechanism with exponential backoff
class RetryManager {
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

// Cache management for static assets and API responses
class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, ttl: number = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Performance monitoring
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = {
    pageLoads: 0,
    apiCalls: 0,
    errors: 0,
    averageResponseTime: 0,
    slowRequests: 0
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordPageLoad(loadTime: number) {
    this.metrics.pageLoads++;
    this.updateAverageResponseTime(loadTime);
    
    if (loadTime > 3000) {
      this.metrics.slowRequests++;
    }
  }

  recordApiCall(responseTime: number, success: boolean = true) {
    this.metrics.apiCalls++;
    this.updateAverageResponseTime(responseTime);
    
    if (!success) {
      this.metrics.errors++;
    }
    
    if (responseTime > 2000) {
      this.metrics.slowRequests++;
    }
  }

  private updateAverageResponseTime(time: number) {
    const totalRequests = this.metrics.pageLoads + this.metrics.apiCalls;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (totalRequests - 1) + time) / totalRequests;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      pageLoads: 0,
      apiCalls: 0,
      errors: 0,
      averageResponseTime: 0,
      slowRequests: 0
    };
  }
}

// Resource preloading for critical assets
class ResourcePreloader {
  private static instance: ResourcePreloader;
  private preloadedResources = new Set<string>();

  static getInstance(): ResourcePreloader {
    if (!ResourcePreloader.instance) {
      ResourcePreloader.instance = new ResourcePreloader();
    }
    return ResourcePreloader.instance;
  }

  preloadImage(src: string, priority: 'high' | 'low' = 'low') {
    if (this.preloadedResources.has(src)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = priority;
    document.head.appendChild(link);
    
    this.preloadedResources.add(src);
  }

  preloadRoute(route: string) {
    // Preload route chunks for faster navigation
    import(/* @vite-ignore */ route).catch(() => {
      // Ignore preload errors
    });
  }

  getPreloadedResources() {
    return Array.from(this.preloadedResources);
  }
}

// Error boundary and recovery
class ErrorRecovery {
  private static instance: ErrorRecovery;
  private errorCount = 0;
  private readonly maxErrors = 10;
  private readonly resetTime = 60000; // 1 minute
  private lastResetTime = Date.now();

  static getInstance(): ErrorRecovery {
    if (!ErrorRecovery.instance) {
      ErrorRecovery.instance = new ErrorRecovery();
    }
    return ErrorRecovery.instance;
  }

  handleError(error: Error, context: string) {
    this.errorCount++;
    
    // Reset error count periodically
    if (Date.now() - this.lastResetTime > this.resetTime) {
      this.errorCount = 0;
      this.lastResetTime = Date.now();
    }

    // If too many errors, enable degraded mode
    if (this.errorCount > this.maxErrors) {
      this.enableDegradedMode();
    }

    console.error(`Error in ${context}:`, error);
  }

  private enableDegradedMode() {
    // Disable non-essential features
    document.body.classList.add('degraded-mode');
    
    // Show user notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-500 text-black p-4 rounded-lg z-50';
    notification.textContent = 'Service is experiencing high load. Some features may be limited.';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 10000);
  }

  getErrorCount() {
    return this.errorCount;
  }
}

// Export all utilities
export {
  RequestManager,
  CircuitBreaker,
  RetryManager,
  CacheManager,
  PerformanceMonitor,
  ResourcePreloader,
  ErrorRecovery
};

// Global performance configuration
export const PERFORMANCE_CONFIG = {
  // Request limits
  MAX_CONCURRENT_REQUESTS: 10,
  MAX_QUEUE_SIZE: 100,
  
  // Cache settings
  DEFAULT_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  IMAGE_CACHE_TTL: 30 * 60 * 1000, // 30 minutes
  
  // Retry settings
  MAX_RETRIES: 3,
  BASE_RETRY_DELAY: 1000,
  
  // Circuit breaker
  CIRCUIT_BREAKER_THRESHOLD: 5,
  CIRCUIT_BREAKER_TIMEOUT: 30000,
  
  // Performance thresholds
  SLOW_REQUEST_THRESHOLD: 2000, // 2 seconds
  SLOW_PAGE_LOAD_THRESHOLD: 3000, // 3 seconds
  
  // Error handling
  MAX_ERRORS_BEFORE_DEGRADED: 10,
  ERROR_RESET_TIME: 60000 // 1 minute
};