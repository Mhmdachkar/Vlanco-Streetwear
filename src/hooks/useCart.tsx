import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/services/edgeFunctions';
import { trackCartEvent } from '@/services/analyticsService';

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
        .select(`
          *,
          product:products(*),
          variant:product_variants(*)
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Error fetching cart items:', fetchError);
        setError(fetchError.message);
        setItems([]);
        return;
      }

      console.log('📦 Raw cart items from Supabase:', data);
      console.log('📦 Number of items fetched:', data?.length || 0);

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
      console.log('🛒 Setting items to state, count:', itemsWithEnhancedDetails.length);
      
      // Ensure all cart items have complete product information
      const itemsWithDefaults = itemsWithEnhancedDetails.map(item => {
        // Check if we have database product/variant data
        const dbProduct = item.product;
        const dbVariant = item.variant;
        
        // Use database data first, then enhanced details, then defaults
        const completeItem = {
          ...item,
          product: {
            id: item.product_id,
            name: dbProduct?.name || item.product?.name || `Product ${item.product_id}`,
            base_price: dbProduct?.base_price || item.product?.base_price || item.price_at_time || 0,
            image_url: dbProduct?.image_url || item.product?.image_url || '/src/assets/product-1.jpg',
            description: dbProduct?.description || item.product?.description || 'Streetwear product',
            category: dbProduct?.category || item.product?.category || 'Streetwear',
            brand: dbProduct?.brand || item.product?.brand || 'VLANCO',
            ...dbProduct,
            ...item.product
          },
          variant: {
            id: item.variant_id,
            price: dbVariant?.price || item.variant?.price || item.price_at_time || 0,
            color: dbVariant?.color || item.variant?.color || 'Default',
            size: dbVariant?.size || item.variant?.size || 'M',
            sku: dbVariant?.sku || item.variant?.sku || `${item.product_id}-default`,
            stock_quantity: dbVariant?.stock_quantity || item.variant?.stock_quantity || 10,
            is_active: dbVariant?.is_active !== undefined ? dbVariant.is_active : true,
            ...dbVariant,
            ...item.variant
          }
        };
        
        console.log('🔗 Processed cart item:', {
          id: item.id,
          product_name: completeItem.product.name,
          variant_info: `${completeItem.variant.color} / ${completeItem.variant.size}`,
          price: completeItem.variant.price,
          quantity: item.quantity
        });
        
        return completeItem;
      });
      
      setItems(itemsWithDefaults);
      
      // Debug: Log what we're actually setting
      console.log('🔍 Final cart items being set:', itemsWithDefaults.map(item => ({
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        hasProduct: !!item.product,
        hasVariant: !!item.variant,
        productName: item.product?.name,
        variantColor: item.variant?.color,
        variantSize: item.variant?.size,
        price: item.variant?.price || item.product?.base_price
      })));
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
      
      // Track analytics
      await trackCartEvent({
        userId: user.id,
        eventType: 'remove_from_cart',
        productId: item.product_id,
        variantId: item.variant_id,
      });
      
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
    console.log('🔍 addToCart called with:', { 
      productId, 
      variantId, 
      quantity, 
      hasProductDetails: !!productDetails,
      productDetailsKeys: productDetails ? Object.keys(productDetails) : [],
      user: !!user,
      userId: user?.id 
    });
    
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
        // Ensure complete product details for guest cart
        const completeProduct = {
          id: productId,
          name: productDetails?.product?.name || `Product ${productId}`,
          base_price: productDetails?.product?.base_price || productDetails?.price || 0,
          image_url: productDetails?.product?.image_url || productDetails?.product?.image || '/src/assets/product-1.jpg',
          description: productDetails?.product?.description || 'Streetwear product',
          category: productDetails?.product?.category || 'Streetwear',
          brand: productDetails?.product?.brand || 'VLANCO',
          compare_price: productDetails?.product?.compare_price,
          ...productDetails?.product
        };
        
        const completeVariant = {
          id: variantId,
          price: productDetails?.variant?.price || productDetails?.price || 0,
          color: productDetails?.variant?.color || 'Default',
          size: productDetails?.variant?.size || 'M',
          sku: productDetails?.variant?.sku || `${productId}-default`,
          stock_quantity: productDetails?.variant?.stock_quantity || 10,
          is_active: true,
          ...productDetails?.variant
        };
        
        cart.push({ 
          id: `guest_${Date.now()}_${Math.random()}`, 
          product_id: productId, 
          variant_id: variantId, 
          quantity,
          price_at_time: productDetails?.price || 0,
          product: completeProduct,
          variant: completeVariant,
          added_at: new Date().toISOString()
        });
        console.log('📦 Added new item to guest cart with complete details:', { completeProduct, completeVariant });
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
        
        // Ensure complete product details for optimistic update
        const optimisticItem: any = {
          id: tempId,
          user_id: user.id,
          product_id: productId,
          variant_id: variantId,
          quantity,
          added_at: new Date().toISOString(),
          product: {
            id: productId,
            name: productDetails?.product?.name || `Product ${productId}`,
            base_price: productDetails?.product?.base_price || productDetails?.price || 0,
            image_url: productDetails?.product?.image_url || productDetails?.product?.image || '/src/assets/product-1.jpg',
            description: productDetails?.product?.description || 'Streetwear product',
            category: productDetails?.product?.category || 'Streetwear',
            brand: productDetails?.product?.brand || 'VLANCO',
            compare_price: productDetails?.product?.compare_price,
            ...productDetails.product
          },
          variant: {
            id: variantId,
            price: productDetails?.variant?.price || productDetails?.price || 0,
            color: productDetails?.variant?.color || 'Default',
            size: productDetails?.variant?.size || 'M',
            sku: productDetails?.variant?.sku || `${productId}-default`,
            stock_quantity: productDetails?.variant?.stock_quantity || 10,
            is_active: true,
            ...productDetails.variant
          }
        };
        
        console.log('🔄 Adding optimistic item with complete details:', optimisticItem);
        
        setItems(prev => {
          const next = [optimisticItem, ...prev];
          return next as CartItem[];
        });
        rollback = () => setItems(prev => prev.filter(i => (i as any).id !== tempId) as any);
      }

      // Test Supabase connectivity first
      console.log('🔍 Testing Supabase connectivity...');
      try {
        const { data: testData, error: testError } = await supabase
          .from('cart_items')
          .select('id')
          .limit(1);
        console.log('🔍 Connectivity test result:', { testData, testError });
      } catch (testErr) {
        console.error('🔍 Connectivity test failed:', testErr);
      }

      // Check if item already exists in cart
      console.log('🔍 Checking for existing item in cart...');
      console.log('🔍 Query params:', { user_id: user.id, product_id: productId, variant_id: variantId });
      
      let existingItem = null;
      let checkError = null;
      
      try {
        const result = await Promise.race([
          supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .eq('variant_id', variantId)
            .single(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 10000)
          )
        ]);
        
        existingItem = (result as any).data;
        checkError = (result as any).error;
      } catch (error) {
        console.error('🔍 Query failed or timed out:', error);
        checkError = error;
      }
      
      console.log('🔍 Existing item check result:', { existingItem, checkError });

      // If query failed, treat as no existing item and try to insert
      if (checkError && checkError.message !== 'No rows found') {
        console.warn('⚠️ Database query failed, treating as new item:', checkError);
        existingItem = null;
      }

      if (existingItem) {
        // Update existing item quantity
        console.log('📦 Updating existing item quantity');
        const currentQuantity = typeof (existingItem as any).quantity === 'number' ? (existingItem as any).quantity : 0;
        const newQuantity = currentQuantity + quantity;
        console.log('📦 Updating quantity from', currentQuantity, 'to', newQuantity);
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ 
            quantity: newQuantity,
          })
          .eq('id', (existingItem as any).id);

        if (updateError) {
          console.error('❌ Update error:', updateError);
          throw updateError;
        }
        console.log('✅ Item quantity updated successfully');
      } else {
        // Insert new item
        console.log('📦 Inserting new item into cart_items table');
        console.log('📦 Insert data:', {
          user_id: user.id,
          product_id: productId,
          variant_id: variantId,
          quantity,
          price_at_time: productDetails?.variant?.price || productDetails?.price || 0,
          added_at: new Date().toISOString(),
        });
        
        const { data: insertData, error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            variant_id: variantId,
            quantity,
            price_at_time: productDetails?.variant?.price || productDetails?.price || 0,
            added_at: new Date().toISOString(),
          })
          .select();

        if (insertError) {
          console.error('❌ Insert error:', insertError);
          throw insertError;
        }
        console.log('✅ Item inserted successfully:', insertData);
      }

      // Store enhanced details for this item (before refetch to ensure merge works)
      if (productDetails) {
        console.log('💾 Storing enhanced details');
        const enhancedDetails = getEnhancedDetails();
        const itemKey = `${productId}-${variantId}`;
        
        // Ensure we have complete product information
        const completeProductDetails = {
          product: {
            id: productId,
            name: productDetails.product?.name || `Product ${productId}`,
            base_price: productDetails.product?.base_price || productDetails.price || 0,
            image_url: productDetails.product?.image_url || productDetails.product?.image || '/src/assets/product-1.jpg',
            description: productDetails.product?.description || 'Streetwear product',
            category: productDetails.product?.category || 'Streetwear',
            brand: productDetails.product?.brand || 'VLANCO',
            ...productDetails.product
          },
          variant: {
            id: variantId,
            price: productDetails.variant?.price || productDetails.price || 0,
            color: productDetails.variant?.color || 'Default',
            size: productDetails.variant?.size || 'M',
            sku: productDetails.variant?.sku || `${productId}-default`,
            ...productDetails.variant
          }
        };
        
        (enhancedDetails as any)[itemKey] = completeProductDetails;
        setEnhancedDetails(enhancedDetails);
        console.log('💾 Stored complete product details:', completeProductDetails);
      }

      // Force refresh cart items and wait for completion
      console.log('🔄 Refreshing cart items after database operation...');
      await fetchCartItems();
      
      // Double-check that item was actually saved
      const { data: verifyData } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('variant_id', variantId);
      
      console.log('🔍 Verification check - items in DB:', verifyData?.length || 0);
      
      // Track analytics
      try {
        await trackCartEvent({
          userId: user.id,
          eventType: 'add_to_cart',
          productId,
          variantId,
          quantity,
          price: productDetails?.price,
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
      
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

  // Ensure user profile exists in database before using cart
  const ensureUserProfileExists = async (currentUser: any) => {
    try {
      console.log('🔍 Checking if user profile exists in database...');
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', currentUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error checking user profile:', fetchError);
        return;
      }

      if (!existingProfile) {
        console.log('📝 Creating missing user profile for cart functionality...');
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: currentUser.id,
            email: currentUser.email!,
            full_name: currentUser.user_metadata?.full_name || 
                      (currentUser.user_metadata?.first_name && currentUser.user_metadata?.last_name 
                        ? `${currentUser.user_metadata.first_name} ${currentUser.user_metadata.last_name}` 
                        : null) || null,
            phone: currentUser.user_metadata?.phone || null,
            avatar_url: currentUser.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('❌ Error creating user profile:', profileError);
        } else {
          console.log('✅ User profile created successfully for cart functionality');
        }
      } else {
        console.log('✅ User profile exists in database');
      }
    } catch (error) {
      console.error('❌ Failed to ensure user profile exists:', error);
    }
  };

  // Merge guest cart into Supabase cart on sign-in
  useEffect(() => {
    console.log('🔄 Cart initialization effect triggered, user:', !!user);
    
    if (user) {
      // First ensure user profile exists in database
      ensureUserProfileExists(user).then(() => {
        const guestCart = getLocalCart();
        console.log('🛒 Guest cart items:', guestCart);
        
        if (guestCart.length > 0) {
          console.log('🔄 Migrating guest cart to authenticated cart');
          
          // Store enhanced details for guest cart items before migration
          const enhancedDetails = getEnhancedDetails();
          guestCart.forEach(item => {
            const itemKey = `${item.product_id}-${item.variant_id}`;
            if (item.product || item.variant) {
              (enhancedDetails as any)[itemKey] = {
                product: item.product || {},
                variant: item.variant || {}
              };
            }
          });
          setEnhancedDetails(enhancedDetails);
          
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
            console.log('🔄 Guest cart migration complete, clearing guest cart');
            setLocalCart([]); // Clear guest cart after merge
            fetchCartItems();
          });
        } else {
          console.log('🔄 No guest cart to migrate, fetching authenticated cart');
          fetchCartItems();
        }
      });
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
}export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  // Fallback to local provider hook if no context (backward compatibility)
  return ctx ?? useProvideCart();
}




