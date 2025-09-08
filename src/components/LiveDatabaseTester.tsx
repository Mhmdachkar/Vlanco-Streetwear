import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  User, 
  Database, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  Activity
} from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

const LiveDatabaseTester: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, items: cartItems, removeFromCart } = useCart();
  const { addToWishlist, removeFromWishlist, items: wishlistItems } = useWishlist();
  const { toast } = useToast();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [realTimeData, setRealTimeData] = useState({
    cartCount: 0,
    wishlistCount: 0,
    userProfile: null as any,
    lastUpdated: new Date()
  });

  // Real-time data monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        loadRealTimeData();
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [user]);

  const loadRealTimeData = async () => {
    if (!user) return;

    try {
      // Get cart count
      const { count: cartCount } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get wishlist count (try both table names)
      let wishlistCount = 0;
      try {
        const { count } = await supabase
          .from('wishlist_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        wishlistCount = count || 0;
      } catch {
        const { count } = await supabase
          .from('wishlists')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        wishlistCount = count || 0;
      }

      // Get user profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setRealTimeData({
        cartCount: cartCount || 0,
        wishlistCount: wishlistCount || 0,
        userProfile,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error loading real-time data:', error);
    }
  };

  const addTestResult = (test: string, status: 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => [...prev, { test, status, message, data }]);
  };

  const runComprehensiveTests = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to run database tests',
        variant: 'destructive'
      });
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: User Profile Creation/Update
      addTestResult('User Profile', 'pending', 'Testing user profile in database...');
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, create profile
        console.log('Creating user profile for:', user.id, user.email);
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            first_name: user.user_metadata?.first_name || null,
            last_name: user.user_metadata?.last_name || null,
            phone: user.user_metadata?.phone || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            is_verified: user.email_confirmed_at ? true : false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (createError) {
          console.error('Failed to create user profile:', createError);
          addTestResult('User Profile', 'error', `Failed to create user profile: ${createError.message}`, createError);
        } else {
          console.log('User profile created successfully');
          addTestResult('User Profile', 'success', 'User profile created successfully');
          // Refresh real-time data
          loadRealTimeData();
        }
      } else if (userError) {
        console.error('User profile error:', userError);
        addTestResult('User Profile', 'error', `User profile error: ${userError.message}`, userError);
      } else {
        console.log('User profile exists:', userProfile);
        addTestResult('User Profile', 'success', 'User profile exists and accessible', userProfile);
      }

      // Test 2: Cart Functionality
      addTestResult('Cart Integration', 'pending', 'Testing cart database integration...');
      
      const testProduct = {
        id: 'test_product_1',
        name: 'Live Test Product',
        price: 99.99,
        image: '/src/assets/product-1.jpg'
      };

      const productDetails = {
        price: testProduct.price,
        product: {
          id: testProduct.id,
          name: testProduct.name,
          base_price: testProduct.price,
          image_url: testProduct.image,
          image: testProduct.image,
          category: 'Test',
          brand: 'VLANCO'
        },
        variant: {
          id: 'test_variant_1',
          product_id: testProduct.id,
          price: testProduct.price,
          color: 'Test Color',
          size: 'M',
          sku: 'test-product-1-m'
        }
      };

      try {
        await addToCart(testProduct.id, 'test_variant_1', 1, productDetails);
        
        // Verify in database
        const { data: cartItem, error: cartError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', testProduct.id)
          .single();

        if (cartError) {
          addTestResult('Cart Integration', 'error', `Cart database error: ${cartError.message}`);
        } else {
          addTestResult('Cart Integration', 'success', 'Cart item successfully added to database', cartItem);
          
          // Clean up test item
          await removeFromCart(cartItem.id);
          addTestResult('Cart Cleanup', 'success', 'Test cart item removed successfully');
        }
      } catch (error) {
        addTestResult('Cart Integration', 'error', `Cart integration failed: ${error}`);
      }

      // Test 3: Wishlist Functionality
      addTestResult('Wishlist Integration', 'pending', 'Testing wishlist database integration...');
      
      try {
        console.log('Testing wishlist integration...');
        await addToWishlist({
          id: 'test_wishlist_1',
          name: 'Live Test Wishlist Item',
          price: 79.99,
          image: '/src/assets/product-2.jpg',
          category: 'Test',
          addedAt: new Date().toISOString()
        });

        // Wait a moment for the database operation
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify in database (try both table names)
        let wishlistVerified = false;
        let wishlistData = null;
        let tableName = '';

        try {
          const { data, error } = await supabase
            .from('wishlist_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', 'test_wishlist_1');

          console.log('Wishlist items query result:', { data, error });
          
          if (!error && data && data.length > 0) {
            wishlistVerified = true;
            wishlistData = data[0];
            tableName = 'wishlist_items';
          }
        } catch (wishlistError) {
          console.log('wishlist_items table not found, trying wishlists...');
          
          try {
            const { data, error } = await supabase
              .from('wishlists')
              .select('*')
              .eq('user_id', user.id)
              .eq('product_id', 'test_wishlist_1');

            console.log('Wishlists query result:', { data, error });
            
            if (!error && data && data.length > 0) {
              wishlistVerified = true;
              wishlistData = data[0];
              tableName = 'wishlists';
            }
          } catch (wishlistsError) {
            console.error('Both wishlist tables failed:', wishlistsError);
          }
        }

        if (wishlistVerified) {
          addTestResult('Wishlist Integration', 'success', `Wishlist item successfully added to ${tableName} table`, wishlistData);
          
          // Clean up test item
          try {
            await removeFromWishlist('test_wishlist_1');
            addTestResult('Wishlist Cleanup', 'success', 'Test wishlist item removed successfully');
          } catch (cleanupError) {
            addTestResult('Wishlist Cleanup', 'error', `Cleanup failed: ${cleanupError}`);
          }
        } else {
          addTestResult('Wishlist Integration', 'error', 'Wishlist item not found in any wishlist table. Check if wishlist_items or wishlists table exists.');
        }
      } catch (error) {
        console.error('Wishlist integration test failed:', error);
        addTestResult('Wishlist Integration', 'error', `Wishlist integration failed: ${error}`);
      }

      // Test 4: Analytics Events
      addTestResult('Analytics Tracking', 'pending', 'Testing analytics event tracking...');
      
      try {
        console.log('Testing analytics tracking...');
        const { error: analyticsError } = await supabase
          .from('analytics_events')
          .insert({
            user_id: user.id,
            event_type: 'live_test',
            event_data: { test: 'database_integration_test' },
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString()
          });

        if (analyticsError) {
          console.error('Analytics error:', analyticsError);
          if (analyticsError.code === '42P01') {
            addTestResult('Analytics Tracking', 'error', 'Analytics table (analytics_events) does not exist. Please run the database migration.');
          } else {
            addTestResult('Analytics Tracking', 'error', `Analytics error: ${analyticsError.message}`, analyticsError);
          }
        } else {
          console.log('Analytics event tracked successfully');
          addTestResult('Analytics Tracking', 'success', 'Analytics event tracked successfully');
        }
      } catch (error) {
        console.error('Analytics tracking test failed:', error);
        addTestResult('Analytics Tracking', 'error', `Analytics tracking failed: ${error}`);
      }

      // Test 5: Database Tables Accessibility
      addTestResult('Table Access', 'pending', 'Testing database table accessibility...');
      
      const tables = ['users', 'cart_items', 'products', 'orders', 'reviews'];
      const tableResults = [];

      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('id')
            .limit(1);

          if (error) {
            tableResults.push(`${table}: ❌ ${error.message}`);
          } else {
            tableResults.push(`${table}: ✅ Accessible`);
          }
        } catch (error) {
          tableResults.push(`${table}: ❌ Error`);
        }
      }

      addTestResult('Table Access', 'success', 'Database table accessibility check completed', tableResults);

      toast({
        title: 'Database Tests Completed',
        description: 'All live database integration tests have been executed',
      });

    } catch (error) {
      addTestResult('Test Suite', 'error', `Test suite failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Database Monitor
          </CardTitle>
          <CardDescription>
            Real-time database synchronization status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{realTimeData.cartCount}</div>
              <div className="text-sm text-muted-foreground">Cart Items (DB)</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{realTimeData.wishlistCount}</div>
              <div className="text-sm text-muted-foreground">Wishlist Items (DB)</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <User className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{realTimeData.userProfile ? '✓' : '✗'}</div>
              <div className="text-sm text-muted-foreground">User Profile</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-xs font-mono">{realTimeData.lastUpdated.toLocaleTimeString()}</div>
              <div className="text-sm text-muted-foreground">Last Update</div>
            </div>
          </div>
          
          {user && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Current User:</h4>
              <div className="text-sm space-y-1">
                <div>Email: {user.email}</div>
                <div>ID: <span className="font-mono text-xs">{user.id}</span></div>
                <div>Profile in DB: {realTimeData.userProfile ? '✅ Yes' : '❌ No'}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Database Integration Tests</CardTitle>
          <CardDescription>
            Run comprehensive tests to verify live database synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runComprehensiveTests} 
            disabled={isRunning || !user}
            className="w-full"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Run Live Database Tests
              </>
            )}
          </Button>
          
          {!user && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Please sign in to run database tests
            </p>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Live database integration test results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-500 cursor-pointer">View Data</summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveDatabaseTester;
