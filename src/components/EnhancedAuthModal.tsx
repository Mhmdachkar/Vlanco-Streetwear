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
  const [rememberMe, setRememberMe] = useState(false);

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔧 EnhancedAuthModal: Modal opened, resetting form state');
      setIsSubmitting(false);
      setShowPassword(false);
      setErrors({});
      setFormData({
        email: '',
        password: '',
        fullName: '',
        username: '',
      });
      const config = checkAuthConfig();
      setAuthConfig(config);
      console.log('🔧 EnhancedAuthModal: Auth config:', config);
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
        title: "🎭 Demo Mode",
        description: "Authentication is in demo mode. This is a demonstration of the sign-in form.",
        duration: 4000,
      });
      // Still allow the form to "submit" in demo mode
      setIsSubmitting(false);
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('🔄 EnhancedAuthModal: Starting authentication...', { mode, email: formData.email });
      
      if (mode === 'signin') {
        await signIn(formData.email, formData.password, rememberMe);
        console.log('✅ EnhancedAuthModal: Sign in successful');
        toast({
          title: "🎉 Welcome back!",
          description: rememberMe ? "You've successfully signed in and will stay logged in." : "You've successfully signed in.",
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

  // Debug logging
  console.log('🔧 EnhancedAuthModal Render:', { 
    isOpen, 
    mode, 
    authConfig, 
    user: !!user, 
    loading,
    timestamp: new Date().toISOString()
  });

  // Simple test modal to debug the issue
  if (!isOpen) return null;

  return (
    <div
      className="auth-modal-overlay"
      style={{
        position: 'fixed !important',
        top: '0 !important',
        left: '0 !important',
        right: '0 !important',
        bottom: '0 !important',
        backgroundColor: 'rgba(0, 0, 0, 0.9) !important',
        zIndex: '999999 !important',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
        padding: '20px !important',
        isolation: 'isolate !important',
        transform: 'translateZ(0) !important',
        backfaceVisibility: 'hidden !important',
        width: '100vw !important',
        height: '100vh !important',
        overflow: 'hidden !important'
      }}
      onClick={onClose}
    >
      <div
        className="auth-modal-content"
        style={{
          backgroundColor: '#1e293b !important',
          borderRadius: '16px !important',
          padding: '24px !important',
          width: '90% !important',
          maxWidth: '420px !important',
          minWidth: 'auto !important',
          width: '100% !important',
          border: '1px solid #475569 !important',
          position: 'relative !important',
          zIndex: '1000000 !important',
          isolation: 'isolate !important',
          transform: 'translateZ(0) !important',
          backfaceVisibility: 'hidden !important',
          opacity: '1 !important',
          visibility: 'visible !important',
          display: 'block !important',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05) !important',
          margin: '20px !important',
          maxHeight: '90vh !important',
          overflow: 'auto !important',
          backdropFilter: 'blur(10px) !important'
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '1px solid #475569'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: 'white',
              margin: 0,
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ 
              color: '#94a3b8', 
              margin: 0,
              fontSize: '14px'
            }}>
              {mode === 'signin' 
                ? 'Sign in to your account to continue' 
                : 'Join our community today'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid #475569',
              color: '#94a3b8',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'white';
              e.target.style.backgroundColor = 'rgba(148, 163, 184, 0.2)';
              e.target.style.borderColor = '#64748b';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#94a3b8';
              e.target.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
              e.target.style.borderColor = '#475569';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Warning */}
        {!authConfig.isConfigured && (
          <div style={{
            margin: '0 0 16px 0',
            padding: '16px',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
              <AlertCircle className="w-4 h-4" />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Demo Mode</span>
            </div>
            <p style={{ color: '#fcd34d', fontSize: '12px', margin: '4px 0 0 0' }}>
              Authentication is in demo mode. Some features may be limited.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email Field */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#cbd5e1', 
              marginBottom: '8px' 
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                width: '16px', 
                height: '16px', 
                color: '#94a3b8' 
              }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  paddingTop: '14px',
                  paddingBottom: '14px',
                  backgroundColor: '#0f172a',
                  border: `2px solid ${errors.email ? '#ef4444' : '#475569'}`,
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: errors.email ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = '#06b6d4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = '#475569';
                    e.target.style.boxShadow = 'none';
                  }
                }}
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#cbd5e1', 
              marginBottom: '8px' 
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                width: '16px', 
                height: '16px', 
                color: '#94a3b8' 
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '48px',
                  paddingTop: '14px',
                  paddingBottom: '14px',
                  backgroundColor: '#0f172a',
                  border: `2px solid ${errors.password ? '#ef4444' : '#475569'}`,
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: errors.password ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
                }}
                onFocus={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = '#06b6d4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = '#475569';
                    e.target.style.boxShadow = 'none';
                  }
                }}
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>
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

              {/* Remember Me Checkbox (Sign in only) */}
              {mode === 'signin' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '8px'
                }}>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: '#0f172a',
                      border: '2px solid #475569',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      accentColor: '#a855f7'
                    }}
                  />
                  <label 
                    htmlFor="rememberMe" 
                    style={{
                      fontSize: '14px',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Remember me for 30 days
                  </label>
                </div>
              )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              paddingTop: '16px',
              paddingBottom: '16px',
              background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(168, 85, 247, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(168, 85, 247, 0.3)';
              }
            }}
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
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={toggleMode}
              style={{
                color: '#94a3b8',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                margin: '0 auto',
                fontSize: '14px'
              }}
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
      </div>
    </div>
  );
}
