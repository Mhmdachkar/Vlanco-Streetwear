import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database, CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const SupabaseConnectionTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');

  const testConnection = async () => {
    setTesting(true);
    setResults([]);
    const testResults: string[] = [];

    try {
      console.log('🔌 Testing Supabase connection...');
      testResults.push('🔌 Testing Supabase connection...');

      // Test 1: Check if we can reach Supabase
      console.log('📡 Testing basic connectivity...');
      testResults.push('📡 Testing basic connectivity...');
      
      const startTime = Date.now();
      
      try {
        // Use a simple query that should work regardless of RLS
        const { data, error, status, statusText } = await Promise.race([
          supabase.from('analytics_events').select('id').limit(1),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
          )
        ]);

        const duration = Date.now() - startTime;
        console.log(`⏱️ Query completed in ${duration}ms`);
        testResults.push(`⏱️ Query completed in ${duration}ms`);

        if (error) {
          console.log('📊 Query error (expected):', error.message);
          testResults.push(`📊 Query error: ${error.message}`);
          
          // Analyze the error
          if (error.code === '42P01') {
            testResults.push('💡 Table does not exist - migrations needed');
            setConnectionStatus('connected'); // Connection works, just missing table
          } else if (error.code === '42501') {
            testResults.push('💡 Permission denied - RLS policy blocking');
            setConnectionStatus('connected'); // Connection works, just RLS blocking
          } else if (error.message?.includes('timeout') || error.message?.includes('network')) {
            testResults.push('❌ Network/timeout issue');
            setConnectionStatus('failed');
          } else {
            testResults.push('✅ Connection established (error is expected)');
            setConnectionStatus('connected');
          }
        } else {
          console.log('✅ Query successful:', data);
          testResults.push('✅ Query successful - full access');
          setConnectionStatus('connected');
        }

      } catch (connectionError: any) {
        console.error('❌ Connection failed:', connectionError);
        testResults.push(`❌ Connection failed: ${connectionError.message}`);
        
        if (connectionError.message?.includes('timeout')) {
          testResults.push('💡 Network timeout - check internet connection');
        } else if (connectionError.message?.includes('fetch')) {
          testResults.push('💡 Network error - check Supabase URL');
        }
        
        setConnectionStatus('failed');
      }

      // Test 2: Check environment variables
      console.log('🔧 Checking environment configuration...');
      testResults.push('🔧 Checking environment configuration...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl) {
        testResults.push('❌ VITE_SUPABASE_URL missing');
      } else {
        testResults.push(`✅ Supabase URL: ${supabaseUrl}`);
      }
      
      if (!supabaseAnonKey) {
        testResults.push('❌ VITE_SUPABASE_ANON_KEY missing');
      } else {
        testResults.push(`✅ Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
      }

      // Test 3: Test different table access
      console.log('🗃️ Testing table accessibility...');
      testResults.push('🗃️ Testing table accessibility...');
      
      const tables = ['users', 'products', 'cart_items', 'analytics_events'];
      
      for (const table of tables) {
        try {
          const { error } = await Promise.race([
            supabase.from(table).select('count').limit(0),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Table timeout')), 3000)
            )
          ]);
          
          if (error) {
            if (error.code === '42P01') {
              testResults.push(`❌ ${table}: Table does not exist`);
            } else if (error.code === '42501') {
              testResults.push(`⚠️ ${table}: RLS policy blocking`);
            } else {
              testResults.push(`✅ ${table}: Accessible (${error.message})`);
            }
          } else {
            testResults.push(`✅ ${table}: Fully accessible`);
          }
        } catch (tableError: any) {
          testResults.push(`❌ ${table}: ${tableError.message}`);
        }
      }

      testResults.push('🎉 Connection test completed');

    } catch (error: any) {
      console.error('🚨 Connection test failed:', error);
      testResults.push(`🚨 Test failed: ${error.message}`);
      setConnectionStatus('failed');
    } finally {
      setResults(testResults);
      setTesting(false);
      
      toast({
        title: "Connection Test Complete",
        description: `Status: ${connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'failed' ? 'Failed' : 'Unknown'}`,
        variant: connectionStatus === 'failed' ? 'destructive' : 'default',
        duration: 5000
      });
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-4 h-4 text-green-500" />;
      case 'failed': return <WifiOff className="w-4 h-4 text-red-500" />;
      default: return <Database className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button 
          onClick={testConnection}
          disabled={testing}
          className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-teal-600 hover:to-green-500"
        >
          {testing ? (
            <>
              <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              {getStatusIcon()}
              <span className="ml-2">Test Supabase Connection</span>
            </>
          )}
        </Button>
        
        {connectionStatus !== 'unknown' && (
          <div className={`flex items-center gap-1 ${getStatusColor()}`}>
            {connectionStatus === 'connected' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span className="text-sm capitalize">{connectionStatus}</span>
          </div>
        )}
      </div>
      
      {results.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
          <h3 className="text-sm font-semibold text-white mb-2">Connection Test Results:</h3>
          <div className="space-y-1 text-xs font-mono">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`${
                  result.includes('✅') ? 'text-green-400' :
                  result.includes('❌') ? 'text-red-400' :
                  result.includes('⚠️') ? 'text-yellow-400' :
                  result.includes('💡') ? 'text-blue-400' :
                  result.includes('⏱️') ? 'text-purple-400' :
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

export default SupabaseConnectionTest;
