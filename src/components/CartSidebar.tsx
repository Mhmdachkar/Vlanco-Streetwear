import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Loader2, AlertCircle, Trash2, Heart, Zap, Timer, Sparkles, Shield, Lock, CreditCard, Gift, ArrowRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { InlineLogo } from './VlancoLogo';
import { useCart } from '@/hooks/useCart';
import { applyDiscount } from '@/services/edgeFunctions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CartItemCard from './CartItemCard';
// import CartSummary from './CartSummary';
import type { Tables } from '@/integrations/supabase/types';

// Custom hook for cart height calculations
const useCartHeight = () => {
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate available height for cart items
  const getCartItemsHeight = useCallback(() => {
    const headerHeight = 140; // Increased header height
    const checkoutHeight = 250; // Increased checkout section height
    const padding = 60; // Increased padding for safety
    const availableHeight = windowHeight - headerHeight - checkoutHeight - padding;
    const calculatedHeight = Math.max(availableHeight, 150); // Reduced minimum height
    
    // More conservative fallback
    if (calculatedHeight < 150 || calculatedHeight > windowHeight * 0.7) {
      return Math.min(windowHeight * 0.5, 350); // 50% of viewport or max 350px
    }
    
    return calculatedHeight;
  }, [windowHeight]);
  
  return { windowHeight, getCartItemsHeight };
};

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
  const { items, loading, error, subtotal, total, itemCount, removeFromCart, updateQuantity, addToCart, createCheckout, refetch } = useCart();
  const { getCartItemsHeight } = useCartHeight();
  const { toast } = useToast();
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const cartItemsRef = useRef<HTMLDivElement>(null);
  
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
    console.log('🔄 CartSidebar: handleQuantityUpdate called', { itemId, newQuantity });
    
    const itemKey = itemId;
    setItemLoadingState(itemKey, true);
    clearItemError(itemKey);
    
    try {
      console.log('🔄 CartSidebar: Calling updateQuantity from useCart hook');
      await updateQuantity(itemId, newQuantity);
      console.log('✅ CartSidebar: Quantity updated successfully');
      setItemSuccessState(itemKey, true);
      pulseCart();
    } catch (error) {
      console.error('❌ CartSidebar: Error updating quantity:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quantity';
      setItemError(itemKey, errorMessage);
      shakeCart();
    } finally {
      setItemLoadingState(itemKey, false);
    }
  }, [updateQuantity, setItemLoadingState, clearItemError, setItemSuccessState, setItemError, pulseCart, shakeCart]);

  // Handle item removal with undo functionality
  const handleRemoveItem = useCallback(async (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    if (!item) {
      console.error('❌ Item not found:', itemId);
      return;
    }
    
    const itemKey = itemId;
    setItemLoadingState(itemKey, true);
    clearItemError(itemKey);
    
    try {
      console.log('🗑️ CartSidebar: Removing item from cart', { itemId });
      await removeFromCart(itemId);
      
      // Start undo system with proper re-add functionality
      startUndo(item, async () => {
        try {
          console.log('🔄 CartSidebar: Restoring item to cart', { item });
          // Re-add the item with its original details
          await addToCart(
            item.product_id, 
            item.variant_id, 
            item.quantity,
            {
              product: item.product,
              variant: item.variant,
              price: item.price_at_time || item.variant?.price || item.product?.base_price
            }
          );
          
        toast({
            title: "✅ Item Restored",
            description: `${item.product?.name} has been restored to your cart`,
            duration: 3000
          });
          
          pulseCart();
        } catch (error) {
          console.error('❌ Failed to restore item:', error);
          toast({
            title: "❌ Restore Failed",
            description: "Could not restore item to cart",
            variant: "destructive"
          });
        }
      });
      
      shakeCart();
      
    } catch (error) {
      console.error('❌ CartSidebar: Error removing item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
      setItemError(itemKey, errorMessage);
      toast({
        title: "❌ Remove Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setItemLoadingState(itemKey, false);
    }
  }, [items, removeFromCart, addToCart, startUndo, shakeCart, toast, setItemLoadingState, clearItemError, setItemError, pulseCart]);

  // Handle checkout (simplified - useCart hook handles validation)
  const handleCheckout = useCallback(async () => {
    console.log('🛒 CartSidebar: Starting checkout process');
    
    try {
      await createCheckout(promoCode || undefined);
    } catch (error) {
      console.error('❌ CartSidebar: Checkout failed:', error);
      // Error handling is done in useCart hook
    }
  }, [createCheckout, promoCode]);

  // Handle refresh cart with enhanced feedback
  const handleRefreshCart = useCallback(async () => {
    try {
      console.log('🔄 CartSidebar: Manually refreshing cart...');
      
      toast({
        title: "🔄 Refreshing Cart",
        description: "Syncing with database...",
        duration: 1000
      });
      
      await refetch();
      
      toast({
        title: "✅ Cart Refreshed",
        description: "Cart items synchronized successfully",
        duration: 2000
      });
      
      pulseCart();
    } catch (error) {
      console.error('❌ CartSidebar: Error refreshing cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not refresh cart items';
      toast({
        title: "❌ Refresh Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 3000
      });
      shakeCart();
    }
  }, [refetch, toast, pulseCart, shakeCart]);

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

  // Handle scroll events to show/hide scroll indicator
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    const isAtTop = scrollTop < 50;
    
    setShowScrollIndicator(!isAtBottom && items.length > 3);
    setShowScrollToBottom(!isAtBottom && !isAtTop && items.length > 3);
  }, [items.length]);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (cartItemsRef.current) {
      cartItemsRef.current.scrollTo({
        top: cartItemsRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Reset scroll indicator when items change
  useEffect(() => {
    setShowScrollIndicator(items.length > 3);
    setShowScrollToBottom(false);
    
    // Debug logging
    console.log('🛒 Cart items changed:', {
      itemCount: items.length,
      calculatedHeight: getCartItemsHeight(),
      windowHeight: typeof window !== 'undefined' ? window.innerHeight : 'N/A'
    });
  }, [items.length, getCartItemsHeight]);

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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50 overflow-hidden cart-sidebar"
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
                  {itemCount > 0 && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={itemCount}
                    >
                      {itemCount}
                    </motion.div>
                  )}
                </motion.div>
                
                <div className="flex items-center space-x-3">
                  <InlineLogo size="sm" className="flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Your Vault</h2>
                    <p className="text-slate-400 text-sm">
                      {itemCount} item{itemCount !== 1 ? 's' : ''} • ${subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={handleRefreshCart}
                  disabled={loading}
                  className={`p-2 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-cyan-400'
                  }`}
                  whileHover={!loading ? { scale: 1.1 } : {}}
                  whileTap={!loading ? { scale: 0.9, rotate: 180 } : {}}
                  title={loading ? "Loading..." : "Refresh cart"}
                >
                  <motion.div
                    animate={loading ? { rotate: 360 } : {}}
                    transition={loading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                >
                  <RefreshCw className="w-4 h-4" />
                  </motion.div>
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
            <div className="flex-1 overflow-hidden relative flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
              {/* Global Loading Overlay */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-30 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
                      />
                      <div className="text-white font-medium">Loading your vault...</div>
                      <div className="text-slate-400 text-sm mt-1">Syncing cart items</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!user && items.length === 0 ? (
                <SignInPrompt onClose={onClose} />
              ) : items.length === 0 ? (
                <EmptyCart onClose={onClose} />
              ) : (
                <div className="h-full flex flex-col">
                  {/* Cart Items - Dynamic Height Scrollable Area */}
                  <div 
                    ref={cartItemsRef}
                    className="overflow-y-auto p-6 space-y-4 scrollbar-thin scrollable-area overscroll-contain pr-2 cart-items-container"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#475569 #1e293b',
                      scrollBehavior: 'smooth',
                      WebkitOverflowScrolling: 'touch',
                      height: 'calc(100vh - 400px)', // Fixed height to ensure checkout is visible
                      minHeight: '150px', // Minimum height for small screens
                      maxHeight: 'calc(100vh - 400px)' // Maximum height constraint
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onWheel={(e) => {
                      // Prevent wheel events from bubbling to parent
                      e.stopPropagation();
                    }}
                    onScroll={handleScroll}
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
                          className="relative"
                        >
                          {/* Enhanced Cart Item with Direct Button Controls */}
                          <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 overflow-hidden">
                            {/* Item Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl overflow-hidden flex items-center justify-center">
                                  {(item.product as any)?.image ? (
                                    <img 
                                      src={(item.product as any).image} 
                                      alt={item.product.name || 'Product'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="text-white font-bold text-lg">
                                      {item.product?.name?.charAt(0) || 'P'}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-white mb-1">
                                    {item.product?.name || 'Product Name'}
                                  </h3>
                                  <div className="flex items-center space-x-2 mb-2">
                                    {item.variant?.color && (
                                      <span className="text-sm text-slate-400">
                                        {typeof item.variant.color === 'string' ? item.variant.color : String(item.variant.color)}
                                      </span>
                                    )}
                                    {item.variant?.size && (
                                      <span className="text-sm text-slate-400">
                                        Size {typeof item.variant.size === 'string' ? item.variant.size : String(item.variant.size)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-slate-400">
                                    ${(item.price_at_time || item.variant?.price || item.product?.base_price || 0).toFixed(2)} each
                                  </div>
                                </div>
                              </div>
                              
                              {/* Remove Button */}
                              <motion.button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('🗑️ Direct remove button clicked for item:', item.id);
                                  
                                  if (itemLoading[item.id]) {
                                    console.log('⏳ Item is loading, ignoring click');
                                    return;
                                  }
                                  
                                  await handleRemoveItem(item.id);
                                }}
                                disabled={itemLoading[item.id]}
                                className={`p-2 rounded-lg transition-colors ${
                                  itemLoading[item.id]
                                    ? 'bg-red-500/10 text-red-500/50 cursor-not-allowed'
                                    : 'bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/50'
                                }`}
                                whileHover={!itemLoading[item.id] ? { scale: 1.1 } : {}}
                                whileTap={!itemLoading[item.id] ? { scale: 0.95 } : {}}
                                title={itemLoading[item.id] ? "Processing..." : "Remove item from cart"}
                              >
                                {itemLoading[item.id] ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Loader2 className="w-4 h-4" />
                                  </motion.div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </motion.button>
                            </div>

                            {/* Price and Quantity Section */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="text-2xl font-bold text-white">
                                  ${((item.price_at_time || item.variant?.price || item.product?.base_price || 0) * item.quantity).toFixed(2)}
                                </div>
                              </div>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-3 bg-slate-700/30 rounded-lg p-1">
                                {/* Minus Button */}
                                <motion.button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const newQuantity = item.quantity - 1;
                                    console.log('➖ Direct minus button clicked for item:', item.id, 'new quantity:', newQuantity);
                                    
                                    if (itemLoading[item.id]) {
                                      console.log('⏳ Item is loading, ignoring click');
                                      return;
                                    }
                                    
                                    if (newQuantity > 0) {
                                      await handleQuantityUpdate(item.id, newQuantity);
                                    } else {
                                      await handleRemoveItem(item.id);
                                    }
                                  }}
                                  disabled={item.quantity <= 1 || itemLoading[item.id]}
                                  className={`w-10 h-10 rounded-lg transition-colors flex items-center justify-center ${
                                    item.quantity <= 1 || itemLoading[item.id]
                                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' 
                                      : 'bg-slate-600/50 hover:bg-red-500/30 text-slate-300 hover:text-white border border-transparent hover:border-red-500/50'
                                  }`}
                                  whileHover={item.quantity > 1 && !itemLoading[item.id] ? { scale: 1.1 } : {}}
                                  whileTap={item.quantity > 1 && !itemLoading[item.id] ? { scale: 0.95 } : {}}
                                  title={item.quantity <= 1 ? "Cannot decrease below 1" : "Decrease quantity"}
                                >
                                  {itemLoading[item.id] ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                      <Loader2 className="w-4 h-4" />
                                    </motion.div>
                                  ) : (
                                    <Minus className="w-5 h-5" />
                                  )}
                                </motion.button>
                                
                                {/* Quantity Display */}
                                <motion.div
                                  className="w-16 text-center text-white font-bold text-lg"
                                  key={item.quantity}
                                  initial={{ scale: 1.2 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {item.quantity}
                                </motion.div>
                                
                                {/* Plus Button */}
                                <motion.button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const newQuantity = item.quantity + 1;
                                    console.log('➕ Direct plus button clicked for item:', item.id, 'new quantity:', newQuantity);
                                    
                                    if (itemLoading[item.id]) {
                                      console.log('⏳ Item is loading, ignoring click');
                                      return;
                                    }
                                    
                                    if (newQuantity <= 99) {
                                      await handleQuantityUpdate(item.id, newQuantity);
                                    }
                                  }}
                                  disabled={item.quantity >= 99 || itemLoading[item.id]}
                                  className={`w-10 h-10 rounded-lg transition-colors flex items-center justify-center ${
                                    item.quantity >= 99 || itemLoading[item.id]
                                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                                      : 'bg-slate-600/50 hover:bg-green-500/30 text-slate-300 hover:text-white border border-transparent hover:border-green-500/50'
                                  }`}
                                  whileHover={item.quantity < 99 && !itemLoading[item.id] ? { scale: 1.1 } : {}}
                                  whileTap={item.quantity < 99 && !itemLoading[item.id] ? { scale: 0.95 } : {}}
                                  title={item.quantity >= 99 ? "Maximum quantity reached" : "Increase quantity"}
                                >
                                  {itemLoading[item.id] ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                      <Loader2 className="w-4 h-4" />
                                    </motion.div>
                                  ) : (
                                    <Plus className="w-5 h-5" />
                                  )}
                                </motion.button>
                              </div>
                            </div>

                            {/* Stock Status */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm text-green-400">In Stock</span>
                              </div>
                              
                              <div className="text-slate-400 text-sm">
                                Added {new Date(item.added_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          {/* Loading State Overlay */}
                          <AnimatePresence>
                            {itemLoading[item.id] && <LoadingSpinner />}
                          </AnimatePresence>
                          
                          {/* Success State Overlay */}
                          <AnimatePresence>
                            {itemSuccess[item.id] && <SuccessIndicator />}
                          </AnimatePresence>
                          
                          {/* Error State Display */}
                          <AnimatePresence>
                            {itemErrors[item.id] && (
                              <div className="mt-2">
                                <ErrorMessage 
                                  message={itemErrors[item.id]} 
                                  onRetry={() => {
                                    clearItemError(item.id);
                                    // Retry the last operation - this could be enhanced to remember the last action
                                  }}
                                />
                              </div>
                            )}
                          </AnimatePresence>
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
                    
                    {/* Scroll indicator when there are many items */}
                    {showScrollIndicator && items.length > 3 && (
                      <motion.div 
                        className="text-center py-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-slate-400 text-sm flex items-center justify-center space-x-2">
                          <motion.div 
                            className="w-2 h-2 bg-cyan-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          ></motion.div>
                          <span>Scroll to see more items</span>
                          <motion.div 
                            className="w-2 h-2 bg-cyan-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                          ></motion.div>
                        </div>
                        <motion.div 
                          className="text-cyan-400 text-lg mt-2"
                          animate={{ y: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          ↓
                        </motion.div>
                      </motion.div>
                    )}
                    
                    {/* Always show checkout reminder */}
                    {items.length > 0 && (
                      <motion.div 
                        className="text-center py-3 border-t border-slate-700/30 mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="text-slate-300 text-sm flex items-center justify-center space-x-2">
                          <CreditCard className="w-4 h-4 text-cyan-400" />
                          <span>Checkout button below ↓</span>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Scroll to bottom button */}
                    {showScrollToBottom && (
                      <motion.button
                        onClick={scrollToBottom}
                        className="fixed bottom-32 right-8 w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-white z-20"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Scroll to checkout"
                      >
                        <motion.div
                          animate={{ y: [0, 2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ↓
                        </motion.div>
                      </motion.button>
                    )}
                  </div>

                  {/* Cart Summary - Fixed at bottom */}
                  <div className="flex-shrink-0 p-6 border-t border-slate-700/50 bg-slate-800/30 cart-checkout-section" style={{ position: 'sticky', bottom: 0, zIndex: 20 }}>
                    {/* Checkout section indicator */}
                    <motion.div 
                      className="text-center mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="text-cyan-400 text-sm font-medium flex items-center justify-center space-x-2">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          💳
                        </motion.div>
                        <span>Ready to Checkout?</span>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                          💳
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                      {/* Summary Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">Vault Summary</h2>
                            <p className="text-slate-400 text-sm">Secure checkout process</p>
                </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{itemCount}</div>
                          <div className="text-slate-400 text-sm">Items</div>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Subtotal</span>
                          <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Shipping</span>
                          <span className="text-white font-medium">
                            {subtotal >= 100 ? (
                              <span className="text-green-400 flex items-center space-x-1">
                                <span>FREE</span>
                              </span>
                            ) : (
                              `$9.99`
                            )}
                          </span>
            </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Tax (8%)</span>
                          <span className="text-white font-medium">${(subtotal * 0.08).toFixed(2)}</span>
                        </div>
                        
                        <div className="border-t border-slate-700 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-white">Total</span>
                            <span className="text-2xl font-bold text-white">
                              ${(subtotal + (subtotal >= 100 ? 0 : 9.99) + (subtotal * 0.08)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Checkout Button */}
                      <motion.button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('💳 Direct checkout button clicked');
                          await handleCheckout();
                        }}
                        disabled={items.length === 0 || loading}
                        className={`group relative w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 overflow-hidden ${
                          items.length === 0 || loading
                            ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                            : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg'
                        }`}
                        whileHover={!loading && items.length > 0 ? { 
                          scale: 1.02,
                          boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)"
                        } : {}}
                        whileTap={!loading && items.length > 0 ? { scale: 0.98 } : {}}
                        style={{
                          minHeight: '48px', // Ensure minimum touch target size
                        }}
                      >
                        {/* Button Content */}
                        <div className="relative flex items-center justify-center space-x-3">
                          {loading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Loader2 className="w-5 h-5" />
                              </motion.div>
                              <span>PROCESSING...</span>
                            </>
                          ) : items.length === 0 ? (
                            <>
                              <CreditCard className="w-5 h-5" />
                              <span>CART IS EMPTY</span>
                            </>
                          ) : (
                            <>
                              <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <CreditCard className="w-5 h-5" />
                              </motion.div>
                              <span>PROCEED TO CHECKOUT</span>
                              <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                →
                              </motion.div>
                            </>
                          )}
                        </div>
                      </motion.button>

                      {/* Security Notice */}
                      <div className="mt-4 text-center text-slate-400 text-xs">
                        🔒 Your payment information is encrypted and secure
                      </div>
                    </div>
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
