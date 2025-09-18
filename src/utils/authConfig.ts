// Authentication Configuration Helper
export interface AuthConfig {
  isConfigured: boolean;
  hasValidUrl: boolean;
  hasValidKey: boolean;
  errors: string[];
}

export function checkAuthConfig(): AuthConfig {
  const errors: string[] = [];
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  let hasValidUrl = false;
  let hasValidKey = false;
  
  // Check Supabase URL
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is not set');
  } else if (supabaseUrl === 'your_supabase_project_url_here' || 
             supabaseUrl === 'your_supabase_url_here' ||
             !supabaseUrl.startsWith('http')) {
    errors.push('VITE_SUPABASE_URL is not properly configured');
  } else {
    hasValidUrl = true;
  }
  
  // Check Supabase Key
  if (!supabaseKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is not set');
  } else if (supabaseKey === 'your_supabase_anon_key_here' || 
             supabaseKey === 'your_actual_anon_key_here' ||
             supabaseKey.length < 20) {
    errors.push('VITE_SUPABASE_ANON_KEY is not properly configured');
  } else {
    hasValidKey = true;
  }
  
  return {
    isConfigured: hasValidUrl && hasValidKey,
    hasValidUrl,
    hasValidKey,
    errors
  };
}

export function getAuthConfigStatus(): string {
  const config = checkAuthConfig();
  
  if (config.isConfigured) {
    return '✅ Authentication is properly configured';
  }
  
  return `❌ Authentication configuration issues:\n${config.errors.join('\n')}`;
}

export function logAuthConfig(): void {
  const config = checkAuthConfig();
  
  if (config.isConfigured) {
    console.log('✅ Authentication is properly configured');
  } else {
    console.warn('⚠️ Authentication configuration issues:');
    config.errors.forEach(error => console.warn(`  - ${error}`));
    console.warn('📋 To fix: Update your .env file with valid Supabase credentials');
    console.warn('   Get them from: https://supabase.com/dashboard');
  }
}
