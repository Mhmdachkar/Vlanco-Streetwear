import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const WishlistPopover: React.FC = () => {
  let items: any[] = [];
  try {
    const raw = localStorage.getItem('vlanco_wishlist');
    items = raw ? JSON.parse(raw) : [];
  } catch {}

  if (!items || items.length === 0) {
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
        <span className="text-xs text-muted-foreground">{items.length} saved</span>
      </div>
      <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
        {items.slice(0, 5).map((item) => (
          <motion.div key={item.id}
            className="flex items-center gap-3 rounded-lg border border-border p-2 bg-background/60"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400/20 to-pink-500/10 rounded-md" />
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


