import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import {
  fetchUserOrders,
  fetchOrderById,
  createOrder,
  updateOrderStatus,
  getUserOrderStats,
  cancelOrder,
  type OrderWithItems,
} from '@/services/orderService';

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    ordersByStatus: { [key: string]: number };
  } | null>(null);

  // Fetch user orders
  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setStats(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [ordersData, statsData] = await Promise.all([
        fetchUserOrders(user.id),
        getUserOrderStats(user.id),
      ]);

      setOrders(ordersData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get specific order
  const getOrder = useCallback(async (orderId: string): Promise<OrderWithItems | null> => {
    if (!user) return null;

    try {
      setError(null);
      const order = await fetchOrderById(orderId, user.id);
      return order;
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
      return null;
    }
  }, [user]);

  // Create new order
  const placeOrder = useCallback(async (orderData: {
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
  }) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to place an order',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setError(null);
      
      const order = await createOrder({
        userId: user.id,
        ...orderData,
      });

      toast({
        title: 'Order placed successfully!',
        description: `Your order ${order.order_number} has been created`,
      });

      // Refresh orders
      await fetchOrders();
      
      return order;
    } catch (err) {
      console.error('Error placing order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to place order';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [user, fetchOrders]);

  // Cancel order
  const cancelUserOrder = useCallback(async (orderId: string, reason?: string) => {
    if (!user) return;

    try {
      setError(null);
      
      await cancelOrder(orderId, user.id, reason);

      toast({
        title: 'Order cancelled',
        description: 'Your order has been cancelled successfully',
      });

      // Refresh orders
      await fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [user, fetchOrders]);

  // Get orders by status
  const getOrdersByStatus = useCallback((status: string) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Get recent orders
  const getRecentOrders = useCallback((limit: number = 5) => {
    return orders.slice(0, limit);
  }, [orders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    stats,
    getOrder,
    placeOrder,
    cancelUserOrder,
    getOrdersByStatus,
    getRecentOrders,
    refetch: fetchOrders,
  };
}

// Hook for a specific order
export function useOrder(orderId: string) {
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!user || !orderId) {
      setOrder(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData = await fetchOrderById(orderId, user.id);
      setOrder(orderData);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, [user, orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
}
