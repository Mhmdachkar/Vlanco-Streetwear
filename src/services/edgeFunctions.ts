import { supabase } from '@/integrations/supabase/client';

export async function applyDiscount(code: string, cartSubtotal: number) {
  const { data, error } = await supabase.functions.invoke('discounts-apply', {
    body: { code, cartSubtotal },
  });
  if (error) throw error;
  return data as { ok: boolean; amountOff: number; newSubtotal: number };
}

export async function mergeGuestCart(items: Array<{ product_id: string; variant_id: string; quantity: number }>) {
  const { data, error } = await supabase.functions.invoke('cart-merge', {
    body: { items },
  });
  if (error) throw error;
  return data as { ok: boolean; merged: number };
}

export async function createCheckoutSession(cartItems: Array<{ product_id: string; variant_id: string; quantity: number }>, discountCode?: string) {
  const { data, error } = await supabase.functions.invoke('checkout-create-session', {
    body: { cartItems, discountCode },
  });
  if (error) throw error;
  return data as { url: string; id: string };
}

export async function createLocalCheckoutSession(lineItems: any[], cartItems: any[], discountCode?: string) {
  const { data, error } = await supabase.functions.invoke('checkout-local-session', {
    body: { lineItems, cartItems, discountCode },
  });
  if (error) throw error;
  return data as { url: string; sessionId: string; subtotal: number };
}


export async function trackAnalytics(event_type: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('analytics-track', {
    body: { event_type, ...payload },
  });
  if (error) throw error;
  return data as { ok: boolean };
}

export async function submitReview(product_id: string, rating: number, comment?: string, images?: string[]) {
  const { data, error } = await supabase.functions.invoke('reviews-submit', {
    body: { product_id, rating, comment, images },
  });
  if (error) throw error;
  return data as { ok: boolean };
}

export async function enqueueNotification(input: { user_id: string; title: string; message: string; type?: string; data?: unknown }) {
  const { data, error } = await supabase.functions.invoke('notifications-enqueue', {
    body: input,
  });
  if (error) throw error;
  return data as { ok: boolean };
}


