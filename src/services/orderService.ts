/**
 * Enhanced Order Management Service
 * Handles order creation, tracking, and management with comprehensive features
 */

import { createClient } from '@supabase/supabase-js';

// Types
export interface Order {
  id: string;
  stripe_session_id: string;
  customer_email: string;
  customer_name?: string;
  amount_total: number;
  currency: string;
  payment_status: 'paid' | 'pending' | 'failed' | 'refunded';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: ShippingAddress;
  billing_address?: BillingAddress;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  tracking_number?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  stripe_price_id: string;
  product_name: string;
  quantity: number;
  unit_amount: number;
  total_amount: number;
  currency: string;
  metadata: Record<string, any>;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface BillingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CreateOrderData {
  stripe_session_id: string;
  customer_email: string;
  customer_name?: string;
  amount_total: number;
  currency: string;
  payment_status: 'paid' | 'pending' | 'failed';
  shipping_address?: ShippingAddress;
  billing_address?: BillingAddress;
  metadata?: Record<string, any>;
  items?: Omit<OrderItem, 'id' | 'order_id'>[];
}

export interface OrderFilters {
  customer_email?: string;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration is missing');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Error handling utility
const handleError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  throw new Error(error.message || `Failed to ${context}`);
};

// Create a new order
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  try {
    console.log('Creating order:', orderData);

    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        stripe_session_id: orderData.stripe_session_id,
        customer_email: orderData.customer_email,
        customer_name: orderData.customer_name,
        amount_total: orderData.amount_total,
        currency: orderData.currency,
        payment_status: orderData.payment_status,
        status: 'pending',
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
        metadata: orderData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Insert order items if provided
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        stripe_price_id: item.stripe_price_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_amount: item.unit_amount,
        total_amount: item.total_amount,
        currency: item.currency,
        metadata: item.metadata || {},
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Failed to create order items:', itemsError);
        // Don't throw here - order is still created
      }
    }

    console.log('Order created successfully:', order.id);
    return order;

  } catch (error) {
    handleError(error, 'create order');
  }
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Order not found
      }
      throw error;
    }

    return order;

  } catch (error) {
    handleError(error, 'get order by ID');
  }
};

// Get order by Stripe session ID
export const getOrderBySessionId = async (sessionId: string): Promise<Order | null> => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('stripe_session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Order not found
      }
      throw error;
    }

    return order;

  } catch (error) {
    handleError(error, 'get order by session ID');
  }
};

// Get orders with filters
export const getOrders = async (filters: OrderFilters = {}): Promise<{ orders: Order[]; total: number }> => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `, { count: 'exact' });

    // Apply filters
    if (filters.customer_email) {
      query = query.eq('customer_email', filters.customer_email);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    // Apply pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data: orders, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      orders: orders || [],
      total: count || 0,
    };

  } catch (error) {
    handleError(error, 'get orders');
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string, 
  status: Order['status'],
  additionalData?: Partial<Order>
): Promise<Order> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
      ...additionalData,
    };

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`Order ${orderId} status updated to ${status}`);
    return order;

  } catch (error) {
    handleError(error, 'update order status');
  }
};

// Update order payment status
export const updateOrderPaymentStatus = async (
  orderId: string, 
  paymentStatus: Order['payment_status']
): Promise<Order> => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`Order ${orderId} payment status updated to ${paymentStatus}`);
    return order;

  } catch (error) {
    handleError(error, 'update order payment status');
  }
};

// Add tracking information
export const addTrackingInfo = async (
  orderId: string,
  trackingNumber: string,
  estimatedDelivery?: string
): Promise<Order> => {
  try {
    const updateData: any = {
      tracking_number: trackingNumber,
      updated_at: new Date().toISOString(),
    };

    if (estimatedDelivery) {
      updateData.estimated_delivery = estimatedDelivery;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`Tracking info added to order ${orderId}: ${trackingNumber}`);
    return order;

  } catch (error) {
    handleError(error, 'add tracking info');
  }
};

// Get order statistics
export const getOrderStatistics = async (customerEmail?: string): Promise<{
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusBreakdown: Record<string, number>;
  recentOrders: Order[];
}> => {
  try {
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' });

    if (customerEmail) {
      query = query.eq('customer_email', customerEmail);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      throw error;
    }

    const totalOrders = count || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + order.amount_total, 0) || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    orders?.forEach(order => {
      statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
    });

    // Recent orders (last 5)
    const recentOrders = orders?.slice(0, 5) || [];

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusBreakdown,
      recentOrders,
    };

  } catch (error) {
    handleError(error, 'get order statistics');
  }
};

// Cancel order
export const cancelOrder = async (orderId: string, reason?: string): Promise<Order> => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        metadata: {
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
        },
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`Order ${orderId} cancelled`);
    return order;

  } catch (error) {
    handleError(error, 'cancel order');
  }
};

// Refund order
export const refundOrder = async (orderId: string, amount?: number, reason?: string): Promise<Order> => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'refunded',
        updated_at: new Date().toISOString(),
        metadata: {
          refund_amount: amount,
          refund_reason: reason,
          refunded_at: new Date().toISOString(),
        },
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`Order ${orderId} refunded`);
    return order;

  } catch (error) {
    handleError(error, 'refund order');
  }
};

// Search orders
export const searchOrders = async (searchTerm: string, filters: OrderFilters = {}): Promise<Order[]> => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `);

    // Apply text search
    query = query.or(`customer_email.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);

    // Apply additional filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }

    // Limit results
    const limit = filters.limit || 20;
    query = query.limit(limit);

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data: orders, error } = await query;

    if (error) {
      throw error;
    }

    return orders || [];

  } catch (error) {
    handleError(error, 'search orders');
  }
};

// Export all functions
export default {
  createOrder,
  getOrderById,
  getOrderBySessionId,
  getOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
  addTrackingInfo,
  getOrderStatistics,
  cancelOrder,
  refundOrder,
  searchOrders,
};