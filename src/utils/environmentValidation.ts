/**
 * Environment validation utilities
 */

export interface EnvironmentCheck {
  name: string;
  value: string | undefined;
  required: boolean;
  valid: boolean;
  message: string;
  category: 'supabase' | 'stripe' | 'app' | 'features';
}

// Supabase environment validation
export const validateSupabaseEnv = (): EnvironmentCheck[] => {
  return [
    {
      name: 'VITE_SUPABASE_URL',
      value: import.meta.env.VITE_SUPABASE_URL,
      required: true,
      category: 'supabase',
      ...validateSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
    },
    {
      name: 'VITE_SUPABASE_ANON_KEY',
      value: import.meta.env.VITE_SUPABASE_ANON_KEY,
      required: true,
      category: 'supabase',
      ...validateSupabaseAnonKey(import.meta.env.VITE_SUPABASE_ANON_KEY)
    },
    {
      name: 'SERVICE_ROLE_SECRET',
      value: import.meta.env.SERVICE_ROLE_SECRET,
      required: false,
      category: 'supabase',
      ...validateServiceRoleKey(import.meta.env.SERVICE_ROLE_SECRET)
    }
  ];
};

// Stripe environment validation
export const validateStripeEnv = (): EnvironmentCheck[] => {
  return [
    {
      name: 'STRIPE_PUBLISHABLE_KEY',
      value: import.meta.env.STRIPE_PUBLISHABLE_KEY,
      required: false,
      category: 'stripe',
      ...validateStripePublishableKey(import.meta.env.STRIPE_PUBLISHABLE_KEY)
    },
    {
      name: 'STRIPE_SECRET_KEY',
      value: import.meta.env.STRIPE_SECRET_KEY,
      required: false,
      category: 'stripe',
      ...validateStripeSecretKey(import.meta.env.STRIPE_SECRET_KEY)
    },
    {
      name: 'STRIPE_WEBHOOK_SECRET',
      value: import.meta.env.STRIPE_WEBHOOK_SECRET,
      required: false,
      category: 'stripe',
      ...validateStripeWebhookSecret(import.meta.env.STRIPE_WEBHOOK_SECRET)
    }
  ];
};

// App configuration validation
export const validateAppEnv = (): EnvironmentCheck[] => {
  return [
    {
      name: 'VITE_APP_NAME',
      value: import.meta.env.VITE_APP_NAME,
      required: false,
      category: 'app',
      ...validateAppName(import.meta.env.VITE_APP_NAME)
    },
    {
      name: 'VITE_APP_VERSION',
      value: import.meta.env.VITE_APP_VERSION,
      required: false,
      category: 'app',
      ...validateAppVersion(import.meta.env.VITE_APP_VERSION)
    }
  ];
};

// Feature flags validation
export const validateFeatureEnv = (): EnvironmentCheck[] => {
  return [
    {
      name: 'VITE_ENABLE_3D_VIEWER',
      value: import.meta.env.VITE_ENABLE_3D_VIEWER,
      required: false,
      category: 'features',
      ...validateBooleanFlag(import.meta.env.VITE_ENABLE_3D_VIEWER)
    },
    {
      name: 'VITE_ENABLE_RECOMMENDATIONS',
      value: import.meta.env.VITE_ENABLE_RECOMMENDATIONS,
      required: false,
      category: 'features',
      ...validateBooleanFlag(import.meta.env.VITE_ENABLE_RECOMMENDATIONS)
    }
  ];
};

// Get all environment validations
export const validateAllEnvironment = (): EnvironmentCheck[] => {
  return [
    ...validateSupabaseEnv(),
    ...validateStripeEnv(),
    ...validateAppEnv(),
    ...validateFeatureEnv()
  ];
};

// Individual validation functions
function validateSupabaseUrl(url: string | undefined): { valid: boolean; message: string } {
  if (!url) return { valid: false, message: 'Missing - required for database connection' };
  if (!url.includes('supabase.co')) return { valid: false, message: 'Invalid format - should contain supabase.co' };
  if (!url.startsWith('https://')) return { valid: false, message: 'Should start with https://' };
  if (url === 'your_supabase_project_url_here') return { valid: false, message: 'Placeholder value - needs actual URL' };
  return { valid: true, message: 'Valid' };
}

function validateSupabaseAnonKey(key: string | undefined): { valid: boolean; message: string } {
  if (!key) return { valid: false, message: 'Missing - required for authentication' };
  if (key.length < 100) return { valid: false, message: 'Too short - anon keys are usually 100+ characters' };
  if (!key.startsWith('eyJ')) return { valid: false, message: 'Invalid format - should start with eyJ' };
  if (key === 'your_supabase_anon_key_here') return { valid: false, message: 'Placeholder value - needs actual key' };
  return { valid: true, message: 'Valid format' };
}

function validateServiceRoleKey(key: string | undefined): { valid: boolean; message: string } {
  if (!key) return { valid: true, message: 'Optional - not set' };
  if (key.length < 100) return { valid: false, message: 'Too short for service role key' };
  if (!key.startsWith('eyJ')) return { valid: false, message: 'Invalid format - should start with eyJ' };
  if (key === 'your_service_role_key_here') return { valid: false, message: 'Placeholder value - needs actual key' };
  return { valid: true, message: 'Valid format' };
}

function validateStripePublishableKey(key: string | undefined): { valid: boolean; message: string } {
  if (!key) return { valid: true, message: 'Optional - Stripe payments disabled' };
  if (!key.startsWith('pk_')) return { valid: false, message: 'Should start with pk_' };
  if (key === 'your_stripe_publishable_key_here' || key === 'pk_test_your_stripe_publishable_key_here') {
    return { valid: false, message: 'Placeholder value - needs actual key' };
  }
  return { valid: true, message: key.startsWith('pk_test_') ? 'Valid (Test Mode)' : 'Valid (Live Mode)' };
}

function validateStripeSecretKey(key: string | undefined): { valid: boolean; message: string } {
  if (!key) return { valid: true, message: 'Optional - not accessible in frontend' };
  if (!key.startsWith('sk_')) return { valid: false, message: 'Should start with sk_' };
  if (key === 'your_stripe_secret_key_here' || key === 'sk_test_your_stripe_secret_key_here') {
    return { valid: false, message: 'Placeholder value - needs actual key' };
  }
  return { valid: true, message: 'Valid format (backend only)' };
}

function validateStripeWebhookSecret(secret: string | undefined): { valid: boolean; message: string } {
  if (!secret) return { valid: true, message: 'Optional - webhooks disabled' };
  if (!secret.startsWith('whsec_')) return { valid: false, message: 'Should start with whsec_' };
  if (secret === 'your_stripe_webhook_secret_here' || secret === 'whsec_your_stripe_webhook_secret_here') {
    return { valid: false, message: 'Placeholder value - needs actual secret' };
  }
  return { valid: true, message: 'Valid format' };
}

function validateAppName(name: string | undefined): { valid: boolean; message: string } {
  if (!name) return { valid: true, message: 'Optional - using default' };
  return { valid: true, message: `Set to: ${name}` };
}

function validateAppVersion(version: string | undefined): { valid: boolean; message: string } {
  if (!version) return { valid: true, message: 'Optional - using default' };
  return { valid: true, message: `Version: ${version}` };
}

function validateBooleanFlag(flag: string | undefined): { valid: boolean; message: string } {
  if (!flag) return { valid: true, message: 'Default: false' };
  const value = flag.toLowerCase();
  if (value === 'true' || value === 'false') {
    return { valid: true, message: `Set to: ${value}` };
  }
  return { valid: false, message: 'Should be "true" or "false"' };
}

// Check if critical environment variables are configured
export const isCriticalEnvConfigured = (): boolean => {
  const supabaseChecks = validateSupabaseEnv();
  const criticalChecks = supabaseChecks.filter(check => check.required);
  return criticalChecks.every(check => check.valid);
};

// Get environment summary
export const getEnvironmentSummary = () => {
  const allChecks = validateAllEnvironment();
  const totalChecks = allChecks.length;
  const validChecks = allChecks.filter(check => check.valid).length;
  const requiredChecks = allChecks.filter(check => check.required);
  const validRequiredChecks = requiredChecks.filter(check => check.valid).length;
  
  return {
    total: totalChecks,
    valid: validChecks,
    required: requiredChecks.length,
    validRequired: validRequiredChecks,
    isHealthy: validRequiredChecks === requiredChecks.length,
    completionRate: Math.round((validChecks / totalChecks) * 100)
  };
};
