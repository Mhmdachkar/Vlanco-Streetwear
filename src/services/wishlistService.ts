import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  compare_price?: number;
  image: string;
  images?: string[];
  category: string;
  description?: string;
  rating?: number;
  reviews?: number;
  isLimited?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  colors?: string[];
  sizes?: string[];
  material?: string;
  brand?: string;
  collection?: string;
  tags?: string[];
  features?: string[];
  availability?: string;
  shipping?: string;
  addedAt: string;
}

// Unified localStorage key for wishlist
const WISHLIST_KEY = 'vlanco_wishlist';

// Get wishlist from localStorage
export const getLocalWishlist = (): WishlistItem[] => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error parsing wishlist from localStorage:', error);
    return [];
  }
};

// Save wishlist to localStorage
export const saveLocalWishlist = (wishlist: WishlistItem[]): void => {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  } catch (error) {
    console.error('Error saving wishlist to localStorage:', error);
  }
};

// Check if item is in wishlist
export const isInWishlist = (productId: string): boolean => {
  const wishlist = getLocalWishlist();
  return wishlist.some(item => item.id === productId);
};

// Add item to wishlist (works for both authenticated and guest users)
export const addToWishlist = async (item: Omit<WishlistItem, 'addedAt'>, userId?: string): Promise<boolean> => {
  try {
    console.log('🔍 WishlistService - Adding item:', item.name, 'User:', userId || 'Guest');

    // Check if item already exists
    const currentWishlist = getLocalWishlist();
    const existingItem = currentWishlist.find(wishlistItem => wishlistItem.id === item.id);
    
    if (existingItem) {
      console.log('🔍 WishlistService - Item already in wishlist');
      toast({
        title: 'Already in Wishlist',
        description: `${item.name} is already in your wishlist`,
        duration: 2000
      });
      return false;
    }

    // Create wishlist item with timestamp
    const wishlistItem: WishlistItem = {
      ...item,
      addedAt: new Date().toISOString()
    };

    // For authenticated users, also save to Supabase
    if (userId) {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .insert({
            user_id: userId,
            product_id: item.id,
            added_at: wishlistItem.addedAt
          });

        if (error) {
          console.error('🔍 WishlistService - Supabase error:', error);
          // Continue with localStorage even if Supabase fails
        } else {
          console.log('🔍 WishlistService - Saved to Supabase successfully');
        }
      } catch (error) {
        console.error('🔍 WishlistService - Supabase error:', error);
        // Continue with localStorage even if Supabase fails
      }
    }

    // Save to localStorage (works for both authenticated and guest users)
    const updatedWishlist = [wishlistItem, ...currentWishlist];
    saveLocalWishlist(updatedWishlist);

    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));

    // Show success message
    toast({
      title: '💖 Added to Wishlist',
      description: `${item.name} has been added to your wishlist`,
      duration: 3000
    });

    console.log('✅ WishlistService - Item added successfully');
    return true;

  } catch (error) {
    console.error('🔍 WishlistService - Error adding to wishlist:', error);
    toast({
      title: 'Error',
      description: 'Failed to add item to wishlist',
      duration: 3000
    });
    return false;
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (productId: string, userId?: string): Promise<boolean> => {
  try {
    console.log('🔍 WishlistService - Removing item:', productId, 'User:', userId || 'Guest');

    // Remove from localStorage
    const currentWishlist = getLocalWishlist();
    const updatedWishlist = currentWishlist.filter(item => item.id !== productId);
    saveLocalWishlist(updatedWishlist);

    // For authenticated users, also remove from Supabase
    if (userId) {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) {
          console.error('🔍 WishlistService - Supabase error:', error);
          // Continue even if Supabase fails
        } else {
          console.log('🔍 WishlistService - Removed from Supabase successfully');
        }
      } catch (error) {
        console.error('🔍 WishlistService - Supabase error:', error);
        // Continue even if Supabase fails
      }
    }

    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));

    // Show success message
    toast({
      title: 'Removed from Wishlist',
      description: 'Item has been removed from your wishlist',
      duration: 2000
    });

    console.log('✅ WishlistService - Item removed successfully');
    return true;

  } catch (error) {
    console.error('🔍 WishlistService - Error removing from wishlist:', error);
    toast({
      title: 'Error',
      description: 'Failed to remove item from wishlist',
      duration: 3000
    });
    return false;
  }
};

// Toggle wishlist item (add if not present, remove if present)
export const toggleWishlistItem = async (item: Omit<WishlistItem, 'addedAt'>, userId?: string): Promise<boolean> => {
  const isCurrentlyInWishlist = isInWishlist(item.id);
  
  if (isCurrentlyInWishlist) {
    return await removeFromWishlist(item.id, userId);
  } else {
    return await addToWishlist(item, userId);
  }
};

// Clear wishlist
export const clearWishlist = async (userId?: string): Promise<void> => {
  try {
    // Clear localStorage
    saveLocalWishlist([]);

    // For authenticated users, also clear Supabase
    if (userId) {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', userId);

        if (error) {
          console.error('🔍 WishlistService - Supabase error:', error);
        }
      } catch (error) {
        console.error('🔍 WishlistService - Supabase error:', error);
      }
    }

    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));

    toast({
      title: 'Wishlist Cleared',
      description: 'All items have been removed from your wishlist',
      duration: 2000
    });

  } catch (error) {
    console.error('🔍 WishlistService - Error clearing wishlist:', error);
  }
};

// Get wishlist count
export const getWishlistCount = (): number => {
  return getLocalWishlist().length;
};

// Migrate old wishlist keys to unified key
export const migrateWishlistData = (): void => {
  const oldKeys = [
    'vlanco_guest_wishlist',
    'vlanco_hardcoded_wishlist'
  ];

  let migratedItems: WishlistItem[] = [];

  oldKeys.forEach(key => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const items = JSON.parse(raw);
        migratedItems = [...migratedItems, ...items];
        localStorage.removeItem(key); // Remove old key
      }
    } catch (error) {
      console.error(`Error migrating wishlist key ${key}:`, error);
    }
  });

  // Remove duplicates and merge with current wishlist
  const currentWishlist = getLocalWishlist();
  const allItems = [...migratedItems, ...currentWishlist];
  const uniqueItems = allItems.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  );

  if (migratedItems.length > 0) {
    saveLocalWishlist(uniqueItems);
    console.log('🔍 WishlistService - Migrated', migratedItems.length, 'items to unified wishlist');
  }
};
