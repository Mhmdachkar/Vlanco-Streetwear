import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useReducedMotion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import CategorySections from '@/components/CategorySections';
import FeaturesSection from '@/components/FeaturesSection';
import VlancoCommunity from '@/components/VlancoCommunity';
import LimitedDrops from '@/components/LimitedDrops';
import Footer from '@/components/Footer';
import PerformanceSection from '@/components/PerformanceSection';
import { usePageAnalytics } from '@/hooks/useAnalytics';
import { ArrowUp, Sparkles, Star, Zap } from 'lucide-react';
import { createScrollHandler, scrollToElement, isLowEndDevice, prefersReducedMotion } from '@/utils/scrollPerformance';

// --- Ultra-Lightweight Background Component ---
// Completely static for maximum scroll performance
const AnimatedBackground = ({ opacity }) => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity }}
    >
      {/* Simple gradient overlay - no particles for better performance */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 via-purple-900/40 to-slate-800/90" />
    </div>
  );
};


// --- Ultra-Lightweight Cursor Effect ---
const NeuralCursor = React.memo(({ mouseX, mouseY }) => (
  <motion.div
    className="fixed w-4 h-4 md:w-6 md:h-6 pointer-events-none z-50 rounded-full mix-blend-screen"
    style={{
      x: mouseX,
      y: mouseY,
      translateX: '-50%',
      translateY: '-50%',
      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0) 70%)',
    }}
    transition={{ type: "tween", duration: 0.1, ease: "linear" }}
  />
));


// Performance detection hook
const usePerformanceMode = () => {
  const [performanceMode, setPerformanceMode] = useState(() => {
    try {
      const dm = (navigator as any).deviceMemory;
      const hc = (navigator as any).hardwareConcurrency;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // More conservative performance mode detection
      const lowMem = typeof dm === 'number' && dm <= 2; // Only very low memory
      const lowCpu = typeof hc === 'number' && hc <= 2; // Only very low CPU cores
      
      // Only enable performance mode for very low-end devices or mobile
      return (lowMem || lowCpu) && isMobile;
    } catch {
      return false;
    }
  });
  
  return performanceMode;
};

// --- Main Index Page ---
const Index = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const performanceMode = usePerformanceMode();
  
  // Analytics tracking for homepage
  usePageAnalytics('Homepage', {
    page_type: 'landing',
    sections: ['hero', 'categories', 'drops', 'features', 'community']
  });
  
  // Simplified scroll tracking for better performance
  const { scrollYProgress } = useScroll();
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Static background opacity to reduce scroll calculations
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 0.8]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
    } else {
      // @ts-ignore legacy
      mq.addListener(onChange);
    }

    // Ultra-optimized scroll handler
    const scrollHandler = createScrollHandler(
      (scrollY) => setShowScrollTop(scrollY > 400),
      { useRAF: true, passive: true }
    );
    
    // Disable heavy mouse tracking for better scroll performance
    // const handleMouseMove = (e: MouseEvent) => {
    //   if (performanceMode || isMobile) return;
    //   mouseX.set(e.clientX);
    //   mouseY.set(e.clientY);
    // };

    // Add optimized scroll listener
    scrollHandler.addListener();
    // window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      scrollHandler.removeListener();
      // window.removeEventListener('mousemove', handleMouseMove);
      // if (rafId) cancelAnimationFrame(rafId);
      if (mq.removeEventListener) {
        mq.removeEventListener('change', onChange);
      } else {
        // @ts-ignore legacy
        mq.removeListener(onChange);
      }
    };
  }, [mouseX, mouseY, performanceMode, isMobile]);

  const scrollToTop = () => {
    scrollToElement(document.body, {
      offset: 0,
      duration: 1.2
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 relative overflow-x-hidden scroll-optimized" style={{
      background: `
        linear-gradient(135deg, #1e293b 0%, #7c3aed 50%, #1e293b 100%),
        radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)
      `
    }}>
      {/* Simplified Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-500 origin-left z-[60]"
        style={{ scaleX: scrollYProgress }}
      />
      
      {/* Removed Section Transition Particles for performance */}
      
      {/* Background - simplified on mobile for performance */}
      <AnimatedBackground opacity={backgroundOpacity} />
      
      {/* Fallback background to ensure visibility */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 z-[-1]" />
      
      {/* Disabled cursor effect for better scroll performance */}
      
      {/* Disabled section indicator for better scroll performance */}
      
      {/* --- Main Page Content --- */}
      <div className="relative z-20">
        <Navigation />
      </div>

      <main className="relative z-10 scroll-optimized">
        {/* Hero: Ultra-optimized entrance */}
        <PerformanceSection
          data-section="hero"
          animationType="slideUp"
          duration={performanceMode ? 0.2 : 0.4}
          performanceMode={performanceMode}
        >
          <HeroSection />
        </PerformanceSection>
        
        {/* Simplified Divider */}
        <motion.div 
          className="relative py-8 md:py-12 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.4, ease: "easeOut" }}
        >
          <div className="w-32 md:w-48 h-[1px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
          <div className="mx-4 md:mx-6 p-2 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-full border border-purple-400/30">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-300" />
          </div>
          <div className="w-32 md:w-48 h-[1px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
        </motion.div>
        
        {/* Categories: Ultra-optimized slide */}
        <PerformanceSection
          data-section="categories"
          animationType="slideLeft"
          duration={performanceMode ? 0.2 : 0.4}
          performanceMode={performanceMode}
        >
          <CategorySections />
        </PerformanceSection>
        
        {/* Simplified Divider */}
        <motion.div 
          className="relative py-6 md:py-8 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.3, ease: "easeOut" }}
        >
          <div className="w-24 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <div className="mx-2 md:mx-3 p-1.5 bg-purple-500/5 rounded-full border border-purple-500/20">
            <Star className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
          </div>
          <div className="w-24 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        </motion.div>
        
        {/* Limited Drops: Ultra-optimized reveal */}
        <PerformanceSection
          data-section="drops"
          animationType="slideUp"
          duration={performanceMode ? 0.2 : 0.4}
          performanceMode={performanceMode}
        >
          <LimitedDrops />
        </PerformanceSection>
        
        {/* Simplified Divider */}
        <motion.div 
          className="relative py-6 md:py-8 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.3, ease: "easeOut" }}
        >
          <div className="w-24 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <div className="mx-2 md:mx-3 p-1.5 bg-purple-500/5 rounded-full border border-purple-500/20">
            <Zap className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
          </div>
          <div className="w-24 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        </motion.div>
        
        {/* Features: Ultra-optimized slide */}
        <PerformanceSection
          data-section="features"
          animationType="slideRight"
          duration={performanceMode ? 0.2 : 0.4}
          performanceMode={performanceMode}
        >
          <FeaturesSection />
        </PerformanceSection>
        
        {/* Simplified Divider */}
        <motion.div 
          className="relative py-6 md:py-8 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.3, ease: "easeOut" }}
        >
          <div className="w-24 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <div className="mx-2 md:mx-3 p-1.5 bg-purple-500/5 rounded-full border border-purple-500/20">
            <span className="text-purple-400 text-sm">✨</span>
          </div>
          <div className="w-24 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        </motion.div>
        
        {/* Community: Ultra-optimized rise */}
        <PerformanceSection
          data-section="community"
          animationType="slideUp"
          duration={performanceMode ? 0.2 : 0.4}
          performanceMode={performanceMode}
        >
          <VlancoCommunity />
        </PerformanceSection>
      </main>
      
      <footer className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent" />
        <Footer />
      </footer>

      {/* Simplified Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 p-3 sm:p-3 md:p-4 bg-gradient-to-br from-purple-600 to-cyan-600 text-white rounded-full shadow-xl z-50 hover:scale-105 transition-transform duration-200 min-w-[48px] min-h-[48px] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.2 : 0.3 }}
          >
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// Removed heavy transition effects for maximum performance

export default Index;