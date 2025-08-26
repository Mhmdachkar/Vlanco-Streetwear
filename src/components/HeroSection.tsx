import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useInView } from 'framer-motion';
import { ShoppingBag, Play, ArrowRight, Sparkles, Star, Heart, Zap } from 'lucide-react';

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [0, 1], [10, -10]);
  const rotateY = useTransform(mouseX, [0, 1], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x);
        mouseY.set(y);
        setMousePosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, [mouseX, mouseY]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"
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

        {/* Enhanced Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-br from-cyan-400/40 to-blue-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
              scale: [0, 1, 0.6, 1, 0],
              opacity: [0, 0.8, 0.6, 0.3, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 8 + 5,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 4 }}
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
        
        {/* Brand Title */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1 
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            VLANCO
          </motion.h1>
        </motion.div>

        {/* Description */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.p 
            className="text-sm md:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto px-2"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Where street culture meets cutting-edge design. 
            Discover premium streetwear that defines the next generation of urban fashion.
          </motion.p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
        >
          {/* Shop Now Button */}
          <motion.button
            className="group relative px-6 py-3 sm:px-8 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium text-sm sm:text-base shadow-lg overflow-hidden"
            whileHover={{ 
              scale: 1.02, 
              y: -2
            }}
            whileTap={{ scale: 0.98 }}
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
              transition={{ duration: 0.3 }}
            />
            
            <span className="relative z-10 flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            Shop Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>

            {/* Ripple Effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-400"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>

          {/* Watch Film Button */}
          <motion.button
            className="group relative px-6 py-3 sm:px-8 sm:py-3 border border-gray-400/50 text-gray-300 rounded-lg font-medium text-sm sm:text-base backdrop-blur-sm bg-white/5 overflow-hidden"
            whileHover={{ 
              scale: 1.02,
              borderColor: "rgba(59, 130, 246, 0.8)",
              color: "rgba(59, 130, 246, 1)",
              y: -2
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const brandSection = document.getElementById('brand-experience');
              if (brandSection) {
                brandSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <span className="relative z-10 flex items-center gap-3">
              <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Watch Collection Film
            </span>

            {/* Hover glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </motion.button>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="flex gap-4 overflow-x-auto md:grid md:grid-cols-3 md:gap-12 max-w-4xl mx-auto px-2 no-scrollbar"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          {[
            { 
              number: "500+", 
              label: "Exclusive Designs", 
              icon: Sparkles,
              color: "from-yellow-400 to-orange-500"
            },
            { 
              number: "50K+", 
              label: "Happy Customers", 
              icon: Heart,
              color: "from-pink-400 to-red-500"
            },
            { 
              number: "99%", 
              label: "Satisfaction Rate", 
              icon: Star,
              color: "from-green-400 to-emerald-500"
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group cursor-pointer min-w-[220px]"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 1.6 + index * 0.2, type: "spring" }}
              whileHover={{ 
                scale: 1.1, 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <motion.div
                className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center shadow-2xl`}
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                <stat.icon className="w-8 h-8 text-white" />
              </motion.div>
              
              <motion.h3 
                className={`text-3xl md:text-5xl font-black text-transparent bg-gradient-to-r ${stat.color} bg-clip-text mb-2`}
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%']
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  delay: index * 0.5
                }}
                style={{ backgroundSize: '200% 200%' }}
              >
                {stat.number}
              </motion.h3>
              
              <p className="text-gray-400 text-lg font-medium group-hover:text-gray-300 transition-colors">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

      {/* Scroll Indicator */}
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