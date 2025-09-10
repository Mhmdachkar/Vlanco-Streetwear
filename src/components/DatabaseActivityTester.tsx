import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Database, 
  ShoppingCart, 
  Heart, 
  Eye, 
  Search, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface DatabaseActivityTesterProps {
  onClose?: () => void;
}

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

const DatabaseActivityTester: React.FC<DatabaseActivityTesterProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { track, trackProduct, trackAddToCart, trackAddToWishlist } = useAnalytics();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const updateTestResult = (test: string, status: 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.test === test);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.data = data;
        return [...prev];
      } else {
        return [...prev, { test, status, message, data }];
      }
    });
  };

  const runComprehensiveTest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run database tests",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    
    console.log('🧪 Starting comprehensive database activity test...');

    // Test 1: Analytics Events
    try {
      setCurrentTest('Analytics Events');
      console.log('📊 Testing analytics_events table...');
      
      await track('test_event', { 
        test_type: 'comprehensive_test',
        timestamp: new Date().toISOString(),
        user_id: user.id
      });
      
      // Verify the event was recorded
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', 'test_event')
        .order('created_at', { ascending: false })
        .limit(1);

      if (analyticsError) throw analyticsError;
      
      updateTestResult('Analytics Events', 'success', 
        `✅ Event recorded successfully. Found ${analyticsData?.length || 0} records.`, 
        analyticsData?.[0]
      );
      
    } catch (error) {
      console.error('❌ Analytics test failed:', error);
      updateTestResult('Analytics Events', 'error', 
        `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test 2: Cart Items
    try {
      setCurrentTest('Cart Items');
      console.log('🛒 Testing cart_items table...');
      
      const testProduct = {
        product: {
          id: 'test_product_' + Date.now(),
          name: 'Test Product',
          base_price: 99,
          image_url: '/test-image.jpg',
          description: 'Test product for database verification',
          category: 'Test',
          brand: 'VLANCO'
        },
        variant: {
          id: 'test_variant_' + Date.now(),
          price: 99,
          color: 'Test Color',
          size: 'M',
          sku: 'TEST-SKU'
        },
        price: 99,
        quantity: 1
      };

      await addToCart(testProduct.product.id, testProduct.variant.id, 1, testProduct);
      
      // Verify the cart item was recorded
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', testProduct.product.id)
        .limit(1);

      if (cartError) throw cartError;
      
      updateTestResult('Cart Items', 'success', 
        `✅ Cart item recorded successfully. Found ${cartData?.length || 0} records.`, 
        cartData?.[0]
      );
      
    } catch (error) {
      console.error('❌ Cart test failed:', error);
      updateTestResult('Cart Items', 'error', 
        `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test 3: Wishlist Items
    try {
      setCurrentTest('Wishlist Items');
      console.log('❤️ Testing wishlist_items table...');
      
      const testWishlistItem = {
        id: 'test_wishlist_' + Date.now(),
        name: 'Test Wishlist Product',
        price: 149,
        image: '/test-wishlist-image.jpg',
        category: 'Test Category',
        description: 'Test wishlist item for database verification',
        rating: 4.5,
        reviews: 10,
        isLimited: false,
        isNew: true,
        colors: ['Black', 'White'],
        sizes: ['S', 'M', 'L']
      };

      await addToWishlist(testWishlistItem);
      
      // Verify the wishlist item was recorded
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', testWishlistItem.id)
        .limit(1);

      if (wishlistError) throw wishlistError;
      
      updateTestResult('Wishlist Items', 'success', 
        `✅ Wishlist item recorded successfully. Found ${wishlistData?.length || 0} records.`, 
        wishlistData?.[0]
      );
      
    } catch (error) {
      console.error('❌ Wishlist test failed:', error);
      updateTestResult('Wishlist Items', 'error', 
        `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test 4: Product Views
    try {
      setCurrentTest('Product Views');
      console.log('👁️ Testing product view tracking...');
      
      const testProductId = 'test_product_view_' + Date.now();
      await trackProduct(testProductId, {
        product_name: 'Test Product View',
        product_category: 'Test',
        product_price: 199,
        test_type: 'comprehensive_test'
      });
      
      // Verify product view was recorded in recently_viewed
      const { data: viewData, error: viewError } = await supabase
        .from('recently_viewed')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', testProductId)
        .limit(1);

      if (viewError) throw viewError;
      
      updateTestResult('Product Views', 'success', 
        `✅ Product view recorded successfully. Found ${viewData?.length || 0} records.`, 
        viewData?.[0]
      );
      
    } catch (error) {
      console.error('❌ Product view test failed:', error);
      updateTestResult('Product Views', 'error', 
        `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test 5: User Sessions
    try {
      setCurrentTest('User Sessions');
      console.log('👤 Testing user_sessions table...');
      
      const sessionId = `test_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error: sessionError } = await supabase
        .from('user_sessions')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          is_online: true,
          last_activity: new Date().toISOString(),
          current_page: '/test',
          user_agent: navigator.userAgent,
          login_time: new Date().toISOString()
        });

      if (sessionError) throw sessionError;
      
      // Verify the session was recorded
      const { data: sessionData, error: sessionQueryError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .limit(1);

      if (sessionQueryError) throw sessionQueryError;
      
      updateTestResult('User Sessions', 'success', 
        `✅ User session recorded successfully. Found ${sessionData?.length || 0} records.`, 
        sessionData?.[0]
      );
      
    } catch (error) {
      console.error('❌ User session test failed:', error);
      updateTestResult('User Sessions', 'error', 
        `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    setIsRunning(false);
    setCurrentTest('');
    
    console.log('🧪 Comprehensive database activity test completed!');
    
    const successCount = testResults.filter(r => r.status === 'success').length;
    const totalTests = testResults.length;
    
    toast({
      title: "Database Test Complete",
      description: `${successCount}/${totalTests} tests passed. Check console for details.`,
      duration: 5000
    });
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gray-900/95 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-cyan-400" />
            <CardTitle className="text-white">Database Activity Tester</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={runComprehensiveTest}
              disabled={isRunning || !user}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-purple-600 hover:to-cyan-500"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Run Comprehensive Test
                </>
              )}
            </Button>
            
            {!user && (
              <Badge variant="destructive" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Login Required
              </Badge>
            )}
          </div>

          {isRunning && currentTest && (
            <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Currently testing: {currentTest}</span>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <motion.div
                key={result.test}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-sm opacity-80 mb-2">{result.message}</p>
                
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer opacity-60 hover:opacity-80">
                      View Data
                    </summary>
                    <pre className="mt-2 p-2 bg-black/30 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </motion.div>
            ))}
          </div>

          {testResults.length > 0 && (
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Test Results Summary:</span>
                <div className="flex gap-4">
                  <span className="text-green-400">
                    ✅ {testResults.filter(r => r.status === 'success').length} Passed
                  </span>
                  <span className="text-red-400">
                    ❌ {testResults.filter(r => r.status === 'error').length} Failed
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DatabaseActivityTester;
