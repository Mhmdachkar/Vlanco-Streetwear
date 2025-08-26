import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  ShoppingCart, 
  Heart, 
  Users, 
  Package, 
  TrendingUp,
  Check,
  ArrowRight,
  Crown,
  Sparkles,
  Zap,
  Flame,
  Target,
  Shield,
  Hexagon,
  Triangle,
  Circle,
  Square,
  Eye,
  Play,
  Pause,
  RotateCw,
  Maximize,
  Volume2,
  VolumeX
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';

// Import photos from assets
import heroBgImage from '@/assets/hero-bg.jpg';
import photo1Image from '@/assets/photo1.jpg';
import product1Image from '@/assets/product-1.jpg';
import product2Image from '@/assets/product-2.jpg';
import product3Image from '@/assets/product-3.jpg';
import product4Image from '@/assets/product-4.jpg';



// Add a simple Tooltip component
const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex flex-col items-center">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        tabIndex={0}
        className="outline-none"
      >
        {children}
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg bg-black/90 text-xs text-white shadow-lg z-50 whitespace-nowrap pointer-events-none"
            style={{ minWidth: 'max-content' }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Confetti component for gamified effect
const Confetti = ({ isVisible }: { isVisible: boolean }) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={isVisible ? {
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
            y: [-20, -60, -100],
            x: [0, Math.random() * 40 - 20],
            rotate: [0, 180, 360],
          } : {}}
          transition={{
            duration: 1.5,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// Enhanced Holographic Card Component
const HolographicCard = ({ children, className = '', glowColor = 'cyan', isHovered = false }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  }, []);

  const glowColors = useMemo(() => ({
    cyan: 'shadow-cyan-500/20 border-cyan-500/30',
    pink: 'shadow-pink-500/20 border-pink-500/30',
    purple: 'shadow-purple-500/20 border-purple-500/30',
    green: 'shadow-green-500/20 border-green-500/30',
    yellow: 'shadow-yellow-500/20 border-yellow-500/30'
  }), []);

  return (
    <motion.div
      ref={cardRef}
      className={`
        relative overflow-hidden backdrop-blur-xl bg-black/20 
        border border-white/10 rounded-2xl transition-all duration-300 ease-out
        hover:${glowColors[glowColor]} hover:shadow-2xl hover:scale-[1.01]
        ${isHovered ? `shadow-2xl ${glowColors[glowColor]}` : ''}
        ${className}
      `}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0.5, y: 0.5 })}
      whileHover={{ y: -2, scale: 1.01 }}
      style={{
        background: `
          radial-gradient(
            600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
            rgba(255,255,255,0.1) 0%,
            transparent 40%
          ),
          linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)
        `
      }}
    >
      {/* Subtle shine overlay */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`
        }}
        animate={{
          x: ['-100%', '200%']
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

// Enhanced Floating Elements Component
const FloatingElements = () => {
  const elements = [
    { icon: Hexagon, color: 'text-cyan-400/15', delay: 0.8, duration: 8 },
    { icon: Triangle, color: 'text-pink-400/15', delay: 1.2, duration: 10 },
    { icon: Circle, color: 'text-green-400/15', delay: 1.6, duration: 12 },
    { icon: Square, color: 'text-purple-400/15', delay: 2.0, duration: 14 }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute ${element.color}`}
          style={{
            top: `${20 + index * 20}%`,
            left: index % 2 === 0 ? '10%' : '80%'
          }}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: element.delay, ease: "easeOut" }}
        >
          <motion.div
            animate={{
              y: [-8, 8, -8],
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <element.icon size={30 - index * 5} />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

// Enhanced Product Stats Component
const ProductStats = ({ stats }: { stats: Array<{ icon: React.ReactNode, value: number, label: string, tooltip: string, decimals: number, suffix: string, glow: string, border: string }> }) => {
  return (
    <motion.div
      className="flex flex-wrap justify-center gap-8 mb-8 relative"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.15 }
        }
      }}
    >
      {/* Parallax background elements */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none z-0"
        style={{
          background: 'linear-gradient(120deg, rgba(34,211,238,0.08) 0%, rgba(168,85,247,0.10) 100%)',
          filter: 'blur(24px)',
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className={`relative p-6 bg-black/40 backdrop-blur-xl rounded-2xl border ${stat.border} shadow-lg`}
          style={{ boxShadow: stat.glow }}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.9 },
            visible: { opacity: 1, y: 0, scale: 1 }
          }}
          whileHover={{ y: -5, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-center">
            <div className="mb-3">{stat.icon}</div>
            <div className="text-3xl font-black text-white mb-1">
              {stat.value.toFixed(stat.decimals)}{stat.suffix}
            </div>
            <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
          </div>
          
          {/* Hover glow effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0"
            style={{ boxShadow: stat.glow }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

const TShirtCollection = () => {
  const navigate = useNavigate();
  const { getProductsByCategory } = useProducts();
  const { addToCart } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: [0, 200],
    colors: [] as string[],
    sizes: [] as string[],
    sortBy: 'newest'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [quickSelectProduct, setQuickSelectProduct] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<{[key: number]: string}>({});
  const [selectedColor, setSelectedColor] = useState<{[key: number]: number}>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Enhanced mock products with professional images
  const mockTshirts = [
    {
      id: 1,
      name: 'Essential Urban Tee',
      price: 45,
      originalPrice: 60,
      image: heroBgImage,
      hoverImage: photo1Image,
      rating: 4.8,
      reviews: 234,
      isNew: true,
      isBestseller: false,
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'White', value: '#FFFFFF' },
        { name: 'Navy', value: '#1e40af' }
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      category: 'Basic'
    },
    {
      id: 2,
      name: 'Streetwear Classic',
      price: 55,
      originalPrice: 75,
      image: product1Image,
      hoverImage: product2Image,
      rating: 4.9,
      reviews: 189,
      isNew: false,
      isBestseller: true,
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'Gray', value: '#6b7280' }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      category: 'Premium'
    },
    {
      id: 3,
      name: 'Limited Edition Drop',
      price: 85,
      originalPrice: 120,
      image: product2Image,
      hoverImage: product3Image,
      rating: 5.0,
      reviews: 92,
      isNew: true,
      isBestseller: true,
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'Red', value: '#dc2626' },
        { name: 'White', value: '#FFFFFF' }
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      category: 'Limited'
    },
    {
      id: 4,
      name: 'Minimalist Design',
      price: 42,
      originalPrice: 55,
      image: product3Image,
      hoverImage: product4Image,
      rating: 4.7,
      reviews: 156,
      isNew: false,
      isBestseller: false,
      colors: [
        { name: 'White', value: '#FFFFFF' },
        { name: 'Gray', value: '#6b7280' }
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      category: 'Basic'
    },
    {
      id: 5,
      name: 'Premium Comfort',
      price: 68,
      originalPrice: 90,
      image: product4Image,
      hoverImage: heroBgImage,
      rating: 4.8,
      reviews: 203,
      isNew: true,
      isBestseller: false,
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'Navy', value: '#1e40af' },
        { name: 'Green', value: '#16a34a' }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      category: 'Premium'
    },
    {
      id: 6,
      name: 'Artist Collaboration',
      price: 95,
      originalPrice: 130,
      image: photo1Image,
      hoverImage: product1Image,
      rating: 4.9,
      reviews: 78,
      isNew: true,
      isBestseller: true,
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'White', value: '#FFFFFF' }
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      category: 'Collaboration'
    }
  ];

  // Enhanced filtered products
  const filteredProducts = mockTshirts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesColor = selectedFilters.colors.length === 0 || 
                        selectedFilters.colors.some(color => 
                          product.colors.some(c => c.name === color)
                        );
    const matchesSize = selectedFilters.sizes.length === 0 || 
                       selectedFilters.sizes.some(size => 
                         product.sizes.includes(size)
                       );
    const matchesPrice = product.price >= selectedFilters.priceRange[0] && 
                        product.price <= selectedFilters.priceRange[1];
    
    return matchesSearch && matchesColor && matchesSize && matchesPrice;
  }).sort((a, b) => {
    switch (selectedFilters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return b.reviews - a.reviews;
      default:
        return b.isNew ? 1 : -1;
    }
  });
  
  const filterOptions = {
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Navy', value: '#1e40af' },
      { name: 'Gray', value: '#6b7280' },
      { name: 'Red', value: '#dc2626' },
      { name: 'Green', value: '#16a34a' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sortOptions: [
      { value: 'newest', label: 'Newest First', icon: Sparkles },
      { value: 'price-low', label: 'Price: Low to High', icon: ArrowRight },
      { value: 'price-high', label: 'Price: High to Low', icon: ArrowRight },
      { value: 'rating', label: 'Highest Rated', icon: Star },
      { value: 'popular', label: 'Most Popular', icon: TrendingUp }
    ]
  };

  const toggleWishlist = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const imageRefs = useRef<{ [key: number]: HTMLImageElement | null }>({});

  const flyToCart = (productId: number) => {
    const img = imageRefs.current[productId];
    const cartIcon = document.getElementById('cart-icon');
    if (!img || !cartIcon) return;
    const imgRect = img.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();
    const floatingImg = img.cloneNode(true) as HTMLImageElement;
    floatingImg.style.position = 'fixed';
    floatingImg.style.left = imgRect.left + 'px';
    floatingImg.style.top = imgRect.top + 'px';
    floatingImg.style.width = imgRect.width + 'px';
    floatingImg.style.height = imgRect.height + 'px';
    floatingImg.style.zIndex = '9999';
    floatingImg.style.pointerEvents = 'none';
    floatingImg.style.transition = 'all 0.8s cubic-bezier(0.4,1,0.6,1)';
    document.body.appendChild(floatingImg);
    requestAnimationFrame(() => {
      floatingImg.style.left = cartRect.left + cartRect.width / 2 - imgRect.width / 4 + 'px';
      floatingImg.style.top = cartRect.top + cartRect.height / 2 - imgRect.height / 4 + 'px';
      floatingImg.style.width = imgRect.width / 2 + 'px';
      floatingImg.style.height = imgRect.height / 2 + 'px';
      floatingImg.style.opacity = '0.5';
      floatingImg.style.transform = 'rotate(20deg) scale(0.5)';
    });
    setTimeout(() => {
      document.body.removeChild(floatingImg);
    }, 850);
  };

  const handleQuickAdd = async (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const size = selectedSize[product.id] || product.sizes?.[0] || '';
    const colorIndex = selectedColor[product.id] || 0;
    // Animation
    flyToCart(product.id);
    // Add to cart logic
    const variantId = `${product.id}-${colorIndex}-${size}`;
    await addToCart(product.id.toString(), variantId, 1, {
      price: product.price,
      product: { base_price: product.price },
      variant: { price: product.price }
    });
  };

  const handleColorSelect = (productId: number, colorIndex: number) => {
    setSelectedColor(prev => ({ ...prev, [productId]: colorIndex }));
  };

  const handleSizeSelect = (productId: number, size: string) => {
    setSelectedSize(prev => ({ ...prev, [productId]: size }));
  };

  const FloatingParticles = ({ count = 8 }) => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-gradient-to-br from-primary/20 to-purple-500/10 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 10 - 5, 0],
            scale: [0, 1, 0.5, 1, 0],
            opacity: [0, 0.6, 0.4, 0.2, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  // Place these at the top of the component, after isInView is defined:
  const productsCount = isInView ? filteredProducts.length.toString() : '0';
  const reviewsCount = isInView ? '1.2K+' : '0';
  const ratingCount = isInView ? '4.8' : '0';
  const trendingCount = isInView ? '25%' : '0%';

  return (
    <>
      <div className="font-inter">
        <Navigation />
        {/* Enhanced Hero Section */}
        <section className="relative min-h-[60vh] bg-gradient-to-br from-background via-purple-900/10 to-background overflow-hidden">
          {/* Dynamic Animated Background */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/3 to-blue-500/5"
              animate={{
                background: [
                  'linear-gradient(45deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.05))',
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.03))',
                  'linear-gradient(225deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.05))',
                  'linear-gradient(315deg, rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.03))',
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Floating geometric shapes */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-primary to-purple-600 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  scale: [0, 1, 0.5, 1, 0],
                  opacity: [0, 0.8, 0.6, 0.4, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: Math.random() * 10 + 8,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-16">
            {/* Breadcrumb Navigation */}
            <motion.nav
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button 
                  onClick={() => navigate('/')}
                  className="hover:text-primary transition-colors"
                >
                  Home
                </button>
                <span>/</span>
                <button 
                  onClick={() => navigate('/')}
                  className="hover:text-primary transition-colors"
                >
                  Collections
                </button>
                <span>/</span>
                <span className="text-primary font-medium">T-Shirts</span>
              </div>
            </motion.nav>

            {/* Hero Content */}
            <div className="text-center mb-12">
              <motion.div
                className="inline-flex items-center gap-3 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="p-4 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full border border-primary/30"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Package className="w-8 h-8 text-primary" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-foreground via-primary to-purple-400 bg-clip-text text-transparent">
                  T-Shirt Collection
                </h1>
                <motion.div
                  className="p-4 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full border border-primary/30"
                  animate={{ rotate: [360, 0] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Crown className="w-8 h-8 text-primary" />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Discover our premium collection of streetwear t-shirts, designed for those who dare to stand out.
                Each piece combines comfort, style, and authentic urban culture.
              </motion.p>

              {/* Enhanced Stats Bar */}
              <motion.div
                className="flex flex-wrap justify-center gap-8 mb-8 relative"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.15 }
                  }
                }}
              >
                {/* Parallax background elements */}
                <motion.div
                  className="absolute inset-0 rounded-3xl pointer-events-none z-0"
                  style={{
                    background: 'linear-gradient(120deg, rgba(34,211,238,0.08) 0%, rgba(168,85,247,0.10) 100%)',
                    filter: 'blur(24px)',
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                {/* Additional parallax elements */}
                <motion.div
                  className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-xl"
                  animate={{
                    y: [0, -20, 0],
                    x: [0, 10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-lg"
                  animate={{
                    y: [0, 15, 0],
                    x: [0, -8, 0],
                    scale: [1, 0.9, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                />
                
                {[
                  {
                    icon: <Package className="w-7 h-7 mx-auto text-cyan-400 drop-shadow-[0_0_12px_#22d3ee]" />,
                    value: productsCount,
                    label: 'Products',
                    tooltip: 'Total number of t-shirts in this collection',
                    decimals: 0,
                    suffix: '',
                    glow: '0 0 16px #22d3ee, 0 0 32px #22d3ee44',
                    border: 'border-cyan-400',
                  },
                  {
                    icon: <Users className="w-7 h-7 mx-auto text-green-400 drop-shadow-[0_0_12px_#22c55e]" />,
                    value: reviewsCount,
                    label: 'Reviews',
                    tooltip: 'Based on verified customer reviews',
                    decimals: 0,
                    suffix: 'K+',
                    glow: '0 0 16px #22c55e, 0 0 32px #22c55e44',
                    border: 'border-green-400',
                  },
                  {
                    icon: <Star className="w-7 h-7 mx-auto text-yellow-400 fill-yellow-400 drop-shadow-[0_0_12px_#fde047]" />,
                    value: ratingCount,
                    label: 'Rating',
                    tooltip: 'Average customer rating for this collection',
                    decimals: 1,
                    suffix: '',
                    glow: '0 0 16px #fde047, 0 0 32px #fde04744',
                    border: 'border-yellow-400',
                  },
                  {
                    icon: (
                      <div className="relative">
                        <TrendingUp className="w-7 h-7 mx-auto text-purple-400 drop-shadow-[0_0_12px_#a855f7]" />
                        {/* Animated trending arrow */}
                        <motion.div
                          className="absolute -top-1 -right-1"
                          animate={{
                            y: [0, -3, 0],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <div className="w-3 h-3 bg-green-400 rounded-full flex items-center justify-center">
                            <motion.div
                              className="w-1.5 h-1.5 bg-white rounded-full"
                              animate={{
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          </div>
                        </motion.div>
                      </div>
                    ),
                    value: trendingCount,
                    label: 'Trending',
                    tooltip: 'How much this collection is trending this month',
                    decimals: 0,
                    suffix: '%',
                    glow: '0 0 16px #a855f7, 0 0 32px #a855f744',
                    border: 'border-purple-400',
                  },
                ].map((stat, i) => {
                  const [showConfetti, setShowConfetti] = useState(false);
                  
                  return (
                    <Tooltip key={stat.label} content={stat.tooltip}>
                      <motion.div
                        className={`relative flex flex-col items-center justify-center rounded-2xl px-10 py-8 min-w-[120px] z-10 overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 shadow-xl`}
                        style={{ boxShadow: stat.glow }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 + i * 0.15, type: 'spring', stiffness: 80 }}
                        whileHover={{ 
                          scale: 1.08, 
                          boxShadow: `${stat.glow}, 0 0 0 2px var(--tw-shadow-color)`,
                        }}
                        onHoverStart={() => setShowConfetti(true)}
                        onHoverEnd={() => setShowConfetti(false)}
                      >
                        {/* Confetti effect */}
                        <Confetti isVisible={showConfetti} />
                        
                        {/* Ripple/Sparkle effect on hover */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none z-20"
                          initial={{ opacity: 0, scale: 0.7 }}
                          whileHover={{ opacity: 0.5, scale: 1.2 }}
                          transition={{ duration: 0.5, type: 'spring' }}
                          style={{
                            background: 'radial-gradient(circle at 60% 40%, #fff 0%, transparent 70%)',
                            mixBlendMode: 'overlay',
                          }}
                        />
                        
                        {/* Glassmorphism inner glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
                        
                        <motion.div
                          className="mb-2 relative z-30"
                          whileHover={{ scale: 1.18, rotate: [0, 10, -10, 0] }}
                          transition={{ type: 'spring', stiffness: 200, damping: 8 }}
                        >
                          {stat.icon}
                        </motion.div>
                        <motion.div
                          className="text-3xl font-bold mt-3 mb-1 relative z-30"
                          style={{ textShadow: stat.glow }}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={isInView ? { scale: 1, opacity: 1 } : {}}
                          transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                        >
                          {stat.value}
                        </motion.div>
                        <div className="text-sm text-muted-foreground relative z-30">{stat.label}</div>
                      </motion.div>
                    </Tooltip>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </section>
        {/* Main Content */}
        <div 
          ref={containerRef}
          className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background relative overflow-hidden"
        >
          {/* Enhanced Background Effects */}
          <FloatingParticles count={15} />
          <FloatingElements />
          
          {/* Dynamic gradient orbs */}
          <motion.div
            className="absolute top-1/4 left-1/6 w-48 h-48 bg-gradient-to-br from-blue-500/8 to-cyan-500/4 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 25, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-gradient-to-br from-purple-500/8 to-pink-500/4 rounded-full blur-2xl"
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.4, 0.7, 0.4],
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
          />

          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Headline and Subheadline */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">T-Shirt Collection</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Discover our premium collection of streetwear t-shirts, designed for those who dare to stand out. Each piece combines comfort, style, and authentic urban culture.</p>
            </div>
            {/* Enhanced Product Grid with 3D Effects */}
            <motion.div
              className={`grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {filteredProducts.map((product, index) => {
                const colorOptions = product.colors || [];
                const sizeOptions = product.sizes || [];
                const colorIdx = selectedColor[product.id];
                const size = selectedSize[product.id];
                const canAdd = colorOptions.length > 0 ? colorIdx !== undefined : true;
                const canAddSize = sizeOptions.length > 0 ? !!size : true;
                return (
                  <motion.div
                    key={product.id}
                    className="group relative rounded-3xl overflow-hidden h-[650px]"
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{
                      y: -16,
                      scale: 1.03,
                      transition: { duration: 0.4, ease: "easeOut" }
                    }}
                    onHoverStart={() => setHoveredProduct(product.id)}
                    onHoverEnd={() => setHoveredProduct(null)}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {/* Enhanced Card Container */}
                    <motion.div 
                      className="relative bg-gradient-to-br from-background via-muted/20 to-background rounded-3xl overflow-hidden shadow-2xl border border-border/50 transition-all duration-500 group-hover:shadow-3xl group-hover:border-primary/30 h-full"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Enhanced Dynamic Spotlight Glow */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none z-10"
                        animate={hoveredProduct === product.id ? { opacity: 1 } : { opacity: 0 }}
                        style={{
                          background: 'radial-gradient(circle at 60% 40%, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
                          transition: 'all 0.4s ease',
                        }}
                      />
                      
                      {/* Enhanced Animated Neon Border */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-primary/40 pointer-events-none z-20"
                        animate={hoveredProduct === product.id ? {
                          boxShadow: '0 0 30px 4px rgba(0, 212, 255, 0.3)',
                          borderColor: 'rgba(0, 212, 255, 0.8)',
                          opacity: 1
                        } : {
                          boxShadow: '0 0 0px 0px rgba(0, 212, 255, 0)',
                          borderColor: 'rgba(0, 212, 255, 0.2)',
                          opacity: 0.3
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                      
                      {/* Enhanced Product Image Container */}
                      <div className={`relative overflow-hidden h-full`}> 
                        {/* Base Image */}
                        <motion.img
                          ref={el => (imageRefs.current[product.id] = el)}
                          src={product.image}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ imageRendering: 'auto' }}
                          animate={hoveredProduct === product.id ? { 
                            scale: 1.05,
                            filter: 'blur(0px)'
                          } : { 
                            scale: 1,
                            filter: 'blur(0px)'
                          }}
                          transition={{ 
                            duration: 0.8, 
                            ease: "easeOut",
                            filter: { duration: 0.4, ease: "easeInOut" }
                          }}
                        />
                        
                        {/* Hover Image with Cross-Fade */}
                        <motion.img
                          src={product.hoverImage}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ imageRendering: 'auto' }}
                          initial={{ opacity: 0, scale: 1.02 }}
                          animate={hoveredProduct === product.id ? { 
                            opacity: 1,
                            scale: 1.05,
                            filter: 'blur(0px)'
                          } : { 
                            opacity: 0,
                            scale: 1.02,
                            filter: 'blur(1px)'
                          }}
                          transition={{ 
                            duration: 0.8, 
                            ease: "easeInOut",
                            opacity: { duration: 0.7, ease: "easeInOut" },
                            scale: { duration: 0.8, ease: "easeOut" },
                            filter: { duration: 0.4, ease: "easeInOut" }
                          }}
                        />
                        
                        {/* Enhanced Gradient Overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"
                          initial={{ opacity: 0.4 }}
                          animate={hoveredProduct === product.id ? { opacity: 0.7 } : { opacity: 0.4 }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />
                        
                        {/* Transition Glow Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-purple-500/20 z-5 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={hoveredProduct === product.id ? { 
                            opacity: 1,
                            scale: 1.1
                          } : { 
                            opacity: 0,
                            scale: 1
                          }}
                          transition={{ 
                            duration: 0.8, 
                            ease: "easeInOut",
                            opacity: { duration: 0.6, ease: "easeInOut" },
                            scale: { duration: 0.8, ease: "easeOut" }
                          }}
                        />
                        
                        {/* Enhanced Floating Hologram Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                          {product.isNew && (
                            <motion.span 
                              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 text-white text-xs font-bold rounded-full shadow-lg"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              NEW
                            </motion.span>
                          )}
                          {product.isBestseller && (
                            <motion.span 
                              className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg"
                              initial={{ scale: 0, rotate: 180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                              whileHover={{ scale: 1.1, rotate: -5 }}
                            >
                              BESTSELLER
                            </motion.span>
                          )}
                        </div>
                        
                        {/* Enhanced Rating Badge */}
                        <motion.div
                          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 bg-black/80 backdrop-blur-md rounded-full border border-white/20 z-20"
                          initial={{ opacity: 0, x: 20, scale: 0.8 }}
                          animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                          transition={{ delay: index * 0.2 + 0.5, type: "spring", stiffness: 200 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold text-white">{product.rating}</span>
                        </motion.div>
                        
                        {/* Enhanced Animated Particles */}
                        <AnimatePresence>
                          {hoveredProduct === product.id && (
                            <>
                              {[...Array(12)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-80"
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
                      
                      {/* Enhanced Product Info with Better Layout */}
                      <div className="absolute bottom-0 left-0 right-0 z-30 p-8 flex flex-col gap-4">
                        {/* Enhanced Category and Reviews */}
                        <div className="flex items-center justify-between mb-2">
                          <motion.span 
                            className="text-sm font-bold text-cyan-400 bg-cyan-400/20 px-4 py-2 rounded-full border border-cyan-400/40 shadow-lg"
                            whileHover={{ scale: 1.05 }}
                          >
                            {product.category}
                          </motion.span>
                          <div className="flex items-center gap-2 text-sm text-white/90">
                            <Users className="w-4 h-4" />
                            <span className="font-semibold">{product.reviews} reviews</span>
                          </div>
                        </div>
                        
                        {/* Enhanced Product Title */}
                        <h3 className="text-xl font-black text-white drop-shadow-lg group-hover:text-cyan-300 transition-colors duration-300 mb-3 leading-tight">
                          {product.name}
                        </h3>
                        
                        {/* Enhanced Animated Color Swatches */}
                        <div className="mb-4">
                          <div className="text-sm text-white/90 mb-3 font-bold">Colors:</div>
                          <div className="flex items-center gap-3">
                            {product.colors.slice(0, 4).map((color, colorIndex) => (
                              <motion.button
                                key={colorIndex}
                                className={`w-9 h-9 rounded-full border-3 transition-all duration-300 ${
                                  selectedColor[product.id] === colorIndex
                                    ? 'border-cyan-400 scale-110 shadow-lg shadow-cyan-400/50'
                                    : 'border-white/40 hover:border-cyan-400/60'
                                }`}
                                style={{ backgroundColor: color.value }}
                                whileHover={{ scale: 1.3, boxShadow: '0 0 15px rgba(0, 212, 255, 0.6)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleColorSelect(product.id, colorIndex);
                                }}
                                title={color.name}
                              >
                                {selectedColor[product.id] === colorIndex && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-full h-full flex items-center justify-center"
                                  >
                                    <Check className="w-4 h-4 text-white" />
                                  </motion.div>
                                )}
                              </motion.button>
                            ))}
                            {product.colors.length > 4 && (
                              <span className="text-sm text-white/80 font-bold px-3 py-1.5 bg-white/15 rounded-full border border-white/20">
                                +{product.colors.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Enhanced Size Quick Select */}
                        <div className="mb-4">
                          <div className="text-sm text-white/90 mb-3 font-bold">Sizes:</div>
                          <div className="flex flex-wrap gap-2">
                            {product.sizes.slice(0, 4).map((size) => (
                              <motion.button
                                key={size}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                                  selectedSize[product.id] === size
                                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg shadow-cyan-400/40'
                                    : 'bg-white/15 text-white hover:bg-cyan-400/30 hover:text-cyan-300 border border-white/30'
                                }`}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSizeSelect(product.id, size);
                                }}
                              >
                                {size}
                              </motion.button>
                            ))}
                            {product.sizes.length > 4 && (
                              <span className="text-sm text-white/80 px-4 py-2 bg-white/15 rounded-lg border border-white/30 font-bold">
                                +{product.sizes.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Enhanced Price and Add to Cart */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-baseline gap-4">
                            <motion.span 
                              className="text-3xl font-black text-white drop-shadow-lg"
                              whileHover={{ scale: 1.05 }}
                            >
                              ${product.price}
                            </motion.span>
                            {product.originalPrice && (
                              <span className="text-lg text-white/60 line-through font-bold">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                          
                          {/* Enhanced Quick Add-to-Cart Button */}
                          <motion.button
                            onClick={(e) => handleQuickAdd(product, e)}
                            className="p-4 bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-400 text-white rounded-full shadow-xl border-2 border-cyan-400/60 hover:from-blue-600 hover:to-cyan-500 hover:shadow-2xl hover:shadow-cyan-400/40 transition-all duration-300"
                            whileHover={{ scale: 1.15, boxShadow: '0 0 25px rgba(0, 212, 255, 0.6)' }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
            {/* New Drop Coming Soon Section */}
            <motion.section 
              className="relative mt-20 py-20 overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Animated Background */}
              <div className="absolute inset-0">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/15 to-cyan-900/20"
                  animate={{
                    background: [
                      'linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.2))',
                      'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.15))',
                      'linear-gradient(225deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.2), rgba(147, 51, 234, 0.2))',
                      'linear-gradient(315deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.2))',
                    ]
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Floating Elements */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                    style={{
                      left: `${15 + Math.random() * 70}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      y: [0, -40, 0],
                      x: [0, Math.random() * 30 - 15, 0],
                      scale: [0, 1, 0.8, 1, 0],
                      opacity: [0, 0.8, 0.6, 0.4, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: Math.random() * 8 + 10,
                      repeat: Infinity,
                      delay: Math.random() * 5,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 max-w-6xl mx-auto px-6">
                <div className="text-center">
                  {/* Main Heading */}
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <motion.div
                      className="inline-flex items-center gap-4 mb-6"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <motion.div
                        className="p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full border-2 border-cyan-400/40"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <Package className="w-8 h-8 text-cyan-400" />
                      </motion.div>
                      <h2 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                        NEW DROP
                      </h2>
                      <motion.div
                        className="p-4 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full border-2 border-purple-400/40"
                        animate={{ rotate: [360, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <Crown className="w-8 h-8 text-purple-400" />
                      </motion.div>
                    </motion.div>
                    
                    <motion.h3
                      className="text-3xl md:text-4xl font-bold text-white mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      Coming Soon
                    </motion.h3>
                    
                    <motion.p
                      className="text-xl text-cyan-200/90 max-w-3xl mx-auto leading-relaxed mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      Get ready for our most exclusive collection yet. Limited edition pieces that will redefine streetwear culture.
                      Be the first to know when we drop.
                    </motion.p>
                  </motion.div>

                  {/* Countdown Timer */}
                  <motion.div
                    className="flex justify-center gap-6 mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  >
                    {[
                      { label: 'Days', value: '14' },
                      { label: 'Hours', value: '23' },
                      { label: 'Minutes', value: '47' },
                      { label: 'Seconds', value: '32' }
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        className="flex flex-col items-center"
                        whileHover={{ scale: 1.1 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                      >
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border-2 border-cyan-400/40 flex items-center justify-center mb-3 backdrop-blur-sm">
                          <motion.span
                            className="text-2xl md:text-3xl font-black text-white"
                            animate={{ 
                              scale: [1, 1.05, 1],
                              textShadow: [
                                '0 0 10px rgba(6, 182, 212, 0.5)',
                                '0 0 20px rgba(6, 182, 212, 0.8)',
                                '0 0 10px rgba(6, 182, 212, 0.5)'
                              ]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              ease: "easeInOut" 
                            }}
                          >
                            {item.value}
                          </motion.span>
                        </div>
                        <span className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                          {item.label}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                  >
                    <motion.button
                      className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-2xl shadow-2xl border-2 border-cyan-400/50 hover:from-purple-600 hover:to-cyan-500 transition-all duration-300 flex items-center gap-3"
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: '0 0 30px rgba(6, 182, 212, 0.6)',
                        y: -5
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Package className="w-5 h-5" />
                      </motion.div>
                      Get Notified
                    </motion.button>
                    
                    <motion.button
                      className="px-8 py-4 bg-transparent text-cyan-300 font-bold rounded-2xl border-2 border-cyan-400/50 hover:bg-cyan-400/10 transition-all duration-300 flex items-center gap-3"
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                        y: -5
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                      View Preview
                    </motion.button>
                  </motion.div>

                  {/* Social Proof */}
                  <motion.div
                    className="mt-12 flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.4 }}
                  >
                    <p className="text-cyan-200/80 mb-4 font-medium">Join 50,000+ streetwear enthusiasts</p>
                    <div className="flex items-center gap-6">
                      <motion.div
                        className="flex items-center gap-2 text-cyan-300"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Users className="w-5 h-5" />
                        <span className="font-bold">2.5K</span>
                        <span className="text-sm">waiting</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-2 text-purple-300"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Star className="w-5 h-5 fill-purple-300" />
                        <span className="font-bold">4.9</span>
                        <span className="text-sm">rating</span>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
                <motion.button
                  onClick={() => {
                    setSelectedFilters({
                      priceRange: [0, 200],
                      colors: [],
                      sizes: [],
                      sortBy: 'newest'
                    });
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Filters
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TShirtCollection; 