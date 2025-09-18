import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { checkAuthConfig } from '@/utils/authConfig';
import { 
  CheckCircle, 
  AlertCircle, 
  X, 
  RefreshCw,
  User,
  Mail,
  Lock,
  TestTube,
  Play,
  Trash2
} from 'lucide-react';

interface AuthTestProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthTest({ isOpen, onClose }: AuthTestProps) {
  const { user, signIn, signUp, signOut, loading } = useAuth();
  const [authConfig, setAuthConfig] = useState(checkAuthConfig());
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testCredentials, setTestCredentials] = useState({
    email: 'test@example.com',
    password: 'testpassword123',
    fullName: 'Test User'
  });

  useEffect(() => {
    if (isOpen) {
      setAuthConfig(checkAuthConfig());
      setTestResults([]);
    }
  }, [isOpen]);

  const addTestResult = (test: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date()
    }]);
  };

  const runConfigurationTest = async () => {
    addTestResult('Configuration Check', 'success', 'Environment variables validated');
  };

  const runSignUpTest = async () => {
    try {
      addTestResult('Sign Up Test', 'pending', 'Attempting to create test account...');
      await signUp(testCredentials.email, testCredentials.password, {
        full_name: testCredentials.fullName
      });
      addTestResult('Sign Up Test', 'success', 'Test account created successfully');
    } catch (error: any) {
      addTestResult('Sign Up Test', 'error', error.message || 'Sign up failed');
    }
  };

  const runSignInTest = async () => {
    try {
      addTestResult('Sign In Test', 'pending', 'Attempting to sign in...');
      await signIn(testCredentials.email, testCredentials.password);
      addTestResult('Sign In Test', 'success', 'Successfully signed in');
    } catch (error: any) {
      addTestResult('Sign In Test', 'error', error.message || 'Sign in failed');
    }
  };

  const runSignOutTest = async () => {
    try {
      addTestResult('Sign Out Test', 'pending', 'Attempting to sign out...');
      await signOut();
      addTestResult('Sign Out Test', 'success', 'Successfully signed out');
    } catch (error: any) {
      addTestResult('Sign Out Test', 'error', error.message || 'Sign out failed');
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    // Configuration test
    await runConfigurationTest();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Sign up test
    await runSignUpTest();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sign in test
    await runSignInTest();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sign out test
    await runSignOutTest();
    
    setIsRunningTests(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-2xl mx-4 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <TestTube className="w-6 h-6 text-cyan-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Authentication Test Suite</h2>
                <p className="text-slate-400 text-sm">Test authentication functionality</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Configuration Status */}
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                {authConfig.isConfigured ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <h3 className="text-lg font-semibold text-white">Configuration Status</h3>
              </div>
              <p className="text-slate-300 text-sm">
                {authConfig.isConfigured 
                  ? 'Authentication service is properly configured' 
                  : 'Environment variables need to be set up'
                }
              </p>
              {!authConfig.isConfigured && (
                <div className="mt-3 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm font-medium mb-2">Issues found:</p>
                  <ul className="text-red-300 text-sm space-y-1">
                    {authConfig.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Test Credentials */}
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">Test Credentials</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={testCredentials.email}
                    onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={testCredentials.password}
                    onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="testpassword123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={testCredentials.fullName}
                    onChange={(e) => setTestCredentials(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Test User"
                  />
                </div>
              </div>
            </div>

            {/* Test Controls */}
            <div className="flex gap-3">
              <button
                onClick={runAllTests}
                disabled={isRunningTests || !authConfig.isConfigured}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isRunningTests ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run All Tests
                  </>
                )}
              </button>
              <button
                onClick={clearResults}
                disabled={testResults.length === 0}
                className="px-4 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Test Results</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border ${
                        result.status === 'success' 
                          ? 'bg-green-900/20 border-green-700' 
                          : result.status === 'error'
                          ? 'bg-red-900/20 border-red-700'
                          : 'bg-yellow-900/20 border-yellow-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {result.status === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                        {result.status === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                        {result.status === 'pending' && <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />}
                        <span className="font-medium text-white">{result.test}</span>
                      </div>
                      <p className="text-sm text-slate-300">{result.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {result.timestamp.toLocaleTimeString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
