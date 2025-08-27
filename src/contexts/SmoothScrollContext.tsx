import React, { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number, options?: any) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType | null>(null);

export const useSmoothScroll = () => {
  const context = useContext(SmoothScrollContext);
  if (!context) {
    throw new Error('useSmoothScroll must be used within a SmoothScrollProvider');
  }
  return context;
};

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis with advanced configuration
    lenisRef.current = new Lenis({
      duration: 1.2, // Smooth scroll duration
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
      direction: 'vertical', // vertical, horizontal
      gestureDirection: 'vertical', // vertical, horizontal, both
      smooth: true, // Enable smooth scrolling
      mouseMultiplier: 1, // Mouse wheel sensitivity
      smoothTouch: false, // Disable smooth scrolling on touch devices
      touchMultiplier: 2, // Touch sensitivity
      infinite: false, // Infinite scroll
      autoResize: true, // Auto resize on window resize
      wrapper: window, // Scroll wrapper
      content: document.documentElement, // Scroll content
    });

    // Animation frame loop for smooth scrolling
    function raf(time: number) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenisRef.current?.destroy();
    };
  }, []);

  const scrollTo = (target: string | number, options?: any) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
