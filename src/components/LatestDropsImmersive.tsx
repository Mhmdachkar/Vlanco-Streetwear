import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Zap, Star, ArrowRight, Sparkles, Eye, ShoppingBag, Volume2, VolumeX } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  isLimited?: boolean;
  stockLevel?: number;
}

// CSS-based 3D Product Orb Component
function ProductOrb({ 
  product, 
  position, 
  onHover, 
  onUnhover, 
  onClick,
  isHovered,
  index 
}: { 
  product: Product;
  position: { x: number; y: number; z: number };
  onHover: () => void;
  onUnhover: () => void;
  onClick: () => void;
  isHovered: boolean;
  index: number;
}) {
  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex: Math.round(position.z * 10),
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: isHovered ? 1.5 : 1,
        y: [0, -10, 0],
      }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        y: {
          duration: 3 + index * 0.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      onHoverStart={onHover}
      onHoverEnd={onUnhover}
      onClick={onClick}
    >
      {/* Main Product Orb */}
      <motion.div
        className="relative w-24 h-24 rounded-full overflow-hidden shadow-2xl border-2 border-primary/50"
        style={{
          background: `conic-gradient(from ${index * 45}deg, #8B5CF6, #06B6D4, #8B5CF6)`,
        }}
        animate={{
          rotate: [0, 360],
          scale: isHovered ? 1.2 : 1,
        }}
        transition={{
          rotate: {
            duration: 10 + index * 2,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 0.3
          }
        }}
      >
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded-full"
          style={{
            filter: `hue-rotate(${index * 30}deg) saturate(1.2)`,
          }}
        />
        
        {/* Glow Effect */}
        <div 
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            product.isLimited ? 'bg-red-500/20' : 'bg-primary/20'
          }`}
          style={{
            boxShadow: isHovered 
              ? `0 0 30px ${product.isLimited ? '#ef4444' : '#8B5CF6'}`
              : `0 0 15px ${product.isLimited ? '#ef4444' : '#8B5CF6'}`,
          }}
        />
      </motion.div>

      {/* Particle Ring */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          rotate: [0, -360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full"
            style={{
              left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
              top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      {/* Product Info Popup */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white p-3 rounded-lg border border-primary/30 min-w-[200px] text-center z-50"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
          >
            <h3 className="font-bold text-sm">{product.name}</h3>
            <p className="text-primary font-semibold">${product.price}</p>
            {product.isLimited && (
              <span className="text-red-400 text-xs">LIMITED EDITION</span>
            )}
            <div className="flex items-center justify-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Neural Network Background Component
function NeuralNetworkBackground() {
  const [connections, setConnections] = useState<Array<{
    x1: number; y1: number; x2: number; y2: number; id: string;
  }>>([]);

  useEffect(() => {
    // Generate random neural network connections
    const newConnections = [];
    for (let i = 0; i < 20; i++) {
      newConnections.push({
        x1: Math.random() * 100,
        y1: Math.random() * 100,
        x2: Math.random() * 100,
        y2: Math.random() * 100,
        id: `connection-${i}`,
      });
    }
    setConnections(newConnections);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none opacity-30">
      {/* Neural Network Lines */}
      <svg className="w-full h-full">
        {connections.map((connection) => (
          <motion.line
            key={connection.id}
            x1={`${connection.x1}%`}
            y1={`${connection.y1}%`}
            x2={`${connection.x2}%`}
            y2={`${connection.y2}%`}
            stroke="url(#gradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="1" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Neural Network Nodes */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}

// Holographic Title Component
function HolographicTitle() {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.h2
        className="text-6xl font-bold mb-4"
        style={{
          background: 'linear-gradient(45deg, #8B5CF6, #06B6D4, #8B5CF6)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          y: [0, -5, 0],
          rotateX: [0, 5, 0],
        }}
        transition={{
          backgroundPosition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          },
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotateX: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        LATEST DROPS
      </motion.h2>
      
      <motion.p
        className="text-xl text-gray-400 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Step into the future of streetwear. Discover our newest arrivals in an immersive experience
        that transforms how you shop for fashion.
      </motion.p>
    </motion.div>
  );
}

// Main Component
const LatestDropsImmersive: React.FC<{ currentProductId?: string }> = ({ currentProductId }) => {
  const { products } = useProducts();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Filter latest drops (excluding current product)
  const latestDrops: Product[] = products
    .filter(p => p.id !== currentProductId && p.is_new_arrival)
    .slice(0, 8)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.base_price,
      image: p.product_images?.[0]?.image_url || '/placeholder.svg',
      category: p.category?.name || 'Streetwear',
      isLimited: p.is_limited_edition,
      stockLevel: 85 // Mock stock level
    }));

  // Generate orbital positions for products
  const productPositions = latestDrops.map((_, index) => {
    const angle = (index / latestDrops.length) * Math.PI * 2;
    const radius = 35; // Percentage from center
    const centerX = 50;
    const centerY = 50;
    
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      z: Math.sin(angle * 2) * 0.5 + 0.5, // Depth variation
    };
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    // Navigate to product page
    window.location.href = `/product/${product.id}`;
  };

  useEffect(() => {
    // Sound effects (simplified)
    if (soundEnabled && selectedProduct) {
      console.log('Playing selection sound for:', selectedProduct.name);
    }
  }, [selectedProduct, soundEnabled]);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen bg-black overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black">
        {/* Floating particles */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -100, -200],
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Neural Network Background */}
        <NeuralNetworkBackground />
      </div>

      {/* Section Header */}
      <div className="relative z-10 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          <HolographicTitle />
        </motion.div>
      </div>

      {/* 3D Product Galaxy */}
      <motion.div
        className="relative h-[70vh] w-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {/* Control Panel */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <motion.button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm hover:bg-black/70 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </motion.button>
          
          <motion.button
            className="bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm hover:bg-black/70 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Eye className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Product Orbs in 3D Formation */}
        <div className="relative w-full h-full">
          {latestDrops.map((product, index) => (
            <ProductOrb
              key={product.id}
              product={product}
              position={productPositions[index]}
              onHover={() => setHoveredProduct(product.id)}
              onUnhover={() => setHoveredProduct(null)}
              onClick={() => handleProductClick(product)}
              isHovered={hoveredProduct === product.id}
              index={index}
            />
          ))}
        </div>

        {/* Central Energy Core */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <div 
            className="w-full h-full rounded-full opacity-30"
            style={{
              background: 'conic-gradient(from 0deg, #8B5CF6, #06B6D4, #EC4899, #F59E0B, #8B5CF6)',
              filter: 'blur(20px)',
            }}
          />
        </motion.div>

        {/* Instructions */}
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <div className="bg-black/50 text-white px-6 py-3 rounded-full backdrop-blur-sm text-sm border border-primary/30">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Hover to explore • Click to discover • Experience the future
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Product Grid Below 3D Scene */}
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {latestDrops.map((product, index) => (
            <motion.div
              key={product.id}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleProductClick(product)}
            >
              <div className="relative overflow-hidden rounded-xl bg-gray-900 aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>

                {/* Limited Badge */}
                {product.isLimited && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    LIMITED
                  </div>
                )}

                {/* Stock Indicator */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black/70 rounded-lg p-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-xs">Stock Level</span>
                      <span className="text-primary text-xs font-bold">{product.stockLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-1">
                      <motion.div
                        className={`h-1 rounded-full ${
                          product.stockLevel > 70 ? 'bg-green-500' :
                          product.stockLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${product.stockLevel}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-sm">{product.category}</p>
                <p className="text-primary font-bold text-lg">${product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          <motion.button
            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All Drops
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              className="relative bg-gray-900 rounded-xl p-6 max-w-md w-full border border-primary/30"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-2">{selectedProduct.name}</h3>
              <p className="text-gray-400 mb-4">{selectedProduct.category}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary">${selectedProduct.price}</span>
                <button
                  onClick={() => handleProductClick(selectedProduct)}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LatestDropsImmersive; 