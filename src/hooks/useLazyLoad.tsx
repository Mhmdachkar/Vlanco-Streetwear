import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseLazyLoadReturn {
  ref: React.RefObject<HTMLElement>;
  isInView: boolean;
  hasBeenInView: boolean;
}

export const useLazyLoad = (options: UseLazyLoadOptions = {}): UseLazyLoadReturn => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting) {
      setIsInView(true);
      if (!hasBeenInView) {
        setHasBeenInView(true);
      }
      
      // Disconnect observer if triggerOnce is true
      if (triggerOnce && observerRef.current) {
        observerRef.current.disconnect();
      }
    } else if (!triggerOnce) {
      setIsInView(false);
    }
  }, [triggerOnce, hasBeenInView]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!window.IntersectionObserver) {
      // Fallback for browsers that don't support IntersectionObserver
      setIsInView(true);
      setHasBeenInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin]);

  return {
    ref,
    isInView,
    hasBeenInView
  };
};

export default useLazyLoad;
