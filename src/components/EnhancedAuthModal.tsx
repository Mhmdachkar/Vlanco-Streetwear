import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { checkAuthConfig } from '@/utils/authConfig';
import { 
  X, Mail, Lock, User, Eye, EyeOff, 
  AlertCircle, CheckCircle, Loader2,
  ArrowLeft, ArrowRight
} from 'lucide-react';

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export default function EnhancedAuthModal({ 
  isOpen, 
  onClose, 
  defaultMode = 'signin' 
}: EnhancedAuthModalProps) {
  const { signIn, signUp, user, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authConfig, setAuthConfig] = useState(checkAuthConfig());
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setShowPassword(false);
      setErrors({});
      setFormData({
        email: '',
        password: '',
        fullName: '',
        username: '',
      });
      setAuthConfig(checkAuthConfig());
    }
  }, [isOpen]);

  // Close modal if user is authenticated
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Full name validation for signup
    if (mode === 'signup' && !formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Check authentication configuration
    if (!authConfig.isConfigured) {
      toast({
        title: "⚠️ Configuration Error",
        description: "Authentication service is not properly configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('🔄 EnhancedAuthModal: Starting authentication...', { mode, email: formData.email });
      
      if (mode === 'signin') {
        await signIn(formData.email, formData.password);
        console.log('✅ EnhancedAuthModal: Sign in successful');
        toast({
          title: "🎉 Welcome back!",
          description: "You've successfully signed in.",
        });
      } else {
        await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          username: formData.username,
        });
        console.log('✅ EnhancedAuthModal: Sign up successful');
        toast({
          title: "🎉 Account created!",
          description: "Please check your email to verify your account.",
        });
      }
      
      // Reset form and close modal
      setFormData({
        email: '',
        password: '',
        fullName: '',
        username: '',
      });
      setErrors({});
      onClose();
      
    } catch (error: any) {
      console.error('❌ EnhancedAuthModal: Authentication failed:', error);
      
      // Enhanced error handling
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.message.includes('User already registered')) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = "Password must be at least 6 characters long.";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Please enter a valid email address.";
        } else if (error.message.includes('not configured')) {
          errorMessage = "Authentication service is not configured. Please contact support.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "❌ Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setErrors({});
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-md mx-4 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-400 mt-1">
                  {mode === 'signin' 
                    ? 'Sign in to your account' 
                    : 'Join VLANCO Streetwear'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Configuration Warning */}
            {!authConfig.isConfigured && (
              <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Configuration Required</span>
                </div>
                <p className="text-red-300 text-sm mt-1">
                  Authentication service is not properly configured.
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Full Name Field (Signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                        errors.fullName ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !authConfig.isConfigured}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    {mode === 'signin' ? <ArrowRight className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </>
                )}
              </button>

              {/* Mode Toggle */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  {mode === 'signin' ? (
                    <>
                      <ArrowLeft className="w-4 h-4" />
                      Don't have an account? Sign up
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Already have an account? Sign in
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
