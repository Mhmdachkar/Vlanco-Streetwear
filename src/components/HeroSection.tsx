import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useInView } from 'framer-motion';
import { ShoppingBag, Play, ArrowRight, Sparkles, Star, Heart, Zap } from 'lucide-react';

// Optimized Smoky Word Animation Component
const AnimatedText = React.memo(({ text, className, delay = 0, duration = 1.2, isInView }: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  isInView: boolean;
}) => {
  const words = useMemo(() => text.split(' '), [text]);
  
  // Memoize transition config to prevent recreation
  const getTransition = useCallback((index: number) => ({
    duration: duration,
    delay: delay + index * 0.15,
    ease: [0.25, 0.46, 0.45, 0.94] as const,
    opacity: {
      duration: duration * 0.8,
      ease: "easeOut" as const
    },
    y: {
      duration: duration * 1.2,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    },
    scale: {
      duration: duration * 0.9,
      ease: "easeOut" as const
    },
    filter: {
      duration: duration * 1.1,
      ease: "easeOut" as const
    }
  }), [duration, delay]);
  
  return (
    <span className={className}>
      {words.map((word, index) => (
        <motion.span
          key={`${text}-${index}`}
          className="animated-text inline-block mr-2 relative"
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
          transition={getTransition(index)}
        >
          {word}
          {/* Optimized glow effect */}
          {isInView && (
            <motion.div
              className="absolute inset-0 opacity-0"
              animate={{ 
                opacity: [0, 0.3, 0],
                scale: [0.8, 1.1, 1]
              }}
              transition={{
                duration: duration * 1.5,
                delay: delay + index * 0.15,
                ease: "easeOut"
              }}
              style={{
                background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
                filter: 'blur(2px)',
                borderRadius: '4px',
                willChange: 'transform, opacity'
              }}
            />
          )}
        </motion.span>
      ))}
    </span>
  );
});

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [0, 1], [10, -10]);
  const rotateY = useTransform(mouseX, [0, 1], [-10, 10]);

  // Optimized mouse tracking with throttling and reduced updates
  useEffect(() => {
    let animationFrame: number;
    let lastUpdate = 0;
    const throttleDelay = 16; // ~60fps
    
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate < throttleDelay) return;
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      
      animationFrame = requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          mouseX.set(x);
          mouseY.set(y);
          setMousePosition({ x, y });
          lastUpdate = now;
        }
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [mouseX, mouseY]);

  return (
    <section 
      ref={containerRef}
      className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        {/* Animated Grid */}
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

        {/* Ultra-Optimized Floating Particles - Minimal for Performance */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="particle absolute w-1 h-1 bg-gradient-to-br from-cyan-400/30 to-blue-500/15 rounded-full"
            style={{
              left: `${25 + (i * 15)}%`,
              top: `${35 + (i * 12)}%`,
              willChange: 'transform, opacity'
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [0, 1, 0.8, 1, 0],
              opacity: [0, 0.4, 0.2, 0.1, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Optimized Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          style={{ willChange: 'transform, opacity' }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          style={{ willChange: 'transform, opacity' }}
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.2, 0.4],
            x: [0, -20, 0],
            y: [0, 15, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, delay: 6, ease: "easeInOut" }}
        />

        {/* Geometric Shapes */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 border border-cyan-400/30 transform rotate-45"
          animate={{ rotate: [45, 405, 45] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        
        <motion.div
          className="absolute bottom-32 right-32 w-24 h-24 border border-purple-400/30 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 12, repeat: Infinity }}
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
            className="text-5xl md:text-7xl lg:text-9xl font-black text-center relative"
            initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
            animate={isInView ? { opacity: 1, scale: 1, rotateX: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.5, type: "spring" as const }}
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
              animate={isInView ? { width: '400px' } : { width: 0 }}
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

        {/* Smoky Description with Word-by-Word Animation */}
        <motion.div
          className="mb-12 px-4 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.8 }}
        >
          <div className="text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto text-center relative">
            {/* Fallback Static Text - Always Visible */}
            <div className="opacity-20">
              <div className="mb-3">
                <span className="text-transparent bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text">
                  Where street culture meets cutting-edge design.
                </span>
              </div>
              <div className="mb-3">
                <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text font-semibold">
                  Discover premium streetwear
                </span>
              </div>
              <div>
                <span className="text-transparent bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text">
                  that defines the next generation of urban fashion.
                </span>
              </div>
            </div>
            
            {/* Animated Text Overlay */}
            <div className="absolute inset-0 top-0 left-0 right-0">
              {/* First Line - Smoky Appearance */}
              <div className="mb-3">
                <AnimatedText
                  text="Where street culture meets cutting-edge design."
                  className="text-transparent bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text"
                  delay={1.2}
                  duration={1.2}
                  isInView={isInView}
                />
              </div>
              
              {/* Second Line - Highlighted with Smoky Effect */}
              <div className="mb-3">
                <AnimatedText
                  text="Discover premium streetwear"
                  className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text font-semibold"
                  delay={2.5}
                  duration={1.2}
                  isInView={isInView}
                />
              </div>
              
              {/* Third Line - Final Smoky Appearance */}
              <div>
                <AnimatedText
                  text="that defines the next generation of urban fashion."
                  className="text-transparent bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text"
                  delay={3.8}
                  duration={1.2}
                  isInView={isInView}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.0, delay: 5.2 }}
        >
          {/* Enhanced Shop Now Button */}
          <motion.button
            className="group relative px-8 py-4 sm:px-10 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold text-base sm:text-lg shadow-2xl overflow-hidden"
            whileHover={{ 
              scale: 1.05, 
              y: -3,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)"
            }}
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
            className="group relative px-8 py-4 sm:px-10 sm:py-4 border-2 border-cyan-400/50 text-gray-300 rounded-xl font-semibold text-base sm:text-lg backdrop-blur-sm bg-white/5 overflow-hidden"
            whileHover={{ 
              scale: 1.05,
              borderColor: "rgba(59, 130, 246, 1)",
              color: "rgba(59, 130, 246, 1)",
              y: -3,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
            }}
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
                 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center leading-relaxed"
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
           className="scroll-indicator relative flex flex-col items-center justify-center mt-12 mb-8"
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
               className="text-lg md:text-xl font-semibold text-gray-300 text-center"
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

             {/* Minimal Floating Particles */}
             {[...Array(2)].map((_, i) => (
               <motion.div
                 key={i}
                 className="absolute w-0.5 h-0.5 bg-cyan-400/60 rounded-full"
                 style={{
                   left: `${50 + Math.cos(i * Math.PI) * 20}%`,
                   top: `${50 + Math.sin(i * Math.PI) * 20}%`,
                   willChange: 'transform, opacity'
                 }}
                 animate={{
                   scale: [0, 1, 0],
                   opacity: [0, 0.8, 0],
                   y: [0, -10, 0]
                 }}
                 transition={{
                   duration: 3,
                   repeat: Infinity,
                   delay: i * 1,
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

           {/* Minimal Energy Waves */}
           <div className="absolute inset-0 pointer-events-none">
             <motion.div
               className="absolute w-20 h-20 border border-cyan-400/15 rounded-full"
               style={{
                 left: '50%',
                 top: '50%',
                 transform: 'translate(-50%, -50%)',
                 willChange: 'transform, opacity'
               }}
               animate={{
                 scale: [0.5, 1.5, 0.5],
                 opacity: [0.4, 0, 0.4]
               }}
               transition={{
                 duration: 4,
                 repeat: Infinity,
                 ease: "easeOut"
               }}
             />
           </div>
         </motion.div>


      </div>

      {/* Interactive Mouse Follower */}
      <motion.div
        className="absolute pointer-events-none z-20 hidden sm:block"
        style={{
          left: mousePosition.x * 100 + '%',
          top: mousePosition.y * 100 + '%',
          x: '-50%',
          y: '-50%',
        }}
      >
        <motion.div
          className="w-32 h-32 border border-cyan-400/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="w-4 h-4 bg-cyan-400 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;