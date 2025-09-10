import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const DatabaseStatusChecker: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const checkWithTimeout = async <T,>(promise: Promise<T>, ms = 8000): Promise<T> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);
    try {
      // @ts-expect-error augment
      const res = await promise;
      clearTimeout(timeout);
      return res as T;
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  };

  const checkDatabaseStatus = async () => {
    setChecking(true);
    setResults([]);
    
    const tablesToCheck = [
      'analytics_events',
      'cart_items', 
      'wishlist_items',
      'products',
      'product_variants',
      'users',
      'user_sessions',
      'recently_viewed',
      'search_history',
      'orders',
      'notifications'
    ];

    const newResults: any[] = [];

    for (const table of tablesToCheck) {
      try {
        console.log(`🔍 Checking table: ${table}`);
        
        // Safer: request a lightweight id field with count (no HEAD)
        const { data, error, count } = await checkWithTimeout(
          supabase
            .from(table)
            .select('id', { count: 'exact' })
            .limit(1)
        );

        if (error) {
          console.error(`❌ Error checking ${table}:`, error);
          newResults.push({
            table,
            status: 'error',
            message: (error as any).message,
            code: (error as any).code,
            exists: false
          });
        } else {
          console.log(`✅ ${table}: exists (count: ${count ?? (data?.length || 0)})`);
          newResults.push({
            table,
            status: 'success',
            message: 'Table exists and is accessible',
            exists: true,
            count: count ?? (data?.length || 0)
          });
        }
      } catch (e: any) {
        console.error(`🚨 Exception/timeout checking ${table}:`, e);
        newResults.push({
          table,
          status: 'error',
          message: e?.message || 'Unknown error/timeout',
          exists: false
        });
      }
    }

    setResults(newResults);
    setChecking(false);

    // Summary
    const existingTables = newResults.filter(r => r.exists).length;
    const totalTables = newResults.length;
    
    console.log(`📊 Database Status: ${existingTables}/${totalTables} tables exist`);
    
    toast({
      title: `Database Status Check Complete`,
      description: `${existingTables}/${totalTables} tables exist and accessible`,
      duration: 5000
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button 
          onClick={checkDatabaseStatus}
          disabled={checking}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-cyan-600 hover:to-blue-500"
        >
          {checking ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Checking Database...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Check Database Status
            </>
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Database Tables Status</h3>
          
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <span className="font-medium text-white">{result.table}</span>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm ${getStatusColor(result.status)}`}>
                    {result.exists ? '✅ Exists' : '❌ Missing'}
                  </div>
                  {typeof result.count === 'number' && (
                    <div className="text-xs text-gray-500">count: {result.count}</div>
                  )}
                  {result.code && (
                    <div className="text-xs text-gray-500">Code: {result.code}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Summary:</span>
              <div className="flex gap-4">
                <span className="text-green-400">
                  ✅ {results.filter(r => r.exists).length} Existing
                </span>
                <span className="text-red-400">
                  ❌ {results.filter(r => !r.exists).length} Missing
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseStatusChecker;
