import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useReducedMotion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import CategorySections from '@/components/CategorySections';
import FeaturesSection from '@/components/FeaturesSection';
import VlancoCommunity from '@/components/VlancoCommunity';
import LimitedDrops from '@/components/LimitedDrops';
import Footer from '@/components/Footer';
import { usePageAnalytics } from '@/hooks/useAnalytics';
import { ArrowUp, Sparkles, Star, Zap } from 'lucide-react';

// --- Optimized Animated Background Component ---
// Simplified for better performance
const AnimatedBackground = ({ opacity }) => {
  const [particles, setParticles] = useState([]);
  const animationFrameId = useRef<number | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Reduce particles significantly for performance
    const particleCount = shouldReduceMotion ? 5 : (isMobile ? 15 : 25);
    const newParticles = [...Array(particleCount)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.03, // Reduced speed
      vy: (Math.random() - 0.5) * 0.03,
      size: Math.random() * 1.5 + 0.5, // Smaller particles
      color: ['#8B5CF6', '#06B6D4', '#EC4899'][Math.floor(Math.random() * 3)],
    }));
    setParticles(newParticles);

    return () => {
      window.removeEventListener('resize', checkMobile);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [isMobile, shouldReduceMotion]);

  // Simplified animation loop
  const animateParticles = useCallback(() => {
    if (shouldReduceMotion) return;
    
    setParticles(prevParticles => 
      prevParticles.map(p => {
        let newX = p.x + p.vx;
        let newY = p.y + p.vy;
        let newVx = p.vx;
        let newVy = p.vy;

        // Simple bounce off edges
        if (newX <= 0 || newX >= 100) newVx *= -1;
        if (newY <= 0 || newY >= 100) newVy *= -1;

        return {
          ...p,
          x: newX,
          y: newY,
          vx: newVx * 0.98, // More friction
          vy: newVy * 0.98,
        };
      })
    );
    animationFrameId.current = requestAnimationFrame(animateParticles);
  }, [shouldReduceMotion]);
  
  useEffect(() => {
    if (!shouldReduceMotion) {
      animationFrameId.current = requestAnimationFrame(animateParticles);
    }
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [animateParticles, shouldReduceMotion]);

  return (
    <motion.div 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity }} // Control visibility via opacity
    >
      {/* Minimal gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-cyan-900/3 to-pink-900/5" />
      
      {/* Static particles only */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: 0.3,
          }}
        />
      ))}
    </motion.div>
  );
};


// --- Optimized Cursor Effect ---
const NeuralCursor = ({ mouseX, mouseY }) => (
  <motion.div
    className="fixed w-6 h-6 md:w-8 md:h-8 pointer-events-none z-50 rounded-full mix-blend-screen"
    style={{
      x: mouseX,
      y: mouseY,
      translateX: '-50%',
      translateY: '-50%',
      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(236, 72, 153, 0) 70%)',
    }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
  />
);


// --- Main Index Page ---
const Index = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
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
    
    // Update MotionValues directly
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (mq.removeEventListener) {
        mq.removeEventListener('change', onChange);
      } else {
        // @ts-ignore legacy
        mq.removeListener(onChange);
      }
    };
  }, [mouseX, mouseY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      {/* Cursor effect - simplified on mobile */}
      {!isMobile && <NeuralCursor mouseX={mouseX} mouseY={mouseY} />}
      
      {/* Simplified Section Indicator */}
      <motion.div
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 hidden md:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.3 : 0.5, delay: 0.5 }}
      >
        <div className="flex flex-col space-y-2">
          {['Hero', 'Categories', 'Drops', 'Features', 'Community'].map((section, index) => (
            <div
              key={section}
              className="w-2 h-2 rounded-full border border-purple-400/30 bg-purple-500/10 cursor-pointer hover:bg-purple-500/30 transition-colors duration-200"
              onClick={() => {
                const sections = document.querySelectorAll('main > div');
                if (sections[index]) {
                  sections[index].scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          ))}
        </div>
      </motion.div>
      
      {/* --- Main Page Content --- */}
      <div className="relative z-20">
        <Navigation />
      </div>

      <main className="relative z-10">
        {/* Hero: Optimized entrance */}
        <motion.div 
          data-section="hero"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }} 
          whileInView={{ 
            opacity: 1, 
            y: 0
          }} 
          viewport={{ once: true, amount: 0.1 }} 
          transition={{ 
            duration: shouldReduceMotion ? 0.3 : 0.6, 
            ease: "easeOut"
          }}
        >
          <HeroSection />
        </motion.div>
        
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
        
        {/* Categories: Optimized slide */}
        <motion.div 
          data-section="categories"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -60 }} 
          whileInView={{ 
            opacity: 1, 
            x: 0
          }} 
          viewport={{ once: true, amount: 0.15 }} 
          transition={{ 
            duration: shouldReduceMotion ? 0.3 : 0.6, 
            ease: "easeOut"
          }}
        >
          <CategorySections />
        </motion.div>
        
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
        
        {/* Limited Drops: Optimized reveal */}
        <motion.div 
          data-section="drops"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }} 
          whileInView={{ 
            opacity: 1, 
            y: 0
          }} 
          viewport={{ once: true, amount: 0.1 }} 
          transition={{ 
            duration: shouldReduceMotion ? 0.3 : 0.6, 
            ease: "easeOut"
          }}
        >
          <LimitedDrops />
        </motion.div>
        
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
        
        {/* Features: Optimized slide */}
        <motion.div 
          data-section="features"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 60 }} 
          whileInView={{ 
            opacity: 1, 
            x: 0
          }} 
          viewport={{ once: true, amount: 0.15 }} 
          transition={{ 
            duration: shouldReduceMotion ? 0.3 : 0.6, 
            ease: "easeOut"
          }}
        >
          <FeaturesSection />
        </motion.div>
        
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
        
        {/* Community: Optimized rise */}
        <motion.div 
          data-section="community"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }} 
          whileInView={{ 
            opacity: 1, 
            y: 0
          }} 
          viewport={{ once: true, amount: 0.1 }} 
          transition={{ 
            duration: shouldReduceMotion ? 0.3 : 0.6, 
            ease: "easeOut"
          }}
        >
          <VlancoCommunity />
        </motion.div>
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

// Powerful Section Transition Effects
const SectionTransitionEffect = ({ children, effectType }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const effects = {
    hero: {
      initial: { opacity: 0, y: 120, scale: 0.8, filter: "blur(30px)" },
      animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
      transition: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94], type: "spring", stiffness: 60, damping: 25 }
    },
    categories: {
      initial: { opacity: 0, x: -200, rotateY: -25, scale: 0.9, filter: "brightness(0.3) saturate(0.5)" },
      animate: { opacity: 1, x: 0, rotateY: 0, scale: 1, filter: "brightness(1) saturate(1)" },
      transition: { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], type: "spring", stiffness: 70, damping: 20 }
    },
    drops: {
      initial: { opacity: 0, scale: 0.5, filter: "blur(40px) brightness(0.2)", rotateZ: -10 },
      animate: { opacity: 1, scale: 1, filter: "blur(0px) brightness(1)", rotateZ: 0 },
      transition: { duration: 1.6, ease: [0.34, 1.56, 0.64, 1], type: "spring", stiffness: 100, damping: 12 }
    },
    features: {
      initial: { opacity: 0, x: 200, skewX: -15, scale: 0.8, filter: "hue-rotate(180deg) contrast(0.5)" },
      animate: { opacity: 1, x: 0, skewX: 0, scale: 1, filter: "hue-rotate(0deg) contrast(1)" },
      transition: { duration: 1.7, ease: [0.68, -0.55, 0.265, 1.55], type: "spring", stiffness: 80, damping: 18 }
    },
    community: {
      initial: { opacity: 0, y: 150, rotateX: 20, scale: 0.7, filter: "brightness(0.3) blur(20px) sepia(1)" },
      animate: { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "brightness(1) blur(0px) sepia(0)" },
      transition: { duration: 2.0, ease: [0.25, 0.46, 0.45, 0.94], type: "spring", stiffness: 50, damping: 25 }
    }
  };

  const effect = effects[effectType] || effects.hero;

  return (
    <motion.div
      ref={ref}
      initial={effect.initial}
      animate={isVisible ? effect.animate : effect.initial}
      transition={effect.transition}
    >
      {children}
    </motion.div>
  );
};

// Section Transition Particles Effect
const SectionTransitionParticles = () => {
  const [particles, setParticles] = useState([]);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const sections = ['hero', 'categories', 'drops', 'features', 'community'];
    
    const observers = sections.map((section, index) => {
      const element = document.querySelector(`[data-section="${section}"]`);
      if (!element) return null;

      return new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(section);
            // Create particle burst effect
            createParticleBurst(entry.boundingClientRect);
          }
        },
        { threshold: 0.3 }
      );
    });

    observers.forEach((observer, index) => {
      const element = document.querySelector(`[data-section="${sections[index]}"]`);
      if (observer && element) {
        observer.observe(element);
      }
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  const createParticleBurst = (rect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x: centerX,
      y: centerY,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 1,
      color: ['#8B5CF6', '#06B6D4', '#EC4899', '#F59E0B'][Math.floor(Math.random() * 4)]
    }));

    setParticles(prev => [...prev, ...newParticles]);

    // Animate particles
    const animateParticles = () => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vx: p.vx * 0.95,
          vy: p.vy * 0.95,
          life: p.life - 0.02
        })).filter(p => p.life > 0)
      );
    };

    const interval = setInterval(animateParticles, 16);
    setTimeout(() => clearInterval(interval), 2000);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            opacity: particle.life,
            transform: `scale(${particle.life})`
          }}
          initial={{ scale: 0 }}
          animate={{ scale: particle.life }}
          transition={{ duration: 0.1 }}
        />
      ))}
  </div>
);
};

// Enhanced Scroll Progress Indicator with Energy
const ScrollProgressIndicator = () => {
  const { scrollYProgress } = useScroll();
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-500 origin-left z-[60] shadow-lg"
      style={{ scaleX: scrollYProgress }}
      whileInView={{ 
        boxShadow: [
          "0 0 0px rgba(139, 92, 246, 0)",
          "0 0 15px rgba(139, 92, 246, 0.8)",
          "0 0 0px rgba(139, 92, 246, 0)"
        ]
      }}
      transition={{ duration: 2.0, repeat: Infinity }}
    />
  );
};

export default Index;