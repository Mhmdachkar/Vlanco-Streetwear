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
 * Create a direct Stripe checkout session using client-side approach
 * This stores the checkout data and redirects to a custom checkout page
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

    // Create line items for Stripe
    const lineItems = cartItems.map(item => {
      // Ensure price is valid (convert to cents and round)
      const unitAmount = Math.max(Math.round(item.price * 100), 1); // Minimum 1 cent
      
      // Create a descriptive product name
      const productName = `${item.product_name} - ${item.variant_color} (${item.variant_size})`;
      
      // Ensure we have a valid image URL
      let imageUrl = item.product_image;
      if (!imageUrl || imageUrl.startsWith('/')) {
        // Convert relative URLs to absolute URLs
        const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
        imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/default-product.jpg`;
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            images: [imageUrl],
            description: `SKU: ${item.variant_sku}`,
            metadata: {
              product_id: item.product_id,
              variant_id: item.variant_id,
              variant_color: item.variant_color,
              variant_size: item.variant_size,
              variant_sku: item.variant_sku,
            },
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    console.log('📋 Created Stripe line items:', lineItems);

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

    // Store checkout data for the checkout page
    const checkoutData = {
      lineItems,
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

    // Redirect to our custom checkout page that will handle the Stripe integration
    const checkoutUrl = '/checkout/direct';
    
    return {
      url: checkoutUrl,
      sessionId: `direct_${Date.now()}`
    };

  } catch (error) {
    console.error('❌ Error creating direct Stripe checkout:', error);
    throw error;
  }
}
