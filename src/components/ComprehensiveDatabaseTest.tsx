import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { trackEvent } from '@/services/analyticsService';
import { Play, CheckCircle, XCircle, Clock, RefreshCw, Database } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'running';
  message?: string;
  data?: any;
  duration?: number;
}

const ComprehensiveDatabaseTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { user } = useAuth();

  const runTest = async (name: string, testFn: () => Promise<any>): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      console.log(`🧪 Running test: ${name}`);
      const result = await testFn();
      const duration = Date.now() - startTime;
      console.log(`✅ Test passed: ${name}`, result);
      return {
        name,
        status: 'success',
        message: 'Test passed successfully',
        data: result,
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ Test failed: ${name}`, error);
      return {
        name,
        status: 'error',
        message: error.message || 'Unknown error',
        duration
      };
    }
  };

  const runAllTests = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to run database tests',
        variant: 'destructive'
      });
      return;
    }

    setTesting(true);
    setResults([]);

    const tests = [
      {
        name: 'Analytics Event Recording',
        test: async () => {
          // Track an event using the analytics service
          await trackEvent({
            userId: user.id,
            eventType: 'test_analytics_recording',
            eventData: { test: true, timestamp: new Date().toISOString() }
          });

          // Wait a moment for the event to be processed
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Query the database to verify the event was recorded
          const { data, error } = await supabase
            .from('analytics_events')
            .select('*')
            .eq('user_id', user.id)
            .eq('event_type', 'test_analytics_recording')
            .order('created_at', { ascending: false })
            .limit(1);

          if (error) throw error;
          if (!data || data.length === 0) {
            throw new Error('Analytics event was not recorded in database');
          }

          return { eventId: data[0].id, eventData: data[0] };
        }
      },
      {
        name: 'Cart Item Addition',
        test: async () => {
          // Add a test item to cart
          const testCartItem = {
            user_id: user.id,
            product_id: 'test_product_comprehensive',
            variant_id: 'test_variant_comprehensive',
            quantity: 1,
            price_at_time: 29.99,
            added_at: new Date().toISOString()
          };

          const { data: insertData, error: insertError } = await supabase
            .from('cart_items')
            .insert(testCartItem)
            .select()
            .single();

          if (insertError) throw insertError;

          // Verify the item exists in the database
          const { data: verifyData, error: verifyError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('id', insertData.id)
            .single();

          if (verifyError) throw verifyError;
          if (!verifyData) throw new Error('Cart item not found after insertion');

          // Clean up - remove the test item
          await supabase.from('cart_items').delete().eq('id', insertData.id);

          return { cartItemId: insertData.id, cartItem: verifyData };
        }
      },
      {
        name: 'User Session Tracking',
        test: async () => {
          // Create a user session record
          const sessionData = {
            user_id: user.id,
            session_start: new Date().toISOString(),
            user_agent: navigator.userAgent,
            ip_address: null, // Will be null from client side
            last_activity: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('user_sessions')
            .insert(sessionData)
            .select()
            .single();

          if (error) throw error;

          // Clean up
          await supabase.from('user_sessions').delete().eq('id', data.id);

          return { sessionId: data.id };
        }
      },
      {
        name: 'Recently Viewed Addition',
        test: async () => {
          // Add a recently viewed product
          const recentlyViewedData = {
            user_id: user.id,
            product_id: 'test_product_viewed',
            viewed_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('recently_viewed')
            .insert(recentlyViewedData)
            .select()
            .single();

          if (error) throw error;

          // Clean up
          await supabase.from('recently_viewed').delete().eq('id', data.id);

          return { viewId: data.id };
        }
      },
      {
        name: 'Wishlist Item Addition',
        test: async () => {
          // Add a wishlist item
          const wishlistData = {
            user_id: user.id,
            product_id: 'test_product_wishlist',
            added_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('wishlist_items')
            .insert(wishlistData)
            .select()
            .single();

          if (error) throw error;

          // Clean up
          await supabase.from('wishlist_items').delete().eq('id', data.id);

          return { wishlistId: data.id };
        }
      },
      {
        name: 'Search History Recording',
        test: async () => {
          // Add a search history record
          const searchData = {
            user_id: user.id,
            query: 'test search comprehensive',
            results_count: 5,
            created_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('search_history')
            .insert(searchData)
            .select()
            .single();

          if (error) throw error;

          // Clean up
          await supabase.from('search_history').delete().eq('id', data.id);

          return { searchId: data.id };
        }
      }
    ];

    // Initialize results
    const initialResults: TestResult[] = tests.map(test => ({
      name: test.name,
      status: 'pending'
    }));
    setResults(initialResults);

    const finalResults: TestResult[] = [];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      // Update status to running
      setResults(prev => prev.map((result, index) => 
        index === i ? { ...result, status: 'running' } : result
      ));
      
      const result = await runTest(test.name, test.test);
      finalResults.push(result);
      
      // Update with final result
      setResults(prev => prev.map((result, index) => 
        index === i ? finalResults[i] : result
      ));
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setTesting(false);

    // Summary
    const successCount = finalResults.filter(r => r.status === 'success').length;
    const totalCount = finalResults.length;
    
    console.log(`📊 Database Tests Complete: ${successCount}/${totalCount} passed`);
    
    toast({
      title: 'Database Tests Complete',
      description: `${successCount}/${totalCount} tests passed. ${successCount === totalCount ? 'All systems working!' : 'Some issues found.'}`,
      duration: 5000
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'running': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button 
          onClick={runAllTests}
          disabled={testing}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500"
        >
          {testing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Test Database Recording
            </>
          )}
        </Button>
        {!user && (
          <span className="text-sm text-yellow-400">Anonymous mode</span>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Database Recording Test Results</h3>
          
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <span className="font-medium text-white">{result.name}</span>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm ${getStatusColor(result.status)}`}>
                      {result.status === 'success' && '✅ Working'}
                      {result.status === 'error' && '❌ Failed'}
                      {result.status === 'running' && '⏳ Testing...'}
                      {result.status === 'pending' && '⏸️ Pending'}
                    </div>
                    {result.duration && (
                      <div className="text-xs text-gray-500">{result.duration}ms</div>
                    )}
                  </div>
                </div>
                
                {result.message && (
                  <div className={`text-xs p-2 rounded ${
                    result.status === 'error' 
                      ? 'text-red-400 bg-red-900/20' 
                      : 'text-green-400 bg-green-900/20'
                  }`}>
                    {result.message}
                  </div>
                )}
              </div>
            ))}
          </div>

          {results.length > 0 && results.every(r => r.status !== 'pending' && r.status !== 'running') && (
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Summary:</span>
                <div className="flex gap-4">
                  <span className="text-green-400">
                    ✅ {results.filter(r => r.status === 'success').length} Passed
                  </span>
                  <span className="text-red-400">
                    ❌ {results.filter(r => r.status === 'error').length} Failed
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComprehensiveDatabaseTest;
