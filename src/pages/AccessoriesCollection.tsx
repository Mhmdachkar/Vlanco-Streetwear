import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import Navigation from '@/components/Navigation';
import { X, Search } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

const AccessoriesCollection = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<{ [productId: number]: number }>({});
  const [selectedSize, setSelectedSize] = useState<{ [productId: number]: string }>({});

  // Filter for accessories
  const accessoriesProducts = products.filter(p => p.category === 'Accessories');
  const filteredProducts = accessoriesProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="font-inter">
      <Navigation />
      <section className="relative min-h-[40vh] bg-gradient-to-br from-background via-purple-900/10 to-background overflow-hidden flex items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-center py-16">Accessories Collection</h1>
      </section>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Bar */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5, type: 'spring' }}
        >
          <div className="relative bg-white/10 dark:bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl p-8 overflow-visible font-inter">
            <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-center">
              <div className="relative flex-1">
                <motion.div
                  className="flex items-center bg-white/80 dark:bg-black/80 border border-white/80 rounded-full shadow-xl px-8 py-4 transition-all font-inter text-lg"
                  animate={searchQuery ? { boxShadow: '0 0 0 3px #fff', borderColor: '#fff' } : { boxShadow: '0 2px 16px 0 #fff2', borderColor: '#fff8' }}
                >
                  <Search className="w-7 h-7 text-black dark:text-white font-bold mr-4" />
                  <input
                    type="text"
                    placeholder="Search accessories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-lg text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-1 font-inter tracking-wide"
                    style={{ minWidth: 0, fontWeight: 600, letterSpacing: '0.02em' }}
                  />
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        key="clear"
                        onClick={() => setSearchQuery('')}
                        className="ml-2 p-1 rounded-full hover:bg-white/30 transition-colors"
                        aria-label="Clear search"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="w-5 h-5 text-black dark:text-white" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Product Grid */}
        <motion.div
          className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
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
                className="group relative rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                  boxShadow: '0 0 0 4px #00e0ff, 0 0 32px 8px #00e0ff88',
                  transition: { duration: 0.3 }
                }}
                onHoverStart={() => setHoveredProduct(product.id)}
                onHoverEnd={() => setHoveredProduct(null)}
              >
                <motion.div
                  className="relative bg-[#f5f5f5] rounded-2xl overflow-hidden shadow-md transition-all duration-500"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Product Image */}
                  <div className="relative flex items-center justify-center overflow-hidden aspect-square">
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover border-b border-gray-200"
                      style={{ maxHeight: '340px', background: '#e5e5e5' }}
                      animate={hoveredProduct === product.id ? { scale: 1.06 } : { scale: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  {/* Product Info */}
                  <div className="p-6 flex flex-col items-center">
                    <h3 className="text-base font-bold text-gray-900 tracking-widest uppercase mb-3 font-inter text-center">{product.name}</h3>
                    {/* Color Swatches */}
                    {colorOptions.length > 0 && (
                      <div className="flex gap-2 mb-2">
                        {colorOptions.map((color, colorIndex) => (
                          <button
                            key={colorIndex}
                            className={`w-7 h-7 rounded-full border-2 ${colorIdx === colorIndex ? 'border-cyan-400 ring-2 ring-cyan-300' : 'border-gray-300'} bg-white flex items-center justify-center transition-all`}
                            style={{ boxShadow: colorIdx === colorIndex ? '0 0 0 2px #00e0ff' : 'none' }}
                            onClick={() => setSelectedColor((prev) => ({ ...prev, [product.id]: colorIndex }))}
                          >
                            <span className="block w-5 h-5 rounded-full" style={{ background: color.value, border: '1px solid #ccc' }} />
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Size Options */}
                    {sizeOptions.length > 0 && (
                      <div className="flex gap-2 mb-2">
                        {sizeOptions.map((sz) => (
                          <button
                            key={sz}
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${size === sz ? 'bg-cyan-400 text-black' : 'bg-gray-200 text-gray-700'} transition-all`}
                            onClick={() => setSelectedSize((prev) => ({ ...prev, [product.id]: sz }))}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Add to Cart Button */}
                    <button
                      className={`mt-4 p-3 rounded-full text-white font-bold flex items-center gap-2 transition-all ${canAdd && canAddSize ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-gray-400 cursor-not-allowed'}`}
                      disabled={!(canAdd && canAddSize)}
                      onClick={() => {
                        if (!canAdd || !canAddSize) return;
                        const variantId = `${product.id}-${colorIdx ?? ''}-${size ?? ''}`;
                        addToCart(product.id.toString(), variantId, 1);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.9-1.45L17 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
                      </svg>
                      Add to Cart
                    </button>
                    {!(canAdd && canAddSize) && (
                      <div className="text-xs text-red-500 mt-2">Please select color and size</div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
        {/* No Results */}
        {filteredProducts.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No accessories found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search terms</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AccessoriesCollection; 