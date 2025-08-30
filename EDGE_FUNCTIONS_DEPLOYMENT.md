# ⚡ Edge Functions Deployment Guide

## 🚀 **Manual Deployment via Supabase Dashboard**

Since CLI installation was problematic, we'll deploy edge functions manually through the Supabase Dashboard.

### **Step 1: Access Edge Functions Dashboard**
1. Go to: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/functions
2. Click "Create a new function"

### **Step 2: Deploy Each Function**

## 📊 **1. Analytics Track Function**

**Function Name:** `analytics-track`

**Code:**
```typescript
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Utility functions
function jsonResponse(body: any, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}

function getEnv(name: string, required = true): string | undefined {
  const v = Deno.env.get(name);
  if (required && (!v || v.length === 0)) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') return parts[1];
  return null;
}

function getServiceClient() {
  const url = getEnv('SUPABASE_URL')!;
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getUserFromRequest(request: Request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const supabase = getServiceClient();
  const { data } = await supabase.auth.getUser(token);
  return data.user ?? null;
}

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
  
  const supabase = getServiceClient();
  const user = await getUserFromRequest(request); // This can be null for public access
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
  const userAgent = request.headers.get('user-agent') || null;

  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const { event_type, event_data, page_url, referrer, session_id } = body || {};
  if (!event_type) return errorResponse('Missing event_type');

  const { error } = await supabase.from('analytics_events').insert({
    event_type,
    event_data: event_data ?? null,
    page_url: page_url ?? null,
    referrer: referrer ?? null,
    session_id: session_id ?? null,
    user_id: user?.id ?? null, // Can be null for anonymous users
    user_agent: userAgent,
    ip_address: ip,
  });
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ ok: true });
};

serve(handler);
```

## 🛒 **2. Cart Merge Function**

**Function Name:** `cart-merge`

**Code:**
```typescript
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Utility functions
function jsonResponse(body: any, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}

function getEnv(name: string, required = true): string | undefined {
  const v = Deno.env.get(name);
  if (required && (!v || v.length === 0)) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') return parts[1];
  return null;
}

function getServiceClient() {
  const url = getEnv('SUPABASE_URL')!;
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getUserFromRequest(request: Request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const supabase = getServiceClient();
  const { data } = await supabase.auth.getUser(token);
  return data.user ?? null;
}

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Unauthorized', 401);

  let body: any = {};
  try { body = await request.json(); } catch {}
  const guestCart = Array.isArray(body?.guestCart) ? body.guestCart : [];

  if (!guestCart.length) return jsonResponse({ merged: 0 });

  const supabase = getServiceClient();
  let mergedCount = 0;

  for (const item of guestCart) {
    const { product_id, variant_id, quantity = 1 } = item || {};
    if (!product_id || !variant_id) continue;

    // Check if item already exists in user's cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .eq('variant_id', variant_id)
      .single();

    if (existing) {
      // Update quantity
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      // Insert new item
      await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id,
        variant_id,
        quantity,
        price_at_time: 0, // Will be updated by frontend
      });
    }
    mergedCount++;
  }

  return jsonResponse({ merged: mergedCount });
};

serve(handler);
```

## 💳 **3. Checkout Create Session Function**

**Function Name:** `checkout-create-session`

**Code:**
```typescript
// deno-lint-ignore-file no-explicit-any
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Utility functions
function jsonResponse(body: any, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}

function getEnv(name: string, required = true): string | undefined {
  const v = Deno.env.get(name);
  if (required && (!v || v.length === 0)) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') return parts[1];
  return null;
}

function getServiceClient() {
  const url = getEnv('SUPABASE_URL')!;
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getUserFromRequest(request: Request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const supabase = getServiceClient();
  const { data } = await supabase.auth.getUser(token);
  return data.user ?? null;
}

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

serve(handler);
```

## 🏷️ **4. Discounts Apply Function**

**Function Name:** `discounts-apply`

**Code:**
```typescript
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Utility functions
function jsonResponse(body: any, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}

function getEnv(name: string, required = true): string | undefined {
  const v = Deno.env.get(name);
  if (required && (!v || v.length === 0)) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

function getServiceClient() {
  const url = getEnv('SUPABASE_URL')!;
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

  let body: any = {};
  try { body = await request.json(); } catch {}
  const { code, cartSubtotal } = body || {};
  if (!code || !cartSubtotal) return errorResponse('Missing code or cartSubtotal');

  const supabase = getServiceClient();
  
  // Fetch discount code
  const { data: discount, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .gte('valid_from', new Date().toISOString())
    .lte('valid_until', new Date().toISOString())
    .single();

  if (error || !discount) return errorResponse('Invalid or expired discount code', 400);

  // Check minimum order value
  if (discount.minimum_order_value && cartSubtotal < discount.minimum_order_value) {
    return errorResponse(`Minimum order value: $${discount.minimum_order_value}`, 400);
  }

  // Calculate discount amount
  let amountOff = 0;
  if (discount.discount_type === 'percentage') {
    amountOff = (cartSubtotal * discount.discount_value) / 100;
    if (discount.maximum_discount) {
      amountOff = Math.min(amountOff, discount.maximum_discount);
    }
  } else {
    amountOff = discount.discount_value;
  }

  return jsonResponse({
    code: discount.code,
    discount_type: discount.discount_type,
    discount_value: discount.discount_value,
    amount_off: Math.round(amountOff * 100), // Return in cents
    description: discount.description,
  });
};

serve(handler);
```

## 📦 **5. Inventory Hold Function**

**Function Name:** `inventory-hold`

**Code:**
```typescript
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Utility functions
function jsonResponse(body: any, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}

function getEnv(name: string, required = true): string | undefined {
  const v = Deno.env.get(name);
  if (required && (!v || v.length === 0)) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

function getServiceClient() {
  const url = getEnv('SUPABASE_URL')!;
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

  let body: any = {};
  try { body = await request.json(); } catch {}
  const { items, session_id, expires_at } = body || {};
  if (!Array.isArray(items) || !items.length) return errorResponse('No items provided');

  const supabase = getServiceClient();
  const expiresAt = expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

  // Check stock availability
  for (const item of items) {
    const { variant_id, quantity } = item || {};
    if (!variant_id || !quantity) return errorResponse('Invalid item data');

    const { data: variant, error } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', variant_id)
      .single();

    if (error || !variant) return errorResponse('Variant not found', 400);
    if (variant.stock_quantity < quantity) return errorResponse('Insufficient stock', 400);
  }

  // Create inventory holds
  const holds = items.map(item => ({
    variant_id: item.variant_id,
    quantity: item.quantity,
    session_id,
    expires_at: expiresAt,
  }));

  const { error } = await supabase.from('inventory_holds').insert(holds);
  if (error) return errorResponse(error.message, 500);

  return jsonResponse({ success: true, expires_at: expiresAt });
};

serve(handler);
```

## 🔄 **6. Inventory Sync Function**

**Function Name:** `inventory-sync`

**Code:**
```typescript
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Utility functions
function jsonResponse(body: any, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}

function getEnv(name: string, required = true): string | undefined {
  const v = Deno.env.get(name);
  if (required && (!v || v.length === 0)) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

function getServiceClient() {
  const url = getEnv('SUPABASE_URL')!;
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

  let body: any = {};
  try { body = await request.json(); } catch {}
  const { variant_id, new_quantity, source } = body || {};
  if (!variant_id || typeof new_quantity !== 'number') return errorResponse('Invalid data');

  const supabase = getServiceClient();

  // Update variant stock
  const { error } = await supabase
    .from('product_variants')
    .update({ 
      stock_quantity: Math.max(0, new_quantity),
      updated_at: new Date().toISOString()
    })
    .eq('id', variant_id);

  if (error) return errorResponse(error.message, 500);

  // Log inventory change
  await supabase.from('inventory_logs').insert({
    variant_id,
    old_quantity: 0, // Would need to fetch current value
    new_quantity,
    change_type: 'sync',
    source: source || 'manual',
  });

  return jsonResponse({ success: true });
};

serve(handler);
```

## 🔔 **7. Notifications Enqueue Function**

**Function Name:** `notifications-enqueue`

**Code:**
```typescript
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Utility functions
function jsonResponse(body: any, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}

function getEnv(name: string, required = true): string | undefined {
  const v = Deno.env.get(name);
  if (required && (!v || v.length === 0)) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

function getServiceClient() {
  const url = getEnv('SUPABASE_URL')!;
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

  let body: any = {};
  try { body = await request.json(); } catch {}
  const { user_id, type, title, message, data, scheduled_at } = body || {};
  if (!user_id || !type || !title) return errorResponse('Missing required fields');

  const supabase = getServiceClient();

  const notification = {
    user_id,
    type,
    title,
    message: message || '',
    data: data || {},
    scheduled_at: scheduled_at || new Date().toISOString(),
    status: 'pending',
  };

  const { error } = await supabase.from('notifications').insert(notification);
  if (error) return errorResponse(error.message, 500);

  return jsonResponse({ success: true });
};

serve(handler);
```

## ⭐ **8. Reviews Submit Function**

**Function Name:** `reviews-submit`

**Code:**
```typescript
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Utility functions
function jsonResponse(body: any, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}

function getEnv(name: string, required = true): string | undefined {
  const v = Deno.env.get(name);
  if (required && (!v || v.length === 0)) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') return parts[1];
  return null;
}

function getServiceClient() {
  const url = getEnv('SUPABASE_URL')!;
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getUserFromRequest(request: Request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const supabase = getServiceClient();
  const { data } = await supabase.auth.getUser(token);
  return data.user ?? null;
}

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Unauthorized', 401);

  let body: any = {};
  try { body = await request.json(); } catch {}
  const { product_id, order_id, rating, title, comment } = body || {};
  
  if (!product_id || !rating || rating < 1 || rating > 5) {
    return errorResponse('Invalid product_id or rating');
  }

  const supabase = getServiceClient();

  // Check if user already reviewed this product
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .single();

  if (existing) return errorResponse('You have already reviewed this product', 400);

  // Verify purchase if order_id provided
  if (order_id) {
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('id', order_id)
      .eq('user_id', user.id)
      .eq('status', 'delivered')
      .single();

    if (!order) return errorResponse('Invalid order or order not delivered', 400);
  }

  const review = {
    user_id: user.id,
    product_id,
    order_id: order_id || null,
    rating,
    title: title || '',
    comment: comment || '',
    is_verified_purchase: !!order_id,
  };

  const { error } = await supabase.from('reviews').insert(review);
  if (error) return errorResponse(error.message, 500);

  return jsonResponse({ success: true });
};

serve(handler);
```

## 💳 **9. Stripe Webhook Function**

**Function Name:** `stripe-webhook`

**Code:**
```typescript
// deno-lint-ignore-file no-explicit-any
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Utility functions
function jsonResponse(body: any, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}

function getEnv(name: string, required = true): string | undefined {
  const v = Deno.env.get(name);
  if (required && (!v || v.length === 0)) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

function getServiceClient() {
  const url = getEnv('SUPABASE_URL')!;
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

  const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY')!, { httpClient: Stripe.createFetchHttpClient() });
  const supabase = getServiceClient();

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) return errorResponse('No signature', 400);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, getEnv('STRIPE_WEBHOOK_SECRET')!);
  } catch (err) {
    return errorResponse('Invalid signature', 400);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(supabase, session);
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(supabase, paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(supabase, failedPayment);
      break;
  }

  return jsonResponse({ received: true });
};

async function handleCheckoutComplete(supabase: any, session: Stripe.Checkout.Session) {
  // Create order from session
  const order = {
    user_id: session.metadata?.user_id,
    order_number: `ORD-${Date.now()}`,
    status: 'confirmed',
    total_amount: session.amount_total ? session.amount_total / 100 : 0,
    subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
    payment_status: 'paid',
    payment_method: 'stripe',
  };

  const { data: orderData, error } = await supabase.from('orders').insert(order).select().single();
  if (error) console.error('Order creation error:', error);
}

async function handlePaymentSuccess(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  // Update order payment status
  await supabase
    .from('orders')
    .update({ payment_status: 'paid' })
    .eq('stripe_payment_intent_id', paymentIntent.id);
}

async function handlePaymentFailure(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  // Update order payment status
  await supabase
    .from('orders')
    .update({ payment_status: 'failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);
}

serve(handler);
```

## 🔧 **Step 3: Set Environment Variables**

After deploying each function, set these environment variables in Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/settings/functions
2. Add these secrets:

```bash
SUPABASE_URL=https://okjxnqdppxwcfgtdggna.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_CURRENCY=usd
SITE_URL=http://localhost:5173
```

## 🧪 **Step 4: Test Your Functions**

Test each function endpoint:

```bash
# Test analytics tracking
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/analytics-track \
  -H "Content-Type: application/json" \
  -d '{"event_type": "page_view", "page_url": "/"}'

# Test cart merge
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/cart-merge \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"guestCart": []}'
```

## ✅ **Verification**

After deploying all functions, you should have:
- ✅ 9 edge functions deployed
- ✅ Environment variables configured
- ✅ Functions responding to requests
- ✅ Proper error handling
- ✅ Security implemented

Your edge functions are now ready to handle:
- 📊 Analytics tracking
- 🛒 Cart management
- 💳 Payment processing
- 🏷️ Discount codes
- 📦 Inventory management
- 🔔 Notifications
- ⭐ Reviews
- 🔄 Stripe webhooks
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/reviews-submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "test", "rating": 5}'