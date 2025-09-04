import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/services/edgeFunctions';

type CartItem = Tables<'cart_items'> & {
  product: Tables<'products'>;
  variant: Tables<'product_variants'>;
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

  // Helper: localStorage key
  const LOCAL_CART_KEY = 'vlanco_guest_cart';
  const ENHANCED_DETAILS_KEY = 'vlanco_enhanced_details';

  // Helper: get local cart
  const getLocalCart = () => {
    try {
      const raw = localStorage.getItem(LOCAL_CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // Helper: set local cart
  const setLocalCart = (cart: any[]) => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  };

  // Helper: get enhanced details
  const getEnhancedDetails = () => {
    try {
      const raw = localStorage.getItem(ENHANCED_DETAILS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  // Helper: set enhanced details
  const setEnhancedDetails = (details: any) => {
    localStorage.setItem(ENHANCED_DETAILS_KEY, JSON.stringify(details));
  };

  // Fetch cart items from Supabase
  const fetchCartItems = useCallback(async () => {
    console.log('🔄 fetchCartItems called, user:', !!user);
    
    if (!user) {
      const localCart = getLocalCart();
      console.log('🛒 Setting guest cart items:', localCart);
      setItems(localCart);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching cart items from Supabase for user:', user.id);
      const { data, error: fetchError } = await supabase
        .from('cart_items')
        .select(`*`)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Error fetching cart items:', fetchError);
        setError(fetchError.message);
        setItems([]);
        return;
      }

      console.log('📦 Raw cart items from Supabase:', data);

      // Merge with enhanced details from localStorage
      const enhancedDetails = getEnhancedDetails();
      console.log('💾 Enhanced details from localStorage:', enhancedDetails);
      
      const itemsWithEnhancedDetails = (data || []).map(item => {
        const itemKey = `${item.product_id}-${item.variant_id}`;
        const enhanced = (enhancedDetails as any)[itemKey];
        
        if (enhanced) {
          console.log('🔗 Merging enhanced details for item:', itemKey, enhanced);
          return {
            ...item,
            product: {
              ...((item as any).product || {}),
              ...enhanced.product
            },
            variant: {
              ...((item as any).variant || {}),
              ...enhanced.variant
            }
          } as CartItem;
        }
        return item as CartItem;
      });

      console.log('🛒 Final cart items with enhanced details:', itemsWithEnhancedDetails);
      if ((itemsWithEnhancedDetails as any[]).length === 0) {
        // Preserve current UI state if server has no items yet
        console.warn('⚠️ Supabase returned no cart items; preserving current cart state');
      } else {
        setItems(itemsWithEnhancedDetails);
      }
    } catch (error) {
      console.error('❌ Exception fetching cart items:', error);
      setError('Failed to fetch cart items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    if (!user) {
      let cart = getLocalCart();
      const idx = cart.findIndex((item: any) => item.id === itemId);
      if (idx > -1) {
        cart.splice(idx, 1);
        setLocalCart(cart);
        setItems(cart);
      }
      return;
    }

    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      // Clean up enhanced details for this item
      const item = items.find(item => item.id === itemId);
      if (item) {
        const enhancedDetails = getEnhancedDetails();
        const itemKey = `${item.product_id}-${item.variant_id}`;
        delete (enhancedDetails as any)[itemKey];
        setEnhancedDetails(enhancedDetails);
      }
      
      await fetchCartItems();
      toast({ 
        title: 'Removed from cart', 
        description: 'Item has been removed from your cart',
        duration: 3000
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item from cart';
      setError(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000
      });
    }
  }, [user, fetchCartItems, items]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, variantId: string, quantity: number = 1, productDetails?: any) => {
    console.log('🔍 addToCart called with:', { productId, variantId, quantity, productDetails, user: !!user });
    
    if (!user) {
      // Guest cart logic with enhanced product details
      console.log('🛒 Adding to guest cart');
      let cart = getLocalCart();
      const existingItemIndex = cart.findIndex(
        (item: any) => item.product_id === productId && item.variant_id === variantId
      );
      
      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
        console.log('📦 Updated existing item quantity');
      } else {
        cart.push({ 
          id: `guest_${Date.now()}_${Math.random()}`, 
          product_id: productId, 
          variant_id: variantId, 
          quantity,
          price_at_time: productDetails?.price || 0,
          product: productDetails?.product || {},
          variant: productDetails?.variant || {},
          added_at: new Date().toISOString()
        });
        console.log('📦 Added new item to guest cart');
      }
      
      setLocalCart(cart);
      setItems(cart);
      console.log('🛒 Guest cart updated:', cart);
      toast({ 
        title: '🚀 DEPLOYED TO VAULT!', 
        description: 'Item has been added to your cart with enhanced details',
        duration: 3000
      });
      return;
    }

    // Supabase cart logic with enhanced product details
    console.log('🛒 Adding to authenticated user cart');
    try {
      setError(null);
      
      // Optimistic add to UI using provided productDetails
      let rollback: (() => void) | null = null;
      if (productDetails) {
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const optimisticItem: any = {
          id: tempId,
          user_id: user.id,
          product_id: productId,
          variant_id: variantId,
          quantity,
          added_at: new Date().toISOString(),
          product: productDetails.product || {},
          variant: productDetails.variant || {}
        };
        setItems(prev => {
          const next = [optimisticItem, ...prev];
          return next as CartItem[];
        });
        rollback = () => setItems(prev => prev.filter(i => (i as any).id !== tempId) as any);
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('variant_id', variantId)
        .single();

      if (existingItem) {
        // Update existing item quantity
        console.log('📦 Updating existing item quantity');
        const currentQuantity = typeof (existingItem as any).quantity === 'number' ? (existingItem as any).quantity : 0;
        const newQuantity = currentQuantity + quantity;
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ 
            quantity: newQuantity,
          })
          .eq('id', (existingItem as any).id);

        if (updateError) throw updateError;
      } else {
        // Insert new item
        console.log('📦 Inserting new item');
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            variant_id: variantId,
            quantity,
            added_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      // Store enhanced details for this item (before refetch to ensure merge works)
      if (productDetails) {
        console.log('💾 Storing enhanced details');
        const enhancedDetails = getEnhancedDetails();
        const itemKey = `${productId}-${variantId}`;
        (enhancedDetails as any)[itemKey] = {
          product: productDetails.product || {},
          variant: productDetails.variant || {}
        };
        setEnhancedDetails(enhancedDetails);
      }

      await fetchCartItems();
      console.log('🛒 Authenticated cart updated successfully');
      toast({ 
        title: '🚀 DEPLOYED TO VAULT!', 
        description: 'Item has been added to your cart with enhanced details',
        duration: 3000
      });
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      // Keep optimistic item so the cart dashboard still shows the item
      // You will see an error toast; data will persist locally until Supabase succeeds
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      setError(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000
      });
    }
  }, [user, fetchCartItems]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!user) {
      let cart = getLocalCart();
      const idx = cart.findIndex((item: any) => item.id === itemId);
      if (idx > -1) {
        if (quantity <= 0) {
          cart.splice(idx, 1);
        } else {
          cart[idx].quantity = quantity;
        }
        setLocalCart(cart);
        setItems(cart);
      }
      return;
    }

    try {
      setError(null);
      
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      
      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quantity';
      setError(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000
      });
    }
  }, [user, removeFromCart, fetchCartItems]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!user) {
      setLocalCart([]);
      setItems([]);
      return;
    }

    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
      setError(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000
      });
    }
  }, [user]);

  // Get item by ID
  const getItemById = useCallback((itemId: string) => {
    return items.find(item => item.id === itemId);
  }, [items]);

  // Check if product is in cart
  const isInCart = useCallback((productId: string, variantId: string) => {
    return items.some(item => 
      item.product_id === productId && item.variant_id === variantId
    );
  }, [items]);

  // Merge guest cart into Supabase cart on sign-in
  useEffect(() => {
    console.log('🔄 Cart initialization effect triggered, user:', !!user);
    
    if (user) {
      const guestCart = getLocalCart();
      console.log('🛒 Guest cart items:', guestCart);
      
      if (guestCart.length > 0) {
        console.log('🔄 Migrating guest cart to authenticated cart');
        // For each item in guest cart, upsert into Supabase cart
        Promise.all(guestCart.map(async (item) => {
          try {
            await supabase.from('cart_items').upsert({
              user_id: user.id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              added_at: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Failed to migrate guest cart item:', error);
          }
        })).then(() => {
          setLocalCart([]); // Clear guest cart after merge
          fetchCartItems();
        });
      } else {
        console.log('🔄 No guest cart to migrate, fetching authenticated cart');
        fetchCartItems();
      }
    } else {
      console.log('🔄 Setting guest cart items');
      setItems(getLocalCart());
    }
  }, [user]); // Removed fetchCartItems from dependencies to prevent infinite loop

  // Computed values
  const total = items.reduce((sum, item) => {
    const price = (item as any).variant?.price || (item as any).product?.base_price || 0;
    return sum + (price * (item as any).quantity);
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + (item as any).quantity, 0);

  // Check if cart has items
  const hasItems = items.length > 0;

  // Debug logging for computed values
  console.log('🛒 Cart state update:', { 
    itemsCount: items.length, 
    totalItems: itemCount, 
    total: total, 
    hasItems 
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
    createCheckout: async (discountCode?: string) => {
      if (!user) {
        toast({ title: 'Sign in required', description: 'Please sign in to proceed to checkout.' });
        return;
      }
      if (!items.length) return;
      const payload = items.map((i: any) => ({ product_id: i.product_id, variant_id: i.variant_id, quantity: i.quantity }));
      try {
        const { url } = await createCheckoutSession(payload, discountCode);
        window.location.href = url;
      } catch (e: any) {
        toast({ title: 'Checkout error', description: e.message || 'Failed to start checkout', variant: 'destructive' });
      }
    }
  };
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  // Fallback to local provider hook if no context (backward compatibility)
  return ctx ?? useProvideCart();
}


