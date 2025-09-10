// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getServiceClient, getUserFromRequest, jsonResponse, errorResponse } from '../_shared/utils.ts';

const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
  
  try {
    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('Unauthorized', 401);

    let body: any = {};
    try { 
      body = await request.json(); 
    } catch (error) {
      return errorResponse('Invalid JSON body', 400);
    }
    
    const items = Array.isArray(body?.items) ? body.items : [];
    if (!items.length) return jsonResponse({ success: true, merged: 0, message: 'No items to merge' });

    const supabase = getServiceClient();
    let merged = 0;
    let errors = 0;
    
    for (const item of items) {
      const { product_id, variant_id, quantity, price_at_time } = item || {};
      if (!product_id || !variant_id) {
        errors++;
        continue;
      }
      
      const qty = Math.max(1, Number(quantity || 1));
      const price = Number(price_at_time || 0);

      try {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', product_id)
          .eq('variant_id', variant_id)
          .single();

        if (existing) {
          const nextQty = (existing as any).quantity + qty;
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ 
              quantity: nextQty,
              updated_at: new Date().toISOString()
            })
            .eq('id', (existing as any).id);
          
          if (!updateError) {
            merged++;
          } else {
            console.error('Cart update error:', updateError);
            errors++;
          }
        } else {
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({ 
              user_id: user.id, 
              product_id, 
              variant_id, 
              quantity: qty,
              price_at_time: price,
              added_at: new Date().toISOString() 
            });
          
          if (!insertError) {
            merged++;
          } else {
            console.error('Cart insert error:', insertError);
            errors++;
          }
        }
      } catch (error) {
        console.error('Cart merge item error:', error);
        errors++;
      }
    }

    return jsonResponse({ 
      success: true, 
      merged, 
      errors,
      message: `Successfully merged ${merged} items${errors > 0 ? ` (${errors} errors)` : ''}`
    });
  } catch (error) {
    console.error('Cart merge function error:', error);
    return errorResponse(`Internal server error: ${error.message}`, 500);
  }
};

serve(handler);


