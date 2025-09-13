import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Eye, 
  Star, 
  ArrowLeft, 
  Package,
  Sparkles,
  Timer,
  Award,
  Shield,
  RotateCcw,
  Share2,
  Plus,
  Minus,
  X,
  Grid,
  List,
  Filter,
  Crown,
  Users,
  TrendingUp,
  Calendar,
  Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProductViewer3D from '@/components/ProductViewer3D';
import { toast } from '@/components/ui/use-toast';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  compare_price?: number;
  image: string;
  images?: string[];
  category: string;
  addedAt: string;
  description?: string;
  rating?: number;
  reviews?: number;
  isLimited?: boolean;
  isNew?: boolean;
  colors?: string[];
  sizes?: string[];
}

const Wishlist = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<WishlistItem | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterBy, setFilterBy] = useState('all');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('vlanco_wishlist') || '[]');
    // Use the complete product data that was saved from collections
    const enhancedWishlist = savedWishlist.map((item: any) => ({
      ...item,
      // Ensure we have all the enhanced fields with fallbacks
      images: item.images || [item.image, item.image, item.image],
      description: item.description || `Premium ${item.category?.toLowerCase()} piece from VLANCO collection. Crafted with attention to detail and modern design aesthetics.`,
      rating: item.rating || 4.8,
      reviews: item.reviews || Math.floor(Math.random() * 100) + 20,
      isLimited: item.isLimited || item.isBestseller || false,
      isNew: item.isNew || false,
      isBestseller: item.isBestseller || false,
      colors: item.colors || ['Black', 'White', 'Gray'],
      sizes: item.sizes || ['S', 'M', 'L', 'XL'],
      compare_price: item.compare_price || (item.price * 1.3),
      material: item.material || 'Premium Materials',
      brand: item.brand || 'VLANCO',
      collection: item.collection || `${item.category} Collection`,
      tags: item.tags || ['streetwear', 'premium'],
      features: item.features || [],
      availability: item.availability || 'In Stock',
      shipping: item.shipping || 'Standard Shipping'
    }));
    setWishlistItems(enhancedWishlist);
  }, []);

  const removeFromWishlist = (productId: string) => {
    const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updatedWishlist);
    
    const simplifiedWishlist = updatedWishlist.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      addedAt: item.addedAt
    }));
    
    localStorage.setItem('vlanco_wishlist', JSON.stringify(simplifiedWishlist));
    
    // Dispatch custom event to notify navigation about wishlist update
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { updatedWishlist: simplifiedWishlist } }));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.setItem('vlanco_wishlist', JSON.stringify([]));
    
    // Dispatch custom event to notify navigation about wishlist update
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { updatedWishlist: [] } }));
  };

  const viewProduct = (item: WishlistItem) => {
    navigate(`/product/${item.id}`);
  };

  const view360Product = (item: WishlistItem) => {
    setSelectedProduct(item);
    setSelectedColor(item.colors?.[0] || '');
    setSelectedSize(item.sizes?.[0] || '');
    setShowProductDetail(true);
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!user) {
      alert('Please sign in to add items to cart');
      return;
    }

    try {
      // Use the proper cart hook instead of localStorage
      await addToCart(String(item.id), String(item.id), selectedQuantity, {
        price: item.price,
        product: { 
          base_price: item.price,
          name: item.name,
          description: item.description,
          compare_price: item.compare_price
        },
        variant: { 
          price: item.price,
          color: selectedColor || item.colors?.[0] || 'Black',
          size: selectedSize || item.sizes?.[0] || 'M'
        }
      });

      toast({
        title: 'Added to Cart',
        description: `${item.name} has been added to your cart!`,
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'oldest':
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const filteredItems = sortedItems.filter(item => {
    switch (filterBy) {
      case 'new':
        return item.isNew;
      case 'limited':
        return item.isLimited;
      case 'sale':
        return item.compare_price && item.compare_price > item.price;
      default:
        return true;
    }
  });

  const FloatingParticles = ({ count = 8 }) => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-gradient-to-br from-red-400/30 to-pink-500/20 rounded-full"
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

  const EmptyWishlist = () => (
    <motion.div
      className="text-center py-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
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
        <Heart className="w-24 h-24 mx-auto text-muted-foreground/50" />
      </motion.div>
      
      <h2 className="text-3xl font-bold mb-4">Your wishlist is empty</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Start building your wishlist by adding items you love. 
        They'll appear here so you can easily find them later.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          onClick={() => navigate('/collection/t-shirts')}
          className="px-8 py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl font-semibold"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Package className="w-5 h-5 mr-2 inline" />
          Browse Collection
        </motion.button>
        
        <motion.button
          onClick={() => navigate('/')}
          className="px-8 py-4 border border-border rounded-2xl font-semibold hover:bg-muted/50"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Home
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <>
      <Navigation />
      
      <div 
        ref={containerRef}
        className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background pt-20 pb-16 relative overflow-hidden"
      >
        {/* Enhanced Background Effects */}
        <FloatingParticles count={12} />
        
        {/* Subtle gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-40 h-40 bg-gradient-to-br from-red-500/8 to-pink-500/4 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-purple-500/8 to-indigo-500/4 rounded-full blur-2xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.6, 0.4],
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />

        <div className="max-w-7xl mx-auto px-6">
          {/* Enhanced Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Back Button */}
            <motion.button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-3 mb-8 p-3 bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/50 transition-all"
              whileHover={{ scale: 1.02, x: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5 group-hover:text-primary transition-colors" />
              <span className="font-medium group-hover:text-primary transition-colors">Back</span>
            </motion.button>

            {/* Page Title */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center gap-3 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full border border-red-500/30"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="w-6 h-6 text-red-500" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  My Wishlist
                </h1>
                <motion.div
                  className="p-3 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full border border-primary/20"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Crown className="w-6 h-6 text-primary" />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Keep track of all your favorite items and never miss out on the pieces you love.
                Your curated collection of style and inspiration.
              </motion.p>
            </div>
            
            {/* Stats Bar */}
            {wishlistItems.length > 0 && (
              <motion.div
                className="flex justify-center items-center gap-8 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {[
                  { icon: Heart, label: 'Items', value: wishlistItems.length },
                  { icon: Package, label: 'Categories', value: new Set(wishlistItems.map(item => item.category)).size },
                  { icon: Gift, label: 'Limited', value: wishlistItems.filter(item => item.isLimited).length },
                  { icon: Sparkles, label: 'New', value: wishlistItems.filter(item => item.isNew).length }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full border border-border/50"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <stat.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Controls Bar */}
          {wishlistItems.length > 0 && (
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="bg-background/80 backdrop-blur-sm rounded-3xl border border-border/50 p-6 shadow-lg">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                  {/* Filters */}
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: 'all', label: 'All Items', icon: Package },
                      { id: 'new', label: 'New', icon: Sparkles },
                      { id: 'limited', label: 'Limited', icon: Award },
                      { id: 'sale', label: 'On Sale', icon: Timer }
                    ].map((filter) => (
                      <motion.button
                        key={filter.id}
                        onClick={() => setFilterBy(filter.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                          filterBy === filter.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <filter.icon className="w-4 h-4" />
                        {filter.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-4">
                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:border-primary/50"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name A-Z</option>
                    </select>

                    {/* View Mode */}
                    <div className="flex bg-muted/30 rounded-xl p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${
                          viewMode === 'grid' 
                            ? 'bg-background shadow-sm' 
                            : 'hover:bg-background/50'
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${
                          viewMode === 'list' 
                            ? 'bg-background shadow-sm' 
                            : 'hover:bg-background/50'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Clear All */}
              <motion.button
                onClick={clearWishlist}
                      className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </motion.button>
                  </div>
                </div>
          </div>
        </motion.div>
          )}

        {/* Wishlist Content */}
          {filteredItems.length === 0 ? (
            <EmptyWishlist />
          ) : (
          <motion.div
              className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                  className={`group relative ${viewMode === 'list' ? 'flex gap-6' : ''}`}
                  initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
              >
                  <div className={`bg-gradient-to-br from-background/80 to-muted/20 backdrop-blur-sm rounded-3xl border border-border/50 overflow-hidden group-hover:shadow-2xl transition-all duration-500 ${
                    viewMode === 'list' ? 'flex-shrink-0 w-64' : ''
                  }`}>
                {/* Product Image */}
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'h-48' : 'aspect-square'}`}>
                      <motion.img
                    src={item.image}
                    alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        whileHover={{ scale: 1.05 }}
                      />
                      
                      {/* Enhanced Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {item.isNew && (
                          <motion.span 
                            className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                          >
                            NEW
                          </motion.span>
                        )}
                        {item.isBestseller && (
                          <motion.span 
                            className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.25 + index * 0.1 }}
                          >
                            BESTSELLER
                          </motion.span>
                        )}
                        {item.isLimited && (
                          <motion.span 
                            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            LIMITED
                          </motion.span>
                        )}
                        {item.compare_price && item.compare_price > item.price && (
                          <motion.span 
                            className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.35 + index * 0.1 }}
                          >
                            -{Math.round((1 - item.price / item.compare_price) * 100)}% OFF
                          </motion.span>
                        )}
                        {item.availability === 'In Stock' && (
                          <motion.span 
                            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                          >
                            IN STOCK
                          </motion.span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-red-50 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                          <X className="w-4 h-4 text-red-500" />
                    </motion.button>
                    
                    <motion.button
                      onClick={() => viewProduct(item)}
                          className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                    
                    <motion.button
                          onClick={() => view360Product(item)}
                          className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                          <RotateCcw className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  </div>

                      {/* Floating hearts when hovered */}
                      <AnimatePresence>
                        {hoveredItem === item.id && (
                          <>
                            {[...Array(6)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute"
                                style={{
                                  left: `${20 + Math.random() * 60}%`,
                                  top: `${20 + Math.random() * 60}%`,
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                  scale: [0, 1, 0],
                                  opacity: [0, 1, 0],
                                  y: [0, -30, -60],
                                  x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40],
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                  duration: 2,
                                  delay: i * 0.1,
                                  ease: "easeOut"
                                }}
                              >
                                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                              </motion.div>
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                </div>

                {/* Product Info */}
                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                              {item.category}
                            </span>
                            {item.collection && (
                              <span className="text-xs font-medium text-muted-foreground bg-muted/20 px-2 py-1 rounded-full">
                                {item.collection}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium">{item.rating}</span>
                            <span className="text-xs text-muted-foreground">({item.reviews})</span>
                          </div>
                        </div>
                  
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors mb-2">
                          {item.name}
                        </h3>
                        
                        {/* Enhanced product details */}
                        {item.material && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Package className="w-3 h-3" />
                            <span>{item.material}</span>
                          </div>
                        )}
                        
                        {/* Color and Size info */}
                        {(item.colors || item.sizes) && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            {item.colors && item.colors.length > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <span>{item.colors.slice(0, 2).join(', ')}</span>
                                {item.colors.length > 2 && <span>+{item.colors.length - 2}</span>}
                              </div>
                            )}
                            {item.sizes && item.sizes.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Sizes:</span>
                                <span>{item.sizes.slice(0, 3).join(', ')}</span>
                                {item.sizes.length > 3 && <span>+{item.sizes.length - 3}</span>}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                        </div>
                        
                        {/* Product Features */}
                        {item.features && item.features.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {item.features.slice(0, 3).map((feature: string, idx: number) => (
                                <motion.span
                                  key={idx}
                                  className="px-2 py-1 text-xs font-medium bg-muted/20 text-muted-foreground rounded-md border border-border/50"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.1 + idx * 0.05 }}
                                >
                                  {feature}
                                </motion.span>
                              ))}
                              {item.features.length > 3 && (
                                <span className="px-2 py-1 text-xs text-muted-foreground">
                                  +{item.features.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                  
                  <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">${item.price}</span>
                          {item.compare_price && (
                            <>
                              <span className="text-sm text-muted-foreground line-through">
                                ${item.compare_price}
                              </span>
                              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                -{Math.round((1 - item.price / item.compare_price) * 100)}%
                    </span>
                            </>
                          )}
                    </div>
                  </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2">
                    <motion.button
                          onClick={() => handleAddToCart(item)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm"
                          whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                    </motion.button>
                    
                    <motion.button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-3 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 className="w-4 h-4" />
                    </motion.button>
                      </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

        {/* Product Detail Modal */}
      <AnimatePresence>
        {showProductDetail && selectedProduct && (
          <motion.div
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
              onClick={() => setShowProductDetail(false)}
            >
              <motion.div
                className="bg-background rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
              <button
                onClick={() => setShowProductDetail(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                    <X className="w-6 h-6" />
              </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 3D Viewer */}
                   <div className="h-96 bg-muted/30 rounded-2xl overflow-hidden">
                  <ProductViewer3D
                       productImages={selectedProduct.images || [selectedProduct.image]}
                    productName={selectedProduct.name}
                       selectedColor={selectedColor}
                  />
                </div>

                {/* Product Details */}
                  <div className="space-y-6">
                    <div>
                      <p className="text-muted-foreground mb-4">{selectedProduct.description}</p>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-3xl font-bold">${selectedProduct.price}</span>
                        {selectedProduct.compare_price && (
                          <span className="text-xl text-muted-foreground line-through">
                            ${selectedProduct.compare_price}
                    </span>
                        )}
                      </div>
                  </div>
                  
                    {/* Color Selection */}
                    {selectedProduct.colors && (
                      <div>
                        <h4 className="font-semibold mb-3">Color</h4>
                        <div className="flex gap-2">
                          {selectedProduct.colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={`px-4 py-2 rounded-lg border transition-all ${
                                selectedColor === color
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border hover:border-muted-foreground'
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size Selection */}
                    {selectedProduct.sizes && (
                      <div>
                        <h4 className="font-semibold mb-3">Size</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {selectedProduct.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`py-2 rounded-lg border transition-all ${
                                selectedSize === size
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border hover:border-muted-foreground'
                              }`}
                            >
                              {size}
                            </button>
                      ))}
                    </div>
                  </div>
                    )}

                    {/* Quantity */}
                    <div>
                      <h4 className="font-semibold mb-3">Quantity</h4>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                          className="p-2 border rounded-lg hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-medium w-12 text-center">{selectedQuantity}</span>
                        <button
                          onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                          className="p-2 border rounded-lg hover:bg-muted transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                  </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                    <motion.button
                        onClick={() => handleAddToCart(selectedProduct)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                    </motion.button>
                    
                    <motion.button
                        onClick={() => viewProduct(selectedProduct)}
                        className="px-6 py-3 border border-border rounded-xl font-semibold hover:bg-muted transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                        View Details
                    </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <Footer />
    </>
  );
};

export default Wishlist; 