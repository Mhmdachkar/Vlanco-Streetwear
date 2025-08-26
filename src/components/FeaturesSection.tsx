import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Camera, Star, Eye, Heart, ArrowRight, Sparkles, Zap, Crown } from 'lucide-react';

// Import product photos from assets
import product1Image from '@/assets/product-1.jpg';
import product2Image from '@/assets/product-2.jpg';
import product3Image from '@/assets/product-3.jpg';
import product4Image from '@/assets/product-4.jpg';
import product5Image from '@/assets/product-5.jpg';

const FeaturesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  // Professional VLANCO photo gallery data
  const photoGallery = [
    {
      id: 1,
      title: "VLANCO Brand Essence",
      subtitle: "Street Culture Redefined",
      description: "Capturing the raw energy and authenticity of urban fashion culture.",
      image: product4Image, // Uses imported product-4.jpg from assets
      category: "Brand Photography",
      rating: 5.0,
      likes: 1247,
      views: 8923,
      featured: true,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-900/20 to-pink-900/20"
    },
    {
      id: 2,
      title: "Premium Collection",
      subtitle: "Crafted for Excellence",
      description: "Every piece tells a story of quality, innovation, and street authenticity.",
      image: product5Image, // Uses imported product-5.jpg from assets
      category: "Product Showcase",
      rating: 4.9,
      likes: 892,
      views: 6541,
      featured: false,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-900/20 to-cyan-900/20"
    },
    {
      id: 3,
      title: "Urban Lifestyle",
      subtitle: "Living the VLANCO Way",
      description: "Experience the lifestyle that defines modern streetwear culture.",
      image: "/photo1.jpg",
      category: "Lifestyle",
      rating: 4.8,
      likes: 756,
      views: 5432,
      featured: true,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-900/20 to-red-900/20"
    },
    {
      id: 4,
      title: "Design Innovation",
      subtitle: "Future of Fashion",
      description: "Pioneering designs that push boundaries and set new trends.",
      image: product1Image,
      category: "Design",
      rating: 4.9,
      likes: 634,
      views: 4789,
      featured: false,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-900/20 to-emerald-900/20"
    },
    {
      id: 5,
      title: "Community Culture",
      subtitle: "Global Movement",
      description: "Join the worldwide community of VLANCO enthusiasts and creators.",
      image: product2Image,
      category: "Community",
      rating: 4.7,
      likes: 445,
      views: 3987,
      featured: false,
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-900/20 to-purple-900/20"
    },
    {
      id: 6,
      title: "Exclusive Drops",
      subtitle: "Limited Edition",
      description: "Rare and exclusive pieces that define the pinnacle of streetwear.",
      image: product3Image,
      category: "Exclusive",
      rating: 5.0,
      likes: 1123,
      views: 9876,
      featured: true,
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-900/20 to-orange-900/20"
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="py-14 sm:py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-br from-background via-muted/10 to-background"
    >
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-primary/20 to-blue-500/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [0, 1.5, 0.8, 1.5, 0],
              opacity: [0, 0.6, 0.4, 0.2, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 7 + 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Floating accent elements */}
        <motion.div
          className="absolute top-1/5 right-1/4 w-20 h-20 bg-gradient-to-br from-purple-500/8 to-pink-500/4 rounded-full blur-xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 120, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 left-1/5 w-16 h-16 bg-gradient-to-br from-blue-500/8 to-cyan-500/4 rounded-full blur-xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.4, 0.7, 0.4],
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      {/* Dynamic Grid */}
      <motion.div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
        animate={{
          x: [0, 20, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16 px-2"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Camera className="w-6 h-6 text-purple-400" />
            </motion.div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-foreground via-purple-400 to-pink-400 bg-clip-text text-transparent">
              VLANCO GALLERY
            </h2>
            <motion.div
              className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30"
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Crown className="w-6 h-6 text-purple-400" />
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Immerse yourself in the visual world of VLANCO. Each photograph captures the essence of 
            street culture, premium quality, and innovative design that defines our brand.
          </motion.p>

          {/* Gallery Stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {[
              { number: "6", label: "Professional Shoots", icon: Camera },
              { number: "5.0", label: "Average Rating", icon: Star },
              { number: "15K+", label: "Total Views", icon: Eye },
              { number: "5.1K", label: "Community Likes", icon: Heart }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-background/50 to-muted/30 rounded-2xl border border-border/50 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                  <stat.icon className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{stat.number}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {photoGallery.map((photo, index) => {
            const isHovered = hoveredPhoto === index;
            
            return (
              <motion.div
                key={photo.id}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer ${
                  photo.featured ? 'lg:col-span-2 lg:row-span-2' : ''
                }`}
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -15, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                onHoverStart={() => setHoveredPhoto(index)}
                onHoverEnd={() => setHoveredPhoto(null)}
                onClick={() => setSelectedPhoto(photo.id)}
              >
                {/* Enhanced Card Container */}
                <motion.div 
                  className="relative bg-gradient-to-br from-background via-muted/20 to-background rounded-3xl overflow-hidden shadow-2xl border border-border/50 transition-all duration-500 group-hover:shadow-3xl group-hover:border-purple-500/30"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Photo Container */}
                  <div className={`relative overflow-hidden ${photo.featured ? 'h-[380px] sm:h-[500px]' : 'h-[220px] sm:h-[300px]'}`}>
                    <motion.img
                      src={photo.image}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-700"
                      animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    
                    {/* Enhanced Gradient Overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"
                      initial={{ opacity: 0.6 }}
                      animate={isHovered ? { opacity: 0.8 } : { opacity: 0.6 }}
                      transition={{ duration: 0.4 }}
                    />
                    
                    {/* Featured Badge */}
                    {photo.featured && (
                      <motion.div
                        className="absolute top-4 left-4 z-20"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                      >
                        <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          FEATURED
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Category Badge */}
                    <motion.div
                      className="absolute top-4 right-4 z-20"
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.2 + 0.5 }}
                    >
                      <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/20">
                        {photo.category}
                      </div>
                    </motion.div>
                    
                    {/* Rating Badge */}
                    <motion.div
                      className="absolute bottom-4 right-4 z-20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: index * 0.2 + 0.7 }}
                    >
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-black/80 backdrop-blur-md rounded-full border border-white/20">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-white">{photo.rating}</span>
                      </div>
                    </motion.div>
                    
                    {/* Animated Particles on Hover */}
                    <AnimatePresence>
                      {isHovered && (
                        <>
                          {[...Array(12)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-80"
                              style={{
                                left: `${10 + Math.random() * 80}%`,
                                top: `${10 + Math.random() * 80}%`,
                              }}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ 
                                scale: [0, 1.5, 0.8, 1],
                                opacity: [0, 1, 0.8, 0],
                                y: [0, -40, -80],
                                x: [0, Math.random() * 60 - 30, Math.random() * 100 - 50],
                              }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{
                                duration: 2.5,
                                delay: i * 0.08,
                                ease: "easeOut"
                              }}
                            />
                          ))}
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: index * 0.2 + 0.9 }}
                    >
                      {/* Title and Subtitle */}
                      <div className="mb-3">
                        <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg group-hover:text-purple-300 transition-colors duration-300 mb-1">
                          {photo.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-purple-200 font-medium drop-shadow-lg">
                          {photo.subtitle}
                        </p>
                      </div>
                      
                      {/* Description */}
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed mb-4 drop-shadow-lg">
                        {photo.description}
                      </p>
                      
                      {/* Stats Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-white/80">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{photo.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            <span>{photo.likes.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {/* View More Button */}
                        <motion.button
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                          whileHover={{ scale: 1.05, x: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>View</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none z-10"
                    animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
                    style={{
                      background: `radial-gradient(circle at 60% 40%, rgba(168, 85, 247, 0.2) 0%, transparent 70%)`,
                      transition: 'all 0.4s ease',
                    }}
                  />
                  
                  {/* Animated Border */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl border-2 border-purple-500/40 pointer-events-none z-15"
                    animate={isHovered ? {
                      boxShadow: '0 0 30px 4px rgba(168, 85, 247, 0.3)',
                      borderColor: 'rgba(168, 85, 247, 0.8)',
                      opacity: 1
                    } : {
                      boxShadow: '0 0 0px 0px rgba(168, 85, 247, 0)',
                      borderColor: 'rgba(168, 85, 247, 0.2)',
                      opacity: 0.3
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Photo Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                className="relative max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={photoGallery.find(p => p.id === selectedPhoto)?.image}
                  alt="Full size photo"
                  className="w-full h-full object-contain"
                />
                <button
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  onClick={() => setSelectedPhoto(null)}
                >
                  ×
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 2.2 }}
        >
          <motion.button
            className="inline-flex items-center gap-4 px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all relative overflow-hidden group"
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              boxShadow: "0 25px 50px rgba(168, 85, 247, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
            />
            
            <span className="relative z-10">Explore More Photos</span>
            <Camera className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;