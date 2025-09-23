// deno-lint-ignore-file no-explicit-any
import { getServiceClient, getUserFromRequest, jsonResponse, errorResponse } from '../_shared/utils.ts';

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Unauthorized', 401);

  let body: any = {};
  try { body = await request.json(); } catch (e) {
    console.warn('Failed to parse request body:', e);
    return errorResponse('Invalid request body');
  }
  const items = Array.isArray(body?.items) ? body.items : [];
  const orderId = body?.orderId || null;
  if (!items.length || !orderId) return errorResponse('Missing items or orderId');

  const supabase = getServiceClient();
  // Basic non-transactional check (Supabase Edge lacks multi-stmt tx; consider RPC for real atomicity)
  for (const item of items) {
    const { variant_id, quantity } = item || {};
    const qty = Math.max(1, Number(quantity || 1));
    const { data: variant, error } = await supabase
      .from('product_variants')
      .select('id, stock_quantity')
      .eq('id', variant_id)
      .single();
    if (error || !variant) return errorResponse('Variant not found', 400);
    if (variant.stock_quantity !== null && qty > variant.stock_quantity) return errorResponse('Insufficient stock', 400);
    const { error: upErr } = await supabase
      .from('product_variants')
      .update({ stock_quantity: (variant.stock_quantity ?? 0) - qty })
      .eq('id', variant_id);
    if (upErr) return errorResponse(upErr.message, 500);
  }

  return jsonResponse({ ok: true });
};

serve(handler);


