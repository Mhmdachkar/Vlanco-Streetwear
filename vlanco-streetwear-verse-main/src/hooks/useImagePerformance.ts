import { useState, useEffect, useCallback, useRef } from 'react';

interface ImagePerformanceMetrics {
  loadTime: number;
  size: number;
  format: string;
  isOptimized: boolean;
  error?: string;
}

interface ImagePerformanceOptions {
  trackAllImages?: boolean;
  logMetrics?: boolean;
  onImageLoad?: (metrics: ImagePerformanceMetrics) => void;
  onImageError?: (error: string) => void;
}

export const useImagePerformance = (options: ImagePerformanceOptions = {}) => {
  const [metrics, setMetrics] = useState<Map<string, ImagePerformanceMetrics>>(new Map());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const imageLoadTimes = useRef<Map<string, number>>(new Map());

  const {
    trackAllImages = true,
    logMetrics = false,
    onImageLoad,
    onImageError
  } = options;

  // Start monitoring image performance
  const startMonitoring = useCallback(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'resource' && entry.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
            const loadTime = entry.responseEnd - entry.startTime;
            const size = entry.transferSize || 0;
            const format = entry.name.split('.').pop()?.toLowerCase() || 'unknown';
            
            const imageMetrics: ImagePerformanceMetrics = {
              loadTime,
              size,
              format,
              isOptimized: format === 'webp' || size < 100000, // Consider webp or <100KB as optimized
            };

            setMetrics(prev => new Map(prev).set(entry.name, imageMetrics));
            
            if (logMetrics) {
              console.log(`Image Performance: ${entry.name}`, imageMetrics);
            }
            
            onImageLoad?.(imageMetrics);
          }
        });
      });

      observerRef.current.observe({ entryTypes: ['resource'] });
      setIsMonitoring(true);
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }, [logMetrics, onImageLoad]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Track individual image load
  const trackImageLoad = useCallback((src: string, startTime?: number) => {
    const loadStartTime = startTime || performance.now();
    imageLoadTimes.current.set(src, loadStartTime);

    return () => {
      const endTime = performance.now();
      const loadTime = endTime - loadStartTime;
      
      const imageMetrics: ImagePerformanceMetrics = {
        loadTime,
        size: 0, // Size not available without network request
        format: src.split('.').pop()?.toLowerCase() || 'unknown',
        isOptimized: false
      };

      setMetrics(prev => new Map(prev).set(src, imageMetrics));
      
      if (logMetrics) {
        console.log(`Image Load Time: ${src}`, imageMetrics);
      }
      
      onImageLoad?.(imageMetrics);
    };
  }, [logMetrics, onImageLoad]);

  // Get performance metrics for a specific image
  const getImageMetrics = useCallback((src: string) => {
    return metrics.get(src);
  }, [metrics]);

  // Get overall performance summary
  const getPerformanceSummary = useCallback(() => {
    const allMetrics = Array.from(metrics.values());
    
    if (allMetrics.length === 0) {
      return {
        totalImages: 0,
        averageLoadTime: 0,
        totalSize: 0,
        optimizedImages: 0,
        slowImages: 0
      };
    }

    const totalLoadTime = allMetrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    const totalSize = allMetrics.reduce((sum, metric) => sum + metric.size, 0);
    const optimizedImages = allMetrics.filter(metric => metric.isOptimized).length;
    const slowImages = allMetrics.filter(metric => metric.loadTime > 1000).length; // >1 second

    return {
      totalImages: allMetrics.length,
      averageLoadTime: totalLoadTime / allMetrics.length,
      totalSize,
      optimizedImages,
      slowImages,
      optimizationPercentage: (optimizedImages / allMetrics.length) * 100
    };
  }, [metrics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  // Auto-start monitoring if enabled
  useEffect(() => {
    if (trackAllImages) {
      startMonitoring();
    }
  }, [trackAllImages, startMonitoring]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    trackImageLoad,
    getImageMetrics,
    getPerformanceSummary
  };
};

// Hook for optimizing image loading based on connection speed
export const useConnectionOptimization = () => {
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [effectiveType, setEffectiveType] = useState<string>('4g');
  const [downlink, setDownlink] = useState<number>(10);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        setConnectionType(connection.type || 'unknown');
        setEffectiveType(connection.effectiveType || '4g');
        setDownlink(connection.downlink || 10);

        const updateConnection = () => {
          setConnectionType(connection.type || 'unknown');
          setEffectiveType(connection.effectiveType || '4g');
          setDownlink(connection.downlink || 10);
        };

        connection.addEventListener('change', updateConnection);
        return () => connection.removeEventListener('change', updateConnection);
      }
    }
  }, []);

  // Determine optimal image quality based on connection
  const getOptimalQuality = useCallback(() => {
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 50; // Low quality for slow connections
    } else if (effectiveType === '3g') {
      return 70; // Medium quality for 3G
    } else {
      return 85; // High quality for 4G+
    }
  }, [effectiveType]);

  // Determine if we should use lazy loading
  const shouldUseLazyLoading = useCallback(() => {
    return effectiveType !== '4g' || downlink < 5;
  }, [effectiveType, downlink]);

  // Determine optimal image format
  const getOptimalFormat = useCallback(() => {
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'webp'; // WebP for slow connections
    } else if (effectiveType === '3g') {
      return 'webp'; // WebP for 3G
    } else {
      return 'auto'; // Let browser decide for fast connections
    }
  }, [effectiveType]);

  return {
    connectionType,
    effectiveType,
    downlink,
    getOptimalQuality,
    shouldUseLazyLoading,
    getOptimalFormat,
    isSlowConnection: effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g'
  };
};
