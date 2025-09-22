import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { createLocalCheckoutSession } from '@/services/localCheckoutService';

type CartItem = {
  id: string;
  user_id: string | null;
  product_id: string;
  variant_id: string;
  quantity: number;
  price_at_time: number;
  added_at: string;
  product: {
    id: string;
    name: string;
    base_price: number;
    image_url: string;
    description: string;
    category: string;
    brand: string;
    compare_price?: number;
    [key: string]: any;
  };
  variant: {
    id: string;
    price: number;
    color: string;
    size: string;
    sku: string;
    stock_quantity: number;
    is_active: boolean;
    [key: string]: any;
  };
};

type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  subtotal: number;
  total: number;
  itemCount: number;
  hasItems: boolean;
  addToCart: (productId: string, variantId: string, quantity?: number, productDetails?: any) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemById: (itemId: string) => CartItem | undefined;
  isInCart: (productId: string, variantId: string) => boolean;
  refetch: () => Promise<void>;
  createCheckout: (discountCode?: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const value = useProvideCart();
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function useProvideCart(): CartContextValue {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user-specific cart key
  const getCartKey = useCallback(() => {
    return user ? `vlanco_cart_${user.id}` : 'vlanco_guest_cart';
  }, [user]);

  // Save cart to localStorage with retry mechanism and validation
  const saveCart = useCallback((cartItems: CartItem[]) => {
    const maxRetries = 3;
    let currentTry = 0;

    const attemptSave = (): boolean => {
      try {
        const cartKey = getCartKey();
        const serializedCart = JSON.stringify(cartItems);
        
        // Save the cart
        localStorage.setItem(cartKey, serializedCart);
        
        // Verify the save was successful
        const savedCart = localStorage.getItem(cartKey);
        if (savedCart === serializedCart) {
          return true; // Save successful
        }
        return false; // Save verification failed
      } catch (error) {
        console.error(`Save attempt ${currentTry + 1} failed:`, error);
        return false;
      }
    };

    // Retry logic
    while (currentTry < maxRetries) {
      if (attemptSave()) {
        return; // Success
      }
      currentTry++;
      
      if (currentTry < maxRetries) {
        // Wait a bit before retrying
        setTimeout(() => {}, 100);
      }
    }
    
    // All retries failed
    console.error('Failed to save cart after all retries');
  }, [getCartKey]);

  // Load cart from localStorage with validation and migration
  const loadCart = useCallback(() => {
    try {
      const cartKey = getCartKey();
      const savedCart = localStorage.getItem(cartKey);
      
      if (!savedCart) {
        if (user) {
          // If authenticated but no cart exists, check for guest cart to migrate
          const guestCartKey = 'vlanco_guest_cart';
          const guestCart = localStorage.getItem(guestCartKey);
          
          if (guestCart) {
            // Migrate guest cart to user cart
            console.log('🔄 Migrating guest cart to user cart');
            const parsedGuestCart = JSON.parse(guestCart);
            
            // Update cart items with user ID
            const migratedCart = parsedGuestCart.map((item: CartItem) => ({
              ...item,
              user_id: user.id
            }));
            
            setItems(migratedCart);
            saveCart(migratedCart);
            localStorage.removeItem(guestCartKey); // Clear guest cart
            return;
          }
        }
        setItems([]);
        return;
      }
      
      try {
        const parsedCart = JSON.parse(savedCart);
        
        // Validate cart structure
        if (!Array.isArray(parsedCart)) {
          console.error('Invalid cart structure, resetting');
          setItems([]);
          return;
        }
        
        // Validate and filter cart items
        const validatedCart = parsedCart.filter((item: any) => {
          // Ensure required fields exist
          const hasRequiredFields = 
            item &&
            item.id &&
            item.product_id &&
            item.variant_id &&
            typeof item.quantity === 'number' &&
            item.product &&
            item.variant;
          
          if (!hasRequiredFields) {
            console.warn('Filtered out invalid cart item:', item);
            return false;
          }
          
          // Ensure correct user ownership
          if (user && item.user_id !== user.id) {
            console.warn('Filtered out item with mismatched user_id:', item);
            return false;
          }
          
          return true;
        });
        
        if (validatedCart.length !== parsedCart.length) {
          // Some items were filtered out, save the cleaned cart
          saveCart(validatedCart);
        }
        
        setItems(validatedCart);
        
      } catch (parseError) {
        console.error('Failed to parse cart:', parseError);
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      setItems([]);
    }
  }, [getCartKey, user, saveCart]);


  // Load cart when user changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, variantId: string, quantity: number = 1, productDetails?: any) => {
    try {
      
      setError(null);
      
      // Check if item already exists
      const existingIndex = items.findIndex(
        (item) => item.product_id === productId && item.variant_id === variantId
      );
      
      let updatedItems: CartItem[];
      
      if (existingIndex > -1) {
        // Update existing item
        updatedItems = [...items];
        updatedItems[existingIndex].quantity += quantity;
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `local_${Date.now()}_${Math.random()}`,
          user_id: user?.id || null,
          product_id: productId,
          variant_id: variantId,
          quantity,
          price_at_time: productDetails?.variant?.price || productDetails?.price || 0,
          added_at: new Date().toISOString(),
          product: {
            id: productId,
            name: productDetails?.product?.name || `Product ${productId}`,
            base_price: productDetails?.product?.base_price || productDetails?.price || 0,
            image_url: productDetails?.product?.image_url || productDetails?.product?.image || '/src/assets/1.png',
            description: productDetails?.product?.description || 'Streetwear product',
            category: productDetails?.product?.category || 'Streetwear',
            brand: productDetails?.product?.brand || 'VLANCO',
            compare_price: productDetails?.product?.compare_price,
            ...productDetails?.product
          },
          variant: {
            id: variantId,
            price: productDetails?.variant?.price || productDetails?.price || 0,
            color: productDetails?.variant?.color || 'Default',
            size: productDetails?.variant?.size || 'M',
            sku: productDetails?.variant?.sku || `${productId}-${variantId}`,
            stock_quantity: productDetails?.variant?.stock_quantity || 10,
            is_active: true,
            ...productDetails?.variant
          }
        };
        
        updatedItems = [newItem, ...items];
      }
      
      // Update state and save to localStorage
      setItems(updatedItems);
      saveCart(updatedItems);
      
      toast({
        title: '✅ Added to Cart',
        description: 'Item has been added to your cart',
        duration: 3000
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000
      });
      throw error;
    }
  }, [items, user, saveCart]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }
      
      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      
      setItems(updatedItems);
      saveCart(updatedItems);
      
      toast({
        title: '✅ Quantity Updated',
        description: `Quantity changed to ${quantity}`,
        duration: 2000
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quantity';
      setError(errorMessage);
      throw error;
    }
  }, [items, saveCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      
      const itemToRemove = items.find(item => item.id === itemId);
      const updatedItems = items.filter(item => item.id !== itemId);
      
      setItems(updatedItems);
      saveCart(updatedItems);
      
      // Show undo option
      if (itemToRemove) {
        toast({
          title: '🗑️ Item Removed',
          description: `${itemToRemove.product.name} removed from cart`,
          duration: 5000,
          action: (
            <ToastAction
              altText="Undo"
              onClick={() => {
                const restoredItems = [...updatedItems, itemToRemove];
                setItems(restoredItems);
                saveCart(restoredItems);
                toast({
                  title: '↩️ Item Restored',
                  description: 'Item has been added back to your cart',
                  duration: 3000
                });
              }}
            >
              Undo
            </ToastAction>
          )
        });
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
      setError(errorMessage);
      throw error;
    }
  }, [items, saveCart]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setItems([]);
      saveCart([]);
      toast({
        title: '🧹 Cart Cleared',
        description: 'All items have been removed from your cart',
        duration: 3000
      });
    } catch (error) {
      throw error;
    }
  }, [saveCart]);

  // Get item by ID
  const getItemById = useCallback((itemId: string) => {
    return items.find(item => item.id === itemId);
  }, [items]);

  // Check if item is in cart
  const isInCart = useCallback((productId: string, variantId: string) => {
    return items.some(item => item.product_id === productId && item.variant_id === variantId);
  }, [items]);

  // Refetch cart (for compatibility)
  const refetch = useCallback(async () => {
    loadCart();
  }, [loadCart]);

  // Create checkout session
  const createCheckout = useCallback(async (discountCode?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (items.length === 0) {
        throw new Error('Cart is empty');
      }
      
      // Convert cart items to local checkout format
      const localCartItems = items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price_at_time || item.variant?.price || item.product?.base_price || 0,
        product_name: item.product?.name || 'Product',
        product_image: item.product?.image_url || item.product?.image || '/src/assets/1.png',
        variant_color: item.variant?.color || 'Default',
        variant_size: item.variant?.size || 'M',
        variant_sku: item.variant?.sku || `${item.product_id}-${item.variant_id}`,
        user_email: user?.email || undefined
      }));
      
      
      // Create Stripe checkout session
      const { url, sessionId } = await createLocalCheckoutSession(localCartItems, discountCode);
      
      
      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received from Stripe');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
      setError(errorMessage);
      
      // Show more detailed error message to user
      let userMessage = errorMessage;
      if (errorMessage.includes('timeout')) {
        userMessage = 'Checkout is taking longer than expected. Please try again or contact support.';
      } else if (errorMessage.includes('Edge function')) {
        userMessage = 'Payment service is temporarily unavailable. Please try again in a moment.';
      } else if (errorMessage.includes('All checkout methods failed')) {
        userMessage = 'Unable to process payment at this time. Please try again later.';
      }
      
      toast({
        title: 'Checkout Error',
        description: userMessage,
        variant: 'destructive',
        duration: 8000
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [items, user]);

  // Calculate cart totals
  const subtotal = items.reduce((sum, item) => {
    const price = item.price_at_time || item.variant?.price || item.product?.base_price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const shippingCost = subtotal >= 100 ? 0 : 9.99;
  const taxAmount = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + taxAmount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = items.length > 0;

  return {
    items,
    loading,
    error,
    subtotal,
    total,
    itemCount,
    hasItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemById,
    isInCart,
    refetch,
    createCheckout,
  };
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
