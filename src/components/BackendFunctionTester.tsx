import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Server, 
  Database, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  Zap,
  ShoppingCart,
  CreditCard,
  Bell,
  Star,
  BarChart3,
  Package
} from 'lucide-react';

interface EdgeFunctionTest {
  name: string;
  description: string;
  function: string;
  icon: React.ReactNode;
  status: 'idle' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
}

const BackendFunctionTester: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tests, setTests] = useState<EdgeFunctionTest[]>([
    {
      name: 'Analytics Tracking',
      description: 'Test analytics event tracking',
      function: 'analytics-track',
      icon: <BarChart3 className="h-4 w-4" />,
      status: 'idle'
    },
    {
      name: 'Cart Merge',
      description: 'Test cart merging functionality',
      function: 'cart-merge',
      icon: <ShoppingCart className="h-4 w-4" />,
      status: 'idle'
    },
    {
      name: 'Review Submission',
      description: 'Test review submission processing',
      function: 'reviews-submit',
      icon: <Star className="h-4 w-4" />,
      status: 'idle'
    },
    {
      name: 'Notification Queue',
      description: 'Test notification processing',
      function: 'notifications-enqueue',
      icon: <Bell className="h-4 w-4" />,
      status: 'idle'
    },
    {
      name: 'Inventory Sync',
      description: 'Test inventory synchronization',
      function: 'inventory-sync',
      icon: <Package className="h-4 w-4" />,
      status: 'idle'
    },
    {
      name: 'Discount Application',
      description: 'Test discount code processing',
      function: 'discounts-apply',
      icon: <CreditCard className="h-4 w-4" />,
      status: 'idle'
    }
  ]);

  const updateTestStatus = (functionName: string, status: EdgeFunctionTest['status'], result?: any, error?: string) => {
    setTests(prev => prev.map(test => 
      test.function === functionName 
        ? { ...test, status, result, error }
        : test
    ));
  };

  const testEdgeFunction = async (functionName: string, payload: any) => {
    try {
      updateTestStatus(functionName, 'running');
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) {
        throw error;
      }

      updateTestStatus(functionName, 'success', data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateTestStatus(functionName, 'error', null, errorMessage);
      throw error;
    }
  };

  const runAnalyticsTest = async () => {
    if (!user) throw new Error('User not authenticated');
    
    const payload = {
      user_id: user.id,
      event_type: 'backend_test',
      event_data: {
        test_name: 'analytics_tracking',
        timestamp: new Date().toISOString()
      }
    };

    return await testEdgeFunction('analytics-track', payload);
  };

  const runCartMergeTest = async () => {
    if (!user) throw new Error('User not authenticated');
    
    const payload = {
      user_id: user.id,
      guest_cart: [
        {
          product_id: 'test_product_1',
          variant_id: 'test_variant_1',
          quantity: 1
        }
      ]
    };

    return await testEdgeFunction('cart-merge', payload);
  };

  const runReviewTest = async () => {
    if (!user) throw new Error('User not authenticated');
    
    const payload = {
      user_id: user.id,
      product_id: 'test_product_1',
      rating: 5,
      title: 'Backend Test Review',
      comment: 'This is a test review from the backend function tester'
    };

    return await testEdgeFunction('reviews-submit', payload);
  };

  const runNotificationTest = async () => {
    if (!user) throw new Error('User not authenticated');
    
    const payload = {
      user_id: user.id,
      title: 'Backend Test Notification',
      message: 'This is a test notification from the backend function tester',
      type: 'info'
    };

    return await testEdgeFunction('notifications-enqueue', payload);
  };

  const runInventoryTest = async () => {
    const payload = {
      product_id: 'test_product_1',
      variant_id: 'test_variant_1',
      quantity_change: -1,
      operation: 'reserve'
    };

    return await testEdgeFunction('inventory-sync', payload);
  };

  const runDiscountTest = async () => {
    if (!user) throw new Error('User not authenticated');
    
    const payload = {
      user_id: user.id,
      code: 'TESTCODE',
      cart_total: 100.00
    };

    return await testEdgeFunction('discounts-apply', payload);
  };

  const getTestFunction = (functionName: string) => {
    switch (functionName) {
      case 'analytics-track':
        return runAnalyticsTest;
      case 'cart-merge':
        return runCartMergeTest;
      case 'reviews-submit':
        return runReviewTest;
      case 'notifications-enqueue':
        return runNotificationTest;
      case 'inventory-sync':
        return runInventoryTest;
      case 'discounts-apply':
        return runDiscountTest;
      default:
        return async () => { throw new Error('Test not implemented'); };
    }
  };

  const runSingleTest = async (test: EdgeFunctionTest) => {
    try {
      const testFunction = getTestFunction(test.function);
      await testFunction();
      
      toast({
        title: `✅ ${test.name} Test Passed`,
        description: 'Edge function is working correctly',
      });
    } catch (error) {
      console.error(`${test.name} test failed:`, error);
      toast({
        title: `❌ ${test.name} Test Failed`,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const runAllTests = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to run backend tests',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Running Backend Tests',
      description: 'Testing all edge functions...',
    });

    for (const test of tests) {
      await runSingleTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    toast({
      title: 'Backend Tests Completed',
      description: 'All edge function tests have been executed',
    });
  };

  const getStatusIcon = (status: EdgeFunctionTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: EdgeFunctionTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-600">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Backend Edge Functions Tester
          </CardTitle>
          <CardDescription>
            Test all Supabase edge functions to ensure backend functionality is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={runAllTests} disabled={!user} className="flex-1">
              <Zap className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>
            {!user && (
              <p className="text-sm text-muted-foreground flex items-center">
                Please sign in to run tests
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Individual Tests */}
      <div className="grid gap-4 md:grid-cols-2">
        {tests.map((test) => (
          <Card key={test.function}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {test.icon}
                  {test.name}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  {getStatusBadge(test.status)}
                </div>
              </CardTitle>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Function:</span> <code className="bg-muted px-1 rounded">{test.function}</code>
                </div>
                
                {test.error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    <strong>Error:</strong> {test.error}
                  </div>
                )}
                
                {test.result && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Result
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded overflow-auto text-xs">
                      {JSON.stringify(test.result, null, 2)}
                    </pre>
                  </details>
                )}
                
                <Button 
                  onClick={() => runSingleTest(test)} 
                  disabled={test.status === 'running' || !user}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {test.status === 'running' ? 'Testing...' : 'Test Function'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-400">
                {tests.filter(t => t.status === 'idle').length}
              </div>
              <div className="text-sm text-muted-foreground">Idle</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {tests.filter(t => t.status === 'running').length}
              </div>
              <div className="text-sm text-muted-foreground">Running</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {tests.filter(t => t.status === 'success').length}
              </div>
              <div className="text-sm text-muted-foreground">Success</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                {tests.filter(t => t.status === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">Error</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendFunctionTester;
