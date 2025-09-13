import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, Heart, Eye, Zap, Star } from 'lucide-react';
import AuthModal from './AuthModal';

interface LatestDropsSectionProps {
  currentProductId?: string;
}

const LatestDropsSection = ({ currentProductId }: LatestDropsSectionProps) => {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  // Filter latest drops (excluding current product)
  const latestDrops = products
    .filter(product => 
      product.is_new_arrival && 
      product.id !== currentProductId &&
      product.status === 'active'
    )
    .slice(0, 8);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleAddToCart = (productId: string) => {
    if (!user) return;
    const product = products.find(p => p.id === productId);
    const defaultVariant = product?.product_variants?.[0];
    if (product && defaultVariant) {
      addToCart(String(product.id), String(defaultVariant.id), 1, {
        product: {
          name: product.name,
          base_price: product.base_price ?? product.price ?? 0,
          image_url: product.image_url || product.image,
          category: product.category?.name || product.category,
          description: product.description
        },
        variant: {
          id: defaultVariant.id,
          price: defaultVariant.price ?? product.base_price ?? 0,
          name: defaultVariant.name || 'Default'
        },
        price: defaultVariant.price ?? product.base_price ?? 0
      });
    }
  };

  const handleToggleWishlist = async (product: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        // Create comprehensive wishlist item with complete product information
        const wishlistItem = {
          id: product.id,
          name: product.name,
          price: product.base_price || product.price || 0,
          compare_price: product.compare_price || null,
          image: product.image_url || product.image,
          images: product.product_images?.map(img => img.image_url) || [product.image_url || product.image],
          category: product.category?.name || 'Latest Drops',
          description: product.description || `${product.name} - Premium streetwear collection from VLANCO`,
          rating: product.rating_average || 4.5,
          reviews: product.rating_count || 0,
          isLimited: product.is_limited_edition || false,
          isNew: product.is_new_arrival || true,
          isBestseller: product.is_bestseller || false,
          colors: product.color_options || ['Black', 'White'],
          sizes: product.size_options || ['S', 'M', 'L', 'XL'],
          material: product.material || 'Premium Materials',
          brand: product.brand || 'VLANCO',
          collection: product.collection || 'Latest Drops',
          tags: product.tags || ['streetwear', 'latest', 'new'],
          features: product.features || [],
          availability: product.availability || 'In Stock',
          shipping: product.shipping || 'Standard Shipping',
          addedAt: new Date().toISOString()
        };
        
        // Add to wishlist using the hook (Supabase + localStorage)
        await addToWishlist(wishlistItem);
        
        // Also save to the main localStorage key that the wishlist page reads from
        const existingWishlist = JSON.parse(localStorage.getItem('vlanco_wishlist') || '[]');
        const updatedWishlist = [wishlistItem, ...existingWishlist.filter((item: any) => item.id !== product.id)];
        localStorage.setItem('vlanco_wishlist', JSON.stringify(updatedWishlist));
        
        // Save to guest wishlist key (used by useWishlist hook for guests)
        const guestWishlist = JSON.parse(localStorage.getItem('vlanco_guest_wishlist') || '[]');
        const updatedGuestWishlist = [wishlistItem, ...guestWishlist.filter((item: any) => item.id !== product.id)];
        localStorage.setItem('vlanco_guest_wishlist', JSON.stringify(updatedGuestWishlist));
        
        // Save to hardcoded wishlist as backup
        const hardcodedWishlist = JSON.parse(localStorage.getItem('vlanco_hardcoded_wishlist') || '[]');
        const updatedHardcodedWishlist = [wishlistItem, ...hardcodedWishlist.filter((item: any) => item.id !== product.id)];
        localStorage.setItem('vlanco_hardcoded_wishlist', JSON.stringify(updatedHardcodedWishlist));
        
        // Dispatch custom event to notify components about wishlist update
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { updatedWishlist } }));
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  if (loading || latestDrops.length === 0) {
    return null;
  }

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-background to-muted/20">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px] opacity-20"></div>
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(600px circle at ${springX}px ${springY}px, rgba(255,255,255,0.1), transparent 40%)`,
          }}
        />
      </div>

      <div 
        ref={containerRef}
        className="container mx-auto px-6 relative z-10"
        onMouseMove={handleMouseMove}
      >
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-6xl md:text-8xl font-black mb-6 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="gradient-text relative">
              LATEST
              <motion.span
                className="absolute -inset-2 bg-primary/20 rounded-lg -z-10"
                initial={{ scale: 0, rotate: -5 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              />
            </span>
            <br />
            <span className="text-foreground">DROPS</span>
          </motion.h2>
          
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Zap className="w-8 h-8 text-primary animate-pulse" />
            <p className="text-xl text-muted-foreground max-w-2xl">
              Fresh designs, exclusive pieces, and limited editions that define the future of streetwear
            </p>
            <Zap className="w-8 h-8 text-primary animate-pulse" />
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            className="flex justify-center gap-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="card-glow p-4 rounded-xl">
              <div className="text-2xl font-bold gradient-text">{latestDrops.length}</div>
              <div className="text-sm text-muted-foreground">New Drops</div>
            </div>
            <div className="card-glow p-4 rounded-xl">
              <div className="text-2xl font-bold gradient-text">24H</div>
              <div className="text-sm text-muted-foreground">Fresh Releases</div>
            </div>
            <div className="card-glow p-4 rounded-xl">
              <div className="text-2xl font-bold gradient-text">∞</div>
              <div className="text-sm text-muted-foreground">Style Possibilities</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Product Galaxy */}
        <div className="relative">
          {/* Central Energy Core */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 z-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary opacity-20 animate-pulse"></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-primary via-accent to-primary opacity-40 animate-pulse"></div>
            <div className="absolute inset-8 rounded-full bg-gradient-to-r from-primary via-accent to-primary opacity-60 animate-pulse"></div>
          </motion.div>

          {/* Product Grid with Floating Animation */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 relative z-10">
            {latestDrops.map((product, index) => {
              const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
              const defaultVariant = product.product_variants?.[0];
              const price = defaultVariant?.price || product.base_price;
              const discountPercentage = product.compare_price 
                ? Math.round((1 - price / product.compare_price) * 100)
                : 0;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -20, 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  className="relative group"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Product Orb */}
                  <div className="relative card-premium card-glow hover-lift overflow-hidden">
                    {/* Energy Field */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20"
                      animate={{ 
                        opacity: hoveredProduct === product.id ? [0.2, 0.5, 0.2] : 0.1,
                        scale: hoveredProduct === product.id ? [1, 1.1, 1] : 1
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Product Image */}
                    <div className="relative w-full h-64 bg-muted rounded-xl overflow-hidden">
                      {primaryImage ? (
                        <motion.img
                          src={primaryImage.image_url}
                          alt={primaryImage.alt_text || product.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}

                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.is_limited_edition && (
                          <motion.span
                            className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            LIMITED
                          </motion.span>
                        )}
                        {discountPercentage > 0 && (
                          <motion.span
                            className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {discountPercentage}% OFF
                          </motion.span>
                        )}
                      </div>

                      {/* Holographic Overlay */}
                      <AnimatePresence>
                        {hoveredProduct === product.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 flex items-center justify-center"
                          >
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              className="flex gap-4"
                            >
                              <motion.button
                                onClick={() => handleAddToCart(product.id)}
                                className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <ShoppingCart className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                onClick={() => handleToggleWishlist(product)}
                                className="p-3 bg-background/80 backdrop-blur-sm text-foreground rounded-full hover:bg-background transition-colors"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : ''}`} />
                              </motion.button>
                              <motion.button
                                className="p-3 bg-background/80 backdrop-blur-sm text-foreground rounded-full hover:bg-background transition-colors"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Eye className="w-5 h-5" />
                              </motion.button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Product Info */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-primary uppercase tracking-wider">
                            {product.category?.name || 'New Drop'}
                          </span>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating_average || 5) ? 'fill-current' : ''}`} />
                            ))}
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-foreground group-hover:gradient-text transition-all duration-300">
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-foreground">
                            ${price.toFixed(2)}
                          </span>
                          {product.compare_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.compare_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Color Options */}
                      {product.color_options && (
                        <div className="flex gap-2">
                          {product.color_options.slice(0, 4).map((color, i) => (
                            <motion.div
                              key={i}
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: color.toLowerCase() }}
                              whileHover={{ scale: 1.2 }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Stock Indicator */}
                      {product.stock_quantity !== undefined && (
                        <motion.div
                          className="h-2 bg-muted rounded-full overflow-hidden"
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        >
                          <motion.div
                            className={`h-full rounded-full ${
                              product.stock_quantity > product.low_stock_threshold
                                ? 'bg-green-500'
                                : product.stock_quantity > 0
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                            }`}
                            initial={{ width: 0 }}
                            whileInView={{ 
                              width: `${Math.min(100, (product.stock_quantity / 50) * 100)}%` 
                            }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: index * 0.1 }}
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Neural Connection Lines */}
                    <motion.div
                      className="absolute -inset-px rounded-xl"
                      style={{
                        background: hoveredProduct === product.id 
                          ? 'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)'
                          : 'transparent'
                      }}
                      animate={{
                        background: hoveredProduct === product.id
                          ? [
                              'linear-gradient(0deg, transparent, rgba(255,255,255,0.2), transparent)',
                              'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                              'linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)',
                              'linear-gradient(270deg, transparent, rgba(255,255,255,0.2), transparent)',
                              'linear-gradient(360deg, transparent, rgba(255,255,255,0.2), transparent)'
                            ]
                          : 'transparent'
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.button
            className="btn-primary px-12 py-4 text-lg font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All New Arrivals
          </motion.button>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultMode="signin"
      />
    </section>
  );
};

export default LatestDropsSection;