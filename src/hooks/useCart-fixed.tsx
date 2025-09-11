import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/services/edgeFunctions';
import { trackCartEvent } from '@/services/analyticsService';

type CartItem = Tables<'cart_items'> & {
  product: Tables<'products'>;
  variant?: Tables<'product_variants'>;
};

type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  error: string | null;
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
  debugCart: () => Promise<void>;
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

  // Helper: localStorage keys for guest users
  const LOCAL_CART_KEY = 'vlanco_guest_cart';

  // Helper: get local cart for guest users
  const getLocalCart = () => {
    try {
      const raw = localStorage.getItem(LOCAL_CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // Helper: set local cart for guest users
  const setLocalCart = (cart: any[]) => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  };

  // Ensure user profile exists before any cart operations
  const ensureUserProfile = useCallback(async () => {
    if (!user) return false;
    
    try {
      console.log('🔍 Ensuring user profile exists for cart operations...');
      
      const { data, error } = await supabase.rpc('ensure_user_profile', {
        p_user_id: user.id,
        p_email: user.email!,
        p_first_name: user.user_metadata?.first_name || null,
        p_last_name: user.user_metadata?.last_name || null,
        p_full_name: user.user_metadata?.full_name || null
      });
      
      if (error) {
        console.error('❌ Error ensuring user profile:', error);
        return false;
      }
      
      console.log('✅ User profile ensured:', data);
      return true;
    } catch (error) {
      console.error('❌ Exception ensuring user profile:', error);
      return false;
    }
  }, [user]);

  // Fetch cart items using database function
  const fetchCartItems = useCallback(async () => {
    console.log('🔄 fetchCartItems called, user:', !!user);
    
    if (!user) {
      const localCart = getLocalCart();
      console.log('🛒 Loading guest cart:', localCart.length, 'items');
      setItems(localCart);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching cart items from database for user:', user.id);
      
      // Use the database function for reliable cart fetching
      const { data, error: fetchError } = await supabase.rpc('get_cart_items', {
        p_user_id: user.id
      });

      if (fetchError) {
        console.error('❌ Error fetching cart items:', fetchError);
        setError(fetchError.message);
        setItems([]);
        return;
      }

      console.log('📦 Raw cart data from database function:', data);
      
      // Parse the JSON response from the function
      const cartItems = Array.isArray(data) ? data : [];
      console.log('📦 Parsed cart items:', cartItems.length, 'items');
      
      setItems(cartItems);
      
    } catch (error) {
      console.error('❌ Exception fetching cart items:', error);
      setError('Failed to fetch cart items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add item to cart using database function
  const addToCart = useCallback(async (productId: string, variantId: string, quantity: number = 1, productDetails?: any) => {
    console.log('🛒 addToCart called:', { productId, variantId, quantity, hasProductDetails: !!productDetails });
    
    if (!user) {
      // Handle guest cart
      console.log('🛒 Adding to guest cart');
      let cart = getLocalCart();
      const existingItemIndex = cart.findIndex(
        (item: any) => item.product_id === productId && item.variant_id === variantId
      );
      
      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push({
          id: `guest_${Date.now()}_${Math.random()}`,
          product_id: productId,
          variant_id: variantId,
          quantity,
          price_at_time: productDetails?.variant?.price || productDetails?.price || 0,
          product: productDetails?.product || { id: productId, name: `Product ${productId}`, base_price: 0 },
          variant: productDetails?.variant || { id: variantId, price: 0, color: 'Default', size: 'M' },
          added_at: new Date().toISOString()
        });
      }
      
      setLocalCart(cart);
      setItems(cart);
      toast({ 
        title: 'Added to Cart', 
        description: 'Item added to your cart',
        duration: 3000
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Ensure user profile exists first
      const profileExists = await ensureUserProfile();
      if (!profileExists) {
        throw new Error('Failed to ensure user profile exists');
      }
      
      // Use database function to add to cart
      console.log('📦 Adding to cart via database function...');
      const { data, error: addError } = await supabase.rpc('add_to_cart', {
        p_user_id: user.id,
        p_product_id: productId,
        p_variant_id: variantId || null,
        p_quantity: quantity,
        p_price_override: productDetails?.variant?.price || productDetails?.price || null
      });

      if (addError) {
        console.error('❌ Error adding to cart:', addError);
        throw addError;
      }
      
      console.log('✅ Add to cart result:', data);
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to add item to cart');
      }
      
      // Refresh cart items
      await fetchCartItems();
      
      // Track analytics
      try {
        await trackCartEvent({
          userId: user.id,
          eventType: 'add_to_cart',
          productId,
          variantId,
          quantity,
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
      
      toast({ 
        title: '🚀 DEPLOYED TO VAULT!', 
        description: `${productDetails?.product?.name || 'Item'} added to your cart`,
        duration: 3000
      });
      
    } catch (error: any) {
      console.error('❌ addToCart failed:', error);
      setError(error.message);
      toast({ 
        title: 'Failed to add to cart', 
        description: error.message || 'An error occurred',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [user, ensureUserProfile, fetchCartItems]);

  // Update quantity using database function
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    console.log('🔄 updateQuantity called:', { itemId, quantity });
    
    if (!user) {
      // Handle guest cart
      let cart = getLocalCart();
      const itemIndex = cart.findIndex((item: any) => item.id === itemId);
      if (itemIndex > -1) {
        if (quantity <= 0) {
          cart.splice(itemIndex, 1);
        } else {
          cart[itemIndex].quantity = quantity;
        }
        setLocalCart(cart);
        setItems(cart);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: updateError } = await supabase.rpc('update_cart_item_quantity', {
        p_cart_item_id: itemId,
        p_user_id: user.id,
        p_new_quantity: quantity
      });

      if (updateError) {
        console.error('❌ Error updating quantity:', updateError);
        throw updateError;
      }
      
      console.log('✅ Quantity update result:', data);
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to update quantity');
      }
      
      // Refresh cart items
      await fetchCartItems();
      
    } catch (error: any) {
      console.error('❌ updateQuantity failed:', error);
      setError(error.message);
      toast({ 
        title: 'Failed to update quantity', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user, fetchCartItems]);

  // Remove item using database function
  const removeFromCart = useCallback(async (itemId: string) => {
    console.log('🗑️ removeFromCart called:', { itemId });
    
    if (!user) {
      // Handle guest cart
      let cart = getLocalCart();
      cart = cart.filter((item: any) => item.id !== itemId);
      setLocalCart(cart);
      setItems(cart);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: removeError } = await supabase.rpc('remove_cart_item', {
        p_cart_item_id: itemId,
        p_user_id: user.id
      });

      if (removeError) {
        console.error('❌ Error removing item:', removeError);
        throw removeError;
      }
      
      console.log('✅ Remove item result:', data);
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to remove item');
      }
      
      // Refresh cart items
      await fetchCartItems();
      
      toast({ 
        title: 'Item removed', 
        description: 'Item has been removed from your cart'
      });
      
    } catch (error: any) {
      console.error('❌ removeFromCart failed:', error);
      setError(error.message);
      toast({ 
        title: 'Failed to remove item', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user, fetchCartItems]);

  // Clear cart using database function
  const clearCart = useCallback(async () => {
    console.log('🧹 clearCart called');
    
    if (!user) {
      setLocalCart([]);
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: clearError } = await supabase.rpc('clear_cart', {
        p_user_id: user.id
      });

      if (clearError) {
        console.error('❌ Error clearing cart:', clearError);
        throw clearError;
      }
      
      console.log('✅ Clear cart result:', data);
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to clear cart');
      }
      
      setItems([]);
      
      toast({ 
        title: 'Cart cleared', 
        description: 'All items have been removed from your cart'
      });
      
    } catch (error: any) {
      console.error('❌ clearCart failed:', error);
      setError(error.message);
      toast({ 
        title: 'Failed to clear cart', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Debug cart state
  const debugCart = useCallback(async () => {
    if (!user) {
      console.log('🔍 Guest cart debug:', getLocalCart());
      return;
    }

    try {
      const { data, error } = await supabase.rpc('debug_cart_state', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Debug cart error:', error);
        return;
      }
      
      console.log('🔍 Cart debug info:', data);
      toast({
        title: 'Cart Debug Info',
        description: 'Check browser console for detailed cart state'
      });
      
    } catch (error) {
      console.error('❌ Debug cart exception:', error);
    }
  }, [user]);

  // Merge guest cart when user signs in
  const mergeGuestCart = useCallback(async () => {
    if (!user) return;
    
    const guestCart = getLocalCart();
    if (guestCart.length === 0) return;
    
    console.log('🔄 Merging guest cart with user cart:', guestCart.length, 'items');
    
    try {
      // Ensure user profile exists first
      await ensureUserProfile();
      
      // Add each guest item to database
      for (const item of guestCart) {
        try {
          await supabase.rpc('add_to_cart', {
            p_user_id: user.id,
            p_product_id: item.product_id,
            p_variant_id: item.variant_id || null,
            p_quantity: item.quantity,
            p_price_override: item.price_at_time || item.variant?.price || item.product?.base_price || null
          });
        } catch (itemError) {
          console.warn('Failed to merge cart item:', item, itemError);
        }
      }
      
      // Clear guest cart
      setLocalCart([]);
      
      // Refresh cart items
      await fetchCartItems();
      
      console.log('✅ Guest cart merged successfully');
      
    } catch (error) {
      console.error('❌ Failed to merge guest cart:', error);
    }
  }, [user, ensureUserProfile, fetchCartItems]);

  // Initialize cart when user changes
  useEffect(() => {
    console.log('🔄 Cart initialization effect triggered, user:', !!user);
    
    if (user) {
      // User signed in - merge guest cart and fetch database cart
      mergeGuestCart();
    } else {
      // User signed out - load guest cart
      console.log('🔄 Loading guest cart');
      setItems(getLocalCart());
    }
  }, [user, mergeGuestCart]);

  // Helper functions
  const getItemById = useCallback((itemId: string) => {
    return items.find(item => item.id === itemId);
  }, [items]);

  const isInCart = useCallback((productId: string, variantId: string) => {
    return items.some(item => 
      item.product_id === productId && 
      (item.variant_id === variantId || (!item.variant_id && !variantId))
    );
  }, [items]);

  // Computed values
  const total = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product?.base_price || item.price_at_time || 0;
    return sum + (price * item.quantity);
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = items.length > 0;

  // Create checkout with proper error handling
  const createCheckout = useCallback(async (discountCode?: string) => {
    if (!user) {
      toast({ 
        title: 'Sign in required', 
        description: 'Please sign in to proceed to checkout.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!hasItems) {
      toast({ 
        title: 'Cart is empty', 
        description: 'Add some items to your cart before checking out.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      const payload = items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity
      }));
      
      console.log('💳 Creating checkout session with payload:', payload);
      
      const { url } = await createCheckoutSession(payload, discountCode);
      
      console.log('✅ Checkout session created, redirecting to:', url);
      window.location.href = url;
      
    } catch (error: any) {
      console.error('❌ Checkout failed:', error);
      toast({ 
        title: 'Checkout error', 
        description: error.message || 'Failed to start checkout',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [user, items, hasItems]);

  // Debug logging
  console.log('🛒 Cart state:', { 
    itemsCount: items.length, 
    totalItems: itemCount, 
    total: total.toFixed(2), 
    hasItems,
    loading,
    error
  });

  return {
    items,
    loading,
    error,
    total,
    itemCount,
    hasItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemById,
    isInCart,
    refetch: fetchCartItems,
    createCheckout,
    debugCart
  };
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
