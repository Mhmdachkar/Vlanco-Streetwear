// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function jsonResponse(body: any, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}

export function getEnv(name: string, required = true): string | undefined {
  const v = Deno.env.get(name);
  if (required && (!v || v.length === 0)) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

export function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') return parts[1];
  return null;
}

export function getServiceClient() {
  const url = getEnv('SUPABASE_URL')!;
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getUserFromRequest(request: Request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const supabase = getServiceClient();
  const { data } = await supabase.auth.getUser(token);
  return data.user ?? null;
}


