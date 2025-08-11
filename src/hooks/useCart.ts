
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type CartItem = Tables<'cart_items'> & {
  product: Tables<'products'>;
  variant: Tables<'product_variants'>;
};

export function useCart() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Merge guest cart into Supabase cart on sign-in
  useEffect(() => {
    if (user) {
      const guestCart = getLocalCart();
      if (guestCart.length > 0) {
        // For each item in guest cart, upsert into Supabase cart
        Promise.all(guestCart.map(async (item) => {
          await supabase.from('cart_items').upsert({
            user_id: user.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
          });
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
    // eslint-disable-next-line
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) {
      setItems(getLocalCart());
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`*, product:products(*), variant:product_variants(*)`)
        .eq('user_id', user.id);
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, variantId: string, quantity: number = 1) => {
    if (!user) {
      // Guest cart logic
      let cart = getLocalCart();
      const idx = cart.findIndex((item: any) => item.product_id === productId && item.variant_id === variantId);
      if (idx > -1) {
        cart[idx].quantity += quantity;
      } else {
        cart.push({ product_id: productId, variant_id: variantId, quantity });
      }
      setLocalCart(cart);
      setItems(cart);
      toast({ title: 'Added to cart', description: 'Item has been added to your cart' });
      return;
    }
    // Supabase cart logic
    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: productId,
          variant_id: variantId,
          quantity,
        });
      if (error) throw error;
      await fetchCartItems();
      toast({ title: 'Added to cart', description: 'Item has been added to your cart' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add item to cart', variant: 'destructive' });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
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
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id);
      if (error) throw error;
      await fetchCartItems();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update quantity', variant: 'destructive' });
    }
  };

  const removeFromCart = async (itemId: string) => {
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
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);
      if (error) throw error;
      await fetchCartItems();
      toast({ title: 'Removed from cart', description: 'Item has been removed from your cart' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove item from cart', variant: 'destructive' });
    }
  };

  const clearCart = async () => {
    if (!user) {
      setLocalCart([]);
      setItems([]);
      return;
    }
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
      setItems([]);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to clear cart', variant: 'destructive' });
    }
  };

  const total = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product?.base_price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    loading,
    total,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refetch: fetchCartItems,
  };
}
