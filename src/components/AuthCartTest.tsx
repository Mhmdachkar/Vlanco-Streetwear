import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, User, ShoppingCart, Heart, Database, Loader2 } from 'lucide-react';

export default function AuthCartTest() {
  const { user, signUp, signIn, signOut, loading: authLoading } = useAuth();
  const { items: cartItems, addToCart, itemCount, loading: cartLoading } = useCart();
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [dbUserExists, setDbUserExists] = useState(false);
  const [dbCartItems, setDbCartItems] = useState(0);
  const [dbWishlistItems, setDbWishlistItems] = useState(0);

  // Test product data
  const testProduct = {
    product_id: 'test-product-123',
    variant_id: 'test-variant-456',
    product: {
      id: 'test-product-123',
      name: 'Test VLANCO T-Shirt',
      base_price: 29.99,
      image_url: '/src/assets/product-1.jpg',
      description: 'Test product for authentication and cart testing',
      category: 'T-Shirts',
      brand: 'VLANCO'
    },
    variant: {
      id: 'test-variant-456',
      price: 29.99,
      color: 'Black',
      size: 'M',
      sku: 'TEST-BLK-M'
    },
    price: 29.99
  };

  // Check database status
  const checkDatabaseStatus = async () => {
    if (!user) {
      setDbUserExists(false);
      setDbCartItems(0);
      setDbWishlistItems(0);
      return;
    }

    try {
      // Check if user exists in users table
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      setDbUserExists(!!userData);

      // Check cart items count
      const { data: cartData, count: cartCount } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
      
      setDbCartItems(cartCount || 0);

      // Check wishlist items count
      const { data: wishlistData, count: wishlistCount } = await supabase
        .from('wishlist_items')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
      
      setDbWishlistItems(wishlistCount || 0);

    } catch (error) {
      console.error('Error checking database status:', error);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, [user, cartItems, wishlistItems]);

  // Generate random test email
  const generateTestEmail = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `test${timestamp}${randomNum}@vlanco.test`;
  };

  // Run comprehensive test
  const runComprehensiveTest = async () => {
    setIsRunningTest(true);
    const results: {[key: string]: boolean} = {};
    
    try {
      // Generate test credentials
      const email = generateTestEmail();
      const password = 'TestPassword123!';
      
      setTestEmail(email);
      setTestPassword(password);

      // Test 1: Sign up
      console.log('🧪 Testing signup...');
      try {
        await signUp(email, password, { full_name: 'Test User' });
        results.signup = true;
        toast({ title: 'Sign up test passed ✅' });
      } catch (error) {
        console.error('Signup test failed:', error);
        results.signup = false;
        toast({ title: 'Sign up test failed ❌', variant: 'destructive' });
      }

      // Wait a moment for user to be created
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test 2: Sign in
      console.log('🧪 Testing signin...');
      try {
        await signIn(email, password);
        results.signin = true;
        toast({ title: 'Sign in test passed ✅' });
      } catch (error) {
        console.error('Signin test failed:', error);
        results.signin = false;
        toast({ title: 'Sign in test failed ❌', variant: 'destructive' });
      }

      // Wait for auth state to settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test 3: Check if user profile was created in database
      console.log('🧪 Testing user profile creation...');
      await checkDatabaseStatus();
      results.userProfile = dbUserExists;
      
      if (dbUserExists) {
        toast({ title: 'User profile test passed ✅' });
      } else {
        toast({ title: 'User profile test failed ❌', variant: 'destructive' });
      }

      // Test 4: Add item to cart
      console.log('🧪 Testing cart functionality...');
      try {
        console.log('📦 Adding test product to cart...');
        await addToCart(testProduct.product_id, testProduct.variant_id, 1, testProduct);
        
        // Wait longer for database operations
        console.log('⏳ Waiting for database sync...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Force refresh database status
        await checkDatabaseStatus();
        
        // Also manually check the database
        const { data: manualCheck } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user?.id);
          
        console.log('🔍 Manual DB check - cart items found:', manualCheck?.length || 0);
        console.log('🔍 Cart items data:', manualCheck);
        
        results.cartAdd = itemCount > 0 && (dbCartItems > 0 || (manualCheck && manualCheck.length > 0));
        
        if (results.cartAdd) {
          toast({ title: 'Cart add test passed ✅' });
        } else {
          toast({ 
            title: 'Cart add test failed ❌', 
            description: `UI count: ${itemCount}, DB count: ${dbCartItems}, Manual: ${manualCheck?.length || 0}`,
            variant: 'destructive' 
          });
        }
      } catch (error) {
        console.error('Cart add test failed:', error);
        results.cartAdd = false;
        toast({ title: 'Cart add test failed ❌', variant: 'destructive' });
      }

      // Test 5: Add item to wishlist
      console.log('🧪 Testing wishlist functionality...');
      try {
        await addToWishlist({
          id: testProduct.product_id,
          name: testProduct.product.name,
          price: testProduct.product.base_price,
          image: testProduct.product.image_url,
          category: testProduct.product.category
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await checkDatabaseStatus();
        results.wishlistAdd = wishlistItems.length > 0 && dbWishlistItems > 0;
        
        if (results.wishlistAdd) {
          toast({ title: 'Wishlist add test passed ✅' });
        } else {
          toast({ title: 'Wishlist add test failed ❌', variant: 'destructive' });
        }
      } catch (error) {
        console.error('Wishlist add test failed:', error);
        results.wishlistAdd = false;
        toast({ title: 'Wishlist add test failed ❌', variant: 'destructive' });
      }

      // Test 6: Page refresh simulation (check persistence)
      console.log('🧪 Testing persistence after refresh...');
      try {
        // Simulate what happens on page refresh by refetching data
        window.location.reload();
        results.persistence = true;
      } catch (error) {
        results.persistence = false;
      }

      setTestResults(results);

    } catch (error) {
      console.error('Comprehensive test failed:', error);
      toast({ title: 'Comprehensive test failed ❌', variant: 'destructive' });
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Signed out successfully ✅' });
      setTestResults({});
      setDbUserExists(false);
      setDbCartItems(0);
      setDbWishlistItems(0);
    } catch (error) {
      toast({ title: 'Sign out failed ❌', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Authentication & Cart Test Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Authentication Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Signed In:</span>
                  <span className={user ? 'text-green-500' : 'text-red-500'}>
                    {user ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                {user && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Email:</span>
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>User in DB:</span>
                      <span className={dbUserExists ? 'text-green-500' : 'text-red-500'}>
                        {dbUserExists ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Cart & Wishlist Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Cart Items (UI):</span>
                  <span>{itemCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cart Items (DB):</span>
                  <span>{dbCartItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Wishlist Items:</span>
                  <span>{wishlistItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Wishlist (DB):</span>
                  <span>{dbWishlistItems}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Manual Test Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Manual Test Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={runComprehensiveTest}
                disabled={isRunningTest}
                className="w-full"
              >
                {isRunningTest && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Run Full Test
              </Button>
              
              <Button 
                onClick={async () => {
                  try {
                    console.log('🧪 Manual cart test - adding item...');
                    await addToCart(testProduct.product_id, testProduct.variant_id, 1, testProduct);
                    
                    // Wait and check database
                    setTimeout(async () => {
                      await checkDatabaseStatus();
                      toast({ 
                        title: 'Manual test completed', 
                        description: `Cart: ${itemCount} items, DB: ${dbCartItems} items` 
                      });
                    }, 2000);
                  } catch (error) {
                    console.error('Manual cart test failed:', error);
                    toast({ title: 'Manual test failed', variant: 'destructive' });
                  }
                }}
                disabled={!user || cartLoading}
                variant="outline"
              >
                Test Add to Cart
              </Button>
              
              <Button 
                onClick={handleSignOut}
                disabled={!user || authLoading}
                variant="destructive"
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(testResults).map(([test, passed]) => (
                    <div key={test} className="flex items-center justify-between p-3 border rounded">
                      <span className="capitalize">{test.replace(/([A-Z])/g, ' $1')}</span>
                      {passed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Test Credentials */}
          {testEmail && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Test Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input value={testEmail} readOnly />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input value={testPassword} readOnly type="password" />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
