import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting) {
      setIsIntersecting(true);
      if (triggerOnce) {
        setHasIntersected(true);
      }
    } else if (!triggerOnce) {
      setIsIntersecting(false);
    }
  }, [triggerOnce]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleIntersection, threshold, rootMargin]);

  return {
    elementRef,
    isIntersecting: triggerOnce ? hasIntersected : isIntersecting,
    hasIntersected
  };
};

// Optimized image lazy loading hook
export const useLazyImage = (src: string, options: UseLazyLoadOptions = {}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageRef, isIntersecting] = useLazyLoad(options);

  useEffect(() => {
    if (isIntersecting && src) {
      setImageSrc(src);
    }
  }, [isIntersecting, src]);

  return [imageRef, imageSrc, isIntersecting] as const;
};

// Performance-optimized component lazy loading
export const useLazyComponent = (options: UseLazyLoadOptions = {}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [elementRef, isIntersecting] = useLazyLoad(options);

  useEffect(() => {
    if (isIntersecting && !shouldRender) {
      // Add a small delay to prevent layout thrashing
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isIntersecting, shouldRender]);

  return [elementRef, shouldRender, isIntersecting] as const;
};
