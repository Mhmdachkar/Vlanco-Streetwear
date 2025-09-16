import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useInView } from 'framer-motion';
import { ShoppingBag, Play, ArrowRight, Sparkles, Star, Heart, Zap } from 'lucide-react';
import { WatermarkLogo, HeroLogo } from './VlancoLogo';

// Optimized Smoky Word Animation Component with mobile performance
const AnimatedText = ({ text, className, delay = 0, duration = 1.2, isInView, isMobile = false }: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  isInView: boolean;
  isMobile?: boolean;
}) => {
  const words = useMemo(() => text.split(' '), [text]);
  
  return (
    <span className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-2 relative"
          initial={{ 
            opacity: 0, 
            y: 30, 
            scale: 0.8,
            filter: "blur(8px)"
          }}
          animate={isInView ? { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            filter: "blur(0px)"
          } : {}}
          transition={{
            duration: isMobile ? duration * 0.7 : duration,
            delay: isMobile ? delay + index * 0.08 : delay + index * 0.15,
            ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth smoke effect
            opacity: {
              duration: isMobile ? duration * 0.6 : duration * 0.8,
              ease: "easeOut"
            },
            y: {
              duration: isMobile ? duration * 0.8 : duration * 1.2,
              ease: [0.25, 0.46, 0.45, 0.94]
            },
            scale: {
              duration: isMobile ? duration * 0.6 : duration * 0.9,
              ease: "easeOut"
            },
            filter: {
              duration: isMobile ? duration * 0.8 : duration * 1.1,
              ease: "easeOut"
            }
          }}
        >
          {word}
          {/* Enhanced glow effect for smoke-like appearance */}
          <motion.div
            className="absolute inset-0 opacity-0"
            animate={isInView ? { 
              opacity: [0, 0.3, 0],
              scale: [0.8, 1.1, 1]
            } : {}}
            transition={{
              duration: duration * 1.5,
              delay: delay + index * 0.15,
              ease: "easeOut"
            }}
            style={{
              background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
              filter: 'blur(2px)',
              borderRadius: '4px'
            }}
          />
        </motion.span>
      ))}
    </span>
  );
};

// Enhanced Smoke Disappear Animation Component with mobile optimization
const SmokeDisappearText = ({ text, className, delay = 0, isInView, isMobile = false }: {
  text: string;
  className?: string;
  delay?: number;
  isInView: boolean;
  isMobile?: boolean;
}) => {
  const words = useMemo(() => text.split(' '), [text]);
  const [disappearingWords, setDisappearingWords] = useState<Set<number>>(new Set());
  
  // Trigger smoke disappear effect after initial animation
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        const disappearInterval = setInterval(() => {
          setDisappearingWords(prev => {
            const newSet = new Set(prev);
            const remainingWords = words.filter((_, index) => !newSet.has(index));
            if (remainingWords.length > 0) {
              const randomIndex = words.findIndex((_, index) => !newSet.has(index));
              if (randomIndex !== -1) {
                newSet.add(randomIndex);
              }
            }
            return newSet;
          });
        }, 200);

        return () => clearInterval(disappearInterval);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInView, words]);

  return (
    <span className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-2"
          animate={disappearingWords.has(index) ? {
            opacity: [1, 0.3, 0],
            y: [0, -20, -40],
            scale: [1, 1.1, 0.8],
            filter: ["blur(0px)", "blur(4px)", "blur(8px)"]
          } : {}}
          transition={{
            duration: 1.5,
            ease: "easeOut"
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

// Professional Cursor Trail Component - Replaces circular mouse follower
const ProfessionalCursorTrail = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout>();

  // Optimized mouse tracking with throttling and useCallback
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    mouseX.set(x);
    mouseY.set(y);
    setMousePosition({ x, y });
    setIsMoving(true);
    
    // Clear existing timeout
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }
    
    // Set timeout to stop movement indicator
    moveTimeoutRef.current = setTimeout(() => {
      setIsMoving(false);
    }, 100);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Throttled mouse move handler for better performance
    let ticking = false;
    const throttledMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleMouseMove(e);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('mousemove', throttledMouseMove, { passive: true });
    
    return () => {
      container.removeEventListener('mousemove', throttledMouseMove);
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, [handleMouseMove]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-20 hidden sm:block">
      {/* Main cursor dot */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: mousePosition.x * 100 + '%',
          top: mousePosition.y * 100 + '%',
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          scale: isMoving ? [1, 1.2, 1] : 1,
          opacity: isMoving ? 1 : 0.7,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
      >
        <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg" />
      </motion.div>

      {/* Subtle trail effect */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: mousePosition.x * 100 + '%',
          top: mousePosition.y * 100 + '%',
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          scale: isMoving ? [0, 1, 0] : 0,
          opacity: isMoving ? [0, 0.3, 0] : 0,
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
      >
        <div className="w-8 h-8 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full" />
      </motion.div>

      {/* Energy pulse when moving */}
      {isMoving && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: mousePosition.x * 100 + '%',
            top: mousePosition.y * 100 + '%',
            x: '-50%',
            y: '-50%',
          }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: [0, 1.5, 0], opacity: [0.5, 0, 0] }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        >
          <div className="w-16 h-16 border border-cyan-400/30 rounded-full" />
        </motion.div>
      )}
    </div>
  );
};

// Enhanced Performance detection hook with mobile optimization
const usePerformanceMode = () => {
  const [performanceMode, setPerformanceMode] = useState(() => {
    try {
      const dm = (navigator as any).deviceMemory;
      const hc = (navigator as any).hardwareConcurrency;
      const lowMem = typeof dm === 'number' && dm <= 4;
      const lowCpu = typeof hc === 'number' && hc <= 4;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isLowEnd = navigator.hardwareConcurrency <= 4 || 
                       window.devicePixelRatio > 2 ||
                       isMobile;
      return lowMem || lowCpu || isLowEnd;
    } catch {
      return false;
    }
  });
  
  return performanceMode;
};

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const performanceMode = usePerformanceMode();
  const isMobile = useIsMobile();


  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"
    >
      {/* Brand Watermark Logo */}
      <WatermarkLogo className="top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0" />
      
      {/* Optimized Background Elements - Reduced for Performance */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Simplified Animated Grid */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Optimized Floating Particles for Mobile Performance */}
        {!performanceMode && !isMobile && [...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-br from-cyan-400/40 to-blue-500/20 rounded-full"
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${30 + (i * 12)}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [0, 1, 0.8, 1, 0],
              opacity: [0, 0.6, 0.4, 0.2, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Simplified Gradient Orbs - reduced animation on performance mode */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
          animate={performanceMode ? {} : {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={performanceMode ? {} : { duration: 8, repeat: Infinity }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={performanceMode ? {} : {
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={performanceMode ? {} : { duration: 10, repeat: Infinity, delay: 4 }}
        />

        {/* Simplified Geometric Shapes - static on performance mode */}
        <motion.div
          className="absolute top-20 left-20 w-16 h-16 md:w-32 md:h-32 border border-cyan-400/30 transform rotate-45"
          animate={performanceMode ? {} : { rotate: [45, 405, 45] }}
          transition={performanceMode ? {} : { duration: 15, repeat: Infinity }}
        />
        
        <motion.div
          className="absolute bottom-32 right-32 w-12 h-12 md:w-24 md:h-24 border border-purple-400/30 rounded-full"
          animate={performanceMode ? {} : { 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={performanceMode ? {} : { duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto">
        
        {/* Enhanced Brand Title - Moved Down */}
        <motion.div
          className="mb-16 pt-16 pb-8"
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        >
              <motion.h1
            className={`font-black text-center relative ${
              isMobile 
                ? "text-3xl sm:text-4xl" 
                : "text-4xl sm:text-5xl md:text-7xl lg:text-9xl"
            }`}
            initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
            animate={isInView ? { opacity: 1, scale: 1, rotateX: 0 } : {}}
            transition={{ 
              duration: isMobile ? 0.8 : 1.2, 
              delay: isMobile ? 0.2 : 0.5, 
              type: "spring" as const 
            }}
          >
            <motion.span
              className="text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text relative inline-block"
              animate={{ 
                backgroundPosition: ['0%', '100%', '0%']
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ backgroundSize: '200% 200%' }}
              whileHover={{ 
                scale: 1.1,
                rotateY: 10,
                transition: { duration: 0.4, type: "spring" as const }
              }}
            >
              VLANCO
            </motion.span>
            
            {/* Glowing Text Shadow */}
            <motion.div
              className="absolute inset-0 text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text blur-sm opacity-50"
              animate={{
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              VLANCO
            </motion.div>
          </motion.h1>
          
          {/* Enhanced Animated Underline */}
          <motion.div
            className="relative mx-auto mt-8"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            <motion.div
              className="h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              initial={{ width: 0 }}
              animate={isInView ? { width: '200px' } : { width: 0 }}
              transition={{ duration: 2, delay: 1.5 }}
            />
            <motion.div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-cyan-400 rounded-full"
              animate={{
                x: [-200, 200, -200],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </motion.div>
        </motion.div>

        {/* Enhanced Smoky Description with Smoke Disappear Animation */}
        <motion.div
          className="mb-12 px-4 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.8 }}
        >
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto text-center relative">
            {/* Fallback Static Text - Always Visible with Better Contrast */}
            <div className="opacity-30">
              <div className="mb-3">
                <span className="text-transparent bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text font-medium">
                  Where street culture meets cutting-edge design.
                </span>
              </div>
              <div className="mb-3">
                <span className="text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text font-semibold">
                  Discover premium streetwear
                </span>
              </div>
              <div>
                <span className="text-transparent bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text font-medium">
            that defines the next generation of urban fashion.
                </span>
              </div>
            </div>
            
            {/* Enhanced Animated Text Overlay with Smoke Disappear */}
            <div className="absolute inset-0 top-0 left-0 right-0">
              {/* First Line - Smoky Appearance */}
              <div className="mb-3">
                <SmokeDisappearText
                  text="Where street culture meets cutting-edge design."
                  className="text-transparent bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text font-medium"
                  delay={isMobile ? 0.8 : 1.2}
                  isInView={isInView}
                  isMobile={isMobile}
                />
              </div>
              
              {/* Second Line - Highlighted with Smoke Disappear Effect */}
              <div className="mb-3">
                <SmokeDisappearText
                  text="Discover premium streetwear"
                  className="text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text font-semibold"
                  delay={isMobile ? 1.5 : 2.5}
                  isInView={isInView}
                  isMobile={isMobile}
                />
              </div>
              
              {/* Third Line - Final Smoke Disappear Appearance */}
              <div>
                <SmokeDisappearText
                  text="that defines the next generation of urban fashion."
                  className="text-transparent bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text font-medium"
                  delay={isMobile ? 2.2 : 3.8}
                  isInView={isInView}
                  isMobile={isMobile}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: isMobile ? 0.6 : 1.0, delay: isMobile ? 3.0 : 5.2 }}
        >
          {/* Enhanced Shop Now Button */}
          <motion.button
            className="group relative px-6 py-3 sm:px-8 sm:py-4 md:px-10 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold text-sm sm:text-base md:text-lg shadow-2xl overflow-hidden w-full sm:w-auto"
            whileHover={!isMobile ? { 
              scale: 1.05, 
              y: -3,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)"
            } : {}}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const collectionsSection = document.getElementById('collections');
              if (collectionsSection) {
                collectionsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.4 }}
            />
            
            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-cyan-400/20 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            />
            
            <span className="relative z-10 flex items-center gap-3">
              <motion.div
                className="group-hover:scale-110 transition-transform duration-300"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <ShoppingBag className="w-6 h-6 group-hover:text-cyan-300 transition-colors" />
              </motion.div>
              Shop Now
              <motion.div
                className="group-hover:translate-x-2 transition-transform duration-300"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5 group-hover:text-cyan-300 transition-colors" />
              </motion.div>
            </span>

            {/* Enhanced Ripple Effect */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-xl border-2 border-cyan-400"
                animate={{ 
                  scale: [1, 2], 
                  opacity: [0.6, 0] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: i * 0.6
                }}
              />
            ))}
          </motion.button>

          {/* Enhanced Watch Film Button */}
          <motion.button
            className="group relative px-6 py-3 sm:px-8 sm:py-4 md:px-10 border-2 border-cyan-400/50 text-gray-300 rounded-xl font-semibold text-sm sm:text-base md:text-lg backdrop-blur-sm bg-white/5 overflow-hidden w-full sm:w-auto"
            whileHover={!isMobile ? { 
              scale: 1.05,
              borderColor: "rgba(59, 130, 246, 1)",
              color: "rgba(59, 130, 246, 1)",
              y: -3,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
            } : {}}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const brandSection = document.getElementById('brand-experience');
              if (brandSection) {
                brandSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
            
            <span className="relative z-10 flex items-center gap-3">
              <motion.div
                className="group-hover:scale-125 transition-transform duration-300"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Play className="w-6 h-6 group-hover:text-cyan-400 transition-colors" />
              </motion.div>
              Watch Collection Film
            </span>

            {/* Enhanced Hover Glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
            />
            
            {/* Pulsing Border */}
            <motion.div
              className="absolute inset-0 border-2 border-cyan-400 rounded-xl"
              animate={{
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            />
          </motion.button>
        </motion.div>

                 {/* Animated Tagline */}
        <motion.div
           className="relative max-w-4xl mx-auto mb-8"
           initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.8, delay: 1.4 }}
         >
           <div className="relative overflow-hidden">
             {/* Animated Background Glow */}
             <motion.div
               className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"
               animate={{
                 scale: [1, 1.1, 1],
                 opacity: [0.3, 0.6, 0.3],
                 rotate: [0, 5, -5, 0]
               }}
               transition={{
                 duration: 8,
                 repeat: Infinity,
                 ease: "easeInOut"
               }}
             />
             
             {/* Main Tagline */}
            <motion.div
               className="relative z-10 px-8 py-6 rounded-2xl backdrop-blur-sm border border-white/10"
              whileHover={{ 
                 scale: 1.02,
                 boxShadow: "0 20px 40px rgba(59, 130, 246, 0.2)"
               }}
             >
               <motion.h2
                 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center leading-relaxed"
                 initial={{ opacity: 0 }}
                 animate={isInView ? { opacity: 1 } : {}}
                 transition={{ duration: 1, delay: 1.6 }}
               >
                 <motion.span
                   className="text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text"
                   animate={{
                     backgroundPosition: ['0%', '100%', '0%']
                   }}
                   transition={{
                     duration: 4,
                     repeat: Infinity,
                     ease: "easeInOut"
                   }}
                   style={{ backgroundSize: '200% 200%' }}
                 >
                   "Where Street Culture Meets
                 </motion.span>
                 <br />
                 <motion.span
                   className="text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text"
                   animate={{
                     backgroundPosition: ['100%', '0%', '100%']
                   }}
                   transition={{
                     duration: 4,
                     repeat: Infinity,
                     ease: "easeInOut",
                     delay: 2
                   }}
                   style={{ backgroundSize: '200% 200%' }}
                 >
                   Next-Gen Fashion"
                 </motion.span>
               </motion.h2>
               
               {/* Floating Accent Elements */}
               <div className="absolute top-4 left-4">
                 <motion.div
                   className="w-2 h-2 bg-cyan-400 rounded-full"
                   animate={{
                     scale: [1, 1.5, 1],
                     opacity: [0.5, 1, 0.5],
                     y: [0, -10, 0]
                   }}
                   transition={{
                     duration: 3,
                     repeat: Infinity,
                     delay: 0.5
                   }}
                 />
               </div>
               
               <div className="absolute top-4 right-4">
              <motion.div
                   className="w-2 h-2 bg-purple-400 rounded-full"
                   animate={{
                     scale: [1, 1.5, 1],
                     opacity: [0.5, 1, 0.5],
                     y: [0, -10, 0]
                   }}
                   transition={{
                     duration: 3,
                     repeat: Infinity,
                     delay: 1
                   }}
                 />
               </div>
               
               <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <motion.div
                   className="w-2 h-2 bg-pink-400 rounded-full"
                  animate={{
                     scale: [1, 1.5, 1],
                     opacity: [0.5, 1, 0.5],
                     y: [0, -10, 0]
                  }}
                  transition={{
                     duration: 3,
                    repeat: Infinity,
                     delay: 1.5
                  }}
                />
               </div>
                
               {/* Animated Underline */}
                <motion.div
                 className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                 initial={{ width: 0 }}
                 animate={isInView ? { width: '60%' } : { width: 0 }}
                 transition={{ duration: 2, delay: 2.5 }}
               />
             </motion.div>
           </div>
                </motion.div>

         {/* Powerful Scroll Indicator */}
         <motion.div
           className="relative flex flex-col items-center justify-center mt-12 mb-8"
           initial={{ opacity: 0, y: 20 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 1.0, delay: 6.4 }}
         >
           {/* Main Scroll Text */}
                  <motion.div
             className="relative mb-6"
             whileHover={{ scale: 1.05 }}
           >
             <motion.h3
               className="text-base sm:text-lg md:text-xl font-semibold text-gray-300 text-center"
                    animate={{
                 opacity: [0.6, 1, 0.6],
                 y: [0, -2, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                 ease: "easeInOut"
               }}
             >
               <motion.span
                 className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text"
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%']
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                   ease: "easeInOut"
                }}
                style={{ backgroundSize: '200% 200%' }}
              >
                 Explore the Collection
                </motion.span>
              </motion.h3>
           </motion.div>

           {/* Animated Scroll Container */}
           <motion.div
             className="relative flex flex-col items-center cursor-pointer group"
             whileHover={{ scale: 1.1 }}
             onClick={() => {
               const collectionsSection = document.getElementById('collections');
               if (collectionsSection) {
                 collectionsSection.scrollIntoView({ behavior: 'smooth' });
               }
             }}
           >
             {/* Outer Rotating Ring */}
             <motion.div
               className="w-16 h-16 border-2 border-cyan-400/40 rounded-full relative"
               animate={{ rotate: 360 }}
               transition={{
                 duration: 8,
                 repeat: Infinity,
                 ease: "linear"
               }}
             >
               {/* Inner Pulsing Ring */}
               <motion.div
                 className="absolute inset-2 border border-purple-400/60 rounded-full"
                 animate={{
                   scale: [1, 1.2, 1],
                   opacity: [0.6, 1, 0.6]
                 }}
                 transition={{
                   duration: 2,
                   repeat: Infinity,
                   ease: "easeInOut"
                 }}
               />
               
               {/* Center Dot */}
               <motion.div
                 className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                 animate={{
                   scale: [1, 1.5, 1],
                   opacity: [0.8, 1, 0.8]
                 }}
                 transition={{
                   duration: 1.5,
                   repeat: Infinity,
                   ease: "easeInOut"
                 }}
               />
             </motion.div>

             {/* Animated Scroll Line */}
             <motion.div
               className="w-0.5 h-12 bg-gradient-to-b from-cyan-400 via-purple-500 to-transparent mt-4 relative overflow-hidden"
               animate={{
                 opacity: [0.3, 1, 0.3]
               }}
               transition={{
                 duration: 2,
                 repeat: Infinity,
                 ease: "easeInOut"
               }}
             >
               {/* Moving Light Effect */}
               <motion.div
                 className="absolute w-full h-4 bg-gradient-to-b from-cyan-400 to-transparent"
                 animate={{
                   y: [0, 32, 0]
                 }}
                 transition={{
                   duration: 2,
                   repeat: Infinity,
                   ease: "easeInOut"
                 }}
               />
             </motion.div>

             {/* Optimized Floating Particles */}
             {[...Array(3)].map((_, i) => (
               <motion.div
                 key={i}
                 className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                 style={{
                   left: `${50 + Math.cos(i * Math.PI / 1.5) * 25}%`,
                   top: `${50 + Math.sin(i * Math.PI / 1.5) * 25}%`,
                 }}
                 animate={{
                   scale: [0, 1, 0],
                   opacity: [0, 1, 0],
                   y: [0, -15, 0]
                 }}
                 transition={{
                   duration: 2.5,
                   repeat: Infinity,
                   delay: i * 0.5,
                   ease: "easeOut"
                 }}
               />
             ))}

             {/* Hover Glow Effect */}
              <motion.div
               className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ zIndex: -1 }}
              />
            </motion.div>

           {/* Bottom Accent Text */}
           <motion.div
             className="mt-6"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 3.2 }}
           >
             <motion.p
               className="text-xs text-gray-500 text-center"
               animate={{
                 opacity: [0.4, 0.8, 0.4]
               }}
               transition={{
                 duration: 2.5,
                 repeat: Infinity,
                 ease: "easeInOut"
               }}
             >
               Scroll to discover
             </motion.p>
           </motion.div>

           {/* Optimized Energy Waves */}
           <div className="absolute inset-0 pointer-events-none">
             {[...Array(2)].map((_, i) => (
               <motion.div
                 key={i}
                 className="absolute w-24 h-24 border border-cyan-400/20 rounded-full"
                 style={{
                   left: '50%',
                   top: '50%',
                   transform: 'translate(-50%, -50%)'
                 }}
                 animate={{
                   scale: [0.5, 1.8, 0.5],
                   opacity: [0.6, 0, 0.6]
                 }}
                 transition={{
                   duration: 3,
                   repeat: Infinity,
                   delay: i * 1.5,
                   ease: "easeOut"
                 }}
               />
             ))}
           </div>
        </motion.div>

      {/* Original Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <motion.div
            className="w-1 h-16 bg-gradient-to-b from-transparent via-cyan-400 to-transparent rounded-full"
              animate={{ 
                height: [40, 64, 40],
              opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <motion.div
            className="w-8 h-8 border border-cyan-400 rounded-full mt-4 flex items-center justify-center"
            animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
              className="w-1 h-1 bg-cyan-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Interactive Mouse Follower */}
      <ProfessionalCursorTrail />
    </section>
  );
};

export default HeroSection;