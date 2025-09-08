import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type NotificationRow = Tables<'notifications'>;
export type PushTokenRow = Tables<'push_tokens'>;

// Send notification to user
export async function sendNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'promotion' | 'system';
  data?: any;
}): Promise<NotificationRow> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      data: params.data,
      is_read: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get user notifications
export async function getUserNotifications(params: {
  userId: string;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationRow[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false });

  if (params.unreadOnly) {
    query = query.eq('is_read', false);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

// Delete notification
export async function deleteNotification(notificationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

// Register push token
export async function registerPushToken(params: {
  userId: string;
  token: string;
  platform: 'web' | 'ios' | 'android';
}): Promise<void> {
  // Deactivate existing tokens for this user/platform
  await supabase
    .from('push_tokens')
    .update({ is_active: false })
    .eq('user_id', params.userId)
    .eq('platform', params.platform);

  // Insert new token
  const { error } = await supabase
    .from('push_tokens')
    .insert({
      user_id: params.userId,
      token: params.token,
      platform: params.platform,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
}

// Remove push token
export async function removePushToken(params: {
  userId: string;
  token: string;
}): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .update({ is_active: false })
    .eq('user_id', params.userId)
    .eq('token', params.token);

  if (error) throw error;
}

// Send order status notification
export async function sendOrderStatusNotification(params: {
  userId: string;
  orderId: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
}): Promise<void> {
  let title = '';
  let message = '';

  switch (params.status) {
    case 'confirmed':
      title = '🎉 Order Confirmed!';
      message = `Your order ${params.orderNumber} has been confirmed and is being prepared.`;
      break;
    case 'processing':
      title = '📦 Order Processing';
      message = `Your order ${params.orderNumber} is being processed and will ship soon.`;
      break;
    case 'shipped':
      title = '🚚 Order Shipped!';
      message = `Your order ${params.orderNumber} has been shipped${params.trackingNumber ? ` (Tracking: ${params.trackingNumber})` : ''}.`;
      break;
    case 'delivered':
      title = '✅ Order Delivered!';
      message = `Your order ${params.orderNumber} has been delivered. Enjoy your new streetwear!`;
      break;
    case 'cancelled':
      title = '❌ Order Cancelled';
      message = `Your order ${params.orderNumber} has been cancelled. If you have questions, please contact support.`;
      break;
    default:
      title = '📋 Order Update';
      message = `Your order ${params.orderNumber} status has been updated to: ${params.status}`;
  }

  await sendNotification({
    userId: params.userId,
    title,
    message,
    type: 'order',
    data: {
      order_id: params.orderId,
      order_number: params.orderNumber,
      status: params.status,
      tracking_number: params.trackingNumber,
    },
  });
}

// Send promotional notification
export async function sendPromotionalNotification(params: {
  userIds: string[];
  title: string;
  message: string;
  data?: any;
}): Promise<void> {
  const notifications = params.userIds.map(userId => ({
    user_id: userId,
    title: params.title,
    message: params.message,
    type: 'promotion',
    data: params.data,
    is_read: false,
    created_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) throw error;
}

// Send welcome notification to new users
export async function sendWelcomeNotification(userId: string): Promise<void> {
  await sendNotification({
    userId,
    title: '👋 Welcome to Vlanco!',
    message: 'Welcome to the future of streetwear! Explore our collection and enjoy 10% off your first order.',
    type: 'info',
    data: {
      discount_code: 'WELCOME10',
      discount_percentage: 10,
    },
  });
}

// Send low stock notification to admins
export async function sendLowStockNotification(params: {
  productName: string;
  variantName?: string;
  currentStock: number;
  threshold: number;
}): Promise<void> {
  // This would typically be sent to admin users
  // For now, we'll just log it as a system notification
  console.warn('Low stock alert:', params);
  
  // In a real implementation, you'd fetch admin user IDs and send notifications
  // const adminUsers = await getAdminUsers();
  // for (const admin of adminUsers) {
  //   await sendNotification({
  //     userId: admin.id,
  //     title: '⚠️ Low Stock Alert',
  //     message: `${params.productName}${params.variantName ? ` (${params.variantName})` : ''} is running low (${params.currentStock} left)`,
  //     type: 'warning',
  //     data: params,
  //   });
  // }
}
