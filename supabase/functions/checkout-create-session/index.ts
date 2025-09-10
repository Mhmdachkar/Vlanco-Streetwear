// deno-lint-ignore-file no-explicit-any
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';
import { getEnv, getServiceClient, getUserFromRequest, jsonResponse, errorResponse } from '../_shared/utils.ts';

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Unauthorized', 401);

  let body: any = {};
  try { body = await request.json(); } catch {}
  const items = Array.isArray(body?.cartItems) ? body.cartItems : [];
  const discountCode = (body?.discountCode || '').trim();
  if (!items.length) return errorResponse('Cart is empty');

  const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY')!, { httpClient: Stripe.createFetchHttpClient() });
  const supabase = getServiceClient();

  // Fetch product/variant data to build line items and validate stock
  const lineItems: any[] = [];
  let subtotal = 0;
  for (const item of items) {
    const { product_id, variant_id, quantity } = item || {};
    const qty = Math.max(1, Number(quantity || 1));
    if (!product_id || !variant_id) return errorResponse('Invalid item');

    const { data: variant, error: vErr } = await supabase
      .from('product_variants')
      .select('id, price, stock_quantity, size, color, product_id, products(name)')
      .eq('id', variant_id)
      .single();
    if (vErr || !variant) return errorResponse('Variant not found', 400);
    if (variant.stock_quantity !== null && qty > variant.stock_quantity) return errorResponse('Insufficient stock', 400);

    const unit = Math.round((variant.price || 0) * 100);
    subtotal += unit * qty;
    lineItems.push({
      price_data: {
        currency: (Deno.env.get('STRIPE_CURRENCY') || 'usd').toLowerCase(),
        product_data: { name: variant.products?.name || 'Product', metadata: { product_id, variant_id } },
        unit_amount: unit,
      },
      quantity: qty,
    });
  }

  // Optional: apply discount preview (actual usage accounted in webhook)
  if (discountCode) {
    try {
      const resp = await fetch(new URL('/functions/v1/discounts-apply', getEnv('SUPABASE_URL')!), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: request.headers.get('Authorization') || '' },
        body: JSON.stringify({ code: discountCode, cartSubtotal: Math.round(subtotal / 100) })
      });
      if (resp.ok) {
        const d = await resp.json();
        if (d?.amountOff) {
          // Stripe coupon creation is out of scope here; keep metadata of code
        }
      }
    } catch {}
  }

  const siteUrl = getEnv('SITE_URL')!;
  const successPath = Deno.env.get('STRIPE_SUCCESS_PATH') || '/checkout/success';
  const cancelPath = Deno.env.get('STRIPE_CANCEL_PATH') || '/checkout/cancel';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${siteUrl}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}${cancelPath}`,
    customer_email: user.email || undefined,
    metadata: { user_id: user.id, discount_code: discountCode || '' },
  });

  return jsonResponse({ url: session.url, id: session.id });
};

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(handler);


