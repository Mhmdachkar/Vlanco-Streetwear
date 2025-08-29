// deno-lint-ignore-file no-explicit-any
import { getServiceClient, jsonResponse, errorResponse } from '../_shared/utils.ts';

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
  let body: any = {};
  try { body = await request.json(); } catch {}
  const code = (body?.code || '').trim();
  const subtotal = Number(body?.cartSubtotal || 0);
  if (!code) return errorResponse('Missing code');
  if (!(subtotal > 0)) return errorResponse('Invalid subtotal');

  const supabase = getServiceClient();
  const { data: discount, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();
  if (error) return errorResponse(error.message, 500);
  if (!discount) return errorResponse('Invalid code', 404);

  const now = new Date();
  if (discount.start_date && new Date(discount.start_date) > now) return errorResponse('Code not started', 400);
  if (discount.end_date && new Date(discount.end_date) < now) return errorResponse('Code expired', 400);
  if (discount.minimum_order_amount && subtotal < discount.minimum_order_amount) return errorResponse('Minimum not met', 400);

  let amountOff = 0;
  if (discount.type === 'percentage') amountOff = Math.round(subtotal * (discount.value / 100));
  else amountOff = Math.min(subtotal, discount.value);

  return jsonResponse({
    ok: true,
    code: discount.code,
    type: discount.type,
    value: discount.value,
    amountOff,
    newSubtotal: Math.max(0, subtotal - amountOff)
  });
};

serve(handler);


