import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type CartItemRow = Tables<'cart_items'>;
export type ProductRow = Tables<'products'>;
export type VariantRow = Tables<'product_variants'>;

export async function fetchCartByUser(userId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`*, product:products(*), variant:product_variants(*)`)
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertCartItem(userId: string, productId: string, variantId: string, deltaQuantity: number) {
  // Try find existing
  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('variant_id', variantId)
    .single();

  if (existing) {
    const nextQty = (existing as any).quantity + deltaQuantity;
    if (nextQty <= 0) {
      const { error } = await supabase.from('cart_items').delete().eq('id', (existing as any).id);
      if (error) throw error;
      return { removed: true } as const;
    }
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: nextQty })
      .eq('id', (existing as any).id);
    if (error) throw error;
    return { updated: true } as const;
  }

  const { error } = await supabase.from('cart_items').insert({
    user_id: userId,
    product_id: productId,
    variant_id: variantId,
    quantity: Math.max(1, deltaQuantity),
    added_at: new Date().toISOString(),
  });
  if (error) throw error;
  return { inserted: true } as const;
}

export async function removeCartItem(userId: string, itemId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function clearCart(userId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}


