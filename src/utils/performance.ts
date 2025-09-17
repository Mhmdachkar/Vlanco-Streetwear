// Performance optimization utilities

export const isLowEndDevice = (): boolean => {
  try {
    const dm = (navigator as any).deviceMemory;
    const hc = (navigator as any).hardwareConcurrency;
    const lowMem = typeof dm === 'number' && dm <= 4;
    const lowCpu = typeof hc === 'number' && hc <= 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const highDPI = window.devicePixelRatio > 2;
    
    return lowMem || lowCpu || isMobile || highDPI;
  } catch {
    return false;
  }
};

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const shouldReduceMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Request animation frame throttle
export const rafThrottle = <T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => void) => {
  let rafId: number | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(this, args);
        rafId = null;
      });
    }
  };
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    };
  }
  return null;
};

// Image optimization
export const optimizeImageUrl = (url: string, width?: number, height?: number, quality = 80) => {
  if (!url) return url;
  
  // For external URLs, add optimization parameters
  if (url.includes('unsplash.com') || url.includes('picsum.photos')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality) params.set('q', quality.toString());
    params.set('auto', 'format');
    params.set('fit', 'crop');
    
    return `${url}?${params.toString()}`;
  }
  
  return url;
};

// Component preloading
export const preloadComponent = (componentName: string) => {
  if (typeof window !== 'undefined') {
    // Preload critical components
    const criticalComponents = ['HeroSection', 'Navigation', 'ProductGrid'];
    if (criticalComponents.includes(componentName)) {
      // Add to preload queue
      window.requestIdleCallback?.(() => {
        console.log(`Preloading ${componentName}`);
      });
    }
  }
};
