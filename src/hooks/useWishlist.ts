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
        image: item.product?.image_url || '/src/assets/product-1.jpg',
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
    if (!user) {
      // Guest wishlist logic
      let wishlist = getLocalWishlist();
      const existingItem = wishlist.find(wishlistItem => wishlistItem.id === item.id);
      
      if (!existingItem) {
        wishlist.push({ ...item, addedAt: new Date().toISOString() });
        setLocalWishlist(wishlist);
        setItems(wishlist);
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
      setError(null);
      
      const { error: insertError } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: item.id,
          added_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
      
      await fetchWishlistItems();
      
      // Track analytics
      await trackWishlistEvent({
        userId: user.id,
        eventType: 'add_to_wishlist',
        productId: item.id,
      });
      
      toast({ 
        title: 'Added to Wishlist', 
        description: 'Item has been added to your wishlist',
        duration: 3000
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
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
    return items.some(item => item.id === productId);
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
