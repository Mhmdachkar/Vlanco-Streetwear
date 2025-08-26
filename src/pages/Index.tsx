import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue } from 'framer-motion';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import CategorySections from '@/components/CategorySections';
import FeaturesSection from '@/components/FeaturesSection';
import VlancoCommunity from '@/components/VlancoCommunity';
import LimitedDrops from '@/components/LimitedDrops';
import Footer from '@/components/Footer';
import { ArrowUp, Sparkles, Star, Zap } from 'lucide-react';

// --- Optimized Animated Background Component ---
// All background logic is now neatly encapsulated and optimized here.
const AnimatedBackground = ({ opacity }) => {
  const mousePos = useRef({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Initialize particles only once
    const newParticles = [...Array(40)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      size: Math.random() * 2 + 1,
      color: ['#8B5CF6', '#06B6D4', '#EC4899'][Math.floor(Math.random() * 3)],
      connectionDistance: Math.random() * 15 + 10,
    }));
    setParticles(newParticles);

    // Update mouse position using a ref to avoid re-renders
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // Use a useCallback for the animation loop
  const animateParticles = useCallback(() => {
    setParticles(prevParticles => 
      prevParticles.map(p => {
        let newX = p.x + p.vx;
        let newY = p.y + p.vy;
        let newVx = p.vx;
        let newVy = p.vy;

        // Bounce off edges
        if (newX <= 0 || newX >= 100) newVx *= -1;
        if (newY <= 0 || newY >= 100) newVy *= -1;

        // Mouse attraction (reading from ref)
        const mouseXPercent = (mousePos.current.x / window.innerWidth) * 100;
        const mouseYPercent = (mousePos.current.y / window.innerHeight) * 100;
        const dx = mouseXPercent - newX;
        const dy = mouseYPercent - newY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
          newVx += dx * 0.0005;
          newVy += dy * 0.0005;
        }

        return {
          ...p,
          x: newX,
          y: newY,
          vx: newVx * 0.99, // friction
          vy: newVy * 0.99, // friction
        };
      })
    );
    animationFrameId.current = requestAnimationFrame(animateParticles);
  }, []);
  
  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(animateParticles);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [animateParticles]);

  return (
    <motion.div 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity }} // Control visibility via opacity
    >
      {/* Neural Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Quantum Orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: `${250 + i * 100}px`,
            height: `${250 + i * 100}px`,
            left: `${10 + i * 25}%`,
            top: `${15 + i * 20}%`,
            background: ['#8B5CF630', '#06B6D430', '#EC489930'][i]
          }}
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Simplified Particles */}
      <svg className="absolute inset-0 w-full h-full">
        {/* Connection Lines */}
        {particles.map((p1, i) => {
          const connections = [];
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
            if (distance < p1.connectionDistance) {
              connections.push(
                <line
                  key={`${p1.id}-${p2.id}`}
                  x1={`${p1.x}%`} y1={`${p1.y}%`}
                  x2={`${p2.x}%`} y2={`${p2.y}%`}
                  stroke={p1.color}
                  strokeWidth="0.5"
                  strokeOpacity={1 - (distance / p1.connectionDistance)}
                />
              );
              if (connections.length >= 2) break;
            }
          }
          return connections;
        })}
        {/* Particles */}
        {particles.map((p) => (
          <circle
            key={p.id}
            cx={`${p.x}%`} cy={`${p.y}%`}
            r={p.size / 2}
            fill={p.color}
          />
        ))}
      </svg>
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
      
      {/* Background hidden on mobile for performance */}
      {!isMobile && <AnimatedBackground opacity={backgroundOpacity} />}
      
      {/* Cursor effect hidden on mobile */}
      {!isMobile && <NeuralCursor mouseX={mouseX} mouseY={mouseY} />}
      
      {/* --- Main Page Content --- */}
      <div className="relative z-20">
        <Navigation />
      </div>

      <main className="relative z-10">
        <HeroSection />
        <NeuralSectionDivider icon={Sparkles} />
        <CategorySections />
        <NeuralSectionDivider icon={Star} />
        <LimitedDrops />
        <NeuralSectionDivider icon={Zap} />
        <FeaturesSection />
        <VlancoCommunity />
      </main>
      
      <footer className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent" />
        <Footer />
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 p-2 md:p-3 bg-gradient-to-br from-purple-600 to-cyan-600 text-white rounded-full shadow-lg z-50"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple Section Divider Component
const NeuralSectionDivider = ({ icon: Icon }) => (
  <div className="relative py-12 flex justify-center">
    <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
    {Icon && (
      <div className="mx-4 p-2 bg-purple-500/10 rounded-full border border-purple-500/30">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
    )}
    <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
  </div>
);

export default Index;