import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  User, 
  Bell, 
  Eye,
  TrendingUp,
  Package,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useProducts } from '@/hooks/useProducts';
import { useReviews } from '@/hooks/useReviews';
import { useOrders } from '@/hooks/useOrders';
import { useNotifications } from '@/hooks/useNotifications';
import { useAnalytics } from '@/hooks/useAnalytics';
import LiveDatabaseTester from './LiveDatabaseTester';
import BackendFunctionTester from './BackendFunctionTester';
import DatabaseSetup from './DatabaseSetup';
import DatabaseActivityTester from './DatabaseActivityTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DatabaseIntegrationDemo: React.FC = () => {
  const { user } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const { addToCart, items: cartItems } = useCart();
  const { addToWishlist, items: wishlistItems } = useWishlist();
  const { orders, stats: orderStats } = useOrders();
  const { notifications, unreadCount } = useNotifications();
  const { 
    trackProduct, 
    trackAddToCart, 
    trackAddToWishlist,
    recentlyViewed,
    searchHistory 
  } = useAnalytics();

  const [testingFeature, setTestingFeature] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: 'success' | 'error' | 'pending' }>({});
  const [showActivityTester, setShowActivityTester] = useState(false);

  // Get first product for testing
  const testProduct = products[0];
  const { reviews, submitReview, loading: reviewsLoading } = useReviews(testProduct?.id?.toString() || '');

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    setTestingFeature(testName);
    setTestResults(prev => ({ ...prev, [testName]: 'pending' }));
    
    try {
      await testFn();
      setTestResults(prev => ({ ...prev, [testName]: 'success' }));
      toast({
        title: `✅ ${testName} Test Passed`,
        description: 'Database integration working correctly!',
      });
    } catch (error) {
      console.error(`${testName} test failed:`, error);
      setTestResults(prev => ({ ...prev, [testName]: 'error' }));
      toast({
        title: `❌ ${testName} Test Failed`,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setTestingFeature(null);
    }
  };

  const testCart = async () => {
    if (!testProduct) throw new Error('No test product available');
    
    await trackProduct(testProduct.id.toString(), { source: 'demo' });
    
    // Create complete product details for testing
    const productDetails = {
      price: testProduct.price,
      product: {
        id: testProduct.id.toString(),
        name: testProduct.name,
        base_price: testProduct.price,
        compare_price: testProduct.originalPrice,
        image_url: testProduct.image,
        image: testProduct.image,
        images: testProduct.images,
        description: testProduct.description,
        category: testProduct.category,
        brand: 'VLANCO',
        material: testProduct.specifications?.material,
        rating_average: testProduct.rating,
        rating_count: testProduct.reviews,
        size_options: testProduct.sizes,
        color_options: testProduct.colors?.map(c => c.name),
        tags: testProduct.tags,
        is_new_arrival: testProduct.isNew,
        is_bestseller: testProduct.isBestseller,
        stock_quantity: testProduct.inStock ? 10 : 0
      },
      variant: {
        id: 'variant_demo_1',
        product_id: testProduct.id.toString(),
        price: testProduct.price,
        color: testProduct.colors?.[0]?.name || 'Default',
        size: testProduct.sizes?.[0] || 'M',
        sku: `${testProduct.id}-demo-variant`,
        stock_quantity: 10,
        is_active: true
      }
    };
    
    console.log('🧪 Testing cart with product details:', productDetails);
    
    await addToCart(
      testProduct.id.toString(), 
      'variant_demo_1', 
      1,
      productDetails
    );
    
    await trackAddToCart(testProduct.id.toString(), 'variant_demo_1', 1, testProduct.price);
  };

  const testWishlist = async () => {
    if (!testProduct) throw new Error('No test product available');
    
    await addToWishlist({
      id: testProduct.id.toString(),
      name: testProduct.name,
      price: testProduct.price,
      image: testProduct.image,
      category: testProduct.category,
    });
    await trackAddToWishlist(testProduct.id.toString());
  };

  const testReview = async () => {
    if (!testProduct) throw new Error('No test product available');
    
    await submitReview({
      rating: 5,
      title: 'Great product!',
      comment: 'This is a test review from the integration demo.',
    });
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending' | undefined) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Database Integration Demo</h2>
            <p className="text-gray-400 mb-6">Please sign in to test database integrations</p>
            <Button>Sign In Required</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            🔥 Database Integration Demo
          </h1>
          <p className="text-xl text-gray-400">
            Testing all Supabase table connections in real-time
          </p>
        </motion.div>

        {/* Database Setup */}
        <div className="mb-12">
          <DatabaseSetup />
        </div>

        {/* Live Database Monitor */}
        <div className="mb-12">
          <LiveDatabaseTester />
        </div>

        {/* Backend Functions Tester */}
        <div className="mb-12">
          <BackendFunctionTester />
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShoppingCart className="w-4 h-4" />
                Cart Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cartItems.length}</div>
              <Badge variant="outline" className="mt-2">
                {cartItems.reduce((sum, item) => sum + (item as any).quantity, 0)} total items
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4" />
                Wishlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wishlistItems.length}</div>
              <Badge variant="outline" className="mt-2">
                items saved
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <Badge variant="outline" className="mt-2">
                ${orderStats?.totalSpent.toFixed(2) || '0.00'} spent
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bell className="w-4 h-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
              <Badge variant="outline" className="mt-2">
                {unreadCount} unread
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Test Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart Integration
                {getStatusIcon(testResults.cart)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                Test adding products to cart with Supabase sync
              </p>
              <Button 
                onClick={() => runTest('cart', testCart)}
                disabled={!testProduct || testingFeature === 'cart'}
                className="w-full"
              >
                {testingFeature === 'cart' ? 'Testing...' : 'Test Cart'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Wishlist Integration
                {getStatusIcon(testResults.wishlist)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                Test wishlist functionality with database persistence
              </p>
              <Button 
                onClick={() => runTest('wishlist', testWishlist)}
                disabled={!testProduct || testingFeature === 'wishlist'}
                className="w-full"
              >
                {testingFeature === 'wishlist' ? 'Testing...' : 'Test Wishlist'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Reviews Integration
                {getStatusIcon(testResults.reviews)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                Test product review submission and display
              </p>
              <Button 
                onClick={() => runTest('reviews', testReview)}
                disabled={!testProduct || testingFeature === 'reviews' || reviewsLoading}
                className="w-full"
              >
                {testingFeature === 'reviews' ? 'Testing...' : 'Test Review'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Recently Viewed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentlyViewed.length > 0 ? (
                <div className="space-y-2">
                  {recentlyViewed.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded" />
                      <div className="flex-1">
                        <div className="font-medium">Product {item.product_id}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(item.viewed_at!).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No recently viewed items</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Search History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchHistory.length > 0 ? (
                <div className="space-y-2">
                  {searchHistory.slice(0, 5).map((search) => (
                    <div key={search.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                      <div className="flex-1">
                        <div className="font-medium">"{search.query}"</div>
                        <div className="text-xs text-gray-400">
                          {search.results_count} results
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No search history</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Products Status */}
        <Card className="bg-gray-900 border-gray-800 mt-6">
          <CardHeader>
            <CardTitle>Products Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading products...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Loaded {products.length} products from database
                {products.length === 0 && (
                  <Badge variant="outline" className="ml-2">
                    Using mock data - run populate-database.sql
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Activity Tester */}
        <Card className="bg-gray-900 border-gray-800 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Activity Tester
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Comprehensive testing of all database operations including cart, wishlist, analytics, and user activities.
            </p>
            <Button 
              onClick={() => setShowActivityTester(true)}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-purple-600 hover:to-cyan-500"
            >
              <Activity className="w-4 h-4 mr-2" />
              Run Comprehensive Database Test
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Database Activity Tester Modal */}
      {showActivityTester && (
        <DatabaseActivityTester onClose={() => setShowActivityTester(false)} />
      )}
    </div>
  );
};

export default DatabaseIntegrationDemo;
