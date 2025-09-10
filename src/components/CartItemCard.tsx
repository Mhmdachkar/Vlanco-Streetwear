import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, Eye, Heart, Zap, Shield, Star, Clock, Package, Truck } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { Tables } from '@/integrations/supabase/types';

type CartItem = Tables<'cart_items'> & {
  product: Tables<'products'>;
  variant: Tables<'product_variants'>;
};

interface CartItemCardProps {
  item: CartItem;
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

const CartItemCard = React.forwardRef<HTMLDivElement, CartItemCardProps>(({ item, onRemove, onUpdateQuantity }, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.id);
    }, 300);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= 99) {
      onUpdateQuantity(item.id, newQuantity);
    } else if (newQuantity <= 0) {
      // If quantity would be 0 or negative, remove the item
      handleRemove();
    }
  };

  const getItemPrice = () => {
    // Prioritize variant price, then product base price, then fallback
    return item.variant?.price || item.product?.base_price || 0;
  };

  const getTotalPrice = () => {
    return getItemPrice() * item.quantity;
  };

  const getSavings = () => {
    const comparePrice = item.product?.compare_price || 0;
    if (comparePrice && comparePrice > getItemPrice()) {
      return (comparePrice - getItemPrice()) * item.quantity;
    }
    return 0;
  };

  const getStockStatus = () => {
    const stock = item.variant?.stock_quantity || 0;
    if (stock === 0) return { status: 'out', color: 'red', text: 'Out of Stock' };
    if (stock <= 5) return { status: 'low', color: 'orange', text: 'Low Stock' };
    return { status: 'in', color: 'green', text: 'In Stock' };
  };

  const getStockStatusClass = (status: string) => {
    switch (status) {
      case 'out': return 'bg-red-500';
      case 'low': return 'bg-orange-500';
      case 'in': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStockStatusTextClass = (status: string) => {
    switch (status) {
      case 'out': return 'text-red-400';
      case 'low': return 'text-orange-400';
      case 'in': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const stockStatus = getStockStatus();

  return (
    <AnimatePresence>
      {!isRemoving && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Holographic Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Main Card */}
          <motion.div
            className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {/* Animated Border Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            {/* Header Section */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {/* Product Image */}
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl overflow-hidden"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(item.product as any)?.image ? (
                      <img 
                        src={(item.product as any).image} 
                        alt={item.product.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </motion.div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    {item.quantity}
                  </motion.div>
                </div>
                
                <div className="flex-1">
                  <motion.h3 
                    className="text-lg font-bold text-white mb-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.product?.name || 'Product Name'}
                  </motion.h3>
                  <div className="flex items-center space-x-2 mb-2">
                    {/* Color Swatch */}
                    {(item.variant as any)?.color_value && (
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-4 h-4 rounded-full border border-slate-600"
                          style={{ backgroundColor: (item.variant as any).color_value }}
                        />
                        <span className="text-sm text-slate-400">
                          {item.variant.color}
                        </span>
                      </div>
                    )}
                    {/* Size */}
                    {item.variant?.size && (
                      <span className="text-sm text-slate-400">
                        Size {item.variant.size}
                      </span>
                    )}
                  </div>
                  {/* Price per unit */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">
                      ${getItemPrice().toFixed(2)} each
                    </span>
                    {item.product?.compare_price && item.product.compare_price > getItemPrice() && (
                      <span className="text-sm text-green-400 line-through">
                        ${item.product.compare_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isRemoving 
                      ? 'bg-red-500/10 text-red-500/50 cursor-not-allowed' 
                      : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300'
                  }`}
                  whileHover={!isRemoving ? { scale: 1.1 } : {}}
                  whileTap={!isRemoving ? { scale: 0.95 } : {}}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Price and Quantity Section */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="text-2xl font-bold text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  ${getTotalPrice().toFixed(2)}
                </motion.div>
                
                {getSavings() > 0 && (
                  <motion.div
                    className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Save ${getSavings().toFixed(2)}
                  </motion.div>
                )}
              </div>
              
              {/* Quantity Controls */}
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuantityChange(item.quantity - 1);
                  }}
                  disabled={item.quantity <= 1}
                  className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center ${
                    item.quantity <= 1 
                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' 
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white'
                  }`}
                  whileHover={item.quantity > 1 ? { scale: 1.1 } : {}}
                  whileTap={item.quantity > 1 ? { scale: 0.95 } : {}}
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                
                <motion.span
                  className="w-12 text-center text-white font-bold"
                  key={item.quantity}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.quantity}
                </motion.span>
                
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuantityChange(item.quantity + 1);
                  }}
                  disabled={item.quantity >= 99}
                  className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center ${
                    item.quantity >= 99
                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white'
                  }`}
                  whileHover={item.quantity < 99 ? { scale: 1.1 } : {}}
                  whileTap={item.quantity < 99 ? { scale: 0.95 } : {}}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStockStatusClass(stockStatus.status)}`} />
                <span className={`text-sm ${getStockStatusTextClass(stockStatus.status)}`}>
                  {stockStatus.text}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Added {new Date(item.added_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Expandable Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-slate-700/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-slate-400 text-sm">
                          <Star className="w-4 h-4" />
                          <span>Unit Price: ${getItemPrice().toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400 text-sm">
                          <Package className="w-4 h-4" />
                          <span>SKU: {item.variant?.sku || item.product?.sku || 'N/A'}</span>
                        </div>
                        {(item.product as any)?.brand && (
                          <div className="flex items-center space-x-2 text-slate-400 text-sm">
                            <Shield className="w-4 h-4" />
                            <span>Brand: {(item.product as any).brand}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-slate-400 text-sm">
                          <Shield className="w-4 h-4" />
                          <span>Stock: {item.variant?.stock_quantity || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400 text-sm">
                          <Truck className="w-4 h-4" />
                          <span>Free Shipping</span>
                        </div>
                        {(item.product as any)?.material && (
                          <div className="flex items-center space-x-2 text-slate-400 text-sm">
                            <Package className="w-4 h-4" />
                            <span>Material: {(item.product as any).material}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {item.product?.description && (
                      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {item.product.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Additional Product Details */}
                    {((item.product as any)?.collection || (item.product as any)?.modelNumber) && (
                      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {(item.product as any)?.collection && (
                            <div className="flex items-center space-x-2 text-slate-400">
                              <span>Collection: {(item.product as any).collection}</span>
                            </div>
                          )}
                          {(item.product as any)?.modelNumber && (
                            <div className="flex items-center space-x-2 text-slate-400">
                              <span>Model: {(item.product as any).modelNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <motion.div
                className="w-2 h-2 bg-cyan-400 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <motion.div
                className="w-2 h-2 bg-purple-400 rounded-full"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

CartItemCard.displayName = 'CartItemCard';

export default CartItemCard;
