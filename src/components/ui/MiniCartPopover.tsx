import React from 'react';
import { useCart } from '@/hooks/useCart';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

const MiniCartPopover: React.FC = () => {
  const { items, total, itemCount } = useCart();

  if (!items || items.length === 0) {
    return (
      <div className="w-80 p-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingBag className="w-4 h-4" />
          <span>Cart</span>
        </div>
        <div className="rounded-xl border border-border p-6 text-center bg-background/60">
          Your cart is empty
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 p-4">
      <div className="flex items-center justify-between mb-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShoppingBag className="w-4 h-4" />
          <span>Cart Preview</span>
        </div>
        <span className="text-xs text-muted-foreground">{itemCount} items</span>
      </div>
      <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
        {items.slice(0, 5).map((item: any) => (
          <motion.div key={item.id || `${item.product_id}-${item.variant_id}`}
            className="flex items-center gap-3 rounded-lg border border-border p-2 bg-background/60"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-purple-500/10 rounded-md" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{item.product?.name || `Product ${item.product_id}`}</div>
              <div className="text-xs text-muted-foreground">Qty {item.quantity}</div>
            </div>
            <div className="text-sm font-semibold">${((item.variant?.price || item.product?.base_price || item.price_at_time || 0) * item.quantity).toFixed(2)}</div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-semibold">${total.toFixed(2)}</span>
      </div>
      <a href="#" onClick={(e) => { e.preventDefault(); const btn = document.getElementById('cart-icon'); btn?.dispatchEvent(new MouseEvent('click', { bubbles: true })); }} className="mt-3 block text-center w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90">
        View cart
      </a>
    </div>
  );
};

export default MiniCartPopover;


