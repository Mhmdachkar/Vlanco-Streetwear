
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/services/edgeFunctions';

type CartItem = Tables<'cart_items'> & {
  product: Tables<'products'>;
  variant: Tables<'product_variants'>;
};

export function useCart() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: localStorage key
  const LOCAL_CART_KEY = 'vlanco_guest_cart';

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

  // Fetch cart items from Supabase
  const fetchCartItems = useCallback(async () => {
    if (!user) {
      setItems(getLocalCart());
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*),
          variant:product_variants(*)
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching cart items:', fetchError);
        setError(fetchError.message);
        setItems([]);
        return;
      }

      setItems(data || []);
    } catch (error) {
      console.error('Exception fetching cart items:', error);
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
  }, [user, fetchCartItems]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, variantId: string, quantity: number = 1, productDetails?: any) => {
    if (!user) {
      // Guest cart logic with enhanced product details
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
          price_at_time: productDetails?.price || 0,
          product: productDetails?.product || {},
          variant: productDetails?.variant || {},
          added_at: new Date().toISOString()
        });
      }
      
      setLocalCart(cart);
      setItems(cart);
      toast({ 
        title: '🚀 DEPLOYED TO VAULT!', 
        description: 'Item has been added to your cart with enhanced details',
        duration: 3000
      });
      return;
    }

    // Supabase cart logic with enhanced product details
    try {
      setError(null);
      
      // Get product and variant details for price
      // Price is used client-side only; not persisted in cart_items schema
      
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
        const currentQuantity = typeof (existingItem as any).quantity === 'number' ? (existingItem as any).quantity : 0;
        const newQuantity = currentQuantity + quantity;
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ 
            quantity: newQuantity,
            // aligned to schema: no extra fields
          })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Insert new item with enhanced details
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

      await fetchCartItems();
      toast({ 
        title: '🚀 DEPLOYED TO VAULT!', 
        description: 'Item has been added to your cart with enhanced details',
        duration: 3000
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
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
    if (user) {
      const guestCart = getLocalCart();
      if (guestCart.length > 0) {
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
        fetchCartItems();
      }
    } else {
      setItems(getLocalCart());
    }
  }, [user, fetchCartItems]);

  // Computed values
  const total = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product?.base_price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Check if cart has items
  const hasItems = items.length > 0;

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
