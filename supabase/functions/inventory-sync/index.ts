// deno-lint-ignore-file no-explicit-any
import { getServiceClient, getUserFromRequest, jsonResponse, errorResponse } from '../_shared/utils.ts';

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
  const user = await getUserFromRequest(request);
  // Simple admin guard: extend with roles/claims as needed
  if (!user) return errorResponse('Unauthorized', 401);

  let body: any = {};
  try { body = await request.json(); } catch {}
  const { variant_id, delta } = body || {};
  if (!variant_id || typeof delta !== 'number') return errorResponse('Invalid input');

  const supabase = getServiceClient();
  const { data: variant, error } = await supabase
    .from('product_variants')
    .select('id, stock_quantity')
    .eq('id', variant_id)
    .single();
  if (error || !variant) return errorResponse('Variant not found', 404);

  const next = (variant.stock_quantity ?? 0) + delta;
  const { error: upErr } = await supabase
    .from('product_variants')
    .update({ stock_quantity: next })
    .eq('id', variant_id);
  if (upErr) return errorResponse(upErr.message, 500);

  await supabase.from('inventory_transactions').insert({
    variant_id,
    quantity: delta,
    type: delta >= 0 ? 'adjust_in' : 'adjust_out',
    notes: 'sync via edge function'
  });

  return jsonResponse({ ok: true, stock_quantity: next });
};

serve(handler);


