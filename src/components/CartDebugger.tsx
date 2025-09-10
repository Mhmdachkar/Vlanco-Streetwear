import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const CartDebugger: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, items, itemCount, total } = useCart();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testAddToCart = async () => {
    console.log('🧪 Testing add to cart...');
    
    try {
      // Test with a simple product
      const testProduct = {
        price: 25.99,
        product: {
          id: 'test-product-1',
          name: 'Test T-Shirt',
          base_price: 25.99,
          image_url: '/src/assets/product-1.jpg',
          description: 'Test product for debugging',
          category: 'T-Shirts',
          brand: 'VLANCO'
        },
        variant: {
          id: 'test-variant-1',
          price: 25.99,
          color: 'Black',
          size: 'M',
          sku: 'TEST-001-BLACK-M',
          stock_quantity: 10,
          is_active: true
        }
      };

      console.log('🛒 Calling addToCart with test data:', testProduct);
      await addToCart('test-product-1', 'test-variant-1', 1, testProduct);
      
      toast({
        title: '✅ Test Add to Cart',
        description: 'Test product added to cart successfully!',
        duration: 3000
      });
    } catch (error) {
      console.error('❌ Test add to cart failed:', error);
      toast({
        title: '❌ Test Failed',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  const checkCartItems = async () => {
    if (!user) {
      toast({
        title: '⚠️ Not Logged In',
        description: 'Please log in to check cart items',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('🔍 Checking cart items in Supabase...');
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching cart items:', error);
        setDebugInfo({ error: error.message });
        toast({
          title: '❌ Database Error',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      console.log('📦 Cart items from database:', data);
      setDebugInfo({ 
        cartItems: data,
        localItems: items,
        itemCount,
        total,
        userId: user.id
      });

      toast({
        title: '📊 Cart Debug Info',
        description: `Found ${data?.length || 0} items in database`,
        duration: 3000
      });
    } catch (error) {
      console.error('❌ Error checking cart:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const clearCart = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: '🧹 Cart Cleared',
        description: 'All items removed from cart',
        duration: 3000
      });
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      toast({
        title: '❌ Clear Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 border border-slate-700 rounded-lg p-4 max-w-md z-50">
      <h3 className="text-white font-bold mb-3">🛒 Cart Debugger</h3>
      
      <div className="space-y-2 mb-4">
        <div className="text-sm text-slate-300">
          <strong>User:</strong> {user ? user.email : 'Not logged in'}
        </div>
        <div className="text-sm text-slate-300">
          <strong>Local Items:</strong> {itemCount} (${total.toFixed(2)})
        </div>
        <div className="text-sm text-slate-300">
          <strong>Items Array:</strong> {items.length} items
        </div>
      </div>

      <div className="space-y-2">
        <Button 
          onClick={testAddToCart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          🧪 Test Add to Cart
        </Button>
        
        <Button 
          onClick={checkCartItems}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          🔍 Check Database
        </Button>
        
        <Button 
          onClick={clearCart}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          size="sm"
        >
          🧹 Clear Cart
        </Button>
      </div>

      {debugInfo && (
        <div className="mt-4 p-3 bg-slate-800 rounded text-xs text-slate-300 max-h-40 overflow-y-auto">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default CartDebugger;
