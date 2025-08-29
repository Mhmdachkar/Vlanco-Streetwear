// deno-lint-ignore-file no-explicit-any
import { getServiceClient, getUserFromRequest, jsonResponse, errorResponse } from '../_shared/utils.ts';

export const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
  const user = await getUserFromRequest(request);
  if (!user) return errorResponse('Unauthorized', 401);

  let body: any = {};
  try { body = await request.json(); } catch {}
  const { user_id, title, message, type, data } = body || {};
  if (!user_id || !title || !message) return errorResponse('Missing fields');

  const supabase = getServiceClient();
  const { error } = await supabase.from('notifications').insert({
    user_id,
    title,
    message,
    type: type || 'info',
    data: data || null,
  });
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ ok: true });
};

serve(handler);


