import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import { trackWishlistEvent } from '@/services/analyticsService';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  compare_price?: number;
  image: string;
  images?: string[];
  category: string;
  addedAt: string;
  description?: string;
  rating?: number;
  reviews?: number;
  isLimited?: boolean;
  isNew?: boolean;
  colors?: string[];
  sizes?: string[];
}

export function useWishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: localStorage key
  const LOCAL_WISHLIST_KEY = 'vlanco_guest_wishlist';

  // Helper: get local wishlist
  const getLocalWishlist = () => {
    try {
      const raw = localStorage.getItem(LOCAL_WISHLIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // Helper: set local wishlist
  const setLocalWishlist = (wishlist: WishlistItem[]) => {
    localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(wishlist));
  };

  // Fetch wishlist items from Supabase
  const fetchWishlistItems = useCallback(async () => {
    if (!user) {
      setItems(getLocalWishlist());
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching wishlist items:', fetchError);
        setError(fetchError.message);
        setItems([]);
        return;
      }

      // Transform Supabase data to WishlistItem format
      const transformedItems = (data || []).map((item: any) => ({
        id: item.product_id,
        name: item.product?.name || 'Product',
        price: item.product?.base_price || 0,
        compare_price: item.product?.compare_price,
        image: item.product?.image_url || '/src/assets/1.png',
        images: item.product?.images || [],
        category: item.product?.category_id || 'Streetwear',
        addedAt: item.added_at || new Date().toISOString(),
        description: item.product?.description,
        rating: item.product?.rating_average || 4.5,
        reviews: item.product?.rating_count || 0,
        isLimited: item.product?.is_limited_edition || false,
        isNew: item.product?.is_new_arrival || false,
        colors: item.product?.color_options || ['Black', 'White'],
        sizes: item.product?.size_options || ['S', 'M', 'L', 'XL']
      }));

      setItems(transformedItems);
    } catch (error) {
      console.error('Exception fetching wishlist items:', error);
      setError('Failed to fetch wishlist items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add item to wishlist
  const addToWishlist = useCallback(async (item: Omit<WishlistItem, 'addedAt'>) => {
    console.log('🔍 useWishlist - addToWishlist called with item:', item);
    console.log('🔍 useWishlist - User:', user?.id || 'No user');
    
    if (!user) {
      console.log('🔍 useWishlist - Guest user, using localStorage');
      // Guest wishlist logic
      let wishlist = getLocalWishlist();
      const existingItem = wishlist.find(wishlistItem => wishlistItem.id === item.id);
      
      if (!existingItem) {
        wishlist.push({ ...item, addedAt: new Date().toISOString() });
        setLocalWishlist(wishlist);
        setItems(wishlist);
        // Dispatch event to update UI immediately
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
        toast({ 
          title: 'Added to Wishlist', 
          description: 'Item has been added to your wishlist',
          duration: 3000
        });
      }
      return;
    }

    // Supabase wishlist logic
    try {
      console.log('🔍 useWishlist - Authenticated user, using Supabase');
      setError(null);
      
      const insertData = {
        user_id: user.id,
        product_id: item.id,
        added_at: new Date().toISOString(),
      };
      
      console.log('🔍 useWishlist - Inserting to Supabase:', insertData);
      
      const { data: insertData_result, error: insertError } = await supabase
        .from('wishlist_items')
        .insert(insertData)
        .select();

      console.log('🔍 useWishlist - Supabase insert result:', insertData_result);
      
      if (insertError) {
        console.error('🔍 useWishlist - Supabase insert error:', insertError);
        console.error('🔍 useWishlist - Error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        throw insertError;
      }
      
      console.log('🔍 useWishlist - Supabase insert successful');
      
      console.log('🔍 useWishlist - Fetching wishlist items...');
      await fetchWishlistItems();
      
      // Dispatch event to update UI immediately
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      
      // Track analytics
      console.log('🔍 useWishlist - Tracking analytics...');
      await trackWishlistEvent({
        userId: user.id,
        eventType: 'add_to_wishlist',
        productId: item.id,
      });
      
      console.log('🔍 useWishlist - Showing success toast...');
      toast({ 
        title: 'Added to Wishlist', 
        description: 'Item has been added to your wishlist',
        duration: 3000
      });
      
      console.log('✅ useWishlist - addToWishlist completed successfully');
    } catch (error) {
      console.error('❌ useWishlist - Error adding to wishlist:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to wishlist';
      setError(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000
      });
    }
  }, [user, fetchWishlistItems]);

  // Remove item from wishlist
  const removeFromWishlist = useCallback(async (itemId: string) => {
    if (!user) {
      // Guest wishlist logic
      let wishlist = getLocalWishlist();
      const updatedWishlist = wishlist.filter(item => item.id !== itemId);
      setLocalWishlist(updatedWishlist);
      setItems(updatedWishlist);
      // Dispatch event to update UI immediately
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      toast({ 
        title: 'Removed from Wishlist', 
        description: 'Item has been removed from your wishlist',
        duration: 3000
      });
      return;
    }

    // Supabase wishlist logic
    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('product_id', itemId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      await fetchWishlistItems();
      
      // Dispatch event to update UI immediately
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      
      // Track analytics
      await trackWishlistEvent({
        userId: user.id,
        eventType: 'remove_from_wishlist',
        productId: itemId,
      });
      
      toast({ 
        title: 'Removed from Wishlist', 
        description: 'Item has been removed from your wishlist',
        duration: 3000
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item from wishlist';
      setError(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000
      });
    }
  }, [user, fetchWishlistItems]);

  // Clear entire wishlist
  const clearWishlist = useCallback(async () => {
    if (!user) {
      setLocalWishlist([]);
      setItems([]);
      toast({ 
        title: 'Wishlist Cleared', 
        description: 'Your wishlist has been cleared',
        duration: 3000
      });
      return;
    }

    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      setItems([]);
      toast({ 
        title: 'Wishlist Cleared', 
        description: 'Your wishlist has been cleared',
        duration: 3000
      });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear wishlist';
      setError(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000
      });
    }
  }, [user]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId: string) => {
    console.log('🔍 isInWishlist called with productId:', productId, 'type:', typeof productId);
    console.log('🔍 Current wishlist items:', items.map(item => ({ id: item.id, type: typeof item.id })));
    const result = items.some(item => String(item.id) === String(productId));
    console.log('🔍 isInWishlist result:', result);
    return result;
  }, [items]);

  // Merge guest wishlist into Supabase wishlist on sign-in
  useEffect(() => {
    if (user) {
      const guestWishlist = getLocalWishlist();
      if (guestWishlist.length > 0) {
        // For each item in guest wishlist, add to Supabase wishlist
        Promise.all(guestWishlist.map(async (item) => {
          try {
            await supabase.from('wishlist_items').upsert({
              user_id: user.id,
              product_id: item.id,
              added_at: item.addedAt,
            });
          } catch (error) {
            console.error('Failed to migrate guest wishlist item:', error);
          }
        })).then(() => {
          setLocalWishlist([]); // Clear guest wishlist after merge
          fetchWishlistItems();
        });
      } else {
        fetchWishlistItems();
      }
    } else {
      setItems(getLocalWishlist());
    }
  }, [user, fetchWishlistItems]);

  // Listen for localStorage changes to update wishlist count
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔍 useWishlist - localStorage changed, refreshing wishlist');
      if (!user) {
        // For guest users, update from localStorage
        const localWishlist = getLocalWishlist();
        console.log('🔍 useWishlist - Updated local wishlist:', localWishlist);
        setItems(localWishlist);
      }
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom storage events (from same tab)
    window.addEventListener('wishlistUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wishlistUpdated', handleStorageChange);
    };
  }, [user]);

  // Computed values
  const itemCount = items.length;
  const hasItems = items.length > 0;

  return {
    items,
    loading,
    error,
    itemCount,
    hasItems,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    refetch: fetchWishlistItems
  };
}
