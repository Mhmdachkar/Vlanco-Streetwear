import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Shield, 
  Truck,
  RotateCcw,
  Award,
  Zap,
  Check,
  Info,
  Package,
  Sparkles,
  Eye,
  Timer,
  Plus,
  Minus,
  ZoomIn,
  Facebook,
  Twitter,
  Instagram,
  Copy,
  Gift,
  CreditCard,
  Lock,
  ThumbsUp,
  MessageCircle,
  Users,
  TrendingUp,
  Globe,
  Ruler,
  Palette,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCw,
  Maximize,
  ShoppingBag,
  Flame,
  Target,
  Headphones,
  Camera,
  Music
} from 'lucide-react';
import buttonBgImage from '@/assets/product-1.jpg';
import product1 from '@/assets/product-1.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';
import product5 from '@/assets/product-5.jpg';

// Enhanced Button Component with street-style effects
const StreetButton = ({ children, onClick, variant = 'primary', className = '', disabled = false, ...props }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;
    
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    if (onClick) onClick(e);
  };

  const baseClasses = `
    relative overflow-hidden font-semibold transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    transform active:scale-95 select-none
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 
      hover:from-blue-500 hover:via-purple-500 hover:to-blue-700
      text-white shadow-lg hover:shadow-xl
      border-2 border-blue-500/50 hover:border-blue-400/70
      focus:ring-blue-500/50
    `,
    secondary: `
      bg-gradient-to-r from-gray-800 to-gray-900 
      hover:from-gray-700 hover:to-gray-800
      text-white shadow-md hover:shadow-lg
      border-2 border-gray-600/50 hover:border-gray-500/70
      focus:ring-gray-500/50
    `,
    outline: `
      bg-transparent border-2 border-gray-300 
      hover:bg-gray-50 hover:border-gray-400
      text-gray-700 hover:text-gray-900
      focus:ring-gray-400/50
    `
  };

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handleClick}
      disabled={disabled}
      animate={{
        scale: isPressed ? 0.95 : 1,
        rotate: isPressed ? [0, -1, 1, 0] : 0
      }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      {...props}
    >
      {children}
      
      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '100%', opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </motion.button>
  );
};

// Enhanced Card with street-style hover effects
const StreetCard = ({ children, className = '', onClick, hoverable = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleMouseMove = (event) => {
    if (!hoverable) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((event.clientX - centerX) / 10);
    y.set((event.clientY - centerY) / 10);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`
        relative bg-white/5 backdrop-blur-xl border border-white/10 
        rounded-xl overflow-hidden cursor-pointer transition-all duration-300
        ${hoverable ? 'hover:shadow-2xl hover:shadow-blue-500/20' : ''}
        ${className}
      `}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: hoverable ? 1.02 : 1, y: hoverable ? -5 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/20 to-blue-500/0 rounded-xl"
        animate={{
          opacity: isHovered ? 1 : 0,
          background: isHovered 
            ? ["linear-gradient(0deg, rgba(59,130,246,0) 0%, rgba(147,51,234,0.2) 50%, rgba(59,130,246,0) 100%)",
               "linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(147,51,234,0.2) 50%, rgba(59,130,246,0) 100%)",
               "linear-gradient(180deg, rgba(59,130,246,0) 0%, rgba(147,51,234,0.2) 50%, rgba(59,130,246,0) 100%)",
               "linear-gradient(270deg, rgba(59,130,246,0) 0%, rgba(147,51,234,0.2) 50%, rgba(59,130,246,0) 100%)"]
            : "linear-gradient(0deg, rgba(59,130,246,0) 0%, rgba(147,51,234,0) 50%, rgba(59,130,246,0) 100%)"
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Hover spotlight */}
      <motion.div
        className="absolute inset-0 opacity-0 bg-gradient-to-radial from-white/5 to-transparent pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(circle at ${x.get() + 50}% ${y.get() + 50}%, rgba(255,255,255,0.1) 0%, transparent 50%)`
        }}
      />
    </motion.div>
  );
};

// Street-style floating action button
const FloatingActionButton = ({ icon: Icon, onClick, className = '', label, pulse = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative group">
      <motion.button
        className={`
          fixed z-50 w-14 h-14 rounded-full 
          bg-gradient-to-br from-blue-600 to-purple-700 
          shadow-lg hover:shadow-xl text-white
          border-2 border-blue-500/50 hover:border-blue-400/70
          ${className}
        `}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        animate={pulse ? {
          boxShadow: [
            '0 0 0 0 rgba(59, 130, 246, 0.4)',
            '0 0 0 20px rgba(59, 130, 246, 0)',
          ]
        } : {}}
        transition={pulse ? {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeOut"
        } : {}}
      >
        <Icon className="w-6 h-6" />
        
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/50 to-purple-600/50 blur-lg"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && label && (
          <motion.div
            className="fixed bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap z-50"
            style={{ 
              left: 'calc(100% + 10px)',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {label}
            <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sound effects helper
const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const sounds = {
      click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBC',
      add: 'data:audio/wav;base64,UklGRiQCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQACAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI=',
      whoosh: 'data:audio/wav;base64,UklGRlQBAABXQVZFZm0dIBAAAAEAAQBBAACALwAAQB8AAAEACABkYXRhMAEAAJiYmZmamZqZmpmamZmZmZmamZmZmZmZmZmamZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ'
    };
    
    try {
      const audio = new Audio(sounds[type] || sounds.click);
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Silently handle play failures
    } catch (error) {
      // Silently handle audio creation failures
    }
  };
  
  return { playSound, soundEnabled, setSoundEnabled };
};

const ProductDetail = () => {
  // Mock data - in real app this would come from props/router
  const product = {
    id: 1,
    name: "VLANCO Street Hoodie",
    price: 89,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
    category: "Hoodies",
    description: "Premium streetwear hoodie crafted with attention to detail and urban aesthetic. Features our signature logo and comfortable fit."
  };

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { playSound, soundEnabled, setSoundEnabled } = useSoundEffects();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [selectedImageView, setSelectedImageView] = useState('2d');
  const [showConfetti, setShowConfetti] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);

  // Enhanced product data
  const enhancedProduct = {
    ...product,
    gallery: [product1, product3, product4, product5],
    originalPrice: 109,
    discount: 18,
    inStock: 23,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Midnight Black', 'Pure White', 'Navy Storm', 'Shadow Gray'],
    features: [
      '🔥 Street-certified premium cotton blend',
      '⚡ 360° flex technology for movement',
      '💧 Moisture-wicking anti-bacterial treatment', 
      '🛡️ Reinforced double-stitched seams',
      '✨ Signature VLANCO street branding',
      '🎯 Limited edition urban colorways'
    ],
    streetCredentials: {
      hypeLevel: 95,
      dropDate: "2024-03-15",
      stockLeft: 23,
      socialMentions: 1247
    },
    reviews: {
      average: 4.8,
      total: 287,
      streetScore: 9.2
    }
  };

  // Street-style confetti effect
  const launchStreetConfetti = () => {
    setShowConfetti(true);
    playSound('add');
    
    // Create custom confetti with street elements
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    const emojis = ['🔥', '⚡', '💯', '🎯', '✨', '💎', '🚀', '🌟'];
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.position = 'absolute';
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.top = '-50px';
      particle.style.fontSize = Math.random() * 20 + 15 + 'px';
      particle.style.animation = `fall ${Math.random() * 2 + 2}s linear forwards`;
      container.appendChild(particle);
      
      setTimeout(() => particle.remove(), 4000);
    }
    
    setTimeout(() => {
      container.remove();
      setShowConfetti(false);
    }, 4000);
  };

  const handleAddToCart = () => {
    if (!selectedSize && enhancedProduct.sizes?.length) {
      playSound('click');
      if (addToCartButtonRef.current) {
        addToCartButtonRef.current.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          if (addToCartButtonRef.current) addToCartButtonRef.current.style.animation = '';
        }, 500);
      }
      return;
    }

    setCartBounce(true);
    launchStreetConfetti();
    
    setTimeout(() => setCartBounce(false), 600);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    playSound('click');
  };

  const handleColorSelect = (index) => {
    setSelectedColor(index);
    playSound('whoosh');
  };

  const colorMap = {
    'Midnight Black': '#000000',
    'Pure White': '#FFFFFF', 
    'Navy Storm': '#1e3a8a',
    'Shadow Gray': '#4b5563',
  };

  // Street-style floating particles
  const StreetParticles = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`street-particle-${i}`}
          className="absolute text-2xl opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [0, 360],
            scale: [0.5, 1, 0.5],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        >
          {['🔥', '⚡', '💎', '✨', '🎯'][Math.floor(Math.random() * 5)]}
        </motion.div>
      ))}
    </div>
  );

  // 1. Use the same four product images in 'More Heat From The Collection'
  const relatedProducts = [
    { image: product1, name: 'Street Hoodie', price: 89, category: 'Hoodies', rating: 4.8, left: 12 },
    { image: product3, name: 'Urban Windbreaker', price: 99, category: 'Jackets', rating: 4.9, left: 8 },
    { image: product4, name: 'Graffiti Tee', price: 59, category: 'T-Shirts', rating: 4.7, left: 20 },
    { image: product5, name: 'Night Runner', price: 120, category: 'Sneakers', rating: 5.0, left: 5 },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-20 pb-16 relative overflow-hidden">
      {/* Street Particles */}
      <StreetParticles />
      
      {/* Floating Sound Toggle */}
      <FloatingActionButton
        icon={soundEnabled ? Volume2 : VolumeX}
        onClick={() => {
          setSoundEnabled(!soundEnabled);
          playSound('click');
        }}
        className="top-24 right-6"
        label={soundEnabled ? "Mute" : "Unmute"}
      />

      {/* Animated CSS */}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
          }
          50% { 
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(147, 51, 234, 0.4);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes border-flash {
          0%, 100% { border-style: solid; }
          50% { border-style: dashed; }
        }
        .animate-border-flash { animation: border-flash 1.2s infinite; }
      `}</style>

        <div className="max-w-7xl mx-auto px-6">
        {/* Back Button with Street Style */}
        <motion.button
          className="group flex items-center gap-3 mb-8 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:border-blue-400/50 transition-all"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05, x: 5 }}
          onClick={() => playSound('click')}
          >
          <ArrowLeft className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
          <span className="font-medium">Back to Collection</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>

      {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Product Images with Enhanced Effects */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Hype Level Indicator */}
              <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 rounded-full">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold">HYPE: {enhancedProduct.streetCredentials.hypeLevel}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm">{enhancedProduct.streetCredentials.socialMentions} mentions</span>
                </div>
              </div>

            <StreetCard className="p-0" onClick={() => {}} hoverable={true}>
                    <div className="relative group">
                      <motion.img
                        src={enhancedProduct.gallery[currentImageIndex]}
                        alt={product.name}
                        className="w-full aspect-square object-cover cursor-zoom-in"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                  onClick={() => {
                    setZoomedImage(enhancedProduct.gallery[currentImageIndex]);
                    playSound('whoosh');
                  }}
                      />
                      
                {/* Navigation with Street Style */}
                          <button
                  onClick={() => {
                    setCurrentImageIndex(prev => prev === 0 ? enhancedProduct.gallery.length - 1 : prev - 1);
                    playSound('click');
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600/70"
                >
                  <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                  onClick={() => {
                    setCurrentImageIndex(prev => prev === enhancedProduct.gallery.length - 1 ? 0 : prev + 1);
                    playSound('click');
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600/70"
                >
                  <ChevronRight className="w-6 h-6" />
                          </button>
                  </div>
            </StreetCard>

            {/* Enhanced Thumbnail Gallery */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {enhancedProduct.gallery.map((image, index) => (
                <motion.button
                      key={index}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    playSound('click');
                  }}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        currentImageIndex === index 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/30' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </motion.button>
                ))}
              </div>
          </motion.div>

          {/* Enhanced Product Information */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Product Header with Street Elements */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-full text-xs font-bold">
                      {product.category.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-bold">LIMITED DROP</span>
                    </div>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    {product.name}
                  </h1>
                  
                  {/* Enhanced Reviews with Street Score */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                          className={`w-5 h-5 ${
                              i < Math.floor(enhancedProduct.reviews.average)
                                ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-500'
                            }`}
                          />
                        ))}
                      </div>
                    <span className="text-sm text-gray-300">
                        {enhancedProduct.reviews.average} ({enhancedProduct.reviews.total} reviews)
                  </span>
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-2 py-1 rounded text-xs font-bold">
                      STREET SCORE: {enhancedProduct.reviews.streetScore}/10
                    </div>
                    </div>
              </div>
              
                {/* Enhanced Action Buttons */}
                  <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => {
                      setIsWishlisted(!isWishlisted);
                      playSound('click');
                    }}
                    className="relative p-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:border-red-400/50 transition-all group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className={`w-6 h-6 transition-all ${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-white group-hover:text-red-400'}`} />
                    {isWishlisted && (
                      <motion.div
                        className="absolute inset-0 bg-red-500/20 rounded-xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.2, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </motion.button>
                    
                    <div className="relative">
                    <motion.button
                      onClick={() => {
                        setShareMenuOpen(!shareMenuOpen);
                        playSound('click');
                      }}
                      className="p-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:border-blue-400/50 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className="w-6 h-6" />
                    </motion.button>
                    
                    {/* Enhanced Share Menu */}
                      <AnimatePresence>
                        {shareMenuOpen && (
                <motion.div
                          className="absolute right-0 top-full mt-3 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl p-4 z-50 min-w-[200px]"
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          >
                          <div className="text-sm font-medium mb-3 text-center">Share this drop 🔥</div>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { icon: Copy, label: 'Copy Link', action: 'copy' },
                              { icon: Facebook, label: 'Facebook', action: 'facebook' },
                              { icon: Twitter, label: 'Twitter', action: 'twitter' },
                              { icon: Instagram, label: 'Instagram', action: 'instagram' }
                            ].map((item) => (
                              <motion.button
                                key={item.action}
                                onClick={() => playSound('click')}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-all text-xs"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                              </motion.button>
                            ))}
                    </div>
                </motion.div>
                        )}
                      </AnimatePresence>
              </div>
                  </div>
                </div>

              {/* Enhanced Price with Street Style */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    ${product.price}
                  </div>
                  <div className="text-2xl text-gray-400 line-through">
                      ${enhancedProduct.originalPrice}
                  </div>
                  <div className="bg-gradient-to-r from-red-600 to-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                      {enhancedProduct.discount}% OFF
                  </div>
                </div>
                
                {/* Stock urgency indicator */}
                <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-400 font-medium">
                      Only {enhancedProduct.inStock} left in stock!
                  </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {Math.floor(Math.random() * 50) + 10} people viewing
                  </div>
                </div>
                </div>
              </div>

            {/* Enhanced Product Description */}
            <StreetCard className="p-6" onClick={() => {}} hoverable={false}>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Street Certified
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {product.description} Designed for the streets, tested by the culture. 
                This isn't just clothing - it's a statement.
              </p>
            </StreetCard>

            {/* Enhanced Color Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold">
                  Colorway: {enhancedProduct.colors[selectedColor]}
                    </h3>
                  </div>
              <div className="flex gap-2">
                    {enhancedProduct.colors.map((color, index) => (
                  <motion.button
                        key={index}
                    onClick={() => handleColorSelect(index)}
                    className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedColor === index 
                        ? 'border-blue-400 ring-2 ring-blue-400/30 scale-105' 
                        : 'border-white/30 hover:border-white/60 hover:scale-102'
                        }`}
                        style={{ backgroundColor: colorMap[color] || '#000' }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                      >
                        {selectedColor === index && (
                      <Check className="w-4 h-4 text-white drop-shadow-lg" />
                    )}
                    
                    {/* Color glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full opacity-0"
                      animate={{ 
                        opacity: selectedColor === index ? [0, 0.3, 0] : 0,
                        scale: selectedColor === index ? [1, 1.2, 1] : 1
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{ 
                        boxShadow: `0 0 10px ${colorMap[color] || '#000'}`
                      }}
                    />
                  </motion.button>
                    ))}
                  </div>
                </div>

            {/* Enhanced Size Selection */}
            <div className="space-y-4">
                  <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-green-400" />
                  <h3 className="text-xl font-bold">Size</h3>
                    </div>
                <motion.button
                  onClick={() => {
                    setShowSizeGuide(true);
                    playSound('click');
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2"
                  whileHover={{ scale: 1.05 }}
                >
                  Size Guide 📏
                </motion.button>
                  </div>
              <div className="grid grid-cols-4 gap-2">
                    {enhancedProduct.sizes.map((size) => (
                  <motion.button
                        key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`relative px-2 py-2 rounded-lg font-bold text-base transition-all border-2 ${
                          selectedSize === size 
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400 shadow-md scale-102' 
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 hover:scale-101'
                        }`}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                      >
                        {size}
                    {selectedSize === size && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-blue-500/20 border-2 border-blue-500"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    )}
                  </motion.button>
                    ))}
                  </div>
                </div>

            {/* Enhanced Quantity Selector */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-yellow-400" />
                Quantity
              </h3>
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => {
                    setQuantity(Math.max(1, quantity - 1));
                    playSound('click');
                  }}
                    disabled={quantity <= 1}
                  className="w-12 h-12 rounded-xl bg-white/10 border-2 border-white/20 hover:border-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  whileHover={{ scale: quantity > 1 ? 1.1 : 1 }}
                  whileTap={{ scale: quantity > 1 ? 0.9 : 1 }}
                >
                  <Minus className="w-5 h-5" />
                </motion.button>
                
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent min-w-[4rem] text-center">
                    {quantity}
                </div>
                
                <motion.button
                  onClick={() => {
                    setQuantity(Math.min(10, quantity + 1));
                    playSound('click');
                  }}
                    disabled={quantity >= 10}
                  className="w-12 h-12 rounded-xl bg-white/10 border-2 border-white/20 hover:border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  whileHover={{ scale: quantity < 10 ? 1.1 : 1 }}
                  whileTap={{ scale: quantity < 10 ? 0.9 : 1 }}
                  >
                  <Plus className="w-5 h-5" />
                </motion.button>
                </div>
              </div>

            {/* Enhanced Add to Cart */}
              <div className="space-y-4">
              <motion.div
                animate={{ 
                  scale: cartBounce ? [1, 1.05, 0.95, 1] : 1,
                  rotate: cartBounce ? [0, -1, 1, 0] : 0 
                }}
                transition={{ duration: 0.6 }}
              >
                <StreetButton 
                  data-add-to-cart
                  ref={addToCartButtonRef}
                  onClick={handleAddToCart}
                  className="w-full h-16 text-xl font-black relative overflow-hidden group bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 shadow-lg border-4 border-blue-400 focus:ring-4 focus:ring-blue-500/40 transition-all duration-300"
                  variant="primary"
                  whileHover={{ scale: 1.04, boxShadow: '0 0 32px 8px #6366f1, 0 0 64px 16px #a21caf' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div className="absolute inset-0 border-4 border-blue-400 rounded-xl pointer-events-none group-hover:border-blue-300 animate-border-flash" />
                  <motion.span className="z-10 flex items-center" whileTap={{ scale: 1.1, rotate: [0, -10, 10, 0] }}>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    ADD TO CART - ${(product.price * quantity).toFixed(2)}
                    <Zap className="w-4 h-4 ml-2" />
                  </motion.span>
                </StreetButton>
              </motion.div>
              
              <div className="grid grid-cols-2 gap-4">
                <StreetButton 
                  variant="secondary"
                  className="h-14 font-bold border-4 border-pink-400 bg-gradient-to-r from-gray-800 to-gray-900 focus:ring-4 focus:ring-pink-400/40 transition-all duration-300 group"
                  onClick={() => {}}
                  whileHover={{ background: 'linear-gradient(90deg, #f472b6 0%, #374151 100%)', rotate: 1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span className="z-10 flex items-center" whileHover={{ rotate: [0, 8, -8, 0] }} whileTap={{ scale: 1.1 }}>
                    <Gift className="w-5 h-5 mr-2" />
                    Gift This
                  </motion.span>
                  <motion.div className="absolute inset-0 border-4 border-pink-400 rounded-xl pointer-events-none group-hover:border-pink-300 animate-border-flash" />
                </StreetButton>
                
                <StreetButton 
                  variant="outline"
                  className="h-14 font-bold border-4 border-green-400 text-white bg-transparent hover:bg-white/10 hover:text-green-400 focus:ring-4 focus:ring-green-400/40 transition-all duration-300 relative overflow-hidden group"
                  onClick={() => {}}
                  whileHover={{ boxShadow: '0 0 24px 4px #34d399', borderColor: '#34d399' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span className="z-10 flex items-center relative">
                    <Zap className="w-5 h-5 mr-2" />
                    Buy Now
                    <motion.div className="absolute left-0 -bottom-1 w-full h-1 bg-green-400 rounded-full" initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }} transition={{ duration: 0.3 }} />
                  </motion.span>
                  <motion.div className="absolute inset-0 border-4 border-green-400 rounded-xl pointer-events-none group-hover:border-green-300 animate-border-flash" />
                </StreetButton>
              </div>
              </div>

            {/* Street Credentials */}
            <StreetCard className="p-6" onClick={() => {}} hoverable={false}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Street Credentials
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-400" />
                        <div>
                    <div className="text-sm font-bold">Secure</div>
                    <div className="text-xs text-gray-400">256-bit SSL</div>
                        </div>
                      </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Truck className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="text-sm font-bold">Free Ship</div>
                    <div className="text-xs text-gray-400">Orders $150+</div>
                        </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-purple-400" />
                  <div>
                    <div className="text-sm font-bold">Returns</div>
                    <div className="text-xs text-gray-400">30 days</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Users className="w-6 h-6 text-orange-400" />
                  <div>
                    <div className="text-sm font-bold">Authentic</div>
                    <div className="text-xs text-gray-400">Verified</div>
                  </div>
                </div>
              </div>
            </StreetCard>
            </motion.div>
                      </div>

        {/* Enhanced Features Section */}
          <motion.div
          className="mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            What Makes This Drop Special
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enhancedProduct.features.map((feature, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * index }}
              >
                <StreetCard className="p-6 h-full" onClick={() => {}} hoverable={false}>
                  <div className="text-2xl mb-3">{feature.split(' ')[0]}</div>
                  <div className="font-medium">{feature.substring(feature.indexOf(' ') + 1)}</div>
                </StreetCard>
                </motion.div>
                    ))}
                  </div>
                </motion.div>

        {/* Enhanced Reviews Section */}
                <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-400" />
            What The Streets Are Saying
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        name: "Alex M.",
                username: "@alexdrips",
                        rating: 5,
                review: "Straight fire! 🔥 Quality is insane and the fit is perfect. Already got compliments.",
                verified: true,
                streetCred: 95
                      },
                      {
                        name: "Jordan K.",
                username: "@jordankicks",
                rating: 5,
                review: "This hoodie is a vibe! Material feels premium and the design is clean AF. VLANCO never misses.",
                verified: true,
                streetCred: 87
                      },
                      {
                        name: "Sam R.",
                username: "@samstyle",
                rating: 4,
                review: "Love the colorway! Fits true to size. Only wish they had more limited editions like this.",
                verified: true,
                streetCred: 72
                      }
                    ].map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 * index }}
              >
                <StreetCard className="p-6" onClick={() => {}} hoverable={false}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{review.name}</span>
                                {review.verified && (
                          <div className="bg-blue-600 rounded-full p-1">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                                )}
                              </div>
                      <div className="text-sm text-gray-400">{review.username}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'
                                      }`}
                                    />
                                  ))}
                                </div>
                      <div className="text-xs text-green-400 font-bold">
                        Street Cred: {review.streetCred}
                              </div>
                            </div>
                            </div>
                  <p className="text-gray-300 text-sm">{review.review}</p>
                </StreetCard>
              </motion.div>
                    ))}
              </div>
            </motion.div>

        {/* You Might Also Like Section */}
            <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            More Heat From The Collection
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item, index) => (
            <motion.div 
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * index }}
              >
                <StreetCard 
                  className="group cursor-pointer p-0"
                  onClick={() => playSound('click')}
                >
                      <div className="relative overflow-hidden">
                        <img
                      src={item.image}
                      alt={item.name}
                      className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                        HOT
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-4">
                    <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                      {item.name}
                        </h3>
                    <p className="text-gray-400 text-sm">Limited Edition</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">4.{8 + index}</span>
                      </div>
                      <div className="text-xs text-red-400 font-bold">
                        {item.left} left
                      </div>
                    </div>
                  </div>
                </StreetCard>
              </motion.div>
                ))}
              </div>
            </motion.div>
      </div>

      {/* Enhanced Modals */}
        <AnimatePresence>
          {zoomedImage && (
            <motion.div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImage(null)}
            >
            <motion.div
              className="relative max-w-4xl max-h-[90vh]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <img
                src={zoomedImage}
                alt="Zoomed product"
                className="w-full h-full object-contain rounded-xl"
              />
              <motion.button
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      <AnimatePresence>
          {showSizeGuide && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
              onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black flex items-center gap-2">
                  <Ruler className="w-6 h-6 text-blue-400" />
                  Size Guide
                </h3>
                <motion.button
                    onClick={() => setShowSizeGuide(false)}
                  className="text-2xl hover:text-red-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  >
                    ×
                </motion.button>
                </div>
                
              <StreetCard className="p-6" onClick={() => {}} hoverable={false}>
                  <div className="overflow-x-auto">
                  <table className="w-full">
                      <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-3 font-bold">Size</th>
                        <th className="text-left p-3 font-bold">Chest</th>
                        <th className="text-left p-3 font-bold">Length</th>
                        <th className="text-left p-3 font-bold">Sleeve</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                        { size: 'XS', chest: '34-36"', length: '26"', sleeve: '24"' },
                        { size: 'S', chest: '36-38"', length: '27"', sleeve: '25"' },
                        { size: 'M', chest: '38-40"', length: '28"', sleeve: '26"' },
                        { size: 'L', chest: '40-42"', length: '29"', sleeve: '27"' },
                        { size: 'XL', chest: '42-44"', length: '30"', sleeve: '28"' },
                        { size: 'XXL', chest: '44-46"', length: '31"', sleeve: '29"' }
                      ].map((row, index) => (
                        <motion.tr
                          key={row.size}
                          className="border-b border-white/10 hover:bg-white/5"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <td className="p-3 font-bold text-blue-400">{row.size}</td>
                            <td className="p-3">{row.chest}</td>
                            <td className="p-3">{row.length}</td>
                            <td className="p-3">{row.sleeve}</td>
                        </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                <div className="mt-6 pt-6 border-t border-white/20">
                  <h4 className="font-bold mb-3 text-yellow-400">📏 How to Measure:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                      <li>• <strong>Chest:</strong> Measure around the fullest part of your chest</li>
                      <li>• <strong>Length:</strong> Measure from shoulder to bottom hem</li>
                      <li>• <strong>Sleeve:</strong> Measure from shoulder seam to cuff</li>
                    </ul>
                  </div>
              </StreetCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;