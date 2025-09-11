
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  useEffect(() => {
    const handleSession = async (session: Session | null) => {
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
      handleSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      await handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      await ensureUserProfile(data.user, userData);
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Ensure user profile exists in database
    if (data.user) {
      await ensureUserProfile(data.user);
    }
    
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
