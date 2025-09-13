
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
  signIn: (email: string, password: string) => Promise<any>;
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

  useEffect(() => {
    const handleSession = async (session: Session | null, event?: string) => {
      const now = Date.now();
      
      // Debounce rapid session changes (prevent multiple updates within 200ms)
      if (now - lastSessionUpdate < 200 && event !== 'INITIAL_SESSION') {
        console.log('🔄 useAuth: Debouncing rapid session change');
        return;
      }
      
      setLastSessionUpdate(now);
      
      // Only log significant events, not every session check
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log('🔄 useAuth: handleSession called', { 
          hasSession: !!session, 
          event, 
          explicitSignOut 
        });
      }
      
      // If user explicitly signed out, don't restore session on page refresh
      if (explicitSignOut && event === 'INITIAL_SESSION') {
        console.log('🚫 useAuth: Ignoring initial session due to explicit sign out');
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      
      // Reset explicit sign out flag when user signs in
      if (session?.user && explicitSignOut) {
        console.log('🔄 useAuth: Resetting explicit sign out flag');
        setExplicitSignOut(false);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Ensure user profile exists before fetching
        await ensureUserProfile(session.user);
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session, 'INITIAL_SESSION');
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      await handleSession(session, event);
    });

    return () => subscription.unsubscribe();
  }, [explicitSignOut]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const ensureUserProfile = async (user: User, userData?: Partial<UserProfile>) => {
    try {
      console.log('🔍 Ensuring user profile exists for:', user.email);
      
      // First check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error checking existing profile:', fetchError);
        return;
      }

      if (existingProfile) {
        console.log('✅ User profile already exists');
        return;
      }

      // Create new profile
      console.log('📝 Creating new user profile...');
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
        console.error('❌ Error creating user profile:', profileError);
        throw profileError;
      } else {
        console.log('✅ User profile created successfully');
      }
    } catch (error) {
      console.error('❌ Failed to ensure user profile:', error);
      // Don't throw error to prevent auth failure
    }
  };

  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    try {
      console.log('🔄 useAuth: Starting sign up process...', { email, userData });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ useAuth: Sign up error:', error);
        throw error;
      }

      console.log('✅ useAuth: Sign up successful, creating user profile...');

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

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔄 useAuth: Starting sign in process...', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ useAuth: Sign in error:', error);
        throw error;
      }
      
      console.log('✅ useAuth: Sign in successful, ensuring user profile...');
      
      // Reset explicit sign out flag
      setExplicitSignOut(false);
      
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
      
      // Clear all localStorage items that might contain auth data
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear all sessionStorage items that might contain auth data
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth')) {
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
      
      // Try Supabase sign out with timeout
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
