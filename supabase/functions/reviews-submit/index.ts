// deno-lint-ignore-file no-explicit-any
import { getServiceClient, getUserFromRequest, jsonResponse, errorResponse } from '../_shared/utils.ts';

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Unauthorized', 401);

  let body: any = {};
  try { body = await request.json(); } catch {}
  const { product_id, rating, comment, images } = body || {};
  if (!product_id || !(Number(rating) >= 1 && Number(rating) <= 5)) return errorResponse('Invalid input');

  const supabase = getServiceClient();
  // Verify purchase
  const { data: orders } = await supabase
    .from('order_items')
    .select('order_id, orders(user_id, payment_status)')
    .eq('product_id', product_id)
    .limit(1);
  const hasPurchase = !!orders?.find((oi: any) => oi.orders?.user_id === user.id && oi.orders?.payment_status === 'paid');
  if (!hasPurchase) return errorResponse('Only verified purchasers can review', 403);

  const { error } = await supabase.from('reviews').insert({
    product_id,
    user_id: user.id,
    rating: Number(rating),
    comment: comment || null,
    images: Array.isArray(images) ? images : null,
    is_verified_purchase: true,
  });
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ ok: true });
};

serve(handler);


