import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Loader2, AlertCircle, Trash2, Heart, Zap, Timer, Sparkles, Shield, Lock, CreditCard, Gift, ArrowRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { applyDiscount } from '@/services/edgeFunctions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CartItemCard from './CartItemCard';
import CartSummary from './CartSummary';
import type { Tables } from '@/integrations/supabase/types';

// Types
type CartItem = Tables<'cart_items'> & {
  product: Tables<'products'>;
  variant: Tables<'product_variants'>;
};

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced custom hooks
const useCartItemOperations = () => {
  const [itemLoading, setItemLoading] = useState<Record<string, boolean>>({});
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [itemSuccess, setItemSuccess] = useState<Record<string, boolean>>({});

  const setItemLoadingState = useCallback((itemKey: string, loading: boolean) => {
    setItemLoading(prev => ({ ...prev, [itemKey]: loading }));
  }, []);

  const setItemError = useCallback((itemKey: string, error: string | null) => {
    setItemErrors(prev => ({ ...prev, [itemKey]: error || '' }));
    if (error) {
      setTimeout(() => setItemError(itemKey, null), 3000);
    }
  }, []);

  const setItemSuccessState = useCallback((itemKey: string, success: boolean) => {
    setItemSuccess(prev => ({ ...prev, [itemKey]: success }));
    if (success) {
      setTimeout(() => setItemSuccessState(itemKey, false), 2000);
    }
  }, []);

  const clearItemError = useCallback((itemKey: string) => {
    setItemErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[itemKey];
      return newErrors;
    });
  }, []);

  return {
    itemLoading,
    itemErrors,
    itemSuccess,
    setItemLoadingState,
    setItemError,
    setItemSuccessState,
    clearItemError
  };
};

const useCartAnimations = () => {
  const [triggerPulse, setTriggerPulse] = useState(0);
  const [cartShake, setCartShake] = useState(0);
  
  const pulseCart = useCallback(() => {
    setTriggerPulse(prev => prev + 1);
  }, []);

  const shakeCart = useCallback(() => {
    setCartShake(prev => prev + 1);
  }, []);

  return { triggerPulse, cartShake, pulseCart, shakeCart };
};

const useUndoSystem = () => {
  const [recentlyDeleted, setRecentlyDeleted] = useState<CartItem | null>(null);
  const [undoProgress, setUndoProgress] = useState(100);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const startUndo = useCallback((item: CartItem, onUndo: () => void) => {
    setRecentlyDeleted(item);
    setUndoProgress(100);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (progressRef.current) clearTimeout(progressRef.current);
    
    // Progress countdown
    let progress = 100;
    progressRef.current = setInterval(() => {
      progress -= 2;
      setUndoProgress(progress);
    }, 100);
    
    timeoutRef.current = setTimeout(() => {
      setRecentlyDeleted(null);
      setUndoProgress(100);
    }, 5000);
  }, []);

  const cancelUndo = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (progressRef.current) clearTimeout(progressRef.current);
    setRecentlyDeleted(null);
    setUndoProgress(100);
  }, []);

  const executeUndo = useCallback((onUndo: () => void) => {
    cancelUndo();
    onUndo();
  }, [cancelUndo]);

  return {
    recentlyDeleted,
    undoProgress,
    startUndo,
    cancelUndo,
    executeUndo
  };
};

// Utility functions
const getItemKey = (item: CartItem) => `${item.id || `${item.product_id}-${item.variant_id}-${Math.random()}`}`;
const getItemPrice = (item: CartItem) => item.price_at_time || item.product?.base_price || 0;
const getItemTotal = (item: CartItem) => getItemPrice(item) * item.quantity;
const formatPrice = (price: number) => price.toFixed(2);

// Enhanced Components
const LoadingSpinner = () => (
  <motion.div
    className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className="w-8 h-8 text-cyan-400" />
    </motion.div>
  </motion.div>
);

const SuccessIndicator = () => (
  <motion.div
    className="absolute inset-0 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center z-10"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      >
        ✓
      </motion.div>
    </motion.div>
  </motion.div>
);

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <motion.div
    className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        {message}
      </span>
      <button
        onClick={onRetry}
        className="text-red-300 hover:text-red-200 underline text-xs"
      >
        Retry
      </button>
    </div>
  </motion.div>
);

const EmptyCart = ({ onClose }: { onClose: () => void }) => (
  <motion.div 
    className="flex-1 flex flex-col items-center justify-center p-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <ShoppingBag className="w-24 h-24 text-cyan-400/60 mb-6" />
    </motion.div>
    
    <motion.h3 
      className="text-2xl font-bold text-white mb-4 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      Your Vault is Empty
    </motion.h3>
    
    <motion.p 
      className="text-slate-400 text-center mb-8 max-w-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      Ready to deploy some streetwear? Start building your collection with our latest drops.
    </motion.p>
    
    <motion.button
      onClick={onClose}
      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center space-x-2">
        <span>EXPLORE COLLECTION</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </motion.button>
  </motion.div>
);

const SignInPrompt = ({ onClose }: { onClose: () => void }) => (
  <motion.div 
    className="flex-1 flex flex-col items-center justify-center p-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mb-6"
    >
      <Lock className="w-10 h-10 text-white" />
    </motion.div>
    
    <motion.h3 
      className="text-2xl font-bold text-white mb-4 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      Secure Vault Access
    </motion.h3>
    
    <motion.p 
      className="text-slate-400 text-center mb-8 max-w-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      Sign in to access your personal vault and manage your streetwear collection securely.
    </motion.p>
    
    <motion.button
      onClick={onClose}
      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center space-x-2">
        <Shield className="w-4 h-4" />
        <span>SIGN IN TO VAULT</span>
      </div>
    </motion.button>
  </motion.div>
);

const UndoNotification = ({ item, progress, onUndo, onCancel }: { 
  item: CartItem; 
  progress: number; 
  onUndo: () => void; 
  onCancel: () => void; 
}) => (
  <motion.div
    className="fixed bottom-4 left-4 right-4 bg-slate-800 border border-cyan-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-xl z-50"
    initial={{ opacity: 0, y: 100 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 100 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-medium">
            {item.product?.name} removed from vault
          </div>
          <div className="text-slate-400 text-sm">
            Click undo to restore
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onUndo}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
        >
          Undo
        </button>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
    
    {/* Progress bar */}
    <div className="mt-3 w-full bg-slate-700 rounded-full h-1">
      <motion.div
        className="bg-cyan-500 h-1 rounded-full"
        initial={{ width: "100%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  </motion.div>
);

// Main CartSidebar Component
const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { items, loading, error, removeFromCart, updateQuantity, addToWishlist, createCheckout, refetch } = useCart();
  const { toast } = useToast();
  
  const {
    itemLoading,
    itemErrors,
    itemSuccess,
    setItemLoadingState,
    setItemError,
    setItemSuccessState,
    clearItemError
  } = useCartItemOperations();
  
  const { triggerPulse, cartShake, pulseCart, shakeCart } = useCartAnimations();
  const { recentlyDeleted, undoProgress, startUndo, cancelUndo, executeUndo } = useUndoSystem();
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  
  const [showSummary, setShowSummary] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Cart animations
  const cartScale = useSpring(1, { stiffness: 300, damping: 20 });
  const cartRotation = useSpring(0, { stiffness: 300, damping: 20 });

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      // Re-enable body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (triggerPulse > 0) {
      cartScale.set(1.1);
      setTimeout(() => cartScale.set(1), 200);
    }
  }, [triggerPulse, cartScale]);

  useEffect(() => {
    if (cartShake > 0) {
      cartRotation.set(5);
      setTimeout(() => cartRotation.set(-5), 100);
      setTimeout(() => cartRotation.set(5), 200);
      setTimeout(() => cartRotation.set(0), 300);
    }
  }, [cartShake, cartRotation]);

  // Handle quantity updates
  const handleQuantityUpdate = useCallback(async (itemId: string, newQuantity: number) => {
    const itemKey = itemId;
    setItemLoadingState(itemKey, true);
    clearItemError(itemKey);
    
    try {
      await updateQuantity(itemId, newQuantity);
      setItemSuccessState(itemKey, true);
      pulseCart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quantity';
      setItemError(itemKey, errorMessage);
      shakeCart();
    } finally {
      setItemLoadingState(itemKey, false);
    }
  }, [updateQuantity, setItemLoadingState, clearItemError, setItemSuccessState, setItemError, pulseCart, shakeCart]);

  // Handle item removal
  const handleRemoveItem = useCallback(async (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    if (!item) return;
    
    try {
      await removeFromCart(itemId);
      startUndo(item, () => {
        // Re-add item logic would go here
        toast({
          title: "Item Restored",
          description: "Item has been restored to your cart"
        });
      });
      shakeCart();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    }
  }, [items, removeFromCart, startUndo, shakeCart, toast]);

  // Handle checkout
  const handleCheckout = useCallback(() => {
    createCheckout(promoCode || undefined);
  }, [createCheckout, promoCode]);

  // Handle refresh cart
  const handleRefreshCart = useCallback(async () => {
    try {
      console.log('🔄 Manually refreshing cart...');
      await refetch();
      toast({
        title: "Cart refreshed",
        description: "Cart items have been synchronized with the database",
      });
    } catch (error) {
      console.error('Error refreshing cart:', error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh cart items",
        variant: "destructive",
      });
    }
  }, [refetch, toast]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return items.reduce((total, item) => total + getItemTotal(item), 0);
  }, [items]);
  // Listen for promo apply from CartSummary
  useEffect(() => {
    const onApply = async (ev: Event) => {
      const detail = (ev as CustomEvent).detail as { code: string } | undefined;
      const code = detail?.code?.trim();
      if (!code) return;
      try {
        const res = await applyDiscount(code, Math.round(subtotal));
        setPromoCode(code);
        setDiscountAmount(res.amountOff || 0);
        toast({ title: 'Promo applied', description: `${code} saved $${(res.amountOff || 0).toFixed(2)}` });
      } catch (e: any) {
        setPromoCode('');
        setDiscountAmount(0);
        toast({ title: 'Invalid promo', description: e.message || 'Could not apply code', variant: 'destructive' });
      }
    };
    window.addEventListener('apply-promo', onApply as EventListener);
    return () => window.removeEventListener('apply-promo', onApply as EventListener);
  }, [subtotal, toast]);

  const totalItems = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  // Sidebar animation variants
  const sidebarVariants = {
    closed: { x: "100%", opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  const backdropVariants = {
    closed: { opacity: 0, pointerEvents: "none" },
    open: { opacity: 1, pointerEvents: "auto" }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50 overflow-hidden"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  className="relative"
                  style={{ scale: cartScale, rotate: cartRotation }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  {totalItems > 0 && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={totalItems}
                    >
                      {totalItems}
                    </motion.div>
                  )}
                </motion.div>
                
                <div>
                  <h2 className="text-xl font-bold text-white">Your Vault</h2>
                  <p className="text-slate-400 text-sm">
                    {totalItems} item{totalItems !== 1 ? 's' : ''} • ${subtotal.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={handleRefreshCart}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-cyan-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9, rotate: 180 }}
                  title="Refresh cart"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {!user && items.length === 0 ? (
                <SignInPrompt onClose={onClose} />
              ) : items.length === 0 ? (
                <EmptyCart onClose={onClose} />
              ) : (
                <div className="h-full flex flex-col">
                  {/* Cart Items - Enhanced Scrollable Area with Better Isolation */}
                  <div 
                    className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-500 overscroll-contain"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#475569 #1e293b'
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onWheel={(e) => {
                      // Prevent wheel events from bubbling to parent
                      e.stopPropagation();
                    }}
                  >
                    <AnimatePresence mode="popLayout">
                      {items.map((item, index) => (
                        <motion.div
                          key={getItemKey(item)}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          transition={{ 
                            duration: 0.3, 
                            ease: "easeOut",
                            delay: index * 0.1 
                          }}
                          layout
                        >
                          <CartItemCard
                            item={item}
                            onRemove={() => handleRemoveItem(item.id)}
                            onUpdateQuantity={(newQuantity) => handleQuantityUpdate(item.id, newQuantity)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Scroll Indicator */}
                    {items.length > 3 && (
                      <motion.div
                        className="flex justify-center py-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <motion.div
                          className="flex items-center space-x-2 text-slate-400 text-sm"
                          animate={{ y: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <span>Scroll for more items</span>
                          <motion.div
                            animate={{ y: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            ↓
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>

                  {/* Cart Summary */}
                  <div className="p-6 border-t border-slate-700/50 bg-slate-800/30">
                    <CartSummary
                      items={items}
                      onCheckout={handleCheckout}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo Notification */}
      <AnimatePresence>
        {recentlyDeleted && (
          <UndoNotification
            item={recentlyDeleted}
            progress={undoProgress}
            onUndo={() => executeUndo(() => {
              // Re-add item logic would go here
            })}
            onCancel={cancelUndo}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CartSidebar;
