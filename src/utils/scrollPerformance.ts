// Scroll Performance Optimization Utilities

// Throttle function for scroll events
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

// Debounce function for scroll events
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

// RAF-based throttling for high-frequency events
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

// Performance-aware scroll handler
export const createScrollHandler = (
  callback: (scrollY: number) => void,
  options: {
    throttle?: number;
    useRAF?: boolean;
    passive?: boolean;
  } = {}
) => {
  const { throttle: throttleMs = 16, useRAF = true, passive = true } = options;
  
  let lastScrollY = 0;
  let rafId: number | null = null;
  
  const handleScroll = () => {
    const scrollY = window.scrollY;
    
    if (Math.abs(scrollY - lastScrollY) < 1) return; // Skip if minimal change
    
    if (useRAF) {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          callback(scrollY);
          lastScrollY = scrollY;
          rafId = null;
        });
      }
    } else {
      callback(scrollY);
      lastScrollY = scrollY;
    }
  };
  
  const throttledHandler = throttleMs > 0 
    ? throttle(handleScroll, throttleMs)
    : handleScroll;
  
  return {
    handler: throttledHandler,
    addListener: () => {
      window.addEventListener('scroll', throttledHandler, { passive });
    },
    removeListener: () => {
      window.removeEventListener('scroll', throttledHandler);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  };
};

// Check if device is low-end for performance optimizations
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;
  const connection = (navigator as any).connection;
  
  // Check for slow connection
  if (connection) {
    const slowConnection = connection.effectiveType === 'slow-2g' || 
                          connection.effectiveType === '2g' ||
                          connection.saveData === true;
    if (slowConnection) return true;
  }
  
  // Check for low-end device characteristics
  return cores < 4 || memory < 4;
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get optimal scroll settings based on device capabilities
export const getScrollSettings = () => {
  const isLowEnd = isLowEndDevice();
  const reducedMotion = prefersReducedMotion();
  
  return {
    smooth: !reducedMotion && !isLowEnd,
    duration: reducedMotion ? 0.1 : isLowEnd ? 0.5 : 0.8,
    throttle: isLowEnd ? 32 : 16, // 30fps vs 60fps
    useRAF: !isLowEnd,
    passive: true
  };
};

// Optimized scroll to element
export const scrollToElement = (
  element: HTMLElement | string,
  options: {
    offset?: number;
    duration?: number;
    behavior?: ScrollBehavior;
  } = {}
) => {
  const { offset = 0, duration = 0.8, behavior = 'smooth' } = options;
  
  const target = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element;
    
  if (!target) return;
  
  const settings = getScrollSettings();
  
  // Use Lenis if available and not in reduced motion mode
  const lenis = (window as any).lenis;
  if (lenis && settings.smooth) {
    lenis.scrollTo(target, {
      offset: -offset,
      duration: duration,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
  } else {
    // Fallback to native scroll
    const elementTop = target.offsetTop - offset;
    window.scrollTo({
      top: elementTop,
      behavior: settings.smooth ? behavior : 'auto'
    });
  }
};

// Performance monitoring for scroll
export const createScrollPerformanceMonitor = () => {
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 60;
  
  const measureFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;
      
      // Adjust performance based on FPS
      if (fps < 30) {
        document.body.classList.add('low-performance');
      } else {
        document.body.classList.remove('low-performance');
      }
    }
    
    requestAnimationFrame(measureFPS);
  };
  
  return {
    start: () => requestAnimationFrame(measureFPS),
    getFPS: () => fps
  };
};
