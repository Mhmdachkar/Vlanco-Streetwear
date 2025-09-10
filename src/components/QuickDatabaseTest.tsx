import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const QuickDatabaseTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const runQuickTest = async () => {
    setTesting(true);
    setResults([]);
    const testResults: string[] = [];

    try {
      console.log('🧪 Starting quick database test...');
      testResults.push('🧪 Starting quick database test...');

      // Test 1: Check Supabase client connection
      console.log('🔍 Testing Supabase client connection...');
      testResults.push('🔍 Testing Supabase client connection...');
      
      const { data: connectionTest, error: connectionError } = await supabase
        .from('analytics_events')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        console.error('❌ Connection test failed:', connectionError);
        testResults.push(`❌ Connection failed: ${connectionError.message}`);
        
        // Check if it's a table missing error
        if (connectionError.code === '42P01') {
          testResults.push('💡 Table does not exist - run migrations first');
        }
        
        // Check if it's a permission error
        if (connectionError.code === '42501') {
          testResults.push('💡 Permission denied - check RLS policies');
        }
      } else {
        console.log('✅ Connection test passed');
        testResults.push('✅ Connection test passed');
      }

      // Test 2: Try to insert a test record
      console.log('🔍 Testing direct insert to analytics_events...');
      testResults.push('🔍 Testing direct insert to analytics_events...');
      
      const testEvent = {
        user_id: null,
        event_type: 'quick_database_test',
        event_data: { test: true, timestamp: Date.now() },
        page_url: window.location.href,
        referrer: document.referrer || null,
        session_id: `test_${Date.now()}`,
        user_agent: navigator.userAgent,
        ip_address: null,
        created_at: new Date().toISOString()
      };

      const { data: insertData, error: insertError } = await supabase
        .from('analytics_events')
        .insert(testEvent)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert test failed:', insertError);
        testResults.push(`❌ Insert failed: ${insertError.message}`);
        
        // Specific error handling
        if (insertError.code === '42501') {
          testResults.push('💡 RLS policy is blocking inserts');
        }
        if (insertError.code === '23505') {
          testResults.push('💡 Duplicate key constraint');
        }
      } else {
        console.log('✅ Insert test passed:', insertData);
        testResults.push(`✅ Insert test passed - ID: ${insertData?.id || 'unknown'}`);
        
        // Clean up test record (if we have an ID)
        if (insertData?.id) {
          await supabase
            .from('analytics_events')
            .delete()
            .eq('id', insertData.id);
          testResults.push('🧹 Test record cleaned up');
        } else {
          testResults.push('⚠️ No ID returned, cleanup skipped');
        }
      }

      // Test 3: Test edge function
      console.log('🔍 Testing analytics-track edge function...');
      testResults.push('🔍 Testing analytics-track edge function...');
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke('analytics-track', {
        body: {
          event_type: 'function_test',
          event_data: { test: 'edge_function' },
          page_url: window.location.href,
          created_at: new Date().toISOString()
        }
      });

      if (functionError) {
        console.error('❌ Function test failed:', functionError);
        testResults.push(`❌ Function failed: ${functionError.message}`);
        
        if (functionError.message?.includes('404')) {
          testResults.push('💡 Function not deployed or URL incorrect');
        }
        if (functionError.message?.includes('401')) {
          testResults.push('💡 Authentication issue with function');
        }
      } else {
        console.log('✅ Function test passed:', functionData);
        testResults.push('✅ Function test passed');
      }

      // Test 4: Check environment variables
      console.log('🔍 Checking environment configuration...');
      testResults.push('🔍 Checking environment configuration...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl) {
        testResults.push('❌ VITE_SUPABASE_URL not found in environment');
      } else {
        testResults.push(`✅ Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
      }
      
      if (!supabaseAnonKey) {
        testResults.push('❌ VITE_SUPABASE_ANON_KEY not found in environment');
      } else {
        testResults.push(`✅ Supabase Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
      }

      console.log('🎉 Quick database test completed');
      testResults.push('🎉 Quick database test completed');

    } catch (error) {
      console.error('🚨 Quick test failed:', error);
      testResults.push(`🚨 Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setResults(testResults);
      setTesting(false);
      
      toast({
        title: "Quick Database Test Complete",
        description: "Check results below and console for details",
        duration: 5000
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button 
          onClick={runQuickTest}
          disabled={testing}
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500"
        >
          {testing ? (
            <>
              <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
              Testing Database...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Quick Database Test
            </>
          )}
        </Button>
      </div>
      
      {results.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
          <h3 className="text-sm font-semibold text-white mb-2">Test Results:</h3>
          <div className="space-y-1 text-xs font-mono">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`${
                  result.includes('✅') ? 'text-green-400' :
                  result.includes('❌') ? 'text-red-400' :
                  result.includes('💡') ? 'text-yellow-400' :
                  result.includes('🧹') ? 'text-blue-400' :
                  'text-gray-300'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickDatabaseTest;
