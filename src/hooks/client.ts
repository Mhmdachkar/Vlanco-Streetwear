// Alternative Supabase client with stricter validation
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Check if we have valid Supabase configuration
const hasValidSupabaseConfig = SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL !== 'your_supabase_project_url_here' &&
  SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here' &&
  SUPABASE_URL.startsWith('http');

if (!hasValidSupabaseConfig) {
  console.warn('⚠️  Supabase not configured properly. Please check your .env file.');
  console.warn('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = hasValidSupabaseConfig 
  ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null; // Return null instead of throwing error to allow graceful degradation
