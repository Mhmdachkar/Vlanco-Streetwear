// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getServiceClient, getUserFromRequest, jsonResponse, errorResponse } from '../_shared/utils.ts';

const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
  
  try {
    const supabase = getServiceClient();
    const user = await getUserFromRequest(request);
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;

    let body: any = {};
    try {
      body = await request.json();
    } catch (error) {
      return errorResponse('Invalid JSON body', 400);
    }

    const { event_type, event_data, page_url, referrer, session_id } = body || {};
    if (!event_type) return errorResponse('Missing event_type');

    const { error } = await supabase.from('analytics_events').insert({
      event_type,
      event_data: event_data ?? null,
      page_url: page_url ?? null,
      referrer: referrer ?? null,
      session_id: session_id ?? null,
      user_id: user?.id ?? null,
      user_agent: userAgent,
      ip_address: ip,
      created_at: new Date().toISOString(),
    });
    
    if (error) {
      console.error('Analytics tracking error:', error);
      return errorResponse(`Database error: ${error.message}`, 500);
    }
    
    return jsonResponse({ success: true, message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Analytics function error:', error);
    return errorResponse(`Internal server error: ${error.message}`, 500);
  }
};

serve(handler);


