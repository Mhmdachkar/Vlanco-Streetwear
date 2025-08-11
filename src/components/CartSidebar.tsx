import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Product {
  id: string;
  name: string;
  base_price: number;
  price?: number;
  image?: string;
  product_images?: Array<{ image_url: string }>;
  color_options?: string[];
  is_limited_edition?: boolean;
}

interface Variant {
  id: string;
  size?: string;
  color?: string;
  price: number;
}

interface CartItem {
  id?: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  product: Product;
  variant: Variant;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Custom hooks
const useCartItemOperations = () => {
  const [itemLoading, setItemLoading] = useState<Record<string, boolean>>({});
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  const setItemLoadingState = useCallback((itemKey: string, loading: boolean) => {
    setItemLoading(prev => ({ ...prev, [itemKey]: loading }));
  }, []);

  const setItemError = useCallback((itemKey: string, error: string | null) => {
    setItemErrors(prev => ({ ...prev, [itemKey]: error || '' }));
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
    setItemLoadingState,
    setItemError,
    clearItemError
  };
};

const useUndoSystem = () => {
  const [recentlyDeleted, setRecentlyDeleted] = useState<CartItem | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startUndo = useCallback((item: CartItem, onUndo: () => void) => {
    setRecentlyDeleted(item);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setRecentlyDeleted(null);
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setRecentlyDeleted(null);
      onUndo();
    };
  }, []);

  const clearUndo = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setRecentlyDeleted(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { recentlyDeleted, startUndo, clearUndo };
};

// Utility functions
const getItemKey = (item: CartItem): string => {
  return item.id || `${item.product_id}-${item.variant_id}`;
};

const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

const getProductImage = (product: Product): string => {
  return product.product_images?.[0]?.image_url || 
         product.image || 
         '/src/assets/product-1.jpg';
};

const getItemPrice = (item: CartItem): number => {
  return item.variant?.price || item.product?.price || item.product?.base_price || 0;
};

// Components
const LoadingSpinner = React.memo(() => (
  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 rounded-lg">
    <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
  </div>
));

const ErrorMessage = React.memo<{ message: string; onRetry?: () => void }>(({ message, onRetry }) => (
  <div className="flex items-center gap-2 text-red-400 text-xs mt-2">
    <AlertCircle className="w-3 h-3" />
    <span>{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="underline hover:text-red-300 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
));

const QuantitySelector = React.memo<{
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  animationKey: number;
}>(({ quantity, onDecrease, onIncrease, animationKey }) => (
  <div className="flex items-center bg-black/60 border border-gray-700 rounded px-1 py-0.5">
    <button
      onClick={onDecrease}
      className="p-0.5 text-cyan-400 hover:bg-cyan-900/30 rounded transition-colors"
      aria-label="Decrease quantity"
    >
      <Minus className="w-3.5 h-3.5" />
    </button>
    <motion.span
      key={`quantity-${quantity}-${animationKey}`}
      className="w-6 text-center text-base text-white font-semibold"
      animate={{ scale: [1, 1.25, 1], color: ["#fff", "#22d3ee", "#fff"] }}
      transition={{ duration: 0.35 }}
    >
      {quantity}
    </motion.span>
    <button
      onClick={onIncrease}
      className="p-0.5 text-cyan-400 hover:bg-cyan-900/30 rounded transition-colors"
      aria-label="Increase quantity"
    >
      <Plus className="w-3.5 h-3.5" />
    </button>
  </div>
));

const ProductBadges = React.memo<{ item: CartItem }>(({ item }) => (
  <div className="flex items-center gap-2 mb-1">
    {item.variant?.size && (
      <span className="px-2 py-0.5 rounded bg-gray-800 text-xs text-cyan-200 border border-cyan-400 font-semibold">
        {item.variant.size}
      </span>
    )}
    {item.product?.color_options && item.variant?.color && (
      <span
        className="w-5 h-5 rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-cyan-400/30 shadow-sm"
        style={{ background: item.variant.color }}
        title={item.variant.color}
        aria-label={`Color: ${item.variant.color}`}
      />
    )}
  </div>
));

const CartItemCard = React.memo<{
  item: CartItem;
  index: number;
  isLoading: boolean;
  error: string;
  onUpdateQuantity: (newQuantity: number) => void;
  onRemove: () => void;
  onRetryUpdate: (quantity: number) => void;
  animationKey: number;
}>(({ item, index, isLoading, error, onUpdateQuantity, onRemove, onRetryUpdate, animationKey }) => {
  const itemPrice = useMemo(() => getItemPrice(item), [item]);
  const itemKey = useMemo(() => getItemKey(item), [item]);
  
  return (
    <motion.div
      key={itemKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ scale: 1.025, boxShadow: '0 4px 32px 0 #00d4ff44' }}
      className="relative flex gap-3 p-3 rounded-lg bg-gradient-to-br from-black/90 to-gray-900/90 border border-cyan-500/40 shadow-md transition-all cursor-pointer group"
      style={{ boxShadow: '0 0 8px 1px #00d4ff33' }}
    >
      {isLoading && <LoadingSpinner />}
      
      <img
        src={getProductImage(item.product)}
        alt={item.product?.name || 'Product'}
        className="w-14 h-14 object-contain rounded-lg bg-black/60 border border-gray-800 shadow-sm group-hover:shadow-cyan-400/30 transition-shadow"
        style={{ imageRendering: 'auto' }}
      />
      
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-cyan-900/30 transition-colors"
        aria-label={`Remove ${item.product?.name || 'item'} from cart`}
      >
        <X className="w-4 h-4 text-gray-400 hover:text-cyan-400" />
      </button>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-white text-base font-semibold leading-tight mb-1 truncate group-hover:text-cyan-300 transition-colors">
            {item.product?.name || 'Product'}
          </h4>
          
          <ProductBadges item={item} />
          
          {item.product?.is_limited_edition && (
            <span 
              className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded border border-cyan-400 text-cyan-300 bg-black/60 shadow-cyan-400/30 shadow-sm" 
              style={{ boxShadow: '0 0 4px #00d4ff' }}
            >
              LIMITED EDITION
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <QuantitySelector
            quantity={item.quantity}
            onDecrease={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            onIncrease={() => onUpdateQuantity(item.quantity + 1)}
            animationKey={animationKey}
          />
          
          <span className="text-lg font-bold text-cyan-400 ml-auto drop-shadow-cyan-400/30 drop-shadow">
            ${formatPrice(itemPrice)}
          </span>
        </div>
        
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={() => onRetryUpdate(item.quantity)}
          />
        )}
      </div>
    </motion.div>
  );
});

const EmptyCart = React.memo<{ onClose: () => void }>(({ onClose }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-6">
    <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
    <p className="text-muted-foreground text-center mb-6">
      Discover our latest streetwear collection and add some fire to your wardrobe.
    </p>
    <button onClick={onClose} className="btn-primary">
      Continue Shopping
    </button>
  </div>
));

const SignInPrompt = React.memo<{ onSignIn: () => void }>(({ onSignIn }) => (
  <div className="flex flex-col items-center justify-center h-full p-6">
    <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">Sign in to view your cart</h3>
    <p className="text-muted-foreground text-center mb-6">
      Create an account or sign in to save your items and continue shopping.
    </p>
    <button onClick={onSignIn} className="btn-primary">
      Sign In
    </button>
  </div>
));

const ConfirmDialog = React.memo<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
}>(({ isOpen, title, message, confirmText, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card rounded-lg p-8 max-w-sm w-full border border-gray-700 shadow-xl">
        <h3 className="text-lg font-bold mb-4 text-white">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex gap-4 justify-end">
          <button
            className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded border border-red-400 text-red-200 bg-red-900/30 hover:bg-red-900/60 font-semibold transition-colors"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
});

const ToastMessage = React.memo<{
  message: string;
  onUndo?: () => void;
  onRetry?: () => void;
}>(({ message, onUndo, onRetry }) => (
  <span>
    <span>{message}</span>
    {onUndo && (
      <button
        className="ml-2 underline text-cyan-400 hover:text-cyan-300 transition-colors"
        onClick={onUndo}
      >
        Undo
      </button>
    )}
    {onRetry && (
      <button
        className="ml-2 underline text-cyan-400 hover:text-cyan-300 transition-colors"
        onClick={onRetry}
      >
        Retry
      </button>
    )}
  </span>
));

// Mock hooks (replace with your actual implementations)
const useAuth = () => ({
  user: { id: '1', name: 'John Doe' } // Mock user
});

const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: '1',
      product_id: '1',
      variant_id: '1',
      quantity: 2,
      product: {
        id: '1',
        name: 'Supreme Streetwear Hoodie',
        base_price: 89.99,
        is_limited_edition: true,
        color_options: ['#000000', '#FF0000', '#0000FF']
      },
      variant: {
        id: '1',
        size: 'L',
        color: '#000000',
        price: 89.99
      }
    }
  ]);
  
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => 
    items.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0), 
    [items]
  );

  const updateQuantity = useCallback(async (itemKey: string, quantity: number) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setItems(prev => prev.map(item => 
      getItemKey(item) === itemKey ? { ...item, quantity } : item
    ));
    setLoading(false);
  }, []);

  const removeFromCart = useCallback(async (itemKey: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setItems(prev => prev.filter(item => getItemKey(item) !== itemKey));
    setLoading(false);
  }, []);

  const clearCart = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setItems([]);
    setLoading(false);
  }, []);

  const addToCart = useCallback(async (item: CartItem) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setItems(prev => [...prev, item]);
    setLoading(false);
  }, []);

  return {
    items,
    loading,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
    addToCart
  };
};

const useToast = () => ({
  toast: ({ title, description, variant, duration }: any) => {
    console.log('Toast:', { title, description, variant, duration });
  }
});

// Main component
const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { items, loading, total, updateQuantity, removeFromCart, clearCart, addToCart } = useCart();
  const { toast } = useToast();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [quantityAnimKey, setQuantityAnimKey] = useState(0);
  
  const { itemLoading, itemErrors, setItemLoadingState, setItemError, clearItemError } = useCartItemOperations();
  const { recentlyDeleted, startUndo, clearUndo } = useUndoSystem();

  const handleQuantityChange = useCallback(async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const itemKey = getItemKey(item);
    setQuantityAnimKey(prev => prev + 1);
    setItemLoadingState(itemKey, true);
    clearItemError(itemKey);
    
    try {
      await updateQuantity(itemKey, newQuantity);
    } catch (error) {
      const errorMessage = 'Failed to update quantity';
      setItemError(itemKey, errorMessage);
      toast({
        title: 'Error',
        description: (
          <ToastMessage 
            message={errorMessage}
            onRetry={() => handleQuantityChange(item, newQuantity)}
          />
        ),
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setItemLoadingState(itemKey, false);
    }
  }, [updateQuantity, setItemLoadingState, setItemError, clearItemError, toast]);

  const handleRemoveWithUndo = useCallback(async (item: CartItem) => {
    const itemKey = getItemKey(item);
    setItemLoadingState(itemKey, true);
    clearItemError(itemKey);
    
    try {
      await removeFromCart(itemKey);
      
      const undoAction = startUndo(item, async () => {
        try {
          await addToCart(item);
          toast({
            title: 'Item restored',
            description: 'Item has been added back to your cart.',
            variant: 'default',
            duration: 3000,
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to restore item to cart.',
            variant: 'destructive',
            duration: 5000,
          });
        }
      });
      
      toast({
        title: 'Item removed',
        description: <ToastMessage message="Item removed from cart." onUndo={undoAction} />,
        variant: 'default',
        duration: 5000,
      });
    } catch (error) {
      const errorMessage = 'Failed to remove item';
      setItemError(itemKey, errorMessage);
      toast({
        title: 'Error',
        description: (
          <ToastMessage 
            message={errorMessage}
            onRetry={() => handleRemoveWithUndo(item)}
          />
        ),
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setItemLoadingState(itemKey, false);
    }
  }, [removeFromCart, addToCart, startUndo, setItemLoadingState, setItemError, clearItemError, toast]);

  const handleClearCart = useCallback(async () => {
    setShowClearDialog(false);
    try {
      await clearCart();
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart.',
        variant: 'default',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear cart.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [clearCart, toast]);

  if (!isOpen) return null;

  // Not signed in and no items
  if (!user && (!items || items.length === 0)) {
    return (
      <>
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative ml-auto w-full max-w-md bg-card border-l border-border h-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SignInPrompt onSignIn={() => setShowAuthModal(true)} />
          </div>
        </div>
        {/* AuthModal would be rendered here */}
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative ml-auto w-full max-w-md bg-card border-l border-border h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold">
              Shopping Cart ({items.length})
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {loading && items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : items.length === 0 ? (
            <EmptyCart onClose={onClose} />
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence>
                  {items.map((item, index) => {
                    const itemKey = getItemKey(item);
                    return (
                      <CartItemCard
                        key={itemKey}
                        item={item}
                        index={index}
                        isLoading={itemLoading[itemKey] || false}
                        error={itemErrors[itemKey] || ''}
                        onUpdateQuantity={(quantity) => handleQuantityChange(item, quantity)}
                        onRemove={() => handleRemoveWithUndo(item)}
                        onRetryUpdate={(quantity) => handleQuantityChange(item, quantity)}
                        animationKey={quantityAnimKey}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-800 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-white">TOTAL</span>
                  <span className="text-2xl font-bold text-white">
                    ${formatPrice(total)}
                  </span>
                </div>
                <div className="text-gray-400 text-sm mb-6">Free shipping</div>
                
                <button
                  className="w-full py-4 text-lg font-bold rounded-xl border border-cyan-400 text-white bg-black/80 shadow-cyan-400/30 shadow-md hover:bg-cyan-900/30 transition-all mb-3"
                  style={{ boxShadow: '0 0 12px #00d4ff' }}
                >
                  PROCEED TO CHECKOUT
                </button>
                
                {items.length > 0 && (
                  <button
                    className="w-full py-2 text-sm font-semibold rounded-xl border border-red-400 text-red-300 bg-black/80 hover:bg-red-900/20 transition-all"
                    onClick={() => setShowClearDialog(true)}
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showClearDialog}
        title="Clear Cart?"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Yes, Clear"
        onConfirm={handleClearCart}
        onCancel={() => setShowClearDialog(false)}
      />
    </>
  );
};

export default CartSidebar;