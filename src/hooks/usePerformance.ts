import { useEffect, useRef, useCallback } from 'react';
import { PerformanceMonitor, ResourcePreloader, CacheManager } from '@/utils/performance';

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const performanceMonitor = PerformanceMonitor.getInstance();
  const resourcePreloader = ResourcePreloader.getInstance();
  const cacheManager = CacheManager.getInstance();
  const pageLoadStartTime = useRef<number>(Date.now());

  // Monitor page load performance
  useEffect(() => {
    const handleLoad = () => {
      const loadTime = Date.now() - pageLoadStartTime.current;
      performanceMonitor.recordPageLoad(loadTime);
      
      console.log(`📊 Page loaded in ${loadTime}ms`);
    };

    // Record page load when component mounts
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [performanceMonitor]);

  // Monitor API calls
  const monitorApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    context: string = 'API Call'
  ): Promise<T> => {
    const startTime = Date.now();
    
    try {
      const result = await apiCall();
      const responseTime = Date.now() - startTime;
      performanceMonitor.recordApiCall(responseTime, true);
      
      console.log(`📡 ${context} completed in ${responseTime}ms`);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      performanceMonitor.recordApiCall(responseTime, false);
      
      console.error(`❌ ${context} failed after ${responseTime}ms:`, error);
      throw error;
    }
  }, [performanceMonitor]);

  // Preload critical resources
  const preloadResource = useCallback((src: string, priority: 'high' | 'low' = 'low') => {
    resourcePreloader.preloadImage(src, priority);
  }, [resourcePreloader]);

  // Cache management
  const getCachedData = useCallback((key: string) => {
    return cacheManager.get(key);
  }, [cacheManager]);

  const setCachedData = useCallback((key: string, data: any, ttl?: number) => {
    cacheManager.set(key, data, ttl);
  }, [cacheManager]);

  // Get performance metrics
  const getMetrics = useCallback(() => {
    return {
      performance: performanceMonitor.getMetrics(),
      resources: resourcePreloader.getPreloadedResources(),
      cache: cacheManager.getStats()
    };
  }, [performanceMonitor, resourcePreloader, cacheManager]);

  return {
    monitorApiCall,
    preloadResource,
    getCachedData,
    setCachedData,
    getMetrics
  };
}

// Resource preloading hook
export function useResourcePreloading() {
  const resourcePreloader = ResourcePreloader.getInstance();

  const preloadImages = useCallback((imageUrls: string[], priority: 'high' | 'low' = 'low') => {
    imageUrls.forEach(url => {
      resourcePreloader.preloadImage(url, priority);
    });
  }, [resourcePreloader]);

  const preloadRoute = useCallback((route: string) => {
    resourcePreloader.preloadRoute(route);
  }, [resourcePreloader]);

  const preloadResource = useCallback((src: string, priority: 'high' | 'low' = 'low') => {
    resourcePreloader.preloadImage(src, priority);
  }, [resourcePreloader]);

  return {
    preloadImages,
    preloadRoute,
    preloadResource
  };
}

// Connection monitoring hook
export function useConnectionMonitoring() {
  useEffect(() => {
    const updateConnectionStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        console.log('📶 Connection Info:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        });

        // Adjust performance based on connection
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          document.body.classList.add('slow-connection');
        } else {
          document.body.classList.remove('slow-connection');
        }
      }
    };

    updateConnectionStatus();

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateConnectionStatus);
      
      return () => {
        connection.removeEventListener('change', updateConnectionStatus);
      };
    }
  }, []);
}

// Memory monitoring hook
export function useMemoryMonitoring() {
  useEffect(() => {
    const checkMemory = () => {
      const memory = (performance as any).memory;
      
      if (memory) {
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
        
        console.log('🧠 Memory Usage:', {
          used: `${usedMB}MB`,
          total: `${totalMB}MB`,
          limit: `${limitMB}MB`,
          percentage: `${Math.round((usedMB / limitMB) * 100)}%`
        });

        // Warn if memory usage is high
        if (usedMB / limitMB > 0.8) {
          console.warn('⚠️ High memory usage detected');
          document.body.classList.add('high-memory-usage');
        } else {
          document.body.classList.remove('high-memory-usage');
        }
      }
    };

    // Check memory every 30 seconds
    const interval = setInterval(checkMemory, 30000);
    checkMemory(); // Initial check

    return () => {
      clearInterval(interval);
    };
  }, []);
}

// Performance optimization hook
export function usePerformanceOptimization() {
  const { preloadResource } = useResourcePreloading();

  useEffect(() => {
    // Preload critical images
    const criticalImages = [
      '/src/assets/hero-bg.jpg',
      '/src/assets/1.png',
      '/src/assets/2.png',
      '/src/assets/3.png',
      '/src/assets/4.png'
    ];

    criticalImages.forEach(image => {
      preloadResource(image, 'high');
    });

    // Preload route chunks
    const criticalRoutes = [
      '@/pages/ProductDetail',
      '@/pages/MaskCollection',
      '@/pages/TShirtCollection-backup'
    ];

    criticalRoutes.forEach(route => {
      preloadResource(route, 'low');
    });

    // Optimize scroll performance
    let ticking = false;
    const optimizeScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Scroll optimization logic here
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizeScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', optimizeScroll);
    };
  }, [preloadResource]);
}
