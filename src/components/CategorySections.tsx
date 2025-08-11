import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
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

  // Enhanced category data with better descriptions and branding
  const categories = [
    {
      id: 'tshirts',
      title: 'T-Shirts',
      subtitle: 'Urban Essentials',
      description: 'Premium streetwear tees that define your style with comfort and authenticity. Each piece tells a story of urban culture and bold expression.',
      image: product1Image, // Uses imported product-1.jpg from assets
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
      image: product2Image, // Uses imported product-2.jpg from assets
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
      image: product3Image, // Uses imported product-3.jpg from assets
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
  ];

  const filters = [
    { id: 'all', label: 'All Collections', icon: Package },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'new', label: 'New Drops', icon: Sparkles },
    { id: 'popular', label: 'Popular', icon: Users }
  ];

  const getProductsByCategory = (categoryName: string) => {
    // Mock data - replace with actual data
    return [
      { id: 1, name: 'Urban Tee', price: 49.99, image: '/src/assets/product-1.jpg' },
      { id: 2, name: 'Street Hoodie', price: 79.99, image: '/src/assets/product-2.jpg' },
      { id: 3, name: 'Designer Mask', price: 29.99, image: '/src/assets/product-3.jpg' }
    ];
  };

  const handleAddToCart = (productId: number) => {
    console.log('Added to cart:', productId);
  };

  const handleCategoryClick = (route: string) => {
    window.location.href = route;
  };

  return (
    <section ref={ref} id="collections" className="relative py-20 overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-purple-900/5 to-background" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Enhanced Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="flex items-center justify-center gap-6 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-purple-400 fill-purple-400" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Explore Collections
            </h2>
            <motion.div
              className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30"
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-purple-400 fill-purple-400" />
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Discover our curated collections of premium streetwear designed for the modern rebel. 
            Each piece tells a story of authenticity and bold expression.
          </motion.p>
        </motion.div>

        {/* Enhanced Filter Tabs */}
        <motion.div
          className="flex justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="inline-flex bg-muted/30 backdrop-blur-sm rounded-2xl p-2 border border-border/50 shadow-xl">
            {filters.map((filter, index) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeFilter === filter.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl"
                    layoutId="activeFilter"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            const categoryProducts = getProductsByCategory(category.id);
            const isHovered = hoveredCategory === category.id;
            
            return (
              <motion.div
                key={category.id}
                className="group relative"
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
              >
                {/* Enhanced Main Category Card */}
                <motion.div
                  className={`relative overflow-hidden rounded-3xl border-2 ${category.borderColor} bg-gradient-to-br ${category.bgGradient} backdrop-blur-sm cursor-pointer group-hover:shadow-2xl transition-all duration-500 h-[600px]`}
                  whileHover={{ 
                    y: -20, 
                    scale: 1.02,
                    rotateY: 5,
                    rotateX: 2,
                    transition: { duration: 0.4 }
                  }}
                  onHoverStart={() => setHoveredCategory(category.id)}
                  onHoverEnd={() => setHoveredCategory(null)}
                  onClick={() => handleCategoryClick(category.route)}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Enhanced Background Image Section (60% of card) */}
                  <div className="relative h-[360px] overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${category.image})`,
                      }}
                      animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ duration: 0.6 }}
                    />
                    
                    {/* Enhanced Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent`} />
                    
                    {/* VLANCO Brand Watermark */}
                    <motion.div
                      className="absolute top-4 left-4 text-white/10 font-black text-2xl tracking-wider"
                      animate={isHovered ? { opacity: 0.2 } : { opacity: 0.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      VLANCO
                    </motion.div>
                    
                    {/* Enhanced Stats Badge */}
                    <motion.div
                      className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full border border-border/50 shadow-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.3 + 0.5 }}
                    >
                      <div className={`w-2 h-2 ${category.color.replace('from-', 'bg-').split(' ')[0]} rounded-full`} />
                      <span className="text-sm font-bold">{category.count} Items</span>
                    </motion.div>

                    {/* Enhanced Floating Icon */}
                    <motion.div
                      className={`absolute top-6 right-6 p-4 bg-background/90 backdrop-blur-sm rounded-2xl border-2 ${category.borderColor} shadow-lg`}
                      animate={isHovered ? { 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1],
                        y: [-5, 5, -5]
                      } : {}}
                      transition={{ duration: 0.6 }}
                    >
                      <IconComponent className={`w-8 h-8 ${category.accentColor}`} />
                    </motion.div>

                    {/* Enhanced Floating Elements */}
                    <AnimatePresence>
                      {isHovered && (
                        <>
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              className={`absolute w-2 h-2 bg-gradient-to-r ${category.color} rounded-full shadow-lg`}
                              style={{
                                left: `${20 + Math.random() * 60}%`,
                                top: `${20 + Math.random() * 60}%`,
                              }}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ 
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0],
                                y: [0, -40, -80],
                                x: [0, Math.random() * 60 - 30, Math.random() * 120 - 60],
                              }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{
                                duration: 2.5,
                                delay: i * 0.1,
                                ease: "easeOut"
                              }}
                            />
                          ))}
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Enhanced Content Section (40% of card) */}
                  <div className="p-8 h-[240px] flex flex-col justify-between">
                    <div>
                      <motion.div
                        className="mb-4"
                        animate={isHovered ? { y: -5 } : { y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-bold ${category.accentColor} opacity-90 tracking-wide`}>
                            {category.subtitle}
                          </span>
                          <motion.div
                            className="flex items-center gap-1"
                            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                          >
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold">4.8</span>
                          </motion.div>
                        </div>
                        
                        <h3 className="text-3xl font-black mb-3 group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                          {category.description}
                        </p>
                      </motion.div>

                      {/* Enhanced Tags */}
                      <motion.div 
                        className="mb-6"
                        initial={{ opacity: 0 }}
                        animate={isHovered ? { opacity: 1 } : { opacity: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex flex-wrap gap-2">
                          {category.featured.map((item, i) => (
                            <motion.span
                              key={item}
                              className="px-3 py-1 bg-muted/60 rounded-full text-xs font-bold border border-border/30"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 + 0.3 }}
                            >
                              {item}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* Enhanced Stats Grid */}
                    <motion.div 
                      className="grid grid-cols-3 gap-4 mb-6"
                      animate={isHovered ? { y: -3 } : { y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center">
                        <div className="text-xl font-black">{category.stats.items}</div>
                        <div className="text-xs text-muted-foreground font-medium">Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-black text-green-500">{category.stats.newDrops}</div>
                        <div className="text-xs text-muted-foreground font-medium">New</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-black text-orange-500">{category.stats.trending}</div>
                        <div className="text-xs text-muted-foreground font-medium">Trending</div>
                      </div>
                    </motion.div>

                    {/* Enhanced CTA Button */}
                    <motion.button
                      className={`w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r ${category.color} text-white rounded-2xl font-bold text-sm group-hover:shadow-xl transition-all duration-300 border-2 border-transparent group-hover:border-white/20`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(category.route);
                      }}
                    >
                      <span>Explore Collection</span>
                      <motion.div
                        animate={isHovered ? { x: 5 } : { x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </motion.button>
                  </div>

                  {/* Enhanced Hover Glow Effect */}
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-r ${category.bgGradient} opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-xl -z-10`}
                    animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
                  />

                  {/* Enhanced 3D Shadow */}
                  <div className="absolute inset-0 bg-black/10 transform translate-y-2 -z-20 rounded-3xl" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Bottom CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.button
            className="inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all relative overflow-hidden group"
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              boxShadow: "0 25px 50px rgba(139, 92, 246, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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