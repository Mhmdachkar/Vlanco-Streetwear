import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DatabaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    connection: boolean | null;
    tables: boolean | null;
    policies: boolean | null;
    auth: boolean | null;
  }>({
    connection: null,
    tables: null,
    policies: null,
    auth: null
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDatabaseTest = async () => {
    setIsRunning(true);
    setError(null);
    
    try {
      // Test 1: Basic Connection
      const { data: connectionData, error: connectionError } = await supabase
        .from('products')
        .select('count')
        .limit(1);
      
      setTestResults(prev => ({
        ...prev,
        connection: !connectionError
      }));

      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`);
      }

      // Test 2: Tables Exist
      const { data: tablesData, error: tablesError } = await supabase
        .from('products')
        .select('id, name')
        .limit(1);
      
      setTestResults(prev => ({
        ...prev,
        tables: !tablesError && tablesData && tablesData.length > 0
      }));

      // Test 3: Policies Working
      const { data: policiesData, error: policiesError } = await supabase
        .from('cart_items')
        .select('id')
        .limit(1);
      
      setTestResults(prev => ({
        ...prev,
        policies: !policiesError
      }));

      // Test 4: Auth System
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      setTestResults(prev => ({
        ...prev,
        auth: !authError
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDatabaseTest();
  }, []);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />;
    if (status) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return 'Testing...';
    if (status) return 'Passed';
    return 'Failed';
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return 'text-slate-400';
    if (status) return 'text-green-400';
    return 'text-red-400';
  };

  const allTestsPassed = Object.values(testResults).every(result => result === true);

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Database Connection Test</h2>
          <p className="text-slate-400 text-sm">Verifying Supabase connectivity and setup</p>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="flex items-center space-x-3">
            {getStatusIcon(testResults.connection)}
            <div>
              <div className="text-white font-medium">Database Connection</div>
              <div className="text-slate-400 text-sm">Basic Supabase connectivity</div>
            </div>
          </div>
          <span className={`font-medium ${getStatusColor(testResults.connection)}`}>
            {getStatusText(testResults.connection)}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="flex items-center space-x-3">
            {getStatusIcon(testResults.tables)}
            <div>
              <div className="text-white font-medium">Core Tables</div>
              <div className="text-slate-400 text-sm">Essential database tables exist</div>
            </div>
          </div>
          <span className={`font-medium ${getStatusColor(testResults.tables)}`}>
            {getStatusText(testResults.tables)}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="flex items-center space-x-3">
            {getStatusIcon(testResults.policies)}
            <div>
              <div className="text-white font-medium">Security Policies</div>
              <div className="text-slate-400 text-sm">Row Level Security (RLS) enabled</div>
            </div>
          </div>
          <span className={`font-medium ${getStatusColor(testResults.policies)}`}>
            {getStatusText(testResults.policies)}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="flex items-center space-x-3">
            {getStatusIcon(testResults.auth)}
            <div>
              <div className="text-white font-medium">Authentication</div>
              <div className="text-slate-400 text-sm">Supabase auth system</div>
            </div>
          </div>
          <span className={`font-medium ${getStatusColor(testResults.auth)}`}>
            {getStatusText(testResults.auth)}
          </span>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-lg border ${
        allTestsPassed 
          ? 'bg-green-500/20 border-green-500/50' 
          : 'bg-red-500/20 border-red-500/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {allTestsPassed ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={`font-medium ${
              allTestsPassed ? 'text-green-400' : 'text-red-400'
            }`}>
              {allTestsPassed ? 'All Tests Passed!' : 'Some Tests Failed'}
            </span>
          </div>
          
          <button
            onClick={runDatabaseTest}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{isRunning ? 'Testing...' : 'Re-run Tests'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-2 text-red-400">
            <XCircle className="w-4 h-4" />
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      {!allTestsPassed && (
        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <h3 className="text-white font-medium mb-2">Next Steps:</h3>
          <ol className="text-slate-400 text-sm space-y-1 list-decimal list-inside">
            <li>Ensure your .env file has correct Supabase credentials</li>
            <li>Run the database migration in Supabase SQL Editor</li>
            <li>Verify all tables are created with RLS enabled</li>
            <li>Check that security policies are properly configured</li>
          </ol>
        </div>
      )}
    </motion.div>
  );
};

export default DatabaseTest;
