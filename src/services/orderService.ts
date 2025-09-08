import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type OrderRow = Tables<'orders'>;
export type OrderItemRow = Tables<'order_items'>;

export interface OrderWithItems extends OrderRow {
  items?: OrderItemRow[];
}

// Fetch orders for a user
export async function fetchUserOrders(userId: string): Promise<OrderWithItems[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as OrderWithItems[] || [];
}

// Fetch a specific order
export async function fetchOrderById(orderId: string, userId: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as OrderWithItems || null;
}

// Create a new order
export async function createOrder(params: {
  userId: string;
  email: string;
  phone?: string;
  billingAddress: any;
  shippingAddress: any;
  subtotal: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentId?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    productName: string;
    variantName?: string;
    productImage?: string;
    quantity: number;
    price: number;
  }>;
}): Promise<OrderRow> {
  // Generate order number
  const orderNumber = `VLN-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: params.userId,
      order_number: orderNumber,
      email: params.email,
      phone: params.phone,
      billing_address: params.billingAddress,
      shipping_address: params.shippingAddress,
      subtotal: params.subtotal,
      tax_amount: params.taxAmount || 0,
      shipping_amount: params.shippingAmount || 0,
      discount_amount: params.discountAmount || 0,
      total_amount: params.totalAmount,
      payment_method: params.paymentMethod,
      payment_id: params.paymentId,
      status: 'pending',
      payment_status: 'pending',
      fulfillment_status: 'unfulfilled',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = params.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId,
    product_name: item.productName,
    variant_name: item.variantName,
    product_image: item.productImage,
    quantity: item.quantity,
    price: item.price,
    created_at: new Date().toISOString(),
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
}

// Update order status
export async function updateOrderStatus(params: {
  orderId: string;
  status?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  trackingNumber?: string;
  notes?: string;
}): Promise<void> {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (params.status) updateData.status = params.status;
  if (params.paymentStatus) updateData.payment_status = params.paymentStatus;
  if (params.fulfillmentStatus) updateData.fulfillment_status = params.fulfillmentStatus;
  if (params.trackingNumber) updateData.tracking_number = params.trackingNumber;
  if (params.notes) updateData.notes = params.notes;

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', params.orderId);

  if (error) throw error;
}

// Get order statistics for a user
export async function getUserOrderStats(userId: string): Promise<{
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  ordersByStatus: { [key: string]: number };
}> {
  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, status')
    .eq('user_id', userId);

  if (!orders || orders.length === 0) {
    return {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      ordersByStatus: {},
    };
  }

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const averageOrderValue = totalSpent / totalOrders;

  const ordersByStatus = orders.reduce((stats, order) => {
    const status = order.status || 'unknown';
    stats[status] = (stats[status] || 0) + 1;
    return stats;
  }, {} as { [key: string]: number });

  return {
    totalOrders,
    totalSpent,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    ordersByStatus,
  };
}

// Cancel an order (if allowed)
export async function cancelOrder(orderId: string, userId: string, reason?: string): Promise<void> {
  // Check if order can be cancelled (only if status is 'pending' or 'confirmed')
  const { data: order } = await supabase
    .from('orders')
    .select('status, fulfillment_status')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    throw new Error('Order cannot be cancelled at this stage');
  }

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      notes: reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('user_id', userId);

  if (error) throw error;
}
