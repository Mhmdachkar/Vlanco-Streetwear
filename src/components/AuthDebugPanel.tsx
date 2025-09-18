import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { checkAuthConfig } from '@/utils/authConfig';
import AuthTest from './AuthTest';
import AuthStatus from './AuthStatus';
import { 
  Settings, 
  X, 
  TestTube, 
  User, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Key,
  Database
} from 'lucide-react';

export default function AuthDebugPanel() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'test' | 'config'>('status');
  const [authConfig, setAuthConfig] = useState(checkAuthConfig());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + A to open auth debug panel
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAuthConfig(checkAuthConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-4xl mx-4 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-cyan-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Authentication Debug Panel</h2>
                <p className="text-slate-400 text-sm">Debug and test authentication system</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            {[
              { id: 'status', label: 'Status', icon: User },
              { id: 'test', label: 'Test Suite', icon: TestTube },
              { id: 'config', label: 'Configuration', icon: Database }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === id
                    ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'status' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Status */}
                  <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      {loading ? (
                        <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
                      ) : user ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                      <h3 className="text-lg font-semibold text-white">User Status</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-300">
                        <span className="font-medium">Status:</span> {loading ? 'Loading...' : user ? 'Authenticated' : 'Not authenticated'}
                      </p>
                      {user && (
                        <>
                          <p className="text-slate-300">
                            <span className="font-medium">Email:</span> {user.email}
                          </p>
                          <p className="text-slate-300">
                            <span className="font-medium">ID:</span> {user.id}
                          </p>
                          <p className="text-slate-300">
                            <span className="font-medium">Created:</span> {new Date(user.created_at).toLocaleString()}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Configuration Status */}
                  <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      {authConfig.isConfigured ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <h3 className="text-lg font-semibold text-white">Configuration</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-300">
                        <span className="font-medium">Status:</span> {authConfig.isConfigured ? 'Configured' : 'Not configured'}
                      </p>
                      <p className="text-slate-300">
                        <span className="font-medium">URL:</span> {authConfig.hasValidUrl ? 'Valid' : 'Invalid'}
                      </p>
                      <p className="text-slate-300">
                        <span className="font-medium">Key:</span> {authConfig.hasValidKey ? 'Valid' : 'Invalid'}
                      </p>
                      {!authConfig.isConfigured && (
                        <div className="mt-3 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                          <p className="text-red-300 text-sm font-medium mb-2">Issues:</p>
                          <ul className="text-red-300 text-sm space-y-1">
                            {authConfig.errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAuthConfig(checkAuthConfig())}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh Status
                    </button>
                    <button
                      onClick={() => setActiveTab('test')}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
                    >
                      <TestTube className="w-4 h-4" />
                      Run Tests
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'test' && (
              <AuthTest isOpen={true} onClose={() => {}} />
            )}

            {activeTab === 'config' && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Environment Variables</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-slate-300 font-medium">VITE_SUPABASE_URL</p>
                        <p className="text-slate-400 text-sm">
                          {import.meta.env.VITE_SUPABASE_URL || 'Not set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-slate-300 font-medium">VITE_SUPABASE_ANON_KEY</p>
                        <p className="text-slate-400 text-sm">
                          {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Setup Instructions</h3>
                  <div className="space-y-3 text-slate-300">
                    <p>1. Create a Supabase project at <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">supabase.com</a></p>
                    <p>2. Get your project URL and anon key from Settings → API</p>
                    <p>3. Update your .env file with the credentials</p>
                    <p>4. Restart your development server</p>
                    <p>5. Test authentication using the Test Suite tab</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
