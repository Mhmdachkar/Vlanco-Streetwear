import React from 'react';
import { motion } from 'framer-motion';
import { Database, ShoppingCart, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import DatabaseTest from '@/components/DatabaseTest';
import CartIntegrationTest from '@/components/CartIntegrationTest';

const DatabaseTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Database & Cart Integration Test</h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Comprehensive testing of Supabase database connectivity, table existence, and cart functionality
          </p>
        </motion.div>

        {/* Test Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
            <Database className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Database Connectivity</h3>
            <p className="text-gray-400">
              Test all Supabase tables, functions, and security policies
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
            <ShoppingCart className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Cart Integration</h3>
            <p className="text-gray-400">
              Verify cart functionality with real-time Supabase operations
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Real-time Testing</h3>
            <p className="text-gray-400">
              Live testing with actual database operations and state management
            </p>
          </div>
        </motion.div>

        {/* Test Components */}
        <div className="space-y-8">
          {/* Database Test */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DatabaseTest />
          </motion.div>

          {/* Cart Integration Test */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CartIntegrationTest />
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-6 bg-gray-800/50 border border-gray-700 rounded-xl"
        >
          <h3 className="text-xl font-bold text-white mb-4">Testing Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-2">Database Test</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Click "Run Test" to verify all database connections</li>
                <li>• Check table existence and connectivity</li>
                <li>• Verify RLS policies and security</li>
                <li>• Test database functions and triggers</li>
                <li>• Review any missing tables or migration requirements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Cart Integration Test</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Ensure you're logged in to test cart functionality</li>
                <li>• Click "Run Tests" to execute automated cart tests</li>
                <li>• Use manual controls to test specific operations</li>
                <li>• Verify real-time state updates and persistence</li>
                <li>• Check database synchronization and error handling</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Troubleshooting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-yellow-900/20 border border-yellow-700 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-yellow-300">Troubleshooting</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-yellow-200 mb-2">Common Issues</h4>
              <ul className="text-yellow-100 text-sm space-y-1">
                <li>• Missing environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)</li>
                <li>• Database migrations not run (check supabase/migrations folder)</li>
                <li>• RLS policies blocking access (verify user authentication)</li>
                <li>• Network connectivity issues to Supabase</li>
                <li>• Incorrect project configuration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-200 mb-2">Solutions</h4>
              <ul className="text-yellow-100 text-sm space-y-1">
                <li>• Verify .env file contains correct Supabase credentials</li>
                <li>• Run database migrations: supabase db push</li>
                <li>• Check Supabase dashboard for RLS policy status</li>
                <li>• Test Supabase connection in browser console</li>
                <li>• Verify project is active and billing is current</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Success Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-6 bg-green-900/20 border border-green-700 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-green-300">Success Indicators</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-200 mb-2">Database Test Success</h4>
              <ul className="text-green-100 text-sm space-y-1">
                <li>• All tables show "Connected successfully" status</li>
                <li>• Functions execute without errors</li>
                <li>• Security policies working correctly</li>
                <li>• Overall status shows "SUCCESS"</li>
                <li>• No missing tables reported</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-200 mb-2">Cart Test Success</h4>
              <ul className="text-green-100 text-sm space-y-1">
                <li>• All automated tests pass</li>
                <li>• Cart state updates in real-time</li>
                <li>• Database persistence working</li>
                <li>• Error handling functioning properly</li>
                <li>• Overall test status shows "SUCCESS"</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DatabaseTestPage;
