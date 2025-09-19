import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Optimized RAF loop with frame skipping for better performance
  const rafLoop = useCallback((time: number) => {
    if (lenisRef.current) {
      // Skip frames on low-end devices or when performance is poor
      const deltaTime = time - lastTimeRef.current;
      const shouldSkip = deltaTime < 16; // Skip if less than 60fps
      
      if (!shouldSkip) {
        lenisRef.current.raf(time);
        lastTimeRef.current = time;
      }
      
      rafIdRef.current = requestAnimationFrame(rafLoop);
    }
  }, []);

  useEffect(() => {
    // Ultra-lightweight Lenis configuration for maximum scroll performance
    lenisRef.current = new Lenis({
      duration: 0.1, // Ultra-fast for better performance
      easing: (t: number) => t, // Linear easing for better performance
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: false, // Disable smooth scroll for maximum performance
      mouseMultiplier: 0.3, // Reduced sensitivity
      smoothTouch: false, // Disable touch smoothing
      touchMultiplier: 0.5,
      infinite: false,
      normalizeWheel: false, // Disable for better performance
      wheelMultiplier: 0.3,
      syncTouch: false,
    });

    // Start optimized RAF loop
    rafIdRef.current = requestAnimationFrame(rafLoop);

    // Cleanup
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      lenisRef.current?.destroy();
    };
  }, [rafLoop]);

  // Expose lenis instance globally for other components to use
  useEffect(() => {
    if (lenisRef.current) {
      (window as any).lenis = lenisRef.current;
    }
  }, []);

  return <>{children}</>;
};

export default SmoothScrollProvider;
