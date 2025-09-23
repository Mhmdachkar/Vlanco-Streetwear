
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { User, Session } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'users'>;

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<any>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [explicitSignOut, setExplicitSignOut] = useState(false);
  const [lastSessionUpdate, setLastSessionUpdate] = useState<number>(0);
  const refreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if Supabase is configured before setting up auth
    if (!supabase) {
      console.warn('⚠️ useAuth: Supabase not configured, skipping auth setup');
      setLoading(false);
      return;
    }

    const scheduleRefresh = (s: Session | null) => {
      try {
        if (refreshTimerRef.current) {
          window.clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = null;
        }
        if (!s?.expires_at) return;
        const nowSec = Math.floor(Date.now() / 1000);
        const secondsUntilExpiry = s.expires_at - nowSec;
        // refresh 60s before expiry, min 30s
        const refreshInMs = Math.max((secondsUntilExpiry - 60) * 1000, 30_000);
        refreshTimerRef.current = window.setTimeout(async () => {
          try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
              console.warn('⚠️ useAuth: refreshSession failed:', error);
            } else if (data?.session) {
              // re-schedule with new session
              scheduleRefresh(data.session);
            }
          } catch (e) {
            console.warn('⚠️ useAuth: refresh timer error:', e);
          }
        }, refreshInMs) as unknown as number;
      } catch (e) {
        console.warn('⚠️ useAuth: scheduleRefresh error:', e);
      }
    };

    const handleSession = async (session: Session | null, event?: string) => {
      const now = Date.now();
      
      // Debounce rapid session changes (prevent multiple updates within 200ms)
      if (now - lastSessionUpdate < 200 && event !== 'INITIAL_SESSION') {
        return;
      }
      
      setLastSessionUpdate(now);
      
      console.log('🔄 useAuth: Handling session change', { event, hasSession: !!session, hasUser: !!session?.user });
      
      // If user explicitly signed out, don't restore session on page refresh
      // unless they have "remember me" enabled
      const hasRememberMe = localStorage.getItem('vlanco_remember_me') === 'true';
      if (explicitSignOut && event === 'INITIAL_SESSION' && !hasRememberMe) {
        console.log('🚪 useAuth: User explicitly signed out and no remember me, not restoring session');
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        // Clear any stored session data
        localStorage.removeItem('vlanco_auth_session');
        sessionStorage.removeItem('vlanco_auth_session');
        return;
      }
      
      // If user has remember me enabled, reset explicit sign out flag
      if (hasRememberMe && explicitSignOut && event === 'INITIAL_SESSION') {
        console.log('💾 useAuth: Remember me enabled, restoring session despite explicit sign out');
        setExplicitSignOut(false);
      }
      
      // Reset explicit sign out flag when user signs in
      if (session?.user && explicitSignOut) {
        console.log('✅ useAuth: User signed in, resetting explicit sign out flag');
        setExplicitSignOut(false);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      // schedule token refresh
      scheduleRefresh(session);
      
      if (session?.user) {
        console.log('👤 useAuth: User session found, fetching profile');
        // Store session data for persistence
        try {
          const sessionData = {
            user: session.user,
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            timestamp: Date.now()
          };
          localStorage.setItem('vlanco_auth_session', JSON.stringify(sessionData));
          sessionStorage.setItem('vlanco_auth_session', JSON.stringify(sessionData));
        } catch (error) {
          console.warn('⚠️ useAuth: Failed to store session data:', error);
        }
        
        // Ensure user profile exists before fetching
        await ensureUserProfile(session.user);
        await fetchProfile(session.user.id);
      } else {
        console.log('👤 useAuth: No user session');
        setProfile(null);

        // Attempt restoration if remember-me is enabled and we have saved tokens
        try {
          const hasRememberMePref = localStorage.getItem('vlanco_remember_me') === 'true';
          const stored = localStorage.getItem('vlanco_auth_session');
          if (hasRememberMePref && stored) {
            const saved = JSON.parse(stored);
            if (saved?.refresh_token) {
              console.log('🔁 useAuth: Attempting to restore session from saved refresh token');
              const { data, error } = await supabase.auth.setSession({
                access_token: saved.access_token,
                refresh_token: saved.refresh_token
              });
              if (!error && data?.session) {
                // setSession will be handled on the next auth state change
                console.log('✅ useAuth: Session restored from saved tokens');
                return;
              }
              console.warn('⚠️ useAuth: Session restore attempt failed', error);
            }
          }
        } catch (e) {
          console.warn('⚠️ useAuth: Failed during session restore attempt:', e);
        }

        // Do not clear persisted storage unless the user explicitly signed out
        if (explicitSignOut) {
          localStorage.removeItem('vlanco_auth_session');
          sessionStorage.removeItem('vlanco_auth_session');
        }
      }
      setLoading(false);
    };

    // Check for stored session data first
    const checkStoredSession = async () => {
      try {
        const storedSession = localStorage.getItem('vlanco_auth_session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          const timeSinceLastUpdate = Date.now() - (sessionData.timestamp || 0);
          
          // If session data is less than 24 hours old, try to restore it
          if (timeSinceLastUpdate < 24 * 60 * 60 * 1000) {
            console.log('🔄 useAuth: Found stored session data, attempting restoration');
            if (sessionData?.refresh_token) {
              try {
                await supabase.auth.setSession({
                  access_token: sessionData.access_token,
                  refresh_token: sessionData.refresh_token
                });
              } catch (e) {
                console.warn('⚠️ useAuth: setSession restoration failed:', e);
              }
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ useAuth: Failed to check stored session:', error);
      }
    };

    // Get initial session
    const initializeAuth = async () => {
      await checkStoredSession();
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('❌ useAuth: Error getting initial session:', error);
        setLoading(false);
        return;
      }
      
      await handleSession(session, 'INITIAL_SESSION');
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 useAuth: Auth state changed', { event });
      await handleSession(session, event);
    });

    // Visibility change: try to restore session when app returns to foreground (mobile safety)
    const onVisibility = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            const stored = localStorage.getItem('vlanco_auth_session');
            if (stored) {
              const saved = JSON.parse(stored);
              if (saved?.refresh_token) {
                await supabase.auth.setSession({
                  access_token: saved.access_token,
                  refresh_token: saved.refresh_token
                });
              }
            }
          }
        } catch (e) {
          console.warn('⚠️ useAuth: visibility restore failed:', e);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', onVisibility);
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [explicitSignOut]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Removed console.error for better performance
        return;
      }

      setProfile(data);
    } catch (error) {
      // Removed console.error for better performance
    }
  };

  const ensureUserProfile = async (user: User, userData?: Partial<UserProfile>) => {
    try {
      // Removed console.log for better performance
      
      // First check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Removed console.error for better performance
        return;
      }

      if (existingProfile) {
        // Removed console.log for better performance
        return;
      }

      // Create new profile
      // Removed console.log for better performance
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          first_name: user.user_metadata?.first_name || userData?.first_name || null,
          last_name: user.user_metadata?.last_name || userData?.last_name || null,
          full_name: user.user_metadata?.full_name || 
                    (user.user_metadata?.first_name && user.user_metadata?.last_name 
                      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}` 
                      : null) ||
                    userData?.full_name || 
                    (userData?.first_name && userData?.last_name 
                      ? `${userData.first_name} ${userData.last_name}` 
                      : null) || null,
          phone: user.user_metadata?.phone || userData?.phone || null,
          avatar_url: user.user_metadata?.avatar_url || userData?.avatar_url || null,
          is_verified: user.email_confirmed_at ? true : false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...userData
        });

      if (profileError) {
        // Removed console.error for better performance
        throw profileError;
      } else {
        // Removed console.log for better performance
      }
    } catch (error) {
      // Removed console.error for better performance
      // Don't throw error to prevent auth failure
    }
  };

  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    try {
      // Removed console.log for better performance
      
      // Check if Supabase is configured
      if (!supabase) {
        throw new Error('Authentication service is not configured. Please check your environment variables.');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Removed console.error for better performance
        throw error;
      }

      // Removed console.log for better performance

      // Reset explicit sign out flag
      setExplicitSignOut(false);

      // Create user profile
      if (data.user) {
        await ensureUserProfile(data.user, userData);
        console.log('✅ useAuth: User profile created');
      }

      return data;
    } catch (error) {
      console.error('❌ useAuth: Sign up failed:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      console.log('🔄 useAuth: Starting sign in process...', { email, rememberMe });
      
      // Check if Supabase is configured
      if (!supabase) {
        throw new Error('Authentication service is not configured. Please check your environment variables.');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('❌ useAuth: Sign in error:', error);
        throw error;
      }
      
      console.log('✅ useAuth: Sign in successful, ensuring user profile...');
      
      // Reset explicit sign out flag
      setExplicitSignOut(false);
      
      // Store remember me preference (default enabled)
      if (rememberMe) {
        try {
          localStorage.setItem('vlanco_remember_me', 'true');
          console.log('💾 useAuth: Remember me preference saved');
        } catch (error) {
          console.warn('⚠️ useAuth: Failed to save remember me preference:', error);
        }
      } else {
        localStorage.removeItem('vlanco_remember_me');
      }
      
      // Ensure user profile exists in database
      if (data.user) {
        await ensureUserProfile(data.user);
        console.log('✅ useAuth: User profile ensured');
      }
      
      return data;
    } catch (error) {
      console.error('❌ useAuth: Sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 useAuth: Starting sign out process...');
      console.log('🚪 useAuth: Current user:', user?.email);
      
      // Clear any local storage data first
      console.log('🧹 useAuth: Clearing local storage...');
      localStorage.removeItem('cart');
      localStorage.removeItem('enhanced_cart_details');
      localStorage.removeItem('vlanco_entered_store');
      localStorage.removeItem('vlanco_guest_cart');
      
      // Clear all Supabase-related storage
      console.log('🧹 useAuth: Clearing Supabase storage...');
      localStorage.removeItem('sb-' + supabase.supabaseUrl.split('//')[1].split('.')[0] + '-auth-token');
      sessionStorage.removeItem('sb-' + supabase.supabaseUrl.split('//')[1].split('.')[0] + '-auth-token');
      
      // Clear our custom session storage
      localStorage.removeItem('vlanco_auth_session');
      sessionStorage.removeItem('vlanco_auth_session');
      
      // Clear all localStorage items that might contain auth data
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('vlanco_auth')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear all sessionStorage items that might contain auth data
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('vlanco_auth')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Clean up any invalid cart items in guest cart
      console.log('🧹 useAuth: Cleaning guest cart...');
      try {
        const guestCartKey = 'vlanco_guest_cart';
        const rawCart = localStorage.getItem(guestCartKey);
        if (rawCart) {
          const cart = JSON.parse(rawCart);
          const validCart = cart.filter((item: any) => {
            return item.product_id && item.variant_id && item.quantity && 
                   typeof item.product_id === 'string' && item.product_id.length >= 10;
          });
          if (validCart.length !== cart.length) {
            console.log(`🧹 Cleaned ${cart.length - validCart.length} invalid items from guest cart`);
            localStorage.setItem(guestCartKey, JSON.stringify(validCart));
          }
        }
      } catch (error) {
        console.warn('⚠️ Error cleaning guest cart during sign out:', error);
      }
      
      // Manually clear local state immediately
      console.log('🧹 useAuth: Clearing local auth state...');
      setUser(null);
      setProfile(null);
      setSession(null);
      setExplicitSignOut(true); // Mark as explicit sign out
      
      // Try Supabase sign out with timeout; keep remember-me so session isn't auto-restored unless user unchecked it
      console.log('🔄 useAuth: Calling Supabase signOut...');
      
      const signOutPromise = supabase.auth.signOut({ scope: 'global' });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign out timeout')), 5000)
      );
      
      try {
        const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any;
        if (error) {
          console.error('❌ useAuth: Supabase sign out error:', error);
          // Don't throw error, just log it since we've already cleared local state
        } else {
          console.log('✅ useAuth: Supabase sign out successful');
        }
      } catch (timeoutError) {
        console.warn('⚠️ useAuth: Supabase sign out timed out, but local state cleared');
        // Don't throw error, local state is already cleared
      }
      
      console.log('✅ useAuth: User signed out successfully');
      
      // Show success toast
      toast({
        title: "👋 Signed Out",
        description: "You have been successfully signed out",
        duration: 3000
      });
      
    } catch (error) {
      console.error('❌ useAuth: Sign out failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      
      toast({
        title: "❌ Sign Out Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      });
      
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
