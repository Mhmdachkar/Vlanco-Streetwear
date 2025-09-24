import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting store (in-memory for Deno Edge Functions)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP
const RATE_LIMIT_MAX_CHECKOUTS = 3; // 3 checkout attempts per minute per IP

// Circuit breaker configuration
const CIRCUIT_BREAKER_THRESHOLD = 5; // 5 failures
const CIRCUIT_BREAKER_TIMEOUT = 30 * 1000; // 30 seconds
const circuitBreakerState = {
  failures: 0,
  lastFailureTime: 0,
  isOpen: false
};

// Performance monitoring
const performanceMetrics = {
  requestCount: 0,
  errorCount: 0,
  averageResponseTime: 0,
  lastResetTime: Date.now()
};

// Rate limiting function
function checkRateLimit(ip: string, isCheckout: boolean = false): boolean {
  const now = Date.now();
  const key = `${ip}_${isCheckout ? 'checkout' : 'general'}`;
  const limit = isCheckout ? RATE_LIMIT_MAX_CHECKOUTS : RATE_LIMIT_MAX_REQUESTS;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}

// Circuit breaker function
function checkCircuitBreaker(): boolean {
  const now = Date.now();
  
  if (circuitBreakerState.isOpen) {
    if (now - circuitBreakerState.lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
      // Half-open state - allow one request to test
      circuitBreakerState.isOpen = false;
      circuitBreakerState.failures = 0;
      return true;
    }
    return false;
  }
  
  return true;
}

// Update circuit breaker on failure
function recordFailure() {
  circuitBreakerState.failures++;
  circuitBreakerState.lastFailureTime = Date.now();
  
  if (circuitBreakerState.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreakerState.isOpen = true;
    console.warn('🚨 Circuit breaker opened due to failures');
  }
}

// Update circuit breaker on success
function recordSuccess() {
  circuitBreakerState.failures = 0;
}

// Performance monitoring
function updateMetrics(responseTime: number, isError: boolean = false) {
  performanceMetrics.requestCount++;
  if (isError) performanceMetrics.errorCount++;
  
  // Update average response time
  performanceMetrics.averageResponseTime = 
    (performanceMetrics.averageResponseTime * (performanceMetrics.requestCount - 1) + responseTime) / 
    performanceMetrics.requestCount;
  
  // Log metrics every 100 requests
  if (performanceMetrics.requestCount % 100 === 0) {
    console.log('📊 Performance Metrics:', {
      requests: performanceMetrics.requestCount,
      errors: performanceMetrics.errorCount,
      errorRate: (performanceMetrics.errorCount / performanceMetrics.requestCount * 100).toFixed(2) + '%',
      avgResponseTime: performanceMetrics.averageResponseTime.toFixed(2) + 'ms'
    });
  }
}

serve(async (req) => {
  const startTime = Date.now();
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Security: Only allow POST requests
  if (req.method !== 'POST') {
    const responseTime = Date.now() - startTime;
    updateMetrics(responseTime, true);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );
  }

  // Rate limiting check
  if (!checkRateLimit(clientIP, true)) {
    const responseTime = Date.now() - startTime;
    updateMetrics(responseTime, true);
    console.warn(`🚫 Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded', 
        message: 'Too many checkout attempts. Please try again later.',
        retryAfter: 60 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      }
    );
  }

  // Circuit breaker check
  if (!checkCircuitBreaker()) {
    const responseTime = Date.now() - startTime;
    updateMetrics(responseTime, true);
    console.warn('🚨 Circuit breaker is open - rejecting request');
    return new Response(
      JSON.stringify({ 
        error: 'Service temporarily unavailable', 
        message: 'Please try again in a few moments.',
        retryAfter: 30 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      }
    );
  }

  // Security: Check request size (limit to 1MB)
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    const responseTime = Date.now() - startTime;
    updateMetrics(responseTime, true);
    return new Response(
      JSON.stringify({ error: 'Request too large' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 413,
      }
    );
  }

  try {
    console.log('🚀 Local checkout function called');
    
    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Stripe configuration missing' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Get request body
    let body;
    try {
      body = await req.json();
      console.log('📦 Request body received:', body);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { lineItems, cartItems, discountCode, customerEmail, customerInfo, successUrl, cancelUrl } = body;

    console.log('🚀 Creating local checkout session with:', {
      lineItemsCount: lineItems?.length || 0,
      cartItemsCount: cartItems?.length || 0,
      discountCode: discountCode || 'none',
      customerEmail: customerEmail || 'none',
      customerInfo: customerInfo ? 'provided' : 'none'
    });

    // Validate that we have cart items
    if (!cartItems || cartItems.length === 0) {
      console.error('❌ No cart items provided');
      return new Response(
        JSON.stringify({ error: 'No cart items provided' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validate cart items structure
    for (const item of cartItems) {
      if (!item.product_id || !item.product_name || !item.price || !item.quantity) {
        console.error('❌ Invalid cart item structure:', item);
        return new Response(
          JSON.stringify({ error: 'Invalid cart item structure' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Validate price and quantity are positive numbers
      if (item.price <= 0 || item.quantity <= 0) {
        console.error('❌ Invalid price or quantity:', item);
        return new Response(
          JSON.stringify({ error: 'Price and quantity must be positive numbers' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
    }

    // Validate customer email format
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      console.error('❌ Invalid customer email format:', customerEmail);
      return new Response(
        JSON.stringify({ error: 'Invalid customer email format' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Convert cart items to Stripe line items with enhanced product information
    const stripeLineItems = cartItems.map((item: any) => {
      // Ensure price is valid (convert to cents and round)
      const unitAmount = Math.max(Math.round(Number(item.price) * 100), 1); // Minimum 1 cent
      
      // Create a comprehensive product name
      const productName = `${item.product_name} - ${item.variant_color} (${item.variant_size})`;
      
      // Ensure we have a valid image URL
      let imageUrl = item.product_image;
      if (!imageUrl || imageUrl.startsWith('/')) {
        // Convert relative URLs to absolute URLs
        const baseUrl = req.headers.get('origin') || 'https://localhost:8080';
        imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/default-product.jpg`;
      }

      // Create comprehensive product description
      const productDescription = [
        `SKU: ${item.variant_sku}`,
        `Color: ${item.variant_color}`,
        `Size: ${item.variant_size}`,
        `Price: $${item.price.toFixed(2)}`,
        `Quantity: ${item.quantity}`,
        `Total: $${(item.price * item.quantity).toFixed(2)}`
      ].join(' | ');

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            images: [imageUrl],
            description: productDescription,
            metadata: {
              // Product Information
              product_id: item.product_id,
              product_name: item.product_name,
              product_image: imageUrl,
              
              // Variant Information
              variant_id: item.variant_id,
              variant_color: item.variant_color,
              variant_size: item.variant_size,
              variant_sku: item.variant_sku,
              
              // Pricing Information
              unit_price: item.price.toString(),
              quantity: item.quantity.toString(),
              total_price: (item.price * item.quantity).toString(),
              
              // Additional Product Details
              product_category: item.product_category || 'Streetwear',
              product_brand: item.product_brand || 'VLANCO',
              product_material: item.product_material || 'Premium Quality',
            },
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    console.log('📋 Converted to Stripe line items:', stripeLineItems.length, 'items');

    // Calculate totals from local cart data using integer cents to avoid float errors
    const subtotalCents = cartItems.reduce((sum: number, item: any) => {
      const unitCents = Math.max(Math.round(Number(item.price) * 100), 1);
      return sum + unitCents * Number(item.quantity);
    }, 0);
    const shippingCents = subtotalCents >= 10000 ? 0 : 999; // Free over $100, else $9.99
    const taxCents = 0; // No manual tax; handled by Stripe/none
    const totalCents = subtotalCents + shippingCents + taxCents;

    const subtotal = subtotalCents / 100;
    const shippingCost = shippingCents / 100;
    const taxAmount = taxCents / 100;
    const total = totalCents / 100;

    console.log('💰 Calculated totals:', {
      subtotal: subtotal.toFixed(2),
      shipping: shippingCost.toFixed(2),
      tax: taxAmount.toFixed(2),
      total: total.toFixed(2)
    })

    // Create Stripe checkout session
    console.log('🔄 Creating Stripe checkout session...');
    
    // Create comprehensive order metadata
    const orderMetadata = {
      // Order Information
      cart_type: 'local',
      order_id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order_date: new Date().toISOString(),
      
      // Customer Information
      customer_email: customerEmail || cartItems[0]?.user_email || 'guest@example.com',
      customer_id: cartItems[0]?.user_id || '00000000-0000-0000-0000-000000000000', // Default UUID for guest users
      customer_first_name: customerInfo?.firstName || '',
      customer_last_name: customerInfo?.lastName || '',
      customer_full_name: customerInfo?.fullName || '',
      customer_phone: customerInfo?.phone || '',
      customer_company: customerInfo?.company || '',
      customer_notes: customerInfo?.notes || '',
      customer_info_timestamp: customerInfo?.timestamp || new Date().toISOString(),
      
      // Order Summary
      item_count: cartItems.length.toString(),
      total_items: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0).toString(),
      
      // Pricing Breakdown
      subtotal: subtotal.toFixed(2),
      shipping: shippingCost.toFixed(2),
      tax: taxAmount.toFixed(2),
      total: total.toFixed(2),
      
      // Product Details (for quick reference)
      products: cartItems.map((item: any) => 
        `${item.product_name}_${item.variant_color}_${item.variant_size}_x${item.quantity}`
      ).join('|'),
      
      // Business Information
      business_name: 'VLANCO Streetwear',
      business_type: 'E-commerce',
      currency: 'USD',
      
      // Additional Tracking
      source: 'website',
      platform: 'stripe_checkout',
      discount_applied: discountCode || 'none',
    };

    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: stripeLineItems,
      mode: 'payment' as const,
      success_url: successUrl || `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/checkout/cancel`,
      metadata: orderMetadata,
      
      // Enhanced customer collection
      customer_email: customerEmail || cartItems[0]?.user_email || undefined,
      
      // Comprehensive address collection
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'JP', 'KR', 'SG', 'MY', 'TH', 'PH', 'ID', 'VN'],
      },
      billing_address_collection: 'required' as const,
      
      // Additional customer information collection
      phone_number_collection: {
        enabled: true,
      },
      
      // Order tracking and notifications
      payment_intent_data: {
        metadata: {
          ...orderMetadata,
          payment_type: 'checkout_session',
        },
      },
      
      // Automatic tax calculation (if available)
      automatic_tax: {
        enabled: true,
      },
      
      // Shipping options
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: shippingCents,
              currency: 'usd',
            },
            display_name: subtotal >= 100 ? 'Free Shipping' : 'Standard Shipping',
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
      ],
    };

    console.log('📋 Session config:', sessionConfig);

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('✅ Stripe session created:', session.id);

    // Store session data in database for tracking (optional but recommended)
    try {
      const sessionData = {
        stripe_session_id: session.id,
        customer_email: customerEmail || cartItems[0]?.user_email,
        status: 'created',
        amount_total: total,
        currency: 'USD',
        created_at: new Date().toISOString(),
      };

      // This is optional - you can create a sessions table if needed
      console.log('📊 Session data for tracking:', sessionData);
    } catch (trackingError) {
      console.warn('⚠️ Failed to store session tracking data:', trackingError);
      // Don't fail the checkout for tracking errors
    }

    // Record successful operation
    const responseTime = Date.now() - startTime;
    updateMetrics(responseTime, false);
    recordSuccess();
    
    console.log(`✅ Checkout session created successfully in ${responseTime}ms for IP: ${clientIP}`);

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        subtotal: subtotal,
        total: total,
        orderId: orderMetadata.order_id,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    // Record failed operation
    const responseTime = Date.now() - startTime;
    updateMetrics(responseTime, true);
    recordFailure();
    
    console.error('❌ Error creating local checkout session:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      clientIP,
      responseTime: responseTime + 'ms'
    });
    
    // Determine appropriate error response based on error type
    let statusCode = 500;
    let errorMessage = 'Failed to create checkout session';
    
    if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
      statusCode = 429;
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.message?.includes('timeout') || error.message?.includes('connection')) {
      statusCode = 504;
      errorMessage = 'Service timeout. Please try again.';
    } else if (error.message?.includes('invalid') || error.message?.includes('validation')) {
      statusCode = 400;
      errorMessage = 'Invalid request data. Please check your input.';
    }
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : 'Contact support if this persists',
        retryAfter: statusCode === 429 ? 60 : statusCode === 504 ? 30 : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      },
    )
  }
})
