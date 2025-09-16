/**
 * Enhanced Stripe Service with Advanced Features
 * Provides comprehensive Stripe integration with error handling, analytics, and optimization
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Types
export interface EnhancedCartItem {
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  product_name: string;
  product_image: string;
  variant_color: string;
  variant_size: string;
  variant_sku: string;
  user_email?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionData {
  lineItems: Array<{
    price_data: {
      currency: string;
      product_data: {
        name: string;
        images: string[];
        metadata: Record<string, string>;
      };
      unit_amount: number;
    };
    quantity: number;
  }>;
  cartItems: EnhancedCartItem[];
  discountCode?: string;
  customerEmail?: string;
  metadata: Record<string, string>;
}

export interface CheckoutResult {
  success: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
  errorCode?: string;
}

// Configuration
const STRIPE_CONFIG = {
  currency: 'usd',
  successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${window.location.origin}/checkout/cancel`,
  allowedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'JP', 'KR', 'SG', 'HK'],
  shippingOptions: [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: 999, // $9.99
          currency: 'usd',
        },
        display_name: 'Standard Shipping',
        delivery_estimate: {
          minimum: {
            unit: 'business_day',
            value: 3,
          },
          maximum: {
            unit: 'business_day',
            value: 7,
          },
        },
      },
    },
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: 1999, // $19.99
          currency: 'usd',
        },
        display_name: 'Express Shipping',
        delivery_estimate: {
          minimum: {
            unit: 'business_day',
            value: 1,
          },
          maximum: {
            unit: 'business_day',
            value: 3,
          },
        },
      },
    },
  ],
};

// Analytics tracking
const trackCheckoutEvent = (event: string, data: any) => {
  try {
    // Track with analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: 'ecommerce',
        event_label: 'stripe_checkout',
        value: data.total || 0,
        currency: 'USD',
        ...data,
      });
    }
    
    // Console logging for development
    console.log(`📊 Analytics: ${event}`, data);
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};

// Error handling utilities
const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.type) {
    switch (error.type) {
      case 'card_error':
        return 'There was an error with your card. Please try again.';
      case 'validation_error':
        return 'Please check your information and try again.';
      case 'api_error':
        return 'A server error occurred. Please try again later.';
      case 'authentication_error':
        return 'Authentication failed. Please refresh and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
  return 'An unexpected error occurred. Please try again.';
};

// Validation utilities
const validateCartItems = (items: EnhancedCartItem[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!items || items.length === 0) {
    errors.push('Cart is empty');
    return { valid: false, errors };
  }
  
  for (const item of items) {
    if (!item.product_id || !item.variant_id) {
      errors.push('Invalid product data');
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.push('Invalid quantity');
    }
    if (!item.price || item.price <= 0) {
      errors.push('Invalid price');
    }
    if (!item.product_name) {
      errors.push('Missing product name');
    }
  }
  
  return { valid: errors.length === 0, errors };
};

// Calculate totals with enhanced logic
export const calculateEnhancedTotals = (items: EnhancedCartItem[], discountCode?: string) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 10000 ? 0 : 999; // Free shipping over $100
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const discount = discountCode ? Math.round(subtotal * 0.1) : 0; // 10% discount
  const total = subtotal + shipping + tax - discount;
  
  return {
    subtotal,
    shipping,
    tax,
    discount,
    total,
    currency: 'USD',
    freeShippingThreshold: 10000,
    isFreeShipping: subtotal >= 10000,
  };
};

// Main checkout function
export const createEnhancedStripeCheckout = async (
  cartItems: EnhancedCartItem[],
  discountCode?: string,
  customerEmail?: string
): Promise<CheckoutResult> => {
  try {
    // Validate inputs
    const validation = validateCartItems(cartItems);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        errorCode: 'VALIDATION_ERROR',
      };
    }

    // Get Stripe publishable key
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey || publishableKey.includes('your_') || publishableKey.includes('pk_test_your_')) {
      return {
        success: false,
        error: 'Stripe is not properly configured. Please contact support.',
        errorCode: 'CONFIG_ERROR',
      };
    }

    // Initialize Stripe
    const stripe: Stripe | null = await loadStripe(publishableKey);
    if (!stripe) {
      return {
        success: false,
        error: 'Failed to load Stripe. Please refresh and try again.',
        errorCode: 'STRIPE_LOAD_ERROR',
      };
    }

    // Calculate totals
    const totals = calculateEnhancedTotals(cartItems, discountCode);

    // Track checkout initiation
    trackCheckoutEvent('begin_checkout', {
      items: cartItems.length,
      total: totals.total,
      discount_code: discountCode,
    });

    // Create line items for Stripe
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: STRIPE_CONFIG.currency,
        product_data: {
          name: item.product_name,
          images: [item.product_image],
          metadata: {
            product_id: item.product_id,
            variant_id: item.variant_id,
            variant_color: item.variant_color,
            variant_size: item.variant_size,
            variant_sku: item.variant_sku,
            ...item.metadata,
          },
        },
        unit_amount: Math.round(item.price), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as line item if not free
    if (totals.shipping > 0) {
      lineItems.push({
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: 'Standard Shipping',
            metadata: {
              type: 'shipping',
            },
          },
          unit_amount: totals.shipping,
        },
        quantity: 1,
      });
    }

    // Add tax as line item
    if (totals.tax > 0) {
      lineItems.push({
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: 'Tax',
            metadata: {
              type: 'tax',
            },
          },
          unit_amount: totals.tax,
        },
        quantity: 1,
      });
    }

    // Add discount as line item (negative amount)
    if (totals.discount > 0) {
      lineItems.push({
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: `Discount (${discountCode})`,
            metadata: {
              type: 'discount',
              discount_code: discountCode || '',
            },
          },
          unit_amount: -totals.discount, // Negative amount for discount
        },
        quantity: 1,
      });
    }

    // Create checkout session data
    const checkoutData: CheckoutSessionData = {
      lineItems,
      cartItems,
      discountCode,
      customerEmail,
      metadata: {
        source: 'vlanco_website',
        version: '2.0',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        total_items: cartItems.length.toString(),
        total_amount: totals.total.toString(),
      },
    };

    // Store checkout data for success page
    sessionStorage.setItem('vlanco_checkout_data', JSON.stringify(checkoutData));

    // Redirect to Stripe checkout
    const { error: stripeError } = await stripe.redirectToCheckout({
      lineItems,
      mode: 'payment',
      successUrl: STRIPE_CONFIG.successUrl,
      cancelUrl: STRIPE_CONFIG.cancelUrl,
      customerEmail: customerEmail || cartItems[0]?.user_email,
      billingAddressCollection: 'required',
      shippingAddressCollection: {
        allowedCountries: STRIPE_CONFIG.allowedCountries,
      },
      shippingOptions: STRIPE_CONFIG.shippingOptions,
      metadata: checkoutData.metadata,
      allowPromotionCodes: true,
      automaticTax: {
        enabled: true,
      },
    });

    if (stripeError) {
      trackCheckoutEvent('checkout_error', {
        error: stripeError.message,
        error_type: stripeError.type,
      });
      
      return {
        success: false,
        error: getErrorMessage(stripeError),
        errorCode: stripeError.type || 'STRIPE_ERROR',
      };
    }

    // Track successful checkout initiation
    trackCheckoutEvent('checkout_success', {
      items: cartItems.length,
      total: totals.total,
    });

    return {
      success: true,
      url: 'redirecting...',
    };

  } catch (error) {
    console.error('Enhanced Stripe checkout error:', error);
    
    trackCheckoutEvent('checkout_exception', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: getErrorMessage(error),
      errorCode: 'EXCEPTION',
    };
  }
};

// Utility function to get checkout data from session storage
export const getCheckoutData = (): CheckoutSessionData | null => {
  try {
    const data = sessionStorage.getItem('vlanco_checkout_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get checkout data:', error);
    return null;
  }
};

// Utility function to clear checkout data
export const clearCheckoutData = (): void => {
  try {
    sessionStorage.removeItem('vlanco_checkout_data');
  } catch (error) {
    console.error('Failed to clear checkout data:', error);
  }
};

// Utility function to validate Stripe configuration
export const validateStripeConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    errors.push('VITE_STRIPE_PUBLISHABLE_KEY is not set');
  } else if (publishableKey.includes('your_') || publishableKey.includes('pk_test_your_')) {
    errors.push('VITE_STRIPE_PUBLISHABLE_KEY contains placeholder value');
  } else if (!publishableKey.startsWith('pk_')) {
    errors.push('VITE_STRIPE_PUBLISHABLE_KEY has invalid format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Export configuration for use in other components
export { STRIPE_CONFIG };
