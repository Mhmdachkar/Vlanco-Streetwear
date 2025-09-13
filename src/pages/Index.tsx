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

// --- Ultra-Optimized Static Background Component ---
// Completely static for maximum performance
const AnimatedBackground = ({ opacity }) => {
  const shouldReduceMotion = useReducedMotion();

  // Use CSS-only static particles for zero JS overhead
  const staticParticles = useMemo(() => {
    if (shouldReduceMotion) return [];
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1 + 0.5,
      color: ['#8B5CF6', '#06B6D4', '#EC4899'][i % 3],
    }));
  }, [shouldReduceMotion]);

  return (
    <motion.div 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity }}
    >
      {/* Minimal gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/3 via-cyan-900/2 to-pink-900/3" />
      
      {/* Static particles - no animation */}
      {staticParticles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: 0.2,
          }}
        />
      ))}
    </motion.div>
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
      const lowMem = typeof dm === 'number' && dm <= 4;
      const lowCpu = typeof hc === 'number' && hc <= 4;
      const isLowEnd = navigator.hardwareConcurrency <= 4 || 
                       window.devicePixelRatio > 2 ||
                       /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return lowMem || lowCpu || isLowEnd;
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
  
  // Use MotionValues for smooth, performant tracking
  const { scrollYProgress } = useScroll();
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Animate background opacity based on scroll position
  // It will be invisible (0) at the top and fully visible (1) after scrolling down 15% of the viewport height.
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);

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

    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    
    // Ultra-throttled mouse tracking - only update every 5th frame for performance mode
    let frameCount = 0;
    let rafId: number | null = null;
    let lastEvent: MouseEvent | null = null;
    const updateMouse = () => {
      frameCount++;
      const skipFrames = performanceMode ? 5 : 3; // Skip more frames on low-end devices
      if (frameCount % skipFrames === 0 && lastEvent) {
        mouseX.set(lastEvent.clientX);
        mouseY.set(lastEvent.clientY);
      }
      rafId = requestAnimationFrame(updateMouse);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (performanceMode) return; // Skip mouse tracking entirely on low-end devices
      lastEvent = e;
      if (rafId == null) rafId = requestAnimationFrame(updateMouse);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
      if (mq.removeEventListener) {
        mq.removeEventListener('change', onChange);
      } else {
        // @ts-ignore legacy
        mq.removeListener(onChange);
      }
    };
  }, [mouseX, mouseY]);

  const scrollToTop = () => {
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Simplified Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-500 origin-left z-[60]"
        style={{ scaleX: scrollYProgress }}
      />
      
      {/* Removed Section Transition Particles for performance */}
      
      {/* Background - simplified on mobile for performance */}
      <AnimatedBackground opacity={backgroundOpacity} />
      
      {/* Cursor effect - disabled on mobile and performance mode */}
      {!isMobile && !performanceMode && <NeuralCursor mouseX={mouseX} mouseY={mouseY} />}
      
      {/* Ultra-simplified Section Indicator - only on desktop and high-end devices */}
      {!isMobile && !performanceMode && (
      <motion.div
          className="fixed right-3 top-1/2 transform -translate-y-1/2 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex flex-col space-y-1.5">
          {['Hero', 'Categories', 'Drops', 'Features', 'Community'].map((section, index) => (
            <div
              key={section}
                className="w-1.5 h-1.5 rounded-full bg-purple-500/20 cursor-pointer hover:bg-purple-500/40 transition-colors duration-150"
              onClick={() => {
                const sections = document.querySelectorAll('main > div');
                if (sections[index]) {
                    const lenis = (window as any).lenis;
                    if (lenis) {
                      lenis.scrollTo(sections[index], { 
                        offset: -80, 
                        duration: 1.2 
                      });
                    } else {
                  sections[index].scrollIntoView({ behavior: 'smooth' });
                    }
                }
              }}
            />
          ))}
        </div>
      </motion.div>
      )}
      
      {/* --- Main Page Content --- */}
      <div className="relative z-20">
        <Navigation />
      </div>

      <main className="relative z-10">
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
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 p-2 md:p-3 bg-gradient-to-br from-purple-600 to-cyan-600 text-white rounded-full shadow-lg z-50 hover:scale-105 transition-transform duration-200"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.2 : 0.3 }}
          >
            <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// Removed heavy transition effects for maximum performance

export default Index;