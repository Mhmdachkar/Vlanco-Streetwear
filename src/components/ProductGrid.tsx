
import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, Star, Zap, Sparkles, TrendingUp, Crown, Package, Users } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

// Add a custom hook for count-up animation
function useCountUp(target: number, duration = 1200, decimals = 0, suffix = '') {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    let raf: number;
    let startTime: number | null = null;
    function animate(ts: number) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const current = start + (target - start) * progress;
      setValue(current);
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  let display = value.toFixed(decimals);
  if (suffix === 'K+') {
    display = (value >= 1000 ? (value / 1000).toFixed(1) : value.toFixed(0)) + 'K+';
  } else if (suffix) {
    display += suffix;
  }
  return display;
}

const ProductGrid = () => {
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart, removeFromCart, items } = useCart();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [wishlist, setWishlist] = useState<number[]>([]);

  const handleAddToCart = async (e: React.MouseEvent, product: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const imgEl = (e.currentTarget as HTMLElement).closest('.group')?.querySelector('img') as HTMLImageElement | null;
      const cartEl = document.getElementById('cart-icon');
      if (imgEl && cartEl) {
        const imgRect = imgEl.getBoundingClientRect();
        const cartRect = cartEl.getBoundingClientRect();
        const ghost = imgEl.cloneNode(true) as HTMLImageElement;
        ghost.style.position = 'fixed';
        ghost.style.left = imgRect.left + 'px';
        ghost.style.top = imgRect.top + 'px';
        ghost.style.width = imgRect.width + 'px';
        ghost.style.height = imgRect.height + 'px';
        ghost.style.zIndex = '9999';
        ghost.style.borderRadius = '12px';
        ghost.style.transition = 'transform 600ms cubic-bezier(.2,.8,.2,1), opacity 600ms';
        document.body.appendChild(ghost);
        const dx = cartRect.left - imgRect.left;
        const dy = cartRect.top - imgRect.top;
        requestAnimationFrame(() => {
          ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.1)`;
          ghost.style.opacity = '0.2';
        });
        setTimeout(() => ghost.remove(), 650);
      }
    } catch (_) {}

    await addToCart(String(product.id), String(product.id), 1, {
      price: product.displayPrice ?? product.price ?? 0,
      product: { base_price: product.displayPrice ?? product.price ?? 0 },
      variant: { price: product.displayPrice ?? product.price ?? 0 }
    });

    const match = (items as any[]).find((i: any) => i.product_id === String(product.id));
    toast({
      title: 'Added to Cart',
      description: `${product.name} was added to your cart.`,
      action: (
        <button
          onClick={() => { if (match?.id) removeFromCart(match.id); }}
          className="ml-2 underline"
        >
          Undo
        </button>
      ) as any,
      duration: 4000
    });
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const categories = [
    { id: 'All', label: 'All Products', icon: Package },
    { id: 'T-Shirts', label: 'T-Shirts', icon: TrendingUp },
    { id: 'Hoodies', label: 'Hoodies', icon: Crown },
    { id: 'Accessories', label: 'Accessories', icon: Sparkles },
    { id: 'Limited Edition', label: 'Limited', icon: Zap }
  ];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Enhanced mock products for better display
  const enhancedProducts = filteredProducts.map((product, index) => {
    const price = product.price;
    const comparePrice = product.price * 1.3; // Mock compare price
    const discountPercentage = Math.round((1 - price / comparePrice) * 100);

    // Professional product images for different categories
    const professionalImages = [
      'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=800&fit=crop&crop=center', // Clean white t-shirt
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop&crop=center', // Black graphic t-shirt
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop&crop=center', // Hoodie
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=800&fit=crop&crop=center', // Streetwear jacket
      'https://images.unsplash.com/photo-1585232351014-c2fb3c8dd1f3?w=800&h=800&fit=crop&crop=center', // Fashion mask
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop&crop=center'  // Accessories/watches
    ];

    return {
      ...product,
      displayImage: professionalImages[index % professionalImages.length],
      displayPrice: price,
      compare_price: comparePrice,
      discountPercentage,
      rating: 4.8,
      reviews: Math.floor(Math.random() * 200) + 50,
      isNew: index < 2, // First 2 products are new
      isLimited: index % 3 === 0, // Every 3rd product is limited
      colors: ['Black', 'White', 'Navy', 'Gray'],
      sizes: ['S', 'M', 'L', 'XL'],
      slug: `product-${product.id}`
    };
  });

  const FloatingParticles = ({ count = 15, color = "from-primary/20 to-purple-500/10" }) => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className={`absolute w-1 h-1 bg-gradient-to-br ${color} rounded-full`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            scale: [0, 1, 0.5, 1, 0],
            opacity: [0, 0.8, 0.6, 0.4, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: Math.random() * 12 + 8,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="bg-gradient-to-br from-background/80 to-muted/20 backdrop-blur-sm rounded-3xl border border-border/50 overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
        >
          <div className="animate-pulse">
            <div className="bg-muted/50 rounded-t-3xl h-80" />
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="bg-muted/50 h-4 w-3/4 rounded" />
                <div className="bg-muted/50 h-6 w-1/2 rounded" />
                <div className="bg-muted/50 h-4 w-1/4 rounded" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <section className="py-24 px-6 relative overflow-hidden" id="collections">
        <FloatingParticles count={20} />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-3 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                className="p-3 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full border border-primary/20"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Package className="w-6 h-6 text-primary" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Latest Drops
            </h2>
              <motion.div
                className="p-3 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full border border-primary/20"
                animate={{ rotate: [360, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
            </motion.div>
            
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Loading our cutting-edge streetwear collection...
            </motion.p>
          </motion.div>
          
          <LoadingSkeleton />
        </div>
      </section>
    );
  }

  return (
    <>
      <section 
        ref={containerRef}
        className="py-24 px-6 relative overflow-hidden" 
        id="collections"
      >
        {/* Enhanced Animated Background */}
        <FloatingParticles count={25} />
        
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

        <div className="max-w-7xl mx-auto relative">
          {/* Enhanced Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-3 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                className="p-3 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full border border-primary/20"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Package className="w-6 h-6 text-primary" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Latest Drops
            </h2>
              <motion.div
                className="p-3 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full border border-primary/20"
                animate={{ rotate: [360, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
            </motion.div>
            
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Discover our cutting-edge streetwear collection where innovation meets style. 
              Each piece is crafted for the rebels, the creators, and the trendsetters.
            </motion.p>
          </motion.div>

          {/* Animated Stats Section with enhancements */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 mb-16 relative"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.15 }
              }
            }}
          >
            {/* Animated moving gradient background */}
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
            {[
              {
                icon: <Package className="w-7 h-7 mx-auto text-cyan-400 drop-shadow-[0_0_12px_#22d3ee]" />,
                value: 6,
                label: 'Products',
                decimals: 0,
                suffix: '',
                glow: '0 0 16px #22d3ee, 0 0 32px #22d3ee44',
                border: 'border-cyan-400',
              },
              {
                icon: <Users className="w-7 h-7 mx-auto text-green-400 drop-shadow-[0_0_12px_#22c55e]" />,
                value: 1200,
                label: 'Reviews',
                decimals: 0,
                suffix: 'K+',
                glow: '0 0 16px #22c55e, 0 0 32px #22c55e44',
                border: 'border-green-400',
              },
              {
                icon: <Star className="w-7 h-7 mx-auto text-yellow-400 fill-yellow-400 drop-shadow-[0_0_12px_#fde047]" />,
                value: 4.8,
                label: 'Rating',
                decimals: 1,
                suffix: '',
                glow: '0 0 16px #fde047, 0 0 32px #fde04744',
                border: 'border-yellow-400',
              },
              {
                icon: <TrendingUp className="w-7 h-7 mx-auto text-purple-400 drop-shadow-[0_0_12px_#a855f7]" />,
                value: 25,
                label: 'Trending',
                decimals: 0,
                suffix: '%',
                glow: '0 0 16px #a855f7, 0 0 32px #a855f744',
                border: 'border-purple-400',
              },
            ].map((stat, i) => {
              // Count-up logic
              let displayValue: string | number = stat.value;
              if (isInView) {
                if (stat.label === 'Reviews') {
                  displayValue = String(useCountUp(1200, 1200, 0, 'K+'));
                } else if (stat.label === 'Rating') {
                  displayValue = String(useCountUp(4.8, 1200, 1));
                } else if (stat.label === 'Trending') {
                  displayValue = String(useCountUp(25, 1200, 0, '%'));
                } else {
                  displayValue = String(useCountUp(6, 1200, 0));
                }
              }
              return (
                <motion.div
                  key={stat.label}
                  className={`relative flex flex-col items-center justify-center bg-black/60 rounded-2xl px-10 py-8 min-w-[120px] shadow-lg border border-border/30 z-10`}
                  style={{ boxShadow: stat.glow }}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.15, type: 'spring', stiffness: 80 }}
                  whileHover={{ scale: 1.08, boxShadow: `${stat.glow}, 0 0 0 2px var(--tw-shadow-color)` }}
                >
                  <motion.div
                    className="mb-2"
                    whileHover={{ scale: 1.18, rotate: [0, 10, -10, 0] }}
                    transition={{ type: 'spring', stiffness: 200, damping: 8 }}
                  >
                    {stat.icon}
                  </motion.div>
                  <motion.div
                    className="text-3xl font-bold mt-3 mb-1"
                    style={{ textShadow: stat.glow }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                  >
                    {displayValue}
                  </motion.div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Enhanced Filter Tabs */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted/30 hover:bg-muted/50 border border-border/50'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.label}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Enhanced Product Grid */}
          {enhancedProducts.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.div
                className="mb-8"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Package className="w-24 h-24 mx-auto text-muted-foreground/50" />
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-4">No products found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Our streetwear collection is being curated. Check back soon for the latest drops!
              </p>
              
              <motion.button
                onClick={() => setSelectedCategory('All')}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Products
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.12 } }
              }}
            >
              {enhancedProducts.map((product, index) => (
                <motion.div
                    key={product.id}
                  className="group relative"
                  variants={{ hidden: { opacity: 0, y: 40, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  onHoverStart={() => setHoveredProduct(product.id)}
                  onHoverEnd={() => setHoveredProduct(null)}
                >
                  {/* Main Product Card */}
                  <motion.div
                    className="bg-gradient-to-br from-background/80 to-muted/20 backdrop-blur-sm rounded-3xl border border-border/50 overflow-hidden cursor-pointer group-hover:shadow-2xl transition-all duration-500"
                    whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.25 } }}
                    onClick={() => navigate(`/product/${product.slug}`)}
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Product Image with 3D Effects */}
                    <div className="relative h-80 overflow-hidden">
                      <motion.img
                        src={product.displayImage}
                        alt={product.name}
                        className="w-full h-full object-cover will-change-transform"
                        animate={hoveredProduct === product.id ? { scale: 1.06 } : { scale: 1 } as any}
                        transition={{ duration: 0.35 }}
                      />
                      
                      {/* Enhanced Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.isNew && (
                          <motion.span 
                            className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                          >
                            NEW
                          </motion.span>
                        )}
                        {product.isLimited && (
                          <motion.span 
                            className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            LIMITED
                          </motion.span>
                        )}
                        {product.discountPercentage > 0 && (
                          <motion.span 
                            className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                          >
                            {product.discountPercentage}% OFF
                          </motion.span>
                        )}
                      </div>

                      {/* Rating Badge */}
                      <motion.div
                        className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full border border-border/50"
                        initial={{ opacity: 0, x: 20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: index * 0.2 + 0.5 }}
                      >
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{product.rating}</span>
                      </motion.div>

                      {/* Action Buttons */}
                      <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className="p-3 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart 
                            className={`w-4 h-4 ${
                              wishlist.includes(product.id) 
                                ? 'text-red-500 fill-red-500' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        </motion.button>
                        
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.slug}`);
                          }}
                          className="p-3 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </motion.button>
                      </div>

                      {/* Creative Floating Elements */}
                      <AnimatePresence>
                        {hoveredProduct === product.id && (
                          <>
                            {[...Array(8)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-gradient-to-r from-primary to-purple-600 rounded-full"
                                style={{
                                  left: `${20 + Math.random() * 60}%`,
                                  top: `${20 + Math.random() * 60}%`,
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                  scale: [0, 1, 0],
                                  opacity: [0, 1, 0],
                                  y: [0, -40, -80],
                                  x: [0, Math.random() * 50 - 25, Math.random() * 100 - 50],
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

                    {/* Product Info */}
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {product.category || 'Streetwear'}
                        </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{product.reviews} reviews</span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors mb-2">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-3">
                          {product.colors.slice(0, 4).map((color, colorIndex) => (
                            <motion.div
                              key={colorIndex}
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: color.toLowerCase() }}
                              whileHover={{ scale: 1.2 }}
                              transition={{ duration: 0.2 }}
                            />
                          ))}
                          {product.colors.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{product.colors.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">${product.displayPrice.toFixed(2)}</span>
                        {(product as any).compare_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${(product as any).compare_price.toFixed(2)}
                          </span>
                        )}
                      </div>

                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(e, product);
                          }}
                          className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                          whileHover={{ scale: 1.1, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Enhanced border glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={hoveredProduct === product.id ? {
                        boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)"
                      } : {}}
                    />
                  </motion.div>

                  {/* Creative Side Elements */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-0 group-hover:opacity-100"
                    animate={hoveredProduct === product.id ? { 
                      scale: [0, 1.2, 1],
                      rotate: [0, 180, 360] 
                    } : { scale: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  <motion.div
                    className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-0 group-hover:opacity-100"
                    animate={hoveredProduct === product.id ? { 
                      scale: [0, 1, 1.2, 1],
                      rotate: [0, -180, -360] 
                    } : { scale: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default ProductGrid;
