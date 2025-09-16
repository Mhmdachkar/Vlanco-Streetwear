/**
 * Enhanced Stripe Webhook Handler
 * Processes Stripe webhook events with comprehensive error handling and logging
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Webhook secret for signature verification
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

// Event types we handle
const HANDLED_EVENTS = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
];

// Logging utility
const log = (level: 'info' | 'error' | 'warn', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    console.log(logMessage, JSON.stringify(data, null, 2));
  } else {
    console.log(logMessage);
  }
};

// Error handling utility
const handleError = (error: any, context: string) => {
  log('error', `Error in ${context}`, {
    message: error.message,
    stack: error.stack,
    type: error.type,
    code: error.code,
  });
  
  return new Response(
    JSON.stringify({ 
      error: error.message,
      context,
      timestamp: new Date().toISOString(),
    }),
    { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
};

// Process checkout session completed
const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  try {
    log('info', 'Processing checkout session completed', {
      sessionId: session.id,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      currency: session.currency,
    });

    // Extract order data from session metadata and map to actual database schema
    const orderData = {
      user_id: session.metadata?.customer_id || '00000000-0000-0000-0000-000000000000', // Default UUID for guest users
      order_number: session.metadata?.order_id || `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'confirmed',
      payment_status: session.payment_status === 'paid' ? 'paid' : 'pending',
      total_amount: session.amount_total ? (session.amount_total / 100) : 0, // Convert from cents to dollars
      subtotal: session.metadata?.subtotal ? parseFloat(session.metadata.subtotal) : 0,
      tax_amount: session.metadata?.tax ? parseFloat(session.metadata.tax) : 0,
      shipping_amount: session.metadata?.shipping ? parseFloat(session.metadata.shipping) : 0,
      discount_amount: session.metadata?.discount_amount ? parseFloat(session.metadata.discount_amount) : 0,
      currency: session.currency?.toUpperCase() || 'USD',
      shipping_address: session.shipping_details?.address ? {
        name: session.shipping_details.name,
        line1: session.shipping_details.address.line1,
        line2: session.shipping_details.address.line2,
        city: session.shipping_details.address.city,
        state: session.shipping_details.address.state,
        postal_code: session.shipping_details.address.postal_code,
        country: session.shipping_details.address.country,
      } : null,
      billing_address: session.customer_details?.address ? {
        name: session.customer_details.name,
        line1: session.customer_details.address.line1,
        line2: session.customer_details.address.line2,
        city: session.customer_details.address.city,
        state: session.customer_details.address.state,
        postal_code: session.customer_details.address.postal_code,
        country: session.customer_details.address.country,
      } : null,
      payment_method: 'stripe',
      payment_id: session.payment_intent,
      notes: session.metadata?.customer_notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    log('info', 'Order created successfully', { orderId: order.id });

    // Process line items if available
    if (session.line_items) {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      for (const item of lineItems.data) {
        const orderItemData = {
          order_id: order.id,
          product_id: item.price?.metadata?.product_id || 'unknown',
          variant_id: item.price?.metadata?.variant_id || null,
          quantity: item.quantity || 1,
          unit_price: item.price?.unit_amount ? (item.price.unit_amount / 100) : 0, // Convert from cents to dollars
          total_price: item.amount_total ? (item.amount_total / 100) : 0, // Convert from cents to dollars
          product_name: item.description || 'Unknown Product',
          variant_name: item.price?.metadata?.variant_color && item.price?.metadata?.variant_size 
            ? `${item.price.metadata.variant_color} - ${item.price.metadata.variant_size}` 
            : null,
          product_image: item.price?.metadata?.product_image || null,
        };

        const { error: itemError } = await supabase
          .from('order_items')
          .insert([orderItemData]);

        if (itemError) {
          log('error', 'Failed to create order item', {
            orderId: order.id,
            error: itemError.message,
          });
        }
      }
    }

    // Send confirmation email (if email service is configured)
    await sendOrderConfirmationEmail(order, session);

    // Update inventory (if inventory tracking is enabled)
    await updateInventory(session);

    return { success: true, orderId: order.id };

  } catch (error) {
    log('error', 'Failed to process checkout session', error);
    throw error;
  }
};

// Process payment intent succeeded
const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    log('info', 'Processing payment intent succeeded', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

    // Update order status if we have the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_id', paymentIntent.id)
      .single();

    if (order && !orderError) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        log('error', 'Failed to update order status', updateError);
      } else {
        log('info', 'Order status updated to processing', { orderId: order.id });
      }
    }

    return { success: true };

  } catch (error) {
    log('error', 'Failed to process payment intent', error);
    throw error;
  }
};

// Process payment intent failed
const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    log('warn', 'Processing payment intent failed', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      last_payment_error: paymentIntent.last_payment_error,
    });

    // Update order status if we have the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_id', paymentIntent.id)
      .single();

    if (order && !orderError) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'failed',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        log('error', 'Failed to update order status', updateError);
      } else {
        log('info', 'Order status updated to cancelled', { orderId: order.id });
      }
    }

    return { success: true };

  } catch (error) {
    log('error', 'Failed to process payment intent failure', error);
    throw error;
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order: any, session: Stripe.Checkout.Session) => {
  try {
    // This would integrate with your email service (SendGrid, Resend, etc.)
    // For now, we'll just log the email data
    log('info', 'Order confirmation email would be sent', {
      orderId: order.id,
      customerEmail: session.customer_email,
      amount: session.amount_total,
    });

    // Example integration with a hypothetical email service:
    /*
    const emailData = {
      to: session.customer_email,
      subject: `Order Confirmation - VLANCO #${order.id}`,
      template: 'order-confirmation',
      data: {
        orderId: order.id,
        customerName: session.customer_details?.name,
        amount: session.amount_total,
        currency: session.currency,
        items: session.line_items,
      },
    };

    await emailService.send(emailData);
    */

  } catch (error) {
    log('error', 'Failed to send order confirmation email', error);
    // Don't throw here - email failure shouldn't break the webhook
  }
};

// Update inventory
const updateInventory = async (session: Stripe.Checkout.Session) => {
  try {
    // This would update your inventory system
    // For now, we'll just log the inventory update
    log('info', 'Inventory would be updated', {
      sessionId: session.id,
      lineItems: session.line_items,
    });

    // Example inventory update:
    /*
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    
    for (const item of lineItems.data) {
      const productId = item.price?.metadata?.product_id;
      const quantity = item.quantity;
      
      if (productId && quantity) {
        await inventoryService.decreaseStock(productId, quantity);
      }
    }
    */

  } catch (error) {
    log('error', 'Failed to update inventory', error);
    // Don't throw here - inventory failure shouldn't break the webhook
  }
};

// Main webhook handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only handle POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the request body
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      log('error', 'Webhook signature verification failed', err);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    log('info', `Received webhook event: ${event.type}`, {
      eventId: event.id,
      type: event.type,
    });

    // Handle the event
    let result;
    switch (event.type) {
      case 'checkout.session.completed':
        result = await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        result = await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        result = await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        log('info', `Unhandled event type: ${event.type}`);
        result = { success: true, message: 'Event not handled' };
    }

    log('info', `Webhook event processed successfully: ${event.type}`, result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventType: event.type,
        eventId: event.id,
        result,
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    return handleError(error, 'webhook handler');
  }
});
