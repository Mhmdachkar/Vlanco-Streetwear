// deno-lint-ignore-file no-explicit-any
import { getServiceClient, getUserFromRequest, jsonResponse, errorResponse } from '../_shared/utils.ts';

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Unauthorized', 401);

  let body: any = {};
  try { body = await request.json(); } catch {}
  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) return jsonResponse({ ok: true, merged: 0 });

  const supabase = getServiceClient();
  let merged = 0;
  for (const item of items) {
    const { product_id, variant_id, quantity } = item || {};
    if (!product_id || !variant_id) continue;
    const qty = Math.max(1, Number(quantity || 1));

    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .eq('variant_id', variant_id)
      .single();

    if (existing) {
      const nextQty = (existing as any).quantity + qty;
      const { error: upErr } = await supabase
        .from('cart_items')
        .update({ quantity: nextQty })
        .eq('id', (existing as any).id);
      if (!upErr) merged++;
    } else {
      const { error: insErr } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id, variant_id, quantity: qty, added_at: new Date().toISOString() });
      if (!insErr) merged++;
    }
  }

  return jsonResponse({ ok: true, merged });
};

serve(handler);


