// localCheckoutService.ts
import { createDirectStripeCheckout, LocalCartItem } from './directStripeService';

export type { LocalCartItem };

/**
 * Create a Stripe checkout session using local cart data
 * This is the main function called by your cart context
 */
export async function createLocalCheckoutSession(
  cartItems: LocalCartItem[],
  discountCode?: string
): Promise<{ url: string; sessionId: string }> {
  try {
    console.log('🚀 Creating Stripe checkout session with local cart data...');
    console.log('📦 Cart items received:', cartItems.length);

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate cart items
    const validatedItems = validateCartItems(cartItems);
    console.log('✅ Cart items validated successfully');

    // Create checkout session using direct Stripe integration
    console.log('🔄 Creating checkout session with direct Stripe...');
    
    const checkoutData = await createDirectStripeCheckout(
      validatedItems, 
      discountCode,
      validatedItems[0]?.user_email
    );

    console.log('✅ Checkout session created successfully:', {
      sessionId: checkoutData.sessionId,
      hasUrl: !!checkoutData.url
    });

    return checkoutData;

  } catch (error) {
    console.error('❌ Error creating local checkout session:', error);
    
    // Re-throw with more user-friendly message if needed
    if (error instanceof Error) {
      if (error.message.includes('empty')) {
        throw new Error('Your cart is empty. Please add items before checkout.');
      }
      if (error.message.includes('STRIPE_SECRET_KEY')) {
        throw new Error('Payment service is not properly configured. Please contact support.');
      }
      if (error.message.includes('timeout')) {
        throw new Error('Checkout is taking longer than expected. Please try again.');
      }
    }
    
    throw error;
  }
}

/**
 * Validate and sanitize cart items before sending to Stripe
 */
function validateCartItems(cartItems: LocalCartItem[]): LocalCartItem[] {
  return cartItems.map((item, index) => {
    // Validate required fields
    if (!item.product_id) {
      throw new Error(`Cart item ${index + 1} is missing product_id`);
    }
    if (!item.variant_id) {
      throw new Error(`Cart item ${index + 1} is missing variant_id`);
    }
    if (!item.product_name || item.product_name.trim() === '') {
      throw new Error(`Cart item ${index + 1} is missing product_name`);
    }
    if (typeof item.price !== 'number' || item.price <= 0) {
      throw new Error(`Cart item ${index + 1} has invalid price: ${item.price}`);
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      throw new Error(`Cart item ${index + 1} has invalid quantity: ${item.quantity}`);
    }

    // Sanitize and provide defaults
    return {
      ...item,
      product_name: item.product_name.trim(),
      variant_color: item.variant_color?.trim() || 'Default',
      variant_size: item.variant_size?.trim() || 'M',
      variant_sku: item.variant_sku?.trim() || `${item.product_id}-${item.variant_id}`,
      product_image: item.product_image || '/assets/default-product.jpg',
      // Ensure price is a valid number with max 2 decimal places
      price: Math.round(item.price * 100) / 100,
      quantity: Math.floor(item.quantity), // Ensure integer
    };
  });
}

/**
 * Calculate cart totals (utility function)
 */
export function calculateCartTotals(cartItems: LocalCartItem[]) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal >= 100 ? 0 : 9.99;
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: shippingCost,
    tax: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}