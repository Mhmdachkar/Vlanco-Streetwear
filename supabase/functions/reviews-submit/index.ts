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
    
    const { product_id, rating, title, comment, images, order_id } = body || {};
    if (!product_id || !(Number(rating) >= 1 && Number(rating) <= 5)) {
      return errorResponse('Invalid input: product_id and rating (1-5) required');
    }

    const supabase = getServiceClient();
    
    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', product_id)
      .eq('user_id', user.id)
      .single();

    if (existingReview) {
      return errorResponse('You have already reviewed this product', 409);
    }

    // Verify purchase if order_id provided
    let isVerifiedPurchase = false;
    if (order_id) {
      const { data: orderItem } = await supabase
        .from('order_items')
        .select('id, orders(user_id, payment_status)')
        .eq('order_id', order_id)
        .eq('product_id', product_id)
        .single();
        
      if (orderItem && (orderItem as any).orders?.user_id === user.id && (orderItem as any).orders?.payment_status === 'paid') {
        isVerifiedPurchase = true;
      }
    }

    const { error } = await supabase.from('reviews').insert({
      product_id,
      user_id: user.id,
      order_id: order_id || null,
      rating: Number(rating),
      title: title || null,
      comment: comment || null,
      images: Array.isArray(images) ? images : null,
      is_verified_purchase: isVerifiedPurchase,
      created_at: new Date().toISOString(),
    });
    
    if (error) {
      console.error('Review submission error:', error);
      return errorResponse(`Database error: ${error.message}`, 500);
    }
    
    return jsonResponse({ 
      success: true, 
      message: 'Review submitted successfully',
      is_verified_purchase: isVerifiedPurchase
    });
  } catch (error) {
    console.error('Review submit function error:', error);
    return errorResponse(`Internal server error: ${error.message}`, 500);
  }
};

serve(handler);


