import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    const { lineItems, cartItems, discountCode } = body;

    console.log('🚀 Creating local checkout session with:', {
      lineItemsCount: lineItems?.length || 0,
      cartItemsCount: cartItems?.length || 0,
      discountCode: discountCode || 'none'
    });

    if (!lineItems || lineItems.length === 0) {
      console.error('❌ No line items provided');
      return new Response(
        JSON.stringify({ error: 'No line items provided' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Calculate totals from local cart data
    const subtotal = cartItems.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity)
    }, 0)

    const shippingCost = subtotal >= 100 ? 0 : 9.99
    const taxAmount = subtotal * 0.08 // 8% tax
    const total = subtotal + shippingCost + taxAmount

    console.log('💰 Calculated totals:', {
      subtotal: subtotal.toFixed(2),
      shipping: shippingCost.toFixed(2),
      tax: taxAmount.toFixed(2),
      total: total.toFixed(2)
    })

    // Create Stripe checkout session
    console.log('🔄 Creating Stripe checkout session...');
    
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment' as const,
      success_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/checkout/cancel`,
      metadata: {
        cart_type: 'local',
        item_count: cartItems.length.toString(),
        subtotal: subtotal.toFixed(2),
        shipping: shippingCost.toFixed(2),
        tax: taxAmount.toFixed(2),
        total: total.toFixed(2)
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
      },
      billing_address_collection: 'required' as const,
      customer_email: cartItems[0]?.user_email || undefined,
    };

    console.log('📋 Session config:', sessionConfig);

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('✅ Stripe session created:', session.id);

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        subtotal: subtotal
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error creating local checkout session:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create checkout session',
        details: error.stack || 'No additional details available'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
