import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import CategorySections from '@/components/CategorySections';
import FeaturesSection from '@/components/FeaturesSection';
import BrandExperience from '@/components/BrandExperience';
import Footer from '@/components/Footer';
import { ArrowUp, Sparkles, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Transform values for parallax effects
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const scaleParallax = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Improved floating particles that don't interfere with mouse
  const FloatingParticles = ({ count = 15, size = 'small' }) => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className={`absolute rounded-full ${
            size === 'small' ? 'w-1 h-1' : size === 'medium' ? 'w-2 h-2' : 'w-3 h-3'
          } bg-gradient-to-br from-primary/30 to-purple-500/30`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [0, 1, 0.5, 1, 0],
            opacity: [0, 0.6, 0.8, 0.3, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  // Professional gradient orbs with smooth movement
  const GradientOrbs = () => (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
        style={{ y: yParallax }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        style={{ y: yParallax, scale: scaleParallax }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6
        }}
      />
    </div>
  );

  // Advanced scroll progress indicator
  const ScrollProgress = () => (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-500 origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  );

  // Section dividers with animated elements
  const SectionDivider = ({ icon: Icon, direction = 'left' }) => (
    <div className="relative py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
      <motion.div
        className="max-w-7xl mx-auto px-6 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="flex items-center gap-6"
          animate={{ x: direction === 'left' ? [-10, 10, -10] : [10, -10, 10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-primary/50" />
          <motion.div
            className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Icon className="w-6 h-6 text-purple-400 fill-purple-400" />
          </motion.div>
          <div className="w-24 h-[1px] bg-gradient-to-l from-transparent to-primary/50" />
        </motion.div>
      </motion.div>
    </div>
  );

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Enhanced Background Effects */}
      <GradientOrbs />
      <FloatingParticles count={12} size="small" />
      
      {/* Scroll Progress */}
      <ScrollProgress />

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <HeroSection />
      </motion.section>

      {/* Section Divider */}
      <SectionDivider icon={Sparkles} direction="right" />

      {/* Category Sections with enhanced entrance */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative"
      >
        <FloatingParticles count={8} size="medium" />
        <CategorySections />
      </motion.section>

      {/* Section Divider */}
      <SectionDivider icon={Star} direction="left" />

      {/* Features Section with parallax */}
      <motion.section
        style={{ y: useTransform(scrollYProgress, [0.3, 0.7], [50, -50]) }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative"
      >
        <FeaturesSection />
      </motion.section>

      {/* Section Divider */}
      <SectionDivider icon={Zap} direction="right" />

      {/* Brand Experience with enhanced effects */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative"
      >
        <FloatingParticles count={10} size="small" />
        <BrandExperience />
      </motion.section>

      {/* Enhanced Footer with fade in */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <Footer />
      </motion.footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-gradient-to-br from-primary to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50 group"
            initial={{ opacity: 0, scale: 0, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 100 }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Enhanced corner decorations */}
      <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-br-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>
      
      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-tl-full"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Professional grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
    </motion.div>
  );
};

export default Index;
