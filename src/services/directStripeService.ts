import { loadStripe } from '@stripe/stripe-js';

export interface LocalCartItem {
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
}

/**
 * Create a direct Stripe checkout session using Supabase function
 * This creates a proper Stripe checkout session on the server
 */
export async function createDirectStripeCheckout(
  cartItems: LocalCartItem[],
  discountCode?: string,
  customerEmail?: string
): Promise<{ url: string; sessionId: string }> {
  try {
    console.log('🔄 Creating direct Stripe checkout session...');
    console.log('📦 Cart items:', cartItems);

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate that we have the required environment variables
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not configured');
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing');
    }

    // Calculate totals for logging
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = subtotal >= 100 ? 0 : 9.99;
    const taxAmount = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + taxAmount;

    console.log('💰 Calculated totals:', {
      subtotal: subtotal.toFixed(2),
      shipping: shippingCost.toFixed(2),
      tax: taxAmount.toFixed(2),
      total: total.toFixed(2)
    });

    // Create checkout session using Supabase function
    const response = await fetch(`${supabaseUrl}/functions/v1/checkout-local-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        cartItems,
        customerEmail: customerEmail || cartItems[0]?.user_email,
        discountCode,
        customerInfo: {
          firstName: '',
          lastName: '',
          phone: '',
          company: '',
          notes: '',
          fullName: '',
          timestamp: new Date().toISOString(),
        },
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/checkout/cancel`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { sessionId, url } = await response.json();
    console.log('✅ Checkout session created:', sessionId);

    // Store checkout data for the checkout page (for display purposes)
    const checkoutData = {
      cartItems,
      totals: {
        subtotal,
        shipping: shippingCost,
        tax: taxAmount,
        total
      },
      discountCode,
      customerEmail: customerEmail || cartItems[0]?.user_email
    };

    sessionStorage.setItem('stripe_checkout_data', JSON.stringify(checkoutData));

    return {
      url: url || '/checkout/direct',
      sessionId: sessionId
    };

  } catch (error) {
    console.error('❌ Error creating direct Stripe checkout:', error);
    throw error;
  }
}
