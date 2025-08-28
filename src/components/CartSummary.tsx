import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, CreditCard, Truck, Shield, Zap, Gift, Star, Clock } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type CartItem = Tables<'cart_items'> & {
  product: Tables<'products'>;
  variant: Tables<'product_variants'>;
};

interface CartSummaryProps {
  items: CartItem[];
  onCheckout: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ items, onCheckout }) => {
  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const price = item.price_at_time || item.product?.base_price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalSavings = () => {
    return items.reduce((total, item) => {
      const comparePrice = item.product?.compare_price || item.variant?.compare_price;
      const currentPrice = item.price_at_time || item.product?.base_price || 0;
      if (comparePrice && comparePrice > currentPrice) {
        return total + ((comparePrice - currentPrice) * item.quantity);
      }
      return total;
    }, 0);
  };

  const getShippingCost = () => {
    // Free shipping for orders over $100
    return getSubtotal() >= 100 ? 0 : 9.99;
  };

  const getTax = () => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getTotal = () => {
    return getSubtotal() + getShippingCost() + getTax();
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
    return deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const subtotal = getSubtotal();
  const totalSavings = getTotalSavings();
  const shipping = getShippingCost();
  const tax = getTax();
  const total = getTotal();
  const totalItems = getTotalItems();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Holographic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />
      
      {/* Main Container */}
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Vault Summary</h2>
              <p className="text-slate-400 text-sm">Secure checkout process</p>
            </div>
          </motion.div>
          
          <motion.div
            className="text-right"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-2xl font-bold text-white">{totalItems}</div>
            <div className="text-slate-400 text-sm">Items</div>
          </motion.div>
        </div>

        {/* Cart Items Preview */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-3">Items in Vault</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {items.slice(0, 3).map((item, index) => (
              <motion.div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{item.quantity}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white truncate max-w-32">
                      {item.product?.name || 'Product'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.variant?.color && `${item.variant.color} • `}
                      {item.variant?.size && `Size ${item.variant.size}`}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold text-white">
                  ${((item.price_at_time || item.product?.base_price || 0) * item.quantity).toFixed(2)}
                </div>
              </motion.div>
            ))}
            {items.length > 3 && (
              <div className="text-center text-slate-400 text-sm py-2">
                +{items.length - 3} more items
              </div>
            )}
          </div>
        </motion.div>

        {/* Price Breakdown */}
        <motion.div
          className="space-y-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Subtotal</span>
            <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
          </div>
          
          {totalSavings > 0 && (
            <motion.div
              className="flex items-center justify-between text-green-400"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="flex items-center space-x-2">
                <Gift className="w-4 h-4" />
                <span>Total Savings</span>
              </span>
              <span className="font-medium">-${totalSavings.toFixed(2)}</span>
            </motion.div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Shipping</span>
            <span className="text-white font-medium">
              {shipping === 0 ? (
                <span className="text-green-400 flex items-center space-x-1">
                  <Truck className="w-4 h-4" />
                  <span>FREE</span>
                </span>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Tax</span>
            <span className="text-white font-medium">${tax.toFixed(2)}</span>
          </div>
          
          <div className="border-t border-slate-700 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 text-slate-300 text-sm">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 text-sm">
              <Truck className="w-4 h-4 text-purple-400" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 text-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 text-sm">
              <Star className="w-4 h-4 text-pink-400" />
              <span>Premium Quality</span>
            </div>
          </div>
        </motion.div>

        {/* Delivery Estimate */}
        <motion.div
          className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center space-x-2 text-slate-300 text-sm mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Estimated Delivery</span>
          </div>
          <div className="text-white font-medium">{getEstimatedDelivery()}</div>
        </motion.div>

        {/* Checkout Button */}
        <motion.button
          onClick={onCheckout}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>PROCEED TO CHECKOUT</span>
          </div>
        </motion.button>

        {/* Security Notice */}
        <motion.div
          className="mt-4 text-center text-slate-400 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          🔒 Your payment information is encrypted and secure
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CartSummary;
