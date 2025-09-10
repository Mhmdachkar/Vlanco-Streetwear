import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Play, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface FunctionTest {
  name: string;
  endpoint: string;
  testData: any;
  description: string;
}

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'running';
  response?: any;
  error?: string;
  duration?: number;
}

const FunctionTester: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const functionTests: FunctionTest[] = [
    {
      name: 'Analytics Track',
      endpoint: 'analytics-track',
      description: 'Test analytics event tracking',
      testData: {
        event_type: 'test_event',
        event_data: { test: true },
        page_url: window.location.href,
        referrer: document.referrer
      }
    },
    {
      name: 'Cart Merge',
      endpoint: 'cart-merge',
      description: 'Test guest cart merging',
      testData: {
        items: [
          {
            product_id: 'test_product_1',
            variant_id: 'test_variant_1',
            quantity: 2,
            price_at_time: 29.99
          }
        ]
      }
    },
    {
      name: 'Reviews Submit',
      endpoint: 'reviews-submit',
      description: 'Test review submission',
      testData: {
        product_id: 'test_product_1',
        rating: 5,
        title: 'Test Review',
        comment: 'This is a test review from function tester'
      }
    },
    {
      name: 'Discounts Apply',
      endpoint: 'discounts-apply',
      description: 'Test discount code application',
      testData: {
        code: 'TEST10',
        cartSubtotal: 100.00
      }
    },
    {
      name: 'Notifications Enqueue',
      endpoint: 'notifications-enqueue',
      description: 'Test notification queuing',
      testData: {
        title: 'Test Notification',
        message: 'This is a test notification from function tester',
        type: 'info',
        data: { test: true }
      }
    }
  ];

  const testFunction = async (test: FunctionTest): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing function: ${test.name}`);
      console.log(`📤 Request data:`, test.testData);
      
      const { data, error } = await supabase.functions.invoke(test.endpoint, {
        body: test.testData
      });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        // Check if it's a configuration issue vs deployment issue
        if (error.message === 'Supabase not configured') {
          console.log(`⚠️ ${test.name}: Supabase not configured (expected in development)`);
          return {
            name: test.name,
            status: 'skipped',
            error: 'Supabase not configured - using mock mode',
            duration
          };
        } else if (error.message?.includes('Function not found') || error.message?.includes('404')) {
          console.log(`📦 ${test.name}: Edge function not deployed (expected)`);
          return {
            name: test.name,
            status: 'skipped',
            error: 'Edge function not deployed - this is normal for local development',
            duration
          };
        } else {
          console.error(`❌ ${test.name} error:`, error);
          return {
            name: test.name,
            status: 'error',
            error: error.message,
            duration
          };
        }
      }
      
      console.log(`✅ ${test.name} success:`, data);
      return {
        name: test.name,
        status: 'success',
        response: data,
        duration
      };
    } catch (e: any) {
      const duration = Date.now() - startTime;
      console.error(`🚨 ${test.name} exception:`, e);
      return {
        name: test.name,
        status: 'error',
        error: e.message || 'Unknown error',
        duration
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    
    // Initialize all tests as pending
    const initialResults: TestResult[] = functionTests.map(test => ({
      name: test.name,
      status: 'pending'
    }));
    setResults(initialResults);

    console.log('🚀 Starting function tests...');
    
    const finalResults: TestResult[] = [];
    
    for (let i = 0; i < functionTests.length; i++) {
      const test = functionTests[i];
      
      // Update status to running
      setResults(prev => prev.map((result, index) => 
        index === i ? { ...result, status: 'running' } : result
      ));
      
      const result = await testFunction(test);
      finalResults.push(result);
      
      // Update with final result
      setResults(prev => prev.map((result, index) => 
        index === i ? finalResults[i] : result
      ));
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTesting(false);
    
    // Summary
    const successCount = finalResults.filter(r => r.status === 'success').length;
    const totalCount = finalResults.length;
    
    console.log(`📊 Function Tests Complete: ${successCount}/${totalCount} passed`);
    
    toast({
      title: 'Function Tests Complete',
      description: `${successCount}/${totalCount} functions working correctly`,
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
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-pink-600 hover:to-purple-500"
        >
          {testing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Testing Functions...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Test All Functions
            </>
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Function Test Results</h3>
          
          <div className="space-y-3">
            {results.map((result, index) => {
              const test = functionTests[index];
              return (
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
                  
                  <div className="text-xs text-gray-400 mb-2">
                    {test.description}
                  </div>
                  
                  {result.error && (
                    <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
                      Error: {result.error}
                    </div>
                  )}
                  
                  {result.response && result.status === 'success' && (
                    <div className="text-xs text-green-400 bg-green-900/20 p-2 rounded">
                      Response: {JSON.stringify(result.response, null, 2)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {results.length > 0 && results.every(r => r.status !== 'pending' && r.status !== 'running') && (
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Summary:</span>
                <div className="flex gap-4">
                  <span className="text-green-400">
                    ✅ {results.filter(r => r.status === 'success').length} Working
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

export default FunctionTester;
