import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useCallback, useMemo } from "react";
import { ArrowRight, Sparkles, Eye, ShoppingCart, Heart, Zap, Star, Timer, TrendingUp, Users, Package, Lock, Bell, Clock, Gift, X } from 'lucide-react';
import MagneticButton from '@/components/ui/MagneticButton';
import ParallaxHeading from '@/components/ui/ParallaxHeading';

// Import product photos from assets
import product1Image from '@/assets/Gemini_Generated_Image_7c76vw7c76vw7c76.png';
import product2Image from '@/assets/Gemini_Generated_Image_ug5h7fug5h7fug5h.png';
import product3Image from '@/assets/4.png';

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

const CategorySections = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showComingSoonNotification, setShowComingSoonNotification] = useState(false);
  const performanceMode = usePerformanceMode();

  // Memoize categories to prevent unnecessary re-renders
  const categories = useMemo(() => [
    {
      id: 'streetwear',
      title: 'Streetwear Collection',
      subtitle: 'Racing-Inspired Apparel',
      description: 'Premium racing-inspired streetwear including tank tops, I-shirts, pants, and shorts. Each piece embodies the spirit of speed and urban culture.',
      image: product2Image,
      route: '/tshirts',
      count: '4+',
      color: 'from-blue-600 to-purple-600',
      bgGradient: 'from-blue-900/20 to-purple-900/20',
      borderColor: 'border-blue-500/30',
      accentColor: 'text-blue-400',
      featured: ['Racing Tank Tops', 'Street Pants', 'Gridlock Shorts'],
      stats: { items: '4+', newDrops: '2', trending: '4' },
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: 'masks',
      title: 'Masks',
      subtitle: 'Style Meets Protection',
      description: 'Revolutionary protection meets uncompromising style in our designer mask collection. Where fashion meets function seamlessly.',
      image: product1Image,
      route: '/masks',
      count: '15+',
      color: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-900/20 to-pink-900/20',
      borderColor: 'border-purple-500/30',
      accentColor: 'text-purple-400',
      featured: ['Tech Masks', 'Designer Series', 'Custom Fit'],
      stats: { items: '15+', newDrops: '3', trending: '8' },
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 'accessories',
      title: 'Accessories',
      subtitle: 'Complete Your Look',
      description: 'Complete your look with premium streetwear accessories that make a statement. From watches to chains, every piece is crafted for impact.',
      image: product3Image,
      route: '/accessories',
      count: '30+',
      color: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-900/20 to-red-900/20',
      borderColor: 'border-orange-500/30',
      accentColor: 'text-orange-400',
      featured: ['Watches', 'Chains', 'Caps & Beanies'],
      stats: { items: '30+', newDrops: '7', trending: '15' },
      gradient: 'from-orange-500 to-red-600',
      isComingSoon: true,
      comingSoonDate: '2024-02-15'
    }
  ], []);

  const filters = useMemo(() => [
    { id: 'all', label: 'All Collections', icon: Package },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'new', label: 'New Drops', icon: Sparkles },
    { id: 'popular', label: 'Popular', icon: Users }
  ], []);

  // Memoize functions to prevent unnecessary re-renders
  const getProductsByCategory = useCallback((categoryName: string) => {
    return [
      { id: 1, name: 'Urban Tee', price: 49.99, image: '/src/assets/1.png' },
      { id: 2, name: 'Street Hoodie', price: 79.99, image: '/src/assets/3.png' },
      { id: 3, name: 'Designer Mask', price: 29.99, image: '/src/assets/4.png' }
    ];
  }, []);

  const handleAddToCart = useCallback((productId: number) => {
    console.log('Added to cart:', productId);
  }, []);

  const handleCategoryClick = useCallback((route: string, isComingSoon: boolean = false) => {
    if (isComingSoon) {
      setShowComingSoonNotification(true);
      // Auto-hide notification after 4 seconds
      setTimeout(() => setShowComingSoonNotification(false), 4000);
      return;
    }
    window.location.href = route;
  }, []);

  // Optimized hover handlers with debouncing
  const handleHoverStart = useCallback((categoryId: string) => {
    setHoveredCategory(categoryId);
  }, []);

  const handleHoverEnd = useCallback(() => {
    setHoveredCategory(null);
  }, []);

  return (
    <section ref={ref} id="collections" className="relative py-14 sm:py-20 overflow-hidden">
      {/* Simplified Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-purple-900/5 to-background" />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Enhanced Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }} // Faster
        >
          <motion.div
            className="flex items-center justify-center gap-6 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }} // Faster
          >
            <ParallaxHeading>
              <motion.div
              className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }} // Much slower
            >
              <Sparkles className="w-5 h-5 text-purple-400 fill-purple-400" />
            </motion.div>
            </ParallaxHeading>
            <ParallaxHeading offset={24}>
              <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-foreground via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Explore Collections
            </h2>
            </ParallaxHeading>
            <ParallaxHeading>
              <motion.div
              className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30"
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }} // Much slower
            >
              <Sparkles className="w-5 h-5 text-purple-400 fill-purple-400" />
            </motion.div>
            </ParallaxHeading>
          </motion.div>
          
          <motion.p 
            className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }} // Faster
          >
            Discover our curated collections of premium streetwear designed for the modern rebel. 
            Each piece tells a story of authenticity and bold expression.
          </motion.p>
        </motion.div>

        {/* Enhanced Filter Tabs */}
        <motion.div
          className="flex justify-center mb-10 sm:mb-16 px-2 overflow-x-auto no-scrollbar"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }} // Faster
        >
          <div className="inline-flex bg-muted/30 backdrop-blur-sm rounded-2xl p-2 border border-border/50 shadow-xl whitespace-nowrap">
            {filters.slice(0,1).map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className="relative px-8 py-3 rounded-xl font-bold text-sm shrink-0 text-primary-foreground"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(59,130,246,1) 100%)'
                  }}
                  animate={{ backgroundPosition: ['0% 50%','100% 50%','0% 50%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  <filter.icon className="w-4 h-4 text-white" />
                  {filter.label}
                </span>
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ boxShadow: '0 0 30px rgba(147, 51, 234, 0.35)' }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Redesigned Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
          {categories.map((category, index) => {
            const categoryProducts = getProductsByCategory(category.id);
            const isHovered = hoveredCategory === category.id;
            
            return (
              <motion.div
                key={category.id}
                className="group relative"
                initial={{ opacity: 0, y: 40, scale: 0.95 }} // Reduced movement
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ 
                  duration: 0.6, // Faster
                  delay: index * 0.15, // Reduced delay
                  type: "spring",
                  stiffness: 80 // Reduced stiffness
                }}
              >
                {/* Enhanced Main Category Card */}
                <motion.div
                  className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 ${category.borderColor} bg-gradient-to-br ${category.bgGradient} backdrop-blur-sm cursor-pointer group-hover:shadow-xl transition-all duration-300 h-[420px] sm:h-[560px] lg:h-[600px]`}
                  whileHover={{ 
                    y: -10, // Reduced movement
                    scale: 1.01, // Reduced scale
                    transition: { duration: 0.2 } // Much faster
                  }}
                  onHoverStart={() => handleHoverStart(category.id)}
                  onHoverEnd={handleHoverEnd}
                  onClick={() => handleCategoryClick(category.route, category.isComingSoon)}
                >
                  {/* Enhanced Background Image Section (60% of card) */}
                  <div className="relative h-[240px] sm:h-[320px] lg:h-[360px] overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${category.image})`,
                      }}
                      animate={isHovered ? { scale: 1.05 } : { scale: 1 }} // Reduced scale
                      transition={{ duration: 0.3 }} // Faster
                    />
                    
                    {/* Enhanced Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent`} />
                    
                    {/* Coming Soon Overlay */}
                    {category.isComingSoon && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Lock Icon with Animation */}
                        <motion.div
                          className="relative mb-6"
                          animate={{
                            y: [0, -5, 0],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
                            <Lock className="w-8 h-8 text-white" />
                          </div>
                          
                          {/* Pulsing Ring */}
                          <motion.div
                            className="absolute inset-0 border-2 border-orange-400 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 0, 0.5]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </motion.div>

                        {/* Coming Soon Text */}
                        <motion.div
                          className="text-center mb-4"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                        >
                          <h3 className="text-2xl font-bold text-white mb-2">
                            Coming Soon
                          </h3>
                          <p className="text-orange-300 text-sm font-medium">
                            Premium Accessories Collection
                          </p>
                        </motion.div>

                        {/* Countdown Timer */}
                        <motion.div
                          className="flex items-center gap-2 text-orange-400"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                        >
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Launching Soon
                          </span>
                        </motion.div>

                        {/* Floating Particles for Coming Soon */}
                        {!performanceMode && (
                          <div className="absolute inset-0 pointer-events-none">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-orange-400 rounded-full"
                                style={{
                                  left: `${20 + Math.random() * 60}%`,
                                  top: `${20 + Math.random() * 60}%`,
                                }}
                                animate={{
                                  y: [0, -20, 0],
                                  opacity: [0, 1, 0],
                                  scale: [0, 1, 0]
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  delay: i * 0.5,
                                  ease: "easeInOut"
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    {/* VLANCO Brand Watermark */}
                    <motion.div
                      className="absolute top-4 left-4 text-white/10 font-black text-2xl tracking-wider"
                      animate={isHovered ? { opacity: 0.2 } : { opacity: 0.1 }}
                      transition={{ duration: 0.2 }} // Faster
                    >
                      VLANCO
                    </motion.div>
                    
                    {/* Enhanced Stats Badge */}
                    <motion.div
                      className={`absolute top-6 left-6 flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full border shadow-lg ${
                        category.isComingSoon 
                          ? 'bg-orange-500/90 border-orange-400/50' 
                          : 'bg-background/90 border-border/50'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.2 + 0.3 }} // Reduced delay
                    >
                      {category.isComingSoon ? (
                        <>
                          <Gift className="w-3 h-3 text-white" />
                          <span className="text-sm font-bold text-white">Coming Soon</span>
                        </>
                      ) : (
                        <>
                          <div className={`w-2 h-2 ${category.color.replace('from-', 'bg-').split(' ')[0]} rounded-full`} />
                          <span className="text-sm font-bold">{category.count} Items</span>
                        </>
                      )}
                    </motion.div>


                    {/* Ultra-optimized Floating Elements - only 2, disabled on performance mode */}
                    {!performanceMode && (
                      <AnimatePresence>
                        {isHovered && (
                          <>
                            {[...Array(2)].map((_, i) => ( // Reduced from 3 to 2
                              <motion.div
                                key={i}
                                className={`absolute w-1 h-1 bg-gradient-to-r ${category.color} rounded-full shadow-lg`} // Even smaller size
                                style={{
                                  left: `${30 + Math.random() * 40}%`,
                                  top: `${30 + Math.random() * 40}%`,
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                  scale: [0, 0.6, 0], // Further reduced scale
                                  opacity: [0, 0.4, 0], // Further reduced opacity
                                  y: [0, -15, -30], // Further reduced movement
                                  x: [0, Math.random() * 10 - 5, Math.random() * 20 - 10], // Further reduced movement
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                  duration: 2, // Slower for smoother effect
                                  delay: i * 0.1, // Increased delay
                                  ease: "easeOut"
                                }}
                              />
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Enhanced Content Section (40% of card) */}
                  <div className="p-4 sm:p-5 md:p-6 lg:p-8 h-[160px] sm:h-[180px] md:h-[220px] lg:h-[240px] flex flex-col justify-between">
                    <div>
                      <motion.div
                        className="mb-4"
                        animate={isHovered ? { y: -2 } : { y: 0 }} // Reduced movement
                        transition={{ duration: 0.2 }} // Faster
                      >
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <span className={`text-sm font-bold ${category.accentColor} opacity-90 tracking-wide`}>
                            {category.subtitle}
                          </span>
                          <motion.div
                            className="flex items-center gap-1"
                            animate={isHovered ? { scale: 1.05 } : { scale: 1 }} // Reduced scale
                          >
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold">4.8</span>
                          </motion.div>
                        </div>
                        
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                          {category.description}
                        </p>
                      </motion.div>

                      {/* Enhanced Tags */}
                      <motion.div 
                        className="mb-4 sm:mb-6"
                        initial={{ opacity: 0 }}
                        animate={isHovered ? { opacity: 1 } : { opacity: 0.8 }}
                        transition={{ duration: 0.2 }} // Faster
                      >
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {category.featured.map((item, i) => (
                            <motion.span
                              key={item}
                              className="px-2.5 py-1 bg-muted/60 rounded-full text-[10px] sm:text-xs font-bold border border-border/30"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 + 0.2 }} // Reduced delay
                            >
                              {item}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* Enhanced Stats Grid */}
                    <motion.div 
                      className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
                      animate={isHovered ? { y: -1 } : { y: 0 }} // Reduced movement
                      transition={{ duration: 0.2 }} // Faster
                    >
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-black">{category.stats.items}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-black text-green-500">{category.stats.newDrops}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">New</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-black text-orange-500">{category.stats.trending}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Trending</div>
                      </div>
                    </motion.div>

                    {/* Enhanced CTA Button */}
                    <motion.button
                      className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r ${category.color} text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm group-hover:shadow-lg transition-all duration-200 border-2 border-transparent group-hover:border-white/20`}
                      whileHover={{ scale: 1.01, y: -1 }} // Reduced scale and movement
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(category.route);
                      }}
                    >
                      <span>Explore Collection</span>
                      <motion.div
                        animate={isHovered ? { x: 2 } : { x: 0 }}
                        transition={{ duration: 0.2 }} // Faster
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </motion.button>
                  </div>

                  {/* Simplified Hover Glow Effect */}
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-r ${category.bgGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg -z-10`} // Reduced opacity and duration
                    animate={isHovered ? { scale: 1.1 } : { scale: 1 }} // Reduced scale
                  />

                  {/* Simplified 3D Shadow */}
                  <div className="absolute inset-0 bg-black/5 transform translate-y-1 -z-20 rounded-3xl" /> // Reduced shadow
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Bottom CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }} // Reduced movement
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }} // Faster
        >
          <MagneticButton
            className="inline-flex items-center gap-3 sm:gap-4 px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-base sm:text-lg shadow-xl hover:shadow-purple-500/20 transition-all relative overflow-hidden group hidden md:inline-flex"
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" // Faster
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
            />
            
            <span className="relative z-10 flex items-center gap-3">
              <Eye className="w-5 h-5" />
              View All Collections
            </span>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Coming Soon Notification */}
      <AnimatePresence>
        {showComingSoonNotification && (
          <motion.div
            className="fixed top-4 right-4 z-50 max-w-sm"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.5 
            }}
          >
            <div className="bg-gradient-to-br from-orange-500/95 to-red-600/95 backdrop-blur-xl border border-orange-400/50 rounded-2xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Bell className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-white font-bold text-lg">Coming Soon!</h3>
                  <p className="text-orange-100 text-sm">Premium Accessories</p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <p className="text-white/90 text-sm leading-relaxed">
                  We're crafting something extraordinary! Our premium accessories collection is launching soon with exclusive watches, chains, and streetwear essentials.
                </p>
              </div>

              {/* Features Preview */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {['Watches', 'Chains', 'Caps'].map((item, index) => (
                  <motion.div
                    key={item}
                    className="bg-white/10 rounded-lg p-2 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-white text-xs font-medium">{item}</div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Notify Me
                </motion.button>
                <motion.button
                  onClick={() => setShowComingSoonNotification(false)}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>Launch Progress</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <motion.div
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CategorySections; 