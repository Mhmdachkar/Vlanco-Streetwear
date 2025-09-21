import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface CartItem {
  id: string;
  user_id?: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price_at_time: number;
  added_at: string;
  product?: {
    id: string;
    name: string;
    base_price: number;
    image_url?: string;
    description?: string;
    category?: string;
    brand?: string;
    compare_price?: number;
  };
  variant?: {
    id: string;
    name?: string;
    price?: number;
    color?: string;
    size?: string;
    image_url?: string;
  };
}

// Get cart key for localStorage
export const getCartKey = (userId?: string): string => {
  return userId ? `vlanco_cart_${userId}` : 'vlanco_guest_cart';
};

// Get cart from localStorage
export const getLocalCart = (userId?: string): CartItem[] => {
  try {
    const cartKey = getCartKey(userId);
    const raw = localStorage.getItem(cartKey);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error parsing cart from localStorage:', error);
    return [];
  }
};

// Save cart to localStorage
export const saveLocalCart = (cart: CartItem[], userId?: string): void => {
  try {
    const cartKey = getCartKey(userId);
    localStorage.setItem(cartKey, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Add item to cart
export const addToCart = async (
  productDetails: {
    productId: string;
    variantId?: string;
    quantity: number;
    product?: any;
    variant?: any;
    price?: number;
  },
  userId?: string
): Promise<boolean> => {
  try {
    console.log('🔍 CartService - Adding to cart:', productDetails.productId, 'User:', userId || 'Guest');

    const currentCart = getLocalCart(userId);
    const { productId, variantId, quantity, product, variant, price } = productDetails;

    // Check if item already exists
    const existingIndex = currentCart.findIndex(
      item => item.product_id === productId && item.variant_id === variantId
    );

    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      // Update existing item
      updatedCart = [...currentCart];
      updatedCart[existingIndex].quantity += quantity;
      updatedCart[existingIndex].price_at_time = price || updatedCart[existingIndex].price_at_time;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `local_${Date.now()}_${Math.random()}`,
        user_id: userId || undefined,
        product_id: productId,
        variant_id: variantId,
        quantity,
        price_at_time: price || product?.base_price || product?.price || 0,
        added_at: new Date().toISOString(),
        product: product ? {
          id: product.id || productId,
          name: product.name || `Product ${productId}`,
          base_price: product.base_price || product.price || price || 0,
          image_url: product.image_url || product.image || '/src/assets/1.png',
          description: product.description || 'Streetwear product',
          category: product.category || 'Streetwear',
          brand: product.brand || 'VLANCO',
          compare_price: product.compare_price
        } : undefined,
        variant: variant ? {
          id: variant.id || variantId,
          name: variant.name,
          price: variant.price,
          color: variant.color,
          size: variant.size,
          image_url: variant.image_url
        } : undefined
      };

      updatedCart = [...currentCart, newItem];
    }

    // Save to localStorage
    saveLocalCart(updatedCart, userId);

    // For authenticated users, also save to Supabase
    if (userId) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .upsert({
            user_id: userId,
            product_id: productId,
            variant_id: variantId,
            quantity: existingIndex > -1 ? updatedCart[existingIndex].quantity : quantity,
            price_at_time: price || product?.base_price || product?.price || 0,
            added_at: new Date().toISOString()
          });

        if (error) {
          console.error('🔍 CartService - Supabase error:', error);
          // Continue with localStorage even if Supabase fails
        } else {
          console.log('🔍 CartService - Saved to Supabase successfully');
        }
      } catch (error) {
        console.error('🔍 CartService - Supabase error:', error);
        // Continue with localStorage even if Supabase fails
      }
    }

    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    // Show success message
    const productName = product?.name || `Product ${productId}`;
    toast({
      title: '🛒 Added to Cart',
      description: `${productName} has been added to your cart`,
      duration: 3000
    });

    console.log('✅ CartService - Item added successfully');
    return true;

  } catch (error) {
    console.error('🔍 CartService - Error adding to cart:', error);
    toast({
      title: 'Error',
      description: 'Failed to add item to cart',
      duration: 3000
    });
    return false;
  }
};

// Remove item from cart
export const removeFromCart = async (itemId: string, userId?: string): Promise<boolean> => {
  try {
    console.log('🔍 CartService - Removing item:', itemId, 'User:', userId || 'Guest');

    const currentCart = getLocalCart(userId);
    const updatedCart = currentCart.filter(item => item.id !== itemId);
    saveLocalCart(updatedCart, userId);

    // For authenticated users, also remove from Supabase
    if (userId) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId);

        if (error) {
          console.error('🔍 CartService - Supabase error:', error);
          // Continue even if Supabase fails
        } else {
          console.log('🔍 CartService - Removed from Supabase successfully');
        }
      } catch (error) {
        console.error('🔍 CartService - Supabase error:', error);
        // Continue even if Supabase fails
      }
    }

    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    toast({
      title: 'Removed from Cart',
      description: 'Item has been removed from your cart',
      duration: 2000
    });

    console.log('✅ CartService - Item removed successfully');
    return true;

  } catch (error) {
    console.error('🔍 CartService - Error removing from cart:', error);
    toast({
      title: 'Error',
      description: 'Failed to remove item from cart',
      duration: 3000
    });
    return false;
  }
};

// Update item quantity in cart
export const updateCartItemQuantity = async (
  itemId: string, 
  quantity: number, 
  userId?: string
): Promise<boolean> => {
  try {
    console.log('🔍 CartService - Updating quantity:', itemId, 'to', quantity, 'User:', userId || 'Guest');

    if (quantity <= 0) {
      return await removeFromCart(itemId, userId);
    }

    const currentCart = getLocalCart(userId);
    const updatedCart = currentCart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    saveLocalCart(updatedCart, userId);

    // For authenticated users, also update Supabase
    if (userId) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId)
          .eq('user_id', userId);

        if (error) {
          console.error('🔍 CartService - Supabase error:', error);
          // Continue even if Supabase fails
        } else {
          console.log('🔍 CartService - Updated in Supabase successfully');
        }
      } catch (error) {
        console.error('🔍 CartService - Supabase error:', error);
        // Continue even if Supabase fails
      }
    }

    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    console.log('✅ CartService - Quantity updated successfully');
    return true;

  } catch (error) {
    console.error('🔍 CartService - Error updating quantity:', error);
    toast({
      title: 'Error',
      description: 'Failed to update item quantity',
      duration: 3000
    });
    return false;
  }
};

// Clear cart
export const clearCart = async (userId?: string): Promise<void> => {
  try {
    // Clear localStorage
    saveLocalCart([], userId);

    // For authenticated users, also clear Supabase
    if (userId) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId);

        if (error) {
          console.error('🔍 CartService - Supabase error:', error);
        }
      } catch (error) {
        console.error('🔍 CartService - Supabase error:', error);
      }
    }

    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from your cart',
      duration: 2000
    });

  } catch (error) {
    console.error('🔍 CartService - Error clearing cart:', error);
  }
};

// Get cart count
export const getCartCount = (userId?: string): number => {
  return getLocalCart(userId).reduce((total, item) => total + item.quantity, 0);
};

// Get cart total
export const getCartTotal = (userId?: string): number => {
  return getLocalCart(userId).reduce((total, item) => total + (item.price_at_time * item.quantity), 0);
};

// Merge guest cart with user cart (for when user logs in)
export const mergeGuestCartWithUserCart = async (userId: string): Promise<void> => {
  try {
    const guestCart = getLocalCart(); // No userId = guest cart
    const userCart = getLocalCart(userId);

    if (guestCart.length === 0) {
      return; // Nothing to merge
    }

    // Merge guest cart items with user cart
    const mergedCart = [...userCart];

    guestCart.forEach(guestItem => {
      const existingItem = mergedCart.find(
        item => item.product_id === guestItem.product_id && item.variant_id === guestItem.variant_id
      );

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        mergedCart.push({
          ...guestItem,
          user_id: userId,
          id: `local_${Date.now()}_${Math.random()}` // Generate new ID
        });
      }
    });

    // Save merged cart
    saveLocalCart(mergedCart, userId);

    // Clear guest cart
    saveLocalCart([], undefined);

    // Save to Supabase
    try {
      for (const item of mergedCart) {
        const { error } = await supabase
          .from('cart_items')
          .upsert({
            user_id: userId,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price_at_time: item.price_at_time,
            added_at: item.added_at
          });

        if (error) {
          console.error('🔍 CartService - Supabase error during merge:', error);
        }
      }
    } catch (error) {
      console.error('🔍 CartService - Supabase error during merge:', error);
    }

    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    console.log('✅ CartService - Guest cart merged successfully');

  } catch (error) {
    console.error('🔍 CartService - Error merging carts:', error);
  }
};