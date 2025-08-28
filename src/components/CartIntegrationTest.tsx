import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Database,
  User,
  Package
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

interface CartIntegrationTestProps {
  className?: string;
}

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

const CartIntegrationTest: React.FC<CartIntegrationTestProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { 
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
    refetch 
  } = useCart();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [testProduct, setTestProduct] = useState<Tables<'products'> | null>(null);
  const [testVariant, setTestVariant] = useState<Tables<'product_variants'> | null>(null);

  // Fetch a test product and variant for testing
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        // Get a test product
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .limit(1);

        if (products && products.length > 0) {
          setTestProduct(products[0]);
          
          // Get a test variant for this product
          const { data: variants } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', products[0].id)
            .limit(1);

          if (variants && variants.length > 0) {
            setTestVariant(variants[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch test data:', error);
      }
    };

    fetchTestData();
  }, []);

  const runCartTests = async () => {
    if (!user || !testProduct || !testVariant) {
      setTestResults([{
        name: 'Prerequisites',
        status: 'error',
        message: 'User must be logged in and test data must be available'
      }]);
      return;
    }

    setTesting(true);
    const results: TestResult[] = [];

    try {
      // Test 1: Add item to cart
      results.push({
        name: 'Add to Cart',
        status: 'pending',
        message: 'Testing add to cart functionality...'
      });
      setTestResults([...results]);

      await addToCart(testProduct.id, testVariant.id, 1);
      
      // Wait a bit for the cart to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      results[0] = {
        name: 'Add to Cart',
        status: 'success',
        message: 'Item successfully added to cart',
        details: { productId: testProduct.id, variantId: testVariant.id }
      };
      setTestResults([...results]);

      // Test 2: Verify item appears in cart
      results.push({
        name: 'Cart State Update',
        status: 'pending',
        message: 'Verifying cart state updates...'
      });
      setTestResults([...results]);

      await refetch();
      
      if (hasItems && items.length > 0) {
        results[1] = {
          name: 'Cart State Update',
          status: 'success',
          message: `Cart updated successfully. Items: ${itemCount}, Total: $${total.toFixed(2)}`,
          details: { itemCount, total: total.toFixed(2) }
        };
      } else {
        results[1] = {
          name: 'Cart State Update',
          status: 'error',
          message: 'Cart state not updated after adding item',
          details: { hasItems, itemCount, total }
        };
      }
      setTestResults([...results]);

      // Test 3: Update quantity
      if (hasItems && items.length > 0) {
        const cartItem = items[0];
        results.push({
          name: 'Update Quantity',
          status: 'pending',
          message: 'Testing quantity update...'
        });
        setTestResults([...results]);

        const newQuantity = cartItem.quantity + 1;
        await updateQuantity(cartItem.id!, newQuantity);
        
        // Wait for update
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refetch();

        if (items.some(item => item.id === cartItem.id && item.quantity === newQuantity)) {
          results[2] = {
            name: 'Update Quantity',
            status: 'success',
            message: `Quantity updated successfully from ${cartItem.quantity} to ${newQuantity}`,
            details: { oldQuantity: cartItem.quantity, newQuantity }
          };
        } else {
          results[2] = {
            name: 'Update Quantity',
            status: 'error',
            message: 'Quantity update failed',
            details: { expected: newQuantity, actual: items.find(i => i.id === cartItem.id)?.quantity }
          };
        }
        setTestResults([...results]);
      }

      // Test 4: Remove item
      if (hasItems && items.length > 0) {
        const cartItem = items[0];
        results.push({
          name: 'Remove from Cart',
          status: 'pending',
          message: 'Testing remove from cart...'
        });
        setTestResults([...results]);

        await removeFromCart(cartItem.id!);
        
        // Wait for removal
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refetch();

        if (!items.some(item => item.id === cartItem.id)) {
          results[3] = {
            name: 'Remove from Cart',
            status: 'success',
            message: 'Item successfully removed from cart',
            details: { removedItemId: cartItem.id }
          };
        } else {
          results[3] = {
            name: 'Remove from Cart',
            status: 'error',
            message: 'Item removal failed',
            details: { itemStillExists: true }
          };
        }
        setTestResults([...results]);
      }

      // Test 5: Clear cart
      results.push({
        name: 'Clear Cart',
        status: 'pending',
        message: 'Testing clear cart functionality...'
      });
      setTestResults([...results]);

      await clearCart();
      
      // Wait for clear
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refetch();

      if (!hasItems && items.length === 0) {
        results[4] = {
          name: 'Clear Cart',
          status: 'success',
          message: 'Cart cleared successfully',
          details: { itemCount, hasItems }
        };
      } else {
        results[4] = {
          name: 'Clear Cart',
          status: 'error',
          message: 'Cart clear failed',
          details: { itemCount, hasItems }
        };
      }
      setTestResults([...results]);

      // Test 6: Database persistence
      results.push({
        name: 'Database Persistence',
        status: 'pending',
        message: 'Testing database persistence...'
      });
      setTestResults([...results]);

      // Add item again and check database
      await addToCart(testProduct.id, testVariant.id, 2);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: dbCartItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (dbCartItems && dbCartItems.length > 0) {
        results[5] = {
          name: 'Database Persistence',
          status: 'success',
          message: 'Cart items persisted to database successfully',
          details: { dbItemCount: dbCartItems.length }
        };
      } else {
        results[5] = {
          name: 'Database Persistence',
          status: 'error',
          message: 'Cart items not persisted to database',
          details: { dbItemCount: dbCartItems?.length || 0 }
        };
      }
      setTestResults([...results]);

    } catch (error) {
      console.error('Cart test failed:', error);
      results.push({
        name: 'Test Execution',
        status: 'error',
        message: 'Test execution failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      setTestResults([...results]);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'pending':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getOverallStatus = () => {
    if (testResults.length === 0) return 'pending';
    if (testResults.some(r => r.status === 'error')) return 'error';
    if (testResults.some(r => r.status === 'pending')) return 'pending';
    return 'success';
  };

  const overallStatus = getOverallStatus();

  if (!user) {
    return (
      <div className={`bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 ${className}`}>
        <div className="text-center py-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Authentication Required</h3>
          <p className="text-gray-400">Please log in to test cart functionality</p>
        </div>
      </div>
    );
  }

  if (!testProduct || !testVariant) {
    return (
      <div className={`bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 ${className}`}>
        <div className="text-center py-8">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Test Data Unavailable</h3>
          <p className="text-gray-400">No products or variants found for testing</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Cart Integration Test</h2>
            <p className="text-gray-400">Verify cart functionality with Supabase</p>
          </div>
        </div>
        <button
          onClick={runCartTests}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          {testing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {testing ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      {/* Current Cart Status */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Current Cart Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{itemCount}</div>
            <div className="text-sm text-gray-400">Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{items.length}</div>
            <div className="text-sm text-gray-400">Unique Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">${total.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{hasItems ? 'Yes' : 'No'}</div>
            <div className="text-sm text-gray-400">Has Items</div>
          </div>
        </div>
        {error && (
          <div className="mt-3 p-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
            Error: {error}
          </div>
        )}
      </div>

      {/* Test Product Info */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Test Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Product</p>
            <p className="text-white font-medium">{testProduct.name}</p>
            <p className="text-sm text-gray-300">ID: {testProduct.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Variant</p>
            <p className="text-white font-medium">
              {testVariant.size && `Size: ${testVariant.size}`}
              {testVariant.color && ` Color: ${testVariant.color}`}
            </p>
            <p className="text-sm text-gray-300">ID: {testVariant.id}</p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={`${result.name}-${index}`}
                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{result.name}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        result.status === 'success' ? 'bg-green-900/50 text-green-300' :
                        result.status === 'error' ? 'bg-red-900/50 text-red-300' :
                        'bg-yellow-900/50 text-yellow-300'
                      }`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                          View Details
                        </summary>
                        <pre className="text-xs text-gray-400 mt-1 bg-gray-900/50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Status */}
          <div className={`p-4 rounded-lg border ${
            overallStatus === 'success' ? 'border-green-500/30 bg-green-500/10' :
            overallStatus === 'error' ? 'border-red-500/30 bg-red-500/10' :
            'border-yellow-500/30 bg-yellow-500/10'
          }`}>
            <div className="flex items-center gap-3">
              {getStatusIcon(overallStatus)}
              <div>
                <h4 className="font-medium text-white">Overall Test Status</h4>
                <p className="text-sm text-gray-300">
                  {overallStatus === 'success' && 'All cart functionality tests passed successfully!'}
                  {overallStatus === 'error' && 'Some cart functionality tests failed. Check details above.'}
                  {overallStatus === 'pending' && 'Tests are still running or not yet started.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Test Controls */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Manual Test Controls</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => addToCart(testProduct.id, testVariant.id, 1)}
            disabled={testing}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Test Item
          </button>
          
          {hasItems && (
            <>
              <button
                onClick={() => updateQuantity(items[0].id!, items[0].quantity + 1)}
                disabled={testing}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Increase Quantity
              </button>
              
              <button
                onClick={() => removeFromCart(items[0].id!)}
                disabled={testing}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove Item
              </button>
              
              <button
                onClick={clearCart}
                disabled={testing}
                className="flex items-center gap-2 px-3 py-2 bg-red-800 hover:bg-red-900 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            </>
          )}
          
          <button
            onClick={refetch}
            disabled={testing}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartIntegrationTest;
