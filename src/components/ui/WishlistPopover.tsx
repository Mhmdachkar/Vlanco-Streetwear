import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';

const WishlistPopover: React.FC = () => {
  const { items, itemCount } = useWishlist();
  const [localStorageItems, setLocalStorageItems] = useState<any[]>([]);
  const [wishlistUpdateTrigger, setWishlistUpdateTrigger] = useState(0);

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      setWishlistUpdateTrigger(prev => prev + 1);
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('storage', handleWishlistUpdate);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('storage', handleWishlistUpdate);
    };
  }, []);

  // Read from localStorage directly
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('vlanco_wishlist') || '[]');
    const guestWishlist = JSON.parse(localStorage.getItem('vlanco_guest_wishlist') || '[]');
    
    // Use the longer list (in case one is empty)
    const finalWishlist = savedWishlist.length > guestWishlist.length ? savedWishlist : guestWishlist;
    setLocalStorageItems(finalWishlist);
  }, [wishlistUpdateTrigger]);

  // Use localStorage items if hook items are empty, otherwise use hook items
  const displayItems = items && items.length > 0 ? items : localStorageItems;
  const displayCount = itemCount > 0 ? itemCount : localStorageItems.length;


  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="w-80 p-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4" />
          <span>Wishlist</span>
        </div>
        <div className="rounded-xl border border-border p-6 text-center bg-background/60">
          Your wishlist is empty
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 p-4">
      <div className="flex items-center justify-between mb-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span>Wishlist Preview</span>
        </div>
        <span className="text-xs text-muted-foreground">{displayCount} saved</span>
      </div>
      <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
        {displayItems.slice(0, 5).map((item) => (
          <motion.div key={item.id}
            className="flex items-center gap-3 rounded-lg border border-border p-2 bg-background/60"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-red-400/20 to-pink-500/10 rounded-md" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{item.name}</div>
              <div className="text-xs text-muted-foreground truncate">{item.category}</div>
            </div>
            <div className="text-sm font-semibold">${Number(item.price || 0).toFixed(2)}</div>
          </motion.div>
        ))}
      </div>
      <a href="/wishlist" className="mt-3 block text-center w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90">
        View wishlist
      </a>
    </div>
  );
};

export default WishlistPopover;


