/**
 * Stripe configuration and utilities
 */

// Get Stripe publishable key from environment
export const getStripePublishableKey = (): string | null => {
  const key = import.meta.env.STRIPE_PUBLISHABLE_KEY;
  
  if (!key || key === 'your_stripe_publishable_key_here' || key === 'pk_test_your_stripe_publishable_key_here') {
    console.warn('⚠️ Stripe publishable key not configured properly');
    return null;
  }
  
  return key;
};

// Check if Stripe is properly configured
export const isStripeConfigured = (): boolean => {
  const publishableKey = getStripePublishableKey();
  return publishableKey !== null && publishableKey.startsWith('pk_');
};

// Validate Stripe publishable key format
export const validateStripePublishableKey = (key: string): boolean => {
  return key.startsWith('pk_') && key.length > 20;
};

// Get Stripe mode (test or live) from key
export const getStripeMode = (): 'test' | 'live' | null => {
  const key = getStripePublishableKey();
  
  if (!key) return null;
  
  if (key.startsWith('pk_test_')) return 'test';
  if (key.startsWith('pk_live_')) return 'live';
  
  return null;
};

// Stripe configuration object
export const stripeConfig = {
  publishableKey: getStripePublishableKey(),
  isConfigured: isStripeConfigured(),
  mode: getStripeMode(),
};
