import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { checkAuthConfig, getAuthConfigStatus } from '@/utils/authConfig';
import { 
  CheckCircle, 
  AlertCircle, 
  User, 
  Settings, 
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface AuthStatusProps {
  showDetails?: boolean;
  className?: string;
}

export default function AuthStatus({ showDetails = false, className = '' }: AuthStatusProps) {
  const { user, loading } = useAuth();
  const [authConfig, setAuthConfig] = useState(checkAuthConfig());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setAuthConfig(checkAuthConfig());
  }, []);

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : user ? (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Authenticated</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            <User className="w-4 h-4" />
            <span className="text-sm">Guest</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
        ) : user ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <User className="w-4 h-4 text-slate-400" />
        )}
        <span className="text-sm text-white">
          {loading ? 'Loading...' : user ? 'Authenticated' : 'Guest'}
        </span>
        <Settings className="w-4 h-4 text-slate-400" />
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-full left-0 mt-2 w-80 bg-slate-800 rounded-lg border border-slate-700 shadow-xl z-50"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Authentication Status</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-full hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* User Status */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {user ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <User className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {user ? 'Signed In' : 'Not Signed In'}
                    </p>
                    {user && (
                      <p className="text-slate-400 text-sm">{user.email}</p>
                    )}
                  </div>
                </div>

                {/* Configuration Status */}
                <div className="flex items-center gap-3">
                  {authConfig.isConfigured ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {authConfig.isConfigured ? 'Configured' : 'Not Configured'}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {authConfig.isConfigured 
                        ? 'Authentication service is ready' 
                        : 'Environment variables need setup'
                      }
                    </p>
                  </div>
                </div>

                {/* Configuration Details */}
                {!authConfig.isConfigured && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-medium text-sm">Configuration Issues</span>
                    </div>
                    <ul className="text-red-300 text-sm space-y-1">
                      {authConfig.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                    <div className="mt-3">
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Setup Supabase
                      </a>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-3 border-t border-slate-700">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAuthConfig(checkAuthConfig());
                      }}
                      className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </button>
                    {!authConfig.isConfigured && (
                      <button
                        onClick={() => {
                          // Open setup script
                          window.open('setup-auth.ps1', '_blank');
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Settings className="w-3 h-3" />
                        Setup
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
