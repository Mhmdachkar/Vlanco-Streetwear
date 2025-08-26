import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useCallback, useMemo } from "react";
import { ArrowRight, Shirt, Shield, Watch, Sparkles, Eye, ShoppingCart, Heart, Zap, Star, Timer, TrendingUp, Users, Package } from 'lucide-react';

// Import product photos from assets
import product1Image from '@/assets/product-1.jpg';
import product2Image from '@/assets/product-2.jpg';
import product3Image from '@/assets/product-3.jpg';

const CategorySections = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Memoize categories to prevent unnecessary re-renders
  const categories = useMemo(() => [
    {
      id: 'tshirts',
      title: 'T-Shirts',
      subtitle: 'Urban Essentials',
      description: 'Premium streetwear tees that define your style with comfort and authenticity. Each piece tells a story of urban culture and bold expression.',
      image: product1Image,
      route: '/tshirts',
      count: '25+',
      color: 'from-blue-600 to-purple-600',
      bgGradient: 'from-blue-900/20 to-purple-900/20',
      borderColor: 'border-blue-500/30',
      accentColor: 'text-blue-400',
      icon: Shirt,
      featured: ['Urban Basic', 'Graphic Tees', 'Limited Edition'],
      stats: { items: '25+', newDrops: '5', trending: '12' },
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: 'masks',
      title: 'Masks',
      subtitle: 'Style Meets Protection',
      description: 'Revolutionary protection meets uncompromising style in our designer mask collection. Where fashion meets function seamlessly.',
      image: product2Image,
      route: '/masks',
      count: '15+',
      color: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-900/20 to-pink-900/20',
      borderColor: 'border-purple-500/30',
      accentColor: 'text-purple-400',
      icon: Shield,
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
      icon: Watch,
      featured: ['Watches', 'Chains', 'Caps & Beanies'],
      stats: { items: '30+', newDrops: '7', trending: '15' },
      gradient: 'from-orange-500 to-red-600'
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
      { id: 1, name: 'Urban Tee', price: 49.99, image: '/src/assets/product-1.jpg' },
      { id: 2, name: 'Street Hoodie', price: 79.99, image: '/src/assets/product-2.jpg' },
      { id: 3, name: 'Designer Mask', price: 29.99, image: '/src/assets/product-3.jpg' }
    ];
  }, []);

  const handleAddToCart = useCallback((productId: number) => {
    console.log('Added to cart:', productId);
  }, []);

  const handleCategoryClick = useCallback((route: string) => {
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
      
      {/* Reduced Floating Particles - only 5 instead of 20 */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0], // Reduced movement
              opacity: [0, 0.5, 0], // Reduced opacity
              scale: [0, 0.8, 0], // Reduced scale
            }}
            transition={{
              duration: Math.random() * 8 + 8, // Slower
              repeat: Infinity,
              delay: Math.random() * 3, // Reduced delay
            }}
          />
        ))}
      </div>

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
            <motion.div
              className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }} // Much slower
            >
              <Sparkles className="w-5 h-5 text-purple-400 fill-purple-400" />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-foreground via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Explore Collections
            </h2>
            <motion.div
              className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30"
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }} // Much slower
            >
              <Sparkles className="w-5 h-5 text-purple-400 fill-purple-400" />
            </motion.div>
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
            {filters.map((filter, index) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 shrink-0 ${
                  activeFilter === filter.id
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                whileHover={{ scale: 1.02 }} // Reduced scale
                whileTap={{ scale: 0.98 }}
              >
                {activeFilter === filter.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl"
                    layoutId="activeFilter"
                    transition={{ type: "spring", stiffness: 200, damping: 25 }} // Reduced stiffness
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <filter.icon className="w-4 h-4 text-purple-400" />
                  {filter.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Redesigned Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
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
                  onClick={() => handleCategoryClick(category.route)}
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
                      className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full border border-border/50 shadow-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.2 + 0.3 }} // Reduced delay
                    >
                      <div className={`w-2 h-2 ${category.color.replace('from-', 'bg-').split(' ')[0]} rounded-full`} />
                      <span className="text-sm font-bold">{category.count} Items</span>
                    </motion.div>

                    {/* Enhanced Floating Icon */}
                    <motion.div
                      className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-3 sm:p-4 bg-background/90 backdrop-blur-sm rounded-2xl border-2 ${category.borderColor} shadow-lg`}
                      animate={isHovered ? { 
                        rotate: [0, 5, -5, 0], // Reduced rotation
                        scale: [1, 1.1, 1], // Reduced scale
                        y: [-2, 2, -2] // Reduced movement
                      } : {}}
                      transition={{ duration: 0.3 }} // Faster
                    >
                      <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${category.accentColor}`} />
                    </motion.div>

                    {/* Simplified Floating Elements - only 3 instead of 8 */}
                    <AnimatePresence>
                      {isHovered && (
                        <>
                          {[...Array(3)].map((_, i) => ( // Reduced from 8 to 3
                            <motion.div
                              key={i}
                              className={`absolute w-1.5 h-1.5 bg-gradient-to-r ${category.color} rounded-full shadow-lg`} // Smaller size
                              style={{
                                left: `${20 + Math.random() * 60}%`,
                                top: `${20 + Math.random() * 60}%`,
                              }}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ 
                                scale: [0, 0.8, 0], // Reduced scale
                                opacity: [0, 0.6, 0], // Reduced opacity
                                y: [0, -20, -40], // Reduced movement
                                x: [0, Math.random() * 20 - 10, Math.random() * 40 - 20], // Reduced movement
                              }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{
                                duration: 1.5, // Faster
                                delay: i * 0.05, // Reduced delay
                                ease: "easeOut"
                              }}
                            />
                          ))}
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Enhanced Content Section (40% of card) */}
                  <div className="p-5 sm:p-6 lg:p-8 h-[180px] sm:h-[220px] lg:h-[240px] flex flex-col justify-between">
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
                        
                        <h3 className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3 group-hover:text-primary transition-colors">
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
          <motion.button
            className="inline-flex items-center gap-3 sm:gap-4 px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-base sm:text-lg shadow-xl hover:shadow-purple-500/20 transition-all relative overflow-hidden group"
            whileHover={{ 
              scale: 1.02, // Reduced scale
              y: -2, // Reduced movement
              boxShadow: "0 15px 30px rgba(139, 92, 246, 0.2)" // Reduced shadow
            }}
            whileTap={{ scale: 0.98 }}
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
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default CategorySections; 