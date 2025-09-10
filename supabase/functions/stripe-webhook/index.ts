// deno-lint-ignore-file no-explicit-any
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';
import { getEnv, getServiceClient, jsonResponse, errorResponse } from '../_shared/utils.ts';

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

  const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY')!, { httpClient: Stripe.createFetchHttpClient() });
  const sig = request.headers.get('stripe-signature');
  if (!sig) return errorResponse('Missing signature', 400);
  const webhookSecret = getEnv('STRIPE_WEBHOOK_SECRET')!;
  const body = await request.text();

  let evt: any;
  try {
    evt = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err: any) {
    return errorResponse(`Webhook error: ${err.message}`, 400);
  }

  const supabase = getServiceClient();

  try {
    switch (evt.type) {
      case 'checkout.session.completed': {
        const session = evt.data.object as any;
        const userId = session?.metadata?.user_id || null;
        const discountCode = session?.metadata?.discount_code || null;
        // Record order basic info
        const { error } = await supabase.from('orders').insert({
          id: session.id,
          user_id: userId,
          email: session.customer_details?.email || null,
          subtotal: Math.round((session.amount_subtotal || 0) / 100),
          total_amount: Math.round((session.amount_total || 0) / 100),
          payment_status: 'paid',
          status: 'paid',
          currency: session.currency?.toUpperCase() || 'USD',
          order_number: session.id,
          shipping_amount: Math.round((session.total_details?.amount_shipping || 0) / 100) || null,
          discount_amount: Math.round((session.total_details?.amount_discount || 0) / 100) || null,
        });
        if (error) throw error;
        // TODO: insert order_items, decrement inventory, discount_usage
        break;
      }
      case 'payment_intent.payment_failed': {
        // Optionally handle failures
        break;
      }
      default:
        break;
    }
  } catch (e: any) {
    return errorResponse(e.message || 'Webhook processing failed', 500);
  }

  return jsonResponse({ received: true });
};

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(handler);


